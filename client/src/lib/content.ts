/*
  CUBIT LOGIC — Site Content
  Written to be accessible to beginners, credible to professionals.
  Tone: Clear, confident, scientifically accurate. No dumbing down, no jargon walls.
*/

export const heroContent = {
  eyebrow: "Quantum Intelligence Education",
  headline: "The universe computes differently.",
  subheadline: "So should you.",
  body: "Learn quantum computing from beginner basics to AI applications — with guided lessons, a hardware lab, a prompt engineering course, and an AI tutor available 24/7. No physics degree required.",
  cta_primary: "Start Learning",
  cta_secondary: "Ask the AI Tutor",
  stats: [
    { value: "10+", label: "Core Topics" },
    { value: "100%", label: "Free to Read" },
    { value: "AI", label: "Powered Tutor" },
  ],
};

export const topics = [
  {
    id: "qubits",
    icon: "⚛️",
    title: "What Is a Qubit?",
    subtitle: "The quantum bit — and why it breaks everything you know about computing",
    difficulty: "Beginner",
    readTime: "8 min",
    color: "#00E5FF",
    summary:
      "A classical bit is a switch — it's either off (0) or on (1). A qubit is something far stranger: it can be 0, 1, or any quantum superposition of both simultaneously. This isn't a trick or a metaphor. It's a physical reality described by a two-dimensional complex vector called a quantum state. When you measure a qubit, the superposition collapses to a definite 0 or 1 — but before measurement, it genuinely exists in both states at once, weighted by probability amplitudes. This property is what gives quantum computers their extraordinary potential.",
    body: `
## The Classical Bit vs. The Qubit

Every piece of information your phone, laptop, or server processes is ultimately a bit — a binary digit that is either 0 or 1. It's a transistor that's either conducting current or not. Simple, deterministic, and powerful in aggregate.

A **qubit** (quantum bit) is the quantum mechanical analog. Physically, it can be implemented as:
- The spin of an electron (spin-up = |0⟩, spin-down = |1⟩)
- The polarization of a photon (horizontal = |0⟩, vertical = |1⟩)
- The energy level of a superconducting circuit (ground state = |0⟩, excited state = |1⟩)

## Superposition: Being Both at Once

The defining property of a qubit is **superposition**. Mathematically, a qubit's state is written as:

\`|ψ⟩ = α|0⟩ + β|1⟩\`

Where α and β are complex numbers called **probability amplitudes**, and |α|² + |β|² = 1. When you measure the qubit, you get |0⟩ with probability |α|² and |1⟩ with probability |β|².

Think of it this way: a coin spinning in the air is neither heads nor tails — it's in a superposition of both. The moment it lands (measurement), it becomes one or the other. A qubit is that spinning coin, except the physics is real and mathematically precise.

## Why This Matters for Computing

A single qubit holds more information than a single bit — but the real power comes from scale. With *n* qubits in superposition, a quantum computer can represent 2ⁿ states simultaneously. 300 qubits in superposition can represent more states than there are atoms in the observable universe.

This doesn't mean a quantum computer is just a faster classical computer. It means certain algorithms — like Grover's search or Shor's factoring — can exploit superposition and interference to find answers exponentially faster than any classical approach.

## The Bloch Sphere

Physicists visualize a qubit's state using a **Bloch sphere** — a unit sphere where the north pole is |0⟩, the south pole is |1⟩, and every other point on the surface represents a valid superposition. Quantum gates rotate the qubit's state vector around this sphere. It's an elegant geometric representation of quantum mechanics.

## The Catch: Measurement Destroys Superposition

Here's the hard part: you can't read a qubit without collapsing it. The moment you measure, the superposition is gone. Quantum algorithms must be designed to manipulate qubits in superposition and only measure at the end, when the answer has been amplified to high probability through quantum interference. This is the art of quantum algorithm design.
    `,
  },
  {
    id: "superposition",
    icon: "🌊",
    title: "Superposition",
    subtitle: "How a quantum system can exist in multiple states until observed",
    difficulty: "Beginner",
    readTime: "7 min",
    color: "#7B2FFF",
    summary:
      "Superposition is the quantum mechanical principle that a particle exists in all possible states simultaneously until a measurement forces it into one definite state. It's not that we don't know which state it's in — it genuinely has no single definite state before measurement. This is the foundation of quantum parallelism and one of the most counterintuitive facts in all of physics.",
    body: `
## Not Ignorance — Genuine Indeterminacy

When we say a qubit is in superposition, we don't mean "we don't know if it's 0 or 1." We mean it has no definite value. This was experimentally confirmed by Bell's theorem and subsequent experiments — the universe is fundamentally probabilistic at the quantum scale.

This was Einstein's great objection: "God does not play dice." Quantum mechanics says otherwise, and every experiment has sided with quantum mechanics.

## The Double-Slit Experiment

The clearest demonstration of superposition is the double-slit experiment. Fire electrons one at a time at a barrier with two slits. If electrons were classical particles, you'd expect two bands on the detector screen behind the barrier. Instead, you get an interference pattern — the same pattern you'd get from waves.

Each electron passes through both slits simultaneously, interfering with itself. When you add a detector to see which slit the electron uses, the interference pattern disappears. Observation collapses the superposition.

## Superposition in Quantum Computing

In a quantum circuit, superposition is created using a **Hadamard gate (H)**. Applied to |0⟩, it creates the equal superposition:

\`H|0⟩ = (|0⟩ + |1⟩) / √2\`

This single operation puts the qubit in a state where measurement gives 0 or 1 with equal 50% probability. Apply H to n qubits, and you've created a superposition of all 2ⁿ possible inputs simultaneously — the starting point for quantum parallelism.

## Quantum Parallelism vs. Classical Parallelism

Classical parallel computing splits a problem across multiple processors. Quantum parallelism is different: a single quantum processor evaluates a function on all possible inputs at the same time, using superposition. The challenge is extracting the useful answer — which requires careful algorithm design using interference to amplify correct answers and cancel wrong ones.
    `,
  },
  {
    id: "entanglement",
    icon: "🔗",
    title: "Quantum Entanglement",
    subtitle: "Einstein called it 'spooky action at a distance.' He was right to be unsettled.",
    difficulty: "Intermediate",
    readTime: "9 min",
    color: "#00E5FF",
    summary:
      "Quantum entanglement is a correlation between two or more qubits so strong that measuring one instantly determines the state of the other — regardless of the distance between them. It cannot be used to send information faster than light, but it is the resource that powers quantum teleportation, quantum cryptography, and quantum error correction.",
    body: `
## What Entanglement Actually Is

Two qubits are entangled when their quantum states cannot be described independently of each other. The pair must be described as a single quantum system. The simplest entangled state is the Bell state:

\`|Φ⁺⟩ = (|00⟩ + |11⟩) / √2\`

This means: when you measure both qubits, you always get either both 0 or both 1 — never one of each. The correlation is perfect, and it holds no matter how far apart the qubits are.

## Why Einstein Called It "Spooky"

Einstein, Podolsky, and Rosen (EPR) argued in 1935 that entanglement implied either faster-than-light communication or that quantum mechanics was incomplete. They were wrong on both counts. John Bell proved in 1964 that no "hidden variable" theory could reproduce quantum mechanics' predictions. Experiments by Aspect, Zeilinger, and others confirmed Bell's inequalities are violated — entanglement is real, and it's non-local.

But it cannot transmit information. The measurement outcomes are random — you can't control what result you get. The correlation only becomes apparent when you compare results through classical communication.

## Entanglement in Quantum Computing

Entanglement is created in quantum circuits using **CNOT gates** (controlled-NOT). It's the resource behind:

- **Quantum teleportation** — transferring a qubit's state using entanglement + classical communication
- **Quantum key distribution (QKD)** — cryptographic protocols where eavesdropping is physically detectable
- **Quantum error correction** — encoding logical qubits across multiple physical qubits to detect and fix errors
- **Quantum algorithms** — Shor's algorithm and others use entanglement to achieve exponential speedups
    `,
  },
  {
    id: "quantum-gates",
    icon: "🔧",
    title: "Quantum Gates",
    subtitle: "The logic gates of quantum computing — rotations, flips, and controlled operations",
    difficulty: "Intermediate",
    readTime: "10 min",
    color: "#7B2FFF",
    summary:
      "Quantum gates are the quantum analog of classical logic gates (AND, OR, NOT). They are unitary operations — reversible transformations represented as matrices — that rotate a qubit's state on the Bloch sphere. Unlike classical gates, all quantum gates are reversible, which is a fundamental requirement of quantum mechanics.",
    body: `
## Quantum Gates Are Matrices

Every quantum gate is a unitary matrix U, meaning U†U = I (the identity). This guarantees reversibility — quantum computation never loses information. The most important single-qubit gates are:

**Pauli Gates:**
- **X gate** (quantum NOT): Flips |0⟩ to |1⟩ and vice versa. Matrix: [[0,1],[1,0]]
- **Y gate**: Rotation by π around the Y axis of the Bloch sphere
- **Z gate**: Flips the phase of |1⟩. Matrix: [[1,0],[0,-1]]

**Hadamard Gate (H):** Creates superposition. Puts |0⟩ into (|0⟩+|1⟩)/√2. The workhorse of quantum algorithms.

**Phase Gates (S, T):** Rotate the phase of |1⟩ by π/2 and π/4 respectively. Essential for quantum Fourier transform.

## Two-Qubit Gates

**CNOT (Controlled-NOT):** Flips the target qubit if and only if the control qubit is |1⟩. This is the quantum AND gate equivalent and is used to create entanglement.

**Toffoli Gate (CCNOT):** A three-qubit gate that flips the target if both control qubits are |1⟩. This gate is universal — any classical computation can be implemented reversibly using Toffoli gates.

## Universal Gate Sets

Just as NAND gates can implement any classical logic function, certain sets of quantum gates are **universal** — they can approximate any quantum operation to arbitrary precision. A common universal set is {H, T, CNOT}. This is the basis of the quantum circuit model.

## Quantum Circuits

A quantum circuit is a sequence of gates applied to qubits, read left to right. The circuit starts with qubits initialized to |0⟩, applies gates, and ends with measurement. Designing efficient circuits — minimizing gate count and depth — is the core challenge of quantum algorithm engineering.
    `,
  },
  {
    id: "quantum-algorithms",
    icon: "📐",
    title: "Quantum Algorithms",
    subtitle: "Shor, Grover, and the algorithms that will reshape cryptography and search",
    difficulty: "Advanced",
    readTime: "12 min",
    color: "#00E5FF",
    summary:
      "Quantum algorithms exploit superposition, entanglement, and interference to solve specific problems exponentially faster than classical algorithms. The most famous are Shor's algorithm (integer factorization in polynomial time, breaking RSA encryption) and Grover's algorithm (unstructured database search with quadratic speedup). These aren't theoretical curiosities — they define the cryptographic threat model of the next decade.",
    body: `
## Why Quantum Algorithms Are Different

A quantum algorithm isn't just a faster classical algorithm. It's a fundamentally different computational strategy. The key insight: quantum interference can be used to amplify the probability of correct answers and suppress wrong ones — without evaluating each possibility sequentially.

## Shor's Algorithm (1994)

Peter Shor's factoring algorithm is the most consequential quantum algorithm ever discovered. It factors an n-bit integer in O(n³) time — polynomial. The best classical algorithm (general number field sieve) runs in sub-exponential but super-polynomial time.

**Why it matters:** RSA encryption, which secures most of the internet, relies on the hardness of factoring large numbers. A sufficiently large quantum computer running Shor's algorithm would break RSA. This is why NIST has been standardizing post-quantum cryptography since 2016.

**How it works:** Shor's algorithm reduces factoring to finding the period of a modular function, then uses the **Quantum Fourier Transform (QFT)** — a quantum analog of the discrete Fourier transform — to find that period exponentially faster than any classical method.

## Grover's Algorithm (1996)

Lov Grover's search algorithm provides a quadratic speedup for unstructured search. Searching N items classically requires O(N) queries on average. Grover's algorithm finds the answer in O(√N) queries.

**How it works:** Grover uses an **oracle** (a quantum subroutine that marks the correct answer) and **amplitude amplification** — a technique that repeatedly rotates the quantum state to increase the probability of measuring the correct answer. After O(√N) iterations, the correct answer has near-certainty probability.

**Practical impact:** Grover's algorithm effectively halves the security of symmetric encryption keys. AES-128 becomes AES-64-equivalent against a quantum adversary — which is why NIST recommends AES-256 for post-quantum security.

## Variational Quantum Algorithms (VQAs)

For near-term quantum hardware (noisy, limited qubits), variational algorithms are the leading approach. The **Variational Quantum Eigensolver (VQE)** and **Quantum Approximate Optimization Algorithm (QAOA)** use a hybrid classical-quantum loop: a quantum circuit with tunable parameters is optimized classically to minimize an energy function. These are the algorithms most likely to demonstrate quantum advantage on real hardware in the near term.
    `,
  },
  {
    id: "quantum-ml",
    icon: "🧠",
    title: "Quantum Machine Learning",
    subtitle: "What happens when you run neural networks on quantum hardware",
    difficulty: "Advanced",
    readTime: "11 min",
    color: "#7B2FFF",
    summary:
      "Quantum Machine Learning (QML) is the intersection of quantum computing and machine learning. It explores whether quantum algorithms can provide exponential or polynomial speedups for training models, processing data, or solving optimization problems. The field is young, the claims are sometimes overhyped, and the genuine potential is extraordinary.",
    body: `
## The Promise and the Reality

QML has generated enormous excitement — and significant skepticism. Early papers claimed exponential speedups for linear algebra operations (HHL algorithm), but subsequent analysis showed the speedups often vanish when you account for the cost of loading classical data into quantum states (the "input problem"). Honest QML research distinguishes between:

1. **Quantum-enhanced ML** — using quantum subroutines to speed up specific classical ML tasks
2. **Quantum-native ML** — algorithms designed from the ground up for quantum data (e.g., learning properties of quantum systems)

## Quantum Neural Networks (QNNs)

A **Quantum Neural Network** is a parameterized quantum circuit (PQC) — a sequence of quantum gates with tunable rotation angles. The circuit maps input data to output predictions, and the parameters are trained using classical optimization (gradient descent via the **parameter shift rule**).

QNNs are the quantum analog of classical neural networks. They're currently limited by hardware noise and the "barren plateau" problem — the gradient of the loss function vanishes exponentially with circuit depth, making training difficult.

## Quantum Kernel Methods

One of the most rigorous QML approaches uses quantum computers to compute **kernel functions** for support vector machines. A quantum kernel K(x,y) measures the inner product of two data points in a quantum feature space that may be exponentially large and classically intractable to compute. If the quantum feature space captures structure in the data that classical kernels miss, this provides genuine quantum advantage.

## Near-Term Outlook

The honest answer: provable quantum advantage for ML on classical data has not been demonstrated. The most promising near-term applications are:
- **Quantum chemistry simulation** — training ML models on quantum-simulated molecular data
- **Optimization** — using QAOA for combinatorial optimization in logistics, finance, and drug discovery
- **Quantum data** — learning properties of quantum systems (where quantum computers have a natural advantage)

The field is advancing rapidly. The next five years will determine whether QML delivers on its promise or remains a theoretical curiosity.
    `,
  },
];

export const blogPosts = [
  {
    slug: "what-is-quantum-intelligence",
    title: "What Is Quantum Intelligence?",
    subtitle: "A clear-eyed look at the convergence of quantum computing and artificial intelligence",
    date: "June 28, 2026",
    readTime: "10 min",
    category: "Foundations",
    image: "/assets/hero-bg.webp",
    excerpt:
      "Quantum intelligence isn't a buzzword. It's the emerging discipline at the intersection of two of the most transformative technologies in human history. Here's what it actually means — and why it matters.",
    body: `
The phrase "quantum intelligence" gets thrown around a lot. Sometimes it means quantum-enhanced AI. Sometimes it means AI running on quantum hardware. Sometimes it's pure marketing. Let's be precise.

**Quantum intelligence** refers to the class of computational methods that use quantum mechanical phenomena — superposition, entanglement, and interference — to perform tasks that classical AI systems cannot efficiently solve. It's not a single technology. It's a convergence.

## The Two Pillars

**Quantum Computing** provides a new computational substrate. Where classical computers process bits (0 or 1), quantum computers process qubits — which can exist in superposition of both states simultaneously. This enables certain algorithms to run exponentially faster than any classical equivalent.

**Artificial Intelligence** provides the problem domain. Modern AI — particularly deep learning — is fundamentally a large-scale optimization problem: find the parameters of a neural network that minimize prediction error. This requires enormous matrix operations, gradient computations, and search over high-dimensional spaces.

The question quantum intelligence asks: *Can quantum algorithms make AI fundamentally better?*

## What We Know

The honest answer is: for some problems, yes. For others, the jury is still out.

**Quantum simulation** is the clearest win. Quantum computers can simulate molecular and chemical systems exponentially faster than classical computers. This means AI models trained on quantum-simulated data can discover drug candidates, materials, and catalysts that classical simulation would miss entirely. This is happening now, at companies like Quantinuum and IBM.

**Quantum optimization** shows promise for training. Many ML problems reduce to optimization over a complex landscape. Quantum algorithms like QAOA may find better solutions faster for specific problem structures — particularly combinatorial optimization in logistics, finance, and protein folding.

**Quantum kernels** offer a rigorous path to advantage. Quantum kernel methods for support vector machines can access feature spaces that are classically intractable. If the data has structure that lives in those spaces, quantum wins.

## What We Don't Know

Whether quantum neural networks will outperform classical deep learning at scale is an open question. The "barren plateau" problem — where gradients vanish during training — is a serious obstacle. The input problem — loading classical data into quantum states — is expensive. Honest researchers acknowledge these challenges.

## Why It Matters Now

Quantum hardware is improving rapidly. IBM's roadmap targets 100,000+ qubit systems by the end of the decade. Google demonstrated quantum supremacy in 2019. Error correction is advancing. The window to understand and prepare for quantum intelligence is now — not when the hardware arrives.

Cubit Logic exists to make sure that window is open to everyone.
    `,
  },
  {
    slug: "qubits-vs-bits-explained",
    title: "Qubits vs. Bits: The Real Difference",
    subtitle: "Why a qubit isn't just a faster bit — it's a fundamentally different kind of information",
    date: "June 25, 2026",
    readTime: "8 min",
    category: "Fundamentals",
    image: "/assets/topics-bg.webp",
    excerpt:
      "Most explanations of qubits get it wrong. They say a qubit is 'both 0 and 1 at the same time' and leave it there. That's not wrong, but it misses the point. Here's the real story.",
    body: `
The standard explanation of a qubit goes something like this: "A classical bit is 0 or 1. A qubit is 0 and 1 at the same time." This is technically accurate but deeply misleading. It sounds like a qubit is just two bits in a trench coat.

It's not. The difference is qualitative, not quantitative.

## Information in Classical Computing

A classical bit encodes one of two values: 0 or 1. A byte is 8 bits — 256 possible values, but only one value at a time. A classical computer processes information sequentially or in parallel across many bits, but each bit always has a definite value.

The entire edifice of classical computing — from your phone to the world's fastest supercomputer — is built on this foundation. It works extraordinarily well. The problem is that some computations are fundamentally hard for this model.

## Information in Quantum Computing

A qubit's state is a vector in a two-dimensional complex Hilbert space. Written in Dirac notation:

\`|ψ⟩ = α|0⟩ + β|1⟩\`

α and β are complex numbers. |α|² + |β|² = 1. This is not a probability distribution over two values — it's a quantum state that encodes both values simultaneously with complex amplitudes that can interfere with each other.

The key word is **interference**. Complex amplitudes can add constructively (amplifying a result) or destructively (canceling a result). Quantum algorithms are designed to make wrong answers interfere destructively and correct answers interfere constructively. This is the mechanism behind quantum speedup.

## The Exponential Difference

With n classical bits, you can represent one of 2ⁿ values. With n qubits in superposition, you can represent all 2ⁿ values simultaneously. 50 qubits can represent 2⁵⁰ ≈ 10¹⁵ states at once. 300 qubits can represent more states than there are atoms in the observable universe.

But — and this is critical — you can't read all those states. Measurement collapses the superposition to one outcome. The art of quantum computing is designing algorithms that use interference to make the right answer overwhelmingly probable before you measure.

## Why This Isn't Magic

Quantum computing doesn't solve all hard problems. It provides exponential speedup for specific problem structures — periodicity (Shor's algorithm), unstructured search (Grover's algorithm), simulation of quantum systems. For problems without that structure, quantum computers offer no advantage.

Understanding what quantum computers are actually good at — and what they're not — is the foundation of quantum literacy. That's what we're building here.
    `,
  },
  {
    slug: "post-quantum-cryptography",
    title: "Post-Quantum Cryptography: Why Your Passwords Are Already at Risk",
    subtitle: "Quantum computers don't exist at scale yet. The threat to your encrypted data already does.",
    date: "June 20, 2026",
    readTime: "9 min",
    category: "Security",
    image: "/assets/about-bg.webp",
    excerpt:
      "Adversaries are harvesting encrypted data today to decrypt it when quantum computers arrive. This strategy — 'harvest now, decrypt later' — is real, active, and targeting government and financial data right now.",
    body: `
Here is a fact that should concern you: nation-state adversaries are currently collecting encrypted internet traffic — your bank transactions, government communications, medical records — and storing it. They can't read it today. They're waiting for quantum computers powerful enough to break the encryption.

This strategy has a name: **harvest now, decrypt later** (HNDL). And it's not theoretical. It's documented.

## Why Current Encryption Is Vulnerable

Most internet encryption relies on two mathematical problems that are easy to verify but hard to solve:

**RSA** relies on integer factorization. Multiplying two large primes is trivial; factoring their product is computationally infeasible classically. A 2048-bit RSA key would take classical computers longer than the age of the universe to break.

**Elliptic Curve Cryptography (ECC)** relies on the discrete logarithm problem on elliptic curves. Same principle — easy to compute in one direction, classically intractable in reverse.

**Shor's algorithm** solves both problems in polynomial time on a quantum computer. A quantum computer with ~4,000 logical qubits could break 2048-bit RSA. We don't have that today. We will.

## NIST's Response

The National Institute of Standards and Technology (NIST) spent eight years running a post-quantum cryptography standardization competition. In 2024, they finalized the first post-quantum cryptographic standards:

- **ML-KEM** (CRYSTALS-Kyber) — key encapsulation, based on lattice problems
- **ML-DSA** (CRYSTALS-Dilithium) — digital signatures, lattice-based
- **SLH-DSA** (SPHINCS+) — hash-based signatures

These algorithms are believed to be resistant to both classical and quantum attacks. Migration is already underway in government systems.

## What You Should Know

If you're a developer: start planning migration to post-quantum algorithms now. TLS 1.3 is adding hybrid key exchange. OpenSSL and major cloud providers are rolling out support.

If you're a user: the most sensitive data you've transmitted in the last decade may eventually be readable. This is a systemic risk, not a personal one — and it's why the transition to post-quantum cryptography is a national security priority.

The quantum threat to cryptography isn't coming. For long-lived secrets, it's already here.
    `,
  },
];

export const aiTutorIntro = {
  title: "Ask the Cubit Logic AI Tutor",
  subtitle: "Quantum concepts, explained on demand. Ask anything.",
  description:
    "The Cubit Logic AI Tutor is trained to explain quantum computing, quantum mechanics, and quantum AI at any level — from 'what is a qubit?' to 'explain the quantum Fourier transform.' Ask a beginner question, get a clear analogy. Ask a technical question, get a precise answer with the math.",
  placeholder: "Ask anything — e.g., 'Explain quantum entanglement like I'm 12' or 'What is the no-cloning theorem?'",
  examples: [
    "What's the difference between a qubit and a classical bit?",
    "How does Shor's algorithm break RSA encryption?",
    "Explain quantum tunneling with an analogy",
    "What is a quantum Fourier transform?",
    "Why can't quantum computers solve all NP problems?",
    "What is decoherence and why is it a problem?",
  ],
};
