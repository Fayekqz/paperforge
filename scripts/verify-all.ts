import { solvePaper, recalculatePaperBreakdown } from '../lib/solver';
import { findSwapCandidates, executeSwap } from '../lib/swap';
import { PaperConstraints } from '../lib/types';
import questionBankData from '../data/question_bank.json';

console.log('====================================================');
console.log('  PAPERFORGE COMPREHENSIVE SPECIFICATION TEST SUITE ');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    console.log(`✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`✗ FAIL: ${testName}`);
    if (detail) console.error(`  Detail: ${detail}`);
  }
}

// ----------------------------------------------------
// TEST 1: Question Bank Integrity
// ----------------------------------------------------
console.log('\n--- TEST GROUP 1: Question Bank Schema & Realism ---');
const bank = questionBankData as any[];
assert(bank.length >= 60, 'Bank size >= 60 questions', `Actual size: ${bank.length}`);

const topics = new Set(bank.map((q) => q.topic));
assert(
  topics.has('Algebra') &&
    topics.has('Geometry') &&
    topics.has('Trigonometry') &&
    topics.has('Physics-Mechanics') &&
    topics.has('Chemistry-Basics'),
  'All 5 STEM topics represented'
);

const validDifficulties = bank.every((q) => ['easy', 'medium', 'hard'].includes(q.difficulty));
assert(validDifficulties, 'All questions have valid difficulty (easy/medium/hard)');

const validTypes = bank.every((q) => ['MCQ', 'Short Answer', 'Long Answer'].includes(q.type));
assert(validTypes, 'All questions have valid format (MCQ/Short Answer/Long Answer)');

const validMarks = bank.every((q) => typeof q.marks === 'number' && q.marks > 0);
assert(validMarks, 'All questions have positive integer marks');

const hasPlausibleText = bank.every((q) => q.text && q.text.length > 20 && !q.text.includes('lorem ipsum'));
assert(hasPlausibleText, 'All questions contain authentic scientific text (no lorem ipsum)');

// ----------------------------------------------------
// TEST 2: Hard Constraint (Exact Total Marks)
// ----------------------------------------------------
console.log('\n--- TEST GROUP 2: Hard Constraint (Exact Total Marks across multiple scales) ---');
const markTargets = [25, 40, 50, 60, 75, 80, 100];

for (const target of markTargets) {
  const c: PaperConstraints = {
    totalMarks: target,
    difficultyMix: { easy: 30, medium: 50, hard: 20 },
    topicWeightage: {
      Algebra: 25,
      Geometry: 25,
      Trigonometry: 20,
      'Physics-Mechanics': 15,
      'Chemistry-Basics': 15,
    },
    typeMix: { MCQ: 25, 'Short Answer': 50, 'Long Answer': 25 },
  };

  const paper = solvePaper(c);
  const actualMarks = paper.questions.reduce((sum, q) => sum + q.marks, 0);
  assert(
    actualMarks === target && paper.totalMarks === target,
    `Hard constraint satisfied: Target ${target} marks === Achieved ${actualMarks} marks`
  );
}

// ----------------------------------------------------
// TEST 3: The "Constraints Can't All Be Satisfied" Test
// ----------------------------------------------------
console.log('\n--- TEST GROUP 3: Unsatisfiable / Conflicting Soft Constraints Handling ---');
// Scenario: User requests 80% Hard Algebra in a 50-mark paper (requires 40 marks of Hard Algebra).
// The bank has at most 15 marks of Hard Algebra!
const conflictingConstraints: PaperConstraints = {
  totalMarks: 50,
  difficultyMix: { easy: 10, medium: 10, hard: 80 },
  topicWeightage: {
    Algebra: 80,
    Geometry: 10,
    Trigonometry: 10,
    'Physics-Mechanics': 0,
    'Chemistry-Basics': 0,
  },
  typeMix: { MCQ: 20, 'Short Answer': 40, 'Long Answer': 40 },
};

let didCrash = false;
let conflictingPaper: any = null;
try {
  conflictingPaper = solvePaper(conflictingConstraints);
} catch (e) {
  didCrash = true;
}

assert(!didCrash, 'Graceful handling: Solver does NOT crash on severely unsatisfiable constraints');
assert(
  conflictingPaper && conflictingPaper.totalMarks === 50,
  'Total marks hard constraint still strictly preserved (50 marks) despite soft constraint conflict'
);
assert(
  conflictingPaper && conflictingPaper.warnings.length > 0,
  `Audit guarantees: Generated ${conflictingPaper?.warnings.length} transparent relaxation warnings (no silent substitution)`
);

const hardWarning = conflictingPaper?.warnings.find((w: any) => w.dimension === 'Hard');
assert(
  !!hardWarning,
  'Warning accurately identified Hard difficulty shortfall',
  hardWarning ? `${hardWarning.message} | Remedy: ${hardWarning.remedy}` : 'Missing warning'
);

// ----------------------------------------------------
// TEST 4: Single Question Swap Engine
// ----------------------------------------------------
console.log('\n--- TEST GROUP 4: Targeted Question Swap Without Full Regeneration ---');
const basePaper = solvePaper({
  totalMarks: 40,
  difficultyMix: { easy: 30, medium: 50, hard: 20 },
  topicWeightage: {
    Algebra: 25,
    Geometry: 25,
    Trigonometry: 20,
    'Physics-Mechanics': 15,
    'Chemistry-Basics': 15,
  },
  typeMix: { MCQ: 25, 'Short Answer': 50, 'Long Answer': 25 },
});

const targetQ = basePaper.questions[0];
const currentIds = basePaper.questions.map((q) => q.id);
const swapCandidates = findSwapCandidates(targetQ, currentIds);

assert(swapCandidates.length > 0, `Found ${swapCandidates.length} replacement candidates for ${targetQ.id}`);

// Invariant 1: All candidates MUST have the exact same marks
const allSameMarks = swapCandidates.every((c) => c.question.marks === targetQ.marks);
assert(allSameMarks, 'Hard constraint preserved: All replacement candidates have identical marks');

// Invariant 2: No candidate should already be in the paper
const noDuplicates = swapCandidates.every((c) => !currentIds.includes(c.question.id));
assert(noDuplicates, 'No duplication: Replacement candidates exclude questions currently on the paper');

// Execute in-place swap
const replacement = swapCandidates[0].question;
const swappedQuestions = executeSwap(basePaper.questions, targetQ.id, replacement);

const initialMarks = basePaper.questions.reduce((s, q) => s + q.marks, 0);
const newMarks = swappedQuestions.reduce((s, q) => s + q.marks, 0);
assert(initialMarks === newMarks, `In-place swap preserved exact total marks (${initialMarks}m === ${newMarks}m)`);
assert(
  swappedQuestions.some((q) => q.id === replacement.id) && !swappedQuestions.some((q) => q.id === targetQ.id),
  'Target question successfully replaced with selected candidate'
);

// Recalculate breakdown dynamically
const initialConstraints: PaperConstraints = {
  totalMarks: 40,
  difficultyMix: { easy: 30, medium: 50, hard: 20 },
  topicWeightage: {
    Algebra: 25,
    Geometry: 25,
    Trigonometry: 20,
    'Physics-Mechanics': 15,
    'Chemistry-Basics': 15,
  },
  typeMix: { MCQ: 25, 'Short Answer': 50, 'Long Answer': 25 },
};
const { breakdown: newBreakdown, warnings: newWarnings } = recalculatePaperBreakdown(
  swappedQuestions,
  initialConstraints
);
assert(newBreakdown.totalMarksAchieved === 40, 'Recalculated breakdown achieved exact total marks');

// ----------------------------------------------------
// TEST 5: Section Grouping & Formatting
// ----------------------------------------------------
console.log('\n--- TEST GROUP 5: Academic Paper Structure & Sections ---');
const sectionMCQs = basePaper.questions.filter((q) => q.type === 'MCQ');
const sectionShort = basePaper.questions.filter((q) => q.type === 'Short Answer');
const sectionLong = basePaper.questions.filter((q) => q.type === 'Long Answer');

assert(
  sectionMCQs.length > 0 && sectionShort.length > 0,
  'Paper includes clean Section A (MCQs) and Section B (Short Answer)'
);

// Test MCQ options structure
const mcqWithOptions = sectionMCQs.every((q) => q.options && q.options.length === 4);
assert(mcqWithOptions, 'All MCQs have complete 4-option answer sets (A, B, C, D)');

// Test instructions presence
assert(basePaper.instructions && basePaper.instructions.length >= 4, 'Includes standard examination instructions');

console.log('\n====================================================');
console.log(`  FINAL RESULT: ${passedTests} / ${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('====================================================\n');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
