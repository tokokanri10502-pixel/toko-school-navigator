interface UserPickerProps {
  members: string[];
  onSelect: (name: string) => void;
}

export function UserPicker({ members, onSelect }: UserPickerProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
      <div className="w-full max-w-md mx-4">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center shadow-lg mb-4">
            <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-white font-bold text-xl">あなたは誰ですか？</h1>
          <p className="text-slate-400 text-sm mt-2">活動を記録する人を選択してください</p>
        </div>

        <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 shadow-2xl space-y-2">
          {members.map((name) => (
            <button
              key={name}
              onClick={() => onSelect(name)}
              className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] hover:border-red-500 hover:bg-[#1e3a5f] rounded-xl text-white text-base font-medium text-left transition-colors"
            >
              {name}
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-slate-600 mt-4">
          メンバー名は右上の歯車アイコンから後で変更できます
        </p>
      </div>
    </div>
  );
}
