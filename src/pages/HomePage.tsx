import { useMemo } from 'react';
import type { School } from '../types/school';
import { parseStages } from '../types/school';
import type { Activity } from '../types/activity';
import { ACTIVITY_TYPE_COLORS, todayStr, daysBetween } from '../types/activity';

interface HomePageProps {
  schools: School[];
  activities: Activity[];
  currentUser: string | null;
  onSelectSchool: (id: string) => void;
  onMarkDone: (id: string, done: boolean) => void;
}

const RECENT_DAYS = 7;

function schoolName(schools: School[], id: string): string {
  return schools.find((s) => s.id === id)?.name ?? `(削除済 ${id})`;
}

function formatDate(s: string): string {
  if (!s) return '';
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${parseInt(m[2])}/${parseInt(m[3])}`;
  return s;
}

export function HomePage({ schools, activities, currentUser, onSelectSchool, onMarkDone }: HomePageProps) {
  const today = todayStr();

  // 今日やること: 期日が今日以前 & 未完了
  const todos = useMemo(() => {
    return activities
      .filter((a) => a.next_action && !a.next_action_done && a.next_action_date && a.next_action_date <= today)
      .sort((a, b) => (a.next_action_date < b.next_action_date ? -1 : 1));
  }, [activities, today]);

  // 期日付きの未完了アクション（今日以降の予定）
  const upcoming = useMemo(() => {
    return activities
      .filter((a) => a.next_action && !a.next_action_done && a.next_action_date && a.next_action_date > today)
      .sort((a, b) => (a.next_action_date < b.next_action_date ? -1 : 1))
      .slice(0, 10);
  }, [activities, today]);

  // 直近7日の活動
  const recent = useMemo(() => {
    return activities
      .filter((a) => {
        const diff = daysBetween(a.activity_date, today);
        return diff >= 0 && diff <= RECENT_DAYS;
      })
      .sort((a, b) => {
        if (a.activity_date !== b.activity_date) return a.activity_date < b.activity_date ? 1 : -1;
        return a.recorded_at < b.recorded_at ? 1 : -1;
      });
  }, [activities, today]);

  return (
    <div className="h-full overflow-y-auto bg-[#0f172a] px-6 py-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* 挨拶 */}
        <div className="mb-2">
          <h2 className="text-2xl font-bold text-white">
            {currentUser ? `おかえりなさい、${currentUser}さん` : 'ホーム'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            今日: {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </p>
        </div>

        {/* 今日やること */}
        <section className="bg-[#1e293b] border border-amber-500/30 rounded-xl overflow-hidden">
          <div className="px-5 py-3 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <h3 className="text-base font-bold text-amber-300">今日やること</h3>
            <span className="ml-auto text-xs text-amber-200/70">{todos.length}件</span>
          </div>
          {todos.length === 0 ? (
            <div className="px-5 py-6 text-center text-sm text-slate-500">期日を迎えた未完了アクションはありません</div>
          ) : (
            <ul className="divide-y divide-[#334155]">
              {todos.map((a) => {
                const overdue = a.next_action_date < today;
                return (
                  <li key={a.id} className="px-5 py-3 hover:bg-[#0f172a]/50 flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={a.next_action_done}
                      onChange={(e) => onMarkDone(a.id, e.target.checked)}
                      className="w-4 h-4 mt-1 accent-amber-500 flex-shrink-0"
                    />
                    <button
                      onClick={() => onSelectSchool(a.school_id)}
                      className="flex-1 min-w-0 text-left group"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-mono ${overdue ? 'text-red-400' : 'text-amber-400'}`}>
                          {formatDate(a.next_action_date)} {overdue && '(期限超過)'}
                        </span>
                        <span className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                          {schoolName(schools, a.school_id)}
                        </span>
                        {a.recorded_by && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-[#1e3a5f] border border-blue-500/40 text-blue-300">
                            {a.recorded_by}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-300 mt-0.5">{a.next_action}</div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* 直近の予定 */}
        {upcoming.length > 0 && (
          <section className="bg-[#1e293b] border border-blue-500/30 rounded-xl overflow-hidden">
            <div className="px-5 py-3 bg-blue-500/10 border-b border-blue-500/20 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-base font-bold text-blue-300">これからの予定</h3>
              <span className="ml-auto text-xs text-blue-200/70">{upcoming.length}件</span>
            </div>
            <ul className="divide-y divide-[#334155]">
              {upcoming.map((a) => (
                <li key={a.id} className="px-5 py-2.5">
                  <button
                    onClick={() => onSelectSchool(a.school_id)}
                    className="w-full text-left flex items-center gap-3 group"
                  >
                    <span className="text-xs font-mono text-blue-400 w-12">{formatDate(a.next_action_date)}</span>
                    <span className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                      {schoolName(schools, a.school_id)}
                    </span>
                    <span className="text-sm text-slate-400 truncate">{a.next_action}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 最近の活動 */}
        <section className="bg-[#1e293b] border border-[#334155] rounded-xl overflow-hidden">
          <div className="px-5 py-3 bg-[#0f172a] border-b border-[#334155] flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-base font-bold text-slate-200">最近の活動（直近{RECENT_DAYS}日）</h3>
            <span className="ml-auto text-xs text-slate-500">{recent.length}件</span>
          </div>
          {recent.length === 0 ? (
            <div className="px-5 py-6 text-center text-sm text-slate-500">この期間の活動記録はありません</div>
          ) : (
            <ul className="divide-y divide-[#334155]">
              {recent.map((a) => {
                const isPhase = a.type === 'phase_change';
                const color = ACTIVITY_TYPE_COLORS[a.type] ?? '#94a3b8';
                return (
                  <li key={a.id} className="px-5 py-3 hover:bg-[#0f172a]/50">
                    <button
                      onClick={() => onSelectSchool(a.school_id)}
                      className="w-full text-left group"
                    >
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-mono text-slate-400 w-12">{formatDate(a.activity_date)}</span>
                        <span
                          className="text-xs px-1.5 py-0.5 rounded font-medium"
                          style={{ backgroundColor: `${color}22`, border: `1px solid ${color}55`, color }}
                        >
                          {isPhase ? 'フェーズ' : a.type}
                        </span>
                        <span className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                          {schoolName(schools, a.school_id)}
                        </span>
                        {a.recorded_by && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-[#1e3a5f] border border-blue-500/40 text-blue-300">
                            {a.recorded_by}
                          </span>
                        )}
                      </div>
                      {isPhase ? (
                        <div className="text-xs text-slate-400 ml-14">P{a.stage_from} → P{a.stage_to}</div>
                      ) : (
                        <div className="text-sm text-slate-300 ml-14 line-clamp-2">{a.content}</div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* 全体サマリー */}
        <section className="grid grid-cols-3 gap-3">
          <div className="bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-3">
            <div className="text-xs text-slate-500">登録校数</div>
            <div className="text-2xl font-bold text-white">{schools.length}</div>
          </div>
          <div className="bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-3">
            <div className="text-xs text-slate-500">活動進行中（Phase1+）</div>
            <div className="text-2xl font-bold text-blue-400">
              {schools.filter((s) => parseStages(s.relation_stage).some((p) => p >= 1)).length}
            </div>
          </div>
          <div className="bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-3">
            <div className="text-xs text-slate-500">今週の活動件数</div>
            <div className="text-2xl font-bold text-emerald-400">{recent.length}</div>
          </div>
        </section>
      </div>
    </div>
  );
}
