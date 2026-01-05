'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Check, X, Save, ExternalLink } from 'lucide-react';

interface NameIssue {
  file_name: string;
  recognized_name: string | null;
  issue_type: string;
  affected_syllables: number[];
  block_image_path?: string;
  corrected_name?: string;
}

interface NameIssuesData {
  total_files: number;
  issues_found: number;
  issues: NameIssue[];
}

interface NameCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  nameIssues: NameIssuesData | null;
  onCorrectionsSaved?: () => void;
}

export default function NameCorrectionModal({
  isOpen,
  onClose,
  sessionId,
  nameIssues,
  onCorrectionsSaved,
}: NameCorrectionModalProps) {
  const [corrections, setCorrections] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState<number | null>(null);

  // Initialize corrections from existing corrected names
  useEffect(() => {
    if (nameIssues?.issues) {
      const initial: Record<string, string> = {};
      for (const issue of nameIssues.issues) {
        if (issue.corrected_name) {
          initial[issue.file_name] = issue.corrected_name;
        } else if (issue.recognized_name) {
          initial[issue.file_name] = issue.recognized_name;
        }
      }
      setCorrections(initial);
    }
  }, [nameIssues]);

  if (!isOpen || !nameIssues) return null;

  const handleCorrection = (fileName: string, value: string) => {
    setCorrections((prev) => ({
      ...prev,
      [fileName]: value,
    }));
    setSavedCount(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const correctionsList = Object.entries(corrections)
        .filter(([fileName, correctedName]) => {
          const issue = nameIssues.issues.find((i) => i.file_name === fileName);
          return issue && correctedName !== issue.recognized_name;
        })
        .map(([file_name, corrected_name]) => ({ file_name, corrected_name }));

      if (correctionsList.length === 0) {
        setError('수정할 항목이 없습니다.');
        setIsSaving(false);
        return;
      }

      const response = await fetch('/api/grade/correct-names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          corrections: correctionsList,
        }),
      });

      if (!response.ok) {
        throw new Error('저장에 실패했습니다.');
      }

      const result = await response.json();
      setSavedCount(result.updated_count || correctionsList.length);
      onCorrectionsSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const getIssueTypeLabel = (type: string) => {
    switch (type) {
      case 'partial_syllable':
        return '일부 음절 인식 오류';
      case 'all_blank':
        return '전체 미인식';
      case 'blank_column':
        return '일부 열 미인식';
      default:
        return type;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-amber-100">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">성명 인식 오류 수정</h3>
              <p className="text-sm text-neutral-600">
                {nameIssues.issues_found}건의 성명 인식 문제가 발견되었습니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {nameIssues.issues.map((issue, idx) => (
              <div
                key={issue.file_name || idx}
                className="border rounded-xl p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-neutral-500">
                      파일: {issue.file_name}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          issue.issue_type === 'partial_syllable'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {getIssueTypeLabel(issue.issue_type)}
                      </span>
                      {issue.affected_syllables.length > 0 && (
                        <span className="text-xs text-neutral-500">
                          ({issue.affected_syllables.map((s) => s + 1).join(', ')}번째
                          음절)
                        </span>
                      )}
                    </div>
                  </div>
                  {issue.block_image_path && (
                    <a
                      href={`/api/files/${sessionId}/${issue.block_image_path.split('/').pop()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      이미지 보기
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-neutral-500 block mb-1">
                      인식된 이름
                    </label>
                    <div className="px-3 py-2 bg-neutral-100 rounded-lg text-sm">
                      {issue.recognized_name || '(인식 실패)'}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-500 block mb-1">
                      수정된 이름
                    </label>
                    <input
                      type="text"
                      value={corrections[issue.file_name] || ''}
                      onChange={(e) =>
                        handleCorrection(issue.file_name, e.target.value)
                      }
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="올바른 이름 입력"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {nameIssues.issues.length === 0 && (
            <div className="text-center py-8 text-neutral-500">
              성명 인식 오류가 없습니다.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-neutral-50">
          {error && (
            <div className="mb-4 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}
          {savedCount !== null && (
            <div className="mb-4 px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600 flex items-center gap-2">
              <Check className="w-4 h-4" />
              {savedCount}건의 수정사항이 저장되었습니다.
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border hover:bg-neutral-100"
            >
              닫기
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-black text-white hover:bg-neutral-800 disabled:bg-neutral-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  수정사항 저장
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
