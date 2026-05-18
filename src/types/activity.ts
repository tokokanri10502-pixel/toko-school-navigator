export type ActivityType = '訪問' | '電話' | 'メール' | '提案' | '受注' | 'その他' | 'phase_change';

export interface Activity {
  id: string;
  school_id: string;
  recorded_at: string;       // ISO-like "2026-05-18T14:30:00"
  recorded_by: string;       // メンバー名
  activity_date: string;     // "YYYY-MM-DD"
  type: ActivityType;
  stage_from: string;        // "1" 等。空欄あり
  stage_to: string;
  content: string;
  next_action: string;
  next_action_date: string;  // "YYYY-MM-DD"
  next_action_done: boolean;
}

export const ACTIVITY_TYPES: ActivityType[] = ['訪問', '電話', 'メール', '提案', '受注', 'その他'];

export const ACTIVITY_TYPE_COLORS: Record<ActivityType, string> = {
  '訪問': '#60a5fa',
  '電話': '#34d399',
  'メール': '#a78bfa',
  '提案': '#fbbf24',
  '受注': '#ef4444',
  'その他': '#94a3b8',
  'phase_change': '#e879f9',
};

export function todayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function daysBetween(a: string, b: string): number {
  const ad = new Date(a);
  const bd = new Date(b);
  return Math.round((bd.getTime() - ad.getTime()) / (1000 * 60 * 60 * 24));
}
