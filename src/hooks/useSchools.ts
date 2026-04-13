import { useState, useEffect, useCallback } from 'react';
import type { School, RelationStage } from '../types/school';
import { parseSchoolsCSV } from '../utils/csvParser';
import { GAS_URL } from '../utils/gasUrl';

const PROGRESS_KEY = 'toko-school-nav-progress';

type ProgressData = Record<string, {
  contact_person: string;
  contact_date: string;
  relation_stage: RelationStage;
  toko_person: string;
  support_items: string;
  notes: string;
  open_campus_2026: string;
}>;

function loadProgress(): ProgressData {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function normalizeSchool(raw: Record<string, unknown>): School {
  return {
    ...raw,
    lat: parseFloat(raw.lat as string) || 0,
    lng: parseFloat(raw.lng as string) || 0,
    relation_stage: String(raw.relation_stage ?? '0'),
  } as School;
}

async function fetchFromGAS(): Promise<School[]> {
  const res = await fetch(GAS_URL);
  if (!res.ok) throw new Error(`GAS fetch failed: ${res.status}`);
  const data = await res.json();
  return (data as Record<string, unknown>[]).map(normalizeSchool);
}

async function postToGAS(body: object): Promise<void> {
  await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(body),
  });
}

export function useSchools() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const fetched = await fetchFromGAS();
        setSchools(fetched);
      } catch (e) {
        console.error('GAS fetch failed, falling back to local CSV', e);
        try {
          const parsed = await parseSchoolsCSV(`${import.meta.env.BASE_URL}data/schools.csv`);
          const progress = loadProgress();
          const merged = parsed.map((s) => {
            const p = progress[s.id];
            return p ? { ...s, ...p, relation_stage: String(p.relation_stage ?? s.relation_stage) } : s;
          });
          setSchools(merged);
        } catch (e2) {
          setError('データの読み込みに失敗しました');
          console.error(e2);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const updateSchool = useCallback((id: string, updates: Partial<School>) => {
    setSchools((prev) => {
      const next = prev.map((s) => s.id === id ? { ...s, ...updates } : s);
      const target = next.find((s) => s.id === id);
      if (target) {
        postToGAS({ action: 'update', school: target }).catch(console.error);
      }
      return next;
    });
  }, []);

  const importSchools = useCallback((imported: School[]) => {
    setSchools(imported);
    postToGAS({ action: 'import', schools: imported }).catch(console.error);
  }, []);

  return { schools, loading, error, updateSchool, importSchools };
}
