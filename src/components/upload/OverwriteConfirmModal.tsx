'use client';

import { AlertTriangle, X } from 'lucide-react';

interface OverwriteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  existingCount?: number;
  type: 'exam' | 'answer';
}

export default function OverwriteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  existingCount,
  type,
}: OverwriteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6" data-testid="overwrite-confirm-modal">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600"
          aria-label="닫기"
        >
          <X size={20} />
        </button>

        {/* Warning icon */}
        <div className="flex justify-center mb-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            type === 'exam' ? 'bg-orange-100' : 'bg-blue-100'
          }`}>
            <AlertTriangle 
              size={32} 
              className={type === 'exam' ? 'text-orange-500' : 'text-blue-500'} 
            />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold text-center mb-2" data-testid="overwrite-modal-title">
          {title}
        </h2>

        {/* Message */}
        <p className="text-sm text-neutral-600 text-center mb-4" data-testid="overwrite-modal-message">
          {message}
        </p>

        {/* Existing count info */}
        {existingCount !== undefined && existingCount > 0 && (
          <div className={`text-center mb-4 py-2 px-4 rounded-lg ${
            type === 'exam' ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'
          }`}>
            <span className="text-sm font-medium">
              기존 {type === 'exam' ? '채점 데이터' : '정답지'}: {existingCount}
              {type === 'exam' ? '명' : '문항'}
            </span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors"
            data-testid="overwrite-cancel-btn"
          >
            아니오
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors ${
              type === 'exam' 
                ? 'bg-orange-500 hover:bg-orange-600' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
            data-testid="overwrite-confirm-btn"
          >
            예, 덮어쓰기
          </button>
        </div>
      </div>
    </div>
  );
}
