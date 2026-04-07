import { useState, useMemo } from 'react';
import type { School, SchoolType, SchoolCategory, RelationStage, FilterState } from '../types/school';
import { parseStages } from '../types/school';

const DEFAULT_FILTER: FilterState = {
  types: [],
  categories: [],
  stages: [],
  searchText: '',
};

export function useFilter(schools: School[]) {
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);

  const filtered = useMemo(() => {
    return schools.filter((s) => {
      if (filter.types.length > 0 && !filter.types.includes(s.type)) return false;
      if (filter.categories.length > 0 && !filter.categories.includes(s.category)) return false;
      if (filter.stages.length > 0 && !filter.stages.some((fs) => parseStages(s.relation_stage).includes(fs))) return false;
      if (filter.searchText && !s.name.includes(filter.searchText)) return false;
      return true;
    });
  }, [schools, filter]);

  function toggleType(type: SchoolType) {
    setFilter((f) => ({
      ...f,
      types: f.types.includes(type)
        ? f.types.filter((t) => t !== type)
        : [...f.types, type],
    }));
  }

  function toggleCategory(cat: SchoolCategory) {
    setFilter((f) => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter((c) => c !== cat)
        : [...f.categories, cat],
    }));
  }

  function toggleStage(stage: RelationStage) {
    setFilter((f) => ({
      ...f,
      stages: f.stages.includes(stage)
        ? f.stages.filter((s) => s !== stage)
        : [...f.stages, stage],
    }));
  }

  function setSearch(text: string) {
    setFilter((f) => ({ ...f, searchText: text }));
  }

  function resetFilter() {
    setFilter(DEFAULT_FILTER);
  }

  return { filter, filtered, toggleType, toggleCategory, toggleStage, setSearch, resetFilter };
}
