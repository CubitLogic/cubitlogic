import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import QubitHeroVisual from "./QubitHeroVisual";

export default function QubitHeroMount() {
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;

    let mountedHost: HTMLDivElement | null = null;
    let hiddenLegacyGraphic: HTMLElement | null = null;
    let pageObserver: MutationObserver | null = null;

    const mountIntoHero = () => {
      if (mountedHost?.isConnected) return;

      const legacyGraphic = Array.from(document.querySelectorAll<HTMLElement>("div[style]"))
        .find((element) => element.style.backgroundImage.includes("hero-bg.webp"));
      const heroSection = legacyGraphic?.closest<HTMLElement>("section");
      if (!legacyGraphic || !heroSection) return;

      hiddenLegacyGraphic = legacyGraphic;
      hiddenLegacyGraphic.style.display = "none";

      heroSection.style.background =
        "radial-gradient(circle at 78% 48%, rgba(0,229,255,.13), transparent 28%), radial-gradient(circle at 86% 55%, rgba(107,33,255,.10), transparent 36%), linear-gradient(135deg, #ffffff 0%, #f7fcff 55%, #f8f5ff 100%)";

      mountedHost = document.createElement("div");
      mountedHost.setAttribute("data-qubit-hero", "true");
      mountedHost.className =
        "pointer-events-none absolute inset-y-16 right-0 z-[5] hidden w-[48%] items-center justify-center md:flex";
      heroSection.appendChild(mountedHost);
      setHost(mountedHost);
    };

    mountIntoHero();
    pageObserver = new MutationObserver(mountIntoHero);
    pageObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      pageObserver?.disconnect();
      mountedHost?.remove();
      if (hiddenLegacyGraphic) hiddenLegacyGraphic.style.display = "";
    };
  }, []);

  return host ? createPortal(<QubitHeroVisual />, host) : null;
}
