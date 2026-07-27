import { useEffect, useRef, useState } from "react";
import QubitVoiceOrb from "./QubitVoiceOrb";

const QUBIT_INTRO =
  "Hello. I'm Qubit, the Cubit Logic AI Tutor. Ask me anything about quantum computing, quantum mechanics, or quantum AI.";

type SpokenReply = {
  text: string;
  version: number;
  autoSpeak: boolean;
};

function findAiMessageNodes(section: HTMLElement): HTMLElement[] {
  const nodes = Array.from(section.querySelectorAll("span"))
    .filter((node) => node.textContent?.trim().toUpperCase() === "CUBIT AI")
    .map((node) => node.parentElement)
    .filter((node): node is HTMLElement => Boolean(node));

  return Array.from(new Set(nodes));
}

function extractReply(node: HTMLElement): string {
  return node.innerText
    .replace(/^CUBIT AI\s*/i, "")
    .replace(/Support CubitLogic\s*→/gi, "")
    .replace(/Explore CubitLogic\.com\s*→/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default function QubitChatCompanion() {
  const [sectionPresent, setSectionPresent] = useState(false);
  const [sectionInView, setSectionInView] = useState(false);
  const [reply, setReply] = useState<SpokenReply>({
    text: QUBIT_INTRO,
    version: 0,
    autoSpeak: false,
  });

  const sectionRef = useRef<HTMLElement | null>(null);
  const knownMessageCountRef = useRef(0);
  const responseObserverRef = useRef<MutationObserver | null>(null);
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const disconnectSectionObservers = () => {
      responseObserverRef.current?.disconnect();
      intersectionObserverRef.current?.disconnect();
      responseObserverRef.current = null;
      intersectionObserverRef.current = null;
    };

    const bindToTutorSection = () => {
      const nextSection = document.querySelector<HTMLElement>("#ai-tutor");
      if (nextSection === sectionRef.current) return;

      disconnectSectionObservers();
      sectionRef.current = nextSection;

      if (!nextSection) {
        knownMessageCountRef.current = 0;
        setSectionPresent(false);
        setSectionInView(false);
        return;
      }

      setSectionPresent(true);
      knownMessageCountRef.current = findAiMessageNodes(nextSection).length;

      intersectionObserverRef.current = new IntersectionObserver(
        ([entry]) => setSectionInView(entry.isIntersecting),
        { threshold: 0.08 }
      );
      intersectionObserverRef.current.observe(nextSection);

      responseObserverRef.current = new MutationObserver(() => {
        const messages = findAiMessageNodes(nextSection);
        if (messages.length <= knownMessageCountRef.current) return;

        knownMessageCountRef.current = messages.length;
        const latestReply = extractReply(messages[messages.length - 1]);
        if (!latestReply) return;

        setReply((current) => ({
          text: latestReply,
          version: current.version + 1,
          autoSpeak: true,
        }));
      });
      responseObserverRef.current.observe(nextSection, {
        childList: true,
        subtree: true,
      });
    };

    bindToTutorSection();
    const pageObserver = new MutationObserver(bindToTutorSection);
    pageObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      pageObserver.disconnect();
      disconnectSectionObservers();
      sectionRef.current = null;
    };
  }, []);

  if (!sectionPresent) return null;

  return (
    <aside
      className={`fixed bottom-4 right-4 z-50 w-[min(22rem,calc(100vw-2rem))] transition-all duration-300 ${
        sectionInView
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
      aria-label="Qubit voice companion"
      aria-hidden={!sectionInView}
    >
      <QubitVoiceOrb
        key={reply.version}
        text={reply.text}
        title="Qubit"
        autoSpeak={reply.autoSpeak}
        compact
        className="shadow-xl"
      />
    </aside>
  );
}
