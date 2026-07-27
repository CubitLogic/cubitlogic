import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import CubitArticleVisual, { type ArticleSlug } from "./CubitArticleVisual";

type MountedVisual = {
  host: HTMLDivElement;
  image: HTMLImageElement;
  slug: ArticleSlug;
  originalDisplay: string;
};

const IMAGE_TO_SLUG: Array<{ image: string; slug: ArticleSlug }> = [
  { image: "/assets/hero-bg.webp", slug: "what-is-quantum-intelligence" },
  { image: "/assets/topics-bg.webp", slug: "qubits-vs-bits-explained" },
  { image: "/assets/about-bg.webp", slug: "post-quantum-cryptography" },
];

function articleSlugForImage(image: HTMLImageElement): ArticleSlug | null {
  const source = image.getAttribute("src") ?? image.src;
  return IMAGE_TO_SLUG.find((entry) => source.includes(entry.image))?.slug ?? null;
}

export default function ArticleVisualMount() {
  const [mounts, setMounts] = useState<MountedVisual[]>([]);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const mounted: MountedVisual[] = [];

    const mountArticleVisuals = () => {
      let changed = false;

      for (const image of Array.from(document.querySelectorAll<HTMLImageElement>("img"))) {
        if (image.dataset.cubitArticleVisual === "true") continue;

        const slug = articleSlugForImage(image);
        const parent = image.parentElement;
        if (!slug || !parent) continue;

        const host = document.createElement("div");
        host.setAttribute("data-cubit-article-host", slug);
        host.className = "absolute inset-0 transition-transform duration-500 group-hover:scale-105";

        const originalDisplay = image.style.display;
        image.dataset.cubitArticleVisual = "true";
        image.style.display = "none";
        parent.insertBefore(host, image.nextSibling);

        mounted.push({ host, image, slug, originalDisplay });
        changed = true;
      }

      if (changed) setMounts([...mounted]);
    };

    mountArticleVisuals();
    const observer = new MutationObserver(mountArticleVisuals);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      for (const mount of mounted) {
        mount.host.remove();
        mount.image.style.display = mount.originalDisplay;
        delete mount.image.dataset.cubitArticleVisual;
      }
      setMounts([]);
    };
  }, []);

  return (
    <>
      {mounts.map((mount, index) =>
        createPortal(
          <CubitArticleVisual slug={mount.slug} />,
          mount.host,
          `${mount.slug}-${index}`
        )
      )}
    </>
  );
}
