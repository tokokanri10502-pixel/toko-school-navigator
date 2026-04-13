import { useState, useRef, useEffect } from 'react';
import type { School, RelationStage } from '../types/school';
import { STAGE_COLORS, STAGE_LABELS, STAGE_SHORT, parseStages, formatStages } from '../types/school';
import { useFilter } from '../hooks/useFilter';
import { FilterBar } from '../components/Panel/FilterBar';
import { SchoolPopup } from '../components/common/SchoolPopup';

interface SchoolListPageProps {
  schools: School[];
  onUpdate: (id: string, updates: Partial<School>) => void;
  selectedId?: string | null;
  onSelectId?: (id: string | null) => void;
  mapSelectedId?: string | null; // 地図ピンからの選択（2番目移動用）
}

type SortKey = 'type' | 'category' | 'phase' | 'contact_date' | 'notes_date';
type SortDir = 'asc' | 'desc';

const STAGES: RelationStage[] = [0, 1, 2, 3, 4, 5, 6];
const TYPE_ORDER: Record<string, number> = { '大学': 0, '短期大学': 1, '専門学校': 2 };
const CATEGORY_ORDER: Record<string, number> = { '国公立': 0, '私立': 1 };

export function SchoolListPage({ schools, onUpdate, selectedId, onSelectId, mapSelectedId }: SchoolListPageProps) {
  const { filter, filtered, toggleType, toggleCategory, toggleStage, setSearch, resetFilter } = useFilter(schools);
  const [sortKey, setSortKey] = useState<SortKey>('type');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [editingCell, setEditingCell] = useState<{ id: string; field: 'notes' | 'contact_person' | 'contact_date' | 'toko_person' | 'notes_date'; value: string } | null>(null);
  const [phaseDropdown, setPhaseDropdown] = useState<string | null>(null);
  const [popupSchool, setPopupSchool] = useState<School | null>(null);
  const phaseDropdownRef = useRef<HTMLDivElement>(null);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mapSelectedRowRef = useRef<HTMLTableRowElement | null>(null);

  // 地図/分析から選択された時、フィルター外なら全解除してから2番目へスクロール
  useEffect(() => {
    if (!mapSelectedId) return;
    const inFiltered = filtered.some((s) => s.id === mapSelectedId);
    if (!inFiltered) {
      resetFilter();
    }
  }, [mapSelectedId]);

  useEffect(() => {
    if (mapSelectedId && mapSelectedRowRef.current) {
      mapSelectedRowRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [mapSelectedId]);

  useEffect(() => {
    if (!phaseDropdown) return;
    function handleClick(e: MouseEvent) {
      if (phaseDropdownRef.current && !phaseDropdownRef.current.contains(e.target as Node)) {
        setPhaseDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [phaseDropdown]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'phase' || key === 'contact_date' || key === 'notes_date' ? 'desc' : 'asc');
    }
  }

  const sorted = (() => {
    const base = [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'type') {
        cmp = (TYPE_ORDER[a.type] ?? 9) - (TYPE_ORDER[b.type] ?? 9);
        if (cmp === 0) cmp = (CATEGORY_ORDER[a.category] ?? 9) - (CATEGORY_ORDER[b.category] ?? 9);
      }
      else if (sortKey === 'category') cmp = (CATEGORY_ORDER[a.category] ?? 9) - (CATEGORY_ORDER[b.category] ?? 9);
      else if (sortKey === 'phase') cmp = parseStages(a.relation_stage).length - parseStages(b.relation_stage).length;
      else if (sortKey === 'contact_date') {
        const da = a.contact_date || '';
        const db = b.contact_date || '';
        if (!da && !db) cmp = 0;
        else if (!da) cmp = 1;
        else if (!db) cmp = -1;
        else cmp = da.localeCompare(db);
      }
      else if (sortKey === 'notes_date') {
        const da = a.notes_date || '';
        const db = b.notes_date || '';
        if (!da && !db) cmp = 0;
        else if (!da) cmp = 1;
        else if (!db) cmp = -1;
        else cmp = da.localeCompare(db);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    if (!mapSelectedId) return base;
    const idx = base.findIndex((s) => s.id === mapSelectedId);
    if (idx <= 1) return base;
    const result = [...base];
    const [selected] = result.splice(idx, 1);
    result.splice(1, 0, selected);
    return result;
  })();

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span className="text-slate-600 ml-1">↕</span>;
    return <span className="text-blue-400 ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  }

  function handleCellBlur(school: School) {
    if (editingCell && editingCell.id === school.id) {
      if (editingCell.value !== school[editingCell.field]) {
        onUpdate(school.id, { [editingCell.field]: editingCell.value });
      }
      setEditingCell(null);
    }
  }

  function cellValue(school: School, field: 'notes' | 'contact_person' | 'contact_date' | 'toko_person' | 'notes_date') {
    if (editingCell?.id === school.id && editingCell.field === field) return editingCell.value;
    return school[field] || '';
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#0f172a]">
      {popupSchool && (
        <SchoolPopup
          school={popupSchool}
          onUpdate={(id, updates) => {
            onUpdate(id, updates);
            setPopupSchool((prev) => prev ? { ...prev, ...updates } : null);
          }}
          onClose={() => setPopupSchool(null)}
        />
      )}
      {/* フィルター */}
      <div className="flex-shrink-0 border-b border-[#1e3a5f]">
        <FilterBar
          filter={filter}
          onToggleType={toggleType}
          onToggleCategory={toggleCategory}
          onToggleStage={toggleStage}
          onSetSearch={setSearch}
          onReset={resetFilter}
        />
      </div>

      {/* サマリー */}
      <div className="flex-shrink-0 px-6 py-3 border-b border-[#1e3a5f] flex items-center gap-6">
        <span className="text-slate-400 text-sm">全{schools.length}校 / 表示{filtered.length}校</span>
        <div className="flex items-center gap-4">
          {STAGES.map((stage) => {
            const count = schools.filter((s) => parseStages(s.relation_stage).includes(stage)).length;
            const color = STAGE_COLORS[stage];
            return (
              <div key={stage} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs text-slate-500">P{stage}</span>
                <span className="text-sm font-semibold" style={{ color }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* テーブル */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm border-collapse table-fixed">
          <thead className="sticky top-0 z-10 bg-[#0f172a]">
            <tr className="border-b border-[#1e3a5f]">
              <th style={{width:'36px'}} className="text-left px-3 py-3 text-slate-500 font-medium">#</th>
              <th
                style={{width:'180px'}}
                className="text-left px-3 py-3 text-slate-400 font-medium"
              >
                学校名
              </th>
              <th
                style={{width:'88px'}}
                className="text-left px-3 py-3 text-slate-400 font-medium cursor-pointer hover:text-white select-none"
                onClick={() => handleSort('type')}
              >
                種別 <SortIcon col="type" />
              </th>
              <th
                style={{width:'72px'}}
                className="text-left px-3 py-3 text-slate-400 font-medium cursor-pointer hover:text-white select-none"
                onClick={() => handleSort('category')}
              >
                区分 <SortIcon col="category" />
              </th>
              <th style={{width:'150px'}} className="text-left px-3 py-3 text-slate-400 font-medium">住所</th>
              <th style={{width:'220px'}} className="text-left px-3 py-3 text-slate-400 font-medium">学部・学科</th>
              <th
                style={{width:'160px'}}
                className="text-left px-3 py-3 text-slate-400 font-medium cursor-pointer hover:text-white select-none"
                onClick={() => handleSort('phase')}
              >
                フェーズ <SortIcon col="phase" />
              </th>
              <th style={{width:'110px'}} className="text-left px-3 py-3 text-slate-400 font-medium">TOKO担当者</th>
              <th style={{width:'110px'}} className="text-left px-3 py-3 text-slate-400 font-medium">担当者</th>
              <th
                style={{width:'96px'}}
                className="text-left px-3 py-3 text-slate-400 font-medium cursor-pointer hover:text-white select-none"
                onClick={() => handleSort('contact_date')}
              >
                最終接触日 <SortIcon col="contact_date" />
              </th>
              <th
                style={{width:'100px'}}
                className="text-left px-3 py-3 text-slate-400 font-medium cursor-pointer hover:text-white select-none"
                onClick={() => handleSort('notes_date')}
              >
                メモ日付 <SortIcon col="notes_date" />
              </th>
              <th className="text-left px-3 py-3 text-slate-400 font-medium">メモ</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={12} className="text-center py-16 text-slate-500">
                  条件に一致する学校がありません
                </td>
              </tr>
            )}
            {sorted.map((school, i) => {
              const isSelected = school.id === selectedId;
              return (<tr
                key={school.id}
                ref={school.id === mapSelectedId ? mapSelectedRowRef : null}
                className="border-b transition-colors cursor-pointer"
                style={{ borderColor: '#1e293b', backgroundColor: isSelected ? '#1e3a5f' : undefined }}
                onClick={() => {
                  if (clickTimerRef.current) return;
                  clickTimerRef.current = setTimeout(() => {
                    clickTimerRef.current = null;
                    onSelectId?.(school.id === selectedId ? null : school.id);
                  }, 250);
                }}
                onDoubleClick={() => {
                  if (clickTimerRef.current) { clearTimeout(clickTimerRef.current); clickTimerRef.current = null; }
                  setPopupSchool(school);
                }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#1e293b'; }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = ''; }}
              >
                <td className="px-3 py-2.5 text-slate-600">{i + 1}</td>
                <td className="px-3 py-2.5 text-slate-200 font-medium truncate">{school.name}</td>
                <td className="px-3 py-2.5 text-slate-400">{school.type}</td>
                <td className="px-3 py-2.5 text-slate-400">{school.category}</td>
                <td className="px-3 py-2.5 text-slate-500 text-xs leading-relaxed">{school.address}</td>
                <td className="px-3 py-2.5 text-slate-500 text-xs leading-relaxed">{school.faculty || '—'}</td>
                <td className="px-3 py-2.5">
                  <div className="relative" ref={phaseDropdown === school.id ? phaseDropdownRef : null}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setPhaseDropdown(phaseDropdown === school.id ? null : school.id); }}
                      className="flex flex-wrap gap-1 hover:opacity-80 transition-opacity text-left"
                    >
                      {parseStages(school.relation_stage).length === 0 ? (
                        <span className="text-xs text-slate-600 px-1">—</span>
                      ) : (
                        parseStages(school.relation_stage).map((s) => (
                          <span key={s} className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ color: STAGE_COLORS[s], backgroundColor: `${STAGE_COLORS[s]}22`, border: `1px solid ${STAGE_COLORS[s]}55` }}>
                            {STAGE_SHORT[s]}
                          </span>
                        ))
                      )}
                    </button>
                    {phaseDropdown === school.id && (
                      <div className="absolute left-0 bottom-full mb-1 z-50 bg-[#1e293b] border border-[#334155] rounded-lg shadow-xl py-1 min-w-[140px]">
                        {STAGES.map((s) => {
                          const active = parseStages(school.relation_stage).includes(s);
                          return (
                            <button
                              key={s}
                              onClick={(e) => { e.stopPropagation();
                                const current = parseStages(school.relation_stage);
                                let next: RelationStage[];
                                if (active) {
                                  next = current.filter((x) => x !== s);
                                } else if (s === 0) {
                                  next = [0]; // P0選択時は他を全クリア
                                } else {
                                  next = [...current, s].filter((x) => x !== 0); // 1〜6選択時はP0を自動削除
                                }
                                onUpdate(school.id, { relation_stage: formatStages(next) });
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#334155] transition-colors text-left"
                            >
                              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: STAGE_COLORS[s] }} />
                              <span className="text-xs" style={{ color: active ? STAGE_COLORS[s] : '#94a3b8' }}>
                                P{s}: {STAGE_LABELS[s]}
                              </span>
                              {active && <span className="ml-auto text-xs" style={{ color: STAGE_COLORS[s] }}>✓</span>}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={cellValue(school, 'toko_person')}
                    placeholder="TOKO担当者..."
                    onFocus={() => setEditingCell({ id: school.id, field: 'toko_person', value: school.toko_person || '' })}
                    onChange={(e) => setEditingCell({ id: school.id, field: 'toko_person', value: e.target.value })}
                    onBlur={() => handleCellBlur(school)}
                    className="w-full bg-transparent border border-transparent hover:border-[#334155] focus:border-[#ef4444] focus:bg-[#1e293b] rounded px-2 py-1 text-red-400 placeholder-slate-600 focus:text-red-300 focus:outline-none transition-colors text-sm"
                  />
                </td>
                <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={cellValue(school, 'contact_person')}
                    placeholder="担当者..."
                    onFocus={() => setEditingCell({ id: school.id, field: 'contact_person', value: school.contact_person || '' })}
                    onChange={(e) => setEditingCell({ id: school.id, field: 'contact_person', value: e.target.value })}
                    onBlur={() => handleCellBlur(school)}
                    className="w-full bg-transparent border border-transparent hover:border-[#334155] focus:border-[#3b82f6] focus:bg-[#1e293b] rounded px-2 py-1 text-slate-400 placeholder-slate-600 focus:text-slate-200 focus:outline-none transition-colors text-sm"
                  />
                </td>
                <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={cellValue(school, 'contact_date')}
                    placeholder="YYYY-MM-DD"
                    onFocus={() => setEditingCell({ id: school.id, field: 'contact_date', value: school.contact_date || '' })}
                    onChange={(e) => setEditingCell({ id: school.id, field: 'contact_date', value: e.target.value })}
                    onBlur={() => handleCellBlur(school)}
                    className="w-full bg-transparent border border-transparent hover:border-[#334155] focus:border-[#3b82f6] focus:bg-[#1e293b] rounded px-2 py-1 text-slate-400 placeholder-slate-600 focus:text-slate-200 focus:outline-none transition-colors text-sm"
                  />
                </td>
                <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={cellValue(school, 'notes_date')}
                    placeholder="YYYY-MM-DD"
                    onFocus={() => setEditingCell({ id: school.id, field: 'notes_date', value: school.notes_date || '' })}
                    onChange={(e) => setEditingCell({ id: school.id, field: 'notes_date', value: e.target.value })}
                    onBlur={() => handleCellBlur(school)}
                    className="w-full bg-transparent border border-transparent hover:border-[#334155] focus:border-[#3b82f6] focus:bg-[#1e293b] rounded px-2 py-1 text-slate-400 placeholder-slate-600 focus:text-slate-200 focus:outline-none transition-colors text-sm"
                  />
                </td>
                <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={cellValue(school, 'notes')}
                    placeholder="メモを入力..."
                    onFocus={() => setEditingCell({ id: school.id, field: 'notes', value: school.notes || '' })}
                    onChange={(e) => setEditingCell({ id: school.id, field: 'notes', value: e.target.value })}
                    onBlur={() => handleCellBlur(school)}
                    className="w-full bg-transparent border border-transparent hover:border-[#334155] focus:border-[#3b82f6] focus:bg-[#1e293b] rounded px-2 py-1 text-slate-400 placeholder-slate-600 focus:text-slate-200 focus:outline-none transition-colors text-sm"
                  />
                </td>
              </tr>);
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
