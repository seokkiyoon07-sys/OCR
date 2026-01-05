'use client';

import React from 'react';
import { Download, AlertTriangle, Menu } from 'lucide-react';
import LayoutCanvas from '@/components/upload/LayoutCanvas';
import BlockSidebar from '@/components/upload/BlockSidebar';
import type { GradingProgress, GradeResponse } from '@/types/upload';

interface LayoutBlock {
  type: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  [key: string]: unknown;
}

interface Layout {
  blocks: LayoutBlock[];
  [key: string]: unknown;
}

interface GradingRangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  // 파일 정보
  fileName: string;
  sessionId: string | null;
  // 레이아웃
  previewUrl: string | null;
  layout: Layout;
  setLayout: (layout: Layout | ((prev: Layout) => Layout)) => void;
  selectedBlockIndex: number | null;
  setSelectedBlockIndex: (index: number | null) => void;
  templateName: string;
  // 페이지 네비게이션
  currentPageNum: number;
  totalPages: number;
  navigateToPage: (pageNum: number) => Promise<void>;
  // 사이드바
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  // 채점 상태
  isGrading: boolean;
  gradingProgress: GradingProgress;
  gradingError: string | null;
  gradeResult: GradeResponse | null;
  namesCorrected: boolean;
  // 핸들러
  saveLayoutToFile: () => void;
  handleStartGrading: () => Promise<void>;
  setIsNameCorrectionOpen: (open: boolean) => void;
}

export function GradingRangeModal({
  isOpen,
  onClose,
  fileName,
  sessionId,
  previewUrl,
  layout,
  setLayout,
  selectedBlockIndex,
  setSelectedBlockIndex,
  templateName,
  currentPageNum,
  totalPages,
  navigateToPage,
  isSidebarOpen,
  setIsSidebarOpen,
  isGrading,
  gradingProgress,
  gradingError,
  gradeResult,
  namesCorrected,
  saveLayoutToFile,
  handleStartGrading,
  setIsNameCorrectionOpen,
}: GradingRangeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* 페이지 정보 헤더 */}
      <div className="p-4 border-b shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">채점 구간 설정</h3>
          <div className="flex items-center gap-3 text-sm text-neutral-600">
            <div className="px-2 py-0.5 bg-neutral-100 rounded">
              파일: <span className="font-medium">{fileName ? `${fileName}.pdf` : '업로드된 파일 없음'}</span>
            </div>
            <div>
              세션: <span className="font-medium">{sessionId ?? '-'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={saveLayoutToFile}
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!layout.blocks?.length}
          >
            레이아웃 저장(JSON)
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-full text-gray-500 hover:text-gray-700"
          >
            <span className="sr-only">닫기</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 왼쪽: 업로드된 시험지 */}
        <div className="flex-1 bg-gray-100 relative overflow-hidden flex items-center justify-center">
          {/* 사이드바 닫혔을 때 여는 버튼 */}
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="absolute top-4 right-4 z-10 p-2 bg-white rounded-lg shadow-md hover:bg-neutral-50 border text-neutral-600"
            >
              <Menu size={20} />
            </button>
          )}

          <div className="w-full h-full flex items-center justify-center">
            {previewUrl ? (
              <LayoutCanvas
                imageUrl={previewUrl}
                layout={layout}
                onChange={setLayout}
                selected={selectedBlockIndex}
                onSelect={setSelectedBlockIndex}
                hideControls
                className="w-full h-full"
                canvasClassName="w-full h-auto shadow-lg border border-neutral-200 bg-white"
              />
            ) : (
              <div className="text-center text-sm text-gray-500">
                <div className="mb-2 text-3xl">📄</div>
                PDF를 업로드하면 미리보기가 표시됩니다.
              </div>
            )}
          </div>
        </div>

        {/* 오른쪽: 페이지 네비게이션 및 블록 목록 */}
        {isSidebarOpen && (
          <div className="w-96 p-6 border-l bg-white overflow-y-auto">
            <div className="space-y-4">
              {/* 페이지 네비게이션 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">페이지 네비게이션</h4>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1 hover:bg-neutral-100 rounded text-neutral-500"
                    title="사이드바 접기"
                  >
                    <Menu size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => navigateToPage(currentPageNum - 1)}
                    disabled={currentPageNum <= 1 || !sessionId}
                    className="px-3 py-1 rounded-lg border text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← 이전
                  </button>
                  <input
                    type="number"
                    value={currentPageNum}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) {
                        navigateToPage(val);
                      }
                    }}
                    className="w-16 px-2 py-1 text-sm border rounded text-center"
                    min="1"
                    max={totalPages}
                    disabled={!sessionId}
                  />
                  <span className="text-sm text-gray-500">/ {totalPages}</span>
                  <button 
                    onClick={() => navigateToPage(currentPageNum + 1)}
                    disabled={currentPageNum >= totalPages || !sessionId}
                    className="px-3 py-1 rounded-lg border text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    다음 →
                  </button>
                </div>
              </div>

              {/* 현재 템플릿 표시 */}
              {templateName && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-xs text-blue-600 font-medium">적용된 템플릿</div>
                  <div className="text-sm font-medium text-blue-800 mt-1">
                    {templateName.replace(/\.json$/, '')}
                  </div>
                </div>
              )}

              {/* 블록 목록 */}
              <div>
                <BlockSidebar
                  layout={layout}
                  onChange={setLayout}
                  selected={selectedBlockIndex}
                  setSelected={setSelectedBlockIndex}
                  className="space-y-4"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 하단: 채점 시작/결과 버튼 */}
      <div className="p-4 border-t bg-gray-50">
        {/* 채점 오류 표시 */}
        {gradingError && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 flex items-start gap-2">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">채점 오류</div>
              <div className="text-xs mt-0.5">{gradingError}</div>
            </div>
          </div>
        )}
        
        {/* 채점 진행 상태 표시 */}
        {isGrading && gradingProgress.status && (
          <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="font-medium">{gradingProgress.status}</span>
            </div>
            {gradingProgress.total > 0 && (
              <div className="mt-2">
                <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${(gradingProgress.current / gradingProgress.total) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  {gradingProgress.current} / {gradingProgress.total} 페이지 완료
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            총 {layout.blocks?.length ?? 0}개 블록 선택됨
          </div>
          <div className="flex items-center gap-2">
            {gradeResult ? (
              <>
                <div className="flex items-center text-green-600 font-medium mr-2">
                  <span className="mr-1">✓</span> 채점 완료
                </div>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border hover:bg-neutral-50 text-gray-600"
                >
                  닫기
                </button>
                {gradeResult.csv_url && (
                  namesCorrected ? (
                    <a
                      href={gradeResult.csv_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
                    >
                      <Download size={16} />
                      CSV 다운로드
                    </a>
                  ) : (
                    <button
                      onClick={() => setIsNameCorrectionOpen(true)}
                      className="px-4 py-2 rounded-xl bg-amber-500 text-white hover:bg-amber-600 flex items-center gap-2"
                    >
                      <AlertTriangle size={16} />
                      성명 수정 필요
                    </button>
                  )
                )}
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border hover:bg-neutral-50 disabled:opacity-50"
                  disabled={isGrading}
                >
                  취소
                </button>
                <button
                  onClick={() => void handleStartGrading()}
                  className="px-4 py-2 rounded-xl bg-black text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 flex items-center gap-2"
                  disabled={isGrading || !sessionId}
                >
                  {isGrading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {isGrading ? '채점 중...' : '채점 시작'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
