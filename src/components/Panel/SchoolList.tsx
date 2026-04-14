import { useEffect, useRef } from 'react';
import type { School, RelationStage } from '../../types/school';
import { STAGE_COLORS, STAGE_SHORT, parseStages, highestStage } from '../../types/school';

interface SchoolListProps {
  schools: School[];
  allSchools: School[];
  selectedId: string | null;
  onSelect: (school: School) => void;
}

const STAGES: RelationStage[] = [0, 1, 2, 3, 4, 5, 6];

// 管理者のみ変更可
const SCHOOL_INFO_UPDATED = '2026年4月';

export function SchoolList({ schools, allSchools, selectedId, onSelect }: SchoolListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLDivElement>(null);

  const sorted = [...schools].sort((a, b) => {
    const aMax = highestStage(a.relation_stage);
    const bMax = highestStage(b.relation_stage);
    if (bMax !== aMax) return bMax - aMax;
    return a.name.localeCompare(b.name, 'ja');
  });

  useEffect(() => {
    if (selectedId && selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedId]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* 進捗サマリー */}
      <div className="px-4 py-3 border-b border-[#1e3a5f] flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-slate-500">フェーズ別サマリー（全{allSchools.length}校）</div>
          <div className="text-xs text-slate-600">学校情報更新月　{SCHOOL_INFO_UPDATED}</div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {STAGES.map((stage) => {
            const count = allSchools.filter((s) => parseStages(s.relation_stage).includes(stage)).length;
            const color = STAGE_COLORS[stage];
            return (
              <div key={stage} className="text-center">
                <div className="text-xl font-bold leading-none" style={{ color }}>{count}</div>
                <div className="text-slate-500 text-xs mt-1 leading-none">P{stage}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 学校リスト */}
      <div ref={listRef} className="overflow-y-auto flex-1">
        {sorted.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-base">
            条件に一致する学校がありません
          </div>
        )}
        {sorted.map((school) => {
          const isSelected = selectedId === school.id;
          return (
            <div
              key={school.id}
              ref={isSelected ? selectedItemRef : null}
              onClick={() => onSelect(school)}
              className={`px-4 py-3.5 cursor-pointer border-b border-[#1e293b] transition-colors ${
                isSelected ? 'bg-[#1e3a5f]' : 'hover:bg-[#1e293b]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className={`font-semibold text-base truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                    {school.name}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className="text-sm text-slate-400">{school.type}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-sm text-slate-400">{school.category}</span>
                    {school.toko_person && (
                      <>
                        <span className="text-slate-600">·</span>
                        <span className="text-sm text-red-400">TOKO:{school.toko_person}</span>
                      </>
                    )}
                    {school.contact_person && (
                      <>
                        <span className="text-slate-600">·</span>
                        <span className="text-sm text-slate-400">担当:{school.contact_person}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 justify-end">
                  {parseStages(school.relation_stage).length === 0 ? (
                    <span className="text-xs text-slate-600">未設定</span>
                  ) : (
                    parseStages(school.relation_stage).map((s) => (
                      <span key={s} className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ color: STAGE_COLORS[s], backgroundColor: `${STAGE_COLORS[s]}22`, border: `1px solid ${STAGE_COLORS[s]}55` }}>
                        {STAGE_SHORT[s]}
                      </span>
                    ))
                  )}
                </div>
              </div>
              {school.contact_date && (
                <div className="text-sm text-slate-500 mt-1">最終接触: {school.contact_date}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
