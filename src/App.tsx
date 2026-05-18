import { useState, useCallback } from 'react';
import type { School } from './types/school';
import { highestStage } from './types/school';
import { useSchools } from './hooks/useSchools';
import { useFilter } from './hooks/useFilter';
import { useActivities } from './hooks/useActivities';
import { useTeam } from './hooks/useTeam';
import { useCurrentUser } from './hooks/useCurrentUser';
import { todayStr } from './types/activity';
import { Header } from './components/common/Header';
import type { AppPage } from './components/common/Header';
import { LoginScreen } from './components/common/LoginScreen';
import { UserPicker } from './components/common/UserPicker';
import { SettingsModal } from './components/common/SettingsModal';
import { FilterBar } from './components/Panel/FilterBar';
import { SchoolList } from './components/Panel/SchoolList';
import { SchoolDetail } from './components/Panel/SchoolDetail';
import { SchoolMap } from './components/Map/SchoolMap';
import { SchoolListPage } from './pages/SchoolListPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { HomePage } from './pages/HomePage';

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
  const { activities, addActivity, markDone, deleteActivity } = useActivities();
  const { members, updateMembers } = useTeam();
  const { currentUser, setCurrentUser } = useCurrentUser(members);

  const { filter, filtered, toggleType, toggleCategory, toggleStage, setSearch, resetFilter } = useFilter(schools);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapSelectedId, setMapSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState<AppPage>('home');
  const [settingsOpen, setSettingsOpen] = useState(false);

  // フェーズ変更を自動的に活動ログに残す
  const updateSchoolWithLog = useCallback((id: string, updates: Partial<School>) => {
    if ('relation_stage' in updates && currentUser) {
      const old = schools.find((s) => s.id === id);
      if (old && String(old.relation_stage) !== String(updates.relation_stage)) {
        const oldH = highestStage(old.relation_stage);
        const newH = highestStage(updates.relation_stage);
        if (oldH !== newH) {
          addActivity({
            school_id: id,
            recorded_by: currentUser,
            activity_date: todayStr(),
            type: 'phase_change',
            stage_from: String(oldH),
            stage_to: String(newH),
            content: '',
            next_action: '',
            next_action_date: '',
            next_action_done: false,
          }).catch(console.error);
        }
      }
    }
    updateSchool(id, updates);
  }, [schools, updateSchool, addActivity, currentUser]);

  // ユーザー未選択ならUserPickerを表示
  if (!currentUser) {
    return (
      <UserPicker
        members={members}
        onSelect={(name) => setCurrentUser(name)}
      />
    );
  }

  const selectedSchool = selectedId ? schools.find((s) => s.id === selectedId) ?? null : null;

  function handleSelect(school: School) {
    setSelectedId(school.id);
    setMapSelectedId(school.id);
  }

  function handleClose() {
    setSelectedId(null);
  }

  function jumpToSchool(id: string) {
    setSelectedId(id);
    setMapSelectedId(id);
    setPage('map');
  }

  return (
    <div className="flex flex-col h-screen bg-[#0f172a] overflow-hidden">
      <Header
        schools={schools}
        page={page}
        onPageChange={setPage}
        currentUser={currentUser}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        members={members}
        currentUser={currentUser}
        onSaveMembers={updateMembers}
        onChangeCurrentUser={setCurrentUser}
      />

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

      {!loading && !error && page === 'home' && (
        <div className="flex-1 overflow-hidden">
          <HomePage
            schools={schools}
            activities={activities}
            currentUser={currentUser}
            onSelectSchool={jumpToSchool}
            onMarkDone={markDone}
          />
        </div>
      )}

      {!loading && !error && (
        <div className={`flex-1 overflow-hidden ${page === 'list' ? '' : 'hidden'}`}>
          <SchoolListPage schools={schools} onUpdate={updateSchoolWithLog} selectedId={selectedId} onSelectId={setSelectedId} mapSelectedId={mapSelectedId} />
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
          <div className="flex-1 relative">
            <SchoolMap
              schools={filtered}
              selectedId={selectedId}
              onSelect={handleSelect}
              onDblClick={(school) => {
                setSelectedId(school.id);
                setMapSelectedId(school.id);
                setPage('list');
              }}
            />
          </div>

          <div
            className="w-[960px] flex-shrink-0 bg-[#0f172a] border-l border-[#1e3a5f] flex flex-col overflow-hidden"
            style={{ minWidth: '840px', maxWidth: '1040px' }}
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

              <div
                className={`absolute inset-0 transition-all duration-200 ${
                  selectedSchool ? 'opacity-100 translate-x-0' : 'opacity-0 pointer-events-none translate-x-4'
                }`}
              >
                {selectedSchool && (
                  <SchoolDetail
                    school={selectedSchool}
                    onUpdate={updateSchoolWithLog}
                    onClose={handleClose}
                    activities={activities}
                    currentUser={currentUser}
                    onAddActivity={addActivity}
                    onMarkDone={markDone}
                    onDeleteActivity={deleteActivity}
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
