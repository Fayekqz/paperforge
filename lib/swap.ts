import { Question } from './types';
import questionBankData from '../data/question_bank.json';

const QUESTION_BANK: Question[] = questionBankData as Question[];

export interface CandidateWithMatchScore {
  question: Question;
  matchScore: number;
  matchReason: string;
}

/**
 * Find replacement questions from the bank for a specific question in a paper.
 * Hard constraint: replacement MUST have the exact same marks to preserve total marks.
 */
export function findSwapCandidates(
  targetQuestion: Question,
  currentQuestionIds: string[],
  bank: Question[] = QUESTION_BANK
): CandidateWithMatchScore[] {
  const currentSet = new Set(currentQuestionIds);

  // Filter bank: must have same marks and cannot already be in the paper
  const available = bank.filter(
    (q) => q.marks === targetQuestion.marks && !currentSet.has(q.id)
  );

  const scored: CandidateWithMatchScore[] = available.map((candidate) => {
    let score = 0;
    const reasons: string[] = [];

    // Exact topic match
    if (candidate.topic === targetQuestion.topic) {
      score += 50;
      reasons.push('Same Topic');
    }

    // Exact difficulty match
    if (candidate.difficulty === targetQuestion.difficulty) {
      score += 30;
      reasons.push('Same Difficulty');
    }

    // Exact question type match
    if (candidate.type === targetQuestion.type) {
      score += 20;
      reasons.push('Same Format');
    }

    let matchReason = reasons.length > 0 ? reasons.join(', ') : 'Equal Mark Equivalent';
    return {
      question: candidate,
      matchScore: score,
      matchReason,
    };
  });

  // Sort descending by match score, then stable by ID
  return scored.sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    return a.question.id.localeCompare(b.question.id);
  });
}

/**
 * Execute in-place replacement of a question in the paper list
 */
export function executeSwap(
  currentQuestions: Question[],
  targetQuestionId: string,
  newQuestion: Question
): Question[] {
  return currentQuestions.map((q) => (q.id === targetQuestionId ? newQuestion : q));
}
