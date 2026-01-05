'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Select } from '@/components/ui/Select';

// 선택과목 옵션
export const KOREAN_OPTIONS = ['언어와매체', '화법과작문'];
export const MATH_OPTIONS = ['확률과통계', '미적분', '기하'];
export const SOCIAL_STUDIES = ['생활과윤리', '윤리와사상', '한국지리', '세계지리', '동아시아사', '세계사', '경제', '정치와법', '사회문화'];
export const SCIENCE_STUDIES = ['물리학Ⅰ', '물리학Ⅱ', '화학Ⅰ', '화학Ⅱ', '생명과학Ⅰ', '생명과학Ⅱ', '지구과학Ⅰ', '지구과학Ⅱ'];

export interface StudentSubjects {
  korean: string;
  math: string;
  inquiry1: string;
  inquiry2: string;
}

export interface Student {
  id: string;
  name: string;
  phoneNumber: string;
  parentPhoneNumber: string;
  academy: string;
  className: string;
  studentNumber?: string;
  grade?: string;
  studyRoom?: string;
  seat?: string;
  track?: string;
  subjects: StudentSubjects;
  registeredAt: string;
}

interface StudentModalProps {
  student: Student | null;
  onClose: () => void;
  onSave: (student: Student) => void;
}

export function StudentModal({ student, onClose, onSave }: StudentModalProps) {
  const [formData, setFormData] = useState<Omit<Student, 'id'>>({
    name: student?.name || '',
    phoneNumber: student?.phoneNumber || '',
    parentPhoneNumber: student?.parentPhoneNumber || '',
    academy: student?.academy || 'SN독학기숙학원',
    className: student?.className || '',
    studentNumber: student?.studentNumber || '',
    grade: student?.grade || '',
    studyRoom: student?.studyRoom || '',
    seat: student?.seat || '',
    track: student?.track || '',
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
              <label className="block text-sm font-medium text-neutral-700 mb-1">학번</label>
              <input
                type="text"
                value={formData.studentNumber}
                onChange={(e) => setFormData({ ...formData, studentNumber: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">학년</label>
              <input
                type="text"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                placeholder="예: 고3"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">자습실</label>
              <input
                type="text"
                value={formData.studyRoom}
                onChange={(e) => setFormData({ ...formData, studyRoom: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">좌석</label>
              <input
                type="text"
                value={formData.seat}
                onChange={(e) => setFormData({ ...formData, seat: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">트랙</label>
            <input
              type="text"
              value={formData.track}
              onChange={(e) => setFormData({ ...formData, track: e.target.value })}
              placeholder="예: 이과, 문과"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 선택과목 섹션 */}
          <div className="border-t pt-4 mt-4">
            <h3 className="text-sm font-bold text-neutral-800 mb-3">선택과목</h3>

            <div className="grid grid-cols-2 gap-4">
              {/* 국어 선택 */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">국어 선택</label>
                <Select
                  value={formData.subjects.korean || ''}
                  onValueChange={(value) => setFormData({
                    ...formData,
                    subjects: { ...formData.subjects, korean: value }
                  })}
                  options={[
                    { value: '', label: '선택하세요' },
                    ...KOREAN_OPTIONS.map(opt => ({ value: opt, label: opt }))
                  ]}
                  placeholder="선택하세요"
                />
              </div>

              {/* 수학 선택 */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">수학 선택</label>
                <Select
                  value={formData.subjects.math || ''}
                  onValueChange={(value) => setFormData({
                    ...formData,
                    subjects: { ...formData.subjects, math: value }
                  })}
                  options={[
                    { value: '', label: '선택하세요' },
                    ...MATH_OPTIONS.map(opt => ({ value: opt, label: opt }))
                  ]}
                  placeholder="선택하세요"
                />
              </div>
            </div>

            {/* 탐구 선택 */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-neutral-700 mb-2">탐구 선택 (2과목)</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">탐구 1</label>
                  <Select
                    value={formData.subjects.inquiry1 || ''}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      subjects: { ...formData.subjects, inquiry1: value }
                    })}
                    options={[
                      { value: '', label: '선택하세요' },
                      ...SOCIAL_STUDIES.map(opt => ({ 
                        value: opt, 
                        label: opt,
                        disabled: opt === formData.subjects.inquiry2
                      })),
                      ...SCIENCE_STUDIES.map(opt => ({ 
                        value: opt, 
                        label: opt,
                        disabled: opt === formData.subjects.inquiry2
                      })),
                    ]}
                    placeholder="선택하세요"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">탐구 2</label>
                  <Select
                    value={formData.subjects.inquiry2 || ''}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      subjects: { ...formData.subjects, inquiry2: value }
                    })}
                    options={[
                      { value: '', label: '선택하세요' },
                      ...SOCIAL_STUDIES.map(opt => ({ 
                        value: opt, 
                        label: opt,
                        disabled: opt === formData.subjects.inquiry1
                      })),
                      ...SCIENCE_STUDIES.map(opt => ({ 
                        value: opt, 
                        label: opt,
                        disabled: opt === formData.subjects.inquiry1
                      })),
                    ]}
                    placeholder="선택하세요"
                  />
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
