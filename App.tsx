import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ViewState, Character, ChatSession, StoryConfiguration } from './types';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface/index';
import TheForge from './MainMenu/NeuralForge/index';
import { HistoryPage } from './components/HistoryPage';
import { SettingsPage } from './components/SettingsPage';
import { ChangelogModal } from './components/ChangelogModal';
import { RealismDisclaimerModal } from './components/RealismDisclaimerModal';
import { RealismUserConfigModal } from './components/RealismUserConfigModal';
import MaintenanceScreen from './MaintenanceScreen/index';
import { getCharacters, getSession, saveSession, getSettings, checkVersion, updateVersion, saveCharacter, saveSettings } from './services/storageService';
import { seedNewCharacters } from './services/StorageServices/CharacterStorage/index';
import { Loader2 } from 'lucide-react';

// Lazy load Hub/Dashboard
const Hub = lazy(() => import('./MainMenu/Hub'));

const CURRENT_VERSION = 'v0.8.3';

const App: React.FC = () => {
  // State Definitions
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [sessions, setSessions] = useState<Record<string, ChatSession>>({});
  const [characterToEdit, setCharacterToEdit] = useState<Character | undefined>(undefined);
  
  // Maintenance State (Local Override after unlock)
  const [isUnlockedLocally, setIsUnlockedLocally] = useState(false);
  
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
    // Check version and seed if needed
    const storedVersion = checkVersion();
    if (storedVersion !== CURRENT_VERSION) {
        seedNewCharacters();
        setShowChangelog(true);
        // Don't update version yet, wait for user to claim in changelog
    }
    refreshData();
  }, []);

  const refreshData = () => {
    setCharacters(getCharacters());
    // Load sessions for all characters
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
      // Check if Hiyori (Realism) - First time setup logic
      if (id === 'char-hiyori') {
          const session = getSession(id);
          // If session is empty, trigger realism flow
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
          // Check if group
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
      } else if (session.isGroup && session.participants) {
           // Handle case where main char ID isn't found but it's a group
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

  // Realism Config Completion
  const handleRealismStart = (config: StoryConfiguration) => {
      const currentSettings = getSettings();
      saveSettings({ ...currentSettings, userName: config.userName });
      
      setShowUserConfig(false);
      
      if (pendingRealismCharId) {
          const char = characters.find(c => c.id === pendingRealismCharId);
          if (char) {
              const session = getSession(pendingRealismCharId);
              // Inject system prompt about user config? 
              // For now just start chat
              setChatProps({
                  participants: [char],
                  initialSession: session
              });
              setView(ViewState.CHAT);
          }
          setPendingRealismCharId(null);
      }
  };

  // Maintenance Logic
  const settings = getSettings();
  const shouldShowMaintenance = (settings.devForceMaintenance || settings.devForceUpdate || settings.devForceCountdown) && !isUnlockedLocally;

  if (shouldShowMaintenance) {
      return (
          <MaintenanceScreen 
            onUnlock={() => setIsUnlockedLocally(true)} 
          />
      );
  }

  return (
    <div key={refreshKey} className="flex h-screen sm:h-screen h-[100dvh] w-full bg-zinc-950 text-zinc-200 overflow-hidden selection:bg-violet-500/30 selection:text-violet-200 font-sans">
      
      {/* Sidebar - Hidden in Chat, Hidden on Mobile if Book Open */}
      {view !== ViewState.CHAT && !isCharacterBookOpen && (
          <Sidebar currentView={view} onChangeView={setView} />
      )}

      {/* Main Content */}
      <main className="flex-1 h-full relative z-0 md:ml-0 transition-all flex flex-col">
        {view === ViewState.DASHBOARD && (
          <Suspense fallback={
              <div className="h-full w-full bg-zinc-950 flex flex-col items-center justify-center">
                  <Loader2 className="w-10 h-10 text-violet-500 animate-spin mb-4" />
                  <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest animate-pulse">Initializing Hub...</p>
              </div>
          }>
              <Hub 
                characters={characters}
                sessions={sessions}
                onCreateClick={handleCreateClick}
                onSelectCharacter={handleCharacterSelect}
                onEditCharacter={handleEditCharacter}
                onScroll={handleDashboardScroll}
                onBookStateChange={setIsCharacterBookOpen} 
              />
          </Suspense>
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

      {/* Modals */}
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
  );
};

export default App;