import { useState } from 'react';
import type { School } from './types/school';
import { useSchools } from './hooks/useSchools';
import { useFilter } from './hooks/useFilter';
import { Header } from './components/common/Header';
import { LoginScreen } from './components/common/LoginScreen';
import { FilterBar } from './components/Panel/FilterBar';
import { SchoolList } from './components/Panel/SchoolList';
import { SchoolDetail } from './components/Panel/SchoolDetail';
import { SchoolMap } from './components/Map/SchoolMap';
import { SchoolListPage } from './pages/SchoolListPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem('toko_school_auth') === '1'
  );

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  return <AuthenticatedApp />;
}

function AuthenticatedApp() {
  const { schools, loading, error, updateSchool } = useSchools();
  const { filter, filtered, toggleType, toggleCategory, toggleStage, setSearch, resetFilter } = useFilter(schools);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapSelectedId, setMapSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState<'map' | 'list' | 'analytics'>('map');

  const selectedSchool = selectedId ? schools.find((s) => s.id === selectedId) ?? null : null;

  function handleSelect(school: School) {
    setSelectedId(school.id);
    setMapSelectedId(school.id);
  }

  function handleClose() {
    setSelectedId(null);
  }

  return (
    <div className="flex flex-col h-screen bg-[#0f172a] overflow-hidden">
      <Header schools={schools} page={page} onPageChange={setPage} />

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-slate-400">データを読み込んでいます...</div>
        </div>
      )}

      {error && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-400">{error}</div>
        </div>
      )}

      {!loading && !error && (
        <div className={`flex-1 overflow-hidden ${page === 'list' ? '' : 'hidden'}`}>
          <SchoolListPage schools={schools} onUpdate={updateSchool} selectedId={selectedId} onSelectId={setSelectedId} mapSelectedId={mapSelectedId} />
        </div>
      )}

      {!loading && !error && page === 'analytics' && (
        <div className="flex-1 overflow-hidden">
          <AnalyticsPage
            schools={schools}
            onSelectSchool={(id) => { setSelectedId(id); setMapSelectedId(id); setPage('list'); }}
          />
        </div>
      )}

      {!loading && !error && page === 'map' && (
        <div className="flex flex-1 overflow-hidden">
          {/* 地図 (70%) */}
          <div className="flex-1 relative">
            <SchoolMap
              schools={filtered}
              selectedId={selectedId}
              onSelect={handleSelect}
            />
          </div>

          {/* 右パネル */}
          <div
            className="w-[480px] flex-shrink-0 bg-[#0f172a] border-l border-[#1e3a5f] flex flex-col overflow-hidden"
            style={{ minWidth: '420px', maxWidth: '520px' }}
          >
            <FilterBar
              filter={filter}
              onToggleType={toggleType}
              onToggleCategory={toggleCategory}
              onToggleStage={toggleStage}
              onSetSearch={setSearch}
              onReset={resetFilter}
            />

            <div className="flex-1 overflow-hidden relative">
              {/* 一覧 */}
              <div
                className={`absolute inset-0 transition-all duration-200 ${
                  selectedSchool ? 'opacity-0 pointer-events-none -translate-x-4' : 'opacity-100 translate-x-0'
                }`}
              >
                <SchoolList
                  schools={filtered}
                  allSchools={schools}
                  selectedId={selectedId}
                  onSelect={handleSelect}
                />
              </div>

              {/* 詳細 */}
              <div
                className={`absolute inset-0 transition-all duration-200 ${
                  selectedSchool ? 'opacity-100 translate-x-0' : 'opacity-0 pointer-events-none translate-x-4'
                }`}
              >
                {selectedSchool && (
                  <SchoolDetail
                    school={selectedSchool}
                    onUpdate={updateSchool}
                    onClose={handleClose}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
