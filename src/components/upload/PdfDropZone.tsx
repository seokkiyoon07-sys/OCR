'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UploadResponse {
  session_id: string;
  preview_url: string;
  filename: string;
}

interface PdfDropZoneProps {
  templateName?: string;
  onUploaded?: (sessionId: string, previewUrl: string, fileName: string) => void;
}

export default function PdfDropZone({
  templateName,
  onUploaded,
}: PdfDropZoneProps) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { isAuthenticated, userId } = useAuth();

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const currentUserId = userId?.trim();
    if (!isAuthenticated || !currentUserId) {
      setMessage('업로드하려면 로그인이 필요합니다.');
      event.target.value = '';
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('template_path', templateName ?? '');
      formData.append('user_id', currentUserId);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`업로드 실패 (${response.status})`);
      }

      const data = (await response.json()) as UploadResponse;
      onUploaded?.(data.session_id, data.preview_url, data.filename);
      setMessage('업로드 완료');
    } catch (error) {
      console.error(error);
      const err = error instanceof Error ? error.message : '업로드 중 오류';
      setMessage(err);
      alert(err);
    } finally {
      setBusy(false);
      event.target.value = '';
    }
  };

  return (
    <div style={{ marginBottom: 12 }}>
      <input
        type="file"
        accept="application/pdf"
        onChange={handleChange}
        aria-label="시험지 PDF 업로드"
      />
      {busy && (
        <div style={{ fontSize: 12, color: '#666' }} aria-live="polite">
          업로드 중…
        </div>
      )}
      {message && (
        <div
          style={{ fontSize: 12, color: busy ? '#666' : '#2d6a4f' }}
          aria-live="polite"
        >
          {message}
        </div>
      )}
    </div>
  );
}
