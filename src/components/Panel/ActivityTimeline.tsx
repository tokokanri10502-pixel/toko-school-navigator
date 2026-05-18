import type { Activity } from '../../types/activity';
import { ACTIVITY_TYPE_COLORS } from '../../types/activity';
import { STAGE_LABELS, STAGE_COLORS } from '../../types/school';
import type { RelationStage } from '../../types/school';

interface ActivityTimelineProps {
  activities: Activity[]; // 既に school_id でフィルタ済み
  onMarkDone: (id: string, done: boolean) => void;
  onDelete: (id: string) => void;
  variant?: 'dark' | 'light';
}

function formatDate(s: string): string {
  if (!s) return '';
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${parseInt(m[2])}/${parseInt(m[3])}`;
  return s;
}

function fullDate(s: string): string {
  if (!s) return '';
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}/${parseInt(m[2])}/${parseInt(m[3])}`;
  return s;
}

export function ActivityTimeline({ activities, onMarkDone, onDelete, variant = 'dark' }: ActivityTimelineProps) {
  const isLight = variant === 'light';
  const theme = isLight
    ? {
        emptyText: 'text-gray-400',
        emptyBorder: '#d1d5db',
        cardBg: '#ffffff',
        cardBorder: '#d1d5db',
        dateText: 'text-gray-500',
        contentText: 'text-gray-800',
        arrowText: 'text-gray-400',
        deleteHover: 'hover:text-red-500',
        deleteText: 'text-gray-400',
        userBadgeBg: '#dbeafe',
        userBadgeBorder: '#93c5fd',
        userBadgeText: '#1d4ed8',
        nextActionDivider: '#e5e7eb',
        nextActionDoneText: 'text-gray-400',
        nextActionText: 'text-amber-700',
        nextActionDateText: 'text-gray-500',
      }
    : {
        emptyText: 'text-slate-600',
        emptyBorder: '#334155',
        cardBg: '#0f172a',
        cardBorder: '#334155',
        dateText: 'text-slate-400',
        contentText: 'text-slate-200',
        arrowText: 'text-slate-500',
        deleteHover: 'hover:text-red-400',
        deleteText: 'text-slate-600',
        userBadgeBg: '#1e3a5f',
        userBadgeBorder: '#3b82f680',
        userBadgeText: '#93c5fd',
        nextActionDivider: '#1e3a5f',
        nextActionDoneText: 'text-slate-600',
        nextActionText: 'text-amber-300',
        nextActionDateText: 'text-slate-500',
      };

  // フェーズ変更ログは非表示（GASには記録は残る）
  const visible = activities.filter((a) => a.type !== 'phase_change');
  const sorted = [...visible].sort((a, b) => (a.activity_date < b.activity_date ? 1 : -1));

  if (sorted.length === 0) {
    return (
      <div
        className={`text-center ${theme.emptyText} text-sm py-6 border border-dashed rounded-lg`}
        style={{ borderColor: theme.emptyBorder }}
      >
        まだ活動記録はありません。<br/>上のフォームから追記してください。
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sorted.map((a) => {
        const isPhaseChange = a.type === 'phase_change';
        const color = ACTIVITY_TYPE_COLORS[a.type] ?? '#94a3b8';
        return (
          <div
            key={a.id}
            className="rounded-lg p-3 space-y-2"
            style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs ${theme.dateText} font-mono`}>{fullDate(a.activity_date)}</span>
                <span
                  className="text-xs px-2 py-0.5 rounded font-medium"
                  style={{
                    backgroundColor: `${color}22`,
                    border: `1px solid ${color}55`,
                    color,
                  }}
                >
                  {isPhaseChange ? 'フェーズ変更' : a.type}
                </span>
                {a.recorded_by && (
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{ backgroundColor: theme.userBadgeBg, border: `1px solid ${theme.userBadgeBorder}`, color: theme.userBadgeText }}
                  >
                    {a.recorded_by}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  if (confirm('この記録を削除しますか？')) onDelete(a.id);
                }}
                className={`${theme.deleteText} ${theme.deleteHover} p-0.5`}
                title="削除"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {isPhaseChange ? (
              <div className="flex items-center gap-2 text-sm">
                {a.stage_from !== '' && (
                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium"
                    style={{
                      color: STAGE_COLORS[parseInt(a.stage_from) as RelationStage] ?? '#94a3b8',
                      backgroundColor: `${STAGE_COLORS[parseInt(a.stage_from) as RelationStage] ?? '#94a3b8'}22`,
                    }}
                  >
                    P{a.stage_from} {STAGE_LABELS[parseInt(a.stage_from) as RelationStage] ?? ''}
                  </span>
                )}
                <span className={theme.arrowText}>→</span>
                {a.stage_to !== '' && (
                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium"
                    style={{
                      color: STAGE_COLORS[parseInt(a.stage_to) as RelationStage] ?? '#94a3b8',
                      backgroundColor: `${STAGE_COLORS[parseInt(a.stage_to) as RelationStage] ?? '#94a3b8'}22`,
                    }}
                  >
                    P{a.stage_to} {STAGE_LABELS[parseInt(a.stage_to) as RelationStage] ?? ''}
                  </span>
                )}
              </div>
            ) : (
              a.content && (
                <div className={`text-sm ${theme.contentText} whitespace-pre-wrap leading-relaxed`}>{a.content}</div>
              )
            )}

            {a.next_action && (
              <div className="flex items-start gap-2 pt-2 border-t" style={{ borderColor: theme.nextActionDivider }}>
                <input
                  type="checkbox"
                  checked={a.next_action_done}
                  onChange={(e) => onMarkDone(a.id, e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-amber-500 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className={`text-xs ${a.next_action_done ? `${theme.nextActionDoneText} line-through` : theme.nextActionText}`}>
                    次回: {a.next_action}
                    {a.next_action_date && (
                      <span className={`ml-2 ${theme.nextActionDateText}`}>（期日 {formatDate(a.next_action_date)}）</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
