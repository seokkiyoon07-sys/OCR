'use client';

import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';

// 타입 정의
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

interface UploadContextValue {
  // 세션 관련
  sessionId: string | null;
  setSessionId: (id: string | null) => void;
  
  // 파일 관련
  fileName: string;
  setFileName: (name: string) => void;
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
  
  // 업로드 상태
  isUploading: boolean;
  setIsUploading: (uploading: boolean) => void;
  uploadStatus: string;
  setUploadStatus: (status: string) => void;
  uploadError: string;
  setUploadError: (error: string) => void;
  
  // 레이아웃 관련
  layout: Layout;
  setLayout: (layout: Layout | ((prev: Layout) => Layout)) => void;
  selectedBlockIndex: number | null;
  setSelectedBlockIndex: (index: number | null) => void;
  
  // 템플릿 관련
  templateName: string;
  setTemplateName: (name: string) => void;
  templateList: string[];
  setTemplateList: (list: string[]) => void;
  
  // 페이지 네비게이션
  currentPageNum: number;
  setCurrentPageNum: (page: number) => void;
  totalPages: number;
  setTotalPages: (pages: number) => void;
  
  // 파일 입력 ref
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  
  // 핸들러
  saveLayoutToServer: () => Promise<void>;
  saveLayoutToFile: () => void;
  navigateToPage: (pageNum: number) => Promise<void>;
  handleFileUpload: (file: File, template: string) => Promise<void>;
  resetUploadState: () => void;
}

const UploadContext = createContext<UploadContextValue | null>(null);

export function UploadProvider({ children }: { children: ReactNode }) {
  // 세션 관련
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // 파일 관련
  const [fileName, setFileName] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // 업로드 상태
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadError, setUploadError] = useState('');
  
  // 레이아웃 관련
  const [layout, setLayout] = useState<Layout>({ blocks: [] });
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);
  
  // 템플릿 관련
  const [templateName, setTemplateName] = useState('');
  const [templateList, setTemplateList] = useState<string[]>([]);
  
  // 페이지 네비게이션
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // 파일 입력 ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 레이아웃을 서버에 저장
  const saveLayoutToServer = useCallback(async () => {
    if (!sessionId || !layout.blocks?.length) return;
    
    try {
      await fetch('/api/layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          file_name: fileName,
          layout,
        }),
      });
    } catch (error) {
      console.error('Failed to save layout:', error);
    }
  }, [sessionId, fileName, layout]);

  // 레이아웃을 JSON 파일로 저장
  const saveLayoutToFile = useCallback(() => {
    if (!layout.blocks?.length) return;
    
    const blob = new Blob([JSON.stringify(layout, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `layout_${fileName || 'unnamed'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [layout, fileName]);

  // 페이지 네비게이션
  const navigateToPage = useCallback(async (pageNum: number) => {
    if (!sessionId || pageNum < 1 || pageNum > totalPages) return;
    
    try {
      const resp = await fetch(`/api/preview?session_id=${encodeURIComponent(sessionId)}&page=${pageNum}`);
      if (resp.ok) {
        const blob = await resp.blob();
        const newUrl = URL.createObjectURL(blob);
        setPreviewUrl(newUrl);
        setCurrentPageNum(pageNum);
        
        // 해당 페이지의 레이아웃 로드
        const layoutResp = await fetch(`/api/layout?session_id=${encodeURIComponent(sessionId)}&page=${pageNum}`);
        if (layoutResp.ok) {
          const layoutData = await layoutResp.json();
          if (layoutData.layout) {
            setLayout(layoutData.layout);
          }
        }
      }
    } catch (error) {
      console.error('Failed to navigate to page:', error);
    }
  }, [sessionId, totalPages]);

  // 파일 업로드 처리
  const handleFileUpload = useCallback(async (file: File, template: string) => {
    setIsUploading(true);
    setUploadStatus('파일 업로드 중...');
    setUploadError('');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('template_path', template === '기타' ? '' : template);
      formData.append('user_id', 'developer');
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `업로드 실패 (${response.status})`);
      }
      
      const data = await response.json();
      
      setSessionId(data.session_id);
      setFileName(data.filename || file.name.replace(/\.[^/.]+$/, ''));
      setTotalPages(data.num_pages || 1);
      setCurrentPageNum(1);
      
      if (data.layout) {
        setLayout(data.layout);
      }
      
      if (data.template_name) {
        setTemplateName(data.template_name);
      }
      
      // 미리보기 이미지 로드
      if (data.session_id) {
        const previewResp = await fetch(`/api/preview?session_id=${encodeURIComponent(data.session_id)}&page=1`);
        if (previewResp.ok) {
          const blob = await previewResp.blob();
          setPreviewUrl(URL.createObjectURL(blob));
        }
      }
      
      setUploadStatus('');
    } catch (error) {
      const message = error instanceof Error ? error.message : '업로드 중 오류가 발생했습니다.';
      setUploadError(message);
      setUploadStatus('');
    } finally {
      setIsUploading(false);
    }
  }, []);

  // 상태 초기화
  const resetUploadState = useCallback(() => {
    setSessionId(null);
    setFileName('');
    setPreviewUrl(null);
    setLayout({ blocks: [] });
    setSelectedBlockIndex(null);
    setTemplateName('');
    setCurrentPageNum(1);
    setTotalPages(1);
    setUploadError('');
    setUploadStatus('');
  }, []);

  const value: UploadContextValue = {
    sessionId,
    setSessionId,
    fileName,
    setFileName,
    previewUrl,
    setPreviewUrl,
    isUploading,
    setIsUploading,
    uploadStatus,
    setUploadStatus,
    uploadError,
    setUploadError,
    layout,
    setLayout,
    selectedBlockIndex,
    setSelectedBlockIndex,
    templateName,
    setTemplateName,
    templateList,
    setTemplateList,
    currentPageNum,
    setCurrentPageNum,
    totalPages,
    setTotalPages,
    fileInputRef,
    saveLayoutToServer,
    saveLayoutToFile,
    navigateToPage,
    handleFileUpload,
    resetUploadState,
  };

  return (
    <UploadContext.Provider value={value}>
      {children}
    </UploadContext.Provider>
  );
}

export function useUploadContext() {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error('useUploadContext must be used within an UploadProvider');
  }
  return context;
}
