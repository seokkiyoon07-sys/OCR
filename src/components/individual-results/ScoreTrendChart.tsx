'use client';

import { useState, useMemo } from 'react';

interface ExamData {
  month: string;
  examName: string;
  examType: string;
  scores: {
    [subject: string]: number;
  };
}

interface ScoreTrendChartProps {
  examData: ExamData[];
  subjects?: string[];
}

// Subject colors
const subjectColors: Record<string, string> = {
  '국어': '#ef4444',
  '수학': '#3b82f6',
  '영어': '#22c55e',
  '탐구1': '#f59e0b',
  '탐구2': '#8b5cf6',
  '한국사': '#6b7280',
};

// Max scores per subject
const maxScores: Record<string, number> = {
  '국어': 100,
  '수학': 100,
  '영어': 100,
  '탐구1': 50,
  '탐구2': 50,
  '한국사': 50,
};

const defaultSubjects = ['국어', '수학', '영어', '탐구1', '탐구2'];

export function ScoreTrendChart({ examData, subjects = defaultSubjects }: ScoreTrendChartProps) {
  const [viewMode, setViewMode] = useState<'multi-subject' | 'single-subject'>('multi-subject');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(subjects.slice(0, 3));
  const [singleSubject, setSingleSubject] = useState<string>(subjects[0] || '국어');
  const [examTypeFilter, setExamTypeFilter] = useState<'all' | '모의고사' | '일반시험'>('all');
  const [monthRange, setMonthRange] = useState<[number, number]>([0, 11]);

  // Filter exam data
  const filteredData = useMemo(() => {
    let data = examData;
    
    if (examTypeFilter !== 'all') {
      data = data.filter(d => d.examType === examTypeFilter);
    }
    
    return data;
  }, [examData, examTypeFilter]);

  const toggleSubject = (subject: string) => {
    if (selectedSubjects.includes(subject)) {
      if (selectedSubjects.length > 1) {
        setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
      }
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  if (filteredData.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-6">
        <h3 className="text-lg font-semibold mb-4">성적 추이</h3>
        <div className="text-center py-8 text-neutral-500">
          시험 데이터가 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">성적 추이</h3>
            <p className="text-sm text-neutral-600 mt-1">과목별 원점수 변화를 확인하세요</p>
          </div>
          {/* View mode toggle */}
          <div className="flex gap-1 bg-neutral-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('multi-subject')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'multi-subject'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              과목 비교
            </button>
            <button
              onClick={() => setViewMode('single-subject')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'single-subject'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              단일 과목
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {viewMode === 'multi-subject' ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600">과목 선택:</span>
              <div className="flex gap-1">
                {subjects.map(subject => (
                  <button
                    key={subject}
                    onClick={() => toggleSubject(subject)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                      selectedSubjects.includes(subject)
                        ? 'text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                    style={{
                      backgroundColor: selectedSubjects.includes(subject) 
                        ? subjectColors[subject] || '#6b7280' 
                        : undefined
                    }}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600">과목:</span>
              <select
                value={singleSubject}
                onChange={(e) => setSingleSubject(e.target.value)}
                className="px-3 py-1.5 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          )}

          {/* Exam type filter */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-neutral-600">시험 유형:</span>
            <div className="flex gap-1">
              {(['all', '모의고사', '일반시험'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setExamTypeFilter(type)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                    examTypeFilter === type
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {type === 'all' ? '전체' : type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="flex">
              {/* Y-axis labels */}
              <div className="w-10 flex flex-col justify-between text-right pr-2" style={{ height: '200px' }}>
                {(viewMode === 'single-subject' && maxScores[singleSubject] === 50
                  ? [50, 40, 30, 20, 10, 0]
                  : [100, 75, 50, 25, 0]
                ).map(value => (
                  <span key={value} className="text-xs text-neutral-400 leading-none">{value}</span>
                ))}
              </div>

              {/* Chart area */}
              <div className="flex-1">
                <div className="relative border-l border-b border-neutral-200" style={{ height: '200px' }}>
                  {/* Grid lines */}
                  {[0.25, 0.5, 0.75, 1].map(ratio => (
                    <div
                      key={ratio}
                      className="absolute left-0 right-0 border-t border-neutral-100"
                      style={{ bottom: `${ratio * 100}%` }}
                    />
                  ))}

                  {/* Bars */}
                  <div className="absolute inset-0 flex items-end justify-around px-2">
                    {filteredData.map((data, examIdx) => {
                      const displaySubjects = viewMode === 'multi-subject' ? selectedSubjects : [singleSubject];

                      return (
                        <div
                          key={examIdx}
                          className="flex items-end justify-center gap-[2px] flex-1"
                        >
                          {displaySubjects.map(subject => {
                            const score = data.scores[subject] ?? 0;
                            const max = maxScores[subject] || 100;
                            const heightPercent = (score / max) * 100;

                            return (
                              <div
                                key={subject}
                                className="relative group flex-1 max-w-4"
                              >
                                <div
                                  className="w-full rounded-t transition-all duration-300 hover:opacity-80"
                                  style={{
                                    height: `${heightPercent * 2}px`,
                                    backgroundColor: subjectColors[subject] || '#6b7280',
                                    minHeight: score > 0 ? '4px' : '0'
                                  }}
                                />
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-neutral-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                  {subject}: {score}/{max}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* X-axis labels */}
                <div className="flex justify-around pt-2">
                  {filteredData.map((data, idx) => (
                    <div key={idx} className="text-center flex-1 px-1">
                      <div className="text-xs font-medium text-neutral-700">{data.month}</div>
                      <div className="text-[10px] text-neutral-400 truncate">
                        {data.examName.length > 8 ? data.examName.slice(0, 8) + '..' : data.examName}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-4 pt-4 border-t">
          {(viewMode === 'multi-subject' ? selectedSubjects : [singleSubject]).map(subject => (
            <div key={subject} className="flex items-center gap-2 text-sm">
              <span
                className="w-3 h-3 rounded"
                style={{ backgroundColor: subjectColors[subject] || '#6b7280' }}
              />
              <span className="text-neutral-600">{subject}</span>
              <span className="text-xs text-neutral-400">
                ({maxScores[subject] || 100}점)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
