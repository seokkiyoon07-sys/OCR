'use client';

import { useMemo, useState } from 'react';
import { normalizeBlock } from '@/lib/omr/normalizeBlock';
import type { Block, Layout } from '@/types/omr';

const PRESETS: Record<
  'grid' | 'digits' | 'id' | 'phone' | 'name' | 'code',
  { rows: number; cols: number }
> = {
  grid: { rows: 10, cols: 5 },
  digits: { rows: 10, cols: 3 },
  id: { rows: 10, cols: 8 },
  phone: { rows: 10, cols: 9 },
  name: { rows: 21, cols: 12 },
  code: { rows: 3, cols: 1 },
};

const reorder = <T,>(arr: T[], from: number, to: number) => {
  const next = arr.slice();
  const [removed] = next.splice(from, 1);
  next.splice(to, 0, removed);
  return next;
};

type LayoutSetter = React.Dispatch<React.SetStateAction<Layout>>;

interface BlockSidebarProps {
  layout: Layout;
  onChange?: LayoutSetter;
  selected?: number | null;
  setSelected?: (index: number | null) => void;
  className?: string;
}

export default function BlockSidebar({
  layout,
  onChange,
  selected = null,
  setSelected,
  className,
}: BlockSidebarProps) {
  const blocks = useMemo(
    () => (Array.isArray(layout?.blocks) ? layout.blocks : []),
    [layout],
  );
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const emit = (
    updater: (list: Block[], base: Layout) => Block[] | undefined,
  ) => {
    if (typeof onChange !== 'function') return;
    onChange((prevLayout) => {
      const base = prevLayout || { dpi: 300, blocks: [] };
      const currentBlocks = Array.isArray(base.blocks)
        ? base.blocks.slice()
        : [];
      const nextBlocks = updater(currentBlocks, base);
      if (!nextBlocks) return base;
      return { ...base, blocks: nextBlocks };
    });
  };

  const updateBlock = (index: number, patch: Partial<Block>) => {
    emit((list) => {
      if (!list[index]) return list;
      let merged = { ...list[index], ...patch };
      if ('type' in patch) {
        const preset = PRESETS[(patch.type as keyof typeof PRESETS) ?? 'grid'];
        if (preset) {
          const { rows, cols } = preset;
          const newName = `${patch.type}${index + 1}`;
          merged = { ...merged, rows, cols, name: newName };
        }
      }
      if (!merged.name || merged.name.trim() === '') {
        merged.name = `${merged.type ?? 'block'}${index + 1}`;
      }
      list[index] = normalizeBlock(merged as Block);
      return list.map((block, idx) =>
        block ? { ...block, name: block.name || `${block.type}${idx + 1}` } : block,
      ) as Block[];
    });
  };

  const removeBlock = (index: number) => {
    emit((list) => {
      if (!list[index]) return list;
      const next = list.slice();
      next.splice(index, 1);
      return next.map((block, idx) =>
        block ? { ...block, name: `${block.type}${idx + 1}` } : block,
      ) as Block[];
    });
    if (typeof setSelected === 'function') {
      if (selected === index) setSelected(null);
      else if ((selected ?? -1) > index && (selected ?? -1) >= 0) {
        setSelected((selected ?? 0) - 1);
      }
    }
  };

  const duplicateBlock = (index: number) => {
    emit((list) => {
      const target = list[index];
      if (!target) return list;
      const next = list.slice();
      const clone = normalizeBlock({
        ...target,
        name: `${target.name || `${target.type}${index + 1}`} (copy)`,
        quad: Array.isArray(target.quad)
          ? target.quad.map((pt) => (Array.isArray(pt) ? [...pt] : pt))
          : [],
        choices: Array.isArray(target.choices)
          ? target.choices.slice()
          : target.choices,
      });
      next.splice(index + 1, 0, clone);
      return next.map((block, idx) =>
        block ? { ...block, name: block.name || `${block.type}${idx + 1}` } : block,
      ) as Block[];
    });
    if (typeof setSelected === 'function') setSelected(index + 1);
  };

  const addBlock = () => {
    emit((list) => {
      const next = list.slice();
      const nb = normalizeBlock({
        name: `grid${next.length + 1}`,
        type: 'grid',
        quad: [
          [120, 120],
          [520, 120],
          [520, 400],
          [120, 400],
        ],
        rows: 5,
        cols: 5,
      } as Block);
      next.push(nb);
      return next;
    });
    setSelected?.(blocks.length);
  };

  const moveBlock = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0) return;
    emit((list) => {
      const reordered = reorder(list, from, to).map((block, idx) =>
        block ? { ...block, name: `${block.type}${idx + 1}` } : block,
      ) as Block[];
      return reordered;
    });
    if (typeof setSelected === 'function') {
      if (selected === from) setSelected(to);
      else if (
        (selected ?? -1) > from &&
        (selected ?? -1) <= to &&
        (selected ?? -1) >= 0
      ) {
        setSelected((selected ?? 0) - 1);
      } else if (
        (selected ?? -1) < from &&
        (selected ?? -1) >= to &&
        (selected ?? -1) >= 0
      ) {
        setSelected((selected ?? 0) + 1);
      }
    }
  };

  const handleDragStart =
    (index: number) => (event: React.DragEvent<HTMLDivElement>) => {
      event.stopPropagation();
      try {
        event.dataTransfer.setData('text/plain', String(index));
      } catch {
        // ignore
      }
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.dropEffect = 'move';
      }
      setDragIndex(index);
      setDropIndex(index);
    };

  const handleDragOver =
    (index: number) => (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (dragIndex === null) return;
      setDropIndex(index);
    };

  const handleDrop =
    (index: number) => (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (dragIndex === null) return;
      moveBlock(dragIndex, index);
      setDragIndex(null);
      setDropIndex(null);
    };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDropIndex(null);
  };

  const containerClass = ['space-y-3', className].filter(Boolean).join(' ');

  return (
    <div className={containerClass}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-sm">블록 목록</h4>
        <button
          onClick={addBlock}
          className="px-3 py-1 text-sm rounded-lg border bg-blue-600 text-white hover:bg-blue-700"
        >
          블록 추가
        </button>
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
        {blocks.map((block, index) => {
          const isDropTarget = dropIndex === index && dragIndex !== null;
          const isSelected = selected === index;
          return (
            <div
              key={block?.name ?? index}
              className={`border rounded-lg p-4 bg-gray-50 transition ${
                isDropTarget
                  ? 'border-blue-300 bg-blue-50'
                  : isSelected
                  ? 'border-blue-600'
                  : 'border-gray-200'
              }`}
              draggable
              onDragStart={handleDragStart(index)}
              onDragOver={handleDragOver(index)}
              onDrop={handleDrop(index)}
              onDragEnd={handleDragEnd}
              onClick={() => setSelected?.(index)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {block?.name || `${block?.type}${index + 1}`}
                  </span>
                  {['id', 'name', 'phone'].includes(block?.type ?? '') && (
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                      기본 정보
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      duplicateBlock(index);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                    title="복제"
                  >
                    복제
                  </button>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      removeBlock(index);
                    }}
                    className="text-red-600 hover:text-red-800"
                    title="삭제"
                  >
                    삭제
                  </button>
                </div>
              </div>

              <div className="space-y-2">                
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">데이터 형식</label>
                  <div className="flex flex-wrap gap-1">
                    {['grid', 'digits', 'id', 'phone', 'name', 'code'].map((format) => (
                      <button
                        key={format}
                        onClick={() => updateBlock(index, { type: format as Block['type'] })}
                        className={`px-2 py-1 text-xs rounded border ${
                          block?.type === format
                           ? 'bg-blue-600 text-white border-blue-600'
                           : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                         }`}
                      >
                        {format}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-600 mb-1 block">선택지(열)</label>
                  <input
                    type="number"
                    value={block?.cols ?? ''}
                    onChange={(event) =>
                      updateBlock(index, { cols: Number(event.target.value) || undefined })
                    }
                    className="w-full px-2 py-1 text-sm border rounded"
                    placeholder="예: 5"
                    min="1"
                    max="20"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-600 mb-1 block">행</label>
                  <input
                    type="number"
                    value={block?.rows ?? ''}
                    onChange={(event) =>
                      updateBlock(index, { rows: Number(event.target.value) || undefined })
                    }
                    className="w-full px-2 py-1 text-sm border rounded"
                    placeholder="예: 1"
                    min="1"
                    max="50"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
