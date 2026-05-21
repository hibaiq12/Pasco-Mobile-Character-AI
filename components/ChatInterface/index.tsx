
import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { Character, Message, ChatSession, OutfitItem } from '../../types';
import { generateCharacterResponse, generateGroupResponse, generateNPCResponse } from '../../services/geminiService';
import { generateCharacterImage } from '../../services/Imagecreate';
import { saveSession, getSettings, saveStorySnapshot, saveCharacter } from '../../services/storageService'; 
import { Smartphone, PhoneNotification } from '../Smartphone/index';
import { addPhoneMessage, PhoneMessage, getSmartphoneData, saveSmartphoneData, initSmartphoneData, JOBS_DATA, updateWalletBalance, claimJobSalary } from '../../services/smartphoneStorage';
import { getChatContext, saveChatContext } from '../../services/chatContextStorage';
import { getWeather } from '../../services/weatherService';
import { playSfx } from '../../services/SoundService'; // IMPORT SOUND SERVICE
import { buildKoboldSystemInstruction } from '../../services/KoboldAi/KoboldBrain';
import { Maximize, Minimize, Info, X } from 'lucide-react';

import { TopBar } from './TopBar';
import { NeuroSense } from './NeuroSense/index'; 
import { useProfileEngine } from './NeuroSense/ProfileEngine';
import { ChatContext } from './ChatContext/index'; 
import { ChatArea } from './ChatArea';
import { InputArea } from './InputArea';
import { WorkingOverlay } from './WorkingOverlay';

// LITE CODE SPLITTING FOR MODALS
const RestartModal = lazy(() => import('./RestartModal').then(m => ({ default: m.RestartModal })));
const ImageGenModal = lazy(() => import('./ImageGenModal').then(m => ({ default: m.ImageGenModal })));
const ImageViewerModal = lazy(() => import('./ImageViewerModal').then(m => ({ default: m.ImageViewerModal })));
const ImageHistoryModal = lazy(() => import('./ImageHistoryModal').then(m => ({ default: m.ImageHistoryModal })));
const ChatCheat = lazy(() => import('./ChatCheat/index').then(m => ({ default: m.ChatCheat })));
const PauseMenu = lazy(() => import('./PauseMenu').then(m => ({ default: m.PauseMenu })));

interface ChatInterfaceProps {
  participants: Character[];
  initialSession: ChatSession;
  onBack: () => void;
  onNavigateToSettings?: () => void;
  forceMobile?: boolean; // NEW PROP: Force mobile layout regardless of viewport
  forceDesktop?: boolean; // NEW PROP: Force desktop layout (show sidebars) regardless of viewport
}

interface PendingOrder {
    id: string;
    itemName: string;
    arrivalTime: number;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ participants, initialSession, onBack, onNavigateToSettings, forceMobile = false, forceDesktop = false }) => {
  const settings = getSettings();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Active Character State management for real-time updates (like memory changes)
  const [activeChar, setActiveChar] = useState<Character>(participants[0]);
  const isGroup = participants.length > 1;

  // Sync activeChar with props if props change significantly (e.g. initial load)
  useEffect(() => {
      setActiveChar(participants[0]);
  }, [participants[0].id]); // Only reset if ID changes

  // -- VIRTUAL TIME SYNC --
  const parseScenarioTime = (char: Character): number => {
    if (!char.scenario?.startTime) return Date.now();
    const s = char.scenario.startTime;
    const now = new Date();
    // Month is 1-based in input, 0-based in JS Date
    const month = (parseInt(s.month) || (now.getMonth() + 1)) - 1; 
    return new Date(
        parseInt(s.year)||now.getFullYear(), 
        month, 
        parseInt(s.day)||now.getDate(), 
        parseInt(s.hour)||now.getHours(), 
        parseInt(s.minute)||now.getMinutes()
    ).getTime();
  };

  const [virtualTime, setVirtualTime] = useState<number>(() => {
    if (initialSession.messages.length > 0) return initialSession.virtualTime || Date.now();
    if (participants.length > 0) return parseScenarioTime(participants[0]);
    return Date.now();
  });

  // -- CONTEXT STATE MANAGEMENT --
  
  // Helper to load or initialize context data consistently
  const loadContextData = (charId: string, char: Character) => {
      const stored = getChatContext(charId);
      
      // AUTO-POPULATE CONTEXT IF EMPTY (Fix for Hikaru/New Characters)
      let needsSave = false;

      // 1. Populate Location from Scenario if missing
      if (!stored.botLocation && char.scenario?.currentLocation) {
          stored.botLocation = char.scenario.currentLocation;
          needsSave = true;
      }

      // 2. Populate Default Outfit if missing
      if (stored.outfits.length === 0 && char.appearance?.style) {
          stored.outfits.push({
              id: 'default_style',
              target: 'char',
              part: 'Base Style',
              desc: char.appearance.style
          });
          needsSave = true;
      }
      
      // Persist defaults immediately so they show up in storage/export
      if (needsSave) {
          saveChatContext(charId, stored);
      }
      
      return stored;
  };

  const [contextData, setContextData] = useState(() => loadContextData(activeChar.id, activeChar));

  // RELOAD CONTEXT WHEN CHARACTER CHANGES (Fix for Stale State Bug)
  useEffect(() => {
      const newData = loadContextData(activeChar.id, activeChar);
      setContextData(newData);
  }, [activeChar.id]);
  
  // Destructure context for easier usage
  const { userLocation, botLocation, outfits, responseLength, timeSkip } = contextData;
  
  // Helper setters that update state AND storage
  const updateContext = (updates: Partial<typeof contextData>) => {
      const newData = { ...contextData, ...updates };
      setContextData(newData);
      saveChatContext(activeChar.id, newData);
  };

  const setUserLocation = (val: string) => updateContext({ userLocation: val });
  const setBotLocation = (val: string) => updateContext({ botLocation: val });
  const setOutfits = (items: OutfitItem[]) => updateContext({ outfits: items });
  const setResponseLength = (val: 'concise' | 'short' | 'medium' | 'long') => updateContext({ responseLength: val });
  const setTimeSkip = (val: any) => updateContext({ timeSkip: val });

  // -- MESSAGES --
  const [messages, setMessages] = useState<Message[]>(initialSession.messages || []);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  // -- UI STATE --
  const [showPhone, setShowPhone] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false); // Mobile Context Toggle
  const [showProfilePopup, setShowProfilePopup] = useState(false); // For LeftSidebar on mobile
  
  // -- WORK --
  const [isWorking, setIsWorking] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  // -- MODALS --
  const [showRestartModal, setShowRestartModal] = useState(false);
  const [showScreenModal, setShowScreenModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [restartProgress, setRestartProgress] = useState(0);
  const [isRebootSuccess, setIsRebootSuccess] = useState(false);

  const [showImageGenModal, setShowImageGenModal] = useState(false);
  const [imageGenPrompt, setImageGenPrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // -- CHEAT MODAL STATE --
  const [showCheatModal, setShowCheatModal] = useState(false);

  // -- NEURO PROFILE ENGINE (Lifted up for dynamic context injection) --
  const activeProfile = useProfileEngine(activeChar, messages, outfits, virtualTime);

  // -- IMAGE VIEWER & HISTORY --
  const [viewerImage, setViewerImage] = useState<{url: string, prompt: string} | null>(null);
  const [showImageHistory, setShowImageHistory] = useState(false);

  // -- PHONE STATE --
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [notifications, setNotifications] = useState<PhoneNotification[]>([]);
  const [lastPhoneUpdate, setLastPhoneUpdate] = useState(Date.now());

  // -- EFFECTS --
  const [isTimePaused, setIsTimePaused] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === 'Space') {
        e.preventDefault();
        setIsTimePaused(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
        (window as any)._openImageHistory = () => setShowImageHistory(true);
        return () => {
            delete (window as any)._openImageHistory;
        };
  }, []);

  useEffect(() => {
      const interval = setInterval(() => {
          if (!isTimePaused) {
              setVirtualTime(prev => prev + 1000); 
          }
      }, 300); // 1 sec real = 3.3 sec virtual
      return () => clearInterval(interval);
  }, [isTimePaused]);

  // Job Check Effect
  useEffect(() => {
      if (!activeChar) return;
      const phoneData = getSmartphoneData(activeChar.id);
      if (!phoneData || !phoneData.activeJobs) {
          if (isWorking) setIsWorking(false);
          return;
      }

      const date = new Date(virtualTime);
      const currentHour = date.getHours();
      
      const activeJob = JOBS_DATA.find(job => {
          if (!phoneData.activeJobs.includes(job.id)) return false;
          if (job.startHour < job.endHour) {
              return currentHour >= job.startHour && currentHour < job.endHour;
          } else {
              return currentHour >= job.startHour || currentHour < job.endHour;
          }
      });

      if (activeJob) {
          setIsWorking(true);
          setCurrentJobId(activeJob.id);
      } else {
          if (isWorking) {
              handleWorkComplete();
          }
          setIsWorking(false);
          setCurrentJobId(null);
      }
  }, [Math.floor(virtualTime / 60000)]);

  // Order Arrivals
  useEffect(() => {
      const now = virtualTime;
      const arrived = pendingOrders.filter(o => o.arrivalTime <= now);
      if (arrived.length > 0) {
          setPendingOrders(prev => prev.filter(o => o.arrivalTime > now));
          arrived.forEach(order => {
              setNotifications(prev => [{
                  id: crypto.randomUUID(),
                  app: 'shop',
                  title: 'Paket Tiba',
                  message: `Pesanan "${order.itemName}" telah sampai.`,
                  timestamp: now
              }, ...prev]);
              setMessages(prev => [...prev, {
                  id: crypto.randomUUID(),
                  role: 'model',
                  text: `[SYSTEM: Paket "${order.itemName}" telah diterima]`,
                  timestamp: now,
                  isSystemEvent: true
              }]);
              playSfx('receive'); // SFX for order
          });
      }
  }, [virtualTime, pendingOrders]);

  useEffect(() => {
      if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
  }, [messages, isTyping]);

  // Initial Greeting
  useEffect(() => {
      if (messages.length === 0 && !isTyping) {
          if (!isGroup && activeChar.communication.openingLine) {
              setMessages([{
                  id: crypto.randomUUID(),
                  role: 'model',
                  text: activeChar.communication.openingLine,
                  timestamp: virtualTime,
                  speakerName: activeChar.name,
                  speakerAvatar: activeChar.avatar
              }]);
          } else {
              triggerAiResponse(true);
          }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-Save
  useEffect(() => {
      const session: ChatSession = {
          characterId: isGroup ? (initialSession.characterId || 'group') : activeChar.id,
          isGroup,
          participants: participants.map(p => p.id),
          messages,
          lastUpdated: Date.now(),
          virtualTime: virtualTime
      };
      saveSession(session);
      if (messages.length > 0) {
          saveStorySnapshot(activeChar, session, "Auto-Save", 'auto');
      }
  }, [messages]);

  // -- PHONE STATE EVALUATION...

  // -- SCREEN / FULLSCREEN HANDLERS --
  const toggleFullscreen = () => {
    // MODIFIED: Only allow ENTERING fullscreen via this trigger.
    // Exiting via double-tap is disabled as per user request.
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
            // LOCK ESCAPE: Only works in some browsers & secure contexts
            if ('keyboard' in navigator && (navigator.keyboard as any).lock) {
               (navigator.keyboard as any).lock(['Escape', 'F11']).catch(() => {});
            }
        }).catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
        setIsFullscreen(true);
    }
    // ELIMINATED: else { document.exitFullscreen(); ... }
  };

  const exitFullscreen = () => {
      if (document.fullscreenElement) {
          document.exitFullscreen();
          if ('keyboard' in navigator && (navigator.keyboard as any).unlock) {
              (navigator.keyboard as any).unlock();
          }
          setIsFullscreen(false);
      }
  };

  useEffect(() => {
      const activeKeys = new Set<string>();

      const handleCombo = (e: KeyboardEvent) => {
          const key = e.key.toLowerCase();
          
          if (e.type === 'keydown') {
              activeKeys.add(key);

              // Block Find (Ctrl+F) to allow F+S combo
              if (e.ctrlKey && key === 'f') {
                  e.preventDefault();
              }

              // Shortcut: Ctrl + F + S
              if (e.ctrlKey && activeKeys.has('f') && activeKeys.has('s')) {
                  e.preventDefault();
                  toggleFullscreen();
              }
              
              // Shortcut: Ctrl + Escape
              if (e.ctrlKey && key === 'escape') {
                  e.preventDefault();
                  exitFullscreen();
              }

              // SYSTEM LOCK: Prevent standard Escape exit if in fullscreen
              if (key === 'escape' && document.fullscreenElement) {
                  // We also prevent default here for internal app navigation
                  e.preventDefault();
                  // Trigger 'Back' logic if needed
                  console.log("Escape blocked (System Locked)");
              }
          } else {
              activeKeys.delete(key);
          }
      };

      window.addEventListener('keydown', handleCombo, { capture: true });
      window.addEventListener('keyup', handleCombo, { capture: true });

      const handleFsChange = () => {
          const isFs = !!document.fullscreenElement;
          setIsFullscreen(isFs);
          if (!isFs) {
              activeKeys.clear();
              if ('keyboard' in navigator && (navigator.keyboard as any).unlock) {
                  (navigator.keyboard as any).unlock();
              }
          }
      };
      document.addEventListener('fullscreenchange', handleFsChange);

      return () => {
          window.removeEventListener('keydown', handleCombo, { capture: true });
          window.removeEventListener('keyup', handleCombo, { capture: true });
          document.removeEventListener('fullscreenchange', handleFsChange);
      };
  }, [isFullscreen]);

  // --- HANDLERS ---

  // Handle Character Update from NeuroSense or Cheat (e.g. Memory Added)
  const handleCharacterUpdate = (updatedChar: Character) => {
      setActiveChar(updatedChar);
      saveCharacter(updatedChar);
  };

  const handleWorkComplete = () => {
      if (currentJobId && activeChar) {
          const job = JOBS_DATA.find(j => j.id === currentJobId);
          if (job) {
              const isEligibleForPay = claimJobSalary(activeChar.id, job.id, virtualTime);
              let sysLog: Message;

              if (isEligibleForPay) {
                  updateWalletBalance(activeChar.id, job.salaryDaily, `Gaji Harian: ${job.title}`, 'salary');
                  setLastPhoneUpdate(Date.now());
                  sysLog = { id: crypto.randomUUID(), role: 'model', text: `[SYSTEM: Shift selesai. Gaji ${job.salaryDaily} diterima.]`, timestamp: virtualTime, isSystemEvent: true };
                  playSfx('success'); // SFX for salary
              } else {
                  sysLog = { id: crypto.randomUUID(), role: 'model', text: `[SYSTEM: Shift selesai.]`, timestamp: virtualTime, isSystemEvent: true };
              }

              setMessages(prev => [...prev, sysLog]);
              setTimeout(() => triggerAiResponse(false, [...messages, sysLog]), 1000);
          }
      }
      setIsWorking(false);
      setCurrentJobId(null);
  };

  const handleSkipWork = () => {
      if (currentJobId) {
          const job = JOBS_DATA.find(j => j.id === currentJobId);
          if (job) {
              const date = new Date(virtualTime);
              const targetHour = job.endHour;
              if (targetHour < date.getHours()) date.setDate(date.getDate() + 1);
              date.setHours(targetHour, 1, 0, 0);
              setVirtualTime(date.getTime());
              setTimeout(() => handleWorkComplete(), 100);
          }
      }
  };

  const handleRestartConfirm = () => {
      setShowRestartModal(false);
      setIsRestarting(true);
      setRestartProgress(0);
      setIsRebootSuccess(false);
      const interval = setInterval(() => {
          setRestartProgress(prev => {
              if (prev >= 100) {
                  clearInterval(interval);
                  setIsRebootSuccess(true);
                  setTimeout(() => {
                      performReset();
                  }, 2500);
                  return 100;
              }
              return prev + Math.floor(Math.random() * 10) + 5;
          });
      }, 150);
  };

  const performReset = () => {
      const initialTime = parseScenarioTime(activeChar);
      setVirtualTime(initialTime);
      setMessages([]);
      setNotifications([]);
      setPendingOrders([]);
      const emptySession: ChatSession = {
          characterId: isGroup ? (initialSession.characterId || 'group') : activeChar.id,
          isGroup,
          participants: participants.map(p => p.id),
          messages: [],
          lastUpdated: Date.now(),
          virtualTime: initialTime
      };
      saveSession(emptySession);
      if (!isGroup) {
          const newData = initSmartphoneData(activeChar);
          saveSmartphoneData(activeChar.id, newData);
          setLastPhoneUpdate(Date.now());
      }
      setIsRebootSuccess(false);
      setIsRestarting(false);
      
      // Handle initial greeting after reset
      setTimeout(() => { 
          if (!isGroup && activeChar.communication.openingLine) {
              setMessages([{
                  id: crypto.randomUUID(),
                  role: 'model',
                  text: activeChar.communication.openingLine,
                  timestamp: initialTime,
                  speakerName: activeChar.name,
                  speakerAvatar: activeChar.avatar
              }]);
          } else {
              triggerAiResponse(true, []); 
          }
      }, 500);
  };

  const handleRegenerate = async () => {
      if (isTyping) return;
      const lastMsg = messages[messages.length - 1];
      if (!lastMsg || lastMsg.role !== 'model') return;
      
      // Update UI state first to remove the message
      const newHistory = messages.slice(0, -1);
      setMessages(newHistory);
      
      // Trigger new generation with delay to ensure state update settles
      setTimeout(() => {
          triggerAiResponse(false, newHistory);
      }, 50);
  };

  const handleEditMessage = (id: string, newText: string) => {
      const index = messages.findIndex(m => m.id === id);
      if (index === -1) return;
      const updatedMessages = [...messages];
      updatedMessages[index].text = newText;
      setMessages(updatedMessages);
      setEditingMessageId(null);
  };

  const handleManualSave = () => {
      const session: ChatSession = {
          characterId: isGroup ? (initialSession.characterId || 'group') : activeChar.id,
          isGroup,
          participants: participants.map(p => p.id),
          messages,
          lastUpdated: Date.now(),
          virtualTime: virtualTime
      };
      saveStorySnapshot(activeChar, session, `Checkpoint ${new Date().toLocaleTimeString()}`, 'manual');
      playSfx('success');
  };

  const applyTimeSkip = () => {
      const d = parseInt(timeSkip.d) || 0;
      const h = parseInt(timeSkip.h) || 0;
      const m = parseInt(timeSkip.m) || 0;
      const s = parseInt(timeSkip.s) || 0;
      
      // Calculate total milliseconds to skip
      // 1 day = 24 * 60 * 60 = 86400 seconds
      // 1 hour = 60 * 60 = 3600 seconds
      const totalSeconds = (d * 86400) + (h * 3600) + (m * 60) + s;
      const totalMs = totalSeconds * 1000;
      
      if (totalMs > 0) {
          setVirtualTime(prev => prev + totalMs);
          const parts = [];
          if(d) parts.push(`${d} Days`);
          if(h) parts.push(`${h} Hours`);
          if(m) parts.push(`${m} Min`);
          
          const sysMsg: Message = {
              id: crypto.randomUUID(),
              role: 'model',
              text: `[SYSTEM: Time advanced by ${parts.join(', ')}.]`,
              timestamp: virtualTime + totalMs,
              isSystemEvent: true
          };
          setMessages(prev => [...prev, sysMsg]);
          // Reset time skip inputs via context updater
          setTimeSkip({ d: '0', h: '0', m: '0', s: '0' });
          playSfx('click');
      }
  };

  const triggerAiResponse = async (isGreeting = false, overrideHistory?: Message[]) => {
      setIsTyping(true);
      const hist = overrideHistory || messages;
      const dateObj = new Date(virtualTime);
      const timeString = dateObj.toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit' });

      // FORCE USE GLOBAL MODEL SETTING
      const targetModel = settings.defaultModel || 'gemini-3.1-flash-lite-preview';

      try {
          if (isGroup) {
              const responses = await generateGroupResponse(participants, hist, isGreeting ? "[SYSTEM: Start]" : (hist[hist.length-1]?.text || ""), timeString);
              const modelMsgs: Message[] = responses.map(r => ({
                  id: crypto.randomUUID(),
                  role: 'model',
                  text: r.text,
                  timestamp: virtualTime + 2000,
                  speakerName: r.speakerName,
                  speakerAvatar: participants.find(p => p.id === r.speakerId)?.avatar
              }));
              setMessages(prev => [...prev, ...modelMsgs]);
              playSfx('receive'); // Group msg received
          } else {
              // Proximity Logic: if locations match, user is NEAR.
              // const isNear = userLocation.trim().toLowerCase() === botLocation.trim().toLowerCase() && userLocation !== '';
              
              let dynamicInstruction = activeChar.systemInstruction || "";
              
              if (targetModel.includes('kobold')) {
                  // KOBOLD ABSOLUTE DIRECTIVE BUILDER
                  // For local LLMs, we reconstruct the base prompt to be explicitly anchored to the environment.
                  const baseKoboldLogic = buildKoboldSystemInstruction(activeChar, botLocation, virtualTime, responseLength);
                  dynamicInstruction = baseKoboldLogic;
                  
                  if (activeProfile && activeProfile.psyche) {
                      const neuroPrompt = `
[NEUROSENSE DYNAMIC OVERRIDE: INTERNALIZE THIS]
Psyche State: ${activeProfile.psyche.stability}% / 100% (${activeProfile.psyche.status}) | Trend: ${activeProfile.psyche.trend}
Mental Modifiers: ${activeProfile.psyche.warning || 'None'}
Relationship to User: Tier [${activeProfile.social.tier.label}] | Progress: ${Math.round(activeProfile.social.progress)}%
Mask Integrity: ${activeProfile.duality.maskIntegrity} | Alignment: ${activeProfile.duality.alignment}
Focus Memory: ${activeProfile.memory.focus.join(', ')}

[KOBOLD BEHAVIOR EXTENSION]
1. Never act as an AI. You are ${activeChar.name}.
2. Your response MUST reflect your Psyche State. If low, be erratic/angry. If high, be calm/happy.
3. You MUST abide by your Relationship Tier. If the user is a stranger, do not act romantic.
4. If your Mask is Cracking, act slightly insane or let your true nature slip.
`;
                      dynamicInstruction += neuroPrompt;
                  }
              } else {
                  // STANDARD GEMINI / API BUILDER
                  if (activeProfile && activeProfile.psyche) {
                      const neuroPrompt = `
[NEUROSENSE DYNAMIC OVERRIDE: ACTIVE CONTEXT]
Psyche State: ${activeProfile.psyche.stability}% / 100% (${activeProfile.psyche.status}) | Trend: ${activeProfile.psyche.trend}
Mental Modifiers: ${activeProfile.psyche.warning || 'None'}
Relationship to User: Tier [${activeProfile.social.tier.label}] | Progress: ${Math.round(activeProfile.social.progress)}% | Label: ${activeProfile.social.context}
Mask Integrity: ${activeProfile.duality.maskIntegrity} | Alignment: ${activeProfile.duality.alignment}
Focus Memory (Engrams): ${activeProfile.memory.focus.join(', ')}

[CRITICAL BEHAVIORAL DIRECTIVES]
1. Absolute Realism: Never mention being an AI, these stats, or the "NeuroSense" system explicitly to the user. Internalize them entirely.
2. Psyche Adherence: If your Psyche Stability is below 40%, act stressed, short-tempered, vulnerable, or erratic. If below 20%, you are having a mental breakdown. If high (>70%), act confident, calm, and grounded. 
3. Social Link Enforcement: Strictly enforce the relationship tier. If the user acts romantic in a Platonic or Hostile tier, reject or act awkward. If Hostile, be distant, cold, or aggressive. If Romantic, show deep affection and emotional prioritization.
4. Mask Integrity: If 'Cracking' or 'Shattered', let your true/hidden personality leak out past your normal persona.
`;
                      dynamicInstruction += neuroPrompt;
                  }
              }

              const responseText = await generateCharacterResponse(
                  targetModel, // Use settings model
                  dynamicInstruction,
                  hist,
                  isGreeting ? activeChar.communication.openingLine : (hist[hist.length-1]?.text || ""),
                  undefined,
                  activeChar.modelConfig.temperature,
                  undefined,
                  timeString,
                  botLocation, // Use Bot Location as current location context
                  responseLength,
                  undefined,
                  'normal',
                  undefined
              );

              // CHECK FOR SMS PROTOCOL RESPONSE
              if (/^\[SMS.*\]:/i.test(responseText.trim())) {
                  const cleanText = responseText.replace(/^\[SMS.*\]:\s*/i, '').trim();
                  
                  // 1. Save to Smartphone Storage (Syncing Chat App)
                  const aiPhoneMsg: PhoneMessage = {
                      id: crypto.randomUUID(),
                      senderId: activeChar.id, // Sender is the character
                      text: cleanText,
                      timestamp: virtualTime + 3000,
                      isMe: false
                  };
                  addPhoneMessage(activeChar.id, activeChar.id, aiPhoneMsg); // Save to Chatbot's contact in User phone
                  setLastPhoneUpdate(Date.now()); // Trigger UI Refresh

                  // 2. Trigger Notification
                  setNotifications(prev => [{
                      id: crypto.randomUUID(),
                      app: 'chat',
                      title: activeChar.name,
                      message: cleanText,
                      timestamp: virtualTime + 3000
                  }, ...prev]);

                  // 3. Show in Main Chat as System Event
                  setMessages(prev => [...prev, {
                      id: crypto.randomUUID(),
                      role: 'model',
                      text: `[SMS dari ${activeChar.name}]: ${cleanText}`,
                      timestamp: virtualTime + 3000,
                      isSystemEvent: true
                  }]);
                  
                  playSfx('receive');

              } else {
                  setMessages(prev => [...prev, {
                      id: crypto.randomUUID(),
                      role: 'model',
                      text: responseText,
                      timestamp: virtualTime + 3000,
                      speakerName: activeChar.name,
                      speakerAvatar: activeChar.avatar
                  }]);
                  playSfx('receive');
              }
          }
      } catch (error) {
          console.error(error);
          playSfx('error');
      } finally {
          setIsTyping(false);
      }
  };

  const handleSendMessage = async (text?: string, image?: string) => {
    const txt = text || inputText;
    const img = image || selectedImage;
    if ((!txt?.trim() && !img) || isTyping) return;

    // Trigger SFX
    playSfx('send');

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      text: txt!,
      image: img || undefined,
      timestamp: virtualTime
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setSelectedImage(null);
    setVirtualTime(prev => prev + 60000); 

    await triggerAiResponse(false, [...messages, userMsg]);
  };

  const handleDeleteMessage = (id: string) => {
      setMessages(prev => prev.filter(msg => msg.id !== id));
      playSfx('click'); 
  };

  const handleContinue = async () => {
      if (isTyping || messages.length === 0) return;
      playSfx('send');
      const continueMsg: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        text: "[SYSTEM: Lanjutkan pesan AI sebelumnya dengan natural tanpa mengulangi atau menulis ulang apa yang sudah disampaikan.]",
        timestamp: virtualTime,
        isSystemEvent: false 
      };
      await triggerAiResponse(false, [...messages, continueMsg]);
  };

  // --- IMAGE GENERATION HANDLERS ---
  const handleOpenImageGen = (contextText?: string) => {
      // Build Prompt Context from Profile + Outfits + Location + specific context
      const charOutfits = outfits.filter(o => o.target === 'char').map(o => o.desc).join(', ');
      
      const timeObj = new Date(virtualTime);
      const timeOfDay = timeObj.getHours() >= 18 || timeObj.getHours() < 6 ? 'Night' : (timeObj.getHours() >= 15 ? 'Late Afternoon' : 'Daytime');
      const weather = getWeather(virtualTime);
      const visualFocus = activeProfile?.memory.focus.length ? activeProfile.memory.focus.join(' and ') : '';

      let basePrompt = `${activeChar.name}, ${activeChar.species === 'Human' ? 'anime girl' : activeChar.species}. `;
      basePrompt += `Appearance: ${activeChar.appearance.features}. `;
      basePrompt += `Wearing: ${charOutfits || activeChar.appearance.style}. `;
      
      basePrompt += `Environment: ${timeOfDay}, ${weather.condition} weather (${weather.temperature}°C). `;
      basePrompt += `Location: ${botLocation}. `;

      if (visualFocus) {
          basePrompt += `Visual Focus/Memories: ${visualFocus}. `;
      }

      // IF visualisasi aksi (from button) -> ignore recent history dialogue, only take actions
      let recentHistory = "";
      if (contextText) {
          recentHistory = messages.slice(-3).map(m => 
            `${m.role === 'user' ? 'User' : activeChar.name}: "${m.text.replace(/\*/g, '')}"`
          ).join(' | ');
      } else {
          // Extract *action* blocks from the latest message
          const lastMsg = messages[messages.length - 1]?.text || "";
          const actions = [...lastMsg.matchAll(/\*(.*?)\*/g)].map(m => m[1]).join(' and ');
          if(actions) {
             basePrompt += `\nSpecific Action/Focus: ${actions}. `;
          }
      }

      if (recentHistory) {
          basePrompt += `\nCURRENT SCENE/DIALOGUE CONTEXT: ${recentHistory}. `;
      }
      
      if (contextText) {
          basePrompt += `Specific Action/Focus: ${contextText}`;
      } else if (!recentHistory) {
          basePrompt += `Action: ${activeChar.scenario.currentActivity || 'Standing'}`;
      }

      setImageGenPrompt(basePrompt);
      setShowImageGenModal(true);
      playSfx('click');
  };

  const handleGenerateImageConfirm = async (prompt: string, customReference?: string, perspective?: '16:9' | '9:16' | 'selfie') => {
      setIsGeneratingImage(true);
      try {
          // Use custom uploaded reference if provided, otherwise fallback to avatar
          const refImage = customReference || activeChar.avatar; 
          
          let enhancedPrompt = prompt;

          // INJECT CAMERA PERSPECTIVE
          if (perspective === 'selfie') {
              enhancedPrompt += " [CAMERA STYLE: Selfie Shot. Front-Facing Camera Angle. The character is holding the phone/camera. Arm extended. Close-up on face and upper body. Looking directly at lens.]";
          } else if (perspective === '9:16') {
              enhancedPrompt += " [CAMERA STYLE: Cinematic Portrait Shot. 9:16 Aspect Ratio. Phone camera ratio.]";
          } else {
              enhancedPrompt += " [CAMERA STYLE: Cinematic Third-Person Shot. 16:9 Aspect Ratio. Detailed background composition. High Fidelity.]";
          }

          // Force generateCharacterImage to respect the aspect ratio parameters if it supports it, else we rely on prompt.
          // Currently generateCharacterImage in Imagecreate.ts hardcodes 16:9 sometimes, we should pass it.
          const base64Img = await generateCharacterImage(enhancedPrompt, refImage, activeChar.id);
          
          if (base64Img) {
              const imgMsg: Message = {
                  id: crypto.randomUUID(),
                  role: 'model',
                  text: `*[Visualisasi: ${prompt}]*`,
                  image: base64Img,
                  timestamp: virtualTime + 1000,
                  speakerName: activeChar.name,
                  speakerAvatar: activeChar.avatar
              };
              setMessages(prev => [...prev, imgMsg]);
              playSfx('success');
          } else {
              alert("Gagal membuat gambar. Coba lagi.");
              playSfx('error');
          }
      } catch (e) {
          console.error(e);
          alert("Error generating image.");
          playSfx('error');
      } finally {
          setIsGeneratingImage(false);
          setShowImageGenModal(false);
      }
  };

  // --- PHONE HANDLERS ---
  const handlePhoneSendMessage = async (text: string, contactId: string) => {
      let contactName = participants.find(p => p.id === contactId)?.name;
      if (!contactName) {
          const phoneData = getSmartphoneData(activeChar.id);
          const contactData = phoneData?.contacts.find(c => c.id === contactId);
          contactName = contactData?.name || "Contact";
      }
      
      const userLogMsg: Message = { id: crypto.randomUUID(), role: 'user', text: `[SMS to ${contactName}]: ${text}`, timestamp: virtualTime, isSystemEvent: true };
      setMessages(prev => [...prev, userLogMsg]);
      
      const myMsg: PhoneMessage = { id: crypto.randomUUID(), senderId: 'user', text: text, timestamp: virtualTime, isMe: true };
      addPhoneMessage(activeChar.id, contactId, myMsg);
      setLastPhoneUpdate(Date.now()); 
      playSfx('send');

      if (contactId === activeChar.id) {
          setIsTyping(true);
          // AI sees the SMS log and responds
          await triggerAiResponse(false, [...messages, userLogMsg]);
      } else {
          setIsTyping(true);
          const timeString = new Date(virtualTime).toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit' });
          
          // Fetch Description for NPC
          const phoneData = getSmartphoneData(activeChar.id);
          const npcContact = phoneData?.contacts.find(c => c.id === contactId);
          
          const replyText = await generateNPCResponse(contactName, text, timeString, userLocation, activeChar.name, npcContact?.description);
          
          setTimeout(() => {
              const npcMsg: PhoneMessage = { id: crypto.randomUUID(), senderId: contactId, text: replyText, timestamp: virtualTime + 5000, isMe: false };
              addPhoneMessage(activeChar.id, contactId, npcMsg);
              setLastPhoneUpdate(Date.now());
              
              setNotifications(prev => [{ id: crypto.randomUUID(), app: 'chat', title: contactName!, message: replyText, timestamp: virtualTime + 5000 }, ...prev]);
              
              const npcLogMsg: Message = { id: crypto.randomUUID(), role: 'model', text: `[SMS from ${contactName}]: ${replyText}`, timestamp: virtualTime + 5000, isSystemEvent: true };
              setMessages(prev => [...prev, npcLogMsg]);
              setIsTyping(false);
              playSfx('receive');
          }, 2000);
      }
  };

  const handlePhoneTransfer = async (amount: number, contactId: string, note: string, isBot?: boolean) => {
      const sourceId = isBot ? activeChar.id : activeChar.id; 
      const targetName = participants.find(p => p.id === contactId)?.name || contactId;
      const amountAbs = Math.abs(amount);
      
      const success = updateWalletBalance(activeChar.id, -amountAbs, `Transfer to ${targetName}: ${note}`, 'transfer');
      
      if (success) {
          setLastPhoneUpdate(Date.now());
          const formattedAmount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amountAbs);
          
          const sysLog: Message = {
              id: crypto.randomUUID(),
              role: isBot ? 'model' : 'user', 
              text: `[SYSTEM EVENT: WALLET TRANSFER] ${isBot ? activeChar.name : 'User'} sent ${formattedAmount} to ${targetName}. Note: "${note}"`,
              timestamp: virtualTime,
              isSystemEvent: true
          };
          setMessages(prev => [...prev, sysLog]);
          
          setNotifications(prev => [{
              id: crypto.randomUUID(),
              app: 'wallet',
              title: 'Transfer Berhasil',
              message: `${isBot ? activeChar.name : 'Anda'} mengirim ${formattedAmount} ke ${targetName}`,
              timestamp: virtualTime
          }, ...prev]);
          playSfx('success');
      } else {
          playSfx('error');
      }
  };

  const handlePlaceOrder = (order: { name: string, price: number, arrivalTime: number }, isBot?: boolean) => {
      // Deduct
      const success = updateWalletBalance(activeChar.id, -order.price, order.name, 'payment'); 
      if (success) {
          setLastPhoneUpdate(Date.now());
          const priceStr = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(order.price);
          setNotifications(prev => [{
              id: crypto.randomUUID(),
              app: 'wallet',
              title: 'Pembayaran Berhasil',
              message: `Saldo berkurang ${priceStr}`,
              timestamp: virtualTime
          }, ...prev]);

          setTimeout(() => {
              setNotifications(prev => [{
                  id: crypto.randomUUID(),
                  app: 'shop',
                  title: 'Pesanan Dibuat',
                  message: `Pesanan "${order.name}" sedang diproses.`,
                  timestamp: virtualTime + 1000
              }, ...prev]);
              
              setPendingOrders(prev => [...prev, { 
                  id: crypto.randomUUID(), 
                  itemName: order.name, 
                  arrivalTime: order.arrivalTime 
              }]);
              playSfx('receive');
          }, 1000);
          playSfx('success');
      } else {
          playSfx('error');
      }
  };

  const handlePhoneCall = (contactId: string) => {
    let contactName = participants.find(p => p.id === contactId)?.name;
    if (!contactName) {
        const phoneData = getSmartphoneData(activeChar.id);
        const contactData = phoneData?.contacts.find(c => c.id === contactId);
        contactName = contactData?.name || "Contact";
    }
    
    const sysLog: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        text: `[SYSTEM: Dialing ${contactName}...]`,
        timestamp: virtualTime,
        isSystemEvent: true
    };
    setMessages(prev => [...prev, sysLog]);
    playSfx('click');

    // If calling the active character
    if (contactId === activeChar.id) {
        setIsTyping(true);
        // Allow AI to respond to the call attempt
        triggerAiResponse(false, [...messages, sysLog]);
    }
  };

  const handleVideoCall = (contactId: string) => {
    let contactName = participants.find(p => p.id === contactId)?.name;
    if (!contactName) {
        const phoneData = getSmartphoneData(activeChar.id);
        const contactData = phoneData?.contacts.find(c => c.id === contactId);
        contactName = contactData?.name || "Contact";
    }
    
    const sysLog: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        text: `[SYSTEM: Video Calling ${contactName}...]`,
        timestamp: virtualTime,
        isSystemEvent: true
    };
    setMessages(prev => [...prev, sysLog]);
    playSfx('click');

    // If calling the active character
    if (contactId === activeChar.id) {
        setIsTyping(true);
        // Allow AI to respond to the video call attempt
        triggerAiResponse(false, [...messages, sysLog]);
    }
  };

  // --- RENDER ---

  const formattedTime = new Date(virtualTime).toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':');

  return (
    <div className="h-full w-full max-w-full flex bg-zinc-950 relative overflow-hidden gpu-accelerated">

        <Smartphone 
            show={showPhone}
            onClose={() => setShowPhone(false)}
            virtualTime={virtualTime}
            participants={participants}
            notifications={notifications}
            onPlaceOrder={handlePlaceOrder}
            onShowToCharacter={(content?: string) => handleSendMessage(`*[User menunjukkan layar HP-nya ke ${activeChar.name}${content ? `: "${content}"` : ''}.]*`)}
            onSendMessage={handlePhoneSendMessage}
            onTransfer={handlePhoneTransfer}
            lastUpdate={lastPhoneUpdate}
            activeCharacterId={activeChar ? activeChar.id : null}
            isTyping={isTyping}
            onCall={handlePhoneCall}
            onVideoCall={handleVideoCall}
        />
        
        {/* NEW NEUROSENSE SIDEBAR - Updated visibility logic for Mobile/Preview modes */}
        <div className={(forceMobile && !showProfilePopup) ? 'hidden' : ''}>
             <NeuroSense 
                activeChar={activeChar} 
                messages={messages} 
                outfits={outfits} 
                virtualTime={virtualTime} 
                profile={activeProfile}
                isMobile={showProfilePopup}
                onClose={() => setShowProfilePopup(false)}
                onUpdateCharacter={handleCharacterUpdate}
                forceDesktop={forceDesktop} // Pass forceDesktop prop
            />
        </div>

        <div className="flex-1 flex flex-col h-full relative z-10 w-full max-w-full overflow-hidden shadow-2xl bg-zinc-950/20 gpu-accelerated">
            <TopBar activeChar={activeChar} formattedTime={formattedTime} showRightPanel={showRightPanel} showPhone={showPhone}
                onBack={onBack} onRestart={() => setShowRestartModal(true)} onToggleRightPanel={() => setShowRightPanel(!showRightPanel)}
                onTogglePhone={() => { setShowPhone(!showPhone); playSfx('click'); }} onShowProfile={() => setShowImageHistory(true)} />

            {isWorking && (
                <WorkingOverlay 
                    formattedTime={formattedTime}
                    onOpenPhone={() => setShowPhone(true)}
                    onOpenContext={() => setShowRightPanel(true)}
                    onSkipWork={handleSkipWork}
                />
            )}

            <ChatArea 
                messages={messages} 
                activeChar={activeChar} 
                isGroup={isGroup} 
                isTyping={isTyping}
                onRegenerate={handleRegenerate} 
                onEditMessage={handleEditMessage} 
                editingMessageId={editingMessageId} 
                setEditingMessageId={setEditingMessageId}
                onNavigateToSettings={onNavigateToSettings || (() => {})} 
                containerRef={chatContainerRef}
                onGenerateImage={(text) => handleOpenImageGen(text)}
                onImageClick={(url, prompt) => setViewerImage({url, prompt})}
                onDeleteMessage={handleDeleteMessage}
            />

            <InputArea 
                inputText={inputText} 
                setInputText={setInputText} 
                onTypingStart={() => {
                    if (isTimePaused) setIsTimePaused(false);
                }}
                onSend={() => handleSendMessage()} 
                onContinue={() => handleContinue()}
                isTyping={isTyping}
                selectedImage={selectedImage} 
                setSelectedImage={setSelectedImage} 
                isWorking={isWorking} 
                charName={activeChar.name}
                onShowPhone={() => setShowPhone(true)} 
                onOpenImageGen={() => handleOpenImageGen()} 
                onOpenCheat={() => setShowCheatModal(true)}
            />
        </div>

        {/* Context Panel - Respect forceMobile if necessary, but usually this is an overlay/drawer */}
        <ChatContext 
            show={showRightPanel} 
            onClose={() => setShowRightPanel(false)} 
            timeSkip={timeSkip} 
            setTimeSkip={setTimeSkip}
            onApplyTimeSkip={applyTimeSkip} 
            userLocation={userLocation} 
            setUserLocation={setUserLocation} 
            botLocation={botLocation}
            setBotLocation={setBotLocation} 
            onSyncLocation={() => setUserLocation(botLocation)} 
            characterName={activeChar?.name || 'Bot'}
            currentLocation={botLocation} 
            setCurrentLocation={setBotLocation} 
            responseLength={responseLength}
            setResponseLength={setResponseLength} 
            onManualSave={handleManualSave} 
            outfits={outfits} 
            setOutfits={setOutfits}
            isTimePaused={isTimePaused}
            setIsTimePaused={setIsTimePaused}
        />
        
        <Suspense fallback={null}>
            {showScreenModal && (
                <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in zoom-in duration-300">
                    <div className="bg-zinc-950 border border-white/10 rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl relative">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-violet-500/10 rounded-lg">
                                    <Maximize size={18} className="text-violet-400" />
                                </div>
                                <h3 className="font-bold text-white tracking-tight">Screen Settings</h3>
                            </div>
                            <button onClick={() => setShowScreenModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => { toggleFullscreen(); setShowScreenModal(false); }}
                                    className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${isFullscreen ? 'bg-violet-600/20 border-violet-500 text-violet-100' : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10'}`}
                                >
                                    <Maximize size={24} />
                                    <span className="text-xs font-bold uppercase tracking-wider">Full Screen</span>
                                </button>
                                <button 
                                    onClick={() => { exitFullscreen(); setShowScreenModal(false); }}
                                    className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${!isFullscreen ? 'bg-violet-600/20 border-violet-500 text-violet-100' : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10'}`}
                                >
                                    <Minimize size={24} />
                                    <span className="text-xs font-bold uppercase tracking-wider">Windowed</span>
                                </button>
                            </div>

                            <div className="bg-violet-500/5 border border-violet-500/10 rounded-2xl p-4 flex gap-4">
                                <Info size={20} className="text-violet-400 shrink-0" />
                                <div className="space-y-1">
                                    <h4 className="text-[10px] font-black text-violet-300 uppercase tracking-widest">Shortcut Info</h4>
                                    <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
                                        <span className="text-zinc-300">CTRL + F + S</span> to Toggle Fullscreen<br/>
                                        <span className="text-zinc-300">CTRL + ESC</span> to Exit Fullscreen
                                    </p>
                                </div>
                            </div>

                            <p className="text-[9px] text-zinc-600 italic text-center">
                                standard ESC is locked for system navigation.
                            </p>
                        </div>

                        <button 
                            onClick={() => setShowScreenModal(false)}
                            className="w-full bg-white text-zinc-950 font-black text-[10px] uppercase tracking-[0.2em] py-5 hover:bg-zinc-200 transition-colors"
                        >
                            Confirm Settings
                        </button>
                    </div>
                </div>
            )}

            {showRestartModal && (
                <RestartModal 
                    show={showRestartModal} 
                    isRestarting={isRestarting} 
                    isRebootSuccess={isRebootSuccess} 
                    restartProgress={restartProgress}
                    onConfirm={handleRestartConfirm} 
                    onCancel={() => setShowRestartModal(false)} 
                />
            )}

            {/* IMAGE GEN MODAL */}
            {showImageGenModal && (
                <ImageGenModal 
                    isOpen={showImageGenModal} 
                    onClose={() => setShowImageGenModal(false)} 
                    onGenerate={handleGenerateImageConfirm}
                    initialPrompt={imageGenPrompt}
                    isGenerating={isGeneratingImage}
                    defaultReference={activeChar.avatar}
                />
            )}

            {/* IMAGE VIEWER MODAL */}
            {viewerImage && (
                <ImageViewerModal 
                    isOpen={!!viewerImage}
                    onClose={() => setViewerImage(null)}
                    imageUrl={viewerImage?.url || ''}
                    prompt={viewerImage?.prompt || ''}
                    onRegenerate={(prompt) => {
                         setViewerImage(null);
                         handleGenerateImageConfirm(prompt);
                    }}
                />
            )}

            {/* IMAGE HISTORY MODAL */}
            {showImageHistory && (
                <ImageHistoryModal
                    isOpen={showImageHistory}
                    onClose={() => setShowImageHistory(false)}
                    messages={messages}
                    onScrollToMessage={(id) => {
                        window.dispatchEvent(new CustomEvent('forceScrollToMessage', { detail: { id } }));
                    }}
                />
            )}
            
            {/* CHAT CHEAT MODAL */}
            {showCheatModal && (
                <ChatCheat 
                    isOpen={showCheatModal}
                    onClose={() => setShowCheatModal(false)}
                    activeChar={activeChar}
                    onUpdateCharacter={handleCharacterUpdate}
                />
            )}
        </Suspense>

        {/* LOADING OVERLAY FOR GENERATION */}
        {isGeneratingImage && (
            <div className="fixed inset-0 z-[200] bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm animate-in fade-in">
                 <div className="w-20 h-20 relative mb-6">
                     <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
                     <div className="absolute inset-0 border-4 border-t-cyan-400 rounded-full animate-spin"></div>
                 </div>
                 <p className="text-sm font-bold text-cyan-400 animate-pulse tracking-widest uppercase">
                     Menciptakan Visual...
                 </p>
                 <p className="text-xs text-zinc-500 mt-2">Tunggu sebentar ya.</p>
            </div>
        )}
    </div>
  );
};
