import { NextRequest, NextResponse } from 'next/server';
import { findSwapCandidates } from '@/lib/swap';
import { Question } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const targetQuestion: Question = body.targetQuestion;
    const currentQuestionIds: string[] = body.currentQuestionIds || [];

    if (!targetQuestion || !targetQuestion.id) {
      return NextResponse.json(
        { error: 'targetQuestion with valid ID required.' },
        { status: 400 }
      );
    }

    const candidates = findSwapCandidates(targetQuestion, currentQuestionIds);

    return NextResponse.json({
      targetQuestion,
      candidates,
    });
  } catch (error: any) {
    console.error('Swap search error in API:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to search swap candidates.' },
      { status: 500 }
    );
  }
}
