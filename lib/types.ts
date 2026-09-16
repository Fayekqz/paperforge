export type Difficulty = 'easy' | 'medium' | 'hard';

export type QuestionType = 'MCQ' | 'Short Answer' | 'Long Answer';

export type Topic =
  | 'Algebra'
  | 'Geometry'
  | 'Trigonometry'
  | 'Physics-Mechanics'
  | 'Chemistry-Basics';

export type GeneratorMode = 'solver' | 'llm' | 'hybrid';

export type DifficultyPreset = 'foundational' | 'balanced' | 'advanced' | 'olympiad' | 'custom';

export interface LLMConfig {
  provider?: 'gemini' | 'openai' | 'claude' | 'built-in';
  apiKey?: string;
  modelName?: string;
  promptNotes?: string;
}

export interface Question {
  id: string;
  topic: Topic;
  subtopic: string;
  difficulty: Difficulty;
  type: QuestionType;
  marks: number;
  text: string;
  options?: { key: 'A' | 'B' | 'C' | 'D'; text: string }[];
  subparts?: { label: string; text: string; marks: number }[];
  markingGuide?: string;
  correctOption?: 'A' | 'B' | 'C' | 'D';
}

export interface PaperConstraints {
  totalMarks: number;
  difficultyMix: {
    easy: number; // percentage (0 - 100)
    medium: number;
    hard: number;
  };
  topicWeightage: {
    Algebra: number; // percentage
    Geometry: number;
    Trigonometry: number;
    'Physics-Mechanics': number;
    'Chemistry-Basics': number;
  };
  typeMix: {
    MCQ: number; // percentage
    'Short Answer': number;
    'Long Answer': number;
  };
}

export interface ConstraintRelaxationWarning {
  id: string;
  category: 'difficulty' | 'topic' | 'type' | 'totalMarks';
  dimension: string; // e.g. "Hard", "Trigonometry", "Long Answer"
  requestedPercent: number;
  requestedMarks: number;
  achievedPercent: number;
  achievedMarks: number;
  deltaPercent: number; // achieved - requested
  severity: 'notice' | 'moderate' | 'significant';
  message: string;
  remedy: string;
}

export interface BreakdownMetric {
  name: string;
  requestedPercent: number;
  requestedMarks: number;
  achievedPercent: number;
  achievedMarks: number;
  deltaMarks: number;
  deltaPercent: number;
}

export interface PaperBreakdown {
  difficulty: Record<Difficulty, BreakdownMetric>;
  topic: Record<Topic, BreakdownMetric>;
  type: Record<QuestionType, BreakdownMetric>;
  totalMarksAchieved: number;
  totalMarksRequested: number;
  totalQuestions: number;
}

export interface GeneratedPaper {
  id: string;
  title: string;
  subject: string;
  institution: string;
  gradeLevel: string;
  timeAllowedMinutes: number;
  instructions: string[];
  totalMarks: number;
  questions: Question[];
  breakdown: PaperBreakdown;
  warnings: ConstraintRelaxationWarning[];
  createdAt: string;
  generatorMode?: GeneratorMode;
  generationTimeMs?: number;
}

export interface SwapCandidateResponse {
  candidates: Question[];
  swappedQuestion: Question;
}
