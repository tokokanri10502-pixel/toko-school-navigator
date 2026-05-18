import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_TEAM_MEMBERS, TEAM_STORAGE_KEY } from '../config/team';

function loadTeam(): string[] {
  try {
    const raw = localStorage.getItem(TEAM_STORAGE_KEY);
    if (!raw) return [...DEFAULT_TEAM_MEMBERS];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((s) => typeof s === 'string')) {
      return parsed.length > 0 ? parsed : [...DEFAULT_TEAM_MEMBERS];
    }
    return [...DEFAULT_TEAM_MEMBERS];
  } catch {
    return [...DEFAULT_TEAM_MEMBERS];
  }
}

export function useTeam() {
  const [members, setMembers] = useState<string[]>(() => loadTeam());

  useEffect(() => {
    localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(members));
  }, [members]);

  const updateMembers = useCallback((next: string[]) => {
    setMembers(next.filter((s) => s.trim().length > 0));
  }, []);

  return { members, updateMembers };
}
