import { NextRequest, NextResponse } from 'next/server';
import { solvePaper } from '@/lib/solver';
import { PaperConstraints } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const constraints: PaperConstraints = body.constraints;
    const options = body.options || {};

    if (!constraints || typeof constraints.totalMarks !== 'number') {
      return NextResponse.json(
        { error: 'Invalid payload: totalMarks and constraint distributions required.' },
        { status: 400 }
      );
    }

    const paper = solvePaper(constraints, undefined, {
      subject: options.subject,
      institution: options.institution,
      gradeLevel: options.gradeLevel,
      seed: options.seed || Math.floor(Math.random() * 10000),
    });

    return NextResponse.json({ paper });
  } catch (error: any) {
    console.error('Solver error in API:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate paper.' },
      { status: 500 }
    );
  }
}
