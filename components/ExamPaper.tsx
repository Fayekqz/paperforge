'use client';

import React, { useState } from 'react';
import { GeneratedPaper, Question, QuestionType } from '@/lib/types';
import QuestionItem from './QuestionItem';
import { BookOpen, Eye, EyeOff, Printer, Download, Share2, Sparkles, School } from 'lucide-react';

interface ExamPaperProps {
  paper: GeneratedPaper;
  onSwapQuestion: (question: Question) => void;
}

export default function ExamPaper({ paper, onSwapQuestion }: ExamPaperProps) {
  const [showMarkingGuide, setShowMarkingGuide] = useState(false);
  const [institutionName, setInstitutionName] = useState(
    paper.institution || 'ST. JUDE COLLEGIATE ACADEMY & EXAMINATIONS SYNDICATE'
  );
  const [isEditingInstitution, setIsEditingInstitution] = useState(false);

  // Group questions by section
  const sectionA = paper.questions.filter((q) => q.type === 'MCQ');
  const sectionB = paper.questions.filter((q) => q.type === 'Short Answer');
  const sectionC = paper.questions.filter((q) => q.type === 'Long Answer');

  const sectionAMarks = sectionA.reduce((sum, q) => sum + q.marks, 0);
  const sectionBMarks = sectionB.reduce((sum, q) => sum + q.marks, 0);
  const sectionCMarks = sectionC.reduce((sum, q) => sum + q.marks, 0);

  let questionCounter = 1;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(paper, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `paperforge-exam-${paper.totalMarks}marks.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="exam-sheet-container relative">
      {/* Paper Top Toolbar (Non-printable) */}
      <div className="no-print mb-3 flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2 text-xs font-chrome text-[#6B655D]">
          <span className="font-semibold text-[#181716]">Sheet Preview</span>
          <span>•</span>
          <span>A4 Letterhead Standard</span>
          <span>•</span>
          <span className="font-mono text-[#80182A] font-semibold">
            {paper.totalMarks} Marks / {paper.questions.length} Questions
          </span>
        </div>

        <div className="flex items-center gap-2 font-chrome text-xs">
          {/* Toggle Marking Scheme */}
          <button
            type="button"
            onClick={() => setShowMarkingGuide(!showMarkingGuide)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#DDD6C8] bg-white text-[#4A453F] hover:bg-[#F2EFE9] hover:text-[#181716] transition-colors cursor-pointer shadow-2xs"
            title="Toggle rubric answers for teachers"
          >
            {showMarkingGuide ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showMarkingGuide ? 'Hide Solutions' : 'Show Solutions'}</span>
          </button>

          {/* Download JSON */}
          <button
            type="button"
            onClick={handleDownloadJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#DDD6C8] bg-white text-[#4A453F] hover:bg-[#F2EFE9] hover:text-[#181716] transition-colors cursor-pointer shadow-2xs"
            title="Download full paper JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">JSON</span>
          </button>

          {/* Print Paper */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#80182A] text-white hover:bg-[#62111E] transition-colors cursor-pointer font-semibold shadow-xs"
            title="Print ready clean examination sheet"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Exam Paper</span>
          </button>
        </div>
      </div>

      {/* The Physical Exam Sheet Preview */}
      <div className="exam-sheet bg-[#FAF8F3] border border-[#E8E1D2] shadow-sm rounded-xs p-8 sm:p-12 max-w-4xl mx-auto transition-all text-[#141312]">
        {/* Letterhead Header */}
        <div className="text-center pb-6 border-b-2 border-[#141312]">
          {/* Institutional Crest / Title */}
          <div className="mb-2">
            {isEditingInstitution ? (
              <input
                type="text"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                onBlur={() => setIsEditingInstitution(false)}
                autoFocus
                className="w-full text-center text-xs font-bold tracking-widest uppercase font-chrome bg-white border border-[#DDD6C8] py-1 px-2 rounded"
              />
            ) : (
              <h2
                onClick={() => setIsEditingInstitution(true)}
                title="Click to customize institution name"
                className="text-xs sm:text-sm font-bold tracking-widest uppercase font-chrome text-[#141312] cursor-pointer hover:text-[#80182A] transition-colors"
              >
                {institutionName}
              </h2>
            )}
            <p className="text-[11px] font-chrome tracking-wider uppercase text-[#544F48] mt-0.5">
              DEPARTMENT OF EXAMINATIONS & ACADEMIC STANDARDS
            </p>
          </div>

          {/* Examination Name */}
          <h1 className="text-xl sm:text-2xl font-bold font-paper tracking-tight text-[#141312] my-2">
            {paper.subject}
          </h1>
          <p className="text-sm font-paper italic text-[#423E38]">
            Unified Assessment — Standard & Advanced Syllabus Modules
          </p>

          {/* Metadata Row */}
          <div className="mt-4 pt-3 border-t border-[#D5CEBE] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-chrome text-[#38342E]">
            <div>
              <span className="text-[#756E63] block text-[10px] uppercase">Session</span>
              <span className="font-semibold">Academic Year 2026</span>
            </div>
            <div>
              <span className="text-[#756E63] block text-[10px] uppercase">Grade / Level</span>
              <span className="font-semibold">{paper.gradeLevel}</span>
            </div>
            <div>
              <span className="text-[#756E63] block text-[10px] uppercase">Time Allowed</span>
              <span className="font-semibold">{paper.timeAllowedMinutes} Minutes</span>
            </div>
            <div>
              <span className="text-[#756E63] block text-[10px] uppercase">Maximum Marks</span>
              <span className="font-bold text-[#80182A] print:text-black font-mono">
                {paper.totalMarks} Marks
              </span>
            </div>
          </div>

          {/* Candidate Registration Block */}
          <div className="mt-5 p-3 rounded-xs border border-[#DDD6C8] bg-[#F7F4EC] text-left text-xs font-chrome grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-[#656059] block text-[10px] uppercase">Candidate Name:</span>
              <div className="border-b border-[#B8B1A2] h-5 mt-1" />
            </div>
            <div>
              <span className="text-[#656059] block text-[10px] uppercase">Candidate Index No:</span>
              <div className="border-b border-[#B8B1A2] h-5 mt-1" />
            </div>
            <div>
              <span className="text-[#656059] block text-[10px] uppercase">Examination Centre:</span>
              <div className="border-b border-[#B8B1A2] h-5 mt-1" />
            </div>
          </div>
        </div>

        {/* Instructions to Candidates */}
        <div className="py-4 border-b border-[#D5CEBE] text-xs font-paper text-[#332F2A] leading-relaxed">
          <span className="font-bold uppercase tracking-wider font-chrome text-[10px] block mb-1 text-[#141312]">
            Instructions to Candidates:
          </span>
          <ul className="list-disc list-inside space-y-0.5 text-[13px] pl-1">
            {paper.instructions.map((inst, i) => (
              <li key={i}>{inst}</li>
            ))}
          </ul>
        </div>

        {/* SECTION A: MCQs */}
        {sectionA.length > 0 && (
          <div className="mt-6">
            <div className="py-2 px-3 bg-[#F2EDE1] border-y border-[#DCD5C5] flex items-baseline justify-between mb-4 font-chrome">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#141312]">
                Section A: Multiple Choice Questions
              </h3>
              <span className="font-mono text-xs font-semibold text-[#5A544C]">
                [{sectionAMarks} Marks]
              </span>
            </div>

            <div className="space-y-1">
              {sectionA.map((question) => {
                const num = questionCounter++;
                return (
                  <QuestionItem
                    key={question.id}
                    question={question}
                    questionNumber={num}
                    onSwapClick={onSwapQuestion}
                    showMarkingGuide={showMarkingGuide}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION B: Short Answer */}
        {sectionB.length > 0 && (
          <div className="mt-8 section-break-before">
            <div className="py-2 px-3 bg-[#F2EDE1] border-y border-[#DCD5C5] flex items-baseline justify-between mb-4 font-chrome">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#141312]">
                Section B: Short Structured Questions
              </h3>
              <span className="font-mono text-xs font-semibold text-[#5A544C]">
                [{sectionBMarks} Marks]
              </span>
            </div>

            <div className="space-y-1">
              {sectionB.map((question) => {
                const num = questionCounter++;
                return (
                  <QuestionItem
                    key={question.id}
                    question={question}
                    questionNumber={num}
                    onSwapClick={onSwapQuestion}
                    showMarkingGuide={showMarkingGuide}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION C: Long Answer */}
        {sectionC.length > 0 && (
          <div className="mt-8 section-break-before">
            <div className="py-2 px-3 bg-[#F2EDE1] border-y border-[#DCD5C5] flex items-baseline justify-between mb-4 font-chrome">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#141312]">
                Section C: Extended Response & Analytical Problems
              </h3>
              <span className="font-mono text-xs font-semibold text-[#5A544C]">
                [{sectionCMarks} Marks]
              </span>
            </div>

            <div className="space-y-1">
              {sectionC.map((question) => {
                const num = questionCounter++;
                return (
                  <QuestionItem
                    key={question.id}
                    question={question}
                    questionNumber={num}
                    onSwapClick={onSwapQuestion}
                    showMarkingGuide={showMarkingGuide}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Examination Footer */}
        <div className="mt-12 pt-6 border-t-2 border-[#141312] text-center font-paper text-xs text-[#6B645B] space-y-1">
          <p className="font-bold tracking-wider text-sm uppercase text-[#141312]">
            [ END OF EXAMINATION PAPER ]
          </p>
          <p className="italic text-[11px]">
            PaperForge Examination Instrument • Marks Total Guaranteed: {paper.totalMarks} Marks
          </p>
        </div>
      </div>
    </div>
  );
}
