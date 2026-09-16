import { NextRequest, NextResponse } from 'next/server';
import { solvePaper } from '@/lib/solver';
import { generatePaperWithLLM } from '@/lib/llmGenerator';
import { PaperConstraints, GeneratorMode, LLMConfig } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const constraints: PaperConstraints = body.constraints;
    const mode: GeneratorMode = body.mode || 'solver';
    const llmConfig: LLMConfig = body.llmConfig || {};
    const options = body.options || {};
    const excludedIds: string[] = body.excludedIds || [];

    if (!constraints || typeof constraints.totalMarks !== 'number') {
      return NextResponse.json(
        { error: 'Invalid payload: totalMarks and constraint distributions required.' },
        { status: 400 }
      );
    }

    if (mode === 'llm') {
      const paper = await generatePaperWithLLM(constraints, llmConfig, {
        subject: options.subject,
        institution: options.institution,
        gradeLevel: options.gradeLevel,
        excludedIds,
      });
      return NextResponse.json({ paper });
    }

    // Default fast solver mode (< 5ms)
    const seed = options.seed ?? Math.floor(Math.random() * 1000000) + 1;
    const paper = solvePaper(constraints, undefined, {
      subject: options.subject,
      institution: options.institution,
      gradeLevel: options.gradeLevel,
      seed,
      excludedIds,
    });

    return NextResponse.json({ paper });
  } catch (error: any) {
    console.error('Solver/LLM error in API:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate paper.' },
      { status: 500 }
    );
  }
}
