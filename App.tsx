
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ViewState, Character, ChatSession, StoryConfiguration } from './types';
import { getCharacters, getSession, saveSession, getSettings, checkVersion, updateVersion, saveCharacter, saveSettings } from './services/storageService';
import { seedNewCharacters } from './services/StorageServices/CharacterStorage/index';
import { Loader2, Zap } from 'lucide-react';
import MaintenanceScreen from './MaintenanceScreen/index'; 

// --- LAZY LOADED COMPONENTS (PERFORMANCE OPTIMIZATION) ---
const Sidebar = lazy(() => import('./components/Sidebar').then(module => ({ default: module.Sidebar })));
const ChatInterface = lazy(() => import('./components/ChatInterface/index').then(module => ({ default: module.ChatInterface })));
const HistoryPage = lazy(() => import('./components/HistoryPage').then(module => ({ default: module.HistoryPage })));
const SettingsPage = lazy(() => import('./components/SettingsPage').then(module => ({ default: module.SettingsPage })));
const ChangelogModal = lazy(() => import('./components/ChangelogModal').then(module => ({ default: module.ChangelogModal })));
const RealismDisclaimerModal = lazy(() => import('./components/RealismDisclaimerModal').then(module => ({ default: module.RealismDisclaimerModal })));
const RealismUserConfigModal = lazy(() => import('./components/RealismUserConfigModal').then(module => ({ default: module.RealismUserConfigModal })));

// Default Exports
const TheForge = lazy(() => import('./MainMenu/NeuralForge/index'));
const Hub = lazy(() => import('./MainMenu/Hub'));

const CURRENT_VERSION = 'v0.8.3';

const App: React.FC = () => {
  // --- MAINTENANCE STATE ---
  const [isMaintenanceLocked, setIsMaintenanceLocked] = useState(true);

  // State Definitions
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [sessions, setSessions] = useState<Record<string, ChatSession>>({});
  const [characterToEdit, setCharacterToEdit] = useState<Character | undefined>(undefined);
  
  // Chat State
  const [chatProps, setChatProps] = useState<{ participants: Character[], initialSession: ChatSession } | null>(null);
  
  // UI State
  const [refreshKey, setRefreshKey] = useState(0);
  const [showChangelog, setShowChangelog] = useState(false);
  const [isCharacterBookOpen, setIsCharacterBookOpen] = useState(false);
  const [showRealismDisclaimer, setShowRealismDisclaimer] = useState(false);
  const [showUserConfig, setShowUserConfig] = useState(false);
  const [pendingRealismCharId, setPendingRealismCharId] = useState<string | null>(null);
  
  // Scroll Position for Dashboard
  const [dashboardScrollY, setDashboardScrollY] = useState(0);

  useEffect(() => {
    if (!isMaintenanceLocked) {
        initializeSystem();
    }
  }, [isMaintenanceLocked]);

  const initializeSystem = () => {
    const storedVersion = checkVersion();
    if (storedVersion !== CURRENT_VERSION) {
        seedNewCharacters();
        setShowChangelog(true);
    }
    refreshData();
  };

  const refreshData = () => {
    setCharacters(getCharacters());
    const chars = getCharacters();
    const sess: Record<string, ChatSession> = {};
    chars.forEach(c => {
        sess[c.id] = getSession(c.id);
    });
    setSessions(sess);
    setRefreshKey(prev => prev + 1);
  };

  const handleChangelogClaim = () => {
      updateVersion(CURRENT_VERSION);
      setShowChangelog(false);
      refreshData();
  };

  const handleCharacterSelect = (id: string) => {
      if (id === 'char-hiyori') {
          const session = getSession(id);
          if (!session || session.messages.length === 0) {
              setPendingRealismCharId(id);
              setShowRealismDisclaimer(true);
              return;
          }
      }

      const char = characters.find(c => c.id === id);
      if (char) {
          const session = getSession(id);
          setChatProps({
              participants: [char],
              initialSession: session
          });
          setView(ViewState.CHAT);
      }
  };

  const handleEditCharacter = (id: string) => {
      const char = characters.find(c => c.id === id);
      if (char) {
          setCharacterToEdit(char);
          setView(ViewState.FORGE);
      }
  };

  const handleCharacterCreate = (character: Character) => {
      saveCharacter(character);
      setCharacterToEdit(undefined);
      refreshData();
      setView(ViewState.DASHBOARD);
  };

  const handleLoadStory = (characterId: string, session: ChatSession) => {
      const char = characters.find(c => c.id === characterId);
      if (char) {
          if (session.isGroup && session.participants) {
              const participants = session.participants
                  .map(pid => characters.find(c => c.id === pid))
                  .filter((c): c is Character => !!c);
              
              if (participants.length > 0) {
                  setChatProps({
                      participants,
                      initialSession: session
                  });
                  setView(ViewState.CHAT);
              }
          } else {
              setChatProps({
                  participants: [char],
                  initialSession: session
              });
              setView(ViewState.CHAT);
          }
      }
  };

  const handleSettingsChange = () => {
      refreshData();
  };

  const handleDashboardScroll = (metrics: { scrollTop: number }) => {
      setDashboardScrollY(metrics.scrollTop);
  };

  const handleCreateClick = () => {
      setCharacterToEdit(undefined);
      setView(ViewState.FORGE);
  };

  const handleRealismStart = (config: StoryConfiguration) => {
      const currentSettings = getSettings();
      saveSettings({ ...currentSettings, userName: config.userName });
      setShowUserConfig(false);
      
      if (pendingRealismCharId) {
          const char = characters.find(c => c.id === pendingRealismCharId);
          if (char) {
              const session = getSession(pendingRealismCharId);
              setChatProps({
                  participants: [char],
                  initialSession: session
              });
              setView(ViewState.CHAT);
          }
          setPendingRealismCharId(null);
      }
  };

  if (isMaintenanceLocked) {
      return <MaintenanceScreen onUnlock={() => setIsMaintenanceLocked(false)} />;
  }

  return (
    <Suspense fallback={
        <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Zap size={24} className="text-violet-500 animate-pulse" fill="currentColor" />
                </div>
            </div>
            <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest mt-6 animate-pulse">
                System Booting...
            </p>
        </div>
    }>
        <div key={refreshKey} className="flex h-screen sm:h-screen h-[100dvh] w-full bg-zinc-950 text-zinc-200 overflow-hidden selection:bg-violet-500/30 selection:text-violet-200 font-sans">
          
          {view !== ViewState.CHAT && !isCharacterBookOpen && (
              <Sidebar currentView={view} onChangeView={setView} />
          )}

          <main className="flex-1 h-full relative z-0 md:ml-0 transition-all flex flex-col">
            {view === ViewState.DASHBOARD && (
                  <Hub 
                    characters={characters}
                    sessions={sessions}
                    onCreateClick={handleCreateClick}
                    onSelectCharacter={handleCharacterSelect}
                    onEditCharacter={handleEditCharacter}
                    onScroll={handleDashboardScroll}
                    onBookStateChange={setIsCharacterBookOpen} 
                  />
            )}

            {view === ViewState.FORGE && (
              <div className="h-full w-full bg-zinc-950 relative">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-violet-900/10 via-black to-black pointer-events-none" />
                 <div className="relative z-10 h-full">
                    <TheForge 
                      initialData={characterToEdit}
                      onSave={handleCharacterCreate}
                      onCancel={() => {
                          setCharacterToEdit(undefined);
                          setView(ViewState.DASHBOARD);
                      }}
                      onScroll={handleDashboardScroll}
                    />
                 </div>
              </div>
            )}

            {view === ViewState.HISTORY && (
                <HistoryPage 
                    onLoadStory={handleLoadStory} 
                    sessions={sessions}
                    characters={characters}
                    onSelectGroup={() => {}} 
                />
            )}

            {view === ViewState.SETTINGS && <SettingsPage onSettingsChange={handleSettingsChange} />}

            {view === ViewState.CHAT && chatProps && chatProps.participants.length > 0 && (
              <div className="h-full w-full">
                <ChatInterface 
                  key={`${chatProps.initialSession.characterId}_${chatProps.initialSession.lastUpdated}`} 
                  participants={chatProps.participants}
                  initialSession={chatProps.initialSession}
                  onBack={() => { refreshData(); setView(ViewState.DASHBOARD); }}
                  onNavigateToSettings={() => setView(ViewState.SETTINGS)} 
                />
              </div>
            )}

          </main>

          {showChangelog && <ChangelogModal onClose={() => setShowChangelog(false)} onClaim={handleChangelogClaim} />}
          
          {showRealismDisclaimer && (
              <RealismDisclaimerModal 
                  onAgree={() => { setShowRealismDisclaimer(false); setShowUserConfig(true); }}
                  onCancel={() => { setShowRealismDisclaimer(false); setPendingRealismCharId(null); }}
              />
          )}

          {showUserConfig && (
              <RealismUserConfigModal
                  onStart={handleRealismStart}
                  onCancel={() => { setShowUserConfig(false); setPendingRealismCharId(null); }}
              />
          )}

        </div>
    </Suspense>
  );
};

export default App;
