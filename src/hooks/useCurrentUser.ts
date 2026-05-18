import { useState, useCallback, useEffect } from 'react';
import { CURRENT_USER_STORAGE_KEY } from '../config/team';

export function useCurrentUser(members: string[]) {
  const [currentUser, setCurrentUserState] = useState<string | null>(() => {
    const stored = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    return stored || null;
  });

  // メンバー一覧が変わった時、現ユーザーが存在しなければクリア
  useEffect(() => {
    if (currentUser && !members.includes(currentUser)) {
      setCurrentUserState(null);
      localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    }
  }, [members, currentUser]);

  const setCurrentUser = useCallback((name: string | null) => {
    if (name) {
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, name);
    } else {
      localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    }
    setCurrentUserState(name);
  }, []);

  return { currentUser, setCurrentUser };
}
