'use client';

import React, { useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import type { FindAnswerResult, SavedAnswerData } from '@/types/upload';

interface FindAnswerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnswerSelected: (data: SavedAnswerData, subjectCode?: string) => void;
}

export function FindAnswerModal({
  isOpen,
  onClose,
  onAnswerSelected,
}: FindAnswerModalProps) {
  const [findAnswerSearchQuery, setFindAnswerSearchQuery] = useState('');
  const [findAnswerSubject, setFindAnswerSubject] = useState('전체');
  const [isFindAnswerSubjectDropdownOpen, setIsFindAnswerSubjectDropdownOpen] = useState(false);
  const [findAnswerResults, setFindAnswerResults] = useState<FindAnswerResult[]>([]);
  const [findAnswerSelected, setFindAnswerSelected] = useState<number | null>(null);
  const [findAnswerLoading, setFindAnswerLoading] = useState(false);

  // 기존 정답 검색
  const handleFindAnswerSearch = useCallback(async () => {
    setFindAnswerLoading(true);
    setFindAnswerResults([]);
    setFindAnswerSelected(null);
    
    try {
      const resp = await fetch('/api/exams/answer-keys/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectCode: findAnswerSubject !== '전체' ? findAnswerSubject : null,
          searchQuery: findAnswerSearchQuery.trim() || null,
        }),
      });
      
      if (resp.ok) {
        const data = await resp.json();
        setFindAnswerResults(data.results || []);
      }
    } catch (error) {
      console.error('정답 검색 실패:', error);
    } finally {
      setFindAnswerLoading(false);
    }
  }, [findAnswerSubject, findAnswerSearchQuery]);

  // 모달 닫기 핸들러 (handleLoadSelectedAnswer보다 먼저 정의)
  const handleClose = useCallback(() => {
    setFindAnswerResults([]);
    setFindAnswerSelected(null);
    setFindAnswerSearchQuery('');
    onClose();
  }, [onClose]);

  // 선택한 정답 불러오기
  const handleLoadSelectedAnswer = useCallback(async () => {
    if (findAnswerSelected === null) return;
    
    const selected = findAnswerResults[findAnswerSelected];
    if (!selected) return;
    
    try {
      const resp = await fetch('/api/exams/answer-keys/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metadata: {
            subjectCode: selected.subjectCode,
            subjectName: selected.subjectName,
            examCode: selected.examCode,
            providerName: selected.providerName,
            examYear: selected.examYear,
            examMonth: selected.examMonth,
          }
        }),
      });
      
      if (!resp.ok) {
        throw new Error('정답 불러오기 실패');
      }
      
      const data = await resp.json();
      if (data.questions && data.questions.length > 0) {
        // 정답을 savedAnswerData 형태로 변환
        const answersMap: Record<string, string> = {};
        const scoresMap: Record<string, string> = {};
        
        for (const q of data.questions) {
          const qid = `Q${q.number}`;
          if (q.correctChoice !== null && q.correctChoice !== undefined) {
            answersMap[qid] = String(q.correctChoice);
          } else if (q.correctChoices && q.correctChoices.length > 0) {
            answersMap[qid] = q.correctChoices.join('');
          } else if (q.correctText) {
            answersMap[qid] = q.correctText;
          }
          if (q.points !== null && q.points !== undefined) {
            scoresMap[qid] = String(q.points);
          }
        }
        
        // Include exam metadata with the answer data
        onAnswerSelected({
          answers: answersMap,
          scores: scoresMap,
          examYear: selected.examYear,
          examMonth: selected.examMonth,
          providerName: selected.providerName,
          examCode: selected.examCode,
          subjectCode: selected.subjectCode,
          subjectName: selected.subjectName,
        }, selected.subjectCode);
        handleClose();
      } else {
        console.warn('정답 데이터가 비어있습니다');
        alert('선택한 시험의 정답 데이터가 없습니다.');
      }
    } catch (error) {
      console.error('정답 불러오기 실패:', error);
      alert('정답 불러오기에 실패했습니다.');
    }
  }, [findAnswerSelected, findAnswerResults, onAnswerSelected, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
      <div className="bg-white rounded-2xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">기존 입력된 정답 찾기</h3>
          <p className="text-sm text-neutral-600 mt-1">DB에 저장된 정답을 검색해서 불러옵니다</p>
        </div>

        <div className="p-6 space-y-4">
          {/* 검색어 입력 */}
          <div className="space-y-1">
            <label className="text-sm font-medium">검색어</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={findAnswerSearchQuery}
                onChange={(e) => setFindAnswerSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFindAnswerSearch()}
                className="flex-1 rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="시험명, 과목 등으로 검색"
              />
              <button
                onClick={handleFindAnswerSearch}
                disabled={findAnswerLoading}
                className="px-4 py-2 rounded-xl bg-black text-white hover:bg-neutral-800 disabled:opacity-50"
              >
                {findAnswerLoading ? '검색 중...' : '검색'}
              </button>
            </div>
          </div>

          {/* 과목 필터 */}
          <div className="space-y-1">
            <label className="text-sm font-medium">과목 필터</label>
            <div className="relative">
              <button
                onClick={() => setIsFindAnswerSubjectDropdownOpen(!isFindAnswerSubjectDropdownOpen)}
                className="w-full rounded-xl border px-3 py-2 text-sm text-left flex items-center justify-between hover:bg-neutral-50"
              >
                <span>{findAnswerSubject}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isFindAnswerSubjectDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isFindAnswerSubjectDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border bg-white shadow-lg max-h-60 overflow-y-auto">
                  {['전체', 'KOR', 'MATH', 'ENG'].map((code) => (
                    <button
                      key={code}
                      onClick={() => {
                        setFindAnswerSubject(code);
                        setIsFindAnswerSubjectDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-neutral-50 border-b last:border-b-0"
                    >
                      <span className="text-sm">
                        {code === '전체' ? '전체' : code === 'KOR' ? '국어 (KOR)' : code === 'MATH' ? '수학 (MATH)' : '영어 (ENG)'}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 검색 결과 */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">검색 결과 ({findAnswerResults.length}건)</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {findAnswerResults.length === 0 ? (
                <div className="text-center text-sm text-neutral-500 py-4">
                  {findAnswerLoading ? '검색 중...' : '검색 버튼을 눌러 DB에서 정답을 찾아보세요'}
                </div>
              ) : (
                findAnswerResults.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setFindAnswerSelected(idx)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      findAnswerSelected === idx
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:bg-neutral-50'
                    }`}
                  >
                    <div className="font-medium text-sm">
                      {item.examLabel || item.examCode || '(제목 없음)'} - {item.subjectName || item.subjectCode}
                    </div>
                    <div className="text-xs text-neutral-500 mt-1">
                      {item.questionCount}문항
                      {item.examYear && ` • ${item.examYear}년`}
                      {item.examMonth && ` ${item.examMonth}월`}
                      {item.providerName && ` • ${item.providerName}`}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-xl border hover:bg-neutral-50"
          >
            취소
          </button>
          <button
            onClick={handleLoadSelectedAnswer}
            disabled={findAnswerSelected === null}
            className="px-4 py-2 rounded-xl bg-black text-white hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            정답 불러오기
          </button>
        </div>
      </div>
    </div>
  );
}
