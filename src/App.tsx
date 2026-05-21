
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ViewState, Character, ChatSession } from './types';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface/index';
import TheForge from './MainMenu/NeuralForge/index';
import { HistoryPage } from './components/HistoryPage';
import { SettingsPage } from './components/SettingsPage';
import { ChangelogModal } from './components/ChangelogModal';
import { RealismDisclaimerModal } from './components/RealismDisclaimerModal';
import { RealismUserConfigModal } from './components/RealismUserConfigModal';
import { CustomCursor } from './components/ChatInterface/CustomCursor';
import { getCharacters, getSession, getSettings, checkVersion, updateVersion, saveCharacter, saveSettings } from './services/storageService';
import { seedNewCharacters } from './services/StorageServices/CharacterStorage/index';
import { Loader2 } from 'lucide-react';

// Lazy load Components
const Hub = lazy(() => import('./MainMenu/Hub'));
// UPDATE PATH IMPORT KE PREVIEW SCREEN FOLDER
const PreviewPage = lazy(() => import('./MainMenu/Settings/components/preview/PreviewScreen/index'));

const CURRENT_VERSION = 'v0.8.4';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [sessions, setSessions] = useState<Record<string, ChatSession>>({});
  const [characterToEdit, setCharacterToEdit] = useState<Character | undefined>(undefined);
  
  const [chatProps, setChatProps] = useState<{ participants: Character[], initialSession: ChatSession } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showChangelog, setShowChangelog] = useState(false);
  const [isCharacterBookOpen, setIsCharacterBookOpen] = useState(false);
  const [showRealismDisclaimer, setShowRealismDisclaimer] = useState(false);
  const [showUserConfig, setShowUserConfig] = useState(false);
  const [pendingRealismCharId, setPendingRealismCharId] = useState<string | null>(null);
  
  const settings = getSettings();

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

  useEffect(() => {
    const storedVersion = checkVersion();
    if (storedVersion !== CURRENT_VERSION) {
        seedNewCharacters();
        // Only show changelog if not suppressed by dev settings
        if (!settings.disableChangelog) {
            setTimeout(() => setShowChangelog(true), 0);
        } else {
            // Silently update version so it doesn't pop up next time if they turn off the setting
            updateVersion(CURRENT_VERSION);
        }
    }
    setTimeout(() => refreshData(), 0);
  }, [settings.disableChangelog]);

  // AUTO-REDIRECT TO PREVIEW IF SYSTEM FLAGS ARE ACTIVE
  useEffect(() => {
      const isSystemLocked = settings.devForceMaintenance || settings.devForceUpdate || settings.devForceCountdown;
      if (isSystemLocked && view !== ViewState.PREVIEW) {
          console.warn("System Override Detected. Redirecting to Developer Preview Hub.");
          setTimeout(() => setView(ViewState.PREVIEW), 0);
      }
  }, [settings.devForceMaintenance, settings.devForceUpdate, settings.devForceCountdown, view]);

  const handleCharacterSelect = (id: string) => {
      if (id === 'char-hiyori' || id.startsWith('realism-')) {
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
          setChatProps({ participants: [char], initialSession: session });
          setView(ViewState.CHAT);
      }
  };

  const handleLoadStory = (characterId: string, session: ChatSession) => {
      const char = characters.find(c => c.id === characterId);
      if (char) {
          if (session.isGroup && session.participants) {
              const participants = session.participants
                  .map(pid => characters.find(c => c.id === pid))
                  .filter((c): c is Character => !!c);
              if (participants.length > 0) {
                  setChatProps({ participants, initialSession: session });
                  setView(ViewState.CHAT);
              }
          } else {
              setChatProps({ participants: [char], initialSession: session });
              setView(ViewState.CHAT);
          }
      }
  };

  // HANDLER UNTUK BYPASS DARI PREVIEW PAGE
  const handlePreviewBypass = (targetView: ViewState) => {
      if (targetView === ViewState.CHAT) {
          const defaultChar = characters[0];
          if (defaultChar) {
              handleCharacterSelect(defaultChar.id);
          }
      } else {
          setView(targetView);
      }
  };

  return (
    <div key={refreshKey} className="flex h-screen w-full bg-zinc-950 text-zinc-200 overflow-hidden selection:bg-[#9600FF]/30 font-sans cursor-none">
      <CustomCursor />
      
      {view !== ViewState.CHAT && view !== ViewState.PREVIEW && !isCharacterBookOpen && (
          <Sidebar currentView={view} onChangeView={setView} />
      )}

      <main className="flex-1 h-full relative z-0 transition-all flex flex-col">
        <Suspense fallback={
            <div className="h-full w-full bg-zinc-950 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-violet-500 animate-spin mb-4" />
                <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest animate-pulse">Synchronizing Neural Link...</p>
            </div>
        }>
            {view === ViewState.DASHBOARD && (
                <Hub 
                    characters={characters}
                    sessions={sessions}
                    onCreateClick={() => setView(ViewState.FORGE)}
                    onSelectCharacter={handleCharacterSelect}
                    onEditCharacter={(id) => {
                        const char = characters.find(c => c.id === id);
                        setCharacterToEdit(char);
                        setView(ViewState.FORGE);
                    }}
                    onBookStateChange={setIsCharacterBookOpen} 
                />
            )}

            {view === ViewState.FORGE && (
                <TheForge 
                    initialData={characterToEdit}
                    onSave={(c) => { saveCharacter(c); setView(ViewState.DASHBOARD); refreshData(); }}
                    onCancel={() => setView(ViewState.DASHBOARD)}
                />
            )}

            {view === ViewState.HISTORY && (
                <HistoryPage onLoadStory={handleLoadStory} sessions={sessions} characters={characters} onSelectGroup={() => {}} />
            )}

            {view === ViewState.SETTINGS && (
                <SettingsPage 
                  onSettingsChange={refreshData} 
                  onNavigateToPreview={() => setView(ViewState.PREVIEW)}
                />
            )}

            {view === ViewState.PREVIEW && (
                <PreviewPage onBypass={handlePreviewBypass} onBack={() => setView(ViewState.DASHBOARD)} />
            )}

            {view === ViewState.CHAT && chatProps && (
                <ChatInterface 
                    participants={chatProps.participants}
                    initialSession={chatProps.initialSession}
                    onBack={() => { refreshData(); setView(ViewState.DASHBOARD); }}
                    onNavigateToSettings={() => setView(ViewState.SETTINGS)} 
                />
            )}
        </Suspense>
      </main>

      {showChangelog && <ChangelogModal onClose={() => setShowChangelog(false)} onClaim={() => { updateVersion(CURRENT_VERSION); setShowChangelog(false); refreshData(); }} />}
      
      {showRealismDisclaimer && (
          <RealismDisclaimerModal 
              onAgree={() => { setShowRealismDisclaimer(false); setShowUserConfig(true); }}
              onCancel={() => { setShowRealismDisclaimer(false); setPendingRealismCharId(null); }}
          />
      )}

      {showUserConfig && (
          <RealismUserConfigModal
              onStart={(config) => {
                saveSettings({ ...settings, userName: config.userName });
                setShowUserConfig(false);
                if (pendingRealismCharId) handleCharacterSelect(pendingRealismCharId);
              }}
              onCancel={() => { setShowUserConfig(false); setPendingRealismCharId(null); }}
          />
      )}
    </div>
  );
};

export default App;
