'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { JSX } from 'react';
import type { Layout } from '@/types/omr';

interface AnswerEditorProps {
  open: boolean;
  onClose?: () => void;
  layout: Layout;
  sessionId: string | null;
  fileName: string;
  onAnswerFileNameChange?: (name: string) => void;
  mode?: 'modal' | 'embedded';
  embeddedClassName?: string;
  subjectPreset?: SubjectPreset;
  examMetadata?: ExamMetadataForApi | null;
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
  mode = 'modal',
  embeddedClassName,
  subjectPreset,
  examMetadata,
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

  const renderMathAnswerContent = () => (
    <>
      <div className="space-y-3">
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

  const renderMathScoreContent = () => (
    <>
      <div className="space-y-3">
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

  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const xlsxInputRef = useRef<HTMLInputElement | null>(null);
  const answerRefs = useRef<Array<HTMLInputElement | null>>([]);
  const scoreRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!open) return;
    setAnswers(questionItems.map(() => ''));
    setScores(questionItems.map(() => ''));
    setMessage(null);
    setActiveTab('answers');
  }, [open, questionItems]);

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

        return {
          number: numeric,
          points,
          correctChoice: correctChoice ?? null,
          correctChoices,
          correctText,
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

  const handleSaveToServer = async () => {
    setMessage(null);
    if (!sessionId) {
      setMessage('세션이 없습니다. 먼저 PDF를 업로드해 세션을 생성하세요.');
      return;
    }
    if (questionItems.length === 0) {
      setMessage('처리할 문항이 없습니다. (grid/digits 블록이 필요)');
      return;
    }
    try {
      setSaving(true);
      const csvText = buildCSVText();
      const csvBlob = new Blob([csvText], { type: 'text/csv;charset=utf-8' });
      const fd = new FormData();
      fd.append('session_id', sessionId);
      const safeName = fileName ? `${fileName}.csv` : 'answers.csv';
      fd.append('file', csvBlob, safeName);

      const resp = await fetch('/api/answer/', { method: 'POST', body: fd });
      if (!resp.ok) {
        const txt = await safeText(resp);
        throw new Error(`업로드 실패(${resp.status}): ${txt || '서버 오류'}`);
      }
      const savedName = safeName;
      await resp.json().catch(() => ({}));
      onAnswerFileNameChange?.(savedName);

      const answerKeyPayload = buildAnswerKeyPayload();
      if (answerKeyPayload) {
        try {
          const keyResp = await fetch('/api/exams/answer-keys', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(answerKeyPayload),
          });
          if (!keyResp.ok) {
            const txt = await safeText(keyResp);
            console.warn(
              `답안 데이터 저장 실패(${keyResp.status}): ${txt || '서버 오류'}`,
            );
          }
        } catch (err) {
          console.warn('답안 데이터 저장 중 오류가 발생했습니다.', err);
        }
      }
      setMessage(
        answerKeyPayload
          ? `서버에 ${savedName} 저장 완료.`
          : `서버에 ${savedName} 저장 완료. 시험 정보를 먼저 저장하면 DB에도 정답이 기록됩니다.`,
      );
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

      const resp = await fetch('/api/answer/', {
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
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
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

            {subject === '수학'
              ? renderMathAnswerContent()
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

            {subject === '수학'
              ? renderMathScoreContent()
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
    return <div className={embeddedClassName}>{editorBody}</div>;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
    >
      {editorBody}
    </div>
  );
}
