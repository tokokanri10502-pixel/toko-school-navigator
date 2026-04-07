import { useState } from 'react';

// SHA-256 hash of "toko2026"
const HASH = '8983ee570379fd290b174487885737b384d187d605a02f16b9a8b04bb52ea8b0';

async function sha256(str: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

interface Props {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: Props) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const hash = await sha256(password);
    if (hash === HASH) {
      localStorage.setItem('toko_school_auth', '1');
      onLogin();
    } else {
      setError(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
      <div className="w-full max-w-sm mx-4">
        {/* ロゴ */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center shadow-lg mb-4">
            <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-white font-bold text-xl leading-none">TOKO School Navigator</h1>
          <p className="text-slate-400 text-sm mt-1">東光印刷 学校支援営業管理ツール</p>
        </div>

        {/* ログインカード */}
        <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-8 shadow-2xl">
          <label className="block text-xs font-semibold text-slate-400 mb-2">パスワード</label>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
            placeholder="パスワードを入力"
            className="w-full px-4 py-3 bg-[#0f172a] border-2 border-[#334155] rounded-xl text-white text-base outline-none focus:border-blue-500 transition-colors placeholder-slate-600"
            autoComplete="current-password"
            autoFocus
          />
          {error && (
            <p className="mt-2 text-xs text-red-400">パスワードが違います。もう一度お試しください。</p>
          )}
          <button
            onClick={handleLogin}
            disabled={loading || !password}
            className="w-full mt-5 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold text-base transition-colors"
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </div>
      </div>
    </div>
  );
}
