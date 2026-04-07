import { useState } from 'react';
import type { School } from '../../types/school';
import { schoolsToCSV } from '../../utils/csvParser';

interface HeaderProps {
  schools: School[];
  page: 'map' | 'list' | 'analytics';
  onPageChange: (page: 'map' | 'list' | 'analytics') => void;
}

export function Header({ schools, page, onPageChange }: HeaderProps) {
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      let data: School[] = schools;
      const res = await fetch('/gas-api');
      if (res.ok) {
        data = await res.json();
      }
      const csv = schoolsToCSV(data);
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `toko-school-navigator-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setSaving(false);
    }
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-[#0f172a] border-b border-[#1e3a5f] flex-shrink-0">
      <div className="flex items-center gap-3">
        <button onClick={() => onPageChange('map')} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="text-left">
            <h1 className="text-white font-bold text-lg leading-none">TOKO School Navigator</h1>
            <p className="text-slate-400 text-sm mt-1">東光印刷 学校支援営業管理ツール</p>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => onPageChange(page === 'list' ? 'map' : 'list')}
          className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-base transition-colors ${
            page === 'list'
              ? 'bg-blue-600 border-blue-500 text-white hover:bg-blue-700'
              : 'bg-[#1e293b] hover:bg-[#334155] border-[#334155] hover:border-[#475569] text-slate-300'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          学校一覧
        </button>
        <button
          onClick={() => onPageChange(page === 'analytics' ? 'map' : 'analytics')}
          className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-base transition-colors ${
            page === 'analytics'
              ? 'bg-purple-600 border-purple-500 text-white hover:bg-purple-700'
              : 'bg-[#1e293b] hover:bg-[#334155] border-[#334155] hover:border-[#475569] text-slate-300'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          分析
        </button>
        <div className="text-slate-400 text-base">
          <span className="text-white font-semibold text-lg">{schools.length}</span> 校
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 border text-white text-base rounded-lg transition-colors ${saving ? 'bg-emerald-900 border-emerald-700 cursor-wait' : 'bg-emerald-700 hover:bg-emerald-600 border-emerald-600 hover:border-emerald-500'}`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {saving ? '取得中...' : '保存'}
        </button>
      </div>
    </header>
  );
}
