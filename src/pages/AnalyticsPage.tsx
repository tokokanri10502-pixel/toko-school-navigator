import { useState, useMemo } from 'react';
import type { School, RelationStage } from '../types/school';
import { STAGE_COLORS, STAGE_LABELS, parseStages } from '../types/school';

interface Props {
  schools: School[];
  onSelectSchool: (id: string) => void;
}

const STAGES = [0, 1, 2, 3, 4, 5, 6] as const;
const TYPES = ['大学', '短期大学', '専門学校'] as const;
const CATEGORIES = ['国公立', '私立'] as const;
const TYPE_COLORS: Record<string, string> = { '大学': '#3b82f6', '短期大学': '#a855f7', '専門学校': '#f97316' };
const CATEGORY_COLORS: Record<string, string> = { '国公立': '#22c55e', '私立': '#f43f5e' };

interface PhaseEntry {
  stage: RelationStage;
  schools: School[];
  byType: Record<string, School[]>;
  byCategory: Record<string, School[]>;
}

// ── ドーナツグラフ ─────────────────────────────────────────
function DonutChart({ data, total }: { data: Array<{ stage: RelationStage; count: number; color: string }>; total: number }) {
  const r = 68;
  const strokeW = 28;
  const size = 190;
  const cx = size / 2;
  const cy = size / 2;
  const C = 2 * Math.PI * r;
  const grandTotal = data.reduce((s, d) => s + d.count, 0);

  let cumLen = 0;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {/* 背景リング */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e3a5f" strokeWidth={strokeW} />
        {grandTotal === 0 ? (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#334155" strokeWidth={strokeW} />
        ) : (
          data.filter(d => d.count > 0).map((seg) => {
            const len = (seg.count / grandTotal) * C;
            const dashoffset = C / 4 - cumLen;
            cumLen += len;
            return (
              <circle
                key={seg.stage}
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeW}
                strokeDasharray={`${len} ${C}`}
                strokeDashoffset={dashoffset}
              />
            );
          })
        )}
      </svg>
      {/* 中央テキスト */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-white text-3xl font-bold leading-none">{total}</span>
        <span className="text-slate-400 text-sm mt-1">校</span>
      </div>
    </div>
  );
}

// ── 棒グラフ ───────────────────────────────────────────────
function BarChart({ phaseData, maxCount, groupMode }: {
  phaseData: PhaseEntry[];
  maxCount: number;
  groupMode: 'type' | 'category';
}) {
  const chartH = 140;
  const groups = groupMode === 'type' ? TYPES : CATEGORIES;
  const colors = groupMode === 'type' ? TYPE_COLORS : CATEGORY_COLORS;
  const barW = groupMode === 'type' ? 14 : 20;
  const barGap = 3;
  const groupGap = 14;
  const groupW = groups.length * barW + (groups.length - 1) * barGap + groupGap;
  const svgW = groupW * 7 + 20;

  return (
    <svg width="100%" height={chartH + 28} viewBox={`0 0 ${svgW} ${chartH + 28}`} preserveAspectRatio="xMidYMid meet">
      {/* グリッド */}
      {[0.25, 0.5, 0.75, 1].map((frac) => (
        <line key={frac} x1={0} y1={chartH * (1 - frac)} x2={svgW} y2={chartH * (1 - frac)} stroke="#1e3a5f" strokeWidth={1} />
      ))}
      {phaseData.map(({ stage, byType, byCategory }, pi) => {
        const data = groupMode === 'type' ? byType : byCategory;
        const x0 = pi * groupW + 10;
        return (
          <g key={stage}>
            {groups.map((g, gi) => {
              const count = data[g]?.length ?? 0;
              const h = maxCount > 0 ? (count / maxCount) * chartH : 0;
              const x = x0 + gi * (barW + barGap);
              const y = chartH - h;
              return (
                <g key={g}>
                  <rect x={x} y={y} width={barW} height={Math.max(h, 0)} fill={colors[g]} fillOpacity={0.85} rx={2} />
                  {count > 0 && h > 14 && (
                    <text x={x + barW / 2} y={y + 10} textAnchor="middle" fill="white" fontSize={9} fontWeight="bold">{count}</text>
                  )}
                </g>
              );
            })}
            <text x={x0 + (groupW - groupGap) / 2} y={chartH + 18} textAnchor="middle" fill="#475569" fontSize={10}>P{stage}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── メインページ ───────────────────────────────────────────
export function AnalyticsPage({ schools, onSelectSchool }: Props) {
  const [typeFilters, setTypeFilters] = useState<Set<string>>(new Set());
  const [catFilters, setCatFilters] = useState<Set<string>>(new Set());
  const [groupMode, setGroupMode] = useState<'type' | 'category'>('type');
  const [expandedStage, setExpandedStage] = useState<number | null>(null);

  const filtered = useMemo(() => schools.filter((s) => {
    if (typeFilters.size > 0 && !typeFilters.has(s.type)) return false;
    if (catFilters.size > 0 && !catFilters.has(s.category)) return false;
    return true;
  }), [schools, typeFilters, catFilters]);

  const phaseData: PhaseEntry[] = useMemo(() => STAGES.map((stage) => {
    const inStage = filtered.filter((s) => parseStages(s.relation_stage).includes(stage));
    const byType: Record<string, School[]> = {};
    const byCategory: Record<string, School[]> = {};
    TYPES.forEach((t) => { byType[t] = inStage.filter((s) => s.type === t); });
    CATEGORIES.forEach((c) => { byCategory[c] = inStage.filter((s) => s.category === c); });
    return { stage, schools: inStage, byType, byCategory };
  }), [filtered]);

  const donutData = useMemo(() =>
    STAGES.map((s) => ({ stage: s, count: phaseData[s].schools.length, color: STAGE_COLORS[s] })),
    [phaseData]
  );

  const maxCount = useMemo(() => Math.max(...phaseData.map((p) => p.schools.length), 1), [phaseData]);

  function toggleType(t: string) {
    setTypeFilters((prev) => { const next = new Set(prev); next.has(t) ? next.delete(t) : next.add(t); return next; });
  }
  function toggleCat(c: string) {
    setCatFilters((prev) => { const next = new Set(prev); next.has(c) ? next.delete(c) : next.add(c); return next; });
  }

  return (
    <div className="flex flex-col h-full overflow-auto bg-[#0f172a]">
      <div className="p-6 space-y-6 min-w-0">

        {/* ── フィルター ── */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => toggleType(t)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border"
                style={typeFilters.has(t)
                  ? { backgroundColor: TYPE_COLORS[t], borderColor: TYPE_COLORS[t], color: 'white' }
                  : { backgroundColor: '#1e293b', borderColor: '#334155', color: '#94a3b8' }}
              >{t}</button>
            ))}
          </div>
          <div className="w-px h-5 bg-[#334155]" />
          <div className="flex items-center gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => toggleCat(c)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border"
                style={catFilters.has(c)
                  ? { backgroundColor: CATEGORY_COLORS[c], borderColor: CATEGORY_COLORS[c], color: 'white' }
                  : { backgroundColor: '#1e293b', borderColor: '#334155', color: '#94a3b8' }}
              >{c}</button>
            ))}
          </div>
          <div className="ml-auto text-slate-500 text-sm">
            <span className="text-white font-semibold text-lg">{filtered.length}</span> 校表示中
          </div>
        </div>

        {/* ── チャート 2枚 ── */}
        <div className="grid grid-cols-2 gap-5">

          {/* ドーナツ */}
          <div className="bg-[#1e293b] rounded-xl p-5 border border-[#334155]">
            <div className="text-slate-400 text-sm font-semibold mb-4">フェーズ分布</div>
            <div className="flex items-center gap-6">
              <DonutChart data={donutData} total={filtered.length} />
              <div className="flex flex-col gap-2.5 flex-1 min-w-0">
                {STAGES.map((s) => {
                  const count = phaseData[s].schools.length;
                  const pct = filtered.length > 0 ? Math.round((count / filtered.length) * 100) : 0;
                  return (
                    <div key={s} className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: STAGE_COLORS[s] }} />
                      <span className="text-xs text-slate-400 truncate flex-1">P{s}: {STAGE_LABELS[s]}</span>
                      <span className="text-xs text-slate-500 w-8 text-right">{pct}%</span>
                      <span className="text-sm font-bold w-6 text-right" style={{ color: STAGE_COLORS[s] }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 棒グラフ */}
          <div className="bg-[#1e293b] rounded-xl p-5 border border-[#334155]">
            <div className="flex items-center justify-between mb-4">
              <div className="text-slate-400 text-sm font-semibold">フェーズ × 内訳</div>
              <div className="flex items-center gap-1 bg-[#0f172a] rounded-lg p-1">
                {(['type', 'category'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setGroupMode(mode)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      groupMode === mode ? 'bg-[#334155] text-white' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >{mode === 'type' ? '種別' : '区分'}</button>
                ))}
              </div>
            </div>
            <BarChart phaseData={phaseData} maxCount={maxCount} groupMode={groupMode} />
            <div className="flex flex-wrap gap-3 mt-2">
              {(groupMode === 'type' ? TYPES : CATEGORIES).map((g) => (
                <div key={g} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: (groupMode === 'type' ? TYPE_COLORS : CATEGORY_COLORS)[g] }} />
                  <span className="text-xs text-slate-400">{g}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── フェーズ別学校一覧 ── */}
        <div className="space-y-3">
          <div className="text-slate-400 text-sm font-semibold">フェーズ別 学校一覧
            <span className="ml-2 text-slate-600 font-normal text-xs">（カードをクリックで展開、学校名をクリックで一覧へ）</span>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {phaseData.map(({ stage, schools: phSchools }) => {
              const isOpen = expandedStage === stage;
              return (
                <div
                  key={stage}
                  className="bg-[#1e293b] rounded-xl border overflow-hidden transition-all"
                  style={{ borderColor: isOpen ? STAGE_COLORS[stage] : '#334155' }}
                >
                  {/* ヘッダー */}
                  <button
                    className="w-full p-3 text-left hover:bg-[#263548] transition-colors"
                    style={{ borderBottom: `2px solid ${STAGE_COLORS[stage]}` }}
                    onClick={() => setExpandedStage(isOpen ? null : stage)}
                  >
                    <div className="text-xs font-bold" style={{ color: STAGE_COLORS[stage] }}>P{stage}</div>
                    <div className="text-slate-400 text-xs mt-0.5 leading-tight">{STAGE_LABELS[stage]}</div>
                    <div className="text-2xl font-bold text-white mt-2 leading-none">{phSchools.length}</div>
                    <div className="text-xs text-slate-500 mt-0.5">校</div>
                  </button>

                  {/* 展開リスト */}
                  {isOpen && (
                    <div className="p-2 max-h-52 overflow-y-auto space-y-0.5">
                      {phSchools.length === 0 ? (
                        <p className="text-xs text-slate-600 text-center py-3">なし</p>
                      ) : (
                        phSchools.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => onSelectSchool(s.id)}
                            className="w-full text-left px-2 py-1.5 rounded text-xs text-slate-300 hover:bg-[#334155] hover:text-white transition-colors truncate"
                            title={s.name}
                          >
                            {s.name}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
