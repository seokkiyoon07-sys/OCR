'use client';

import { useEffect, useState } from 'react';

interface LoadLayoutButtonProps {
  onLoaded?: (layout: unknown, templateName: string) => void;
}

export default function LoadLayoutButton({ onLoaded }: LoadLayoutButtonProps) {
  const [templates, setTemplates] = useState<string[]>([]);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const response = await fetch('/api/templates');
        if (!response.ok) throw new Error('템플릿 목록 조회 실패');
        const files = (await response.json()) as string[];
        if (mounted) setTemplates(files);
      } catch (error) {
        console.error(error);
        alert('템플릿 목록을 불러오지 못했습니다.');
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const filename = event.target.value;
    setSelected(filename);
    if (!filename) return;
    try {
      const response = await fetch(
        `/api/templates/${encodeURIComponent(filename)}`,
      );
      if (!response.ok) {
        const txt = await response.text();
        console.error('HTTP ERROR', response.status, txt);
        throw new Error('템플릿 로드 실패');
      }
      const json = await response.json();
      onLoaded?.(json, filename.replace(/\.json$/, ''));
    } catch (error) {
      console.error(error);
      alert('템플릿 로드 중 오류가 발생했습니다.');
    }
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <label htmlFor="template-select">템플릿 선택:</label>
      <select
        id="template-select"
        value={selected}
        onChange={handleChange}
        style={{ padding: '6px 10px', borderRadius: 6 }}
      >
        <option value="">선택하세요</option>
        {templates.map((name) => (
          <option key={name} value={name}>
            {name.replace(/\.json$/, '')}
          </option>
        ))}
      </select>
    </div>
  );
}
