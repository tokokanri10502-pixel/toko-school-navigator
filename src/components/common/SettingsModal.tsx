import { useState, useEffect } from 'react';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  members: string[];
  currentUser: string | null;
  onSaveMembers: (next: string[]) => void;
  onChangeCurrentUser: (name: string) => void;
}

export function SettingsModal({ open, onClose, members, currentUser, onSaveMembers, onChangeCurrentUser }: SettingsModalProps) {
  const [editing, setEditing] = useState<string[]>(members);

  useEffect(() => {
    if (open) setEditing(members);
  }, [open, members]);

  if (!open) return null;

  function handleChange(idx: number, value: string) {
    setEditing((prev) => prev.map((v, i) => (i === idx ? value : v)));
  }

  function handleAdd() {
    setEditing((prev) => [...prev, `メンバー${String.fromCharCode(65 + prev.length)}`]);
  }

  function handleRemove(idx: number) {
    setEditing((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleSave() {
    const cleaned = editing.map((s) => s.trim()).filter((s) => s.length > 0);
    if (cleaned.length === 0) {
      alert('メンバーは1人以上必要です');
      return;
    }
    onSaveMembers(cleaned);
    // 現ユーザーが削除されていたら未選択に戻る（useCurrentUser側でハンドル）
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="bg-[#1e293b] border border-[#334155] rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#334155] flex items-center justify-between">
          <h2 className="text-white text-lg font-bold">設定</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4 overflow-y-auto space-y-6">
          {/* 現在のユーザー切り替え */}
          <div>
            <label className="text-sm font-semibold text-slate-300 mb-2 block">現在のユーザー</label>
            <select
              value={currentUser ?? ''}
              onChange={(e) => onChangeCurrentUser(e.target.value)}
              className="w-full px-3 py-2 bg-[#0f172a] border border-[#334155] rounded text-sm text-slate-200 focus:outline-none focus:border-red-500"
            >
              {members.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* メンバー名編集 */}
          <div>
            <label className="text-sm font-semibold text-slate-300 mb-2 block">チームメンバー</label>
            <p className="text-xs text-slate-500 mb-3">活動ログに「誰が記録したか」として表示されます</p>
            <div className="space-y-2">
              {editing.map((name, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    className="flex-1 px-3 py-2 bg-[#0f172a] border border-[#334155] rounded text-sm text-slate-200 focus:outline-none focus:border-red-500"
                  />
                  <button
                    onClick={() => handleRemove(idx)}
                    disabled={editing.length <= 1}
                    className="px-2 py-2 text-slate-500 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="削除"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={handleAdd}
              className="mt-3 px-3 py-1.5 bg-[#0f172a] border border-[#334155] hover:border-blue-500 hover:text-blue-400 rounded text-sm text-slate-400 transition-colors"
            >
              + メンバーを追加
            </button>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#334155] flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-slate-200 text-sm"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
