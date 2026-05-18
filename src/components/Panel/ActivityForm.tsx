import { useState } from 'react';
import type { Activity, ActivityType } from '../../types/activity';
import { ACTIVITY_TYPES, ACTIVITY_TYPE_COLORS, todayStr } from '../../types/activity';

interface ActivityFormProps {
  schoolId: string;
  currentUser: string;
  onSubmit: (activity: Omit<Activity, 'id' | 'recorded_at'>) => Promise<void>;
}

export function ActivityForm({ schoolId, currentUser, onSubmit }: ActivityFormProps) {
  const [type, setType] = useState<ActivityType>('訪問');
  const [activityDate, setActivityDate] = useState(todayStr());
  const [content, setContent] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [nextActionDate, setNextActionDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!content.trim()) {
      alert('内容を入力してください');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        school_id: schoolId,
        recorded_by: currentUser,
        activity_date: activityDate,
        type,
        stage_from: '',
        stage_to: '',
        content: content.trim(),
        next_action: nextAction.trim(),
        next_action_date: nextActionDate,
        next_action_done: false,
      });
      // 成功したらフォームをリセット
      setContent('');
      setNextAction('');
      setNextActionDate('');
      setActivityDate(todayStr());
      setType('訪問');
    } catch {
      alert('保存に失敗しました');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-lg border border-[#334155] bg-[#1e293b] p-3 space-y-3">
      <div className="text-sm font-semibold text-slate-300">活動を追記</div>

      {/* 種別 */}
      <div className="flex flex-wrap gap-1.5">
        {ACTIVITY_TYPES.map((t) => {
          const active = type === t;
          const color = ACTIVITY_TYPE_COLORS[t];
          return (
            <button
              key={t}
              onClick={() => setType(t)}
              className="px-3 py-1 rounded text-xs font-medium transition-all"
              style={{
                backgroundColor: active ? `${color}33` : '#0f172a',
                border: `1px solid ${active ? color : '#334155'}`,
                color: active ? color : '#64748b',
              }}
            >
              {t}
            </button>
          );
        })}
      </div>

      {/* 実施日 */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-slate-500 w-16">実施日</label>
        <input
          type="date"
          value={activityDate}
          onChange={(e) => setActivityDate(e.target.value)}
          className="px-2 py-1 bg-[#0f172a] border border-[#334155] rounded text-xs text-slate-200 focus:outline-none focus:border-red-500"
          style={{ colorScheme: 'dark' }}
        />
      </div>

      {/* 内容 */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="今日の活動内容（誰と話したか、何を提案したか、反応は等）"
        rows={3}
        className="w-full px-3 py-2 bg-[#0f172a] border border-[#334155] rounded text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-red-500 resize-none"
      />

      {/* 次回アクション */}
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <input
          type="text"
          value={nextAction}
          onChange={(e) => setNextAction(e.target.value)}
          placeholder="次回アクション（任意：例 2週間後に再訪）"
          className="px-3 py-2 bg-[#0f172a] border border-[#334155] rounded text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500"
        />
        <input
          type="date"
          value={nextActionDate}
          onChange={(e) => setNextActionDate(e.target.value)}
          className="px-2 py-2 bg-[#0f172a] border border-[#334155] rounded text-sm text-slate-200 focus:outline-none focus:border-amber-500"
          style={{ colorScheme: 'dark' }}
          title="次回期日"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-500">記録者: <span className="text-blue-400 font-medium">{currentUser}</span></div>
        <button
          onClick={handleSubmit}
          disabled={submitting || !content.trim()}
          className="px-4 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded"
        >
          {submitting ? '保存中...' : '記録する'}
        </button>
      </div>
    </div>
  );
}
