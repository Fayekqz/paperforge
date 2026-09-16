# PaperForge — Smart Question Paper Generator

A lightweight, deterministic question paper generator and constraint optimizer built for secondary and collegiate STEM teachers (Mathematics, Physics, Chemistry).

🌐 **Live Deployed Application:** [https://paperforge-lyart.vercel.app/](https://paperforge-lyart.vercel.app/)

---

## 1. Approach & Why

### Deterministic Constraint Solver vs. Pure LLM Generation

For educational assessments, mathematical accuracy, syllabus compliance, and auditability are non-negotiable. Using an unconstrained LLM directly to assemble an examination paper has well-known failure modes:

1. **Mark Drift & Arithmetic Errors**: Large Language Models frequently miscalculate discrete integer partitions (e.g. producing 43 marks when 40 was requested, or sub-parts that don't add up to the question total).
2. **Pedagogical Auditability**: Educators need to know exactly which curriculum items are tested and why specific tradeoffs were made. A deterministic constraint solver provides a clear, verifiable record for every question.
3. **Speed & Reliability**: The local Dynamic Programming subset-sum + local search solver runs in **5–15ms**, with zero API token overhead, zero rate limits, and reliable offline operation.

To give teachers maximum flexibility, PaperForge supports two complementary generation engines:
- **Fast Solver (Default)**: Combines a curated question bank with a dynamic parameterized question generator using subset-sum DP reachability and simulated-annealing local search.
- **AI / LLM Mode**: Synthesizes novel questions with LaTeX formatting and custom teacher instructions when open-ended novelty is preferred.

---

## 2. Handling the "Constraints Don't Fit" Problem

Question banks are discrete and finite. If a teacher requests 35% Hard Algebra on a 40-mark paper (14 marks required), but the question pool only has 10 marks of Hard Algebra, satisfying all conditions simultaneously is mathematically impossible.

Instead of crashing or silently substituting mismatched questions, PaperForge uses a **Relax-and-Report Strategy**:

- **Hard Constraint Invariant**: Total marks is strictly enforced ($\sum m_i = M$). The total will never drift or round off.
- **Multi-Objective Loss Minimization**: Difficulty, topic, and question-type targets are treated as soft constraints minimized via quadratic loss:
  $$\mathcal{L} = w_d \sum (A_d - T_d)^2 + w_t \sum (A_t - T_t)^2 + w_y \sum (A_y - T_y)^2$$
- **Transparent Audit Banner**: When achieved marks deviate from requested marks by $\ge 4\%$, PaperForge highlights the exact delta, explains the root cause (e.g., discrete mark values or pool limitations), and notes the compensatory adjustments made to preserve total marks.

---

## 3. Targeted Question Swap (Without Redoing the Paper)

Teachers can click the **Swap** button on any individual question:
- The system filters candidate questions having the **exact same marks**, guaranteeing the total paper marks remain unchanged.
- Candidates are ranked by pedagogical similarity (matching topic, difficulty, and format first).
- Swapping recalculates the breakdown and audit warnings in real time without altering any other question on the paper.

---

## 4. What's Weak & What I'd Do With More Time

### Where It Falls Short:
- **Integer Indivisibility at Low Mark Scales**: In short 20–25 mark quizzes, higher-value questions (5–6 marks) make up large percentages of the paper, making fine-grained percentage targets (e.g., 33%/33%/34%) approximate.
- **Slider Proportional Coupling**: Sliders currently change individually and provide a one-click "Balance" button. Proportional spring-linked sliders would improve the UX when adjusting multi-dimensional percentages.

### What I'd Do With More Time:
1. **WASM-Compiled Integer Linear Programming (HiGHS / CBC)**: Formalize the solver into an exact branch-and-cut ILP model in WebAssembly for guaranteed mathematical optimality on large (100–200m) papers.
2. **Parallel Form Equivalence (Form A / Form B)**: One-click generation of twin examination papers with non-overlapping questions but identical difficulty and topic curves.
3. **LaTeX & DOCX Export**: Direct download of formatted `.tex` and `.docx` exam sheets ready for printing.

---

## 5. One Thing I'm Proud Of & One Thing That's Still Weak

- **Proud Of**: The **in-place targeted question swap mechanism**. It keeps the 40-mark invariant intact while letting teachers customize individual questions seamlessly.
- **Still Weak**: Dynamic multi-slider auto-balancing when dragging individual sliders without clicking "Balance".

---

## Quick Start & Deployment

### Live Production Deployment
- **URL:** [https://paperforge-lyart.vercel.app/](https://paperforge-lyart.vercel.app/)

### Prerequisites
- Node.js (v18+)
- npm

### Run Locally
```bash
./start.sh
# or
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Run Test Suite
```bash
npx tsx scripts/verify-all.ts
```
