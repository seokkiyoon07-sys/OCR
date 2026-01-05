'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import type { Block, Layout, Point } from '@/types/omr';

const sq = (x: number) => x * x;
const dist = (a: Point, b: Point) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const lerp = (p: Point, q: Point, t: number): Point => [
  p[0] * (1 - t) + q[0] * t,
  p[1] * (1 - t) + q[1] * t,
];

interface DragState {
  blockIndex: number;
  handleIndex: number;
  dx: number;
  dy: number;
  poly: boolean;
  start: Point;
  pts: Point[] | null;
}

interface GridResult {
  centers: Point[][];
  r: number;
}

const DEFAULT_DRAG_STATE: DragState = {
  blockIndex: -1,
  handleIndex: -1,
  dx: 0,
  dy: 0,
  poly: false,
  start: [0, 0],
  pts: null,
};

const safeBlocks = (layout: Layout | undefined): Block[] =>
  Array.isArray(layout?.blocks) ? layout.blocks : [];

function drawImageFit(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
  const { width: cw, height: ch } = ctx.canvas;
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const ir = iw / ih;
  const cr = cw / ch;

  let dw: number;
  let dh: number;
  if (ir > cr) {
    dw = cw;
    dh = Math.round(cw / ir);
  } else {
    dh = ch;
    dw = Math.round(ch * ir);
  }
  const dx = Math.round((cw - dw) / 2);
  const dy = Math.round((ch - dh) / 2);
  ctx.drawImage(img, dx, dy, dw, dh);
}

const DIGITS = Array.from({ length: 10 }, (_v, i) => String(i));
const CHO = [
  'ㄱ',
  'ㄲ',
  'ㄴ',
  'ㄷ',
  'ㄸ',
  'ㄹ',
  'ㅁ',
  'ㅂ',
  'ㅃ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅉ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
];
const JUNG = [
  'ㅏ',
  'ㅐ',
  'ㅑ',
  'ㅒ',
  'ㅓ',
  'ㅔ',
  'ㅕ',
  'ㅖ',
  'ㅗ',
  'ㅘ',
  'ㅙ',
  'ㅚ',
  'ㅛ',
  'ㅜ',
  'ㅝ',
  'ㅞ',
  'ㅟ',
  'ㅠ',
  'ㅡ',
  'ㅢ',
  'ㅣ',
];
const JONG = [
  'ㄱ',
  'ㄲ',
  'ㄴ',
  'ㄶ',
  'ㄷ',
  'ㄹ',
  'ㄺ',
  'ㄻ',
  'ㄼ',
  'ㅀ',
  'ㅁ',
  'ㅂ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
];

function drawCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size = 10,
  options: { fill?: string; stroke?: string; strokeWidth?: number; fontWeight?: string } = {},
) {
  ctx.save();
  const { fill = 'rgba(0,0,0,0.8)', stroke = undefined, strokeWidth = 0, fontWeight } = options;
  ctx.font = `${fontWeight ? fontWeight + ' ' : ''}${size}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = fill;
  if (stroke) {
    ctx.lineWidth = strokeWidth || 2;
    ctx.strokeStyle = stroke;
    try {
      ctx.strokeText(String(text), x, y);
    } catch { }
  }
  try {
    ctx.fillText(String(text), x, y);
  } catch { }
  ctx.restore();
}

function labelForCell(block: Block, i: number, j: number) {
  const type = block.type ?? 'grid';
  if (type === 'grid' || type === 'q') {
    return (block.choices && block.choices[j]) || String(j + 1);
  }
  if (type === 'digits' || type === 'id' || type === 'phone' || type === 'code') {
    return DIGITS[i % 10];
  }
  if (type === 'name') {
    const groups = [CHO, JUNG, JONG];
    const group = groups[j % groups.length];
    return group[i] ?? '';
  }
  return '';
}

function draw(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  layout: Layout | undefined,
  activeIdx: number,
  vertexActive: number | null,
) {
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);
  if (img) drawImageFit(ctx, img);

  const ratio =
    typeof layout?.cell_radius_ratio === 'number'
      ? layout.cell_radius_ratio
      : 0.38;
  const blocks = safeBlocks(layout);

  try {
    blocks.forEach((block, blockIdx) => {
      const quad = block?.quad ?? [];
      if (quad.length !== 4) return;

      ctx.lineWidth = 2;
      ctx.strokeStyle = blockIdx === activeIdx ? '#2962ff' : '#0a0';
      ctx.beginPath();
      quad.forEach(([x, y], cornerIndex) => {
        if (cornerIndex === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.stroke();
      quad.forEach(([x, y], cornerIndex) => {
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        const isActiveCorner =
          vertexActive === cornerIndex && blockIdx === activeIdx;
        ctx.fillStyle = isActiveCorner ? '#1d4ed8' : '#fff';
        ctx.fill();
        ctx.strokeStyle = isActiveCorner ? '#1d4ed8' : ctx.strokeStyle;
        ctx.stroke();
      });

      const rows = Math.max(1, Number(block.rows ?? 1));
      const cols = Math.max(1, Number(block.cols ?? 1));
      const { centers, r } = gridOnQuad(
        quad[0],
        quad[1],
        quad[2],
        quad[3],
        rows,
        cols,
        ratio,
      );
      const rad = block?.bubble?.radius_px ?? r;

      const topMidX = (quad[0][0] + quad[1][0]) / 2;
      const topMidY = (quad[0][1] + quad[1][1]) / 2;
      const labelY = Math.min(topMidY - 28, Math.min(quad[0][1], quad[1][1]) - 10);
      const blockLabel = block?.name || `Block ${blockIdx + 1}`;
      drawCenteredText(ctx, blockLabel, topMidX, labelY, rad * 3, {
        fill: 'rgba(20,20,20,0.95)',
        stroke: '#fff',
        strokeWidth: 3,
        fontWeight: 'bold',
      });

      for (let ii = 0; ii < rows; ii += 1) {
        for (let jj = 0; jj < cols; jj += 1) {
          const [cx, cy] = centers[ii][jj];
          const isCorner =
            (ii === 0 && jj === 0) ||
            (ii === 0 && jj === cols - 1) ||
            (ii === rows - 1 && jj === 0) ||
            (ii === rows - 1 && jj === cols - 1);
          ctx.beginPath();
          ctx.arc(cx, cy, rad, 0, Math.PI * 2);
          ctx.lineWidth = isCorner ? 5 : 2;
          ctx.strokeStyle = isCorner
            ? 'rgba(255,0,0,0.9)'
            : 'rgba(17, 0, 255, 0.9)';
          ctx.fillStyle = 'rgba(255,255,255,0.55)';
          ctx.fill();
          ctx.stroke();
          const lb = labelForCell(block, ii, jj);
          if (lb) drawCenteredText(ctx, lb, cx, cy, rad);
        }
      }

      if (block.type === 'name') {
        const centersTop = gridOnQuad(quad[0], quad[1], quad[2], quad[3], 1, 3, ratio)
          .centers[0];
        const headers = ['초성', '중성', '종성'];
        centersTop.forEach((point, idx) =>
          drawCenteredText(ctx, headers[idx], point[0], point[1] - 20, 12),
        );
      }
    });
  } catch (error) {
    console.warn('[LayoutCanvas draw]', error);
  }
}

function pointInPoly(x: number, y: number, quad: Point[]): boolean {
  let pos = false;
  let neg = false;
  for (let i = 0; i < quad.length; i += 1) {
    const a = quad[i];
    const b = quad[(i + 1) % quad.length];
    const cross = (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0]);
    if (cross > 0) pos = true;
    if (cross < 0) neg = true;
  }
  return !(pos && neg);
}

function hitHandle(blocks: Block[], x: number, y: number, radius = 8) {
  for (let bi = blocks.length - 1; bi >= 0; bi -= 1) {
    const quad = blocks[bi]?.quad ?? [];
    for (let hi = 0; hi < quad.length; hi += 1) {
      const [hx, hy] = quad[hi];
      if (sq(hx - x) + sq(hy - y) < sq(radius)) return { bi, hi };
    }
  }
  return null;
}

function hitPoly(blocks: Block[], x: number, y: number) {
  for (let bi = blocks.length - 1; bi >= 0; bi -= 1) {
    const quad = blocks[bi]?.quad ?? [];
    if (quad.length === 4 && pointInPoly(x, y, quad)) return { bi };
  }
  return null;
}

function gridOnQuad(
  tl: Point,
  tr: Point,
  br: Point,
  bl: Point,
  rows: number,
  cols: number,
  ratio = 0.45,
): GridResult {
  const cwTop = dist(tl, tr) / Math.max(1, cols - 1);
  const cwBottom = dist(bl, br) / Math.max(1, cols - 1);
  const cw = 0.5 * (cwTop + cwBottom);
  const chLeft = dist(tl, bl) / Math.max(1, rows - 1);
  const chRight = dist(tr, br) / Math.max(1, rows - 1);
  const ch = 0.5 * (chLeft + chRight);
  const r = Math.max(1, Math.round(ratio * Math.min(cw, ch)));

  const centers: Point[][] = [];
  for (let i = 0; i < rows; i += 1) {
    const v = rows > 1 ? i / (rows - 1) : 0.5;
    const leftV = lerp(tl, bl, v);
    const rightV = lerp(tr, br, v);
    const rowPts: Point[] = [];
    for (let j = 0; j < cols; j += 1) {
      const u = cols > 1 ? j / (cols - 1) : 0.5;
      rowPts.push(lerp(leftV, rightV, u).map((val) => Math.round(val)) as Point);
    }
    centers.push(rowPts);
  }
  return { centers, r };
}

const fillChoices = (layout: Layout | undefined): Layout | undefined => {
  if (!layout) return layout;
  const next: Layout = { ...layout };
  next.blocks = (layout.blocks || []).map((block) => {
    const type = (block.type || 'grid').toLowerCase();
    let choices = block.choices;
    if (!choices || !choices.length) {
      if (type === 'grid' || type === 'q') {
        const cols = Math.max(1, Number(block.cols ?? 1));
        choices = Array.from({ length: cols }, (_v, i) => String(i + 1));
      } else if (
        type === 'digits' ||
        type === 'id' ||
        type === 'phone' ||
        type === 'code'
      ) {
        choices = Array.from({ length: 10 }, (_v, i) => String(i));
      } else {
        choices = [];
      }
    }
    return { ...block, choices };
  });
  return next;
};

const cloneBlock = (block: Block): Block => {
  const cloneQuad: Point[] | undefined = Array.isArray(block.quad)
    ? block.quad.map((point) => ([point[0], point[1]] as Point))
    : block.quad;
  return {
    ...block,
    quad: cloneQuad,
    choices: Array.isArray(block.choices) ? block.choices.slice() : block.choices,
    bubble: block.bubble ? { ...block.bubble } : block.bubble,
  };
};

const cloneLayout = (layout: Layout): Layout => {
  const cloned: Layout = {
    ...layout,
    canvas: layout.canvas ? { ...layout.canvas } : layout.canvas,
  };
  if (Array.isArray(layout.blocks)) {
    cloned.blocks = layout.blocks.map((block) => cloneBlock(block));
  }
  return cloned;
};

const MAX_HISTORY = 10;

interface LayoutCanvasProps {
  imageUrl?: string | null;
  layout: Layout;
  onChange?: React.Dispatch<React.SetStateAction<Layout>>;
  selected?: number | null;
  onSelect?: (index: number | null) => void;
  readOnly?: boolean;
  className?: string;
  canvasClassName?: string;
  controlsClassName?: string;
  hideControls?: boolean;
}

export default function LayoutCanvas({
  imageUrl,
  layout,
  onChange,
  selected = null,
  onSelect,
  readOnly = false,
  className,
  canvasClassName,
  controlsClassName,
  hideControls = false,
}: LayoutCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [active, setActiveState] = useState(-1);
  const [vertexActive, setVertexActive] = useState<number | null>(null);
  const [drag, setDrag] = useState<DragState>(DEFAULT_DRAG_STATE);
  const blocksMemo = useMemo(() => safeBlocks(layout), [layout]);
  const undoStackRef = useRef<Layout[]>([]);
  const redoStackRef = useRef<Layout[]>([]);
  const actionRef = useRef<'undo' | 'redo' | null>(null);
  const internalUpdateRef = useRef(false);

  const focusContainer = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.activeElement !== el) {
      el.focus({ preventScroll: true });
    }
  }, []);

  const emit = (
    nextLayoutOrUpdater:
      | Layout
      | undefined
      | ((base: Layout) => Layout | undefined),
  ) => {
    if (typeof onChange !== 'function') return;
    internalUpdateRef.current = true;
    onChange((prev) => {
      const base = prev || { dpi: 300, blocks: [] };
      const resolved =
        typeof nextLayoutOrUpdater === 'function'
          ? nextLayoutOrUpdater(base)
          : nextLayoutOrUpdater;
      const action = actionRef.current;
      if (!resolved) {
        if (!action) {
          internalUpdateRef.current = false;
        }
        if (action) actionRef.current = null;
        return base;
      }
      if (!action && resolved === base) {
        internalUpdateRef.current = false;
        return base;
      }
      if (!action && resolved !== base) {
        const snapshot = cloneLayout(base);
        const nextUndo = [...undoStackRef.current, snapshot];
        undoStackRef.current =
          nextUndo.length > MAX_HISTORY
            ? nextUndo.slice(nextUndo.length - MAX_HISTORY)
            : nextUndo;
        redoStackRef.current = [];
      }
      const nextLayout = fillChoices(resolved) ?? base;
      actionRef.current = null;
      return nextLayout;
    });
  };

  useEffect(() => {
    if (!imageUrl) {
      setImg(null);
      setNaturalSize({ w: 0, h: 0 });
      return;
    }
    const im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = () => {
      setImg(im);
      const width = im.naturalWidth || im.width;
      const height = im.naturalHeight || im.height;
      setNaturalSize({ w: width, h: height });
      const same =
        layout?.canvas?.width === width && layout?.canvas?.height === height;
      if (!same) {
        emit((prev) => {
          const base = prev || { dpi: 300, blocks: [] };
          return { ...base, canvas: { width, height } };
        });
      }
    };
    im.onerror = () => {
      console.warn('[LayoutCanvas] image load failed', imageUrl);
      setImg(null);
    };
    im.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw(ctx, img, layout, active, vertexActive);
  }, [img, layout, active, vertexActive]);

  useEffect(() => {
    if (typeof selected === 'number' && selected !== active) {
      setActiveState(selected);
    } else if (selected == null && active !== -1) {
      setActiveState(-1);
    }
  }, [selected, active]);

  useEffect(() => {
    if (internalUpdateRef.current) {
      internalUpdateRef.current = false;
      return;
    }
    undoStackRef.current = [];
    redoStackRef.current = [];
  }, [layout]);

  const getCanvasXY = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return [0, 0] as Point;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    return [x, y] as Point;
  };

  const setActive = (idx: number | null) => {
    const next = typeof idx === 'number' && idx >= 0 ? idx : -1;
    setActiveState(next);
    if (typeof onSelect === 'function') {
      onSelect(next >= 0 ? next : null);
    }
  };

  useEffect(() => {
    if (typeof selected === 'number') {
      setActiveState(selected);
    }
  }, [selected]);

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    focusContainer();
    if (!canvasRef.current) return;
    const [x, y] = getCanvasXY(event);
    const blocks = blocksMemo;

    const handleHit = hitHandle(blocks, x, y, 8);
    if (handleHit) {
      event.stopPropagation();
      event.preventDefault();
      setActive(handleHit.bi);
      const block = blocks[handleHit.bi];
      setVertexActive(handleHit.hi);
      setDrag({
        blockIndex: handleHit.bi,
        handleIndex: handleHit.hi,
        dx: block.quad[handleHit.hi][0] - x,
        dy: block.quad[handleHit.hi][1] - y,
        poly: false,
        start: [x, y],
        pts: null,
      });
      return;
    }

    const polyHit = hitPoly(blocks, x, y);
    if (polyHit) {
      event.stopPropagation();
      event.preventDefault();
      setActive(polyHit.bi);
      setVertexActive(null);
      const block = blocks[polyHit.bi];
      setDrag({
        blockIndex: polyHit.bi,
        handleIndex: -1,
        dx: 0,
        dy: 0,
        poly: true,
        start: [x, y],
        pts: block.quad.map((point) => [...point]) as Point[],
      });
      return;
    }

    setActive(-1);
    setVertexActive(null);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    if (drag.blockIndex < 0) return;
    event.stopPropagation();
    event.preventDefault();
    const [x, y] = getCanvasXY(event);
    const blocks = safeBlocks(layout).slice();
    const block = { ...blocks[drag.blockIndex] };
    const quad = (block.quad || []).slice();
    if (quad.length !== 4) return;

    if (drag.poly && drag.pts) {
      const dx = x - drag.start[0];
      const dy = y - drag.start[1];
      for (let k = 0; k < 4; k += 1) {
        quad[k] = [drag.pts[k][0] + dx, drag.pts[k][1] + dy];
      }
    } else if (drag.handleIndex >= 0) {
      quad[drag.handleIndex] = [x + drag.dx, y + drag.dy];
    } else {
      return;
    }

    block.quad = quad as Point[];
    blocks[drag.blockIndex] = block;
    emit({ ...layout, blocks });
  };

  const handleMouseUp = () => setDrag(DEFAULT_DRAG_STATE);

  const shiftBlock = (blockIndex: number, dx: number, dy: number) => {
    const blocks = safeBlocks(layout).slice();
    const block = blocks[blockIndex];
    if (!block || !block.quad) return;
    const quad = block.quad.map(([px, py]) => [px + dx, py + dy]) as Point[];
    blocks[blockIndex] = { ...block, quad };
    emit({ ...layout, blocks });
  };

  const shiftVertex = (blockIndex: number, vertexIndex: number, dx: number, dy: number) => {
    const blocks = safeBlocks(layout).slice();
    const block = blocks[blockIndex];
    if (!block || !block.quad?.[vertexIndex]) return;
    const quad = block.quad.map((point, idx) =>
      idx === vertexIndex ? ([point[0] + dx, point[1] + dy] as Point) : point,
    ) as Point[];
    blocks[blockIndex] = { ...block, quad };
    emit({ ...layout, blocks });
  };

  const deleteActive = () => {
    if (active < 0) return;
    emit((prev) => {
      const base = prev || { dpi: 300, blocks: [] };
      const list = Array.isArray(base.blocks) ? base.blocks.slice() : [];
      if (active >= list.length) return base;
      list.splice(active, 1);
      return { ...base, blocks: list };
    });
    setVertexActive(null);
    setActive(null);
  };

  const handleUndo = () => {
    const undoStack = undoStackRef.current;
    if (!undoStack.length) return;
    const previous = undoStack.pop();
    if (!previous) return;
    const currentSnapshot = cloneLayout(layout);
    const nextRedo = [...redoStackRef.current, currentSnapshot];
    redoStackRef.current =
      nextRedo.length > MAX_HISTORY
        ? nextRedo.slice(nextRedo.length - MAX_HISTORY)
        : nextRedo;
    actionRef.current = 'undo';
    emit(cloneLayout(previous));
    const blocksAfterUndo = Array.isArray(previous.blocks) ? previous.blocks : [];
    const nextActive =
      active >= 0 && blocksAfterUndo.length
        ? Math.min(active, blocksAfterUndo.length - 1)
        : -1;
    setVertexActive(null);
    setActive(nextActive >= 0 ? nextActive : null);
  };

  const handleRedo = () => {
    const redoStack = redoStackRef.current;
    if (!redoStack.length) return;
    const nextSnapshot = redoStack.pop();
    if (!nextSnapshot) return;
    const currentSnapshot = cloneLayout(layout);
    const nextUndo = [...undoStackRef.current, currentSnapshot];
    undoStackRef.current =
      nextUndo.length > MAX_HISTORY
        ? nextUndo.slice(nextUndo.length - MAX_HISTORY)
        : nextUndo;
    actionRef.current = 'redo';
    emit(cloneLayout(nextSnapshot));
    const blocksAfterRedo = Array.isArray(nextSnapshot.blocks) ? nextSnapshot.blocks : [];
    const nextActive =
      active >= 0 && blocksAfterRedo.length
        ? Math.min(active, blocksAfterRedo.length - 1)
        : -1;
    setVertexActive(null);
    setActive(nextActive >= 0 ? nextActive : null);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (readOnly) return;

    const lowerKey = event.key.toLowerCase();
    const isModifier = event.ctrlKey || event.metaKey;

    if (isModifier && event.shiftKey && lowerKey === 'z') {
      event.preventDefault();
      handleRedo();
      return;
    }

    if (isModifier && !event.shiftKey && lowerKey === 'z') {
      event.preventDefault();
      handleUndo();
      return;
    }

    if (isModifier && !event.shiftKey && lowerKey === 'y') {
      event.preventDefault();
      handleRedo();
      return;
    }

    const step = event.shiftKey ? 1 : 5;
    let dx = 0;
    let dy = 0;
    if (event.key === 'ArrowUp') {
      dy = -step;
    } else if (event.key === 'ArrowDown') {
      dy = step;
    } else if (event.key === 'ArrowLeft') {
      dx = -step;
    } else if (event.key === 'ArrowRight') {
      dx = step;
    } else if (event.key === 'Delete') {
      if (active >= 0) {
        event.preventDefault();
        deleteActive();
      }
      return;
    } else {
      return;
    }

    if (active < 0) return;

    event.preventDefault();
    if (vertexActive != null) {
      shiftVertex(active, vertexActive, dx, dy);
    } else {
      shiftBlock(active, dx, dy);
    }
  };

  return (
    <div
      ref={containerRef}
      className={className}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{ outline: 'none' }}
    >
      <TransformWrapper
        wheel={{ step: 0.1 }}
        minScale={0.5}
        maxScale={5}
        doubleClick={{ disabled: true }}
        panning={{ velocityDisabled: true }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {!hideControls && (
              <div className={controlsClassName ?? 'mb-3 flex gap-2'}>
                <button
                  type="button"
                  className="rounded border px-2 py-1 text-xs"
                  onClick={() => zoomIn()}
                >
                  확대
                </button>
                <button
                  type="button"
                  className="rounded border px-2 py-1 text-xs"
                  onClick={() => zoomOut()}
                >
                  축소
                </button>
                <button
                  type="button"
                  className="rounded border px-2 py-1 text-xs"
                  onClick={() => resetTransform()}
                >
                  리셋
                </button>
              </div>
            )}

            <TransformComponent
              wrapperClass="w-full h-full"
              contentClass="w-full h-full"
              wrapperStyle={{ width: '100%', height: '100%' }}
              contentStyle={{ width: '100%' }}
            >
              <canvas
                ref={canvasRef}
                width={naturalSize.w || 1}
                height={naturalSize.h || 1}
                className={canvasClassName ?? 'w-full h-auto border border-neutral-300 bg-white'}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
