import type { RelationStage } from '../../types/school';
import { STAGE_LABELS, STAGE_COLORS } from '../../types/school';

interface PhaseTagProps {
  stage: RelationStage;
  size?: 'sm' | 'md';
}

export function PhaseTag({ stage, size = 'md' }: PhaseTagProps) {
  const color = STAGE_COLORS[stage];
  const label = STAGE_LABELS[stage];
  const padding = size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center rounded font-medium ${padding}`}
      style={{
        backgroundColor: `${color}22`,
        color,
        border: `1px solid ${color}55`,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 flex-shrink-0" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
