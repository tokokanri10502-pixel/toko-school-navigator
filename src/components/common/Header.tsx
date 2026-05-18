import { useState } from 'react';
import type { School } from '../../types/school';
import { schoolsToCSV } from '../../utils/csvParser';

export type AppPage = 'home' | 'map' | 'list' | 'analytics';

interface HeaderProps {
  schools: School[];
  page: AppPage;
  onPageChange: (page: AppPage) => void;
  currentUser: string | null;
  onOpenSettings: () => void;
}

export function Header({ schools, page, onPageChange, currentUser, onOpenSettings }: HeaderProps) {
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
      const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
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

  function tabClass(active: boolean, color: 'blue' | 'purple' | 'amber') {
    const palette = {
      blue: 'bg-blue-600 border-blue-500 hover:bg-blue-700',
      purple: 'bg-purple-600 border-purple-500 hover:bg-purple-700',
      amber: 'bg-amber-600 border-amber-500 hover:bg-amber-700',
    }[color];
    return `flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors ${
      active
        ? `${palette} text-white`
        : 'bg-[#1e293b] hover:bg-[#334155] border-[#334155] hover:border-[#475569] text-slate-300'
    }`;
  }

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-[#0f172a] border-b border-[#1e3a5f] flex-shrink-0">
      <div className="flex items-center gap-3">
        <button onClick={() => onPageChange('map')} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="text-left">
            <h1 className="text-white font-bold text-base leading-none">TOKO School Navigator</h1>
            <p className="text-slate-400 text-xs mt-1">東光印刷 学校支援営業管理ツール</p>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange('home')}
          className={tabClass(page === 'home', 'amber')}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          ホーム
        </button>
        <button
          onClick={() => onPageChange('map')}
          className={tabClass(page === 'map', 'blue')}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          地図
        </button>
        <button
          onClick={() => onPageChange('list')}
          className={tabClass(page === 'list', 'blue')}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          一覧
        </button>
        <button
          onClick={() => onPageChange('analytics')}
          className={tabClass(page === 'analytics', 'purple')}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          分析
        </button>

        <div className="ml-3 text-slate-400 text-sm">
          <span className="text-white font-semibold text-base">{schools.length}</span> 校
        </div>

        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-3 py-2 border text-white text-sm rounded-lg transition-colors ${saving ? 'bg-emerald-900 border-emerald-700 cursor-wait' : 'bg-emerald-700 hover:bg-emerald-600 border-emerald-600 hover:border-emerald-500'}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {saving ? '取得中...' : 'CSV'}
        </button>

        {/* 現ユーザー表示 */}
        {currentUser && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e3a5f] border border-blue-500/40 rounded-lg text-blue-300 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {currentUser}
          </div>
        )}

        {/* 歯車設定 */}
        <button
          onClick={onOpenSettings}
          title="設定"
          className="p-2 bg-[#1e293b] hover:bg-[#334155] border border-[#334155] hover:border-[#475569] rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </header>
  );
}
