'use client';

import { Student } from './StudentModal';

interface StudentsTableProps {
  students: Student[];
  loading: boolean;
  totalCount: number;
}

export function StudentsTable({ students, loading, totalCount }: StudentsTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="py-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2" />
          <span className="text-neutral-600">학생 목록을 불러오는 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">이름</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">전화번호</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">학부모전화번호</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">반</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">자습실</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">좌석</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">트랙</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {students.map(student => (
              <tr key={student.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 text-sm font-medium text-neutral-900">{student.name}</td>
                <td className="px-4 py-3 text-sm font-mono text-neutral-600">{student.phoneNumber || '-'}</td>
                <td className="px-4 py-3 text-sm font-mono text-neutral-600">{student.parentPhoneNumber || '-'}</td>
                <td className="px-4 py-3">
                  {student.grade ? (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                      {student.grade}반
                    </span>
                  ) : '-'}
                </td>
                <td className="px-4 py-3">
                  {student.studyRoom ? (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                      {student.studyRoom}
                    </span>
                  ) : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-neutral-600">{student.seat || '-'}</td>
                <td className="px-4 py-3 text-sm text-neutral-600">{student.track || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {students.length === 0 && (
        <div className="py-12 text-center text-neutral-500">
          {totalCount === 0 ? 'SNPortal에서 학생 데이터를 가져올 수 없습니다.' : '검색 결과가 없습니다.'}
        </div>
      )}
    </div>
  );
}
