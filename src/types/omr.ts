export type Point = [number, number];

export type BlockType =
  | 'grid'
  | 'digits'
  | 'id'
  | 'phone'
  | 'name'
  | 'code'
  | 'text'
  | string;

export interface Block {
  id?: string;
  name?: string;
  label?: string;
  type: BlockType;
  rows?: number;
  cols?: number;
  choices?: string[];
  quad: Point[];
  questionPrefix?: string;
  questionStart?: number;
  questionCount?: number;
  bubble?: {
    radius_px?: number;
  };
  [key: string]: unknown;
}

export interface Layout {
  dpi?: number;
  canvas?: {
    width: number;
    height: number;
  };
  cell_radius_ratio?: number;
  blocks: Block[];
  [key: string]: unknown;
}

export type LayoutStateAction =
  | Layout
  | ((prev: Layout | undefined) => Layout | undefined);
