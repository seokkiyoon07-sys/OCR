'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';

// Subject filter configuration
const MAIN_SUBJECTS = [
  { id: 'ALL', name: '전체' },
  { id: '국어', name: '국어' },
  { id: '수학', name: '수학' },
  { id: '영어', name: '영어' },
  { id: '사회탐구', name: '사회탐구' },
  { id: '과학탐구', name: '과학탐구' },
  { id: '한국사', name: '한국사' }
];

const SUB_SUBJECTS: Record<string, { id: string; name: string }[]> = {
  사회탐구: [
    { id: '생활과 윤리', name: '생활과 윤리' },
    { id: '윤리와 사상', name: '윤리와 사상' },
    { id: '한국지리', name: '한국지리' },
    { id: '세계지리', name: '세계지리' },
    { id: '동아시아사', name: '동아시아사' },
    { id: '세계사', name: '세계사' },
    { id: '경제', name: '경제' },
    { id: '정치와 법', name: '정치와 법' },
    { id: '사회문화', name: '사회·문화' }
  ],
  과학탐구: [
    { id: '물리학Ⅰ', name: '물리학Ⅰ' },
    { id: '화학Ⅰ', name: '화학Ⅰ' },
    { id: '생명과학Ⅰ', name: '생명과학Ⅰ' },
    { id: '지구과학Ⅰ', name: '지구과학Ⅰ' },
    { id: '물리학Ⅱ', name: '물리학Ⅱ' },
    { id: '화학Ⅱ', name: '화학Ⅱ' },
    { id: '생명과학Ⅱ', name: '생명과학Ⅱ' },
    { id: '지구과학Ⅱ', name: '지구과학Ⅱ' }
  ]
};

interface CSVDownloadSectionProps {
  onDownload?: (subject: string, subSubject?: string) => void;
}

export function CSVDownloadSection({ onDownload }: CSVDownloadSectionProps) {
  const [mainSubject, setMainSubject] = useState('ALL');
  const [subSubject, setSubSubject] = useState('');

  const handleDownload = () => {
    onDownload?.(mainSubject, subSubject || undefined);
  };

  return (
    <div className="p-6 border-b rounded-2xl border bg-white">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">개별 결과 다운로드</h3>
          <p className="text-sm text-neutral-600 mt-1">학생별 성적표 데이터를 CSV로 받으세요</p>
        </div>
        <button 
          onClick={handleDownload}
          className="px-4 py-2 rounded-xl border-2 border-green-600 text-green-600 hover:bg-green-50 font-medium text-sm flex items-center gap-1"
        >
          <Download size={14} />
          CSV 다운로드
        </button>
      </div>
      
      <div className="mt-4">
        <div className="flex flex-wrap gap-2">
          {MAIN_SUBJECTS.map(({ id, name }) => (
            <button
              key={id}
              onClick={() => {
                setMainSubject(id);
                setSubSubject('');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                mainSubject === id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
        
        {/* Sub-subject buttons (for 사회탐구, 과학탐구) */}
        {(mainSubject === '사회탐구' || mainSubject === '과학탐구') && SUB_SUBJECTS[mainSubject] && (
          <div className="mt-2 flex flex-wrap gap-2">
            {SUB_SUBJECTS[mainSubject].map(({ id, name }) => (
              <button
                key={id}
                onClick={() => setSubSubject(subSubject === id ? '' : id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  subSubject === id
                    ? 'bg-gray-700 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
