'use client';

import { useState } from 'react';
import SNarOCRLayout from '@/components/SNarOCRLayout';
import { Search, Plus, Edit2, Trash2, Download, Upload, X, FileDown } from 'lucide-react';

// 선택과목 옵션
const KOREAN_OPTIONS = ['언어와매체', '화법과작문'];
const MATH_OPTIONS = ['확률과통계', '미적분', '기하'];
const SOCIAL_STUDIES = ['생활과윤리', '윤리와사상', '한국지리', '세계지리', '동아시아사', '세계사', '경제', '정치와법', '사회문화'];
const SCIENCE_STUDIES = ['물리학Ⅰ', '물리학Ⅱ', '화학Ⅰ', '화학Ⅱ', '생명과학Ⅰ', '생명과학Ⅱ', '지구과학Ⅰ', '지구과학Ⅱ'];

interface StudentSubjects {
  korean: string; // 언매 or 화작
  math: string; // 확통, 미적, 기하
  inquiry1: string; // 탐구1
  inquiry2: string; // 탐구2
}

interface Student {
  id: string;
  name: string;
  phoneNumber: string;
  parentPhoneNumber: string;
  academy: string;
  className: string;
  subjects: StudentSubjects;
  registeredAt: string;
}

// Mock data
const mockStudents: Student[] = [
  { id: '1', name: '강동호', phoneNumber: '010-1234-5678', parentPhoneNumber: '010-1111-1111', academy: 'SN독학기숙학원', className: '1반', subjects: { korean: '언어와매체', math: '미적분', inquiry1: '물리학Ⅰ', inquiry2: '화학Ⅰ' }, registeredAt: '2024-11-01' },
  { id: '2', name: '김민수', phoneNumber: '010-2345-6789', parentPhoneNumber: '010-2222-2222', academy: 'SN독학기숙학원', className: '1반', subjects: { korean: '화법과작문', math: '확률과통계', inquiry1: '생활과윤리', inquiry2: '사회문화' }, registeredAt: '2024-11-02' },
  { id: '3', name: '이영희', phoneNumber: '010-3456-7890', parentPhoneNumber: '010-3333-3333', academy: 'SN독학기숙학원', className: '2반', subjects: { korean: '언어와매체', math: '기하', inquiry1: '지구과학Ⅰ', inquiry2: '생명과학Ⅰ' }, registeredAt: '2024-11-03' },
  { id: '4', name: '박지성', phoneNumber: '010-4567-8901', parentPhoneNumber: '010-4444-4444', academy: 'SN독학기숙학원', className: '2반', subjects: { korean: '화법과작문', math: '미적분', inquiry1: '화학Ⅰ', inquiry2: '생명과학Ⅰ' }, registeredAt: '2024-11-04' },
  { id: '5', name: '최수진', phoneNumber: '010-5678-9012', parentPhoneNumber: '010-5555-5555', academy: '메가스터디학원', className: 'A반', subjects: { korean: '언어와매체', math: '확률과통계', inquiry1: '한국지리', inquiry2: '세계지리' }, registeredAt: '2024-11-05' },
  { id: '6', name: '정우성', phoneNumber: '010-6789-0123', parentPhoneNumber: '010-6666-6666', academy: '메가스터디학원', className: 'A반', subjects: { korean: '화법과작문', math: '미적분', inquiry1: '물리학Ⅰ', inquiry2: '물리학Ⅱ' }, registeredAt: '2024-11-06' },
  { id: '7', name: '한지민', phoneNumber: '010-7890-1234', parentPhoneNumber: '010-7777-7777', academy: '대성학원', className: '국어반', subjects: { korean: '언어와매체', math: '기하', inquiry1: '동아시아사', inquiry2: '세계사' }, registeredAt: '2024-11-07' },
  { id: '8', name: '손흥민', phoneNumber: '010-8901-2345', parentPhoneNumber: '010-8888-8888', academy: '대성학원', className: '수학반', subjects: { korean: '화법과작문', math: '미적분', inquiry1: '경제', inquiry2: '정치와법' }, registeredAt: '2024-11-08' },
];

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAcademy, setSelectedAcademy] = useState<string>('전체');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const academies = ['전체', ...Array.from(new Set(mockStudents.map(s => s.academy)))];

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.includes(searchTerm) ||
                         student.phoneNumber.includes(searchTerm) ||
                         student.className.includes(searchTerm);
    const matchesAcademy = selectedAcademy === '전체' || student.academy === selectedAcademy;
    return matchesSearch && matchesAcademy;
  });

  const handleDelete = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      setStudents(students.filter(s => s.id !== id));
    }
  };

  const handleDownloadSample = () => {
    const link = document.createElement('a');
    link.href = '/samples/students_sample.csv';
    link.download = 'students_sample.csv';
    link.click();
  };

  const handleExportCSV = () => {
    const headers = ['이름', '전화번호', '학부모전화번호', '학원', '반', '국어선택', '수학선택', '탐구1', '탐구2'];
    const rows = students.map(s => [
      s.name,
      s.phoneNumber,
      s.parentPhoneNumber,
      s.academy,
      s.className,
      s.subjects.korean,
      s.subjects.math,
      s.subjects.inquiry1,
      s.subjects.inquiry2
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">학생 관리</h1>
              <p className="text-sm text-neutral-500 mt-1">학생 목록을 관리하고 정보를 수정할 수 있습니다.</p>
            </div>
            {/* 학원 필터 - 제목 옆 */}
            <select
              value={selectedAcademy}
              onChange={(e) => setSelectedAcademy(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {academies.map(academy => (
                <option key={academy} value={academy}>{academy}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <div className="flex gap-2 items-center">
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

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input
              type="text"
              placeholder="이름, 전화번호, 반으로 검색..."
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
            <div className="text-2xl font-bold text-neutral-900">{new Set(students.map(s => s.academy)).size}</div>
            <div className="text-sm text-neutral-500">등록 학원</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-neutral-200">
            <div className="text-2xl font-bold text-neutral-900">{new Set(students.map(s => s.className)).size}</div>
            <div className="text-sm text-neutral-500">등록 반</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-neutral-200">
            <div className="text-2xl font-bold text-neutral-900">{filteredStudents.length}</div>
            <div className="text-sm text-neutral-500">검색 결과</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">이름</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">전화번호</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">학부모</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">반</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">국어</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">수학</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">탐구1</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">탐구2</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-neutral-600">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 text-sm font-medium text-neutral-900">{student.name}</td>
                    <td className="px-4 py-3 text-sm text-neutral-600">{student.phoneNumber}</td>
                    <td className="px-4 py-3 text-sm text-neutral-600">{student.parentPhoneNumber}</td>
                    <td className="px-4 py-3 text-sm text-neutral-600">{student.className}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs bg-neutral-100 text-neutral-700 rounded">
                        {student.subjects.korean === '언어와매체' ? '언매' : '화작'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs bg-neutral-100 text-neutral-700 rounded">
                        {student.subjects.math === '확률과통계' ? '확통' : student.subjects.math === '미적분' ? '미적' : '기하'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs bg-neutral-100 text-neutral-700 rounded">
                        {student.subjects.inquiry1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs bg-neutral-100 text-neutral-700 rounded">
                        {student.subjects.inquiry2}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setEditingStudent(student)}
                          className="p-1.5 text-neutral-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredStudents.length === 0 && (
            <div className="py-12 text-center text-neutral-500">
              검색 결과가 없습니다.
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(isAddModalOpen || editingStudent) && (
        <StudentModal
          student={editingStudent}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingStudent(null);
          }}
          onSave={(student) => {
            if (editingStudent) {
              setStudents(students.map(s => s.id === student.id ? student : s));
            } else {
              setStudents([...students, { ...student, id: Date.now().toString() }]);
            }
            setIsAddModalOpen(false);
            setEditingStudent(null);
          }}
        />
      )}
    </SNarOCRLayout>
  );
}

interface StudentModalProps {
  student: Student | null;
  onClose: () => void;
  onSave: (student: Student) => void;
}

function StudentModal({ student, onClose, onSave }: StudentModalProps) {
  const [formData, setFormData] = useState<Omit<Student, 'id'>>({
    name: student?.name || '',
    phoneNumber: student?.phoneNumber || '',
    parentPhoneNumber: student?.parentPhoneNumber || '',
    academy: student?.academy || 'SN독학기숙학원',
    className: student?.className || '',
    subjects: student?.subjects || {
      korean: '언어와매체',
      math: '미적분',
      inquiry1: '',
      inquiry2: '',
    },
    registeredAt: student?.registeredAt || new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: student?.id || '',
      ...formData,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{student ? '학생 정보 수정' : '학생 추가'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-neutral-100 rounded">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 기본 정보 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">이름</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">반</label>
              <input
                type="text"
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">전화번호</label>
              <input
                type="text"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="010-0000-0000"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">학부모 전화번호</label>
              <input
                type="text"
                value={formData.parentPhoneNumber}
                onChange={(e) => setFormData({ ...formData, parentPhoneNumber: e.target.value })}
                placeholder="010-0000-0000"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">학원</label>
            <select
              value={formData.academy}
              onChange={(e) => setFormData({ ...formData, academy: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="SN독학기숙학원">SN독학기숙학원</option>
              <option value="메가스터디학원">메가스터디학원</option>
              <option value="대성학원">대성학원</option>
            </select>
          </div>

          {/* 선택과목 섹션 */}
          <div className="border-t pt-4 mt-4">
            <h3 className="text-sm font-bold text-neutral-800 mb-3">선택과목</h3>

            <div className="grid grid-cols-2 gap-4">
              {/* 국어 선택 */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">국어 선택</label>
                <select
                  value={formData.subjects.korean}
                  onChange={(e) => setFormData({
                    ...formData,
                    subjects: { ...formData.subjects, korean: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {KOREAN_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* 수학 선택 */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">수학 선택</label>
                <select
                  value={formData.subjects.math}
                  onChange={(e) => setFormData({
                    ...formData,
                    subjects: { ...formData.subjects, math: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {MATH_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 탐구 선택 */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-neutral-700 mb-2">탐구 선택 (2과목)</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">탐구 1</label>
                  <select
                    value={formData.subjects.inquiry1}
                    onChange={(e) => setFormData({
                      ...formData,
                      subjects: { ...formData.subjects, inquiry1: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">선택하세요</option>
                    <optgroup label="사회탐구">
                      {SOCIAL_STUDIES.map(opt => (
                        <option key={opt} value={opt} disabled={opt === formData.subjects.inquiry2}>{opt}</option>
                      ))}
                    </optgroup>
                    <optgroup label="과학탐구">
                      {SCIENCE_STUDIES.map(opt => (
                        <option key={opt} value={opt} disabled={opt === formData.subjects.inquiry2}>{opt}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">탐구 2</label>
                  <select
                    value={formData.subjects.inquiry2}
                    onChange={(e) => setFormData({
                      ...formData,
                      subjects: { ...formData.subjects, inquiry2: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">선택하세요</option>
                    <optgroup label="사회탐구">
                      {SOCIAL_STUDIES.map(opt => (
                        <option key={opt} value={opt} disabled={opt === formData.subjects.inquiry1}>{opt}</option>
                      ))}
                    </optgroup>
                    <optgroup label="과학탐구">
                      {SCIENCE_STUDIES.map(opt => (
                        <option key={opt} value={opt} disabled={opt === formData.subjects.inquiry1}>{opt}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>
              <p className="text-xs text-neutral-400 mt-2">
                사탐: {SOCIAL_STUDIES.length}과목, 과탐: {SCIENCE_STUDIES.length}과목 중 2과목 선택
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
