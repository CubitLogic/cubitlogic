import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import QubitVoiceOrb from "./QubitVoiceOrb";

const QUBIT_INTRO =
  "Hello. I'm Qubit, your Cubit Logic AI guide. Ask me anything about quantum computing, artificial intelligence, or the lessons on this site.";

type SpokenReply = {
  text: string;
  version: number;
  autoSpeak: boolean;
};

function normalizeTutorBranding(section: HTMLElement) {
  const elements = Array.from(
    section.querySelectorAll<HTMLElement>("span, h2, p")
  );

  for (const element of elements) {
    const text = element.textContent?.trim() ?? "";

    if (text === "AI Tutor") {
      element.textContent = "Qubit AI";
    } else if (text === "Ask the Cubit Logic AI Tutor") {
      element.textContent = "Ask Qubit";
    } else if (text === "Cubit Logic Quantum Tutor — Online") {
      element.textContent = "Qubit — Online";
    } else if (text === "CUBIT AI") {
      element.textContent = "QUBIT";
    } else if (
      text.startsWith("Hello. I'm the Cubit Logic AI Tutor.")
    ) {
      element.textContent = QUBIT_INTRO;
    } else if (
      text.startsWith("The Cubit Logic AI Tutor is trained to explain")
    ) {
      element.textContent =
        "Qubit is Cubit Logic's interactive AI guide. He can explain lessons, answer follow-up questions, and read educational material aloud at the level you choose.";
    } else if (text.startsWith("CubitAI is temporarily unavailable.")) {
      element.textContent =
        "Qubit is temporarily unavailable. Your learning resources are still here.";
    }
  }
}

function findAiMessageNodes(section: HTMLElement): HTMLElement[] {
  const nodes = Array.from(section.querySelectorAll("span"))
    .filter((node) => {
      const label = node.textContent?.trim().toUpperCase();
      return label === "CUBIT AI" || label === "QUBIT";
    })
    .map((node) => node.parentElement)
    .filter((node): node is HTMLElement => Boolean(node));

  return Array.from(new Set(nodes));
}

function extractReply(node: HTMLElement): string {
  return node.innerText
    .replace(/^(?:CUBIT AI|QUBIT)\s*/i, "")
    .replace(/Support CubitLogic\s*→/gi, "")
    .replace(/Explore CubitLogic\.com\s*→/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default function QubitChatCompanion() {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [reply, setReply] = useState<SpokenReply>({
    text: QUBIT_INTRO,
    version: 0,
    autoSpeak: false,
  });

  const sectionRef = useRef<HTMLElement | null>(null);
  const hostRef = useRef<HTMLElement | null>(null);
  const knownMessageCountRef = useRef(0);
  const responseObserverRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const disconnectSection = () => {
      responseObserverRef.current?.disconnect();
      responseObserverRef.current = null;
      hostRef.current?.remove();
      hostRef.current = null;
      setPortalTarget(null);
    };

    const bindToTutorSection = () => {
      const nextSection = document.querySelector<HTMLElement>("#ai-tutor");

      if (
        nextSection &&
        nextSection === sectionRef.current &&
        hostRef.current?.isConnected
      ) {
        normalizeTutorBranding(nextSection);
        return;
      }

      disconnectSection();
      sectionRef.current = nextSection;

      if (!nextSection) {
        knownMessageCountRef.current = 0;
        return;
      }

      normalizeTutorBranding(nextSection);
      knownMessageCountRef.current = findAiMessageNodes(nextSection).length;

      const chatWindow = nextSection.querySelector<HTMLElement>(
        "div.bg-white.rounded-2xl"
      );
      const host = document.createElement("div");
      host.dataset.qubitVoiceHost = "true";
      host.className = "mb-6";

      if (chatWindow?.parentElement) {
        chatWindow.parentElement.insertBefore(host, chatWindow);
      } else {
        nextSection.appendChild(host);
      }

      hostRef.current = host;
      setPortalTarget(host);

      responseObserverRef.current = new MutationObserver(() => {
        normalizeTutorBranding(nextSection);

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
        characterData: true,
      });
    };

    bindToTutorSection();
    const pageObserver = new MutationObserver(bindToTutorSection);
    pageObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      pageObserver.disconnect();
      disconnectSection();
      sectionRef.current = null;
    };
  }, []);

  if (!portalTarget) return null;

  return createPortal(
    <QubitVoiceOrb
      key={reply.version}
      text={reply.text}
      title="Qubit — Your AI Guide"
      autoSpeak={reply.autoSpeak}
      className="shadow-sm"
    />,
    portalTarget
  );
}
