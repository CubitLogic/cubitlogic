export interface HardwareItem {
  id: string;
  name: string;
  category: "quantum" | "ai" | "cryogenic" | "photonic" | "classical";
  subcategory: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  estimatedCost: string;
  costNote: string;
  manufacturers: { name: string; country: string; notable: string }[];
  specs: { label: string; value: string }[];
  howItWorks: string;
  whyItMatters: string;
  challenges: string;
  funFact: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  relatedItems: string[];
  videos?: { title: string; url: string; channel: string; duration: string }[];
}

export const hardwareItems: HardwareItem[] = [
  {
    id: "dilution-refrigerator",
    name: "Dilution Refrigerator",
    category: "cryogenic",
    subcategory: "Cooling Systems",
    tagline: "The coldest machines on Earth — colder than outer space.",
    description:
      "A dilution refrigerator is the primary cooling system used to bring superconducting quantum processors to operating temperature — typically 10–20 millikelvin, roughly 150 times colder than the temperature of outer space. Without it, superconducting qubits simply don't work.",
    icon: "🧊",
    color: "#0ea5e9",
    estimatedCost: "$500,000 – $2,000,000",
    costNote: "Per unit. Annual maintenance adds $50,000–$150,000. Liquid helium supply is a significant ongoing cost.",
    manufacturers: [
      { name: "Bluefors", country: "Finland", notable: "Market leader; used by IBM, Google, IQM" },
      { name: "Oxford Instruments", country: "UK", notable: "Long-established cryogenics manufacturer; Triton series" },
      { name: "Leiden Cryogenics", country: "Netherlands", notable: "Custom high-performance systems for research" },
      { name: "Janis Research", country: "USA", notable: "Academic and government lab supplier" },
    ],
    specs: [
      { label: "Base Temperature", value: "10–20 mK (millikelvin)" },
      { label: "Cooling Power at 100 mK", value: "400–1000 µW" },
      { label: "Weight", value: "300–800 kg" },
      { label: "Height", value: "2–3 meters" },
      { label: "Cooldown Time", value: "24–72 hours" },
      { label: "Helium-3 Required", value: "~1 liter (recirculated)" },
      { label: "Vibration Isolation", value: "Required — custom platforms" },
    ],
    howItWorks:
      "Dilution refrigerators exploit the quantum mechanical properties of helium isotopes. A mixture of helium-3 (³He) and helium-4 (⁴He) is cooled until it phase-separates into two layers. When ³He atoms cross the phase boundary from the concentrated phase into the dilute phase, they absorb heat — exactly like evaporative cooling, but at millikelvin scales. This process is continuous and self-sustaining as long as the ³He is recirculated through a series of heat exchangers.",
    whyItMatters:
      "Superconducting qubits require temperatures near absolute zero to maintain quantum coherence. At room temperature, thermal noise destroys quantum states in nanoseconds. At 15 mK, coherence times extend to microseconds or milliseconds — long enough to perform meaningful quantum computations. The dilution refrigerator is the single most expensive and physically imposing component of a superconducting quantum computer.",
    challenges:
      "Helium-3 is extremely rare and expensive — a byproduct of tritium decay in nuclear weapons programs. Supply chain constraints are a real concern for scaling quantum computing. Vibration from the pulse tube cooler (used in the pre-cooling stages) can decohere qubits, requiring sophisticated vibration isolation. The cooldown process takes days, meaning any hardware failure requires a full thermal cycle to repair.",
    funFact:
      "The coldest known place in the universe is not in space — it's in quantum computing labs. The cosmic microwave background radiation gives deep space a temperature of about 2.7 K. Dilution refrigerators routinely operate at 0.015 K — nearly 200 times colder.",
    difficulty: "Expert",
    relatedItems: ["superconducting-qubit-chip", "cryogenic-wiring", "quantum-amplifier"],
    videos: [
      { title: "What is a Dilution Fridge? | Quantum Science at Fermilab", url: "https://www.youtube.com/watch?v=HSClNB2pq0c", channel: "Fermilab", duration: "5 min" },
      { title: "Dilution Refrigerators: The Wildest Cooling System Ever Built", url: "https://www.youtube.com/watch?v=2L3kPFQOKvg", channel: "Science Channel", duration: "8 min" },
      { title: "How This Machine Keeps Quantum Computers at 0.01 Kelvin", url: "https://www.youtube.com/watch?v=Ij19rtPg9hM", channel: "Real Engineering", duration: "10 min" },
    ],
  },
  {
    id: "superconducting-qubit-chip",
    name: "Superconducting Qubit Chip",
    category: "quantum",
    subcategory: "Quantum Processors",
    tagline: "The brain of a quantum computer — built from Josephson junctions.",
    description:
      "A superconducting qubit chip is the core processing unit of quantum computers made by IBM, Google, and most major players. It contains anywhere from a handful to hundreds of qubits fabricated on a silicon or sapphire substrate using thin-film deposition techniques borrowed from semiconductor manufacturing.",
    icon: "⚛️",
    color: "#6B21FF",
    estimatedCost: "$10,000 – $500,000+",
    costNote: "Research-grade chips from academic fabs: $10K–$50K. Commercial-quality chips from IBM or Google internal fabs: not publicly sold. Full quantum processor systems: $10M–$30M+.",
    manufacturers: [
      { name: "IBM Quantum", country: "USA", notable: "Eagle (127Q), Osprey (433Q), Condor (1121Q)" },
      { name: "Google Quantum AI", country: "USA", notable: "Sycamore (53Q), Willow (105Q)" },
      { name: "IQM", country: "Finland", notable: "European quantum hardware leader; 20–150Q systems" },
      { name: "Rigetti Computing", country: "USA", notable: "Publicly traded; Ankaa series" },
      { name: "Oxford Quantum Circuits", country: "UK", notable: "Coaxmon architecture" },
    ],
    specs: [
      { label: "Qubit Count (2024)", value: "53 – 1,121 physical qubits" },
      { label: "Qubit Type", value: "Transmon (most common)" },
      { label: "Gate Fidelity (2Q)", value: "99.0% – 99.9%" },
      { label: "Coherence Time (T2)", value: "10 µs – 500 µs" },
      { label: "Operating Temperature", value: "10–20 mK" },
      { label: "Substrate", value: "Silicon or sapphire wafer" },
      { label: "Fabrication Node", value: "~100–500 nm features" },
    ],
    howItWorks:
      "Each qubit is built around a Josephson junction — two superconducting electrodes separated by a thin insulating barrier. When cooled below the superconducting transition temperature (~1 K for aluminum), Cooper pairs of electrons tunnel through the barrier without resistance. The junction's nonlinear inductance creates an anharmonic oscillator with quantized energy levels. The two lowest levels serve as |0⟩ and |1⟩. Microwave pulses (4–8 GHz) drive transitions between these states. Coupling between qubits is achieved through capacitors or resonators, enabling two-qubit gates.",
    whyItMatters:
      "Superconducting qubits are currently the most mature and scalable quantum computing technology. They can be fabricated using modified semiconductor processes, operate at GHz frequencies compatible with standard microwave electronics, and have demonstrated the highest qubit counts of any platform. IBM's roadmap targets 100,000+ qubit systems by the end of the decade.",
    challenges:
      "Coherence times are still short compared to the number of operations needed for fault-tolerant computation. Each physical qubit requires extensive classical control electronics operating at room temperature, connected via coaxial cables that must thermally isolate the cold stage. Fabrication yield is low — not every qubit on a chip performs identically, requiring characterization and calibration of each device.",
    funFact:
      "Google's Sycamore chip performed a specific computation in 200 seconds that Google claimed would take the world's fastest classical supercomputer 10,000 years. IBM disputed the estimate, suggesting their Summit supercomputer could do it in 2.5 days — but even that concedes a massive quantum speedup.",
    difficulty: "Expert",
    relatedItems: ["dilution-refrigerator", "cryogenic-wiring", "quantum-amplifier", "microwave-control-electronics"],
    videos: [
      { title: "How Qubits Really Work", url: "https://www.youtube.com/watch?v=HSM1GfukQMI", channel: "PBS Space Time", duration: "15 min" },
      { title: "The Taming of the Superconducting Qubit", url: "https://www.youtube.com/watch?v=nQ97tdofWM4", channel: "IBM Research", duration: "20 min" },
      { title: "How Does a Quantum Computer Work?", url: "https://www.youtube.com/watch?v=g_IaVepNDT4", channel: "Veritasium", duration: "7 min" },
    ],
  },
  {
    id: "ion-trap",
    name: "Ion Trap",
    category: "quantum",
    subcategory: "Quantum Processors",
    tagline: "Levitating individual atoms with electric fields — nature's perfect qubits.",
    description:
      "Ion trap quantum computers use individual charged atoms (ions) suspended in vacuum by electromagnetic fields as qubits. Each ion is a perfect, identical copy of every other ion of the same species — giving trapped-ion systems the highest gate fidelities of any quantum computing platform.",
    icon: "⚡",
    color: "#f59e0b",
    estimatedCost: "$1,000,000 – $5,000,000",
    costNote: "Full trapped-ion quantum computer systems. The trap chip itself costs $5,000–$50,000. Vacuum systems, lasers, and optics dominate the total cost.",
    manufacturers: [
      { name: "IonQ", country: "USA", notable: "Publicly traded; Aria and Forte systems; 35 algorithmic qubits" },
      { name: "Quantinuum", country: "USA/UK", notable: "Honeywell spinoff; H-series; highest fidelity commercial systems" },
      { name: "Oxford Ionics", country: "UK", notable: "Microwave-driven ions; no lasers required" },
      { name: "Universal Quantum", country: "UK", notable: "Scalable modular ion trap architecture" },
      { name: "AQT (Alpine Quantum Technologies)", country: "Austria", notable: "European trapped-ion systems" },
    ],
    specs: [
      { label: "Qubit Count (2024)", value: "32 – 56 physical qubits" },
      { label: "Ion Species", value: "Ytterbium-171 (Yb⁺), Barium-133 (Ba⁺)" },
      { label: "2-Qubit Gate Fidelity", value: "99.5% – 99.9%" },
      { label: "Coherence Time", value: "Minutes to hours" },
      { label: "Gate Speed", value: "~1 ms (slower than superconducting)" },
      { label: "Operating Temperature", value: "Room temperature (trap); ions cooled by lasers to µK" },
      { label: "Connectivity", value: "All-to-all (any qubit can interact with any other)" },
    ],
    howItWorks:
      "Ions are loaded into a linear Paul trap — a device using oscillating radio-frequency electric fields to create a pseudo-potential well that suspends charged particles in vacuum. Laser cooling (Doppler cooling followed by sideband cooling) brings the ions to near absolute zero in their motional degrees of freedom. Qubit states are encoded in the hyperfine or optical energy levels of each ion. Single-qubit gates are performed with focused laser pulses or microwave fields. Two-qubit gates use the shared motional mode of the ion chain as a quantum bus — a phonon mediates the interaction between any two ions.",
    whyItMatters:
      "Trapped-ion qubits have the longest coherence times and highest gate fidelities of any quantum computing platform. All-to-all connectivity means fewer swap operations are needed to execute algorithms. Quantinuum's H2 processor has demonstrated 99.9% two-qubit gate fidelity — the highest of any commercial system. The main tradeoff is speed: ion gates take microseconds to milliseconds, versus nanoseconds for superconducting qubits.",
    challenges:
      "Scaling ion traps is fundamentally difficult. As more ions are added to a chain, the motional modes become denser and harder to resolve, increasing crosstalk. Current approaches involve modular trap arrays connected by photonic links, but this adds complexity. The laser systems required are large, expensive, and sensitive to vibration. Vacuum systems must maintain pressures below 10⁻¹¹ torr — ultra-high vacuum that requires baking the entire system.",
    funFact:
      "A single ytterbium ion used as a qubit is about 170 atomic mass units — roughly 170 times the mass of a hydrogen atom. It's suspended in mid-air by electric fields, cooled by laser light to a few microkelvin, and manipulated with pulses of light to perform quantum computations. The entire qubit fits inside a space smaller than a single human red blood cell.",
    difficulty: "Expert",
    relatedItems: ["superconducting-qubit-chip", "quantum-laser-system", "vacuum-system"],
    videos: [
      { title: "How Trapped-Ion Quantum Computers Work", url: "https://www.youtube.com/watch?v=ec3Bs6Wam8w", channel: "Quantinuum", duration: "5 min" },
      { title: "Superconducting Qubits, Trapped Ions, Majorana", url: "https://www.youtube.com/watch?v=yqIa7xhb3ds", channel: "Quantum Computing", duration: "18 min" },
      { title: "Quantum Computing Explained: Google vs Microsoft vs IBM", url: "https://www.youtube.com/watch?v=7YDKvRkMpjw", channel: "Tech Explained", duration: "12 min" },
    ],
  },
  {
    id: "gpu-ai-accelerator",
    name: "GPU / AI Accelerator",
    category: "ai",
    subcategory: "AI Training Hardware",
    tagline: "The workhorses of the AI revolution — massively parallel math engines.",
    description:
      "Graphics Processing Units (GPUs) and purpose-built AI accelerators are the primary hardware used to train and run large AI models. A modern AI accelerator can perform quadrillions of floating-point operations per second and is the reason large language models like GPT-4 and Claude exist.",
    icon: "🖥️",
    color: "#10b981",
    estimatedCost: "$10,000 – $40,000 per unit",
    costNote: "NVIDIA H100: ~$30,000–$40,000 per card. Training GPT-4 required an estimated 25,000 A100 GPUs running for ~90 days, costing $50M–$100M in compute alone.",
    manufacturers: [
      { name: "NVIDIA", country: "USA", notable: "H100, A100, B200 — dominant market position; ~80% of AI training market" },
      { name: "AMD", country: "USA", notable: "MI300X — competitive with H100 on memory bandwidth" },
      { name: "Google", country: "USA", notable: "TPU v5 — custom ASIC; used exclusively for Google AI workloads" },
      { name: "Intel", country: "USA", notable: "Gaudi 3 — competitive pricing; open ecosystem" },
      { name: "Cerebras", country: "USA", notable: "Wafer-Scale Engine — entire silicon wafer as one chip; 4 trillion transistors" },
    ],
    specs: [
      { label: "NVIDIA H100 FP8 Performance", value: "3,958 TFLOPS" },
      { label: "Memory (H100 SXM)", value: "80 GB HBM3" },
      { label: "Memory Bandwidth", value: "3.35 TB/s" },
      { label: "Transistor Count", value: "80 billion (H100)" },
      { label: "TDP (Power)", value: "700W (H100 SXM)" },
      { label: "Interconnect", value: "NVLink 4.0 — 900 GB/s bidirectional" },
      { label: "Manufacturing Node", value: "4nm TSMC (H100)" },
    ],
    howItWorks:
      "GPUs were originally designed for rendering graphics — a task that requires performing the same mathematical operation (matrix multiplication) on millions of pixels simultaneously. This same parallelism turns out to be exactly what neural network training requires. Training a neural network is fundamentally a massive matrix multiplication problem: forward passes compute predictions, backward passes compute gradients, and the optimizer updates weights. A GPU with thousands of CUDA cores can perform these operations orders of magnitude faster than a CPU. Modern AI accelerators like the H100 add specialized Tensor Cores that perform mixed-precision matrix operations in a single clock cycle.",
    whyItMatters:
      "Without GPUs, modern deep learning would not exist. The 2012 AlexNet paper — which launched the deep learning revolution — was only possible because Alex Krizhevsky trained it on two NVIDIA GTX 580 GPUs. Every major AI model since then has been trained on GPU clusters. NVIDIA's market capitalization exceeded $3 trillion in 2024, making it one of the most valuable companies in history — entirely because of AI demand for its hardware.",
    challenges:
      "The power consumption of large AI training clusters is staggering. A single H100 GPU draws 700W. A cluster of 25,000 GPUs draws ~17.5 megawatts — equivalent to a small town. Cooling these systems requires massive data center infrastructure. Supply constraints have made H100s extremely difficult to obtain, with wait times of 6–12 months at peak demand. Export controls restrict sales to China, creating geopolitical tension.",
    funFact:
      "NVIDIA's founder Jensen Huang predicted in 2016 that AI would need more compute than Moore's Law could provide — and bet the company on building specialized AI hardware. That bet paid off: NVIDIA's stock increased 200x between 2019 and 2024, making it briefly the most valuable company on Earth.",
    difficulty: "Intermediate",
    relatedItems: ["hbm-memory", "networking-infiniband", "data-center-cooling"],
    videos: [
      { title: "Stanford Seminar: NVIDIA's H100 GPU", url: "https://www.youtube.com/watch?v=MC223HlPdK0", channel: "Stanford University", duration: "60 min" },
      { title: "But What is a Neural Network?", url: "https://www.youtube.com/watch?v=aircAruvnKk", channel: "3Blue1Brown", duration: "19 min" },
      { title: "How do Graphics Cards Work? Exploring GPU Architecture", url: "https://www.youtube.com/watch?v=h9Z4oGN89MU", channel: "Branch Education", duration: "25 min" },
    ],
  },
  {
    id: "tpu",
    name: "Tensor Processing Unit (TPU)",
    category: "ai",
    subcategory: "AI Training Hardware",
    tagline: "Google's custom silicon — built from the ground up for neural networks.",
    description:
      "Tensor Processing Units are custom application-specific integrated circuits (ASICs) designed by Google specifically for accelerating neural network computations. Unlike GPUs, which are general-purpose parallel processors adapted for AI, TPUs are purpose-built for the matrix operations at the heart of deep learning.",
    icon: "🔲",
    color: "#4285F4",
    estimatedCost: "$Not publicly sold",
    costNote: "TPUs are only available through Google Cloud (TPU v5: ~$2.40–$4.20/hour per chip). Google uses them internally for all AI workloads including Search, Translate, and Gemini training.",
    manufacturers: [
      { name: "Google / Broadcom", country: "USA", notable: "Designed by Google; manufactured by TSMC via Broadcom" },
    ],
    specs: [
      { label: "TPU v5p Peak Performance", value: "459 TFLOPS (BF16)" },
      { label: "HBM Memory", value: "95 GB per chip" },
      { label: "Memory Bandwidth", value: "2,765 GB/s" },
      { label: "Interconnect", value: "ICI — 4,800 Gbps per chip" },
      { label: "Pod Configuration", value: "8,960 chips per pod" },
      { label: "Manufacturing Node", value: "7nm (v4); 5nm (v5)" },
      { label: "Power per Chip", value: "~200W" },
    ],
    howItWorks:
      "A TPU's core is a systolic array — a grid of multiply-accumulate (MAC) units that pass data between neighbors in a wave-like pattern. This architecture is extremely efficient for matrix multiplication because data flows through the array without being written back to memory between operations, eliminating the memory bandwidth bottleneck that limits GPU performance on certain workloads. TPUs also use bfloat16 (brain float 16) — a numeric format Google invented that maintains the dynamic range of 32-bit floats while using half the memory, ideal for neural network training.",
    whyItMatters:
      "Google trained the original BERT, T5, PaLM, and Gemini models on TPU pods. The TPU v4 pod — 4,096 chips connected by a 3D torus network — delivers 1.1 exaflops of BF16 performance. This is the hardware behind Google Search's AI features, Google Translate, and every Gemini model. TPUs demonstrate that custom silicon can outperform general-purpose GPUs for specific workloads by 2–10x in performance per watt.",
    challenges:
      "TPUs are only accessible through Google Cloud, creating vendor lock-in. They are optimized for TensorFlow and JAX — less compatible with PyTorch-first workflows. The systolic array architecture is less flexible than GPUs for irregular workloads. Google's internal access to TPUs gives it a significant competitive advantage in AI research that external researchers cannot replicate.",
    funFact:
      "The original TPU v1 (2015) was designed in just 15 months — an extraordinarily fast hardware development cycle. Google deployed it in data centers before publishing any papers about it, meaning it was secretly accelerating Google Search for over a year before the world knew it existed.",
    difficulty: "Advanced",
    relatedItems: ["gpu-ai-accelerator", "hbm-memory", "networking-infiniband"],
    videos: [
      { title: "But What is a Neural Network?", url: "https://www.youtube.com/watch?v=aircAruvnKk", channel: "3Blue1Brown", duration: "19 min" },
      { title: "How Might LLMs Store Facts | Deep Learning", url: "https://www.youtube.com/watch?v=9-Jl0dxWQs8", channel: "3Blue1Brown", duration: "25 min" },
      { title: "Dilution Refrigerators for Quantum Computing", url: "https://www.youtube.com/watch?v=qgwbuUXDyz4", channel: "Quantum Computing", duration: "8 min" },
    ],
  },
  {
    id: "quantum-photonic-chip",
    name: "Photonic Quantum Chip",
    category: "photonic",
    subcategory: "Quantum Processors",
    tagline: "Quantum computing with light — room temperature, fiber-compatible.",
    description:
      "Photonic quantum computers use individual photons (particles of light) as qubits. Unlike superconducting qubits that require extreme cooling, photonic systems can operate at room temperature and interface directly with fiber optic networks — making them natural candidates for quantum communication and distributed quantum computing.",
    icon: "💡",
    color: "#f97316",
    estimatedCost: "$500,000 – $3,000,000",
    costNote: "Full photonic quantum computing systems. Individual photonic integrated circuits (PICs): $1,000–$100,000 depending on complexity. Single-photon detectors: $50,000–$200,000 each.",
    manufacturers: [
      { name: "PsiQuantum", country: "USA", notable: "Targeting million-qubit fault-tolerant system using silicon photonics; partnered with GlobalFoundries" },
      { name: "Xanadu", country: "Canada", notable: "Borealis system; demonstrated quantum advantage in 2022; open-source PennyLane framework" },
      { name: "QuiX Quantum", country: "Netherlands", notable: "Boson sampling processors; 20-mode systems" },
      { name: "Quandela", country: "France", notable: "Single-photon sources; Muse quantum computer" },
    ],
    specs: [
      { label: "Qubit Type", value: "Photon polarization or path encoding" },
      { label: "Operating Temperature", value: "Room temperature (chip); detectors at 4K" },
      { label: "Gate Speed", value: "Picoseconds to nanoseconds" },
      { label: "Photon Source", value: "Quantum dot or spontaneous parametric down-conversion" },
      { label: "Detector Type", value: "Superconducting nanowire single-photon detector (SNSPD)" },
      { label: "Detection Efficiency", value: "~95% (SNSPD)" },
      { label: "Manufacturing", value: "Silicon photonics foundry (CMOS-compatible)" },
    ],
    howItWorks:
      "Photonic qubits encode quantum information in properties of single photons: polarization (horizontal vs. vertical), path (which waveguide the photon travels through), or time-bin (early vs. late arrival). Quantum gates are implemented using beam splitters, phase shifters, and nonlinear optical elements integrated onto a silicon chip. The fundamental challenge is that photons don't naturally interact with each other — two-qubit gates require either strong nonlinear media (difficult) or measurement-based schemes (the KLM protocol) that use ancilla photons and feed-forward operations. Gaussian boson sampling — used by Xanadu — is a specific photonic computation that is classically hard to simulate.",
    whyItMatters:
      "Photonic quantum computers are the only platform that naturally interfaces with quantum communication networks. A photon generated by a quantum computer can be sent directly down a fiber optic cable to another quantum computer, enabling distributed quantum computing and quantum internet protocols. PsiQuantum's approach — using silicon photonics fabricated in standard semiconductor fabs — could potentially scale to millions of qubits using existing manufacturing infrastructure.",
    challenges:
      "Single photons are fragile and easily lost. Photon loss in waveguides and at detectors is the primary source of error. Efficient single-photon sources are technically difficult — most approaches generate photons probabilistically, requiring post-selection. The lack of natural photon-photon interaction makes deterministic two-qubit gates extremely challenging. Superconducting nanowire detectors, while highly efficient, still require cooling to ~1–4 K.",
    funFact:
      "Xanadu's Borealis photonic processor demonstrated quantum computational advantage in 2022 using Gaussian boson sampling — performing a calculation in 36 microseconds that would take the best classical algorithm 9,000 years. The entire computation happened at room temperature using light pulses in a loop of fiber.",
    difficulty: "Expert",
    relatedItems: ["superconducting-qubit-chip", "ion-trap", "quantum-amplifier"],
    videos: [
      { title: "How Xanadu's Photonic Quantum Computers Work", url: "https://www.youtube.com/watch?v=v7iAqcFCTQQ", channel: "Xanadu", duration: "6 min" },
      { title: "Xanadu Demonstrates World's First Error-Resistant Photonic Qubit", url: "https://www.youtube.com/watch?v=34-sK81i7-s", channel: "Xanadu", duration: "4 min" },
      { title: "Why Quantum Computing Requires Quantum Cryptography", url: "https://www.youtube.com/watch?v=pi7YwxxZQ5A", channel: "PBS Space Time", duration: "14 min" },
    ],
  },
  {
    id: "hbm-memory",
    name: "High Bandwidth Memory (HBM)",
    category: "ai",
    subcategory: "Memory & Storage",
    tagline: "Stacked silicon memory that feeds the AI beast — 3 terabytes per second.",
    description:
      "High Bandwidth Memory is a type of DRAM that stacks multiple memory dies vertically and connects them with thousands of tiny wires (through-silicon vias) to achieve memory bandwidth that is 10–20x higher than conventional DDR5 RAM. It is the reason modern AI accelerators can process massive neural networks.",
    icon: "🧠",
    color: "#8b5cf6",
    estimatedCost: "$3,000 – $10,000 per stack",
    costNote: "HBM3e stacks used in H100/H200 GPUs. The memory alone accounts for roughly 30–40% of an AI accelerator's total cost. SK Hynix and Samsung are in a supply-constrained market.",
    manufacturers: [
      { name: "SK Hynix", country: "South Korea", notable: "Dominant HBM supplier; exclusive H100 HBM3 supplier for NVIDIA" },
      { name: "Samsung", country: "South Korea", notable: "HBM3e; ramping production for AI market" },
      { name: "Micron", country: "USA", notable: "HBM3e; growing market share; key for US supply chain security" },
    ],
    specs: [
      { label: "HBM3e Bandwidth", value: "1.2 TB/s per stack" },
      { label: "Capacity per Stack", value: "24–36 GB" },
      { label: "Die Count", value: "8–12 DRAM dies stacked" },
      { label: "Interface Width", value: "1,024 bits" },
      { label: "Through-Silicon Vias", value: "~10,000 per stack" },
      { label: "Power Efficiency", value: "~3x better than GDDR6 per GB/s" },
      { label: "H100 Total HBM3", value: "80 GB (6 stacks)" },
    ],
    howItWorks:
      "Conventional DRAM is a flat chip connected to the processor by a narrow bus — like a highway with only a few lanes. HBM stacks multiple DRAM chips vertically, then connects them to the processor using thousands of microscopic copper pillars drilled through the silicon (through-silicon vias, or TSVs). This creates a massively wide data bus — 1,024 bits versus 64 bits for DDR5 — allowing enormous amounts of data to flow between memory and compute in parallel. The stacked assembly is mounted directly next to the GPU die on a silicon interposer, minimizing signal travel distance.",
    whyItMatters:
      "The bottleneck in AI inference (running a trained model) is almost always memory bandwidth, not compute. A large language model like GPT-4 has ~1.8 trillion parameters — each a 16-bit floating point number. Loading those parameters from memory for each token generation requires terabytes per second of bandwidth. HBM3e's 3.35 TB/s (across all stacks in an H100) is what makes real-time LLM inference possible. Without HBM, AI responses would be 10–20x slower.",
    challenges:
      "HBM manufacturing is extraordinarily complex. Stacking and bonding 12 DRAM dies with 10,000 TSVs each requires yield rates that are difficult to achieve at scale. The supply chain is heavily concentrated in South Korea — SK Hynix and Samsung together control ~90% of HBM production. This concentration creates geopolitical risk and supply constraints that have contributed to GPU shortages.",
    funFact:
      "The HBM3e memory in a single NVIDIA H100 GPU has more memory bandwidth (3.35 TB/s) than the entire memory system of the world's fastest supercomputer from 2010. The entire internet's backbone traffic in 2010 was roughly 20 TB/s — about 6 H100s worth of memory bandwidth.",
    difficulty: "Advanced",
    relatedItems: ["gpu-ai-accelerator", "tpu", "networking-infiniband"],
    videos: [
      { title: "Secret of HBM — How to Make High Bandwidth Memory", url: "https://www.youtube.com/watch?v=y0l91S-_rwE", channel: "Samsung Semiconductor", duration: "8 min" },
      { title: "But What is a Neural Network?", url: "https://www.youtube.com/watch?v=aircAruvnKk", channel: "3Blue1Brown", duration: "19 min" },
      { title: "Stanford Seminar: NVIDIA's H100 GPU", url: "https://www.youtube.com/watch?v=MC223HlPdK0", channel: "Stanford University", duration: "60 min" },
    ],
  },
  {
    id: "quantum-amplifier",
    name: "Quantum-Limited Amplifier (TWPA)",
    category: "quantum",
    subcategory: "Measurement & Control",
    tagline: "Amplifying quantum signals without adding noise — a physics near-miracle.",
    description:
      "A Traveling Wave Parametric Amplifier (TWPA) is a superconducting device that amplifies the tiny microwave signals from qubits with noise levels approaching the fundamental quantum limit set by Heisenberg's uncertainty principle. Without it, qubit readout would be too noisy to be reliable.",
    icon: "📡",
    color: "#ec4899",
    estimatedCost: "$50,000 – $200,000",
    costNote: "Per unit. TWPAs are typically custom-fabricated by national labs or specialized vendors. Commercial availability is limited.",
    manufacturers: [
      { name: "Silent Waves", country: "Sweden", notable: "Commercial TWPA supplier; spin-off from Chalmers University" },
      { name: "Low Noise Factory", country: "Sweden", notable: "Cryogenic amplifiers for quantum computing" },
      { name: "MIT Lincoln Laboratory", country: "USA", notable: "TWPA development for government quantum programs" },
      { name: "NIST", country: "USA", notable: "Josephson parametric amplifier research and development" },
    ],
    specs: [
      { label: "Operating Temperature", value: "10–20 mK" },
      { label: "Frequency Range", value: "4–8 GHz" },
      { label: "Gain", value: "15–25 dB" },
      { label: "Added Noise", value: "~0.5 quanta (near quantum limit)" },
      { label: "Bandwidth", value: "3–4 GHz instantaneous" },
      { label: "Saturation Power", value: "-100 to -90 dBm" },
      { label: "Pump Frequency", value: "~8–10 GHz" },
    ],
    howItWorks:
      "A TWPA is a long, meandering superconducting transmission line loaded with Josephson junctions. A strong microwave pump tone drives the junctions into a nonlinear regime. Through a process called four-wave mixing, energy from the pump is transferred to amplify a weak signal traveling through the line. The amplification is phase-sensitive and can be tuned to add the minimum noise allowed by quantum mechanics — the standard quantum limit (SQL). This is fundamentally different from transistor amplifiers, which always add significant thermal noise.",
    whyItMatters:
      "Reading out a qubit state requires measuring a microwave signal with energy of roughly 10⁻²⁴ joules — far below what any room-temperature amplifier can detect without overwhelming noise. The TWPA sits at the coldest stage of the dilution refrigerator, amplifying the qubit signal before it travels up the coaxial cable chain to room-temperature electronics. Without near-quantum-limited amplification, qubit readout fidelity would be too low for reliable quantum computation.",
    challenges:
      "TWPAs require a strong pump tone that must be carefully isolated from the qubits to avoid driving unwanted transitions. The nonlinear behavior that enables amplification also causes intermodulation distortion when reading out multiple qubits simultaneously. Fabrication requires precise control of Josephson junction parameters across hundreds of junctions on a single chip. Commercial availability is still limited, making them a bottleneck for quantum computing system assembly.",
    funFact:
      "The quantum limit on amplifier noise — the standard quantum limit — is a direct consequence of Heisenberg's uncertainty principle. You cannot simultaneously measure both quadratures of a microwave field with arbitrary precision. A phase-sensitive amplifier like a TWPA can beat this limit for one quadrature by sacrificing information about the other — a trick called squeezing.",
    difficulty: "Expert",
    relatedItems: ["dilution-refrigerator", "superconducting-qubit-chip", "cryogenic-wiring"],
    videos: [
      { title: "How Qubits Really Work", url: "https://www.youtube.com/watch?v=HSM1GfukQMI", channel: "PBS Space Time", duration: "15 min" },
      { title: "The Taming of the Superconducting Qubit", url: "https://www.youtube.com/watch?v=nQ97tdofWM4", channel: "IBM Research", duration: "20 min" },
      { title: "What is a Dilution Fridge? | Quantum Science at Fermilab", url: "https://www.youtube.com/watch?v=HSClNB2pq0c", channel: "Fermilab", duration: "5 min" },
    ],
  },
  {
    id: "cryogenic-wiring",
    name: "Cryogenic Coaxial Wiring",
    category: "cryogenic",
    subcategory: "Interconnects",
    tagline: "The wires that connect room temperature to near absolute zero — without melting everything.",
    description:
      "Getting microwave control signals into a dilution refrigerator and qubit readout signals out requires a carefully engineered chain of coaxial cables, attenuators, filters, and isolators spanning temperature stages from 300 K down to 10 mK. This wiring is one of the most thermally and electrically challenging aspects of quantum computer engineering.",
    icon: "🔌",
    color: "#64748b",
    estimatedCost: "$5,000 – $50,000",
    costNote: "Per qubit channel, fully equipped. A 100-qubit system requires ~200–400 coaxial lines, making wiring costs $1M–$20M for a full system.",
    manufacturers: [
      { name: "Coax Co.", country: "Japan", notable: "SC (superconducting) series cryogenic coax; industry standard" },
      { name: "Radiall", country: "France", notable: "Cryogenic RF connectors and cables" },
      { name: "Keycom", country: "Japan", notable: "Cryogenic microwave components" },
      { name: "Delft Circuits", country: "Netherlands", notable: "Flexible cryogenic cables; spin-off from TU Delft" },
    ],
    specs: [
      { label: "Temperature Range", value: "300 K → 10 mK (7 stages)" },
      { label: "Attenuation per Line", value: "60–80 dB total (distributed)" },
      { label: "Thermal Conductance", value: "Minimized via NbTi or stainless steel" },
      { label: "Frequency Range", value: "DC – 18 GHz" },
      { label: "Lines per Qubit", value: "2–4 (drive, readout, flux bias, pump)" },
      { label: "Connector Type", value: "SMA, 2.92mm, or custom hermetic" },
      { label: "Isolator Insertion Loss", value: "<0.3 dB at 4 GHz" },
    ],
    howItWorks:
      "Each coaxial line entering the refrigerator must be thermally anchored at every temperature stage (300 K, 50 K, 4 K, 800 mK, 100 mK, 10 mK) to prevent heat from flowing down to the cold stage. Attenuators (precision resistive pads) are placed at each stage to absorb thermal noise from the warmer stages above — a 20 dB attenuator at 4 K reduces Johnson noise from 4 K to an equivalent noise temperature of 40 mK. Isolators (ferrite circulators) on the output lines allow qubit signals to pass upward while blocking thermal noise from propagating downward. Superconducting NbTi coax is used at the coldest stages to minimize both thermal conductance and signal loss.",
    whyItMatters:
      "The wiring problem is one of the most serious engineering challenges in scaling quantum computers. Each qubit requires 2–4 coaxial lines, each of which carries heat into the refrigerator. A 1,000-qubit system needs 2,000–4,000 lines — far more than current dilution refrigerators can accommodate without exceeding their cooling power. This is why companies like IBM and Google are investing heavily in cryogenic multiplexing, on-chip control electronics, and alternative interconnect technologies.",
    challenges:
      "Scaling is the central problem. Current dilution refrigerators can accommodate roughly 50–200 coaxial lines before the heat load exceeds the cooling power at the millikelvin stage. Proposed solutions include cryogenic CMOS control chips operating at 4 K (reducing the number of room-temperature lines), optical fiber links (low thermal conductance, high bandwidth), and superconducting flex cables. None of these are fully mature for production use.",
    funFact:
      "The total length of coaxial cable inside a large quantum computing dilution refrigerator can exceed 100 meters — all coiled and thermally anchored inside a cylinder roughly the size of a refrigerator. Each cable is thinner than a pencil and costs more per meter than gold.",
    difficulty: "Advanced",
    relatedItems: ["dilution-refrigerator", "superconducting-qubit-chip", "quantum-amplifier"],
    videos: [
      { title: "Dilution Refrigerators for Quantum Computing", url: "https://www.youtube.com/watch?v=qgwbuUXDyz4", channel: "Quantum Computing", duration: "8 min" },
      { title: "What is a Dilution Fridge? | Quantum Science at Fermilab", url: "https://www.youtube.com/watch?v=HSClNB2pq0c", channel: "Fermilab", duration: "5 min" },
      { title: "How This Machine Keeps Quantum Computers at 0.01 Kelvin", url: "https://www.youtube.com/watch?v=Ij19rtPg9hM", channel: "Real Engineering", duration: "10 min" },
    ],
  },
  {
    id: "networking-infiniband",
    name: "InfiniBand / NVLink Networking",
    category: "ai",
    subcategory: "AI Cluster Networking",
    tagline: "The nervous system of AI supercomputers — moving petabytes between GPUs.",
    description:
      "Training large AI models requires thousands of GPUs to communicate with each other at extremely high bandwidth and low latency. InfiniBand (from NVIDIA/Mellanox) and NVLink (NVIDIA's proprietary GPU interconnect) are the networking technologies that make this possible, enabling GPU clusters to behave as a single unified compute fabric.",
    icon: "🌐",
    color: "#06b6d4",
    estimatedCost: "$10,000 – $100,000 per switch port",
    costNote: "InfiniBand HDR/NDR switches: $50,000–$500,000 per switch. NVLink switches for NVL72 configurations: included in DGX system cost (~$2M–$3M per DGX H100).",
    manufacturers: [
      { name: "NVIDIA (Mellanox)", country: "USA", notable: "InfiniBand NDR (400 Gb/s); NVSwitch; acquired Mellanox for $6.9B in 2020" },
      { name: "Broadcom", country: "USA", notable: "Ethernet switching for AI clusters; Tomahawk series" },
      { name: "Arista Networks", country: "USA", notable: "400G/800G Ethernet for AI data centers" },
    ],
    specs: [
      { label: "InfiniBand NDR Speed", value: "400 Gb/s per port" },
      { label: "NVLink 4.0 Bandwidth", value: "900 GB/s bidirectional (H100)" },
      { label: "NVSwitch 3.0 Bandwidth", value: "13.6 TB/s total" },
      { label: "Latency (InfiniBand)", value: "<1 microsecond" },
      { label: "NVL72 Configuration", value: "72 H100 GPUs, fully connected" },
      { label: "GPT-4 Training Cluster", value: "~25,000 A100s on InfiniBand" },
      { label: "RDMA Support", value: "Yes — bypasses CPU for direct memory transfer" },
    ],
    howItWorks:
      "Training a neural network across thousands of GPUs requires frequent synchronization of gradients — the updates to model weights computed by each GPU during backpropagation. This is called AllReduce: every GPU must sum its gradient with every other GPU's gradient and receive the result. With 25,000 GPUs, this means moving hundreds of gigabytes of data every few seconds. InfiniBand uses Remote Direct Memory Access (RDMA) to transfer data directly between GPU memory across the network without involving the CPU, achieving sub-microsecond latency. NVLink connects GPUs within a single server at 900 GB/s — 10x faster than PCIe — enabling them to share memory as if they were a single device.",
    whyItMatters:
      "Network bandwidth is often the limiting factor in large-scale AI training. A GPU cluster where GPUs spend 30% of their time waiting for network synchronization is effectively 30% less powerful. NVIDIA's acquisition of Mellanox (InfiniBand) and development of NVLink/NVSwitch was a strategic move to control the entire AI compute stack — from the GPU to the network fabric. This vertical integration is a key reason NVIDIA dominates the AI hardware market.",
    challenges:
      "InfiniBand infrastructure is expensive and proprietary. Large clusters require complex fat-tree or dragonfly network topologies with thousands of cables and switches. The cabling alone for a 10,000-GPU cluster can cost $10M–$50M. Ethernet is a cheaper alternative but has higher latency. The industry is actively developing 800G Ethernet with RDMA (RoCE) as a more open alternative to InfiniBand.",
    funFact:
      "The NVL72 — NVIDIA's largest NVLink configuration — connects 72 H100 GPUs into a single logical unit with 13.6 TB/s of total switch bandwidth. The 72 GPUs together have 5.76 TB of HBM3 memory that can be accessed by any GPU in the cluster at full bandwidth. It's essentially a single computer with 5.76 TB of RAM and 57.6 petaflops of FP8 performance.",
    difficulty: "Advanced",
    relatedItems: ["gpu-ai-accelerator", "tpu", "hbm-memory"],
    videos: [
      { title: "Stanford Seminar: NVIDIA's H100 GPU", url: "https://www.youtube.com/watch?v=MC223HlPdK0", channel: "Stanford University", duration: "60 min" },
      { title: "But What is a Neural Network?", url: "https://www.youtube.com/watch?v=aircAruvnKk", channel: "3Blue1Brown", duration: "19 min" },
      { title: "Quantum Computing Explained: Google vs Microsoft vs IBM", url: "https://www.youtube.com/watch?v=7YDKvRkMpjw", channel: "Tech Explained", duration: "12 min" },
    ],
  },
];

export const hardwareCategories = [
  { id: "all", label: "All Hardware", color: "#6b7280" },
  { id: "quantum", label: "Quantum Processors", color: "#6B21FF" },
  { id: "ai", label: "AI Hardware", color: "#10b981" },
  { id: "cryogenic", label: "Cryogenic Systems", color: "#0ea5e9" },
  { id: "photonic", label: "Photonics", color: "#f97316" },
];

export function getHardwareItem(id: string): HardwareItem | undefined {
  return hardwareItems.find((item) => item.id === id);
}
