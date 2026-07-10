# Cubit Logic — Design Brainstorm

## Three Stylistic Approaches

### Approach 1: Deep Space Observatory
A dark, immersive space-science aesthetic. Deep navy and black backgrounds with glowing cyan and violet accents. Feels like looking at a quantum physics textbook designed by NASA. Probability: 0.07

### Approach 2: Neon Circuit Board
High-contrast dark background with neon green and electric blue circuit-trace patterns. Cyberpunk-adjacent, aggressive, hacker-culture energy. Probability: 0.04

### Approach 3: Bioluminescent Quantum Field
Deep black backgrounds with soft glowing particle fields, interference wave patterns, and orbital ring motifs. Feels alive and scientific — like watching quantum phenomena under a microscope. Colors: deep black, electric cyan (#00E5FF), quantum violet (#7B2FFF), with soft white text. Probability: 0.09

---

## CHOSEN: Approach 3 — Bioluminescent Quantum Field

This aligns directly with the logo we already created and gives the site a unique, premium identity that no generic template can replicate.

### Design Movement
**Quantum Bioluminescence** — the aesthetic of deep-sea creatures emitting light in total darkness, mapped onto quantum physics visualization. Scientific, mysterious, alive.

### Core Principles
1. **Darkness as canvas** — The deep black background is not empty; it is the void from which quantum phenomena emerge.
2. **Light as information** — Every glow, gradient, and particle has meaning. Nothing glows without purpose.
3. **Asymmetric tension** — Layouts are never perfectly centered. Content pulls left or right to create visual energy.
4. **Motion implies intelligence** — Subtle animations suggest the site is thinking, processing, alive.

### Color Philosophy
- **Background:** `#050A1A` (deep space black-navy) — not pure black, has depth
- **Primary accent:** `#00E5FF` (electric cyan) — the color of quantum energy, used for headlines, CTAs, borders
- **Secondary accent:** `#7B2FFF` (quantum violet) — used for secondary elements, gradients, hover states
- **Text:** `#E8F4FD` (near-white with a cold blue tint) — readable, not harsh
- **Muted text:** `#6B8CAE` — for captions, labels, secondary info
- **Card backgrounds:** `rgba(255,255,255,0.04)` with `backdrop-blur` — glassmorphism cards

### Layout Paradigm
- **Asymmetric split layouts** — hero is 60/40 left-right, not centered
- **Diagonal section breaks** — sections transition with angled clip-paths, not flat horizontal lines
- **Floating card grid** — topic cards float with subtle shadow and glow on hover
- **Sticky left-rail navigation** on desktop, hamburger on mobile

### Signature Elements
1. **Particle field background** — animated CSS/canvas particle system simulating quantum superposition
2. **Glowing orbital rings** — the Bloch sphere motif from the logo appears as decorative elements throughout
3. **Cyan underline accents** — key words in headlines get a glowing cyan underline, not a standard highlight

### Interaction Philosophy
Every interaction should feel like interacting with a quantum system — probabilistic, responsive, alive. Hover states bloom outward. Clicks ripple. The AI chat widget pulses gently when idle.

### Animation Guidelines
- Hero particles: slow drift, 8–12s cycle, low opacity (0.3–0.6)
- Card hover: `translateY(-4px)` + glow intensify, 200ms ease-out
- Section entrance: fade-up from `translateY(20px)`, staggered 80ms per element
- CTA button: subtle pulse animation at rest, scale(0.97) on click
- Nav: blur-in on scroll past hero

### Typography System
- **Display/Headlines:** `Orbitron` — geometric, futuristic, unmistakably tech
- **Body:** `Space Grotesk` — clean, modern, highly readable, not Inter
- **Code/Math:** `JetBrains Mono` — for code snippets and equations
- **Hierarchy:** 72px hero → 48px section → 28px card title → 16px body → 13px caption

### Brand Essence
**Cubit Logic** — The clearest path into quantum intelligence, for anyone brave enough to look. *Curious. Precise. Illuminating.*

### Brand Voice
Headlines sound like a scientist who also writes sci-fi. Direct, confident, never dumbed down but never condescending.
- Example 1: *"Qubits don't just store data. They exist in every possible state at once — until you look."*
- Example 2: *"The AI you know runs on bits. The AI coming next runs on quantum."*

### Wordmark & Logo
The existing Cubit Logic logo (Bloch sphere icon + geometric wordmark) is the brand mark. Used in the top-left nav at 40px height. Favicon is the sphere icon only.

### Signature Brand Color
**Electric Cyan `#00E5FF`** — unmistakably Cubit Logic.
