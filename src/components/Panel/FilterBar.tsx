import type { FilterState, RelationStage, SchoolType, SchoolCategory } from '../../types/school';
import { STAGE_LABELS, STAGE_COLORS } from '../../types/school';

interface FilterBarProps {
  filter: FilterState;
  onToggleType: (type: SchoolType) => void;
  onToggleCategory: (cat: SchoolCategory) => void;
  onToggleStage: (stage: RelationStage) => void;
  onSetSearch: (text: string) => void;
  onReset: () => void;
}

const TYPES: SchoolType[] = ['大学', '短期大学', '専門学校', '高校'];
const CATEGORIES: SchoolCategory[] = ['国公立', '私立'];
const STAGES: RelationStage[] = [0, 1, 2, 3, 4, 5, 6];

export function FilterBar({
  filter,
  onToggleType,
  onToggleCategory,
  onToggleStage,
  onSetSearch,
  onReset,
}: FilterBarProps) {
  const hasFilter =
    filter.types.length > 0 ||
    filter.categories.length > 0 ||
    filter.stages.length > 0 ||
    filter.searchText.length > 0;

  return (
    <div className="px-4 py-3 border-b border-[#1e3a5f] space-y-2.5 flex-shrink-0">
      {/* テキスト検索 */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="学校名で検索..."
          value={filter.searchText}
          onChange={(e) => onSetSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#3b82f6] transition-colors"
        />
      </div>

      {/* 学校種別 */}
      <div className="flex items-center gap-2">
        <span className="text-slate-500 text-sm w-14 flex-shrink-0">種別</span>
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => onToggleType(t)}
            className={`px-2.5 py-1 text-sm rounded border transition-colors ${
              filter.types.includes(t)
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-[#1e293b] border-[#334155] text-slate-400 hover:border-[#475569]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* 区分 */}
      <div className="flex items-center gap-2">
        <span className="text-slate-500 text-sm w-14 flex-shrink-0">区分</span>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => onToggleCategory(c)}
            className={`px-2.5 py-1 text-sm rounded border transition-colors ${
              filter.categories.includes(c)
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-[#1e293b] border-[#334155] text-slate-400 hover:border-[#475569]'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* フェーズ */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-slate-500 text-sm w-14 flex-shrink-0">フェーズ</span>
        {STAGES.map((s) => (
          <button
            key={s}
            onClick={() => onToggleStage(s)}
            className="px-2.5 py-1 text-sm rounded border transition-colors"
            style={
              filter.stages.includes(s)
                ? { backgroundColor: `${STAGE_COLORS[s]}33`, borderColor: STAGE_COLORS[s], color: STAGE_COLORS[s] }
                : { backgroundColor: '#1e293b', borderColor: '#334155', color: '#94a3b8' }
            }
          >
            P{s}:{STAGE_LABELS[s]}
          </button>
        ))}
        {hasFilter && (
          <button
            onClick={onReset}
            className="px-2.5 py-1 text-sm rounded border border-slate-600 text-slate-500 hover:text-slate-300 hover:border-slate-400 transition-colors ml-auto"
          >
            リセット
          </button>
        )}
      </div>
    </div>
  );
}
