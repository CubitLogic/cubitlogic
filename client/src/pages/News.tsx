import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ExternalLink, RefreshCw, Settings2, X, Check, Rss } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  { key: "ai",       label: "AI & Machine Learning", color: "#6B21FF" },
  { key: "quantum",  label: "Quantum Computing",     color: "#0099CC" },
  { key: "it",       label: "IT & Cloud",            color: "#0ea5e9" },
  { key: "security", label: "Cybersecurity",         color: "#ef4444" },
  { key: "space",    label: "Space & Science",       color: "#f59e0b" },
  { key: "tech",     label: "General Tech",          color: "#10b981" },
];

function timeAgo(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  } catch {
    return "";
  }
}

export default function News() {
  const { user, isAuthenticated } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [localPrefs, setLocalPrefs] = useState<string[] | null>(null);

  const { data: prefsData } = trpc.news.getPreferences.useQuery();

  useEffect(() => {
    if (prefsData && !localPrefs) setLocalPrefs(prefsData.enabledCategories);
  }, [prefsData]);

  const { data: feedData, isLoading, refetch } = trpc.news.getFeed.useQuery(
    { limit: 60 },
    { refetchOnWindowFocus: false }
  );

  const savePrefsMutation = trpc.news.savePreferences.useMutation({
    onSuccess: () => { toast.success("Feed preferences saved"); setShowSettings(false); refetch(); },
    onError: () => toast.error("Failed to save preferences"),
  });

  const enabledCategories = localPrefs ?? prefsData?.enabledCategories ?? CATEGORIES.map((c) => c.key);

  const toggleCategory = (key: string) => {
    setLocalPrefs((prev) => {
      const current = prev ?? CATEGORIES.map((c) => c.key);
      if (current.includes(key)) {
        if (current.length === 1) return current; // keep at least one
        return current.filter((k) => k !== key);
      }
      return [...current, key];
    });
  };

  const savePreferences = () => {
    if (!isAuthenticated) { toast.error("Sign in to save preferences"); return; }
    savePrefsMutation.mutate({ enabledCategories: localPrefs ?? CATEGORIES.map((c) => c.key) });
  };

  const items = feedData?.items ?? [];

  // Group by category for the filter bar display
  const catMap = Object.fromEntries(CATEGORIES.map((c) => [c.key, c]));

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <Navbar />

      {/* Header */}
      <section className="pt-16 pb-10 border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white">
        <div className="container">
          <div className="flex items-center gap-2 mb-3">
            <Rss size={15} style={{ color: "#0099CC" }} />
            <span className="text-xs font-semibold tracking-widest uppercase text-[#0099CC]" style={{ fontFamily: "'Orbitron', sans-serif" }}>Live News Feed</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                AI, Quantum & Tech News
              </h1>
              <p className="text-gray-500 max-w-xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Auto-updated every hour from the world's top sources. {isAuthenticated ? "Your feed is personalized." : "Sign in to personalize your feed."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => refetch()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:border-[#0099CC] hover:text-[#0099CC] transition-colors"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <RefreshCw size={14} />
                Refresh
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:border-[#6B21FF] hover:text-[#6B21FF] transition-colors"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <Settings2 size={14} />
                Customize Feed
              </button>
            </div>
          </div>

          {/* Category filter pills */}
          <div className="flex flex-wrap gap-2 mt-6">
            {CATEGORIES.map((cat) => {
              const active = enabledCategories.includes(cat.key);
              return (
                <button
                  key={cat.key}
                  onClick={() => toggleCategory(cat.key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                  style={{
                    borderColor: active ? cat.color : "#e5e7eb",
                    backgroundColor: active ? cat.color + "15" : "transparent",
                    color: active ? cat.color : "#6b7280",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  {active && <Check size={10} />}
                  {cat.label}
                </button>
              );
            })}
            {isAuthenticated && localPrefs && (
              <button
                onClick={savePreferences}
                disabled={savePrefsMutation.isPending}
                className="px-3 py-1.5 rounded-full text-xs font-medium border border-[#6B21FF] text-[#6B21FF] bg-[#6B21FF]/10 hover:bg-[#6B21FF]/20 transition-colors"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Save preferences
              </button>
            )}
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-12">
        <div className="container">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-gray-100 p-5 animate-pulse">
                  <div className="h-3 bg-gray-100 rounded w-1/4 mb-3" />
                  <div className="h-5 bg-gray-100 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-full mb-1" />
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-24 text-gray-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <Rss size={40} className="mx-auto mb-4 opacity-30" />
              <p>No news items found. Try enabling more categories or refreshing.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {items
                .filter((item) => enabledCategories.includes(item.category))
                .map((item) => {
                  const cat = catMap[item.category];
                  return (
                    <a
                      key={item.id}
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group rounded-xl border border-gray-100 p-5 hover:border-gray-300 hover:shadow-sm transition-all duration-200 block"
                    >
                      {/* Category + source */}
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            color: cat?.color ?? "#6b7280",
                            backgroundColor: (cat?.color ?? "#6b7280") + "15",
                            fontFamily: "'Space Grotesk', sans-serif",
                          }}
                        >
                          {cat?.label ?? item.category}
                        </span>
                        <span className="text-xs text-gray-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          {item.source}
                        </span>
                      </div>

                      {/* Title */}
                      <h3
                        className="font-bold text-gray-900 group-hover:text-[#0099CC] transition-colors leading-snug mb-2 line-clamp-2"
                        style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.88rem" }}
                      >
                        {item.title}
                      </h3>

                      {/* Description */}
                      {item.description && (
                        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          {item.description}
                        </p>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs text-gray-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        <span>{timeAgo(item.pubDate)}</span>
                        <ExternalLink size={12} className="group-hover:text-[#0099CC] transition-colors" />
                      </div>
                    </a>
                  );
                })}
            </div>
          )}
        </div>
      </section>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900 text-lg" style={{ fontFamily: "'Orbitron', sans-serif" }}>Customize Your Feed</h2>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {isAuthenticated ? "Select the categories you want in your feed. Preferences are saved to your account." : "Sign in to save your preferences across sessions."}
            </p>
            <div className="space-y-2">
              {CATEGORIES.map((cat) => {
                const active = enabledCategories.includes(cat.key);
                return (
                  <button
                    key={cat.key}
                    onClick={() => toggleCategory(cat.key)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all"
                    style={{
                      borderColor: active ? cat.color : "#e5e7eb",
                      backgroundColor: active ? cat.color + "10" : "transparent",
                    }}
                  >
                    <span className="text-sm font-medium text-gray-700" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{cat.label}</span>
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: active ? cat.color : "#e5e7eb" }}
                    >
                      {active && <Check size={11} color="white" />}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Cancel
              </button>
              <button
                onClick={savePreferences}
                disabled={savePrefsMutation.isPending || !isAuthenticated}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #0099CC 0%, #6B21FF 100%)", fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {isAuthenticated ? "Save Preferences" : "Sign in to Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
