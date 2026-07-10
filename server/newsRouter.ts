/**
 * News Feed Router
 * Fetches RSS feeds from multiple sources, caches results server-side (1 hour),
 * and supports per-user category preferences stored in the DB.
 */
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import type { TrpcContext } from "./_core/context";
import { getDb } from "./db";
import { newsPreferences } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export const DEFAULT_CATEGORIES = ["ai", "quantum", "it", "security", "space", "tech"];

export const NEWS_CATEGORIES = [
  { key: "ai",       label: "AI & Machine Learning", color: "#6B21FF" },
  { key: "quantum",  label: "Quantum Computing",     color: "#0099CC" },
  { key: "it",       label: "IT & Cloud",            color: "#0ea5e9" },
  { key: "security", label: "Cybersecurity",         color: "#ef4444" },
  { key: "space",    label: "Space & Science",       color: "#f59e0b" },
  { key: "tech",     label: "General Tech",          color: "#10b981" },
];

const FEEDS: Record<string, { url: string; source: string }[]> = {
  ai: [
    { url: "https://www.technologyreview.com/feed/", source: "MIT Tech Review" },
    { url: "https://venturebeat.com/category/ai/feed/", source: "VentureBeat AI" },
    { url: "https://feeds.feedburner.com/nvidiablog", source: "NVIDIA Blog" },
  ],
  quantum: [
    { url: "https://phys.org/rss-feed/quantum-physics-news/", source: "Phys.org Quantum" },
    { url: "https://quantumcomputingreport.com/feed/", source: "Quantum Computing Report" },
    { url: "https://thequantuminsider.com/feed/", source: "The Quantum Insider" },
  ],
  it: [
    { url: "https://www.infoworld.com/index.rss", source: "InfoWorld" },
    { url: "https://www.zdnet.com/news/rss.xml", source: "ZDNet" },
    { url: "https://feeds.feedburner.com/TheHackersNews", source: "The Hacker News" },
  ],
  security: [
    { url: "https://krebsonsecurity.com/feed/", source: "Krebs on Security" },
    { url: "https://www.darkreading.com/rss.xml", source: "Dark Reading" },
    { url: "https://feeds.feedburner.com/TheHackersNews", source: "The Hacker News" },
  ],
  space: [
    { url: "https://www.nasa.gov/rss/dyn/breaking_news.rss", source: "NASA" },
    { url: "https://www.space.com/feeds/all", source: "Space.com" },
    { url: "https://phys.org/rss-feed/space-news/", source: "Phys.org Space" },
  ],
  tech: [
    { url: "https://www.theverge.com/rss/index.xml", source: "The Verge" },
    { url: "https://feeds.arstechnica.com/arstechnica/index", source: "Ars Technica" },
    { url: "https://news.ycombinator.com/rss", source: "Hacker News" },
  ],
};

export interface NewsItem {
  id: string;
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
  category: string;
}

// In-memory cache per category
const cache = new Map<string, { items: NewsItem[]; fetchedAt: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

async function fetchFeed(url: string, source: string, category: string): Promise<NewsItem[]> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "CubitLogic-NewsBot/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseRSS(xml, source, category);
  } catch {
    return [];
  }
}

function extractTag(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, "i"));
  return m ? m[1].trim() : "";
}

function extractAttr(xml: string, tag: string, attr: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, "i"));
  return m ? m[1] : "";
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)));
}

function parseRSS(xml: string, source: string, category: string): NewsItem[] {
  const items: NewsItem[] = [];
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null && items.length < 10) {
    const block = match[1];
    const title = extractTag(block, "title");
    const link = extractTag(block, "link") || extractAttr(block, "link", "href");
    const description = stripHtml(extractTag(block, "description") || extractTag(block, "summary") || "");
    const pubDate = extractTag(block, "pubDate") || extractTag(block, "published") || extractTag(block, "updated") || new Date().toISOString();
    if (title && link) {
      items.push({
        id: `${source}-${Buffer.from(link).toString("base64").slice(0, 40)}`,
        title: decodeEntities(title),
        link,
        description: decodeEntities(description).slice(0, 220),
        pubDate,
        source,
        category,
      });
    }
  }
  return items;
}

async function getCategoryNews(category: string): Promise<NewsItem[]> {
  const cached = cache.get(category);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) return cached.items;
  const feeds = FEEDS[category] || [];
  const results = await Promise.all(feeds.map((f) => fetchFeed(f.url, f.source, category)));
  const items = results.flat()
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    .slice(0, 20);
  cache.set(category, { items, fetchedAt: Date.now() });
  return items;
}

export const newsRouter = router({
  // Fetch news feed — filtered by user preferences if logged in
  getFeed: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(30) }).default({ limit: 30 }))
    .query(async ({ input, ctx }: { input: { limit: number }; ctx: TrpcContext }) => {
      let categories = [...DEFAULT_CATEGORIES];
      if (ctx.user) {
        const db = await getDb();
        if (db) {
          const rows = await db.select().from(newsPreferences).where(eq(newsPreferences.userId, ctx.user.id)).limit(1);
          if (rows[0]) {
            try {
              const parsed = JSON.parse(rows[0].enabledCategories);
              if (Array.isArray(parsed) && parsed.length > 0) categories = parsed;
            } catch { /* use default */ }
          }
        }
      }
      const results = await Promise.all(categories.map(getCategoryNews));
      // Deduplicate by id to prevent React key collisions
      const seen = new Set<string>();
      const allItems = results.flat()
        .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
        .filter((item) => {
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        })
        .slice(0, input.limit);
      return { items: allItems, categories };
    }),

  // Get current user's saved preferences
  getPreferences: publicProcedure.query(async ({ ctx }: { ctx: TrpcContext }) => {
    if (!ctx.user) return { enabledCategories: DEFAULT_CATEGORIES };
    const db = await getDb();
    if (!db) return { enabledCategories: DEFAULT_CATEGORIES };
    const rows = await db.select().from(newsPreferences).where(eq(newsPreferences.userId, ctx.user.id)).limit(1);
    if (!rows[0]) return { enabledCategories: DEFAULT_CATEGORIES };
    try { return { enabledCategories: JSON.parse(rows[0].enabledCategories) }; }
    catch { return { enabledCategories: DEFAULT_CATEGORIES }; }
  }),

  // Save user's category preferences
  savePreferences: protectedProcedure
    .input(z.object({ enabledCategories: z.array(z.string()).min(1).max(10) }))
    .mutation(async ({ input, ctx }: { input: { enabledCategories: string[] }; ctx: TrpcContext & { user: NonNullable<TrpcContext["user"]> } }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const valid = input.enabledCategories.filter((c) => DEFAULT_CATEGORIES.includes(c));
      const json = JSON.stringify(valid.length > 0 ? valid : DEFAULT_CATEGORIES);
      const existing = await db.select().from(newsPreferences).where(eq(newsPreferences.userId, ctx.user.id)).limit(1);
      if (existing.length > 0) {
        await db.update(newsPreferences).set({ enabledCategories: json }).where(eq(newsPreferences.userId, ctx.user.id));
      } else {
        await db.insert(newsPreferences).values({ userId: ctx.user.id, enabledCategories: json });
      }
      return { success: true };
    }),
});
