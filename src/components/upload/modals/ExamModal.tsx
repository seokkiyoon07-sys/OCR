'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface ExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  examYear: string;
  setExamYear: (year: string) => void;
  examMonth: string;
  setExamMonth: (month: string) => void;
  examOrganization: string;
  setExamOrganization: (org: string) => void;
  examOrganizationCustom: string;
  setExamOrganizationCustom: (org: string) => void;
  examGrade: string;
  setExamGrade: (grade: string) => void;
  isCustomOrganization: boolean;
}

export function ExamModal({
  isOpen,
  onClose,
  onSave,
  examYear,
  setExamYear,
  examMonth,
  setExamMonth,
  examOrganization,
  setExamOrganization,
  examOrganizationCustom,
  setExamOrganizationCustom,
  examGrade,
  setExamGrade,
  isCustomOrganization,
}: ExamModalProps) {
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">시험 정보 입력</h3>
          <p className="text-sm text-neutral-600 mt-1">시험 정보를 입력하세요 (선택사항)</p>
        </div>

        <div className="p-6 space-y-4">
          {/* 시행년도 + 시행월 */}
          <div className="grid grid-cols-2 gap-3">
            {/* 시행년도 */}
            <div className="space-y-1">
              <label className="text-sm font-medium">시행년도 (선택)</label>
              <div className="relative">
                <button
                  onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                  className="w-full rounded-xl border px-3 py-2 text-sm text-left flex items-center justify-between hover:bg-neutral-50"
                >
                  <span>{examYear || '년도 선택'}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isYearDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isYearDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border bg-white shadow-lg max-h-60 overflow-y-auto">
                    {['2027', '2026', '2025', '2024', '2023', '2022', '2021', '2020'].map((year) => (
                      <button
                        key={year}
                        onClick={() => {
                          setExamYear(year + '년도');
                          setIsYearDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-neutral-50 border-b last:border-b-0"
                      >
                        {year}년도
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 시행월 */}
            <div className="space-y-1">
              <label className="text-sm font-medium">시행월 (선택)</label>
              <div className="relative">
                <button
                  onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
                  className="w-full rounded-xl border px-3 py-2 text-sm text-left flex items-center justify-between hover:bg-neutral-50"
                >
                  <span>{examMonth || '월 선택'}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isMonthDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isMonthDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border bg-white shadow-lg max-h-60 overflow-y-auto">
                    {['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'].map((month) => (
                      <button
                        key={month}
                        onClick={() => {
                          setExamMonth(month);
                          setIsMonthDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-neutral-50 border-b last:border-b-0"
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 출제기관 */}
          <div className="space-y-1">
            <label className="text-sm font-medium">출제기관 (선택)</label>
            <div className="relative">
              <button
                onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
                className="w-full rounded-xl border px-3 py-2 text-sm text-left flex items-center justify-between hover:bg-neutral-50"
              >
                <span>{examOrganization}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOrgDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOrgDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border bg-white shadow-lg">
                  <button
                    onClick={() => {
                      setExamOrganization('한국교육과정평가원');
                      setIsOrgDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-neutral-50 border-b"
                  >
                    평가원 (한국교육과정평가원)
                  </button>
                  <button
                    onClick={() => {
                      setExamOrganization('교육청');
                      setIsOrgDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-neutral-50 border-b"
                  >
                    교육청
                  </button>
                  <button
                    onClick={() => {
                      setExamOrganization('기타');
                      setIsOrgDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-neutral-50"
                  >
                    기타 (직접 입력)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 기타 출제기관 입력 */}
          {isCustomOrganization && (
            <div className="space-y-1">
              <label className="text-sm font-medium">출제기관 입력</label>
              <input
                type="text"
                value={examOrganizationCustom}
                onChange={(e) => setExamOrganizationCustom(e.target.value)}
                className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="출제기관 이름을 입력하세요"
              />
            </div>
          )}

          {/* 학년 */}
          <div className="space-y-1">
            <label className="text-sm font-medium">학년 (선택)</label>
            <input
              type="text"
              value={examGrade}
              onChange={(e) => setExamGrade(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="예: 고3"
            />
          </div>
        </div>

        <div className="p-6 border-t flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border hover:bg-neutral-50"
          >
            취소
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 rounded-xl bg-black text-white hover:bg-neutral-800"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
