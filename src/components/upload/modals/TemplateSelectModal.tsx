'use client';

import React from 'react';

interface TemplateSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateList: string[];
  selectedTemplate: string;
  setSelectedTemplate: (template: string) => void;
  onUpload: () => void;
  isUploading: boolean;
}

export function TemplateSelectModal({
  isOpen,
  onClose,
  templateList,
  selectedTemplate,
  setSelectedTemplate,
  onUpload,
  isUploading,
}: TemplateSelectModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">시험 종류를 선택해 주세요</h3>
          <p className="text-sm text-neutral-600 mt-1">
            업로드한 PDF를 선택한 템플릿에 맞게 정렬합니다.
          </p>
        </div>
        
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="space-y-2">
            {templateList.map((template) => (
              <button
                key={template}
                onClick={() => setSelectedTemplate(template)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                  selectedTemplate === template
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <div className="font-medium text-sm">{template}</div>
              </button>
            ))}
            <button
              onClick={() => setSelectedTemplate('기타')}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                selectedTemplate === '기타'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              <div className="font-medium text-sm">기타 (정렬 없이 업로드)</div>
              <div className="text-xs text-neutral-500 mt-0.5">템플릿 없이 원본 그대로 사용</div>
            </button>
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
            onClick={onUpload}
            disabled={!selectedTemplate || isUploading}
            className="px-4 py-2 rounded-xl bg-black text-white hover:bg-neutral-800 disabled:bg-neutral-300 disabled:cursor-not-allowed"
          >
            {isUploading ? '업로드 중...' : '업로드'}
          </button>
        </div>
      </div>
    </div>
  );
}
