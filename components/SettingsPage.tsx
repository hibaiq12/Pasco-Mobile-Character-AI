
import React, { useEffect, useState, useRef } from 'react';
import { getSettings, saveSettings, clearAllData, exportData, importData, saveCharacter, saveSession, getSavedStories, restoreSystemData } from '../services/storageService';
import { saveSmartphoneData } from '../services/smartphoneStorage';
import { saveSocialData } from '../services/SmartphoneSocial';
import { saveChatContext } from '../services/chatContextStorage';
import { AppSettings, Character, ChatSession, SavedStory } from '../types';
import { User, Cpu, Database, AlertTriangle, Save, Check, Trash2, Globe, HardDrive, MessageSquare, Archive, FileJson, Users, X, Terminal, CheckCircle, XCircle } from 'lucide-react';
import { t } from '../services/translationService';

// Sub Components
import { ProfileSettings } from '../MainMenu/Settings/components/ProfileSettings';
import { AISettings } from '../MainMenu/Settings/components/AISettings';
import { DataSettings } from '../MainMenu/Settings/components/DataSettings';
import { LanguageSettings } from '../MainMenu/Settings/components/LanguageSettings';
import { DevSettings } from '../MainMenu/Settings/components/DevSettings';

interface SettingsPageProps {
    onSettingsChange?: () => void;
}

interface PendingImportData {
    characters: Character[];
    sessions: Record<string, ChatSession>;
    history: SavedStory[];
    settings?: AppSettings;
    smartphone?: Record<string, any>;
    social?: Record<string, any>;
    chatContext?: Record<string, any>; 
    weather?: any;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onSettingsChange }) => {
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  
  // Persist active tab state
  const [activeTab, setActiveTab] = useState<'profile' | 'ai' | 'data' | 'dev' | 'language'>(() => {
      return (localStorage.getItem('pasco_settings_active_tab') as any) || 'profile';
  });

  // Export Filename State
  const [exportName, setExportName] = useState('');

  // Import Logic States
  const [pendingImport, setPendingImport] = useState<PendingImportData | null>(null);
  const [showImportTypeModal, setShowImportTypeModal] = useState(false);
  const [showChatSelectModal, setShowChatSelectModal] = useState(false);
  const [selectedImportIds, setSelectedImportIds] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  // Nuke / Reset States
  const [showNukeModal, setShowNukeModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetProgress, setResetProgress] = useState(0); 
  
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update storage when tab changes
  useEffect(() => {
      localStorage.setItem('pasco_settings_active_tab', activeTab);
  }, [activeTab]);

  const handleSave = () => {
    saveSettings(settings);
    setIsSaved(true);
    if (onSettingsChange) onSettingsChange(); // Notify App to refresh translations
    setTimeout(() => setIsSaved(false), 2000);
  };

  const executeNuke = () => {
      setShowNukeModal(false);
      setIsResetting(true);
      setResetProgress(0);

      const interval = setInterval(() => {
          setResetProgress(prev => {
              if (prev >= 100) {
                  clearInterval(interval);
                  setTimeout(() => {
                      clearAllData();
                      localStorage.clear();
                      window.location.reload();
                  }, 500);
                  return 100;
              }
              return prev + Math.floor(Math.random() * 15) + 5;
          });
      }, 300);
  };

  const handleExport = async () => {
     await exportData(exportName);
  };

  const handleFileRead = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setIsImporting(true);
        try {
            const data = await importData(file);
            setIsImporting(false);

            if (data) {
                // Quick validation
                if (!data.characters && !data.settings && !data.history) {
                    alert("Warning: The file was read, but no recognizable data was found.");
                } else {
                    setPendingImport(data);
                    setShowImportTypeModal(true);
                }
            } else {
                alert("Failed to parse the save file. It might be corrupted or incompatible.");
            }
        } catch (error) {
            setIsImporting(false);
            console.error(error);
            alert("Critical Error reading file. Please check console for details.");
        }
    }
    e.target.value = '';
  };

  // --- IMPORT ACTIONS ---
  const importRestoreAll = () => {
      if (!pendingImport) return;
      try {
          restoreSystemData(pendingImport);
          alert("Full system restore complete. Reloading...");
          window.location.reload();
      } catch (e) {
          alert("Error during restoration. Partial data may have been loaded.");
          console.error(e);
      }
  };

  const importRestoreCharacters = () => {
      if (!pendingImport) return;
      const newChars = pendingImport.characters || [];
      if (newChars.length === 0) {
          alert("No characters found in backup.");
          return;
      }
      newChars.forEach(char => { if(char && char.id) saveCharacter(char); });
      alert(`${newChars.length} characters restored/updated successfully.`);
      setShowImportTypeModal(false);
      setPendingImport(null);
      window.location.reload();
  };

  const openChatSelection = () => {
      setShowImportTypeModal(false);
      setShowChatSelectModal(true);
      setSelectedImportIds([]); 
  };

  const toggleImportSelection = (id: string) => {
      setSelectedImportIds(prev => 
          prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      );
  };

  const executeChatRestore = () => {
      if (!pendingImport || selectedImportIds.length === 0) return;
      let restoredCount = 0;
      selectedImportIds.forEach(id => {
          // 1. Restore Character Definition
          const char = pendingImport.characters?.find(c => c && c.id === id);
          if (char) saveCharacter(char);

          // 2. Restore Chat Messages (Session)
          const session = pendingImport.sessions ? pendingImport.sessions[id] : null;
          if (session) {
              saveSession(session);
              restoredCount++;
          }

          // 3. Restore History/Stories
          const stories = pendingImport.history?.filter(h => h.characterId === id) || [];
          stories.forEach(story => {
              const localStories = getSavedStories();
              const existingIdx = localStories.findIndex(ls => ls.id === story.id);
              if (existingIdx !== -1) localStories[existingIdx] = story;
              else localStories.unshift(story);
              localStorage.setItem('pasco_saved_stories', JSON.stringify(localStories));
          });

          // 4. Restore Smartphone Data
          if (pendingImport.smartphone && pendingImport.smartphone[id]) {
              saveSmartphoneData(id, pendingImport.smartphone[id]);
          }

          // 5. Restore Social Data
          if (pendingImport.social && pendingImport.social[id]) {
              saveSocialData(id, pendingImport.social[id]);
          }

          // 6. Restore Chat Context (Location, Wardrobe, Verbosity)
          if (pendingImport.chatContext && pendingImport.chatContext[id]) {
              saveChatContext(id, pendingImport.chatContext[id]);
          }
      });
      
      alert(`Restored ${restoredCount} chat sessions, phone data, and context contexts.`);
      setShowChatSelectModal(false);
      setPendingImport(null);
      window.location.reload();
  };

  const TabButton = ({ id, icon, label }: { id: any, icon: React.ReactNode, label: string }) => (
      <button 
        onClick={() => setActiveTab(id)}
        className={`
            relative w-full flex items-center space-x-3 px-5 py-4 rounded-xl transition-all duration-300 group overflow-hidden
            ${activeTab === id ? 'bg-violet-600/10 text-violet-200 border border-violet-500/20' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-200 border border-transparent'}
        `}
      >
        <div className={`relative z-10 ${activeTab === id ? 'text-violet-400' : 'text-zinc-600 group-hover:text-zinc-400'}`}>
            {icon}
        </div>
        <span className="font-medium tracking-wide relative z-10">{label}</span>
        {activeTab === id && <div className="absolute inset-0 bg-violet-500/5 blur-md"></div>}
      </button>
  );

  return (
    <div className="h-full w-full bg-zinc-950 relative overflow-hidden">
        {/* Background Ambience */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-violet-900/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="h-full overflow-y-auto relative z-10 p-6 sm:p-12">
            <div className="max-w-5xl mx-auto">
                
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">{t('set.title')}</h1>
                    <p className="text-zinc-500 text-lg font-light">{t('set.desc')}</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-10 pb-20">
                    
                    {/* Sidebar Navigation */}
                    <div className="w-full lg:w-72 flex-shrink-0 space-y-3">
                        <TabButton id="profile" icon={<User size={20}/>} label={t('set.nav.profile')} />
                        <TabButton id="ai" icon={<Cpu size={20}/>} label={t('set.nav.ai')} />
                        <TabButton id="data" icon={<Database size={20}/>} label={t('set.nav.data')} />
                        <TabButton id="language" icon={<Globe size={20}/>} label={t('set.nav.language')} />
                        <TabButton id="dev" icon={<Terminal size={20}/>} label={t('set.nav.dev')} />
                    </div>

                    {/* Main Content Panel */}
                    <div className="flex-1 flex flex-col">
                        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden mb-8">
                            {/* Top Highlight Line */}
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

                            {activeTab === 'profile' && <ProfileSettings settings={settings} setSettings={setSettings} />}
                            {activeTab === 'ai' && <AISettings settings={settings} setSettings={setSettings} />}
                            {activeTab === 'data' && (
                                <>
                                    <DataSettings 
                                        exportName={exportName}
                                        setExportName={setExportName}
                                        handleExport={handleExport}
                                        onImportClick={() => fileInputRef.current?.click()}
                                        onNukeClick={() => setShowNukeModal(true)}
                                        isResetting={isResetting}
                                    />
                                    {isImporting && <div className="mt-2 text-xs text-blue-400 animate-pulse">Reading file... please wait.</div>}
                                    <input type="file" ref={fileInputRef} onChange={handleFileRead} className="hidden" accept=".json,.psc,.zip" />
                                </>
                            )}
                            {activeTab === 'language' && <LanguageSettings settings={settings} setSettings={setSettings} />}
                            {activeTab === 'dev' && <DevSettings settings={settings} setSettings={setSettings} />}
                        </div>

                        {activeTab !== 'data' && (
                            <div className="flex justify-end animate-fade-in-up">
                                <button 
                                    onClick={handleSave}
                                    className={`
                                        flex items-center space-x-2 px-8 py-4 rounded-2xl font-bold shadow-lg transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 text-sm uppercase tracking-wide
                                        ${isSaved ? 'bg-green-500 text-white shadow-green-900/20' : 'bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.1)]'}
                                    `}
                                >
                                    {isSaved ? <Check size={18} /> : <Save size={18} />}
                                    <span>{isSaved ? t('set.saved') : t('set.save')}</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* --- GLOBAL MODALS --- */}

        {/* FACTORY RESET CONFIRMATION MODAL */}
        {showNukeModal && (
          <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-zinc-950 border border-red-500/30 p-8 rounded-3xl w-[400px] shadow-[0_0_50px_rgba(220,38,38,0.2)] relative scale-100 flex flex-col items-center">
                  <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20 animate-pulse">
                      <AlertTriangle size={36} className="text-red-500" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-wide">Critical Warning</h3>
                  <p className="text-sm text-zinc-400 text-center mb-8 leading-relaxed">
                      You are about to <span className="text-red-400 font-bold">permanently wipe</span> all characters, conversations, and settings. This action is irreversible.
                  </p>
                  
                  <div className="flex flex-col gap-3 w-full">
                      <button 
                          onClick={executeNuke} 
                          className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-900/30 text-sm transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                      >
                          <Trash2 size={16} /> Confirm Nuke
                      </button>
                      <button 
                          onClick={() => setShowNukeModal(false)} 
                          className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-4 rounded-xl text-sm transition-colors uppercase tracking-widest"
                      >
                          Cancel
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* SYSTEM PURGE LOADING SCREEN */}
      {isResetting && (
            <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8 animate-fade-in">
                <div className="w-full max-w-md space-y-6 text-center">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/30 shadow-[0_0_30px_rgba(220,38,38,0.3)] animate-pulse">
                        <HardDrive size={40} className="text-red-500" />
                    </div>
                    
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-white tracking-widest uppercase">System Purge Initiated</h2>
                        <p className="text-sm text-red-400/80 font-mono">Wiping Memory Sectors... This cannot be undone.</p>
                    </div>

                    <div className="space-y-2 text-left bg-zinc-900/50 p-4 rounded-xl border border-red-500/10 font-mono text-xs text-red-300/70">
                        <p>> Initializing Wipe Protocol...</p>
                        <p className={resetProgress > 20 ? 'opacity-100' : 'opacity-0'}>> Unlinking Neural Pathways...</p>
                        <p className={resetProgress > 50 ? 'opacity-100' : 'opacity-0'}>> Formatting Local Storage...</p>
                        <p className={resetProgress > 80 ? 'opacity-100' : 'opacity-0'}>> Clearing Cache...</p>
                    </div>

                    <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-red-600 shadow-[0_0_10px_#dc2626] transition-all duration-300 ease-linear" 
                            style={{ width: `${resetProgress}%` }}
                        ></div>
                    </div>
                    
                    <span className="text-xs font-bold text-red-500">{resetProgress}% COMPLETE</span>
                </div>
            </div>
      )}

      {/* IMPORT TYPE SELECTION MODAL */}
      {showImportTypeModal && (
          <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-zinc-950 border border-violet-500/20 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col">
                  {/* Decorative Header */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-cyan-500 to-violet-500" />
                  
                  <div className="p-8">
                      <div className="flex justify-between items-start mb-6">
                          <div>
                              <h2 className="text-2xl font-bold text-white mb-1">{t('import.title')}</h2>
                              <p className="text-xs text-zinc-500">{t('import.desc')}</p>
                          </div>
                          <button onClick={() => { setShowImportTypeModal(false); setPendingImport(null); }} className="text-zinc-500 hover:text-white p-1">
                              <X size={24} />
                          </button>
                      </div>

                      <div className="space-y-3">
                          {/* Option 1: Restore Chat */}
                          <button 
                              onClick={openChatSelection}
                              className="w-full flex items-center p-4 bg-zinc-900/50 hover:bg-violet-900/10 border border-zinc-800 hover:border-violet-500/50 rounded-2xl group transition-all"
                          >
                              <div className="p-3 bg-violet-600/20 text-violet-400 rounded-xl group-hover:bg-violet-600 group-hover:text-white transition-colors">
                                  <MessageSquare size={24} />
                              </div>
                              <div className="ml-4 text-left">
                                  <h3 className="font-bold text-white group-hover:text-violet-300">{t('import.opt.chat')}</h3>
                                  <p className="text-[10px] text-zinc-500 leading-tight mt-1">{t('import.opt.chat_desc')}</p>
                              </div>
                          </button>

                          {/* Option 2: Restore Characters */}
                          <button 
                              onClick={importRestoreCharacters}
                              className="w-full flex items-center p-4 bg-zinc-900/50 hover:bg-cyan-900/10 border border-zinc-800 hover:border-cyan-500/50 rounded-2xl group transition-all"
                          >
                              <div className="p-3 bg-cyan-600/20 text-cyan-400 rounded-xl group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                                  <Users size={24} />
                              </div>
                              <div className="ml-4 text-left">
                                  <h3 className="font-bold text-white group-hover:text-cyan-300">{t('import.opt.char')}</h3>
                                  <p className="text-[10px] text-zinc-500 leading-tight mt-1">{t('import.opt.char_desc')}</p>
                              </div>
                          </button>

                          {/* Option 3: Restore All */}
                          <button 
                              onClick={importRestoreAll}
                              className="w-full flex items-center p-4 bg-zinc-900/50 hover:bg-emerald-900/10 border border-zinc-800 hover:border-emerald-500/50 rounded-2xl group transition-all"
                          >
                              <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                  <Archive size={24} />
                              </div>
                              <div className="ml-4 text-left">
                                  <h3 className="font-bold text-white group-hover:text-emerald-300">{t('import.opt.all')}</h3>
                                  <p className="text-[10px] text-zinc-500 leading-tight mt-1">{t('import.opt.all_desc')}</p>
                              </div>
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* CHAT SELECTION MODAL */}
      {showChatSelectModal && pendingImport && (
          <div className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[85vh]">
                  
                  {/* Header */}
                  <div className="p-6 border-b border-white/5 flex justify-between items-center">
                      <div>
                          <h2 className="text-xl font-bold text-white flex items-center gap-2">
                              <FileJson size={20} className="text-violet-400" />
                              {t('import.select.title')}
                          </h2>
                          <p className="text-xs text-zinc-500">{t('import.select.desc')}</p>
                      </div>
                      <button onClick={() => { setShowChatSelectModal(false); setPendingImport(null); }} className="text-zinc-500 hover:text-white"><X size={20} /></button>
                  </div>

                  {/* List Content */}
                  <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-black/20">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {(() => {
                              // Logic: Include Characters AND Group Sessions
                              const uniqueItems: { id: string, name: string, avatar?: string, isGroup: boolean }[] = [];
                              
                              // 1. Characters - SAFER MAPPING
                              pendingImport.characters?.forEach(c => {
                                  if (c && c.id) {
                                      uniqueItems.push({ id: c.id, name: c.name || 'Unknown', avatar: c.avatar, isGroup: false });
                                  }
                              });

                              // 2. Groups (Sessions starting with 'group_')
                              if (pendingImport.sessions) {
                                  Object.keys(pendingImport.sessions).forEach(key => {
                                      if (key.startsWith('group_')) {
                                          uniqueItems.push({ id: key, name: "Group Chat", avatar: undefined, isGroup: true });
                                      }
                                  });
                              }

                              return uniqueItems.map(item => {
                                  // NEW LOGIC: Check detection in IMPORT FILE (pendingImport), not Local Storage
                                  const importSession = pendingImport.sessions ? pendingImport.sessions[item.id] : null;
                                  const hasImportSession = importSession && importSession.messages && importSession.messages.length > 0;
                                  const hasImportHistory = pendingImport.history ? pendingImport.history.some(h => h.characterId === item.id) : false;
                                  
                                  const isDetected = hasImportSession || hasImportHistory;
                                  const isSelected = selectedImportIds.includes(item.id);

                                  return (
                                      <div 
                                          key={item.id}
                                          onClick={() => toggleImportSelection(item.id)}
                                          className={`
                                              relative p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 overflow-hidden group
                                              ${isSelected 
                                                  ? 'bg-violet-900/20 border-violet-500 shadow-[0_0_15px_rgba(124,58,237,0.1)]' 
                                                  : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900'}
                                          `}
                                      >
                                          {/* Avatar */}
                                          {item.isGroup ? (
                                              <div className="w-10 h-10 rounded-full bg-blue-900/30 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                                                  <Users size={18} />
                                              </div>
                                          ) : (
                                              <img src={item.avatar || "https://picsum.photos/50"} className="w-10 h-10 rounded-full object-cover border border-zinc-700 shrink-0" />
                                          )}

                                          <div className="flex-1 min-w-0">
                                              <h4 className={`text-sm font-bold truncate ${isSelected ? 'text-white' : 'text-zinc-300'}`}>{item.name}</h4>
                                              <div className="flex items-center gap-2 mt-1">
                                                  {isDetected ? (
                                                      <span className="flex items-center gap-1 text-[9px] bg-green-900/20 text-green-400 px-1.5 py-0.5 rounded border border-green-900/30 font-bold uppercase tracking-wider">
                                                          <CheckCircle size={8} /> {t('import.tag.detected')}
                                                      </span>
                                                  ) : (
                                                      <span className="flex items-center gap-1 text-[9px] bg-red-900/20 text-red-400 px-1.5 py-0.5 rounded border border-red-900/30 font-bold uppercase tracking-wider">
                                                          <XCircle size={8} /> {t('import.tag.undetected')}
                                                      </span>
                                                  )}
                                              </div>
                                          </div>
                                          
                                          {/* Subtle Selection Indicator (Background Glow instead of Checkbox) */}
                                          {isSelected && (
                                              <div className="absolute inset-0 bg-violet-500/5 pointer-events-none" />
                                          )}
                                      </div>
                                  );
                              });
                          })()}
                      </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="p-6 border-t border-white/5 bg-zinc-900/50 flex justify-between items-center">
                      <div className="text-xs text-zinc-500">
                          {selectedImportIds.length} threads selected
                      </div>
                      <div className="flex gap-3">
                          <button 
                              onClick={() => setSelectedImportIds([])}
                              className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
                          >
                              Clear
                          </button>
                          <button 
                              onClick={executeChatRestore}
                              disabled={selectedImportIds.length === 0}
                              className="bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold py-2 px-6 rounded-xl shadow-lg transition-all text-xs uppercase tracking-widest flex items-center gap-2"
                          >
                              {t('import.btn.restore')} <Archive size={14} />
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
