import { useState, useEffect, useCallback } from 'react';
import type { Activity } from '../types/activity';
import { GAS_URL } from '../utils/gasUrl';

function normalizeActivity(raw: Record<string, unknown>): Activity {
  return {
    id: String(raw.id ?? ''),
    school_id: String(raw.school_id ?? ''),
    recorded_at: String(raw.recorded_at ?? ''),
    recorded_by: String(raw.recorded_by ?? ''),
    activity_date: String(raw.activity_date ?? ''),
    type: (raw.type as Activity['type']) || 'その他',
    stage_from: raw.stage_from !== '' && raw.stage_from !== undefined && raw.stage_from !== null
      ? String(raw.stage_from) : '',
    stage_to: raw.stage_to !== '' && raw.stage_to !== undefined && raw.stage_to !== null
      ? String(raw.stage_to) : '',
    content: String(raw.content ?? ''),
    next_action: String(raw.next_action ?? ''),
    next_action_date: String(raw.next_action_date ?? ''),
    next_action_done: raw.next_action_done === true || raw.next_action_done === 'TRUE' || raw.next_action_done === 'true',
  };
}

async function fetchActivities(): Promise<Activity[]> {
  const url = `${GAS_URL}${GAS_URL.includes('?') ? '&' : '?'}resource=activities`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GAS fetch activities failed: ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data)) {
    console.warn('Unexpected activities response', data);
    return [];
  }
  return data.map(normalizeActivity);
}

async function postToGAS(body: object): Promise<unknown> {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(body),
  });
  return res.json().catch(() => ({}));
}

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const fetched = await fetchActivities();
      setActivities(fetched);
    } catch (e) {
      console.error('activities fetch failed', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const addActivity = useCallback(async (activity: Omit<Activity, 'id' | 'recorded_at'> & { id?: string; recorded_at?: string }) => {
    // 楽観的更新：仮IDで即UIに反映
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const tempRecordedAt = new Date().toISOString().slice(0, 19);
    const optimistic: Activity = {
      ...activity,
      id: tempId,
      recorded_at: tempRecordedAt,
    } as Activity;
    setActivities((prev) => [optimistic, ...prev]);

    try {
      const res = await postToGAS({ action: 'addActivity', activity }) as { id?: string; recorded_at?: string };
      // 仮IDを本物に差し替え
      setActivities((prev) => prev.map((a) => a.id === tempId ? { ...a, id: res?.id || tempId, recorded_at: res?.recorded_at || tempRecordedAt } : a));
    } catch (e) {
      console.error('addActivity failed', e);
      // 失敗時は楽観更新を取り消し
      setActivities((prev) => prev.filter((a) => a.id !== tempId));
      throw e;
    }
  }, []);

  const markDone = useCallback(async (id: string, done: boolean) => {
    setActivities((prev) => prev.map((a) => a.id === id ? { ...a, next_action_done: done } : a));
    try {
      await postToGAS({ action: 'markDone', id, done });
    } catch (e) {
      console.error('markDone failed', e);
      // 失敗時は戻す
      setActivities((prev) => prev.map((a) => a.id === id ? { ...a, next_action_done: !done } : a));
    }
  }, []);

  const deleteActivity = useCallback(async (id: string) => {
    const before = activities;
    setActivities((prev) => prev.filter((a) => a.id !== id));
    try {
      await postToGAS({ action: 'deleteActivity', id });
    } catch (e) {
      console.error('deleteActivity failed', e);
      setActivities(before);
    }
  }, [activities]);

  return { activities, loading, reload, addActivity, markDone, deleteActivity };
}
