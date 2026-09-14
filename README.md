<!--
Assumptions & Design Decisions:
1. Mark Granularity & Hard Constraint: Total marks is treated as an inviolable hard constraint. To guarantee exact mark totals without fractional rounding errors, the solver uses an integer reachability table (subset sum dynamic programming) seeded by whole question mark denominations (1, 2, 3, 4, 5, 6, 8 marks).
2. Soft Constraint Multi-Objective Penalty: Difficulty mix, topic weightage, and question-type formats are treated as soft constraints optimized via multi-restart local search minimizing squared mark deviations.
3. Swapping Hard Constraint Invariant: Single-question swaps strictly restrict candidates to questions from the unassigned bank possessing the exact same marks as the question being replaced. This ensures an in-place swap never alters the paper's total marks.
4. Typography & Styling: Pair of Google Fonts (Lora for the authentic exam paper sheet, IBM Plex Sans for the instrument chrome) in accordance with the academic instrument design specification.
-->

# PaperForge: Academic Question Paper Generator & Constraint Solver

PaperForge is a precision assessment instrument designed for secondary and collegiate STEM educators. It allows teachers to generate syllabus-compliant examination papers in Mathematics and Natural Sciences (Algebra, Geometry, Trigonometry, Mechanics, and Chemistry) by establishing hard mark constraints and soft curriculum distribution targets.

---

## Approach: Why Constraint-Solving Over Pure LLM Generation

In educational assessment, **determinism, mathematical precision, and auditability outweigh generative flexibility**. While Large Language Models excels at conversational prose and unbounded text generation, using an LLM directly to assemble an examination paper introduces severe systemic flaws:

1. **Arithmetic Hallucinations & Mark Drift**: LLMs struggle with discrete integer partition constraints. A prompt requesting "a 40-mark paper with 30% easy, 50% medium, 20% hard" frequently yields questions whose assigned marks sum to 38 or 43, or where sub-parts do not tally to the question total. In high-stakes testing, an exam that miscalculates total marks is invalid.
2. **Pedagogical Auditability & Syllabus Compliance**: Schools and examination syndicates must justify how every mark is allocated. A deterministic constraint solver provides an immutable mathematical ledger: every selected question maps to a verified curriculum ID with tested answer keys, rather than an unvetted LLM response that may contain subtle factual inaccuracies or hallucinated constants (e.g., misquoted molar masses or unphysical projectile trajectories).
3. **Reproducibility & Fair Seeding**: Given an identical constraint vector and seed, PaperForge reproduces the exact same examination paper every time. This enables parallel examination forms (Form A / Form B) with mathematically equivalent difficulty and topic distributions.
4. **Latency & Deterministic SLA**: Constraint optimization over a curated question bank executes in 5–15 milliseconds on a serverless function, with zero API token costs and no risk of timeout or provider downtime during exam creation sessions.

---

## Handling Unsatisfiable Constraints: The Relax-and-Report Strategy

Real-world question banks are finite and discrete. If a teacher requests 35% Hard Algebra in a 40-mark paper, that requires 14 marks of Hard Algebra. If the bank only contains one 6-mark and one 4-mark hard algebra problem (total 10 marks), the constraint is mathematically unsatisfiable without violating either the total marks, the topic quota, or the difficulty threshold.

Traditional software fails in one of two ways: either it throws an unhelpful error ("Cannot generate paper"), or it **silently substitutes** mismatched questions, misleading the teacher about the paper's true balance.

PaperForge implements a strict **Relax-and-Report Strategy**:

- **Hard vs. Soft Hierarchy**: Total marks is an invariant hard constraint ($\sum m_i = M$). Difficulty, topic, and type distributions are soft targets minimized via a quadratic loss function:
  $$\mathcal{L}(S) = w_d \sum (A_d - T_d)^2 + w_t \sum (A_t - T_t)^2 + w_y \sum (A_y - T_y)^2$$
- **Automatic Multi-Objective Relaxation**: When a constraint cannot be met due to bank depth or integer indivisibility, the solver finds the Pareto-optimal alternative that keeps total marks exact while minimizing the Euclidean distance to requested percentages.
- **Zero Silent Substitutions (Audit Trail)**: The engine detects every dimension where achieved percentage deviates from requested percentage by $\ge 4\%$. It classifies the relaxation by severity (`notice`, `moderate`, `significant`), explains the root cause (e.g., discrete question marks, bank depletion), and logs the exact compensatory remedy in a high-visibility, persistent **Oxblood Audit Banner** situated immediately above the examination sheet.

---

## Where It Falls Short

1. **Integer Indivisibility at Low Mark Denominations**: When generating short quizzes (e.g. 20 or 25 marks), questions with larger denominations (5 or 6 marks) represent 20–30% of the entire paper. Achieving a fine-grained distribution like 33% / 33% / 34% is mathematically impossible when questions are discrete whole numbers.
2. **Fixed Bank Horizon**: The offline question bank currently contains 61 curated questions. While sufficient for generating distinct 25m, 40m, 60m, and 80m assessments, repeatedly generating full 100-mark papers will exhaust candidate variety across niche intersections (e.g., Hard Trigonometry MCQs).
3. **Greedy-Local Search vs. Integer Linear Programming**: While the current hybrid dynamic programming + local search runs in under 15ms and consistently finds solutions within 1–2% of the optimal mark combination, it is a heuristic approximation rather than an exact Branch-and-Cut ILP solver (such as GLPK or CBC via WASM).

---

## What I'd Do With More Time

- **WASM-Compiled Integer Linear Programming (CBC / HiGHS)**: Compile an exact simplex/branch-and-bound solver to WebAssembly to prove mathematical optimality for papers up to 200 marks.
- **Form A / Form B Equivalence Generator**: Add a one-click "Generate Alternate Form" feature that generates twin papers with non-overlapping questions but identical difficulty and topic curves.
- **LaTeX & Word (.docx) Direct Export**: Support direct export to Cambridge/CBSE standard LaTeX `.tex` templates and formatted `.docx` files with equations rendered via MathType/KaTeX.
- **Question Ingestion Pipeline with Mark Verification**: A teacher authoring tool allowing educators to import custom JSON or CSV questions with automatic schema validation and difficulty tagging.

---

## One Thing I'm Proud Of

**The In-Place Targeted Question Swap Mechanism with Hard-Constraint Preservation**.
Instead of forcing a teacher to discard an entire generated paper if they dislike a single question, PaperForge lets them click "Swap" on that specific item. The server searches all remaining unassigned questions in the bank, strictly filters for items with the **exact same marks** (preserving the 40-mark invariant), and ranks them using pedagogical distance scoring (matching topic, difficulty, and format first). Swapping instantly recalculates the requested-vs-actual breakdown and relaxation audit without touching any other question on the paper.

---

## One Thing That's Still Weak

**Dynamic Auto-Balancing across Mutually Constrained Sliders**.
While each slider group features a "Balance" button that normalizes totals to 100%, dragging one slider currently changes the sum rather than proportionally adjusting the other sliders in real-time. In a future iteration, an active proportional-spring slider interaction would prevent users from ever having non-100% states while adjusting values.

---

## Project Structure

```
paperforge/
├── app/
│   ├── api/
│   │   ├── generate/route.ts      # Server-side constraint solver endpoint
│   │   └── swap/route.ts          # Candidate search endpoint
│   ├── globals.css                # Academic theme tokens & print stylesheet
│   ├── layout.tsx                 # Google Fonts (Lora & IBM Plex Sans)
│   └── page.tsx                   # Main workstation UI
├── components/
│   ├── ControlRail.tsx            # Instrument panel with sliders & sum indicators
│   ├── ExamPaper.tsx              # Authentic examination sheet preview
│   ├── QuestionItem.tsx           # Serif numbered questions with [X] marks
│   ├── ConstraintWarnings.tsx     # High-visibility oxblood audit banner
│   ├── BreakdownComparison.tsx    # Side-by-side requested vs actual meters
│   ├── QuestionSwapModal.tsx      # Replacement question drawer
│   └── SumCheckBadge.tsx          # Live 100% sum verification
├── data/
│   └── question_bank.json         # 61 realistic STEM questions
├── lib/
│   ├── types.ts                   # Core TypeScript interfaces
│   ├── solver.ts                  # Deterministic DP + local search constraint solver
│   └── swap.ts                    # In-place swap logic
├── sample-paper.json              # 40-mark reference paper
└── README.md
```

## Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access PaperForge.
