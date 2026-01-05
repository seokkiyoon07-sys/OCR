'use client';

import { useState, useEffect, useCallback } from 'react';
import { Select } from '@/components/ui/Select';
import { Search, Loader2 } from 'lucide-react';
import { Student } from './types';

const BACKEND_URL = '/api';

interface StudentSelectorProps {
  onSelect: (student: Student) => void;
}

export function StudentSelector({ onSelect }: StudentSelectorProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>('전체');
  const [availableGrades, setAvailableGrades] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyWithResults, setShowOnlyWithResults] = useState(true);

  // Fetch available years
  const fetchAvailableYears = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/students/academic-years`);
      if (response.ok) {
        const data = await response.json();
        const years = data.years || [];
        setAvailableYears(years);
        if (years.length > 0 && !selectedYear) {
          setSelectedYear(String(years[0]));
        }
      }
    } catch (err) {
      console.error('Failed to fetch academic years:', err);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchAvailableYears();
  }, [fetchAvailableYears]);

  // Fetch students with results
  const fetchStudents = useCallback(async () => {
    if (!selectedYear) return;
    
    setLoading(true);
    setError(null);
    try {
      let url = `${BACKEND_URL}/exams/students/with-results?academic_year=${selectedYear}`;
      if (selectedGrade && selectedGrade !== '전체') {
        url += `&grade=${selectedGrade}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      
      if (data.status !== 'ok') {
        throw new Error(data.message || '학생 목록을 불러올 수 없습니다.');
      }
      
      setStudents(data.students || []);
      setAvailableGrades(['전체', ...(data.grades || [])]);
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setError(err instanceof Error ? err.message : '학생 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedGrade]);

  useEffect(() => {
    if (selectedYear) {
      fetchStudents();
    }
  }, [fetchStudents, selectedYear]);

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = !searchTerm || 
      student.name.includes(searchTerm) ||
      (student.studentNumber && student.studentNumber.includes(searchTerm));
    const matchesResultsFilter = !showOnlyWithResults || student.hasExamResults;
    return matchesSearch && matchesResultsFilter;
  });

  // Stats
  const studentsWithResults = students.filter(s => s.hasExamResults).length;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Year Filter */}
        {availableYears.length > 0 && (
          <Select
            value={selectedYear}
            onValueChange={setSelectedYear}
            options={availableYears.map(y => ({ value: String(y), label: `${y}학년도` }))}
            placeholder="학년도 선택"
            aria-label="학년도 필터"
          />
        )}
        
        {/* Grade Filter */}
        {availableGrades.length > 1 && (
          <Select
            value={selectedGrade}
            onValueChange={setSelectedGrade}
            options={availableGrades.map(g => ({ 
              value: g, 
              label: g === '전체' ? '전체 반' : `${g}반` 
            }))}
            placeholder="반 선택"
            aria-label="반 필터"
          />
        )}
        
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
          <input
            type="text"
            placeholder="이름, 학번 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* Show only with results toggle */}
        <label className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showOnlyWithResults}
            onChange={(e) => setShowOnlyWithResults(e.target.checked)}
            className="rounded border-neutral-300"
          />
          채점결과 있는 학생만
        </label>
      </div>
      
      {/* Stats */}
      <div className="flex gap-4 text-sm text-neutral-600">
        <span>전체: <strong>{students.length}</strong>명</span>
        <span>채점결과 있음: <strong className="text-blue-600">{studentsWithResults}</strong>명</span>
        <span>검색결과: <strong>{filteredStudents.length}</strong>명</span>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Student List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span className="ml-2 text-neutral-600">학생 목록을 불러오는 중...</span>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="max-h-[400px] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-neutral-600">이름</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-neutral-600">학번</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-neutral-600">반</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-neutral-600">자습실</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-neutral-600">채점결과</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredStudents.map(student => (
                  <tr 
                    key={student.id || student.studentNumber} 
                    onClick={() => onSelect(student)}
                    className="cursor-pointer transition-colors hover:bg-neutral-50"
                  >
                    <td className="px-4 py-2 text-sm font-medium text-neutral-900">{student.name}</td>
                    <td className="px-4 py-2 text-sm text-neutral-600">{student.studentNumber || '-'}</td>
                    <td className="px-4 py-2">
                      {student.grade ? (
                        <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                          {student.grade}반
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-2 text-sm text-neutral-600">{student.studyRoom || '-'}</td>
                    <td className="px-4 py-2 text-center">
                      {student.hasExamResults ? (
                        <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                          {student.examCount}개
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-400">없음</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredStudents.length === 0 && (
            <div className="py-8 text-center text-neutral-500 text-sm">
              {students.length === 0 ? '학생 목록을 불러올 수 없습니다.' : '검색 결과가 없습니다.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
