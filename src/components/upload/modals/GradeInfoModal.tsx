'use client';

import React, { useState } from 'react';
import { Download } from 'lucide-react';
import type { GradeInfoItem } from '@/types/upload';

interface GradeInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAndNext: (gradeInfo: GradeInfoItem[]) => void;
  maxScore: number;
  subjectLabel: string;
}

export function GradeInfoModal({
  isOpen,
  onClose,
  onSaveAndNext,
  maxScore,
  subjectLabel,
}: GradeInfoModalProps) {
  const [gradeInfo, setGradeInfo] = useState<GradeInfoItem[]>([]);

  const handleDownloadCSV = () => {
    const csvData = [];
    csvData.push('원점수,표준점수,백분위,등급,응시자수');

    for (let i = maxScore; i >= 0; i--) {
      const item = gradeInfo.find(g => g.score === i);
      const standardScore = item?.standardScore || '';
      const percentile = item?.percentile || '';
      const grade = item?.grade || '';
      const testTakers = item?.testTakers || (gradeInfo[0]?.testTakers || '');
      csvData.push(`${i},${standardScore},${percentile},${grade},${testTakers}`);
    }

    const csvContent = csvData.join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `성적표정보_${subjectLabel}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const updateGradeInfoField = (score: number, field: keyof GradeInfoItem, value: string) => {
    setGradeInfo(prev => {
      const existingIndex = prev.findIndex(item => item.score === score);
      if (existingIndex >= 0) {
        const newGradeInfo = [...prev];
        newGradeInfo[existingIndex] = { ...newGradeInfo[existingIndex], [field]: value };
        return newGradeInfo;
      } else {
        return [...prev, {
          score,
          standardScore: field === 'standardScore' ? value : '',
          percentile: field === 'percentile' ? value : '',
          grade: field === 'grade' ? value : '',
          testTakers: field === 'testTakers' ? value : '',
        }];
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
      <div className="bg-white rounded-2xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">성적표 정보 입력</h3>
          <p className="text-sm text-neutral-600 mt-1">원점수별 표준점수, 백분위, 등급, 응시자수를 입력하세요</p>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {/* CSV 업로드 */}
            <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
              <label className="text-sm font-medium mb-2 block">CSV 파일로 업로드</label>
              <p className="text-xs text-gray-600 mb-3">표준점수, 백분위, 등급 정보가 포함된 CSV 파일을 업로드하세요</p>
              <input
                type="file"
                accept=".csv"
                className="w-full text-sm text-gray-600"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const csvText = event.target?.result as string;
                    const lines = csvText.split('\n');

                    if (lines.length < 2) {
                      alert('CSV 파일 형식이 올바르지 않습니다.');
                      return;
                    }

                    const newGradeInfo: GradeInfoItem[] = [];

                    for (let i = 1; i < lines.length; i++) {
                      if (!lines[i].trim()) continue;
                      const values = lines[i].split(',');
                      const rawScore = parseInt(values[0].trim());

                      if (!isNaN(rawScore)) {
                        newGradeInfo.push({
                          score: rawScore,
                          standardScore: values[1]?.trim() || '',
                          percentile: values[2]?.trim() || '',
                          grade: values[3]?.trim() || '',
                          testTakers: values[4]?.trim() || ''
                        });
                      }
                    }

                    setGradeInfo(newGradeInfo);
                    alert('CSV 파일이 업로드되었습니다.');
                  };
                  reader.readAsText(file);
                }}
              />
              <p className="text-xs text-gray-500 mt-2">CSV 형식: 원점수,표준점수,백분위,등급,응시자수</p>
            </div>

            {/* 응시자수 입력 */}
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">전체 응시자수</label>
              <input
                type="number"
                min="1"
                className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="예: 1000"
                onChange={(e) => updateGradeInfoField(0, 'testTakers', e.target.value)}
              />
            </div>

            {/* 성적표 정보 입력 테이블 */}
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300 text-sm table-fixed">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border border-gray-300 p-2 text-center w-24">원점수</th>
                    <th className="border border-gray-300 p-2 text-center w-32">표준점수</th>
                    <th className="border border-gray-300 p-2 text-center w-32">백분위 (1-100)</th>
                    <th className="border border-gray-300 p-2 text-center w-32">등급 (1-9)</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: maxScore + 1 }, (_, i) => i).reverse().map((score) => (
                    <tr key={score}>
                      <td className="border border-gray-300 p-2 text-center bg-gray-100 font-bold">
                        {score}
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="number"
                          step="0.1"
                          className="w-full border-none focus:ring-0 text-center text-sm"
                          onChange={(e) => updateGradeInfoField(score, 'standardScore', e.target.value)}
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          className="w-full border-none focus:ring-0 text-center text-sm"
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (value >= 1 && value <= 100) {
                              updateGradeInfoField(score, 'percentile', e.target.value);
                            }
                          }}
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="number"
                          min="1"
                          max="9"
                          className="w-full border-none focus:ring-0 text-center text-sm"
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (value >= 1 && value <= 9) {
                              updateGradeInfoField(score, 'grade', e.target.value);
                            }
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 하단: 저장 버튼 */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <button
              onClick={handleDownloadCSV}
              className="px-4 py-2 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-50 flex items-center gap-2"
            >
              <Download size={14} />
              CSV로 다운로드
            </button>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl border hover:bg-neutral-50"
              >
                취소
              </button>
              <button
                onClick={() => {
                  console.log('성적표 정보 저장:', gradeInfo);
                  onSaveAndNext(gradeInfo);
                }}
                className="px-4 py-2 rounded-xl bg-black text-white hover:bg-neutral-800"
              >
                저장 및 다음
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
