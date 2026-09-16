import { Question, Topic, Difficulty, QuestionType } from './types';

// Helper for random integer in [min, max]
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper to pick random element
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generator templates for dynamic STEM questions with rich LaTeX symbols.
 */
export function generateDynamicQuestionPool(countPerCategory = 4): Question[] {
  const generated: Question[] = [];
  let idCounter = 1;

  const nextId = (prefix: string) => `dyn_${prefix}_${Date.now()}_${idCounter++}`;

  // ==========================================
  // 1. ALGEBRA GENERATORS
  // ==========================================
  // Easy Algebra MCQ
  for (let i = 0; i < countPerCategory; i++) {
    const r1 = randInt(1, 6);
    const r2 = randInt(r1 + 1, 9);
    const b = -(r1 + r2);
    const c = r1 * r2;
    const signB = b < 0 ? `- ${Math.abs(b)}` : `+ ${b}`;
    generated.push({
      id: nextId('alg_easy_mcq'),
      topic: 'Algebra',
      subtopic: 'Quadratic Equations',
      difficulty: 'easy',
      type: 'MCQ',
      marks: 1,
      text: `Find the real roots of the quadratic equation $x^2 ${signB}x + ${c} = 0$.`,
      options: [
        { key: 'A', text: `$x = -${r1},\\ x = -${r2}$` },
        { key: 'B', text: `$x = ${r1},\\ x = ${r2}$` },
        { key: 'C', text: `$x = ${r1 - 1},\\ x = ${r2 + 1}$` },
        { key: 'D', text: `$x = ${r1 * 2},\\ x = ${r2}$` },
      ],
      correctOption: 'B',
      markingGuide: `Factorization gives $(x - ${r1})(x - ${r2}) = 0 \\implies x = ${r1}, ${r2}$.`,
    });
  }

  // Easy Algebra Short Answer
  for (let i = 0; i < countPerCategory; i++) {
    const a = randInt(2, 8);
    const d = randInt(3, 7);
    const n = randInt(10, 25);
    const tn = a + (n - 1) * d;
    generated.push({
      id: nextId('alg_easy_sa'),
      topic: 'Algebra',
      subtopic: 'Arithmetic Progressions',
      difficulty: 'easy',
      type: 'Short Answer',
      marks: 2,
      text: `Given the arithmetic sequence $${a},\\ ${a + d},\\ ${a + 2 * d},\\ ${a + 3 * d},\\dots$, calculate the $${n}^{\\text{th}}$ term $T_{${n}}$.`,
      markingGuide: `Using $T_n = a + (n-1)d$: with $a = ${a}$ and $d = ${d}$, $T_{${n}} = ${a} + (${n}-1)(${d}) = ${tn}$.`,
    });
  }

  // Medium Algebra Short Answer
  for (let i = 0; i < countPerCategory; i++) {
    const k = randInt(2, 5);
    const m = randInt(1, 4);
    const x = randInt(2, 6);
    const y = randInt(1, 5);
    const eq1Val = k * x + y;
    const eq2Val = m * x + 2 * y;
    generated.push({
      id: nextId('alg_med_sa'),
      topic: 'Algebra',
      subtopic: 'System of Linear Equations',
      difficulty: 'medium',
      type: 'Short Answer',
      marks: 3,
      text: `Solve the following simultaneous system for $x$ and $y$:\n$$\\begin{cases} ${k}x + y = ${eq1Val} \\\\[4pt] ${m}x + 2y = ${eq2Val} \\end{cases}$$`,
      markingGuide: `Eliminate $y$: Multiply first equation by $2$: $${2 * k}x + 2y = ${2 * eq1Val}$. Subtract second equation: $(${2 * k} - ${m})x = ${2 * eq1Val - eq2Val} \\implies x = ${x}$. Substitute to find $y = ${y}$.`,
    });
  }

  // Hard Algebra Long Answer
  for (let i = 0; i < countPerCategory; i++) {
    const p = randInt(2, 4);
    const q = randInt(3, 6);
    generated.push({
      id: nextId('alg_hard_la'),
      topic: 'Algebra',
      subtopic: 'Polynomial Roots & Calculus',
      difficulty: 'hard',
      type: 'Long Answer',
      marks: 6,
      text: `Consider the cubic function $f(x) = x^3 - ${p + q}x^2 + ${p * q}x$.\n(a) Determine the coordinates of all stationary points of $f(x)$ using $\\frac{df}{dx} = 0$.\n(b) Using the second derivative test $\\frac{d^2f}{dx^2}$, classify each stationary point as a local maximum or local minimum.\n(c) Evaluate the definite integral $\\int_0^{${p}} f(x)\\,dx$.`,
      markingGuide: `(a) $f'(x) = 3x^2 - ${2 * (p + q)}x + ${p * q} = 0$, solve for critical values.\n(b) Compute $f''(x) = 6x - ${2 * (p + q)}$ and test signs.\n(c) $\\int_0^{${p}} (x^3 - ${p + q}x^2 + ${p * q}x) dx = \\left[ \\frac{x^4}{4} - \\frac{${p + q}x^3}{3} + \\frac{${p * q}x^2}{2} \\right]_0^{${p}}$.`,
    });
  }

  // ==========================================
  // 2. GEOMETRY GENERATORS
  // ==========================================
  // Easy Geometry MCQ
  for (let i = 0; i < countPerCategory; i++) {
    const r = randInt(3, 14);
    const area = r * r;
    generated.push({
      id: nextId('geom_easy_mcq'),
      topic: 'Geometry',
      subtopic: 'Circle Geometry',
      difficulty: 'easy',
      type: 'MCQ',
      marks: 1,
      text: `A circle has a radius of $r = ${r}\\,\\text{cm}$. What is its exact area in terms of $\\pi$?`,
      options: [
        { key: 'A', text: `$${2 * r}\\pi\\,\\text{cm}^2$` },
        { key: 'B', text: `$${area}\\pi\\,\\text{cm}^2$` },
        { key: 'C', text: `$${area * 2}\\pi\\,\\text{cm}^2$` },
        { key: 'D', text: `$${r * 3}\\pi\\,\\text{cm}^2$` },
      ],
      correctOption: 'B',
      markingGuide: `Area formula $A = \\pi r^2 = \\pi (${r})^2 = ${area}\\pi\\,\\text{cm}^2$.`,
    });
  }

  // Medium Geometry Short Answer
  for (let i = 0; i < countPerCategory; i++) {
    const a = randInt(5, 12);
    const b = randInt(6, 15);
    const hypSq = a * a + b * b;
    generated.push({
      id: nextId('geom_med_sa'),
      topic: 'Geometry',
      subtopic: 'Coordinate Geometry & Vectors',
      difficulty: 'medium',
      type: 'Short Answer',
      marks: 3,
      text: `In a 2D Cartesian plane, point $P$ has coordinates $(${a}, 0)$ and point $Q$ has coordinates $(0, ${b})$.\n(a) Write the displacement vector $\\vec{PQ}$ in component form.\n(b) Calculate the exact Euclidean length $|\\vec{PQ}| = \\sqrt{\\Delta x^2 + \\Delta y^2}$.`,
      markingGuide: `(a) $\\vec{PQ} = (0 - ${a})\\hat{i} + (${b} - 0)\\hat{j} = -${a}\\hat{i} + ${b}\\hat{j}$.\n(b) $|\\vec{PQ}| = \\sqrt{(-${a})^2 + ${b}^2} = \\sqrt{${hypSq}}$.`,
    });
  }

  // Hard Geometry Long Answer
  for (let i = 0; i < countPerCategory; i++) {
    const r = randInt(4, 9);
    const h = randInt(10, 20);
    generated.push({
      id: nextId('geom_hard_la'),
      topic: 'Geometry',
      subtopic: 'Solid Mensuration & Optimization',
      difficulty: 'hard',
      type: 'Long Answer',
      marks: 5,
      text: `A right circular cylinder of radius $r$ and height $h$ has a total surface area $A = 2\\pi r^2 + 2\\pi rh$ and volume $V = \\pi r^2 h$.\n(a) If the volume is fixed at $V = ${Math.round(Math.PI * r * r * h)}\\,\\text{cm}^3$, express $A(r)$ purely as a function of $r$.\n(b) Show that $\\frac{dA}{dr} = 0$ when $h = 2r$.\n(c) Find the optimal dimensions $r$ and $h$ that minimize total surface area.`,
      markingGuide: `(a) Substitute $h = \\frac{V}{\\pi r^2}$ into $A(r) = 2\\pi r^2 + \\frac{2V}{r}$.\n(b) $\\frac{dA}{dr} = 4\\pi r - \\frac{2V}{r^2} = 0 \\implies 4\\pi r^3 = 2(\\pi r^2 h) \\implies h = 2r$.\n(c) Substitute into volume equation to evaluate $r = \\left(\\frac{V}{2\\pi}\\right)^{1/3}$.`,
    });
  }

  // ==========================================
  // 3. TRIGONOMETRY GENERATORS
  // ==========================================
  // Easy Trigonometry MCQ
  for (let i = 0; i < countPerCategory; i++) {
    const angle = pick([30, 45, 60]);
    const valMap: Record<number, { sin: string; cos: string; tan: string }> = {
      30: { sin: '\\frac{1}{2}', cos: '\\frac{\\sqrt{3}}{2}', tan: '\\frac{1}{\\sqrt{3}}' },
      45: { sin: '\\frac{1}{\\sqrt{2}}', cos: '\\frac{1}{\\sqrt{2}}', tan: '1' },
      60: { sin: '\\frac{\\sqrt{3}}{2}', cos: '\\frac{1}{2}', tan: '\\sqrt{3}' },
    };
    generated.push({
      id: nextId('trig_easy_mcq'),
      topic: 'Trigonometry',
      subtopic: 'Exact Trigonometric Values',
      difficulty: 'easy',
      type: 'MCQ',
      marks: 1,
      text: `What is the exact value of $\\sin(${angle}^\\circ)$?`,
      options: [
        { key: 'A', text: `$${valMap[30].sin}$` },
        { key: 'B', text: `$${valMap[60].sin}$` },
        { key: 'C', text: `$${valMap[45].sin}$` },
        { key: 'D', text: `$1$` },
      ],
      correctOption: angle === 30 ? 'A' : angle === 60 ? 'B' : 'C',
      markingGuide: `From the standard special angle ratios, $\\sin(${angle}^\\circ) = ${valMap[angle].sin}$.`,
    });
  }

  // Medium Trigonometry Short Answer
  for (let i = 0; i < countPerCategory; i++) {
    const a = randInt(2, 5);
    const b = randInt(1, 4);
    generated.push({
      id: nextId('trig_med_sa'),
      topic: 'Trigonometry',
      subtopic: 'Trigonometric Equations & Identities',
      difficulty: 'medium',
      type: 'Short Answer',
      marks: 3,
      text: `Solve the trigonometric equation $2\\cos^2\\theta + \\cos\\theta - 1 = 0$ for $0^\\circ \\le \\theta \\le 360^\\circ$. Show all steps utilizing the Pythagorean identity $\\sin^2\\theta + \\cos^2\\theta = 1$.`,
      markingGuide: `Factor quadratic: $(2\\cos\\theta - 1)(\\cos\\theta + 1) = 0 \\implies \\cos\\theta = \\frac{1}{2}$ or $\\cos\\theta = -1$.\nFor $\\cos\\theta = \\frac{1}{2}$, $\\theta = 60^\\circ, 300^\\circ$.\nFor $\\cos\\theta = -1$, $\\theta = 180^\\circ$. Solutions: $\\theta \\in \\{60^\\circ, 180^\\circ, 300^\\circ\\}$.`,
    });
  }

  // Hard Trigonometry Long Answer
  for (let i = 0; i < countPerCategory; i++) {
    const speed = randInt(15, 35);
    const angle = randInt(30, 60);
    generated.push({
      id: nextId('trig_hard_la'),
      topic: 'Trigonometry',
      subtopic: 'Sine/Cosine Rule & Surveying',
      difficulty: 'hard',
      type: 'Long Answer',
      marks: 5,
      text: `In $\\triangle ABC$, side $a = ${randInt(8, 15)}\\,\\text{cm}$, side $b = ${randInt(12, 20)}\\,\\text{cm}$, and included angle $\\angle C = ${randInt(40, 80)}^\\circ$.\n(a) Use the Law of Cosines $c^2 = a^2 + b^2 - 2ab\\cos(C)$ to calculate length $c$.\n(b) Use the Law of Sines $\\frac{\\sin A}{a} = \\frac{\\sin C}{c}$ to determine angle $\\angle A$.\n(c) Find the total area of the triangle using $\\text{Area} = \\frac{1}{2}ab\\sin(C)$.`,
      markingGuide: `(a) Apply $c = \\sqrt{a^2 + b^2 - 2ab\\cos(C)}$.\n(b) Apply $\\sin A = \\frac{a\\sin(C)}{c} \\implies A = \\arcsin(\\dots)$.\n(c) Compute $\\frac{1}{2}ab\\sin(C)$.`,
    });
  }

  // ==========================================
  // 4. PHYSICS-MECHANICS GENERATORS
  // ==========================================
  // Easy Physics MCQ
  for (let i = 0; i < countPerCategory; i++) {
    const m = randInt(2, 10);
    const a = randInt(2, 6);
    const force = m * a;
    generated.push({
      id: nextId('phys_easy_mcq'),
      topic: 'Physics-Mechanics',
      subtopic: "Newton's Second Law",
      difficulty: 'easy',
      type: 'MCQ',
      marks: 1,
      text: `A constant net horizontal force $\\vec{F}$ is applied to a mass $m = ${m}\\,\\text{kg}$, producing an acceleration $\\vec{a} = ${a}\\,\\text{m/s}^2\\,\\hat{i}$. What is the magnitude of the force $|\\vec{F}|$?`,
      options: [
        { key: 'A', text: `$${force / 2}\\,\\text{N}$` },
        { key: 'B', text: `$${force}\\,\\text{N}$` },
        { key: 'C', text: `$${force + m}\\,\\text{N}$` },
        { key: 'D', text: `$${force * 2}\\,\\text{N}$` },
      ],
      correctOption: 'B',
      markingGuide: `By Newton's Second Law: $\\vec{F} = m\\vec{a} \\implies |\\vec{F}| = (${m})(${a}) = ${force}\\,\\text{N}$.`,
    });
  }

  // Medium Physics Short Answer
  for (let i = 0; i < countPerCategory; i++) {
    const u = randInt(10, 25);
    const t = randInt(3, 8);
    const g = 9.8;
    const v = (u - g * t).toFixed(1);
    generated.push({
      id: nextId('phys_med_sa'),
      topic: 'Physics-Mechanics',
      subtopic: 'Kinematics & Projectile Motion',
      difficulty: 'medium',
      type: 'Short Answer',
      marks: 3,
      text: `A projectile is launched vertically upward from ground level with initial velocity $\\vec{v}_0 = ${u}\\,\\text{m/s}\\,\\hat{j}$. Take gravitational acceleration $g = 9.8\\,\\text{m/s}^2$.\n(a) Determine the time $t_{\\text{peak}}$ required to reach the maximum height where $\\vec{v}(t) = 0$.\n(b) Using $v^2 = u^2 - 2g\\Delta y$, calculate the maximum peak altitude $H_{\\text{max}}$.`,
      markingGuide: `(a) $v = u - gt \\implies 0 = ${u} - 9.8t \\implies t_{\\text{peak}} = \\frac{${u}}{9.8} = ${(u / 9.8).toFixed(2)}\\,\\text{s}$.\n(b) $H_{\\text{max}} = \\frac{u^2}{2g} = \\frac{${u * u}}{19.6} = ${((u * u) / 19.6).toFixed(2)}\\,\\text{m}$.`,
    });
  }

  // Hard Physics Long Answer
  for (let i = 0; i < countPerCategory; i++) {
    const m1 = randInt(2, 6);
    const m2 = randInt(4, 9);
    const mu = (randInt(15, 35) / 100).toFixed(2);
    generated.push({
      id: nextId('phys_hard_la'),
      topic: 'Physics-Mechanics',
      subtopic: 'Friction, Tension & Energy Conservation',
      difficulty: 'hard',
      type: 'Long Answer',
      marks: 6,
      text: `A block of mass $m_1 = ${m1}\\,\\text{kg}$ rests on a rough horizontal surface with coefficient of kinetic friction $\\mu_k = ${mu}$. It is connected via an ideal massless inextensible string over a frictionless pulley to a hanging mass $m_2 = ${m2}\\,\\text{kg}$.\n(a) Draw the free-body diagram equations for both masses and express the friction force $f_k = \\mu_k m_1 g$.\n(b) Derive an expression for the linear acceleration $a = \\frac{(m_2 - \\mu_k m_1)g}{m_1 + m_2}$ and calculate its numerical value ($g = 9.8\\,\\text{m/s}^2$).\n(c) Determine the string tension $T = m_2(g - a)$ in Newtons.`,
      markingGuide: `(a) $f_k = (${mu})(${m1})(9.8) = ${(parseFloat(mu) * m1 * 9.8).toFixed(2)}\\,\\text{N}$.\n(b) $a = \\frac{(${m2} - ${mu} \\times ${m1}) \\times 9.8}{${m1 + m2}} = \\frac{(${(m2 - parseFloat(mu) * m1).toFixed(2)}) \\times 9.8}{${m1 + m2}} = ${(((m2 - parseFloat(mu) * m1) * 9.8) / (m1 + m2)).toFixed(2)}\\,\\text{m/s}^2$.\n(c) $T = ${m2}(9.8 - a)$.`,
    });
  }

  // ==========================================
  // 5. CHEMISTRY-BASICS GENERATORS
  // ==========================================
  // Easy Chemistry MCQ
  for (let i = 0; i < countPerCategory; i++) {
    const ph = randInt(1, 4);
    generated.push({
      id: nextId('chem_easy_mcq'),
      topic: 'Chemistry-Basics',
      subtopic: 'Acids, Bases & pH Calculations',
      difficulty: 'easy',
      type: 'MCQ',
      marks: 1,
      text: `A solution of hydrochloric acid $\\text{HCl}_{(aq)}$ has a hydrogen ion concentration $[\\text{H}^+] = 1.0 \\times 10^{-${ph}}\\,\\text{mol/L}$. What is the $\\text{pH} = -\\log_{10}[\\text{H}^+]$ of the solution?`,
      options: [
        { key: 'A', text: `$\\text{pH} = ${ph}$ (Strongly Acidic)` },
        { key: 'B', text: `$\\text{pH} = ${14 - ph}$ (Basic)` },
        { key: 'C', text: `$\\text{pH} = 7.0$ (Neutral)` },
        { key: 'D', text: `$\\text{pH} = ${ph + 3}$` },
      ],
      correctOption: 'A',
      markingGuide: `$\\text{pH} = -\\log_{10}(10^{-${ph}}) = ${ph}$.`,
    });
  }

  // Medium Chemistry Short Answer
  for (let i = 0; i < countPerCategory; i++) {
    const mass = randInt(10, 50);
    const mw = 40; // NaOH
    generated.push({
      id: nextId('chem_med_sa'),
      topic: 'Chemistry-Basics',
      subtopic: 'Stoichiometry & Molar Mass',
      difficulty: 'medium',
      type: 'Short Answer',
      marks: 3,
      text: `Calculate the number of moles in $${mass}\\,\\text{g}$ of sodium hydroxide $\\text{NaOH}$ (Molar masses: $\\text{Na} = 23.0\\,\\text{g/mol}$, $\\text{O} = 16.0\\,\\text{g/mol}$, $\\text{H} = 1.0\\,\\text{g/mol}$). If this is dissolved in $250\\,\\text{mL}$ of distilled water, determine the molar concentration $C = \\frac{n}{V}\\,\\text{mol/L}$.`,
      markingGuide: `Molar mass $M = 23 + 16 + 1 = 40.0\\,\\text{g/mol}$.\n$n = \\frac{${mass}}{40.0} = ${(mass / 40).toFixed(3)}\\,\\text{mol}$.\nVolume $V = 0.250\\,\\text{L} \\implies C = \\frac{${(mass / 40).toFixed(3)}}{0.250} = ${((mass / 40) / 0.25).toFixed(2)}\\,\\text{mol/L}$.`,
    });
  }

  // Hard Chemistry Long Answer
  for (let i = 0; i < countPerCategory; i++) {
    const vol = randInt(20, 50);
    const conc = (randInt(10, 25) / 100).toFixed(2);
    generated.push({
      id: nextId('chem_hard_la'),
      topic: 'Chemistry-Basics',
      subtopic: 'Thermochemistry & Enthalpy of Neutralization',
      difficulty: 'hard',
      type: 'Long Answer',
      marks: 5,
      text: `In a coffee-cup calorimeter, $${vol}\\,\\text{mL}$ of $${conc}\\,\\text{mol/L}\\ \\text{HCl}_{(aq)}$ is neutralized with excess $\\text{NaOH}_{(aq)}$ according to:\n$$\\text{H}^+_{(aq)} + \\text{OH}^-_{(aq)} \\longrightarrow \\text{H}_2\\text{O}_{(l)} \\quad \\Delta H_{\\text{rxn}} = -57.1\\,\\text{kJ/mol}$$\n(a) Calculate the moles of $\\text{H}^+$ reacting.\n(b) Using $q = n \\cdot |\\Delta H|$, find the total heat energy released in Joules.\n(c) Assuming total solution mass $m = ${vol * 2}\\,\\text{g}$ and specific heat capacity $c = 4.184\\,\\text{J}/(\\text{g}\\cdot^\\circ\\text{C})$, calculate the temperature rise $\\Delta T = \\frac{q}{mc}$.`,
      markingGuide: `(a) $n = C \\times V = ${conc} \\times ${vol / 1000} = ${(parseFloat(conc) * (vol / 1000)).toFixed(4)}\\,\\text{mol}$.\n(b) $q = n \\times 57100\\,\\text{J}$.\n(c) $\\Delta T = \\frac{q}{(${vol * 2} \\times 4.184)}$.`,
    });
  }

  return generated;
}
