'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface ErrorRateItem {
  rank: number;
  questionNumber: number;
  errorRate: number;
}

interface ErrorRateAnalysisProps {
  subjectName?: string;
  overallErrorRates?: ErrorRateItem[];
  topStudentErrorRates?: ErrorRateItem[];
}

// Sample data for demo
const sampleOverallErrorRates: ErrorRateItem[] = [
  { rank: 1, questionNumber: 22, errorRate: 68 },
  { rank: 2, questionNumber: 30, errorRate: 65 },
  { rank: 3, questionNumber: 15, errorRate: 54 },
  { rank: 4, questionNumber: 29, errorRate: 47 },
  { rank: 5, questionNumber: 21, errorRate: 41 },
];

const sampleTopStudentErrorRates: ErrorRateItem[] = [
  { rank: 1, questionNumber: 22, errorRate: 11 },
  { rank: 2, questionNumber: 30, errorRate: 10 },
  { rank: 3, questionNumber: 15, errorRate: 16 },
  { rank: 4, questionNumber: 29, errorRate: 7 },
  { rank: 5, questionNumber: 21, errorRate: 14 },
];

export function ErrorRateAnalysis({ 
  subjectName = '사회탐구',
  overallErrorRates = sampleOverallErrorRates,
  topStudentErrorRates = sampleTopStudentErrorRates
}: ErrorRateAnalysisProps) {
  const [topPercentage, setTopPercentage] = useState('10');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Overall Error Rate Analysis */}
      <div className="rounded-2xl border bg-white p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">{subjectName} 전체 오답률 분석</h3>
            <p className="text-sm text-neutral-600 mt-1">전체 학생의 문항별 정답 현황</p>
          </div>
        </div>
        
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">순위</th>
                <th className="px-4 py-2 text-left">문항</th>
                <th className="px-4 py-2 text-left">오답률</th>
                <th className="px-4 py-2 text-left w-24">그래프</th>
              </tr>
            </thead>
            <tbody>
              {overallErrorRates.map((item) => (
                <tr key={item.rank} className="border-t">
                  <td className="px-4 py-2 font-medium">{item.rank}</td>
                  <td className="px-4 py-2">{item.questionNumber}번</td>
                  <td className="px-4 py-2">{item.errorRate}%</td>
                  <td className="px-4 py-2">
                    <div className="bg-gray-100 rounded-full h-2 w-full overflow-hidden">
                      <div 
                        className="bg-red-500 h-full rounded-full" 
                        style={{ width: `${item.errorRate}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Students Error Rate Analysis */}
      <div className="rounded-2xl border bg-white p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">상위 {topPercentage}% 오답률 분석</h3>
            <p className="text-sm text-neutral-600 mt-1">상위권 학생들의 주요 취약 유형</p>
          </div>
          <div className="relative">
            <select
              value={topPercentage}
              onChange={(e) => setTopPercentage(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pr-8"
            >
              <option value="10">상위 10%</option>
              <option value="20">상위 20%</option>
              <option value="30">상위 30%</option>
            </select>
            <ChevronDown 
              size={16} 
              className="absolute right-2 top-3 text-gray-500 pointer-events-none" 
            />
          </div>
        </div>
        
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-4 py-2 text-left">순위</th>
                <th className="px-4 py-2 text-left">문항</th>
                <th className="px-4 py-2 text-left">오답률</th>
                <th className="px-4 py-2 text-left w-24">그래프</th>
              </tr>
            </thead>
            <tbody>
              {topStudentErrorRates.map((item) => (
                <tr key={item.rank} className="border-t">
                  <td className="px-4 py-2 font-medium">{item.rank}</td>
                  <td className="px-4 py-2">{item.questionNumber}번</td>
                  <td className="px-4 py-2">{item.errorRate}%</td>
                  <td className="px-4 py-2">
                    <div className="bg-gray-100 rounded-full h-2 w-full overflow-hidden">
                      <div 
                        className="bg-blue-600 h-full rounded-full" 
                        style={{ width: `${item.errorRate}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
