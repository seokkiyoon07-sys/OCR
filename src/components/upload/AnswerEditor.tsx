'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import type { JSX } from 'react';
import type { Layout } from '@/types/omr';
import OverwriteConfirmModal from '@/components/upload/OverwriteConfirmModal';
import { ChevronDown } from 'lucide-react';

// 내부 관리용 과목 코드 (OMR-DB subject.code와 연동)
const SUBJECT_CODE_LOOKUP: Record<string, string> = {
  '국어': '1000',
  '화법과 작문': '1001',
  '언어와 매체': '1002',
  '수학': '2000',
  '확률과 통계': '2001',
  '미적분': '2002',
  '기하': '2003',
  '영어': '3000',
  '한국사': '4000',
  '생활과 윤리': '4111',
  '윤리와 사상': '4112',
  '한국지리': '4113',
  '세계지리': '4114',
  '동아시아사': '4115',
  '세계사': '4116',
  '경제': '4117',
  '정치와 법': '4118',
  '사회·문화': '4119',
  '물리학I': '4220',
  '화학I': '4221',
  '생명과학I': '4222',
  '지구과학I': '4223',
  '물리학II': '4224',
  '화학II': '4225',
  '생명과학II': '4226',
  '지구과학II': '4227',
};

// 수능 실제 선택과목 코드 (omr_grade.py에서 사용하는 코드)
// 국어: 화법과작문(0), 언어와매체(1) - 선택문항 35-45번
// 수학: 확률과통계(0), 미적분(1), 기하(2) - 선택문항 23-30번
// 탐구: 11-27
const SUNEUNG_ELECTIVE_CODE: Record<string, number> = {
  // 국어 선택과목
  '화법과 작문': 0,
  '언어와 매체': 1,
  // 수학 선택과목
  '확률과 통계': 0,
  '미적분': 1,
  '기하': 2,
  // 탐구 과목
  '생활과 윤리': 11,
  '윤리와 사상': 12,
  '한국지리': 13,
  '세계지리': 14,
  '동아시아사': 15,
  '세계사': 16,
  '경제': 17,
  '정치와 법': 18,
  '사회·문화': 19,
  '물리학I': 20,
  '화학I': 21,
  '생명과학I': 22,
  '지구과학I': 23,
  '물리학II': 24,
  '화학II': 25,
  '생명과학II': 26,
  '지구과학II': 27,
};

// 국어 선택과목 (선택문항 35-45번)
const KOREAN_ELECTIVES = ['화법과 작문', '언어와 매체'];

// 수학 선택과목 (선택문항 23-30번)
const MATH_ELECTIVES = ['확률과 통계', '미적분', '기하'];

// Social exploration subjects
const SOCIAL_SUBJECTS = [
  '생활과 윤리', '윤리와 사상', '한국지리', '세계지리',
  '동아시아사', '세계사', '경제', '정치와 법', '사회·문화'
];

// Science exploration subjects
const SCIENCE_SUBJECTS = [
  '물리학I', '화학I', '생명과학I', '지구과학I',
  '물리학II', '화학II', '생명과학II', '지구과학II'
];

// All exploration subjects
const ALL_EXPLORATION_SUBJECTS = [...SOCIAL_SUBJECTS, ...SCIENCE_SUBJECTS];

interface AnswerEditorProps {
  open: boolean;
  onClose?: () => void;
  layout: Layout;
  sessionId: string | null;
  fileName: string;
  onAnswerFileNameChange?: (name: string) => void;
  onAnswersChange?: (data: { 
    answers: Record<string, string>; 
    scores: Record<string, string>;
    // 국어 선택과목별 답안 저장
    koreanElectiveAnswers?: Record<string, { answers: Record<string, string>; scores: Record<string, string> }>;
    // 수학 선택과목별 답안 저장
    mathElectiveAnswers?: Record<string, { answers: Record<string, string>; scores: Record<string, string> }>;
    // 탐구 과목별 답안 저장
    explorationAnswers?: Record<string, { answers: Record<string, string>; scores: Record<string, string> }>;
    // 선택된 과목 정보
    selectedKoreanElective?: string;
    selectedMathElective?: string;
    selectedExplorationSubject?: string;
  }) => void;
  mode?: 'modal' | 'embedded';
  embeddedClassName?: string;
  subjectPreset?: SubjectPreset;
  examMetadata?: ExamMetadataForApi | null;
  /** 팝업을 다시 열 때 이전 상태를 복원하기 위한 초기값 */
  initialAnswers?: { 
    answers: Record<string, string>; 
    scores: Record<string, string>;
    koreanElectiveAnswers?: Record<string, { answers: Record<string, string>; scores: Record<string, string> }>;
    mathElectiveAnswers?: Record<string, { answers: Record<string, string>; scores: Record<string, string> }>;
    explorationAnswers?: Record<string, { answers: Record<string, string>; scores: Record<string, string> }>;
    selectedKoreanElective?: string;
    selectedMathElective?: string;
    selectedExplorationSubject?: string;
  } | null;
}

interface QuestionItem {
  qid: string;
  kind: 'grid' | 'digits';
  maxLength: number;
}

interface SubjectPreset {
  subject?: string | null;
  subjectCategory?: string | null;
  customQuestionCount?: number | null;
  customMultipleChoice?: number | null;
  customSubjective?: number | null;
}

interface ExamMetadataForApi {
  examYear: number | null;
  examMonth: number | null;
  providerName: string | null;
  gradeLevel: string | null;
  examCode: string | null;
  examLabel: string | null;
  subjectCode: string;
  subjectName: string;
  paperLabel: string | null;
}

const safeText = async (resp: Response) => {
  try {
    return await resp.text();
  } catch {
    return '';
  }
};

const csvEscape = (value: string | number): string => {
  const str = String(value ?? '');
  return /[",\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

const CHOICE_MAP: Record<string, number> = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
};

const toChoice = (value: string): number | null => {
  const trimmed = value.trim().toUpperCase();
  if (!trimmed) return null;
  if (/^[1-5]$/.test(trimmed)) {
    return Number(trimmed);
  }
  return CHOICE_MAP[trimmed as keyof typeof CHOICE_MAP] ?? null;
};

const toChoiceList = (value: string): number[] => {
  const normalized = value.trim().toUpperCase();
  if (!normalized) return [];
  const unique = new Set<number>();
  for (const char of normalized) {
    const choice = toChoice(char);
    if (choice) unique.add(choice);
  }
  return Array.from(unique.values());
};

const parseCSV = (text: string) => {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = '';
  let inQuotes = false;

  const pushField = () => {
    cur.push(field);
    field = '';
  };
  const pushRow = () => {
    rows.push(cur);
    cur = [];
  };

  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      pushField();
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i += 1;
      pushField();
      pushRow();
    } else {
      field += c;
    }
  }
  pushField();
  if (cur.length > 1 || (cur.length === 1 && cur[0] !== '')) pushRow();

  const header = rows.shift() ?? [];
  return { header, rows };
};

const createRange = (
  start: number,
  end: number,
  kind: 'grid' | 'digits',
  maxLength: number,
): QuestionItem[] => {
  const items: QuestionItem[] = [];
  for (let n = start; n <= end; n += 1) {
    items.push({ qid: `Q${n}`, kind, maxLength });
  }
  return items;
};

const buildPresetQuestionItems = (preset?: SubjectPreset): QuestionItem[] => {
  const subject = preset?.subject?.trim();
  if (!subject || subject === '과목을 선택하세요') return [];

  if (subject === '국어' || subject === '영어') {
    return createRange(1, 45, 'grid', 1);
  }

  if (subject === '수학') {
    return [
      ...createRange(1, 15, 'grid', 1),
      ...createRange(16, 22, 'digits', 10),
      ...createRange(23, 28, 'grid', 1),
      ...createRange(29, 30, 'digits', 10),
    ];
  }

  if (subject === '탐구') {
    return createRange(1, 20, 'grid', 1);
  }

  if (subject === '기타') {
    const total = Math.max(0, Number(preset?.customQuestionCount ?? 0));
    const mc = Math.max(0, Number(preset?.customMultipleChoice ?? 0));
    const subjectiveSpecified =
      preset?.customSubjective != null
        ? Math.max(0, Number(preset.customSubjective))
        : undefined;
    const resolvedTotal = total || mc + (subjectiveSpecified ?? 0);
    const resolvedSubjective =
      subjectiveSpecified ?? Math.max(0, resolvedTotal - mc);

    const items: QuestionItem[] = [];
    const objectiveCount = Math.min(mc, resolvedTotal);
    for (let i = 1; i <= objectiveCount; i += 1) {
      items.push({ qid: `Q${i}`, kind: 'grid', maxLength: 1 });
    }

    const subjectiveStart = items.length + 1;
    const subjectiveCount = Math.max(0, resolvedTotal - items.length);
    for (let i = 0; i < subjectiveCount; i += 1) {
      items.push({
        qid: `Q${subjectiveStart + i}`,
        kind: 'digits',
        maxLength: 10,
      });
    }
    return items;
  }

  return [];
};

const buildQuestionItemsFromLayout = (layout?: Layout): QuestionItem[] => {
  const result: QuestionItem[] = [];
  const blocks = layout?.blocks ?? [];
  blocks.forEach((block) => {
    if (!block) return;
    const type = (block.type || '').toLowerCase();
    const prefix = block.questionPrefix || 'Q';
    const start = Number.isFinite(block.questionStart)
      ? Number(block.questionStart)
      : 1;
    const baseCount = Number.isFinite(block.questionCount)
      ? Number(block.questionCount)
      : type === 'grid'
      ? Number(block.rows ?? 0)
      : 1;
    const count = Math.max(0, baseCount);

    if (type === 'grid' || type === 'q') {
      const rows = Math.max(0, Number(block.rows ?? 0));
      const limit = Math.min(rows, count);
      for (let idx = 0; idx < limit; idx += 1) {
        const qNumber = start + idx;
        result.push({ qid: `${prefix}${qNumber}`, kind: 'grid', maxLength: 1 });
      }
    } else if (
      type === 'digits' ||
      type === 'id' ||
      type === 'phone' ||
      type === 'code'
    ) {
      const total = Math.max(1, count);
      for (let idx = 0; idx < total; idx += 1) {
        const qNumber = start + idx;
        result.push({
          qid: `${prefix}${qNumber}`,
          kind: 'digits',
          maxLength: type === 'digits' ? 3 : 10,
        });
      }
    }
  });
  return result;
};

export default function AnswerEditor({
  open,
  onClose,
  layout,
  sessionId,
  fileName,
  onAnswerFileNameChange,
  onAnswersChange,
  mode = 'modal',
  embeddedClassName,
  subjectPreset,
  examMetadata,
  initialAnswers,
}: AnswerEditorProps): JSX.Element | null {
  const presetSubject = subjectPreset?.subject ?? '';
  const presetCategory = subjectPreset?.subjectCategory ?? '';
  const presetCustomCount = subjectPreset?.customQuestionCount ?? null;
  const presetCustomMC = subjectPreset?.customMultipleChoice ?? null;
  const presetCustomSubjective = subjectPreset?.customSubjective ?? null;

  const questionItems = useMemo<QuestionItem[]>(() => {
    const presetItems = buildPresetQuestionItems(subjectPreset);
    if (presetItems.length) return presetItems;
    return buildQuestionItemsFromLayout(layout);
  }, [
    layout,
    presetSubject,
    presetCategory,
    presetCustomCount,
    presetCustomMC,
    presetCustomSubjective,
  ]);

  const parseNumber = (value: unknown): number => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  };

  const subject = subjectPreset?.subject ?? '과목을 선택하세요';
  const subjectCategory = subjectPreset?.subjectCategory ?? '';
  const customQuestionCount = parseNumber(subjectPreset?.customQuestionCount);
  const customMultipleChoice = parseNumber(subjectPreset?.customMultipleChoice);
  const customSubjective = subjectPreset?.customSubjective != null
    ? parseNumber(subjectPreset?.customSubjective)
    : Math.max(0, customQuestionCount - customMultipleChoice);

  const getQuestionCount = () => {
    switch (subject) {
      case '국어':
      case '영어':
        return 45;
      case '수학':
        return 30;
      case '탐구':
        return 20;
      case '기타':
        return customQuestionCount;
      default:
        return 0;
    }
  };

  const getQuestionIndex = (qNumber: number): number => {
    if (!Number.isFinite(qNumber)) return -1;
    return questionItems.findIndex((item) => {
      const numeric = Number(String(item.qid).replace(/[^0-9]/g, ''));
      return Number.isFinite(numeric) && numeric === qNumber;
    });
  };

  const getAnswerForQuestion = (qNumber: number): string => {
    const idx = getQuestionIndex(qNumber);
    return idx >= 0 ? answers[idx] ?? '' : '';
  };

  const setAnswerForQuestion = (qNumber: number, value: string) => {
    const idx = getQuestionIndex(qNumber);
    if (idx < 0) return;
    handleChange(questionItems[idx], idx, value);
  };

  const getScoreForQuestion = (qNumber: number): string => {
    const idx = getQuestionIndex(qNumber);
    return idx >= 0 ? scores[idx] ?? '' : '';
  };

  const setScoreForQuestion = (qNumber: number, value: string) => {
    const idx = getQuestionIndex(qNumber);
    if (idx < 0) return;
    handleScoreChange(idx, value);
  };

  const getAnswerGroupString = (start: number, count: number) => {
    let result = '';
    for (let i = 0; i < count; i += 1) {
      const idx = getQuestionIndex(start + i);
      if (idx >= 0) {
        const char = (answers[idx] ?? '').slice(0, 1);
        result += char;
      }
    }
    return result;
  };

  const setAnswerGroupString = (start: number, count: number, value: string) => {
    const sanitized = value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, count);
    for (let i = 0; i < count; i += 1) {
      const idx = getQuestionIndex(start + i);
      if (idx >= 0) {
        const char = sanitized[i] ?? '';
        handleChange(questionItems[idx], idx, char);
      }
    }
  };

  const getScoreGroupString = (start: number, count: number) => {
    let result = '';
    for (let i = 0; i < count; i += 1) {
      const idx = getQuestionIndex(start + i);
      if (idx >= 0) {
        const char = (scores[idx] ?? '').slice(0, 1);
        result += char;
      }
    }
    return result;
  };

  const setScoreGroupString = (start: number, count: number, value: string) => {
    const sanitized = value.replace(/[^0-9]/g, '').slice(0, count);
    for (let i = 0; i < count; i += 1) {
      const idx = getQuestionIndex(start + i);
      if (idx >= 0) {
        const char = sanitized[i] ?? '';
        handleScoreChange(idx, char);
      }
    }
  };

  // 국어 정답 입력 UI (공통 1-34번, 선택 35-45번)
  const renderKoreanAnswerContent = () => (
    <>
      {/* 국어 공통 (코드: 1000) */}
      <div className="space-y-3">
        <div className="bg-blue-50 rounded-lg px-3 py-2">
          <h4 className="font-semibold text-sm text-blue-800">국어 공통 (코드: 1000)</h4>
          <p className="text-xs text-blue-600 mt-0.5">모든 수험생이 풀어야 하는 공통 문항 (1-34번)</p>
        </div>
        
        <h4 className="font-medium text-sm">공통문항 (1-34번)</h4>
        {Array.from({ length: 7 }, (_, groupIndex) => {
          const start = groupIndex * 5 + 1;
          const end = Math.min(start + 4, 34);
          const questionCount = Math.max(0, end - start + 1);
          if (questionCount <= 0) return null;
          const value = getAnswerGroupString(start, questionCount);
          return (
            <div key={groupIndex} className="grid grid-cols-6 gap-2 items-center">
              <div className="text-sm text-neutral-600">
                {start}-{end}번
              </div>
              <div className="col-span-5">
                <input
                  type="text"
                  value={value}
                  onChange={(event) => setAnswerGroupString(start, questionCount, event.target.value)}
                  className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  placeholder={`예: ${'12345'.substring(0, questionCount)}`}
                  maxLength={questionCount}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t pt-4 space-y-3">
        {/* 선택과목 드롭다운 */}
        <div className="bg-purple-50 rounded-lg px-3 py-2">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-sm text-purple-800">
                선택과목 {selectedKoreanElective ? `- ${selectedKoreanElective} (수능코드: ${SUNEUNG_ELECTIVE_CODE[selectedKoreanElective]})` : ''}
              </h4>
              <p className="text-xs text-purple-600 mt-0.5">선택문항 35-45번 입력</p>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsKoreanDropdownOpen(!isKoreanDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border bg-white hover:bg-neutral-50"
              >
                <span>{selectedKoreanElective || '선택과목 선택'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isKoreanDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isKoreanDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 z-50 bg-white border rounded-lg shadow-lg min-w-[160px]">
                  {KOREAN_ELECTIVES.map((elective) => (
                    <button
                      key={elective}
                      type="button"
                      onClick={() => handleKoreanElectiveChange(elective)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-purple-50 ${
                        selectedKoreanElective === elective ? 'bg-purple-100 text-purple-800' : ''
                      }`}
                    >
                      {elective} (수능코드: {SUNEUNG_ELECTIVE_CODE[elective]})
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <h4 className="font-medium text-sm">선택문항 (35-45번)</h4>
        {[0, 1, 2].map((groupIndex) => {
          const start = 35 + groupIndex * 5;
          const end = Math.min(start + 4, 45);
          const questionCount = Math.max(0, end - start + 1);
          if (questionCount <= 0) return null;
          return (
            <div key={groupIndex} className="grid grid-cols-6 gap-2 items-center">
              <div className="text-sm text-neutral-600">{start}-{end}번</div>
              <div className="col-span-5">
                <input
                  type="text"
                  value={getAnswerGroupString(start, questionCount)}
                  onChange={(event) => setAnswerGroupString(start, questionCount, event.target.value)}
                  className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  placeholder={`예: ${'12345'.substring(0, questionCount)}`}
                  maxLength={questionCount}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );

  const renderMathAnswerContent = () => (
    <>
      {/* 수학 공통 (코드: 2000) */}
      <div className="space-y-3">
        <div className="bg-blue-50 rounded-lg px-3 py-2">
          <h4 className="font-semibold text-sm text-blue-800">수학 공통 (코드: 2000)</h4>
          <p className="text-xs text-blue-600 mt-0.5">모든 수험생이 풀어야 하는 공통 문항</p>
        </div>
        
        <h4 className="font-medium text-sm">공통 객관식 (1-15번)</h4>
        {[0, 1, 2].map((groupIndex) => {
          const start = groupIndex * 5 + 1;
          const questionCount = 5;
          const end = start + questionCount - 1;
          const value = getAnswerGroupString(start, questionCount);
          return (
            <div key={groupIndex} className="grid grid-cols-6 gap-2 items-center">
              <div className="text-sm text-neutral-600">
                {start}-{end}번
              </div>
              <div className="col-span-5">
                <input
                  type="text"
                  value={value}
                  onChange={(event) => setAnswerGroupString(start, questionCount, event.target.value)}
                  className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  placeholder="예: 51234"
                  maxLength={questionCount}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t pt-4 space-y-3">
        <h4 className="font-medium text-sm">공통 주관식 (16-22번)</h4>
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 7 }, (_, subIndex) => {
            const questionNum = 16 + subIndex;
            const value = getAnswerForQuestion(questionNum);
            return (
              <div key={questionNum} className="space-y-1">
                <label className="text-xs text-neutral-600">{questionNum}번</label>
                <input
                  type="text"
                  value={value}
                  onChange={(event) => setAnswerForQuestion(questionNum, event.target.value)}
                  className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="답"
                  maxLength={3}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t pt-4 space-y-3">
        {/* 선택과목 드롭다운 */}
        <div className="bg-purple-50 rounded-lg px-3 py-2">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-sm text-purple-800">
                선택과목 {selectedMathElective ? `- ${selectedMathElective} (수능코드: ${SUNEUNG_ELECTIVE_CODE[selectedMathElective]})` : ''}
              </h4>
              <p className="text-xs text-purple-600 mt-0.5">선택문항 23-30번 입력</p>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMathDropdownOpen(!isMathDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border bg-white hover:bg-neutral-50"
              >
                <span>{selectedMathElective || '선택과목 선택'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isMathDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isMathDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 z-50 bg-white border rounded-lg shadow-lg min-w-[160px]">
                  {MATH_ELECTIVES.map((elective) => (
                    <button
                      key={elective}
                      type="button"
                      onClick={() => handleMathElectiveChange(elective)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-purple-50 ${
                        selectedMathElective === elective ? 'bg-purple-100 text-purple-800' : ''
                      }`}
                    >
                      {elective} (수능코드: {SUNEUNG_ELECTIVE_CODE[elective]})
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <h4 className="font-medium text-sm">선택 객관식 (23-28번)</h4>
        <div className="grid grid-cols-6 gap-2 items-center">
          <div className="text-sm text-neutral-600">23-28번</div>
          <div className="col-span-5">
            <input
              type="text"
              value={getAnswerGroupString(23, 6)}
              onChange={(event) => setAnswerGroupString(23, 6, event.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              placeholder="예: 512345"
              maxLength={6}
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-4 space-y-3">
        <h4 className="font-medium text-sm">선택 주관식 (29-30번)</h4>
        <div className="grid grid-cols-4 gap-3">
          {[29, 30].map((questionNum) => (
            <div key={questionNum} className="space-y-1">
              <label className="text-xs text-neutral-600">{questionNum}번</label>
              <input
                type="text"
                value={getAnswerForQuestion(questionNum)}
                onChange={(event) => setAnswerForQuestion(questionNum, event.target.value)}
                className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="답"
                maxLength={3}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const renderDefaultAnswerContent = () => {
    const total = getQuestionCount();
    return (
      <div className="space-y-3">
        {Array.from({ length: Math.ceil(total / 5) }, (_, groupIndex) => {
          const start = groupIndex * 5 + 1;
          const end = Math.min(start + 4, total);
          const questionCount = Math.max(0, end - start + 1);
          if (!questionCount) return null;
          return (
            <div key={groupIndex} className="grid grid-cols-6 gap-2 items-center">
              <div className="text-sm text-neutral-600">
                {start}-{end}번
              </div>
              <div className="col-span-5">
                <input
                  type="text"
                  value={getAnswerGroupString(start, questionCount)}
                  onChange={(event) => setAnswerGroupString(start, questionCount, event.target.value)}
                  className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  placeholder={`예: ${'12345'.substring(0, questionCount)}`}
                  maxLength={questionCount}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {questionCount}개 문항의 정답을 연속으로 입력하세요
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderCustomAnswerContent = () => {
    const total = customQuestionCount;
    const objective = Math.min(customMultipleChoice, total);
    const subjectiveCount = Math.max(0, total - objective);

    return (
      <>
        {objective > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">객관식 (1-{objective}번)</h4>
            {Array.from({ length: Math.ceil(objective / 5) }, (_, groupIndex) => {
              const start = groupIndex * 5 + 1;
              const end = Math.min(start + 4, objective);
              const questionCount = Math.max(0, end - start + 1);
              if (!questionCount) return null;
              return (
                <div key={groupIndex} className="grid grid-cols-6 gap-2 items-center">
                  <div className="text-sm text-neutral-600">
                    {start}-{end}번
                  </div>
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={getAnswerGroupString(start, questionCount)}
                      onChange={(event) => setAnswerGroupString(start, questionCount, event.target.value)}
                      className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                      placeholder={`예: ${'12345'.substring(0, questionCount)}`}
                      maxLength={questionCount}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {questionCount}개 문항의 정답을 연속으로 입력하세요
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {subjectiveCount > 0 && (
          <div className={`space-y-3 ${objective > 0 ? 'border-t pt-4' : ''}`}>
            <h4 className="font-medium text-sm">주관식 ({objective + 1}-{total}번)</h4>
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: subjectiveCount }, (_, subIndex) => {
                const questionNum = objective + subIndex + 1;
                return (
                  <div key={questionNum} className="space-y-1">
                    <label className="text-xs text-neutral-600">{questionNum}번</label>
                    <input
                      type="text"
                      value={getAnswerForQuestion(questionNum)}
                      onChange={(event) => setAnswerForQuestion(questionNum, event.target.value)}
                      className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="답"
                      maxLength={3}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {total === 0 && (
          <div className="text-center py-8 text-neutral-500">
            총 문항 수를 먼저 입력해주세요
          </div>
        )}
      </>
    );
  };

  // 탐구 과목 정답 입력 렌더링
  const renderExplorationAnswerContent = () => {
    const total = 20; // 탐구는 20문항
    
    return (
      <div className="space-y-4">
        {/* 탐구 과목 선택 드롭다운 */}
        <div className="bg-green-50 rounded-lg px-3 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-sm text-green-800">
                탐구 과목 {selectedExplorationSubject ? `- ${selectedExplorationSubject} (수능코드: ${SUNEUNG_ELECTIVE_CODE[selectedExplorationSubject]})` : ''}
              </h4>
              <p className="text-xs text-green-600 mt-0.5">
                {selectedExplorationSubject 
                  ? '과목을 변경하면 현재 입력한 답안이 자동 저장됩니다'
                  : '정답을 입력할 탐구 과목을 선택하세요'}
              </p>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsExplorationDropdownOpen(!isExplorationDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border bg-white hover:bg-neutral-50 min-w-[160px] justify-between"
              >
                <span>{selectedExplorationSubject || '과목 선택'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isExplorationDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isExplorationDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 z-50 bg-white border rounded-lg shadow-lg min-w-[200px] max-h-[300px] overflow-y-auto">
                  <div className="px-3 py-2 text-xs font-semibold text-neutral-500 bg-neutral-50 border-b">
                    사회탐구 (코드: 11-19)
                  </div>
                  {SOCIAL_SUBJECTS.map((subj) => (
                    <button
                      key={subj}
                      type="button"
                      onClick={() => handleExplorationSubjectChange(subj)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-green-50 flex items-center justify-between ${
                        selectedExplorationSubject === subj ? 'bg-green-100 text-green-800' : ''
                      }`}
                    >
                      <span>{subj}</span>
                      <span className="text-xs text-neutral-400">코드: {SUNEUNG_ELECTIVE_CODE[subj]}</span>
                    </button>
                  ))}
                  <div className="px-3 py-2 text-xs font-semibold text-neutral-500 bg-neutral-50 border-b border-t">
                    과학탐구 (코드: 20-27)
                  </div>
                  {SCIENCE_SUBJECTS.map((subj) => (
                    <button
                      key={subj}
                      type="button"
                      onClick={() => handleExplorationSubjectChange(subj)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-green-50 flex items-center justify-between ${
                        selectedExplorationSubject === subj ? 'bg-green-100 text-green-800' : ''
                      }`}
                    >
                      <span>{subj}</span>
                      <span className="text-xs text-neutral-400">코드: {SUNEUNG_ELECTIVE_CODE[subj]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* 저장된 과목 표시 */}
          {Object.keys(explorationAnswers).length > 0 && (
            <div className="mt-2 pt-2 border-t border-green-200">
              <p className="text-xs text-green-700">
                저장된 과목: {Object.keys(explorationAnswers).join(', ')}
              </p>
            </div>
          )}
        </div>
        
        {!selectedExplorationSubject ? (
          <div className="text-center py-8 text-neutral-500 bg-neutral-50 rounded-lg">
            탐구 과목을 먼저 선택해주세요
          </div>
        ) : (
          <div className="space-y-3">
            {Array.from({ length: Math.ceil(total / 5) }, (_, groupIndex) => {
              const start = groupIndex * 5 + 1;
              const end = Math.min(start + 4, total);
              const questionCount = Math.max(0, end - start + 1);
              if (!questionCount) return null;
              return (
                <div key={groupIndex} className="grid grid-cols-6 gap-2 items-center">
                  <div className="text-sm text-neutral-600">
                    {start}-{end}번
                  </div>
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={getAnswerGroupString(start, questionCount)}
                      onChange={(event) => setAnswerGroupString(start, questionCount, event.target.value)}
                      className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                      placeholder={`예: ${'12345'.substring(0, questionCount)}`}
                      maxLength={questionCount}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {questionCount}개 문항의 정답을 연속으로 입력하세요
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // 탐구 과목 배점 입력 렌더링
  const renderExplorationScoreContent = () => {
    const total = 20;
    
    return (
      <div className="space-y-4">
        {/* 탐구 과목 선택 드롭다운 */}
        <div className="bg-green-50 rounded-lg px-3 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-sm text-green-800">
                탐구 과목 {selectedExplorationSubject ? `- ${selectedExplorationSubject} (코드: ${SUBJECT_CODE_LOOKUP[selectedExplorationSubject] || '?'})` : ''}
              </h4>
              <p className="text-xs text-green-600 mt-0.5">
                {selectedExplorationSubject 
                  ? '과목을 변경하면 현재 입력한 배점이 자동 저장됩니다'
                  : '배점을 입력할 탐구 과목을 선택하세요'}
              </p>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsExplorationDropdownOpen(!isExplorationDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border bg-white hover:bg-neutral-50 min-w-[160px] justify-between"
              >
                <span>{selectedExplorationSubject || '과목 선택'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isExplorationDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isExplorationDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 z-50 bg-white border rounded-lg shadow-lg min-w-[200px] max-h-[300px] overflow-y-auto">
                  <div className="px-3 py-2 text-xs font-semibold text-neutral-500 bg-neutral-50 border-b">
                    사회탐구
                  </div>
                  {SOCIAL_SUBJECTS.map((subj) => (
                    <button
                      key={subj}
                      type="button"
                      onClick={() => handleExplorationSubjectChange(subj)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-green-50 flex items-center justify-between ${
                        selectedExplorationSubject === subj ? 'bg-green-100 text-green-800' : ''
                      }`}
                    >
                      <span>{subj}</span>
                      <span className="text-xs text-neutral-400">{SUBJECT_CODE_LOOKUP[subj]}</span>
                    </button>
                  ))}
                  <div className="px-3 py-2 text-xs font-semibold text-neutral-500 bg-neutral-50 border-b border-t">
                    과학탐구
                  </div>
                  {SCIENCE_SUBJECTS.map((subj) => (
                    <button
                      key={subj}
                      type="button"
                      onClick={() => handleExplorationSubjectChange(subj)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-green-50 flex items-center justify-between ${
                        selectedExplorationSubject === subj ? 'bg-green-100 text-green-800' : ''
                      }`}
                    >
                      <span>{subj}</span>
                      <span className="text-xs text-neutral-400">{SUBJECT_CODE_LOOKUP[subj]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {!selectedExplorationSubject ? (
          <div className="text-center py-8 text-neutral-500 bg-neutral-50 rounded-lg">
            탐구 과목을 먼저 선택해주세요
          </div>
        ) : (
          <div className="space-y-3">
            {Array.from({ length: Math.ceil(total / 5) }, (_, groupIndex) => {
              const start = groupIndex * 5 + 1;
              const end = Math.min(start + 4, total);
              const questionCount = Math.max(0, end - start + 1);
              if (!questionCount) return null;
              return (
                <div key={groupIndex} className="grid grid-cols-6 gap-2 items-center">
                  <div className="text-sm text-neutral-600">
                    {start}-{end}번
                  </div>
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={getScoreGroupString(start, questionCount)}
                      onChange={(event) => setScoreGroupString(start, questionCount, event.target.value)}
                      className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
                      placeholder={`예: ${'22222'.substring(0, questionCount)}`}
                      maxLength={questionCount}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {questionCount}개 문항의 배점을 연속으로 입력하세요
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // 국어 배점 입력 UI (공통 1-34번, 선택 35-45번)
  const renderKoreanScoreContent = () => (
    <>
      {/* 국어 공통 (코드: 1000) */}
      <div className="space-y-3">
        <div className="bg-green-50 rounded-lg px-3 py-2">
          <h4 className="font-semibold text-sm text-green-800">국어 공통 (코드: 1000) - 배점</h4>
          <p className="text-xs text-green-600 mt-0.5">모든 수험생이 풀어야 하는 공통 문항 (1-34번)</p>
        </div>
        
        <h4 className="font-medium text-sm">공통문항 배점 (1-34번)</h4>
        {Array.from({ length: 7 }, (_, groupIndex) => {
          const start = groupIndex * 5 + 1;
          const end = Math.min(start + 4, 34);
          const questionCount = Math.max(0, end - start + 1);
          if (questionCount <= 0) return null;
          return (
            <div key={groupIndex} className="grid grid-cols-6 gap-2 items-center">
              <div className="text-sm text-neutral-600">
                {start}-{end}번
              </div>
              <div className="col-span-5">
                <input
                  type="text"
                  value={getScoreGroupString(start, questionCount)}
                  onChange={(event) => setScoreGroupString(start, questionCount, event.target.value)}
                  className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
                  placeholder={`예: ${'22322'.substring(0, questionCount)}`}
                  maxLength={questionCount}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t pt-4 space-y-3">
        {/* 선택과목 배점 섹션 헤더 + 드롭다운 */}
        <div className="bg-purple-50 rounded-lg px-3 py-2">
          <h4 className="font-semibold text-sm text-purple-800">
            선택과목 배점 {selectedKoreanElective ? `- ${selectedKoreanElective} (수능코드: ${SUNEUNG_ELECTIVE_CODE[selectedKoreanElective]})` : ''}
          </h4>
          {/* 선택과목 드롭다운 (정답 입력과 연동) */}
          <div className="mt-2 relative">
            <button
              type="button"
              onClick={() => setIsKoreanDropdownOpen(!isKoreanDropdownOpen)}
              className="w-full flex items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm hover:border-purple-300"
            >
              <span>{selectedKoreanElective || '선택과목 선택'}</span>
              <ChevronDown size={16} className={`transition-transform ${isKoreanDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isKoreanDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 py-1">
                {KOREAN_ELECTIVES.map((elective) => (
                  <button
                    key={elective}
                    type="button"
                    onClick={() => {
                      setSelectedKoreanElective(elective);
                      setIsKoreanDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-purple-50 ${
                      selectedKoreanElective === elective ? 'bg-purple-100 text-purple-800' : ''
                    }`}
                  >
                    {elective} (코드: {SUNEUNG_ELECTIVE_CODE[elective]})
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <h4 className="font-medium text-sm">선택문항 배점 (35-45번)</h4>
        {[0, 1, 2].map((groupIndex) => {
          const start = 35 + groupIndex * 5;
          const end = Math.min(start + 4, 45);
          const questionCount = Math.max(0, end - start + 1);
          if (questionCount <= 0) return null;
          return (
            <div key={groupIndex} className="grid grid-cols-6 gap-2 items-center">
              <div className="text-sm text-neutral-600">{start}-{end}번</div>
              <div className="col-span-5">
                <input
                  type="text"
                  value={getScoreGroupString(start, questionCount)}
                  onChange={(event) => setScoreGroupString(start, questionCount, event.target.value)}
                  className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
                  placeholder={`예: ${'22322'.substring(0, questionCount)}`}
                  maxLength={questionCount}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );

  const renderMathScoreContent = () => (
    <>
      {/* 수학 공통 (코드: 2000) */}
      <div className="space-y-3">
        <div className="bg-green-50 rounded-lg px-3 py-2">
          <h4 className="font-semibold text-sm text-green-800">수학 공통 (코드: 2000) - 배점</h4>
          <p className="text-xs text-green-600 mt-0.5">모든 수험생이 풀어야 하는 공통 문항</p>
        </div>
        
        <h4 className="font-medium text-sm">공통 객관식 배점 (1-15번)</h4>
        {[0, 1, 2].map((groupIndex) => {
          const start = groupIndex * 5 + 1;
          const questionCount = 5;
          const end = start + questionCount - 1;
          return (
            <div key={groupIndex} className="grid grid-cols-6 gap-2 items-center">
              <div className="text-sm text-neutral-600">
                {start}-{end}번
              </div>
              <div className="col-span-5">
                <input
                  type="text"
                  value={getScoreGroupString(start, questionCount)}
                  onChange={(event) => setScoreGroupString(start, questionCount, event.target.value)}
                  className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
                  placeholder="예: 22322"
                  maxLength={questionCount}
                />
                <div className="text-xs text-gray-500 mt-1">
                  5개 문항의 배점을 연속으로 입력하세요 (예: 22322)
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t pt-4 space-y-3">
        <h4 className="font-medium text-sm">공통 주관식 배점 (16-22번)</h4>
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 7 }, (_, subIndex) => {
            const questionNum = 16 + subIndex;
            return (
              <div key={questionNum} className="space-y-1">
                <label className="text-xs text-neutral-600">{questionNum}번</label>
                <input
                  type="text"
                  value={getScoreForQuestion(questionNum)}
                  onChange={(event) => setScoreForQuestion(questionNum, event.target.value)}
                  className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="배점"
                  maxLength={1}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t pt-4 space-y-3">
        {/* 선택과목 배점 섹션 헤더 + 드롭다운 */}
        <div className="bg-purple-50 rounded-lg px-3 py-2">
          <h4 className="font-semibold text-sm text-purple-800">
            선택과목 배점 {selectedMathElective ? `- ${selectedMathElective} (수능코드: ${SUNEUNG_ELECTIVE_CODE[selectedMathElective]})` : ''}
          </h4>
          {/* 선택과목 드롭다운 (정답 입력과 연동) */}
          <div className="mt-2 relative">
            <button
              type="button"
              onClick={() => setIsMathDropdownOpen(!isMathDropdownOpen)}
              className="w-full flex items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm hover:border-purple-300"
            >
              <span>{selectedMathElective || '선택과목 선택'}</span>
              <ChevronDown size={16} className={`transition-transform ${isMathDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isMathDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 py-1">
                {MATH_ELECTIVES.map((elective) => (
                  <button
                    key={elective}
                    type="button"
                    onClick={() => {
                      setSelectedMathElective(elective);
                      setIsMathDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-purple-50 ${
                      selectedMathElective === elective ? 'bg-purple-100 text-purple-800' : ''
                    }`}
                  >
                    {elective} (코드: {SUNEUNG_ELECTIVE_CODE[elective]})
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <h4 className="font-medium text-sm">선택 객관식 배점 (23-28번)</h4>
        <div className="grid grid-cols-6 gap-2 items-center">
          <div className="text-sm text-neutral-600">23-28번</div>
          <div className="col-span-5">
            <input
              type="text"
              value={getScoreGroupString(23, 6)}
              onChange={(event) => setScoreGroupString(23, 6, event.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
              placeholder="예: 223322"
              maxLength={6}
            />
            <div className="text-xs text-gray-500 mt-1">
              6개 문항의 배점을 연속으로 입력하세요 (예: 223322)
            </div>
          </div>
        </div>
      </div>

      <div className="border-t pt-4 space-y-3">
        <h4 className="font-medium text-sm">선택 주관식 배점 (29-30번)</h4>
        <div className="grid grid-cols-4 gap-3">
          {[29, 30].map((questionNum) => (
            <div key={questionNum} className="space-y-1">
              <label className="text-xs text-neutral-600">{questionNum}번</label>
              <input
                type="text"
                value={getScoreForQuestion(questionNum)}
                onChange={(event) => setScoreForQuestion(questionNum, event.target.value)}
                className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="배점"
                maxLength={1}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const renderDefaultScoreContent = () => {
    const total = getQuestionCount();
    return (
      <div className="space-y-3">
        {Array.from({ length: Math.ceil(total / 5) }, (_, groupIndex) => {
          const start = groupIndex * 5 + 1;
          const end = Math.min(start + 4, total);
          const questionCount = Math.max(0, end - start + 1);
          if (!questionCount) return null;
          return (
            <div key={groupIndex} className="grid grid-cols-6 gap-2 items-center">
              <div className="text-sm text-neutral-600">
                {start}-{end}번
              </div>
              <div className="col-span-5">
                <input
                  type="text"
                  value={getScoreGroupString(start, questionCount)}
                  onChange={(event) => setScoreGroupString(start, questionCount, event.target.value)}
                  className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
                  placeholder={`예: ${'22322'.substring(0, questionCount)}`}
                  maxLength={questionCount}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {questionCount}개 문항의 배점을 연속으로 입력하세요
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderCustomScoreContent = () => {
    const total = customQuestionCount;
    const objective = Math.min(customMultipleChoice, total);
    const subjectiveCount = Math.max(0, total - objective);

    return (
      <>
        {objective > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">객관식 배점 (1-{objective}번)</h4>
            {Array.from({ length: Math.ceil(objective / 5) }, (_, groupIndex) => {
              const start = groupIndex * 5 + 1;
              const end = Math.min(start + 4, objective);
              const questionCount = Math.max(0, end - start + 1);
              if (!questionCount) return null;
              return (
                <div key={groupIndex} className="grid grid-cols-6 gap-2 items-center">
                  <div className="text-sm text-neutral-600">
                    {start}-{end}번
                  </div>
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={getScoreGroupString(start, questionCount)}
                      onChange={(event) => setScoreGroupString(start, questionCount, event.target.value)}
                      className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
                      placeholder={`예: ${'22322'.substring(0, questionCount)}`}
                      maxLength={questionCount}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {questionCount}개 문항의 배점을 연속으로 입력하세요
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {subjectiveCount > 0 && (
          <div className={`space-y-3 ${objective > 0 ? 'border-t pt-4' : ''}`}>
            <h4 className="font-medium text-sm">주관식 배점 ({objective + 1}-{total}번)</h4>
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: subjectiveCount }, (_, subIndex) => {
                const questionNum = objective + subIndex + 1;
                return (
                  <div key={questionNum} className="space-y-1">
                    <label className="text-xs text-neutral-600">{questionNum}번</label>
                    <input
                      type="text"
                      value={getScoreForQuestion(questionNum)}
                      onChange={(event) => setScoreForQuestion(questionNum, event.target.value)}
                      className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="배점"
                      maxLength={1}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </>
    );
  };

  const [answers, setAnswers] = useState<string[]>(() =>
    questionItems.map(() => ''),
  );
  const [scores, setScores] = useState<string[]>(() =>
    questionItems.map(() => ''),
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'answers' | 'scores'>('answers');
  const [loadingFromDB, setLoadingFromDB] = useState(false);
  
  // 국어 선택과목 상태 (선택문항 35-45번) - 기본값: 첫 번째 선택과목
  const [selectedKoreanElective, setSelectedKoreanElective] = useState<string>(KOREAN_ELECTIVES[0]);
  const [koreanElectiveAnswers, setKoreanElectiveAnswers] = useState<Record<string, { answers: Record<string, string>; scores: Record<string, string> }>>({});
  const [isKoreanDropdownOpen, setIsKoreanDropdownOpen] = useState(false);
  
  // 수학 선택과목 상태 (선택문항 23-30번) - 기본값: 첫 번째 선택과목 (확률과 통계)
  const [selectedMathElective, setSelectedMathElective] = useState<string>(MATH_ELECTIVES[0]);
  const [mathElectiveAnswers, setMathElectiveAnswers] = useState<Record<string, { answers: Record<string, string>; scores: Record<string, string> }>>({});
  const [isMathDropdownOpen, setIsMathDropdownOpen] = useState(false);
  
  // 탐구 과목 선택 상태 - 기본값: 첫 번째 선택과목 (생활과 윤리)
  const [selectedExplorationSubject, setSelectedExplorationSubject] = useState<string>(ALL_EXPLORATION_SUBJECTS[0]);
  const [explorationAnswers, setExplorationAnswers] = useState<Record<string, { answers: Record<string, string>; scores: Record<string, string> }>>({});
  const [isExplorationDropdownOpen, setIsExplorationDropdownOpen] = useState(false);
  
  // 덮어쓰기 확인 모달 상태
  const [isOverwriteModalOpen, setIsOverwriteModalOpen] = useState(false);
  const [existingAnswerCount, setExistingAnswerCount] = useState(0);

  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const xlsxInputRef = useRef<HTMLInputElement | null>(null);
  const answerRefs = useRef<Array<HTMLInputElement | null>>([]);
  const scoreRefs = useRef<Array<HTMLInputElement | null>>([]);
  const hasInitialized = useRef(false);  // 초기화 여부 추적
  
  // 현재 입력된 답안을 맵으로 변환
  const getCurrentAnswersMap = useCallback(() => {
    const answersMap: Record<string, string> = {};
    const scoresMap: Record<string, string> = {};
    questionItems.forEach((item, idx) => {
      if (answers[idx]) answersMap[item.qid] = answers[idx];
      if (scores[idx]) scoresMap[item.qid] = scores[idx];
    });
    return { answers: answersMap, scores: scoresMap };
  }, [answers, scores, questionItems]);
  
  // 특정 범위의 답안만 맵으로 변환 (선택과목용)
  const getElectiveAnswersMap = useCallback((startQ: number, endQ: number) => {
    const answersMap: Record<string, string> = {};
    const scoresMap: Record<string, string> = {};
    questionItems.forEach((item, idx) => {
      const qNum = parseInt(item.qid.replace(/\D/g, ''), 10);
      if (qNum >= startQ && qNum <= endQ) {
        if (answers[idx]) answersMap[item.qid] = answers[idx];
        if (scores[idx]) scoresMap[item.qid] = scores[idx];
      }
    });
    return { answers: answersMap, scores: scoresMap };
  }, [answers, scores, questionItems]);
  
  // 맵에서 답안 배열로 복원
  const restoreAnswersFromMap = useCallback((data: { answers: Record<string, string>; scores: Record<string, string> }) => {
    const qidToIndex = new Map<string, number>();
    questionItems.forEach((item, idx) => {
      qidToIndex.set(item.qid, idx);
    });
    
    const newAnswers = questionItems.map(() => '');
    const newScores = questionItems.map(() => '');
    
    Object.entries(data.answers).forEach(([qid, value]) => {
      const idx = qidToIndex.get(qid);
      if (idx !== undefined) {
        newAnswers[idx] = value;
      }
    });
    
    Object.entries(data.scores).forEach(([qid, value]) => {
      const idx = qidToIndex.get(qid);
      if (idx !== undefined) {
        newScores[idx] = value;
      }
    });
    
    setAnswers(newAnswers);
    setScores(newScores);
  }, [questionItems]);

  // 특정 범위의 답안만 복원 (선택과목용 - 공통문항 보존)
  const restoreElectiveAnswersFromMap = useCallback((data: { answers: Record<string, string>; scores: Record<string, string> }, startQ: number, endQ: number) => {
    const qidToIndex = new Map<string, number>();
    questionItems.forEach((item, idx) => {
      qidToIndex.set(item.qid, idx);
    });
    
    setAnswers(prev => {
      const newAnswers = [...prev];
      // 먼저 선택과목 범위 초기화
      questionItems.forEach((item, idx) => {
        const qNum = parseInt(item.qid.replace(/\D/g, ''), 10);
        if (qNum >= startQ && qNum <= endQ) {
          newAnswers[idx] = '';
        }
      });
      // 저장된 데이터 복원
      Object.entries(data.answers).forEach(([qid, value]) => {
        const idx = qidToIndex.get(qid);
        if (idx !== undefined) {
          newAnswers[idx] = value;
        }
      });
      return newAnswers;
    });
    
    setScores(prev => {
      const newScores = [...prev];
      // 먼저 선택과목 범위 초기화
      questionItems.forEach((item, idx) => {
        const qNum = parseInt(item.qid.replace(/\D/g, ''), 10);
        if (qNum >= startQ && qNum <= endQ) {
          newScores[idx] = '';
        }
      });
      // 저장된 데이터 복원
      Object.entries(data.scores).forEach(([qid, value]) => {
        const idx = qidToIndex.get(qid);
        if (idx !== undefined) {
          newScores[idx] = value;
        }
      });
      return newScores;
    });
  }, [questionItems]);
  
  // 국어 선택과목 변경 핸들러 (자동 저장 후 로드) - 선택문항 35-45번
  const handleKoreanElectiveChange = useCallback((newElective: string) => {
    const KOREAN_ELECTIVE_START = 35;
    const KOREAN_ELECTIVE_END = 45;
    
    // 현재 입력된 선택과목 답안만 저장
    if (selectedKoreanElective) {
      const currentData = getElectiveAnswersMap(KOREAN_ELECTIVE_START, KOREAN_ELECTIVE_END);
      setKoreanElectiveAnswers(prev => ({
        ...prev,
        [selectedKoreanElective]: currentData,
      }));
    }
    
    // 새 선택과목 설정
    setSelectedKoreanElective(newElective);
    setIsKoreanDropdownOpen(false);
    
    // 저장된 답안이 있으면 선택문항만 복원 (공통문항 유지)
    if (newElective && koreanElectiveAnswers[newElective]) {
      restoreElectiveAnswersFromMap(koreanElectiveAnswers[newElective], KOREAN_ELECTIVE_START, KOREAN_ELECTIVE_END);
    } else {
      // 없으면 선택문항만 초기화 (공통문항 1-34번은 유지)
      setAnswers(prev => {
        const newArr = [...prev];
        questionItems.forEach((item, idx) => {
          const qNum = parseInt(item.qid.replace(/\D/g, ''), 10);
          if (qNum >= KOREAN_ELECTIVE_START && qNum <= KOREAN_ELECTIVE_END) {
            newArr[idx] = '';
          }
        });
        return newArr;
      });
      setScores(prev => {
        const newArr = [...prev];
        questionItems.forEach((item, idx) => {
          const qNum = parseInt(item.qid.replace(/\D/g, ''), 10);
          if (qNum >= KOREAN_ELECTIVE_START && qNum <= KOREAN_ELECTIVE_END) {
            newArr[idx] = '';
          }
        });
        return newArr;
      });
    }
  }, [selectedKoreanElective, getElectiveAnswersMap, koreanElectiveAnswers, restoreElectiveAnswersFromMap, questionItems]);
  
  // 수학 선택과목 변경 핸들러 (자동 저장 후 로드) - 선택문항 23-30번
  const handleMathElectiveChange = useCallback((newElective: string) => {
    const MATH_ELECTIVE_START = 23;
    const MATH_ELECTIVE_END = 30;
    
    // 현재 입력된 선택과목 답안만 저장
    if (selectedMathElective) {
      const currentData = getElectiveAnswersMap(MATH_ELECTIVE_START, MATH_ELECTIVE_END);
      setMathElectiveAnswers(prev => ({
        ...prev,
        [selectedMathElective]: currentData,
      }));
    }
    
    // 새 선택과목 설정
    setSelectedMathElective(newElective);
    setIsMathDropdownOpen(false);
    
    // 저장된 답안이 있으면 선택문항만 복원 (공통문항 유지)
    if (newElective && mathElectiveAnswers[newElective]) {
      restoreElectiveAnswersFromMap(mathElectiveAnswers[newElective], MATH_ELECTIVE_START, MATH_ELECTIVE_END);
    } else {
      // 없으면 선택문항만 초기화 (공통문항 1-22번은 유지)
      setAnswers(prev => {
        const newArr = [...prev];
        questionItems.forEach((item, idx) => {
          const qNum = parseInt(item.qid.replace(/\D/g, ''), 10);
          if (qNum >= MATH_ELECTIVE_START && qNum <= MATH_ELECTIVE_END) {
            newArr[idx] = '';
          }
        });
        return newArr;
      });
      setScores(prev => {
        const newArr = [...prev];
        questionItems.forEach((item, idx) => {
          const qNum = parseInt(item.qid.replace(/\D/g, ''), 10);
          if (qNum >= MATH_ELECTIVE_START && qNum <= MATH_ELECTIVE_END) {
            newArr[idx] = '';
          }
        });
        return newArr;
      });
    }
  }, [selectedMathElective, getElectiveAnswersMap, mathElectiveAnswers, restoreElectiveAnswersFromMap, questionItems]);
  
  // 탐구 과목 변경 핸들러 (자동 저장 후 로드) - 탐구는 전체가 선택과목이므로 전체 저장/복원
  const handleExplorationSubjectChange = useCallback((newSubject: string) => {
    // 현재 입력된 답안 저장 (탐구는 1-20번 전체)
    if (selectedExplorationSubject) {
      const currentData = getCurrentAnswersMap();
      setExplorationAnswers(prev => ({
        ...prev,
        [selectedExplorationSubject]: currentData,
      }));
    }
    
    // 새 과목 설정
    setSelectedExplorationSubject(newSubject);
    setIsExplorationDropdownOpen(false);
    
    // 저장된 답안이 있으면 복원
    if (newSubject && explorationAnswers[newSubject]) {
      restoreAnswersFromMap(explorationAnswers[newSubject]);
    } else {
      // 없으면 빈 배열로 초기화
      setAnswers(questionItems.map(() => ''));
      setScores(questionItems.map(() => ''));
    }
  }, [selectedExplorationSubject, getCurrentAnswersMap, explorationAnswers, restoreAnswersFromMap, questionItems]);
  
  // 기존 정답 데이터 확인
  const checkExistingAnswerKey = useCallback(async (): Promise<number> => {
    if (!examMetadata?.subjectCode) return 0;
    
    try {
      const response = await fetch('/api/check-existing-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exam_year: examMetadata.examYear,
          exam_month: examMetadata.examMonth,
          provider_name: examMetadata.providerName,
          grade_level: examMetadata.gradeLevel,
          exam_code: examMetadata.examCode,
          subject_code: examMetadata.subjectCode,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.existing_answer_count || 0;
      }
    } catch (error) {
      console.error('Error checking existing answer key:', error);
    }
    return 0;
  }, [examMetadata]);
  
  // DB에서 정답 불러오기
  const fetchAnswersFromDB = async () => {
    if (!examMetadata?.subjectCode) return null;
    
    try {
      setLoadingFromDB(true);
      const resp = await fetch('/api/exams/answer-keys/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metadata: {
            providerName: examMetadata.providerName,
            examYear: examMetadata.examYear,
            examMonth: examMetadata.examMonth,
            examCode: examMetadata.examCode,
            gradeLevel: examMetadata.gradeLevel,
            examLabel: examMetadata.examLabel,
            subjectCode: examMetadata.subjectCode,
            subjectName: examMetadata.subjectName,
            paperLabel: examMetadata.paperLabel,
          }
        }),
      });
      
      if (!resp.ok) return null;
      
      const data = await resp.json();
      if (!data.questions || data.questions.length === 0) return null;
      
      // Convert DB questions to answers/scores format
      const dbAnswers: Record<string, string> = {};
      const dbScores: Record<string, string> = {};
      
      // Extract elective subject from question metadata
      let detectedMathElective: string | null = null;
      let detectedKoreanElective: string | null = null;
      let detectedExplorationSubject: string | null = null;
      
      // Math elective range: 23-30, Korean elective range: 35-45
      const MATH_ELECTIVE_START = 23;
      const MATH_ELECTIVE_END = 30;
      const KOREAN_ELECTIVE_START = 35;
      const KOREAN_ELECTIVE_END = 45;
      
      for (const q of data.questions) {
        const qid = `Q${q.number}`;
        // Determine answer string
        if (q.correctChoice !== null && q.correctChoice !== undefined) {
          dbAnswers[qid] = String(q.correctChoice);
        } else if (q.correctChoices && q.correctChoices.length > 0) {
          dbAnswers[qid] = q.correctChoices.join('');
        } else if (q.correctText) {
          dbAnswers[qid] = q.correctText;
        }
        // Score
        if (q.points !== null && q.points !== undefined) {
          dbScores[qid] = String(q.points);
        }
        
        // Extract elective subject from metadata
        if (q.metadata?.electiveSubject) {
          const electiveSubject = q.metadata.electiveSubject;
          const qNumber = q.number;
          
          // Detect math elective (questions 23-30)
          if (qNumber >= MATH_ELECTIVE_START && qNumber <= MATH_ELECTIVE_END) {
            if (!detectedMathElective && MATH_ELECTIVES.includes(electiveSubject)) {
              detectedMathElective = electiveSubject;
            }
          }
          // Detect Korean elective (questions 35-45)
          else if (qNumber >= KOREAN_ELECTIVE_START && qNumber <= KOREAN_ELECTIVE_END) {
            if (!detectedKoreanElective && KOREAN_ELECTIVES.includes(electiveSubject)) {
              detectedKoreanElective = electiveSubject;
            }
          }
          // Detect exploration subject (all questions for exploration subjects)
          else if (ALL_EXPLORATION_SUBJECTS.includes(electiveSubject)) {
            if (!detectedExplorationSubject) {
              detectedExplorationSubject = electiveSubject;
            }
          }
        }
      }
      
      return { 
        answers: dbAnswers, 
        scores: dbScores,
        selectedMathElective: detectedMathElective,
        selectedKoreanElective: detectedKoreanElective,
        selectedExplorationSubject: detectedExplorationSubject,
      };
    } catch (error) {
      console.warn('DB에서 정답을 불러오는 중 오류:', error);
      return null;
    } finally {
      setLoadingFromDB(false);
    }
  };

  useEffect(() => {
    if (!open) {
      hasInitialized.current = false;  // 모달 닫히면 초기화 플래그 리셋
      return;
    }
    
    // 이미 초기화되었으면 스킵 (무한루프 방지)
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    const initialize = async () => {
      // 1. initialAnswers가 있으면 복원
      if (initialAnswers && (Object.keys(initialAnswers.answers).length > 0 || Object.keys(initialAnswers.scores).length > 0)) {
        const qidToIndex = new Map<string, number>();
        questionItems.forEach((item, idx) => {
          qidToIndex.set(item.qid, idx);
        });
        
        const restoredAnswers = questionItems.map(() => '');
        const restoredScores = questionItems.map(() => '');
        
        Object.entries(initialAnswers.answers).forEach(([qid, value]) => {
          const idx = qidToIndex.get(qid);
          if (idx !== undefined) {
            restoredAnswers[idx] = value;
          }
        });
        
        Object.entries(initialAnswers.scores).forEach(([qid, value]) => {
          const idx = qidToIndex.get(qid);
          if (idx !== undefined) {
            restoredScores[idx] = value;
          }
        });
        
        setAnswers(restoredAnswers);
        setScores(restoredScores);
        
        // 국어/수학 선택과목/탐구 과목별 답안 복원
        if (initialAnswers.koreanElectiveAnswers) {
          setKoreanElectiveAnswers(initialAnswers.koreanElectiveAnswers);
        }
        if (initialAnswers.mathElectiveAnswers) {
          setMathElectiveAnswers(initialAnswers.mathElectiveAnswers);
        }
        if (initialAnswers.explorationAnswers) {
          setExplorationAnswers(initialAnswers.explorationAnswers);
        }
        if (initialAnswers.selectedKoreanElective) {
          setSelectedKoreanElective(initialAnswers.selectedKoreanElective);
        }
        if (initialAnswers.selectedMathElective) {
          setSelectedMathElective(initialAnswers.selectedMathElective);
        }
        if (initialAnswers.selectedExplorationSubject) {
          setSelectedExplorationSubject(initialAnswers.selectedExplorationSubject);
        }
        
        setMessage(null);
        setActiveTab('answers');
        return;
      }
      
      // 2. DB에서 정답 불러오기 시도
      const dbData = await fetchAnswersFromDB();
      if (dbData && (Object.keys(dbData.answers).length > 0 || Object.keys(dbData.scores).length > 0)) {
        const qidToIndex = new Map<string, number>();
        questionItems.forEach((item, idx) => {
          qidToIndex.set(item.qid, idx);
        });
        
        const restoredAnswers = questionItems.map(() => '');
        const restoredScores = questionItems.map(() => '');
        
        Object.entries(dbData.answers).forEach(([qid, value]) => {
          const idx = qidToIndex.get(qid);
          if (idx !== undefined) {
            restoredAnswers[idx] = value;
          }
        });
        
        Object.entries(dbData.scores).forEach(([qid, value]) => {
          const idx = qidToIndex.get(qid);
          if (idx !== undefined) {
            restoredScores[idx] = value;
          }
        });
        
        setAnswers(restoredAnswers);
        setScores(restoredScores);
        
        // Restore elective selections from DB if available
        if (dbData.selectedMathElective) {
          setSelectedMathElective(dbData.selectedMathElective);
        }
        if (dbData.selectedKoreanElective) {
          setSelectedKoreanElective(dbData.selectedKoreanElective);
        }
        if (dbData.selectedExplorationSubject) {
          setSelectedExplorationSubject(dbData.selectedExplorationSubject);
        }
        
        setMessage('DB에서 기존 정답을 불러왔습니다.');
        setActiveTab('answers');
        return;
      }
      
      // 3. 빈 배열로 초기화
      setAnswers(questionItems.map(() => ''));
      setScores(questionItems.map(() => ''));
      setMessage(null);
      setActiveTab('answers');
    };
    
    initialize();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, questionItems, examMetadata?.subjectCode, examMetadata?.examCode]);

  useEffect(() => {
    if (open && firstInputRef.current) firstInputRef.current.focus();
  }, [open]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose?.();
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'enter') {
        void handleSaveToServer();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, questionItems, sessionId]);

  // 답안/배점 변경 시 부모에게 알림 (세션 유지용)
  useEffect(() => {
    if (!onAnswersChange) return;
    const answersMap: Record<string, string> = {};
    const scoresMap: Record<string, string> = {};
    questionItems.forEach((item, idx) => {
      if (answers[idx]) answersMap[item.qid] = answers[idx];
      if (scores[idx]) scoresMap[item.qid] = scores[idx];
    });
    // 하나라도 입력된 경우에만 전달 (국어/수학/탐구 선택과목별 답안도 포함)
    const hasAnyData = Object.keys(answersMap).length > 0 || 
                       Object.keys(scoresMap).length > 0 ||
                       Object.keys(koreanElectiveAnswers).length > 0 ||
                       Object.keys(mathElectiveAnswers).length > 0 ||
                       Object.keys(explorationAnswers).length > 0;
    if (hasAnyData) {
      onAnswersChange({ 
        answers: answersMap, 
        scores: scoresMap,
        koreanElectiveAnswers,
        mathElectiveAnswers,
        explorationAnswers,
        selectedKoreanElective,
        selectedMathElective,
        selectedExplorationSubject,
      });
    }
  }, [answers, scores, questionItems, onAnswersChange, koreanElectiveAnswers, mathElectiveAnswers, explorationAnswers, selectedKoreanElective, selectedMathElective, selectedExplorationSubject]);

  if (!open) return null;

  const handleChange = (item: QuestionItem, idx: number, value: string) => {
    const sanitized = (item.kind === 'grid' ? value.toUpperCase() : value)
      .slice(0, item.maxLength)
      .replace(/\s+/g, '');
    setAnswers((prev) => {
      const next = prev.slice();
      next[idx] = sanitized;
      return next;
    });
  };

  const handleScoreChange = (idx: number, value: string) => {
    const sanitized = value.replace(/[^0-9]/g, '').slice(0, 3);
    setScores((prev) => {
      const next = prev.slice();
      next[idx] = sanitized;
      return next;
    });
  };

  const buildAnswerKeyPayload = () => {
    if (!examMetadata || !examMetadata.subjectCode) return null;

    const metadataPayload = {
      providerName: examMetadata.providerName ?? null,
      examYear: examMetadata.examYear ?? null,
      examMonth: examMetadata.examMonth ?? null,
      examCode: examMetadata.examCode ?? fileName ?? null,
      gradeLevel: examMetadata.gradeLevel ?? null,
      examLabel: examMetadata.examLabel ?? fileName ?? null,
      subjectCode: examMetadata.subjectCode,
      subjectName: examMetadata.subjectName,
      paperLabel:
        examMetadata.paperLabel ?? examMetadata.subjectName ?? fileName ?? null,
    };

    // 선택과목 범위 정의
    const KOREAN_ELECTIVE_START = 35;
    const KOREAN_ELECTIVE_END = 45;
    const MATH_ELECTIVE_START = 23;
    const MATH_ELECTIVE_END = 30;

    // 선택과목 정보 결정 함수
    const getElectiveMetadata = (qNumber: number): Record<string, string> | null => {
      const subjectCode = examMetadata.subjectCode;
      
      // 국어: 35-45번은 선택과목
      if ((subjectCode === 'KOR' || subjectCode === '1000') && 
          qNumber >= KOREAN_ELECTIVE_START && qNumber <= KOREAN_ELECTIVE_END) {
        if (selectedKoreanElective) {
          return { electiveSubject: selectedKoreanElective };
        }
      }
      
      // 수학: 23-30번은 선택과목
      if ((subjectCode === 'MATH' || subjectCode === '2000') &&
          qNumber >= MATH_ELECTIVE_START && qNumber <= MATH_ELECTIVE_END) {
        if (selectedMathElective) {
          return { electiveSubject: selectedMathElective };
        }
      }
      
      // 탐구: 전체가 선택과목
      if (subjectCode?.startsWith('SOC_') || subjectCode?.startsWith('SCI_') ||
          subjectCode?.startsWith('41') || subjectCode?.startsWith('42')) {
        if (selectedExplorationSubject) {
          return { electiveSubject: selectedExplorationSubject };
        }
      }
      
      return null;
    };

    const questions = questionItems
      .map((item, idx) => {
        const numeric = Number(String(item.qid).replace(/[^0-9]/g, ''));
        if (!Number.isFinite(numeric) || numeric <= 0) return null;

        const rawAnswer = (answers[idx] ?? '').trim();
        const normalizedAnswer = rawAnswer.toUpperCase();
        const rawScore = (scores[idx] ?? '').trim();
        let points = Number(rawScore);
        if (!Number.isFinite(points) || points <= 0) {
          points = 1;
        }

        let correctChoice: number | null = null;
        let correctChoices: number[] | null = null;
        let correctText: string | null = null;

        if (/^[A-E1-5]$/.test(normalizedAnswer)) {
          correctChoice = toChoice(normalizedAnswer);
        } else if (/^[A-E]+$/.test(normalizedAnswer)) {
          const choiceList = toChoiceList(normalizedAnswer);
          correctChoices = choiceList.length ? choiceList : null;
        } else if (rawAnswer) {
          correctText = rawAnswer;
        }

        // 선택과목 정보를 metadata에 포함
        const electiveMetadata = getElectiveMetadata(numeric);

        return {
          number: numeric,
          points,
          correctChoice: correctChoice ?? null,
          correctChoices,
          correctText,
          metadata: electiveMetadata,
        };
      })
      .filter(
        (
          item,
        ): item is {
          number: number;
          points: number;
          correctChoice: number | null;
          correctChoices: number[] | null;
          correctText: string | null;
          metadata: Record<string, string> | null;
        } => item !== null,
      );

    if (!questions.length) return null;
    return { metadata: metadataPayload, questions };
  };

  const buildCSVText = () => {
    const lines = ['q,answer,score'];
    questionItems.forEach((item, idx) => {
      const q = csvEscape(item.qid);
      const a = csvEscape(String(answers[idx] ?? ''));
      const s = csvEscape(String(scores[idx] ?? ''));
      lines.push(`${q},${a},${s}`);
    });
    return lines.join('\n');
  };

  const importCSV = async (file: File) => {
    setMessage(null);
    const text = await file.text();
    const { header, rows } = parseCSV(text);

    const qi = header.findIndex(
      (h) => String(h).trim().toLowerCase() === 'q',
    );
    const ai = header.findIndex(
      (h) => String(h).trim().toLowerCase() === 'answer',
    );
    const si = header.findIndex(
      (h) => String(h).trim().toLowerCase() === 'score',
    );
    if (qi < 0 || ai < 0 || si < 0) {
      setMessage('CSV 헤더에 q, answer, score 컬럼이 필요합니다.');
      return;
    }

    const map = new Map<string, { a: string; s: string }>();
    rows.forEach((row) => {
      const q = String(row[qi] ?? '').trim();
      const a = String(row[ai] ?? '').trim();
      const s = String(row[si] ?? '').trim();
      if (q) map.set(q, { a, s });
    });

    let applied = 0;
    setAnswers((prev) => {
      const next = prev.slice();
      questionItems.forEach((item, idx) => {
        const key = item.qid;
        if (map.has(key)) {
          next[idx] = map.get(key)?.a ?? '';
          applied += 1;
        }
      });
      return next;
    });

    setScores((prev) => {
      const next = prev.slice();
      questionItems.forEach((item, idx) => {
        const key = item.qid;
        if (map.has(key)) {
          next[idx] = map.get(key)?.s ?? '';
        }
      });
      return next;
    });
    setMessage(`${applied}개의 문항을 CSV에서 가져왔습니다.`);
  };

  const handleDownloadCSV = () => {
    try {
      const csvText = buildCSVText();
      const blob = new Blob(['\uFEFF' + csvText], {
        type: 'text/csv;charset=utf-8;',
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      const downloadName = fileName ? `${fileName}.csv` : 'answers.csv';
      anchor.href = url;
      anchor.download = downloadName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setMessage(`${downloadName} 다운로드 시작`);
    } catch (error) {
      console.error(error);
      setMessage('CSV 생성/다운로드 중 오류가 발생했습니다.');
    }
  };

  // 실제 저장 실행 (확인 후 호출됨) - DB에만 저장
  const executeSaveToServer = async () => {
    setMessage(null);
    
    const hasMetadataForDB = !!examMetadata?.subjectCode;
    
    if (!hasMetadataForDB) {
      setMessage('저장을 위해 시험 정보(과목 선택)가 필요합니다.');
      return;
    }
    if (questionItems.length === 0) {
      setMessage('처리할 문항이 없습니다. 과목을 먼저 선택해주세요.');
      return;
    }
    
    try {
      setSaving(true);
      let dbSaved = false;
      
      // DB 저장 (CSV 저장은 더 이상 사용하지 않음)
      const answerKeyPayload = buildAnswerKeyPayload();
      if (answerKeyPayload) {
        try {
          const keyResp = await fetch('/api/exams/answer-keys', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(answerKeyPayload),
          });
          if (keyResp.ok) {
            const keyResult = await keyResp.json().catch(() => ({}));
            dbSaved = keyResult.storage === 'database';
            // 정답 파일명을 메타데이터 기반으로 설정
            const safeName = `${examMetadata.examCode || 'exam'}_${examMetadata.subjectCode}.json`;
            onAnswerFileNameChange?.(safeName);
          } else {
            const txt = await safeText(keyResp);
            console.warn(
              `답안 데이터 저장 실패(${keyResp.status}): ${txt || '서버 오류'}`,
            );
          }
        } catch (err) {
          console.warn('답안 데이터 저장 중 오류가 발생했습니다.', err);
        }
      }
      
      // 저장 결과 메시지
      if (dbSaved) {
        setMessage('✅ DB 저장 완료! 정답이 데이터베이스에 저장되었습니다.');
      } else {
        setMessage('❌ 저장 실패. 시험 정보를 확인해주세요.');
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '업로드 중 오류가 발생했습니다.';
      setMessage(`❌ ${message}`);
    } finally {
      setSaving(false);
    }
  };

  // 저장 시작 (기존 데이터 확인) - DB만 저장
  const handleSaveToServer = async () => {
    setMessage(null);
    
    const hasMetadataForDB = !!examMetadata?.subjectCode;
    
    if (!hasMetadataForDB) {
      setMessage('저장을 위해 시험 정보(과목 선택)가 필요합니다.');
      return;
    }
    
    if (questionItems.length === 0) {
      setMessage('처리할 문항이 없습니다. 과목을 먼저 선택해주세요.');
      return;
    }
    
    // 기존 정답 데이터 확인
    const existingCount = await checkExistingAnswerKey();
    if (existingCount > 0) {
      setExistingAnswerCount(existingCount);
      setIsOverwriteModalOpen(true);
      return;
    }
    
    // 기존 데이터 없으면 바로 저장
    await executeSaveToServer();
  };

  // 덮어쓰기 확인 후 저장
  const handleOverwriteConfirm = async () => {
    setIsOverwriteModalOpen(false);
    await executeSaveToServer();
  };

  const handleOverwriteCancel = () => {
    setIsOverwriteModalOpen(false);
  };

  const handleUploadXLSX = async (file: File) => {
    setMessage(null);
    if (!sessionId) {
      setMessage('세션이 없습니다. 먼저 PDF를 업로드해 세션을 생성하세요.');
      return;
    }
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('session_id', sessionId);
      formData.append('file', file);

      const resp = await fetch('/api/answer', {
        method: 'POST',
        body: formData,
      });
      if (!resp.ok) {
        const txt = await safeText(resp);
        throw new Error(`XLSX 업로드 실패(${resp.status}): ${txt || '서버 오류'}`);
      }
      const savedName = file.name;
      await resp.json().catch(() => ({}));
      onAnswerFileNameChange?.(savedName);
      setMessage(`${savedName} 업로드 완료.`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '업로드 중 오류가 발생했습니다.';
      setMessage(message);
    } finally {
      setSaving(false);
    }
  };

  const editorBody = (
    <div
      onClick={(event) => event.stopPropagation()}
      className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-4">
          <div>
            <h3 className="text-lg font-semibold">정답 및 배점 입력</h3>
            <p className="text-sm text-neutral-500">
              총 {questionItems.length}문항에 대한 정답과 배점을 입력하세요.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50"
              onClick={() => fileInputRef.current?.click()}
              disabled={!questionItems.length}
            >
              불러오기(.csv)
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  onAnswerFileNameChange?.(file.name);
                  void importCSV(file);
                }
                event.currentTarget.value = '';
              }}
            />
            <button
              type="button"
              className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50"
              onClick={() => xlsxInputRef.current?.click()}
            >
              업로드(.xlsx)
            </button>
            <input
              ref={xlsxInputRef}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  onAnswerFileNameChange?.(file.name);
                  void handleUploadXLSX(file);
                }
                event.currentTarget.value = '';
              }}
            />
            <button
              type="button"
              className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50"
              onClick={handleDownloadCSV}
              disabled={!questionItems.length}
              title="현재 입력된 정답/점수를 CSV로 저장"
            >
              다운로드(.csv)
            </button>
            <button
              type="button"
              className="rounded-lg bg-black px-3 py-1.5 text-sm text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleSaveToServer}
              disabled={!questionItems.length || saving}
            >
              {saving ? '저장 중...' : '서버에 저장'}
            </button>
            <button
              type="button"
              className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50"
              onClick={onClose}
            >
              닫기
            </button>
          </div>
        </div>

        <div className="flex overflow-hidden rounded-lg bg-neutral-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('answers')}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'answers'
                ? 'bg-white text-black shadow-sm'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            1단계: 정답 입력
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('scores')}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'scores'
                ? 'bg-white text-black shadow-sm'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            2단계: 배점 입력
          </button>
        </div>

        {message && (
          <div className={`rounded-xl border px-3 py-2 text-sm ${
            message.startsWith('✅') 
              ? 'border-green-300 bg-green-50 text-green-700' 
              : message.startsWith('❌') 
              ? 'border-red-300 bg-red-50 text-red-700'
              : message.startsWith('⚠️')
              ? 'border-yellow-300 bg-yellow-50 text-yellow-700'
              : 'border-neutral-200 bg-neutral-50 text-neutral-700'
          }`}>
            {message}
          </div>
        )}

        {questionItems.length === 0 || subject === '과목을 선택하세요' ? (
          <div className="rounded-xl bg-neutral-50 p-6 text-center text-sm text-neutral-500">
            과목을 먼저 선택해주세요
          </div>
        ) : activeTab === 'answers' ? (
          <div className="space-y-4">
            <div className="text-center py-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">1단계: 정답을 입력해주세요</p>
              <p className="text-xs text-blue-600 mt-1">객관식은 1-5번, 주관식은 답안을 입력하세요</p>
            </div>

            {subject === '국어'
              ? renderKoreanAnswerContent()
              : subject === '수학'
              ? renderMathAnswerContent()
              : subject === '탐구'
              ? renderExplorationAnswerContent()
              : subject === '기타'
              ? renderCustomAnswerContent()
              : renderDefaultAnswerContent()}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center py-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700 font-medium">2단계: 배점을 입력해주세요</p>
              <p className="text-xs text-green-600 mt-1">정수만 입력 가능하며, 5개 단위로 연속 입력하세요 (예: 22322)</p>
            </div>

            {subject === '국어'
              ? renderKoreanScoreContent()
              : subject === '수학'
              ? renderMathScoreContent()
              : subject === '탐구'
              ? renderExplorationScoreContent()
              : subject === '기타'
              ? renderCustomScoreContent()
              : renderDefaultScoreContent()}
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
          <button
            type="button"
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50"
            onClick={() => {
              setAnswers(questionItems.map(() => ''));
              setScores(questionItems.map(() => ''));
            }}
          >
            모두 지우기
          </button>
          {activeTab === 'answers' ? (
            <button
              type="button"
              className="rounded-lg bg-black px-3 py-1.5 text-sm text-white hover:bg-neutral-800"
              onClick={() => setActiveTab('scores')}
            >
              다음: 배점 입력
            </button>
          ) : (
            <button
              type="button"
              className="rounded-lg bg-black px-3 py-1.5 text-sm text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleSaveToServer}
              disabled={!questionItems.length || saving}
            >
              {saving ? '저장 중...' : '서버에 저장'}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (mode === 'embedded') {
    return (
      <>
        <div className={embeddedClassName}>{editorBody}</div>
        <OverwriteConfirmModal
          isOpen={isOverwriteModalOpen}
          onClose={handleOverwriteCancel}
          onConfirm={handleOverwriteConfirm}
          title="이미 저장된 정답지가 있습니다"
          message="이미 채점된 데이터가 있습니다. 수정하시겠습니까?"
          existingCount={existingAnswerCount}
          type="answer"
        />
      </>
    );
  }

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
      >
        {editorBody}
      </div>
      <OverwriteConfirmModal
        isOpen={isOverwriteModalOpen}
        onClose={handleOverwriteCancel}
        onConfirm={handleOverwriteConfirm}
        title="이미 저장된 정답지가 있습니다"
        message="이미 채점된 데이터가 있습니다. 수정하시겠습니까?"
        existingCount={existingAnswerCount}
        type="answer"
      />
    </>
  );
}
