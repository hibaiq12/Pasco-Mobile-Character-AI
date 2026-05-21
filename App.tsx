
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ViewState, Character, ChatSession } from './types';
import { Sidebar } from './components/Sidebar';
import { ChangelogModal } from './components/ChangelogModal';
import { RealismDisclaimerModal } from './components/RealismDisclaimerModal';
import { RealismUserConfigModal } from './components/RealismUserConfigModal';
import { getCharacters, getSession, getSettings, checkVersion, updateVersion, saveCharacter, saveSettings } from './services/storageService';
import { seedNewCharacters } from './services/StorageServices/CharacterStorage/index';
import { loadImagesFromDB } from './services/ImageCreatedService';
import { loadHistoryFromDB } from './services/StorageServices/history';
import { Loader2 } from 'lucide-react';
import { CustomCursor } from './components/ChatInterface/CustomCursor';
import { FPSCounter } from './components/FPSCounter';
import { PauseMenu } from './components/ChatInterface/PauseMenu';
import { PasScreen } from './MaintenanceScreen/PasScreen';

// --- LAZY LOADED COMPONENTS ---
const Hub = lazy(() => import('./MainMenu/Hub'));
const TheForge = lazy(() => import('./MainMenu/NeuralForge/index'));
const PreviewPage = lazy(() => import('./MainMenu/Settings/components/preview/PreviewScreen/index'));
const MaintenanceScreen = lazy(() => import('./MaintenanceScreen/index'));
const ChatInterface = lazy(() => import('./components/ChatInterface/index').then(module => ({ default: module.ChatInterface })));
const HistoryPage = lazy(() => import('./components/HistoryPage').then(module => ({ default: module.HistoryPage })));
const SettingsPage = lazy(() => import('./components/SettingsPage').then(module => ({ default: module.SettingsPage })));

// --- Global Context Menu Disable & Initial Data ---
const initializeAppAsync = async () => {
    // Attempt rapid image load from IDB
    await Promise.all([
        loadImagesFromDB(),
        loadHistoryFromDB()
    ]);
};

const CURRENT_VERSION = 'v0.8.4';

const App: React.FC = () => {
  const settings = getSettings();
  
  // Calculated system lock (defaults logic)
  const isSystemLocked = settings.devForceMaintenance || settings.devForceUpdate || settings.devForceCountdown;

  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  // ... other states
  
  // -- Mobile Fullscreen & Back Button Logic --
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.matchMedia("(pointer: coarse)").matches;
    if (!isMobile && !settings.fullscreenTaps) return;

    let lastBackPressTime = 0;
    
    // Multi-tap logic
    let tapTimes: number[] = [];

    const requestFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        }
    };

    const exitFullscreen = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
        }
    };

    // 1. Auto fullscreen on first interaction
    const handleFirstInteraction = () => {
        if (isMobile) requestFullscreen();
        document.removeEventListener('touchstart', handleFirstInteraction);
        document.removeEventListener('click', handleFirstInteraction);
    };
    document.addEventListener('touchstart', handleFirstInteraction, { once: true });
    document.addEventListener('click', handleFirstInteraction, { once: true });

    // 2. Multi-tap anywhere on app to re-enter fullscreen
    const handleMultiTapFS = (e: Event) => {
        if (settings.enableTapToFullscreen === false) return;
        const requiredTaps = settings.fullscreenTaps || 2;
        const timeWindow = settings.fullscreenTime || 500;
        const currentTime = Date.now();
        
        tapTimes.push(currentTime);
        tapTimes = tapTimes.filter(t => currentTime - t <= timeWindow);
        
        if (tapTimes.length >= requiredTaps) {
            if (document.fullscreenElement) {
                exitFullscreen();
            } else {
                requestFullscreen();
            }
            if ('preventDefault' in e && e.cancelable && e.type.startsWith('touch')) {
                e.preventDefault(); 
            }
            tapTimes = []; 
        }
    };
    document.addEventListener('touchend', handleMultiTapFS, { passive: false });
    document.addEventListener('click', handleMultiTapFS);

    // 3. Intercept Android Back Button for Single / Double taps
    const pushFakeHistory = () => {
        window.history.pushState({ noBackExitsApp: true }, "");
    };

    // Push initial history state so we can intercept back
    pushFakeHistory();

    const handlePopState = () => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastBackPressTime;
        
        if (tapLength < 500 && tapLength > 0 && document.fullscreenElement) {
            // Double back button press while in fullscreen -> Exit fullscreen
            exitFullscreen();
            pushFakeHistory(); // Maintain fake history so we don't exit app yet
        } else {
            // Single back button press 
            // - If in fullscreen but single tap -> do normal back (change view)
            // - If not in fullscreen -> do normal back (change view)

            // Let's implement SPA back logic based on view state
            setView(prevView => {
                if (prevView === ViewState.CHAT) {
                    return ViewState.DASHBOARD;
                } else if (prevView === ViewState.FORGE || prevView === ViewState.SETTINGS || prevView === ViewState.HISTORY) {
                    return ViewState.DASHBOARD;
                } else if (prevView === ViewState.PREVIEW) {
                    return ViewState.SETTINGS;
                }
                
                // If we are at DASHBOARD, we actually want to allow app exit or just trap it.
                // We'll trap it by pushing fake history again if we want to prevent accidental exit,
                // or we can just window.history.back() to exit. 
                // Let's just push fake history to be safe and act as a web app.
                return prevView; 
            });

            pushFakeHistory();
        }
        
        lastBackPressTime = currentTime;
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
        document.removeEventListener('touchstart', handleFirstInteraction);
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('touchend', handleMultiTapFS);
        document.removeEventListener('click', handleMultiTapFS);
        window.removeEventListener('popstate', handlePopState);
    };
  }, [settings.fullscreenTaps, settings.fullscreenTime, settings.enableTapToFullscreen]);

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
  
  // --- NAVIGATION STATES ---
  // 1. showLauncher: Controls the PasScreen Bootloader
  const [showLauncher, setShowLauncher] = useState(true);
  
  // 2. isLocked: Controls the Maintenance Screen
  const [isLocked, setIsLocked] = useState(isSystemLocked);

  // FPS Counter Logic
  const showFps = settings.showFps;
  const fpsPosition = settings.fpsPosition || 'top-right';
  const fpsSize = settings.fpsSize || 0;

  // -- PAUSE MENU (Right Click) OVERRIDE GLOBAL --
  const lastRightClickTime = React.useRef<number>(0);
  const [pauseMenuCoords, setPauseMenuCoords] = useState<{x: number, y: number} | null>(null);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
        // Prevent default context menu everywhere if not explicitly allowed on input
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
             return;
        }
        e.preventDefault(); 
        
        const now = Date.now();
        if (now - lastRightClickTime.current < 400) {
            setPauseMenuCoords({ x: e.clientX, y: e.clientY });
            lastRightClickTime.current = 0; 
        } else {
            lastRightClickTime.current = now;
        }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

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
    initializeAppAsync();
    const storedVersion = checkVersion();
    if (storedVersion !== CURRENT_VERSION) {
        seedNewCharacters();
        // Always queue changelog if not disabled, regardless of system lock (it will show when unlocked)
        if (!settings.disableChangelog) {
            setTimeout(() => setShowChangelog(true), 0);
        } else {
            updateVersion(CURRENT_VERSION);
        }
    }
    setTimeout(() => refreshData(), 0);
  }, [settings.disableChangelog]);

  // AUTO-REDIRECT TO PREVIEW IF SYSTEM FLAGS ARE ACTIVE (Only if not already there)
  useEffect(() => {
      const locked = settings.devForceMaintenance || settings.devForceUpdate || settings.devForceCountdown;
      if (locked && view !== ViewState.PREVIEW) {
          // If forced maintenance is on, we don't redirect to preview, strictly show MaintenanceScreen via isLocked
          // But if we want to bypass to Preview, we can do it via Maintenance UI buttons
      }
  }, [settings, view]);

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

  // --- 1. BOOTLOADER LAYER (PasScreen) ---
  if (showLauncher) {
      return (
          <div className="cursor-none">
              <CustomCursor settings={settings} />
              {showFps && <FPSCounter position={fpsPosition} sizeIndex={fpsSize} />}
              {pauseMenuCoords && (
                 <PauseMenu 
                     x={pauseMenuCoords.x}
                     y={pauseMenuCoords.y}
                     onClose={() => setPauseMenuCoords(null)}
                     onSave={() => {}} // Disabled globally or trigger global event
                     onLoad={() => { setView(ViewState.DASHBOARD); setPauseMenuCoords(null); }}
                     onSmartphone={() => {}}
                     onScreen={() => {
                        if (!document.fullscreenElement) {
                            document.documentElement.requestFullscreen().catch(() => {});
                        } else {
                            document.exitFullscreen().catch(() => {});
                        }
                     }}
                     onExit={() => { setView(ViewState.DASHBOARD); setPauseMenuCoords(null); }}
                 />
              )}
              <PasScreen 
                  onEnterHub={() => {
                      setShowLauncher(false);
                      setIsLocked(false); // Explicitly unlock to enter Hub
                  }}
                  onEnterMaintenance={() => {
                      setShowLauncher(false);
                      setIsLocked(true); // Explicitly lock to enter Maintenance
                  }}
                  onEnterPreview={() => {
                      setShowLauncher(false);
                      setIsLocked(false);
                      setView(ViewState.PREVIEW);
                  }}
              />
          </div>
      );
  }

  // --- 2. MAINTENANCE LAYER ---
  if (isLocked) {
      return (
          <div className="cursor-none">
              <CustomCursor settings={settings} />
              {showFps && <FPSCounter position={fpsPosition} sizeIndex={fpsSize} />}
              <Suspense fallback={<div className="h-screen w-full bg-zinc-950 flex items-center justify-center"><Loader2 className="w-10 h-10 text-white animate-spin"/></div>}>
                  <MaintenanceScreen 
                      onUnlock={() => setIsLocked(false)}
                      onNavigateToPreview={() => {
                          setIsLocked(false);
                          setView(ViewState.PREVIEW);
                      }}
                  />
              </Suspense>
          </div>
      );
  }

  // --- 3. MAIN APP LAYER ---
  return (
    <div key={refreshKey} className={`flex h-screen w-full bg-zinc-950 text-zinc-200 overflow-hidden selection:bg-violet-500/30 font-sans cursor-none ${settings.fastAnimations ? 'fast-animations' : ''} ${settings.disableBlur ? 'disable-blur' : ''}`}>
      <CustomCursor settings={settings} />
      {showFps && <FPSCounter position={fpsPosition} sizeIndex={fpsSize} />}
      
      {view !== ViewState.CHAT && view !== ViewState.PREVIEW && !isCharacterBookOpen && (
          <Sidebar currentView={view} onChangeView={setView} />
      )}

      <main className="flex-1 h-full relative z-0 transition-all flex flex-col">
        <Suspense fallback={
            <div className="h-full w-full bg-zinc-950 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-violet-500 animate-spin mb-4" />
                <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest animate-pulse">Loading Module...</p>
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
                <HistoryPage onLoadStory={handleLoadStory} characters={characters} />
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

      {/* CHANGELOG - Only show in Dashboard (Hub) View */}
      {showChangelog && view === ViewState.DASHBOARD && (
          <ChangelogModal onClose={() => setShowChangelog(false)} onClaim={() => { updateVersion(CURRENT_VERSION); setShowChangelog(false); refreshData(); }} />
      )}
      
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
                
                // FIXED LOOP: Bypass handleCharacterSelect check
                if (pendingRealismCharId) {
                    const char = characters.find(c => c.id === pendingRealismCharId);
                    if (char) {
                        const session = getSession(pendingRealismCharId);
                        setChatProps({ participants: [char], initialSession: session });
                        setView(ViewState.CHAT);
                    }
                    setPendingRealismCharId(null);
                }
              }}
              onCancel={() => { setShowUserConfig(false); setPendingRealismCharId(null); }}
          />
      )}
    </div>
  );
};

export default App;
