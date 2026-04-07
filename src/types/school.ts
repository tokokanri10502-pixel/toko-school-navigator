export type SchoolType = '大学' | '短期大学' | '専門学校';
export type SchoolCategory = '国公立' | '私立';
export type RelationStage = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface School {
  id: string;
  name: string;
  type: SchoolType;
  category: SchoolCategory;
  address: string;
  lat: number;
  lng: number;
  tel: string;
  faculty: string;
  open_campus_2025: string;
  open_campus_2026: string;
  website: string;
  // 営業管理フィールド
  contact_person: string;
  contact_date: string;
  relation_stage: string; // カンマ区切り複数選択可 例:"2,4"
  support_items: string;
  notes: string;
}

export const STAGE_LABELS: Record<RelationStage, string> = {
  0: '未接触',
  1: '接触済み',
  2: 'WEB広告',
  3: 'ノベルティ',
  4: 'ムービー',
  5: 'パンフレット',
  6: '年間契約',
};

export const STAGE_SHORT: Record<RelationStage, string> = {
  0: '未接',
  1: '接触',
  2: 'WEB',
  3: 'ノベ',
  4: 'ムービ',
  5: 'パン',
  6: '年契',
};

export const STAGE_COLORS: Record<RelationStage, string> = {
  0: '#94a3b8',
  1: '#60a5fa',
  2: '#34d399',
  3: '#fbbf24',
  4: '#f97316',
  5: '#e879f9',
  6: '#ef4444',
};

export const SUPPORT_ITEM_OPTIONS = [
  'WEB広告',
  'ノベルティ',
  'コンセプトムービー',
  'パンフレット',
  '年間アクションプラン',
];

export function parseStages(s: string | number | undefined | null): RelationStage[] {
  if (s === null || s === undefined || s === '') return [];
  const str = String(s);
  return str
    .split(',')
    .map((n) => parseInt(n.trim(), 10))
    .filter((n) => !isNaN(n) && n >= 0 && n <= 6) as RelationStage[];
}

export function formatStages(stages: RelationStage[]): string {
  return [...stages].sort((a, b) => a - b).join(',');
}

export function highestStage(s: string | number | undefined | null): RelationStage {
  const stages = parseStages(s);
  return stages.length > 0 ? (Math.max(...stages) as RelationStage) : 0;
}

export interface FilterState {
  types: SchoolType[];
  categories: SchoolCategory[];
  stages: RelationStage[];
  searchText: string;
}
