'use client';

import { useState } from 'react';
import type { Layout } from '@/types/omr';

interface GradeRunnerProps {
  sessionId: string | null;
  layout: Layout;
  fileName: string;
  answerFileName: string;
}

interface GradeResponse {
  log?: string;
  csv_url?: string;
  json_url?: string;
  zip_url?: string;
  [key: string]: unknown;
}

export default function GradeRunner({
  sessionId,
  layout,
  fileName,
  answerFileName,
}: GradeRunnerProps) {
  const [log, setLog] = useState('');
  const [urls, setUrls] = useState<GradeResponse | null>(null);
  const [answerKey, setAnswerKey] = useState('{}');
  const [threshold, setThreshold] = useState(0.05);
  const [tie, setTie] = useState(0.05);
  const [isLoading, setIsLoading] = useState(false);

  const saveLayout = async () => {
    const response = await fetch('/api/layout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, layout }),
    });
    const data = await response.json();
    if (!data?.ok) throw new Error('layout save failed');
  };

  const start = async () => {
    if (!sessionId) {
      alert('세션이 없습니다');
      return;
    }
    setIsLoading(true);
    try {
      await saveLayout();
      const response = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          file_name: fileName,
          answer_name: answerFileName,
          T: threshold,
          tie,
          answer_key: JSON.parse(answerKey || '{}'),
        }),
      });
      const data = (await response.json()) as GradeResponse;
      setUrls(data);
      setLog(data.log || '');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '채점 중 오류가 발생했습니다.';
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 16 }}>
      <h3>채점</h3>
      <button
        onClick={() => {
          setLog('');
          start();
        }}
        disabled={!sessionId || isLoading}
      >
        {isLoading ? '채점중…' : '채점 시작'}
      </button>

      <div style={{ marginTop: 8, display: 'grid', gap: 6 }}>
        <label style={{ fontSize: 13, display: 'flex', flexDirection: 'column' }}>
          T (threshold)
          <input
            type="number"
            step="0.01"
            value={threshold}
            onChange={(event) => setThreshold(Number(event.target.value))}
          />
        </label>
        <label style={{ fontSize: 13, display: 'flex', flexDirection: 'column' }}>
          tie
          <input
            type="number"
            step="0.01"
            value={tie}
            onChange={(event) => setTie(Number(event.target.value))}
          />
        </label>
        <label style={{ fontSize: 13, display: 'flex', flexDirection: 'column' }}>
          answer_key (JSON)
          <textarea
            rows={4}
            value={answerKey}
            onChange={(event) => setAnswerKey(event.target.value)}
            style={{ resize: 'vertical' }}
          />
        </label>
      </div>

      {urls && (
        <div style={{ marginTop: 8, display: 'grid', gap: 6 }}>
          {urls.csv_url && (
            <a href={urls.csv_url as string} target="_blank" rel="noreferrer">
              결과 CSV
            </a>
          )}
          {urls.json_url && (
            <a href={urls.json_url as string} target="_blank" rel="noreferrer">
              상세 JSON
            </a>
          )}
          {urls.zip_url && (
            <a href={urls.zip_url as string} target="_blank" rel="noreferrer">
              주석 ZIP
            </a>
          )}
        </div>
      )}

      {log && (
        <pre
          style={{
            whiteSpace: 'pre-wrap',
            background: '#111',
            color: '#0f0',
            padding: 8,
            marginTop: 8,
            borderRadius: 6,
          }}
        >
          {log}
        </pre>
      )}
    </div>
  );
}
