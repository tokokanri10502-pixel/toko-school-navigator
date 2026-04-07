import { useState, useEffect } from 'react';
import type { School, RelationStage } from '../../types/school';
import { GAS_URL } from '../../utils/gasUrl';
import { STAGE_LABELS, STAGE_COLORS, STAGE_SHORT, parseStages, formatStages } from '../../types/school';

interface SchoolPopupProps {
  school: School;
  onUpdate: (id: string, updates: Partial<School>) => void;
  onClose: () => void;
}

const STAGES: RelationStage[] = [0, 1, 2, 3, 4, 5, 6];

interface NewsResult {
  content?: string;
  fetchedAt?: string;
  cached?: boolean;
  error?: string;
}

export function SchoolPopup({ school, onUpdate, onClose }: SchoolPopupProps) {
  const [contactPerson, setContactPerson] = useState(school.contact_person || '');
  const [news, setNews] = useState<NewsResult | null>(null);
  const [newsLoading, setNewsLoading] = useState(false);

  // 背景クリックで閉じる
  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  // フェーズトグル
  function handleStageToggle(stage: RelationStage) {
    const current = parseStages(school.relation_stage);
    let next: RelationStage[];
    if (current.includes(stage)) {
      next = current.filter((s) => s !== stage);
    } else if (stage === 0) {
      next = [0];
    } else {
      next = [...current, stage].filter((s) => s !== 0);
    }
    onUpdate(school.id, { relation_stage: formatStages(next) });
  }

  // 最新情報を取得
  useEffect(() => {
    if (!school.website) return;
    setNewsLoading(true);
    fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'fetchNews', schoolId: school.id, url: school.website }),
    })
      .then((r) => r.json())
      .then((data) => setNews(data))
      .catch(() => setNews({ error: '取得に失敗しました' }))
      .finally(() => setNewsLoading(false));
  }, [school.id, school.website]);

  const activeStages = parseStages(school.relation_stage);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={handleOverlayClick}
    >
      <div className="rounded-xl shadow-2xl w-full max-w-xl mx-4 max-h-[85vh] flex flex-col" style={{ backgroundColor: 'rgba(255, 253, 240, 0.82)', border: '1px solid #e8e0c0', backdropFilter: 'blur(8px)' }}>
        {/* ヘッダー */}
        <div className="px-6 py-4 flex items-start justify-between gap-3 flex-shrink-0" style={{ borderBottom: '1px solid #e8e0c0' }}>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-gray-900 font-bold text-xl">{school.name}</h2>
              <span className="text-xs px-2 py-0.5 rounded text-gray-500" style={{ backgroundColor: '#f0e8c0', border: '1px solid #d0c890' }}>{school.type}</span>
              <span className="text-xs px-2 py-0.5 rounded" style={{
                backgroundColor: school.category === '国公立' ? '#dbeafe' : '#f3e8ff',
                color: school.category === '国公立' ? '#1d4ed8' : '#7c3aed',
                border: `1px solid ${school.category === '国公立' ? '#93c5fd' : '#c4b5fd'}`,
              }}>{school.category}</span>
            </div>
            <p className="text-gray-400 text-sm mt-1">{school.address}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0 p-1">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
          {/* HP ボタン */}
          {school.website && (
            <a
              href={school.website}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium w-fit"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              公式HPを開く
            </a>
          )}

          {/* フェーズ */}
          <div>
            <div className="text-sm text-gray-500 mb-2 font-medium">営業フェーズ</div>
            <div className="flex gap-1 flex-wrap">
              {STAGES.map((s) => {
                const active = activeStages.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => handleStageToggle(s)}
                    className="px-3 py-1.5 rounded text-xs font-medium transition-all"
                    style={{
                      backgroundColor: active ? `${STAGE_COLORS[s]}22` : '#fdf8e0',
                      border: `1px solid ${active ? STAGE_COLORS[s] : '#ddd5a0'}`,
                      color: active ? STAGE_COLORS[s] : '#94a3b8',
                    }}
                  >
                    P{s}: {STAGE_LABELS[s]}
                  </button>
                );
              })}
            </div>
            {activeStages.length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {activeStages.map((s) => (
                  <span key={s} className="text-xs px-2 py-0.5 rounded font-medium" style={{ color: STAGE_COLORS[s], backgroundColor: `${STAGE_COLORS[s]}18`, border: `1px solid ${STAGE_COLORS[s]}55` }}>
                    {STAGE_SHORT[s]}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 担当者名 */}
          <div>
            <label className="text-sm text-gray-500 font-medium block mb-1.5">担当者名</label>
            <input
              type="text"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              onBlur={() => {
                if (contactPerson !== school.contact_person) {
                  onUpdate(school.id, { contact_person: contactPerson });
                }
              }}
              placeholder="担当者名を入力..."
              className="w-full px-3 py-2 rounded text-sm text-gray-800 placeholder-gray-400 focus:outline-none transition-colors" style={{ backgroundColor: '#fdf8e0', border: '1px solid #d0c890' }}
            />
          </div>

          {/* 最新情報 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-500 font-medium">最新情報（HP自動取得）</div>
              {news?.fetchedAt && (
                <span className="text-xs text-gray-400">
                  {news.cached ? '📦 キャッシュ' : '🔄 最新'} · {news.fetchedAt}
                </span>
              )}
            </div>
            <div className="rounded-lg p-4 min-h-[120px]" style={{ backgroundColor: '#fdf8e0', border: '1px solid #d0c890' }}>
              {!school.website ? (
                <p className="text-gray-400 text-sm">HPが登録されていません</p>
              ) : newsLoading ? (
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-400 rounded-full animate-spin" />
                  取得中...
                </div>
              ) : news?.error ? (
                <p className="text-red-500 text-sm">⚠️ {news.error}</p>
              ) : news?.content ? (
                <pre className="text-gray-700 text-xs leading-relaxed whitespace-pre-wrap font-sans">{news.content}</pre>
              ) : (
                <p className="text-gray-400 text-sm">情報を取得できませんでした</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
