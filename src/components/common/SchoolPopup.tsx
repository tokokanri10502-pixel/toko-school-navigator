import { useState, useEffect } from 'react';
import type { School, RelationStage } from '../../types/school';
import { STAGE_LABELS, STAGE_COLORS, STAGE_SHORT, parseStages, formatStages } from '../../types/school';
import type { Activity } from '../../types/activity';
import { ActivityForm } from '../Panel/ActivityForm';
import { ActivityTimeline } from '../Panel/ActivityTimeline';

interface SchoolPopupProps {
  school: School;
  onUpdate: (id: string, updates: Partial<School>) => void;
  onClose: () => void;
  activities: Activity[];
  currentUser: string;
  onAddActivity: (a: Omit<Activity, 'id' | 'recorded_at'>) => Promise<void>;
  onMarkDone: (id: string, done: boolean) => void;
  onDeleteActivity: (id: string) => void;
}

const STAGES: RelationStage[] = [0, 1, 2, 3, 4, 5, 6];

export function SchoolPopup({ school, onUpdate, onClose, activities, currentUser, onAddActivity, onMarkDone, onDeleteActivity }: SchoolPopupProps) {
  const [tokoPerson, setTokoPerson] = useState(school.toko_person || '');

  useEffect(() => {
    setTokoPerson(school.toko_person || '');
  }, [school.id]);

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

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

  async function handleAddActivity(activity: Omit<Activity, 'id' | 'recorded_at'>) {
    await onAddActivity(activity);
    onUpdate(school.id, {
      contact_date: activity.activity_date,
      notes: activity.content,
      notes_date: activity.activity_date,
    });
  }

  const activeStages = parseStages(school.relation_stage);
  const faculties = school.faculty
    ? school.faculty.split('/').map((s) => s.trim()).filter(Boolean)
    : [];

  const schoolActivities = activities.filter((a) => a.school_id === school.id);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={handleOverlayClick}
    >
      <div className="rounded-xl shadow-2xl w-full max-w-xl mx-4 max-h-[85vh] flex flex-col" style={{ backgroundColor: 'rgba(255, 253, 240, 0.94)', border: '1px solid #e8e0c0', backdropFilter: 'blur(8px)' }}>
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
            {faculties.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {faculties.map((f, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded text-gray-600" style={{ backgroundColor: '#f0e8c0', border: '1px solid #d0c890' }}>
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0 p-1">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
          {/* HPボタン */}
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

          {/* 活動記録 */}
          <div>
            <div className="text-sm text-gray-500 mb-2 font-medium">活動記録</div>
            <div className="space-y-3">
              <ActivityForm
                schoolId={school.id}
                currentUser={currentUser}
                onSubmit={handleAddActivity}
              />
              <ActivityTimeline
                activities={schoolActivities}
                onMarkDone={onMarkDone}
                onDelete={onDeleteActivity}
              />
            </div>
          </div>

          {/* TOKO担当者 */}
          <div>
            <label className="text-sm text-gray-500 font-medium block mb-1.5">TOKO担当者</label>
            <input
              type="text"
              value={tokoPerson}
              onChange={(e) => setTokoPerson(e.target.value)}
              onBlur={() => {
                if (tokoPerson !== school.toko_person) {
                  onUpdate(school.id, { toko_person: tokoPerson });
                }
              }}
              placeholder="TOKO担当者名を入力..."
              className="w-full px-3 py-2 rounded text-sm text-gray-800 placeholder-gray-400 focus:outline-none transition-colors" style={{ backgroundColor: '#fdf8e0', border: '1px solid #d0c890' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
