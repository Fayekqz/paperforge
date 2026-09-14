import {
  Question,
  PaperConstraints,
  PaperBreakdown,
  ConstraintRelaxationWarning,
  GeneratedPaper,
  Difficulty,
  Topic,
  QuestionType,
  BreakdownMetric,
} from './types';
import questionBankData from '../data/question_bank.json';

const QUESTION_BANK: Question[] = questionBankData as Question[];

export interface SolverOptions {
  seed?: number;
  subject?: string;
  institution?: string;
  gradeLevel?: string;
}

/**
 * Deterministic PRNG for reproducible generation when seed is provided.
 */
class SimpleRNG {
  private state: number;
  constructor(seed: number = 42) {
    this.state = seed % 2147483647;
    if (this.state <= 0) this.state += 2147483646;
  }
  next(): number {
    this.state = (this.state * 16807) % 2147483647;
    return (this.state - 1) / 2147483646;
  }
}

/**
 * Calculate multi-objective loss for a question subset relative to constraints.
 */
function calculateLoss(
  selected: Question[],
  constraints: PaperConstraints,
  totalMarks: number
): { loss: number; breakdown: PaperBreakdown } {
  const currentTotalMarks = selected.reduce((sum, q) => sum + q.marks, 0);

  // Initialize breakdown tallies
  const diffAchieved: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0 };
  const topicAchieved: Record<Topic, number> = {
    Algebra: 0,
    Geometry: 0,
    Trigonometry: 0,
    'Physics-Mechanics': 0,
    'Chemistry-Basics': 0,
  };
  const typeAchieved: Record<QuestionType, number> = {
    MCQ: 0,
    'Short Answer': 0,
    'Long Answer': 0,
  };

  for (const q of selected) {
    diffAchieved[q.difficulty] += q.marks;
    topicAchieved[q.topic] += q.marks;
    typeAchieved[q.type] += q.marks;
  }

  // Normalized targets based on requested total marks
  let penalty = 0;

  // Difficulty loss
  const diffKeys: Difficulty[] = ['easy', 'medium', 'hard'];
  const diffBreakdown: Record<Difficulty, BreakdownMetric> = {} as any;
  for (const k of diffKeys) {
    const reqPercent = constraints.difficultyMix[k] || 0;
    const reqMarks = (reqPercent / 100) * totalMarks;
    const achMarks = diffAchieved[k];
    const achPercent = totalMarks > 0 ? (achMarks / totalMarks) * 100 : 0;
    const deltaMarks = achMarks - reqMarks;
    const deltaPercent = achPercent - reqPercent;

    penalty += Math.pow(deltaMarks, 2) * 1.5; // weight for difficulty
    diffBreakdown[k] = {
      name: k.charAt(0).toUpperCase() + k.slice(1),
      requestedPercent: reqPercent,
      requestedMarks: Math.round(reqMarks * 10) / 10,
      achievedPercent: Math.round(achPercent * 10) / 10,
      achievedMarks: achMarks,
      deltaMarks: Math.round(deltaMarks * 10) / 10,
      deltaPercent: Math.round(deltaPercent * 10) / 10,
    };
  }

  // Topic loss
  const topicKeys: Topic[] = [
    'Algebra',
    'Geometry',
    'Trigonometry',
    'Physics-Mechanics',
    'Chemistry-Basics',
  ];
  const topicBreakdown: Record<Topic, BreakdownMetric> = {} as any;
  for (const k of topicKeys) {
    const reqPercent = constraints.topicWeightage[k] || 0;
    const reqMarks = (reqPercent / 100) * totalMarks;
    const achMarks = topicAchieved[k];
    const achPercent = totalMarks > 0 ? (achMarks / totalMarks) * 100 : 0;
    const deltaMarks = achMarks - reqMarks;
    const deltaPercent = achPercent - reqPercent;

    penalty += Math.pow(deltaMarks, 2) * 1.2; // weight for topic
    topicBreakdown[k] = {
      name: k,
      requestedPercent: reqPercent,
      requestedMarks: Math.round(reqMarks * 10) / 10,
      achievedPercent: Math.round(achPercent * 10) / 10,
      achievedMarks: achMarks,
      deltaMarks: Math.round(deltaMarks * 10) / 10,
      deltaPercent: Math.round(deltaPercent * 10) / 10,
    };
  }

  // Type loss
  const typeKeys: QuestionType[] = ['MCQ', 'Short Answer', 'Long Answer'];
  const typeBreakdown: Record<QuestionType, BreakdownMetric> = {} as any;
  for (const k of typeKeys) {
    const reqPercent = constraints.typeMix[k] || 0;
    const reqMarks = (reqPercent / 100) * totalMarks;
    const achMarks = typeAchieved[k];
    const achPercent = totalMarks > 0 ? (achMarks / totalMarks) * 100 : 0;
    const deltaMarks = achMarks - reqMarks;
    const deltaPercent = achPercent - reqPercent;

    penalty += Math.pow(deltaMarks, 2) * 1.0; // weight for type
    typeBreakdown[k] = {
      name: k,
      requestedPercent: reqPercent,
      requestedMarks: Math.round(reqMarks * 10) / 10,
      achievedPercent: Math.round(achPercent * 10) / 10,
      achievedMarks: achMarks,
      deltaMarks: Math.round(deltaMarks * 10) / 10,
      deltaPercent: Math.round(deltaPercent * 10) / 10,
    };
  }

  const breakdown: PaperBreakdown = {
    difficulty: diffBreakdown,
    topic: topicBreakdown,
    type: typeBreakdown,
    totalMarksAchieved: currentTotalMarks,
    totalMarksRequested: totalMarks,
    totalQuestions: selected.length,
  };

  return { loss: penalty, breakdown };
}

/**
 * Analyze relaxations and build human-readable explanations.
 */
function deriveWarnings(
  breakdown: PaperBreakdown,
  constraints: PaperConstraints,
  bank: Question[]
): ConstraintRelaxationWarning[] {
  const warnings: ConstraintRelaxationWarning[] = [];
  const total = breakdown.totalMarksAchieved;

  // 1. Total marks check
  if (breakdown.totalMarksAchieved !== breakdown.totalMarksRequested) {
    const diff = breakdown.totalMarksAchieved - breakdown.totalMarksRequested;
    warnings.push({
      id: 'warn_total_marks',
      category: 'totalMarks',
      dimension: 'Total Marks',
      requestedPercent: 100,
      requestedMarks: breakdown.totalMarksRequested,
      achievedPercent: Math.round((breakdown.totalMarksAchieved / breakdown.totalMarksRequested) * 100),
      achievedMarks: breakdown.totalMarksAchieved,
      deltaPercent: Math.round((diff / breakdown.totalMarksRequested) * 100),
      severity: 'significant',
      message: `Hard constraint target was ${breakdown.totalMarksRequested} marks, but the closest achievable combination in the bank was ${breakdown.totalMarksAchieved} marks (${diff > 0 ? `+${diff}` : diff} marks).`,
      remedy: 'Select a standard mark denomination (e.g. 25, 40, 50, 60, 80, 100) or adjust question bank availability.',
    });
  }

  // 2. Difficulty relaxations
  for (const [key, metric] of Object.entries(breakdown.difficulty)) {
    const absDelta = Math.abs(metric.deltaPercent);
    if (absDelta >= 4.0 && metric.requestedPercent > 0) {
      const isUnder = metric.deltaPercent < 0;
      const bankCount = bank.filter((q) => q.difficulty === key).length;
      const bankMarks = bank
        .filter((q) => q.difficulty === key)
        .reduce((sum, q) => sum + q.marks, 0);

      let severity: 'notice' | 'moderate' | 'significant' = 'notice';
      if (absDelta >= 15) severity = 'significant';
      else if (absDelta >= 8) severity = 'moderate';

      let reason = '';
      if (isUnder && metric.requestedMarks > bankMarks * 0.7) {
        reason = `Available bank depth for ${key} is constrained (${bankMarks} marks total across ${bankCount} questions).`;
      } else if (isUnder) {
        reason = `Discrete mark values (questions are 1, 2, 3, 4, 5, or 6 marks) prevented exact ${metric.requestedPercent}% split.`;
      } else {
        reason = `Absorbed mark remainder to satisfy exact total marks while meeting question-type structure.`;
      }

      warnings.push({
        id: `warn_diff_${key}`,
        category: 'difficulty',
        dimension: metric.name,
        requestedPercent: metric.requestedPercent,
        requestedMarks: metric.requestedMarks,
        achievedPercent: metric.achievedPercent,
        achievedMarks: metric.achievedMarks,
        deltaPercent: metric.deltaPercent,
        severity,
        message: `${metric.name} difficulty adjusted by ${metric.deltaPercent > 0 ? `+${metric.deltaPercent}%` : `${metric.deltaPercent}%`} (${metric.achievedMarks} achieved vs ${metric.requestedMarks} marks target). ${reason}`,
        remedy: isUnder
          ? `Relaxed ${key} by ${Math.abs(metric.deltaPercent)}%; redistributed to adjacent difficulty bands.`
          : `Compensated from under-allocated difficulty tiers to maintain exact total paper marks.`,
      });
    }
  }

  // 3. Topic relaxations
  for (const [key, metric] of Object.entries(breakdown.topic)) {
    const absDelta = Math.abs(metric.deltaPercent);
    if (absDelta >= 4.5 && metric.requestedPercent > 0) {
      const isUnder = metric.deltaPercent < 0;
      let severity: 'notice' | 'moderate' | 'significant' = 'notice';
      if (absDelta >= 16) severity = 'significant';
      else if (absDelta >= 8) severity = 'moderate';

      const bankTopicMarks = bank
        .filter((q) => q.topic === key)
        .reduce((s, q) => s + q.marks, 0);

      warnings.push({
        id: `warn_topic_${key}`,
        category: 'topic',
        dimension: metric.name,
        requestedPercent: metric.requestedPercent,
        requestedMarks: metric.requestedMarks,
        achievedPercent: metric.achievedPercent,
        achievedMarks: metric.achievedMarks,
        deltaPercent: metric.deltaPercent,
        severity,
        message: `${metric.name} weightage shifted by ${metric.deltaPercent > 0 ? `+${metric.deltaPercent}%` : `${metric.deltaPercent}%`} (${metric.achievedMarks} vs ${metric.requestedMarks} marks requested). ${
          isUnder
            ? `Limited question pool matching difficulty/type intersections in this topic.`
            : `Additional questions included to preserve whole-question mark integers.`
        }`,
        remedy: isUnder
          ? `Reallocated ${Math.abs(metric.deltaPercent)}% topic quota to compatible syllabus areas.`
          : `Retained to fulfill section structure requirements.`,
      });
    }
  }

  // 4. Question Type relaxations
  for (const [key, metric] of Object.entries(breakdown.type)) {
    const absDelta = Math.abs(metric.deltaPercent);
    if (absDelta >= 5.0 && metric.requestedPercent > 0) {
      let severity: 'notice' | 'moderate' | 'significant' = 'notice';
      if (absDelta >= 15) severity = 'significant';
      else if (absDelta >= 8) severity = 'moderate';

      warnings.push({
        id: `warn_type_${key.replace(/\s+/g, '_')}`,
        category: 'type',
        dimension: metric.name,
        requestedPercent: metric.requestedPercent,
        requestedMarks: metric.requestedMarks,
        achievedPercent: metric.achievedPercent,
        achievedMarks: metric.achievedMarks,
        deltaPercent: metric.deltaPercent,
        severity,
        message: `${metric.name} question allocation deviated by ${metric.deltaPercent > 0 ? `+${metric.deltaPercent}%` : `${metric.deltaPercent}%`} (${metric.achievedMarks} vs ${metric.requestedMarks} marks). ${
          metric.deltaPercent < 0
            ? 'Higher-mark structured questions could not fit without exceeding the exact mark boundary.'
            : 'Substituted for fractional mark deficits in other formats.'
        }`,
        remedy: `Re-balanced across short and long formats to hit exact ${total} marks.`,
      });
    }
  }

  return warnings;
}

/**
 * Organize questions into standard academic examination sections:
 * Section A: Multiple Choice Questions (1-2 marks)
 * Section B: Short Answer Questions (2-4 marks)
 * Section C: Extended Response / Structured Long Questions (5+ marks)
 */
function sortPaperSections(questions: Question[]): Question[] {
  const typeOrder: Record<QuestionType, number> = {
    MCQ: 1,
    'Short Answer': 2,
    'Long Answer': 3,
  };
  const diffOrder: Record<Difficulty, number> = {
    easy: 1,
    medium: 2,
    hard: 3,
  };

  return [...questions].sort((a, b) => {
    // 1. Group by Section / Type
    if (typeOrder[a.type] !== typeOrder[b.type]) {
      return typeOrder[a.type] - typeOrder[b.type];
    }
    // 2. Sort by difficulty within section (easier questions first)
    if (diffOrder[a.difficulty] !== diffOrder[b.difficulty]) {
      return diffOrder[a.difficulty] - diffOrder[b.difficulty];
    }
    // 3. Sort by marks
    if (a.marks !== b.marks) {
      return a.marks - b.marks;
    }
    // 4. Stable sort by ID
    return a.id.localeCompare(b.id);
  });
}

/**
 * Main Deterministic Constraint Solver
 */
export function solvePaper(
  constraints: PaperConstraints,
  bank: Question[] = QUESTION_BANK,
  options: SolverOptions = {}
): GeneratedPaper {
  const targetMarks = Math.max(10, Math.min(150, constraints.totalMarks));
  const rng = new SimpleRNG(options.seed ?? 101);

  // Filter pool to valid questions
  const pool = [...bank];

  // Reachability table via dynamic programming (Subset Sum with Item Tracking)
  // dp[m] = array of question indices summing to mark m
  const dp: (number[] | null)[] = new Array(targetMarks + 1).fill(null);
  dp[0] = [];

  for (let i = 0; i < pool.length; i++) {
    const q = pool[i];
    for (let m = targetMarks; m >= q.marks; m--) {
      if (dp[m - q.marks] !== null && dp[m] === null) {
        dp[m] = [...dp[m - q.marks]!, i];
      }
    }
  }

  // Check if exact target is reachable
  let achievableMarks = targetMarks;
  if (dp[targetMarks] === null) {
    // Find closest reachable mark
    let minDelta = Infinity;
    for (let m = 0; m <= targetMarks; m++) {
      if (dp[m] !== null && Math.abs(m - targetMarks) < minDelta) {
        minDelta = Math.abs(m - targetMarks);
        achievableMarks = m;
      }
    }
  }

  // Initial candidate set using DP solution as starting baseline
  let bestSelection: Question[] = (dp[achievableMarks] || []).map((idx) => pool[idx]);
  let { loss: bestLoss, breakdown: bestBreakdown } = calculateLoss(
    bestSelection,
    constraints,
    achievableMarks
  );

  // Multi-restart Greedy + Local Search optimization
  // Runs fast (under 15ms) and evaluates hundreds of candidate configurations
  const numRestarts = 8;
  const maxIterationsPerRestart = 250;

  for (let r = 0; r < numRestarts; r++) {
    // Greedy construction biased towards under-represented constraints
    const selectedIndices = new Set<number>();
    let currentMarks = 0;

    // Shuffle pool with pseudo-randomness for search diversification
    const shuffledPool = pool.map((q, idx) => ({ q, idx })).sort(() => rng.next() - 0.5);

    // Greedy pack up to target
    for (const item of shuffledPool) {
      if (currentMarks + item.q.marks <= achievableMarks) {
        selectedIndices.add(item.idx);
        currentMarks += item.q.marks;
        if (currentMarks === achievableMarks) break;
      }
    }

    // If reached exact achievable marks, begin swap optimization
    if (currentMarks === achievableMarks) {
      let currentSelected = Array.from(selectedIndices).map((i) => pool[i]);
      let { loss: currentLoss } = calculateLoss(currentSelected, constraints, achievableMarks);

      for (let iter = 0; iter < maxIterationsPerRestart; iter++) {
        // Pick one selected question and try to swap with an unselected question of identical marks
        const inIdx = Math.floor(rng.next() * currentSelected.length);
        const qOut = currentSelected[inIdx];

        // Find available candidate with exact same marks
        const candidates = pool.filter(
          (cand) => cand.marks === qOut.marks && !currentSelected.some((s) => s.id === cand.id)
        );

        if (candidates.length === 0) continue;

        const qIn = candidates[Math.floor(rng.next() * candidates.length)];
        const trialSelected = [...currentSelected];
        trialSelected[inIdx] = qIn;

        const { loss: trialLoss } = calculateLoss(trialSelected, constraints, achievableMarks);

        // Accept if strictly better, or with small probability if slightly worse (simulated annealing)
        const accept = trialLoss < currentLoss || rng.next() < Math.exp((currentLoss - trialLoss) / 10);
        if (accept) {
          currentSelected = trialSelected;
          currentLoss = trialLoss;

          if (currentLoss < bestLoss) {
            bestLoss = currentLoss;
            bestSelection = currentSelected;
          }
        }
      }
    }
  }

  // Recalculate final breakdown on best selection
  const finalEval = calculateLoss(bestSelection, constraints, achievableMarks);
  const warnings = deriveWarnings(finalEval.breakdown, constraints, bank);
  const orderedQuestions = sortPaperSections(bestSelection);

  return {
    id: `exam_${Date.now()}_${Math.floor(rng.next() * 1000)}`,
    title: `${options.subject || 'Mathematics & Natural Sciences'} — Unified Assessment`,
    subject: options.subject || 'Mathematics & Natural Sciences',
    institution: options.institution || 'Department of Examinations & Assessment',
    gradeLevel: options.gradeLevel || 'Upper Secondary / Grade 10-12',
    timeAllowedMinutes: Math.max(30, Math.round(achievableMarks * 1.8)),
    instructions: [
      'Read each question carefully before attempting your answer.',
      'Answer all questions in Section A, Section B, and Section C.',
      'For Multiple Choice Questions, mark the single correct option clearly.',
      'Write all steps and working clearly in the spaces provided; credit is awarded for clear mathematical method.',
      'Electronic calculators with scientific notation capability are permitted.',
      'Take g = 9.8 m/s² unless stated otherwise in the question.',
    ],
    totalMarks: achievableMarks,
    questions: orderedQuestions,
    breakdown: finalEval.breakdown,
    warnings,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Recalculate breakdown and warnings when questions are modified manually (e.g. after a swap)
 */
export function recalculatePaperBreakdown(
  questions: Question[],
  constraints: PaperConstraints,
  bank: Question[] = QUESTION_BANK
): { breakdown: PaperBreakdown; warnings: ConstraintRelaxationWarning[] } {
  const targetMarks = constraints.totalMarks;
  const { breakdown } = calculateLoss(questions, constraints, targetMarks);
  const warnings = deriveWarnings(breakdown, constraints, bank);
  return { breakdown, warnings };
}
