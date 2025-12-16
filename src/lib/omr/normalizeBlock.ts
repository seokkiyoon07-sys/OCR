import type { Block } from '@/types/omr';

const GRID_FALLBACK_CHOICES = Array.from({ length: 12 }, (_v, i) =>
  String(i + 1),
);
const DIGIT_CHOICES = Array.from({ length: 10 }, (_v, i) => String(i));
const NAME_CHOICES = ['초', '중', '종'];

export function autoChoicesFor(block: Block): string[] {
  const type = (block.type || 'grid').toLowerCase();
  const rows = Math.max(1, Number(block.rows ?? 1));
  const cols = Math.max(1, Number(block.cols ?? 1));

  if (type === 'grid' || type === 'q') {
    if (block.choices && block.choices.length) return block.choices;
    return GRID_FALLBACK_CHOICES.slice(0, cols);
  }

  if (type === 'digits' || type === 'id' || type === 'phone' || type === 'code') {
    return block.choices && block.choices.length
      ? block.choices
      : DIGIT_CHOICES;
  }

  if (type === 'name') {
    return block.choices && block.choices.length ? block.choices : NAME_CHOICES;
  }

  return block.choices ? [...block.choices] : [];
}

export function normalizeBlock(block: Block): Block {
  const normalized: Block = {
    ...block,
    choices: autoChoicesFor(block),
  };

  if (!Number.isFinite(normalized.questionStart)) {
    normalized.questionStart = 1;
  }

  if (!Number.isFinite(normalized.questionCount)) {
    const rows = Math.max(1, Number(normalized.rows ?? 1));
    normalized.questionCount =
      normalized.type === 'grid' || normalized.type === 'q' ? rows : 1;
  }

  if ((normalized.questionCount ?? 0) < 1) {
    normalized.questionCount = 1;
  }

  if (typeof normalized.questionPrefix !== 'string') {
    normalized.questionPrefix = 'Q';
  }

  if (!normalized.label) {
    normalized.label = normalized.name ?? '';
  }

  return normalized;
}

export function normalizeBlocks(blocks: Block[] = []): Block[] {
  return blocks.map(normalizeBlock);
}
