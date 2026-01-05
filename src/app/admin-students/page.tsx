'use client';

import { useState, useEffect, useCallback } from 'react';
import SNarOCRLayout from '@/components/SNarOCRLayout';
import { Select } from '@/components/ui/Select';
import { Search, Download, FileDown, RefreshCw, Loader2, Lock, Upload, Plus } from 'lucide-react';
import { StudentsTable, Student } from '@/components/admin-students';
import { useAuth } from '@/contexts/AuthContext';

// API 응답 타입
interface StudentFromAPI {
  snportal_id: string;
  username: string;
  name: string;
  student_number: string;
  phone_number?: string;
  parent_phone_number?: string;
  grade?: string;
  study_room?: string;
  seat?: string;
  track?: string;
  academic_year?: number;
}

// Use /api proxy path to avoid CSP issues
const API_BASE = '/api';

export default function AdminStudentsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAcademy, setSelectedAcademy] = useState<string>('전체');
  const [selectedClass, setSelectedClass] = useState<string>('전체');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [availableYears, setAvailableYears] = useState<(number | null)[]>([]);

  // 가용 학년도 목록 가져오기
  const fetchAvailableYears = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await fetch(`${API_BASE}/students/academic-years`);
      if (response.ok) {
        const data = await response.json();
        const years = data.years || [];
        setAvailableYears(years);
        // 기본값으로 가장 최근 연도 선택
        if (years.length > 0 && !selectedYear) {
          setSelectedYear(String(years[0]));
        }
      }
    } catch (err) {
      console.error('Failed to fetch academic years:', err);
    }
  }, [isAuthenticated, selectedYear]);

  useEffect(() => {
    fetchAvailableYears();
  }, [fetchAvailableYears]);

  // DB에서 학생 목록 가져오기
  const fetchStudents = useCallback(async () => {
    // 인증되지 않은 경우 데이터를 가져오지 않음
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let url = `${API_BASE}/students`;
      if (selectedYear) {
        url += `?academic_year=${selectedYear}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      
      // API 응답을 Student 인터페이스로 변환
      const mappedStudents: Student[] = (data.students || []).map((s: StudentFromAPI) => ({
        id: s.snportal_id,
        name: s.name || s.username,
        phoneNumber: s.phone_number || '',
        parentPhoneNumber: s.parent_phone_number || '',
        academy: 'SN독학기숙학원', // SNPortal 기본값
        className: s.study_room || '',
        studentNumber: s.student_number,
        grade: s.grade,
        studyRoom: s.study_room,
        seat: s.seat,
        track: s.track,
        subjects: {
          korean: '',
          math: '',
          inquiry1: '',
          inquiry2: '',
        },
        registeredAt: new Date().toISOString().split('T')[0],
      }));
      
      setStudents(mappedStudents);
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setError(err instanceof Error ? err.message : '학생 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, selectedYear]);

  useEffect(() => {
    if (selectedYear) {
      fetchStudents();
    }
  }, [fetchStudents, selectedYear]);

  // 학원 목록 (고유값)
  const academies = ['전체', ...Array.from(new Set(students.map(s => s.academy).filter((a): a is string => Boolean(a))))];
  
  // 반(grade) 목록 (고유값, null/빈값 포함, 숫자 정렬)
  const gradeSet = new Set(students.map(s => s.grade));
  const gradeValues = Array.from(gradeSet);
  const hasEmptyGrade = gradeValues.some(g => !g);
  const numericGrades = gradeValues.filter((c): c is string => Boolean(c)).sort((a, b) => Number(a) - Number(b));
  const classes = ['전체', ...numericGrades, ...(hasEmptyGrade ? ['(없음)'] : [])];

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.includes(searchTerm) ||
      (student.studentNumber && student.studentNumber.includes(searchTerm)) ||
      (student.studyRoom && student.studyRoom.includes(searchTerm));
    const matchesAcademy = selectedAcademy === '전체' || student.academy === selectedAcademy;
    // Handle '(없음)' filter for null/empty grade
    const matchesClass = selectedClass === '전체' || 
      (selectedClass === '(없음)' ? !student.grade : student.grade === selectedClass);
    return matchesSearch && matchesAcademy && matchesClass;
  });

  const handleDownloadSample = () => {
    const link = document.createElement('a');
    link.href = '/samples/students_sample.csv';
    link.download = 'students_sample.csv';
    link.click();
  };

  const handleExportCSV = () => {
    const headers = ['이름', '학번', '반', '자습실', '좌석', '트랙'];
    const rows = students.map(s => [
      s.name,
      s.studentNumber || '',
      s.grade || '',
      s.studyRoom || '',
      s.seat || '',
      s.track || '',
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `학생목록_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <SNarOCRLayout currentPage="admin-students">
      {/* 로그인 필요 메시지 */}
      {!authLoading && !isAuthenticated ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center max-w-md">
            <Lock size={48} className="mx-auto text-amber-500 mb-4" />
            <h2 className="text-xl font-bold text-neutral-900 mb-2">로그인이 필요합니다</h2>
            <p className="text-sm text-neutral-600 mb-4">
              학생 관리 페이지는 로그인한 사용자만 접근할 수 있습니다.<br />
              우측 상단의 로그인 버튼을 클릭하여 로그인해 주세요.
            </p>
          </div>
        </div>
      ) : (
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">학생 관리</h1>
              <p className="text-sm text-neutral-500 mt-1">
                SNPortal에서 가져온 학생 목록입니다. 
                {!loading && !error && <span className="text-blue-600 ml-1">({students.length}명)</span>}
              </p>
            </div>
            <div className="flex flex-col gap-1 items-end">
              <div className="flex gap-2 items-center">
                <button
                  onClick={fetchStudents}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                  새로고침
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50">
                  <Upload size={16} />
                  엑셀 업로드
                </button>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-4 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50"
                >
                  <Download size={16} />
                  엑셀 다운로드
                </button>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus size={16} />
                  학생 추가
                </button>
              </div>
              <button
                onClick={handleDownloadSample}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
              >
                <FileDown size={12} />
                샘플 다운로드
              </button>
            </div>
          </div>

          {/* 필터 영역 (별도 줄) */}
          <div className="flex gap-4 items-center">
            {/* 학년도 필터 */}
            {availableYears.length > 0 && (
              <Select
                value={selectedYear}
                onValueChange={setSelectedYear}
                options={availableYears.map(y => ({ 
                  value: y === null ? 'null' : String(y), 
                  label: y === null ? '(없음)' : `${y}학년도` 
                }))}
                placeholder="학년도 선택"
                aria-label="학년도 필터"
              />
            )}
            {/* 학원 필터 - Radix Select */}
            <Select
              value={selectedAcademy}
              onValueChange={setSelectedAcademy}
              options={academies.map(a => ({ value: a, label: a }))}
              placeholder="학원 선택"
              aria-label="학원 필터"
            />
            {/* 반 필터 - Radix Select */}
            {classes.length > 1 && (
              <Select
                value={selectedClass}
                onValueChange={setSelectedClass}
                options={classes.map(c => ({ 
                  value: c, 
                  label: c === '전체' ? '전체 반' : c === '(없음)' ? '(없음)' : `${c}반` 
                }))}
                placeholder="반 선택"
                aria-label="반 필터"
              />
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <p className="font-medium">오류 발생</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={fetchStudents}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input
              type="text"
              placeholder="이름, 학번, 자습실로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-neutral-200">
            <div className="text-2xl font-bold text-neutral-900">{students.length}</div>
            <div className="text-sm text-neutral-500">전체 학생</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-neutral-200">
            <div className="text-2xl font-bold text-neutral-900">{new Set(students.map(s => s.grade).filter(Boolean)).size}</div>
            <div className="text-sm text-neutral-500">반 개수</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-neutral-200">
            <div className="text-2xl font-bold text-neutral-900">{new Set(students.map(s => s.studyRoom).filter(Boolean)).size}</div>
            <div className="text-sm text-neutral-500">자습실</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-neutral-200">
            <div className="text-2xl font-bold text-neutral-900">{filteredStudents.length}</div>
            <div className="text-sm text-neutral-500">검색 결과</div>
          </div>
        </div>

        {/* Table */}
        <StudentsTable
          students={filteredStudents}
          loading={loading}
          totalCount={students.length}
        />
      </div>
      )}
    </SNarOCRLayout>
  );
}
