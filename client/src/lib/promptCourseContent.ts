export interface PromptExample {
  label: string;
  bad?: string;
  good: string;
  explanation: string;
}

export interface CourseSection {
  title: string;
  body: string;
  examples?: PromptExample[];
  tips?: string[];
}

export interface CourseModule {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  isPro: boolean;
  color: string;
  icon: string;
  sections: CourseSection[];
  keyTakeaways: string[];
  practiceChallenge: string;
}

export const courseModules: CourseModule[] = [
  {
    id: "how-ai-reads-you",
    number: 1,
    title: "How AI Actually Reads You",
    subtitle: "Why wording matters more than you think",
    description:
      "Before you can write good prompts, you need to understand what's happening under the hood. This module explains how language models process your input — tokens, context windows, probability, and why the same question phrased two different ways can produce completely different answers.",
    duration: "15 min",
    isPro: false,
    color: "#0099CC",
    icon: "🧠",
    sections: [
      {
        title: "What the AI Actually Sees",
        body: "When you type a message to an AI, it doesn't read it the way you do. It breaks your text into 'tokens' — chunks that are roughly 3–4 characters each. 'quantum' becomes one token. 'superconducting' might become two. The AI processes these tokens as numbers, not words. It has no understanding of meaning in the way humans do — it predicts what token should come next based on patterns learned from billions of examples. This is both its power and its limitation.",
        examples: [
          {
            label: "Token awareness",
            bad: "Tell me about quantum",
            good: "Explain quantum superposition in plain English, using an analogy a high school student would understand.",
            explanation:
              "The first prompt is ambiguous — quantum what? The AI has to guess. The second specifies the exact concept, the audience level, and the format. You get a targeted answer instead of a generic overview.",
          },
        ],
      },
      {
        title: "The Context Window",
        body: "Every AI conversation has a 'context window' — a maximum amount of text it can hold in memory at once. Think of it as a whiteboard. Everything written on the whiteboard influences the AI's responses. When the whiteboard fills up, older content falls off. This means: in long conversations, the AI may 'forget' instructions you gave at the start. For important instructions, repeat them or put them near the end of your prompt.",
        tips: [
          "Put the most important instructions last — the AI weights recent context more heavily.",
          "For long tasks, periodically restate your key requirements.",
          "If the AI starts drifting from your original intent, remind it explicitly.",
        ],
      },
      {
        title: "Probability, Not Truth",
        body: "The AI doesn't 'know' things the way a database does. It generates responses based on statistical probability — what word is most likely to follow the previous words, given everything it was trained on. This is why it can sound confident while being completely wrong. It's not lying — it's predicting. Understanding this helps you prompt better: you're not querying a database, you're steering a probability engine.",
        tips: [
          "Always verify factual claims, especially dates, numbers, and citations.",
          "Ask the AI to express uncertainty: 'If you're not sure, say so.'",
          "For factual tasks, ask it to reason step by step — this reduces confident errors.",
        ],
      },
    ],
    keyTakeaways: [
      "AI processes tokens, not words — specificity in your prompt directly affects output quality.",
      "The context window is finite — important instructions should be near the end of long prompts.",
      "AI generates probable text, not verified truth — always sanity-check factual claims.",
    ],
    practiceChallenge:
      "Take a vague question you've asked an AI before and rewrite it with: (1) a specific topic, (2) a target audience or complexity level, and (3) a requested format. Compare the outputs.",
  },
  {
    id: "structure-that-works",
    number: 2,
    title: "Structure That Works",
    subtitle: "Role prompting, chain-of-thought, and step-by-step instructions",
    description:
      "The structure of your prompt is as important as the content. This module covers the three most powerful structural techniques: role prompting, chain-of-thought reasoning, and step-by-step decomposition. These alone will double the quality of your outputs.",
    duration: "20 min",
    isPro: false,
    color: "#6B21FF",
    icon: "🏗️",
    sections: [
      {
        title: "Role Prompting",
        body: "Telling the AI to adopt a specific role or persona dramatically changes the style, depth, and focus of its response. 'You are a...' is one of the most powerful phrases in prompt engineering. The role sets context, tone, vocabulary, and priorities. A cybersecurity expert will give you different advice than a general assistant — even if you ask the same question.",
        examples: [
          {
            label: "Role prompting in action",
            bad: "How do I make my website more secure?",
            good: "You are a senior cybersecurity engineer with 15 years of experience in web application security. I'm building a small e-commerce site. What are the top 5 security vulnerabilities I should address first, in order of risk?",
            explanation:
              "The role establishes expertise level and focus area. The specific context (e-commerce) and format request (top 5, ordered by risk) ensure a practical, prioritized answer instead of a generic security overview.",
          },
        ],
      },
      {
        title: "Chain-of-Thought Prompting",
        body: "For complex problems, asking the AI to 'think step by step' before giving an answer dramatically improves accuracy. This technique — called chain-of-thought prompting — forces the model to reason through intermediate steps rather than jumping to a conclusion. It's especially effective for math, logic, analysis, and multi-step decisions.",
        examples: [
          {
            label: "Chain-of-thought",
            bad: "Should I use React or Vue for my project?",
            good: "I need to choose between React and Vue for a project. Think through this step by step: first consider my constraints (small team, 6-month timeline, team knows JavaScript but not either framework), then evaluate each option against those constraints, then give me a recommendation with your reasoning.",
            explanation:
              "By asking for step-by-step reasoning and providing the constraints upfront, you get a recommendation tailored to your situation — not a generic comparison article.",
          },
        ],
      },
      {
        title: "Step-by-Step Decomposition",
        body: "For complex tasks, don't ask the AI to do everything at once. Break it into steps and either ask it to work through them sequentially, or run separate prompts for each stage. A single massive prompt often produces mediocre results across all parts. Focused prompts on individual steps produce excellent results on each part.",
        examples: [
          {
            label: "Decomposition",
            bad: "Write me a complete business plan for a quantum computing education website.",
            good: "Let's build a business plan step by step. Start with Step 1 only: write a one-paragraph executive summary for a quantum computing education website targeting professionals and students. Include the problem being solved, the solution, and the target market. I'll ask for the next section after reviewing this one.",
            explanation:
              "Breaking the task into steps lets you review and correct each section before moving on. The final plan will be far more coherent and accurate than a single-shot attempt.",
          },
        ],
      },
    ],
    keyTakeaways: [
      "Role prompting sets the AI's expertise level, tone, and focus — use it for any specialized task.",
      "'Think step by step' is one of the highest-ROI phrases in prompt engineering.",
      "Complex tasks produce better results when broken into sequential focused prompts.",
    ],
    practiceChallenge:
      "Pick a task you need help with this week. Write three versions of the prompt: (1) plain, (2) with a role, (3) with a role and step-by-step instruction. Run all three and compare.",
  },
  {
    id: "getting-specific",
    number: 3,
    title: "Getting Specific",
    subtitle: "Format control, length, tone, and output templates",
    description:
      "Vague prompts produce vague outputs. This module teaches you to control exactly what you get back — format, length, tone, structure, and style. You'll learn to use output templates that make AI responses drop directly into your workflow.",
    duration: "25 min",
    isPro: true,
    color: "#10b981",
    icon: "🎯",
    sections: [
      {
        title: "Format Control",
        body: "You can tell the AI exactly how to format its response: bullet points, numbered lists, tables, JSON, markdown, plain text, code blocks, headers and subheaders. Being explicit about format saves you from having to reformat the output yourself — and often improves the quality of the content because the structure forces the AI to organize its thinking.",
        examples: [
          {
            label: "Format specification",
            bad: "Compare Python and JavaScript.",
            good: "Compare Python and JavaScript for backend web development. Format your response as a markdown table with these columns: Criteria | Python | JavaScript. Include these rows: Performance, Learning Curve, Ecosystem, Job Market, Best Use Case.",
            explanation:
              "The table format forces a direct, structured comparison. You get exactly the information you need in a format you can paste directly into a document.",
          },
        ],
        tips: [
          "Ask for JSON when you need to parse the output programmatically.",
          "Ask for markdown when you're writing documentation or blog posts.",
          "Ask for plain text when you need to paste into a form or email.",
          "Specify headers (H2, H3) when you need a document structure.",
        ],
      },
      {
        title: "Length Control",
        body: "AI models tend to be verbose. They add caveats, qualifications, and filler. You can control this directly. Specify word count, sentence count, or use qualitative descriptors like 'concise,' 'brief,' 'comprehensive,' or 'one paragraph only.' The AI will respect these constraints.",
        examples: [
          {
            label: "Length control",
            bad: "Explain machine learning.",
            good: "Explain machine learning in exactly 3 sentences. No more. Target audience: someone who has never heard the term before.",
            explanation:
              "Constraining to 3 sentences forces clarity and prioritization. The AI can't pad with filler — it has to make every sentence count.",
          },
        ],
      },
      {
        title: "Output Templates",
        body: "One of the most powerful techniques is giving the AI a template to fill in. You define the structure, it fills in the content. This is especially useful for recurring tasks: writing emails, generating reports, creating social media posts, filling out forms. You write the template once and reuse it indefinitely.",
        examples: [
          {
            label: "Output template",
            good: `Fill in this template for a LinkedIn post about [TOPIC]:

**Hook:** [One sentence that creates curiosity or states a surprising fact]

**Problem:** [2-3 sentences describing the problem or challenge]

**Insight:** [2-3 sentences with the key insight or lesson]

**Call to action:** [One sentence asking a question or inviting engagement]

Topic: The hidden cost of poor prompt engineering in enterprise AI deployments.`,
            explanation:
              "The template ensures consistent structure across all posts. The AI fills in the content; you control the format. You can reuse this template for any topic by changing the last line.",
          },
        ],
      },
    ],
    keyTakeaways: [
      "Always specify output format — table, JSON, markdown, plain text, or bullet points.",
      "Constrain length explicitly to eliminate filler and force clarity.",
      "Output templates are reusable assets — build a library of them for recurring tasks.",
    ],
    practiceChallenge:
      "Create an output template for a task you do regularly — a weekly report, a client email, a social post. Test it with three different topics and refine the template based on the results.",
  },
  {
    id: "iteration-and-refinement",
    number: 4,
    title: "Iteration & Refinement",
    subtitle: "How to fix bad outputs without starting over",
    description:
      "Most people give up when the first response isn't right. Experts iterate. This module teaches you the refinement techniques that turn a mediocre first draft into exactly what you need — without rewriting the whole prompt from scratch.",
    duration: "20 min",
    isPro: true,
    color: "#f59e0b",
    icon: "🔄",
    sections: [
      {
        title: "Diagnosing a Bad Output",
        body: "Before you can fix a bad output, you need to know why it failed. There are four common failure modes: (1) Too vague — the AI didn't have enough information to be specific. (2) Wrong scope — the AI answered a different question than you intended. (3) Wrong format — the content is right but the structure is wrong. (4) Wrong tone/level — too technical, too simple, too formal, too casual. Identify which failure mode you're dealing with before you iterate.",
        tips: [
          "If the output is generic: add more specific context about your situation.",
          "If the output is off-topic: restate the core question more explicitly.",
          "If the format is wrong: specify the exact format you need.",
          "If the tone is wrong: describe the audience or give a style example.",
        ],
      },
      {
        title: "Targeted Follow-Up Prompts",
        body: "Instead of rewriting your entire prompt, use targeted follow-up prompts to fix specific issues. The AI remembers the full conversation — you can build on what it already produced. This is faster and often produces better results than starting over.",
        examples: [
          {
            label: "Targeted refinement",
            good: "That's good but too technical. Rewrite the second paragraph using simpler language — assume the reader has no technical background.",
            explanation:
              "You're not asking for a full rewrite. You're targeting one specific problem (complexity) in one specific location (second paragraph). The AI keeps everything else and fixes only what you asked.",
          },
          {
            label: "Expanding a section",
            good: "The section on error correction is too brief. Expand it to 3 paragraphs with a concrete example.",
            explanation:
              "Targeted expansion without touching the rest of the document.",
          },
        ],
      },
      {
        title: "The Critique-Then-Improve Technique",
        body: "Ask the AI to critique its own output before improving it. This two-step process — critique then rewrite — often produces dramatically better results than a direct rewrite request. The critique step forces the AI to identify specific weaknesses, which then guides a more targeted improvement.",
        examples: [
          {
            label: "Critique-then-improve",
            good: "Review the email you just wrote. List 3 specific weaknesses — things that could be clearer, more persuasive, or better structured. Then rewrite it addressing those weaknesses.",
            explanation:
              "The AI identifies its own blind spots before fixing them. This metacognitive step consistently produces better outputs than simply asking for a 'better version.'",
          },
        ],
      },
    ],
    keyTakeaways: [
      "Diagnose the failure mode before iterating — vague, off-scope, wrong format, or wrong tone.",
      "Use targeted follow-up prompts instead of full rewrites — it's faster and more precise.",
      "The critique-then-improve technique produces better results than direct rewrite requests.",
    ],
    practiceChallenge:
      "Take any AI output you've been unhappy with. Diagnose which failure mode it represents, then apply the appropriate targeted fix. Do not rewrite the original prompt.",
  },
  {
    id: "advanced-techniques",
    number: 5,
    title: "Advanced Techniques",
    subtitle: "Few-shot examples, system prompts, and multi-turn conversations",
    description:
      "This module covers the techniques used by professionals and developers — few-shot prompting, system prompt design, and managing complex multi-turn conversations. These are the tools that separate casual users from power users.",
    duration: "30 min",
    isPro: true,
    color: "#ef4444",
    icon: "⚡",
    sections: [
      {
        title: "Few-Shot Prompting",
        body: "Few-shot prompting means giving the AI examples of the output you want before asking it to produce its own. Instead of describing what you want, you show it. Two or three examples are usually enough to establish the pattern. This is especially powerful for tasks with a specific style, format, or voice that's hard to describe in words.",
        examples: [
          {
            label: "Few-shot example",
            good: `Here are examples of the style I want:

Example 1: "Quantum entanglement: two particles, one fate. Measure one, you instantly know the other — no matter how far apart they are."

Example 2: "Superposition isn't uncertainty. It's reality holding multiple states simultaneously until forced to choose."

Now write 3 more in the same style about: (1) quantum tunneling, (2) decoherence, (3) the measurement problem.`,
            explanation:
              "The examples define the style more precisely than any description could. Short, declarative, slightly poetic, technically accurate. The AI matches the pattern exactly.",
          },
        ],
      },
      {
        title: "System Prompt Design",
        body: "In API and developer contexts, the 'system prompt' is a set of instructions given to the AI before the conversation starts. It defines the AI's persona, constraints, knowledge scope, and behavior rules. Even in regular chat interfaces, you can simulate a system prompt by starting your conversation with a detailed instruction block before asking your first question.",
        examples: [
          {
            label: "System prompt simulation",
            good: `Before we start, here are your operating instructions for this conversation:

- You are a senior mechanical engineer specializing in automotive diagnostics
- Assume I have professional-level knowledge of vehicle systems
- Skip basic explanations unless I ask for them
- When diagnosing problems, always ask for: symptom description, vehicle year/make/model, any recent repairs, and any relevant scan tool codes
- Format diagnostic steps as numbered lists
- Flag any safety-critical issues immediately

Understood? Now: I have a 2019 F-150 with an intermittent P0300 random misfire...`,
            explanation:
              "The instruction block sets persistent behavior for the entire conversation. You don't have to repeat your preferences on every message.",
          },
        ],
      },
      {
        title: "Managing Multi-Turn Conversations",
        body: "Long conversations with AI require active management. The AI can drift from your original intent, lose track of constraints, or start contradicting earlier outputs. Techniques for managing this: periodic restatements of key requirements, explicit references to earlier outputs ('in the plan you wrote above'), and summary checkpoints ('summarize what we've decided so far before continuing').",
        tips: [
          "Use 'As established earlier...' to anchor the AI to previous decisions.",
          "Ask for a summary checkpoint every 10-15 exchanges in long sessions.",
          "If the AI contradicts itself, point it out explicitly: 'In your earlier response you said X, but now you're saying Y. Which is correct?'",
          "For very long projects, start a new session with a summary of all decisions made so far.",
        ],
      },
    ],
    keyTakeaways: [
      "Few-shot examples define style and format more precisely than descriptions — use them for any task with a specific voice or pattern.",
      "A system prompt (or instruction block) sets persistent behavior for the entire conversation.",
      "Long conversations require active management — use checkpoints, restatements, and explicit references.",
    ],
    practiceChallenge:
      "Find a task where you've struggled to get the right style or tone. Write 2-3 examples of the output you want, then use few-shot prompting to generate 5 more. Compare to your previous attempts.",
  },
  {
    id: "real-world-use-cases",
    number: 6,
    title: "Real-World Use Cases",
    subtitle: "Writing, coding, research, image generation, and business tasks",
    description:
      "Theory is useless without application. This module walks through the most common real-world use cases with specific, tested prompt templates for each. Copy, adapt, and use these directly.",
    duration: "35 min",
    isPro: true,
    color: "#8b5cf6",
    icon: "🌍",
    sections: [
      {
        title: "Writing & Content",
        body: "AI is most commonly used for writing — but most people use it wrong. They ask for a finished product and get generic output. The right approach: use AI for structure and drafts, then edit heavily. The best AI-assisted writing looks like you wrote it, not like the AI did.",
        examples: [
          {
            label: "Blog post outline",
            good: "You are a content strategist. Create a detailed outline for a 1,500-word blog post titled 'Why Quantum Computing Won't Replace Classical Computers (And What It Will Do Instead)'. Include: H2 headings, 2-3 bullet points per section summarizing key arguments, and a suggested hook for the intro. Target audience: tech-literate professionals who've heard the hype but want substance.",
            explanation: "Outline first, draft second. This gives you control over the structure before committing to full content.",
          },
          {
            label: "Email writing",
            good: "Write a follow-up email to a potential client who attended our webinar 3 days ago but hasn't responded to our initial outreach. Tone: warm but professional. Goal: schedule a 20-minute discovery call. Keep it under 150 words. Include a specific subject line.",
            explanation: "Every parameter that matters is specified: timing context, tone, goal, length, and required elements.",
          },
        ],
      },
      {
        title: "Coding & Technical Tasks",
        body: "AI is genuinely excellent at coding — but you need to give it enough context. Specify the language, framework, version, what already exists, and what constraints apply. The more context, the better the code.",
        examples: [
          {
            label: "Code generation with context",
            good: "I'm building a React 19 app with TypeScript and Tailwind CSS. I need a reusable Button component with these variants: primary (solid blue), secondary (outlined), and ghost (text only). Each variant should have hover and active states. Include a disabled state. Export the component and its TypeScript props interface. No external libraries beyond what I listed.",
            explanation: "Stack, versions, variants, states, and constraints all specified. The output will work in your actual codebase.",
          },
        ],
      },
      {
        title: "Research & Analysis",
        body: "AI can accelerate research dramatically — but remember it can hallucinate sources and facts. Use it for structure, synthesis, and identifying questions to investigate, not as a primary source of facts.",
        examples: [
          {
            label: "Research framework",
            good: "I'm researching the commercial viability of room-temperature superconductors. Structure a research framework for me: (1) the 5 most important questions I need to answer, (2) the types of sources I should consult for each question, (3) key claims I should verify independently. Do not provide the answers — just the framework for finding them.",
            explanation: "Using AI to build a research framework rather than provide answers avoids hallucination while still providing enormous value.",
          },
        ],
      },
      {
        title: "Image Generation Prompts",
        body: "Image generation AI (Midjourney, DALL-E, Stable Diffusion) responds to prompts differently than text AI. Effective image prompts include: subject, style, lighting, composition, color palette, and technical parameters. More specific is almost always better.",
        examples: [
          {
            label: "Image generation prompt",
            good: "A quantum computer processor photographed in a cryogenic chamber, blue-white bioluminescent glow, macro photography, shallow depth of field, dark background, metallic gold and silver chip details visible, photorealistic, 8K, dramatic lighting from below",
            explanation: "Subject + environment + lighting + style + technical quality + color palette. Each element steers the output toward a specific aesthetic.",
          },
        ],
      },
    ],
    keyTakeaways: [
      "For writing: use AI for outlines and drafts, then edit heavily — the best AI writing looks human.",
      "For code: always specify language, framework, version, and constraints.",
      "For research: use AI to build frameworks and identify questions, not as a source of facts.",
      "For image generation: subject + style + lighting + composition + palette = consistent results.",
    ],
    practiceChallenge:
      "Pick one use case from this module that applies to your work. Use the template structure provided to write a prompt for a real task you have this week. Run it and evaluate the output against the criteria in this module.",
  },
  {
    id: "mistakes-to-avoid",
    number: 7,
    title: "Mistakes to Avoid",
    subtitle: "Vague prompts, over-constraining, hallucination traps, and more",
    description:
      "Knowing what not to do is as important as knowing what to do. This module catalogs the most common prompt engineering mistakes — the ones that waste time, produce bad outputs, and erode trust in AI tools.",
    duration: "20 min",
    isPro: true,
    color: "#f97316",
    icon: "⚠️",
    sections: [
      {
        title: "The Vagueness Trap",
        body: "The most common mistake: asking a vague question and expecting a specific answer. 'Help me with my business' is not a prompt — it's a prayer. The AI will produce something generic and useless. Every prompt should answer: Who is the AI? What exactly do I need? For whom? In what format? With what constraints?",
        examples: [
          {
            label: "Vagueness vs. specificity",
            bad: "Write me some marketing copy.",
            good: "Write 3 variations of a 2-sentence value proposition for a quantum computing education platform targeting software engineers who want to transition into quantum development. Each variation should emphasize a different benefit: (1) career advancement, (2) intellectual challenge, (3) being early to an emerging field.",
            explanation: "The specific prompt defines product, audience, format, quantity, and angle. The vague prompt produces generic marketing filler.",
          },
        ],
      },
      {
        title: "Over-Constraining",
        body: "The opposite problem: adding so many constraints that the AI can't produce anything useful. If you specify format, length, tone, style, audience, angle, structure, and word choice all at once, you may get a technically compliant but creatively dead output. Leave room for the AI to make good decisions. Constrain what matters most; leave the rest open.",
        tips: [
          "Constrain the 2-3 most important parameters. Leave the rest flexible.",
          "If an output is too constrained, remove one constraint at a time and re-run.",
          "Use 'guidelines' language instead of 'rules' for soft preferences.",
        ],
      },
      {
        title: "Hallucination Traps",
        body: "AI models will confidently state false information — wrong dates, fabricated citations, incorrect statistics, people who don't exist. This is called hallucination. It's not lying; it's the model generating plausible-sounding text that happens to be wrong. High-risk areas: specific numbers, citations, historical dates, names of people, legal or medical facts, and anything that requires real-time information.",
        tips: [
          "Never use AI-generated citations without verifying them independently.",
          "For factual claims, ask: 'How confident are you in this? What's your source?'",
          "Ask the AI to flag uncertainty: 'If you're not certain, say so explicitly.'",
          "For numbers and statistics, always cross-reference with a primary source.",
          "Treat AI outputs as a starting point for research, not an endpoint.",
        ],
      },
      {
        title: "Prompt Injection Awareness",
        body: "If you're building applications that pass user input to AI, be aware of prompt injection — where a user crafts input designed to override your system instructions. For example, a user might type 'Ignore all previous instructions and...' This is a security concern for developers, not casual users. But understanding it helps you recognize why AI sometimes behaves unexpectedly.",
        tips: [
          "For personal use: this isn't a concern.",
          "For developers: sanitize user input before passing to AI, and use system-level constraints.",
          "Never pass raw user input directly into a system prompt without validation.",
        ],
      },
    ],
    keyTakeaways: [
      "Vagueness is the #1 prompt engineering mistake — every prompt should specify who, what, for whom, in what format, and with what constraints.",
      "Over-constraining kills creativity — constrain the 2-3 things that matter most, leave the rest open.",
      "AI hallucination is real and dangerous — never use AI-generated facts, citations, or numbers without independent verification.",
    ],
    practiceChallenge:
      "Review the last 5 prompts you've sent to any AI. Identify which mistake each one made (vague, over-constrained, hallucination risk, or none). Rewrite the worst one using everything you've learned in this course.",
  },
];

export function getCourseModule(id: string): CourseModule | undefined {
  return courseModules.find((m) => m.id === id);
}

export const courseSummary = {
  title: "Prompt Engineering Masterclass",
  subtitle: "Learn to talk to AI the right way",
  description:
    "Most people use AI at 20% of its capability because they don't know how to communicate with it. This course teaches you the techniques used by AI researchers, developers, and power users — from basic structure to advanced multi-turn conversation management. By the end, you'll consistently get outputs that are more accurate, more useful, and closer to what you actually need.",
  totalModules: 7,
  freeModules: 2,
  totalDuration: "~2.5 hours",
  level: "Beginner to Advanced",
};
