import { useState, useEffect } from 'react';
import type { School, RelationStage } from '../../types/school';
import { STAGE_LABELS, STAGE_COLORS, SUPPORT_ITEM_OPTIONS, parseStages, formatStages } from '../../types/school';

interface SchoolDetailProps {
  school: School;
  onUpdate: (id: string, updates: Partial<School>) => void;
  onClose: () => void;
}

const STAGES: RelationStage[] = [0, 1, 2, 3, 4, 5, 6];

export function SchoolDetail({ school, onUpdate, onClose }: SchoolDetailProps) {
  const [contactPerson, setContactPerson] = useState(school.contact_person);
  const [contactDate, setContactDate] = useState(school.contact_date);
  const [notes, setNotes] = useState(school.notes);
  const [oc2026, setOc2026] = useState(school.open_campus_2026);

  useEffect(() => {
    setContactPerson(school.contact_person);
    setContactDate(school.contact_date);
    setNotes(school.notes);
    setOc2026(school.open_campus_2026);
  }, [school.id]);

  function handleSave() {
    onUpdate(school.id, { contact_person: contactPerson, contact_date: contactDate, notes, open_campus_2026: oc2026 });
  }

  function handleStageToggle(stage: RelationStage) {
    const current = parseStages(school.relation_stage);
    let next: RelationStage[];
    if (current.includes(stage)) {
      next = current.filter((s) => s !== stage);
    } else if (stage === 0) {
      next = [0]; // P0選択時は他を全クリア
    } else {
      next = [...current, stage].filter((s) => s !== 0); // 1〜6選択時はP0を自動削除
    }
    onUpdate(school.id, { relation_stage: formatStages(next) });
  }

  function handleSupportItemToggle(item: string) {
    const items = school.support_items ? school.support_items.split(',').map((s) => s.trim()).filter(Boolean) : [];
    const next = items.includes(item) ? items.filter((i) => i !== item) : [...items, item];
    onUpdate(school.id, { support_items: next.join(',') });
  }

  const supportItems = school.support_items
    ? school.support_items.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const faculties = school.faculty
    ? school.faculty.split('/').map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ヘッダー */}
      <div className="px-4 py-4 border-b border-[#1e3a5f] flex-shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-white font-bold text-lg">{school.name}</h2>
              <span className="text-sm px-2 py-0.5 rounded" style={{ backgroundColor: '#1e293b', color: '#94a3b8', border: '1px solid #334155' }}>
                {school.type}
              </span>
              <span className="text-sm px-2 py-0.5 rounded" style={{
                backgroundColor: school.category === '国公立' ? '#1e3a5f' : '#2d1f3a',
                color: school.category === '国公立' ? '#60a5fa' : '#c084fc',
                border: `1px solid ${school.category === '国公立' ? '#3b82f6' : '#a855f7'}44`,
              }}>
                {school.category}
              </span>
            </div>
            <div className="text-slate-500 text-sm mt-1">{school.address}</div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 p-1 flex-shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 連絡先 */}
        <div className="flex items-center gap-4 mt-2">
          {school.tel && (
            <a href={`tel:${school.tel}`} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-blue-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {school.tel}
            </a>
          )}
          {school.website && (
            <a href={school.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 truncate max-w-[240px]">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span className="truncate">{school.website.replace(/^https?:\/\//, '')}</span>
            </a>
          )}
        </div>
      </div>

      <div className="overflow-y-auto flex-1 px-4 py-4 space-y-5">
        {/* フェーズ進捗バー */}
        <div>
          <div className="text-sm text-slate-500 mb-2 font-medium">営業フェーズ</div>
          <div className="flex items-center gap-1">
            {STAGES.map((s) => {
              const active = parseStages(school.relation_stage).includes(s);
              return (
                <button
                  key={s}
                  onClick={() => handleStageToggle(s)}
                  title={`P${s}: ${STAGE_LABELS[s]}`}
                  className="flex-1 h-10 rounded text-sm font-medium transition-all relative group"
                  style={{
                    backgroundColor: active ? `${STAGE_COLORS[s]}33` : '#1e293b',
                    border: `1px solid ${active ? STAGE_COLORS[s] : '#334155'}`,
                    color: active ? STAGE_COLORS[s] : '#475569',
                  }}
                >
                  {s}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-[#0f172a] border border-[#334155] rounded text-xs text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10">
                    P{s}: {STAGE_LABELS[s]}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-1 mt-2 justify-center">
            {parseStages(school.relation_stage).length === 0 ? (
              <span className="text-sm text-slate-500">未設定</span>
            ) : (
              parseStages(school.relation_stage).map((s) => (
                <span key={s} className="text-xs px-2 py-0.5 rounded font-medium" style={{ color: STAGE_COLORS[s], backgroundColor: `${STAGE_COLORS[s]}22`, border: `1px solid ${STAGE_COLORS[s]}55` }}>
                  P{s}: {STAGE_LABELS[s]}
                </span>
              ))
            )}
          </div>
        </div>

        {/* 学部・学科 */}
        {faculties.length > 0 && (
          <div>
            <div className="text-sm text-slate-500 mb-2 font-medium">学部・学科</div>
            <div className="flex flex-wrap gap-1.5">
              {faculties.map((f, i) => (
                <span key={i} className="text-sm px-2 py-0.5 rounded bg-[#1e293b] border border-[#334155] text-slate-400">
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* オープンキャンパス */}
        {school.open_campus_2025 && (
          <div>
            <div className="text-sm text-slate-500 mb-2 font-medium">オープンキャンパス 2025</div>
            <div className="bg-[#1e293b] border border-[#fbbf24]33 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-yellow-300 text-sm leading-relaxed">{school.open_campus_2025}</p>
              </div>
            </div>
          </div>
        )}

        {/* オープンキャンパス 2026 */}
        <div>
          <div className="text-sm text-slate-500 mb-2 font-medium">オープンキャンパス 2026</div>
          <textarea
            value={oc2026}
            onChange={(e) => setOc2026(e.target.value)}
            onBlur={handleSave}
            placeholder="例：6月15日/7月20日/8月3日"
            rows={2}
            className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-yellow-500 transition-colors resize-none"
          />
        </div>

        {/* 支援中の項目 */}
        <div>
          <div className="text-sm text-slate-500 mb-2 font-medium">これまでの実績（昨年までの実施項目）</div>
          <div className="space-y-2">
            {SUPPORT_ITEM_OPTIONS.map((item) => (
              <label key={item} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={supportItems.includes(item)}
                  onChange={() => handleSupportItemToggle(item)}
                  className="w-4 h-4 accent-red-500"
                />
                <span className={`text-sm ${supportItems.includes(item) ? 'text-slate-200' : 'text-slate-500'}`}>
                  {item}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* 担当者・接触日 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-slate-500 font-medium block mb-1">担当者名</label>
            <input
              type="text"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              onBlur={handleSave}
              placeholder="未入力"
              className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="text-sm text-slate-500 font-medium block mb-1">最終接触日</label>
            <input
              type="date"
              value={contactDate}
              onChange={(e) => setContactDate(e.target.value)}
              onBlur={handleSave}
              className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
              style={{ colorScheme: 'dark' }}
            />
          </div>
        </div>

        {/* メモ */}
        <div>
          <label className="text-sm text-slate-500 font-medium block mb-1">メモ</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleSave}
            placeholder="商談メモ、次回アクションなど..."
            rows={4}
            className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
          />
        </div>
      </div>
    </div>
  );
}
