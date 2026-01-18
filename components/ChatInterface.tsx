import React, { useState, useEffect, useRef } from 'react';
import { Character, Message, ChatSession, OutfitItem } from '../types';
import { generateCharacterResponse, generateGroupResponse, generateNPCResponse } from '../services/geminiService';
import { saveSession, getSettings, saveStorySnapshot, saveCharacter } from '../services/storageService'; 
import { Smartphone, PhoneNotification } from './Smartphone/index';
import { addPhoneMessage, PhoneMessage, getSmartphoneData, saveSmartphoneData, initSmartphoneData, JOBS_DATA, updateWalletBalance, claimJobSalary } from '../services/smartphoneStorage'; 
import { Send, Image as ImageIcon, ArrowLeft, Save, RotateCw, Edit3, RefreshCw, Smartphone as SmartphoneIcon, PanelRight, X, Clock, MapPin, AlignJustify, Play, Zap, Check, Brain, Activity, Sparkles, RotateCcw, AlertTriangle, Cpu, Terminal, CheckCircle, Power, Briefcase, FastForward } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
// Added comment for fix: Pointing to the new refactored ChatContext directory's index file to avoid "not a module" error
import { ChatContext } from './ChatInterface/ChatContext/index';
import { RestartModal } from './ChatInterface/RestartModal';

interface ChatInterfaceProps {
  participants: Character[];
  initialSession: ChatSession;
  onBack: () => void;
  onNavigateToSettings?: () => void; // New Prop
}

interface PendingOrder {
    id: string;
    itemName: string;
    arrivalTime: number;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ participants, initialSession, onBack, onNavigateToSettings }) => {
  const settings = getSettings();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null); 
  
  // -- VIRTUAL TIME SYNC LOGIC --
  const parseScenarioTime = (char: Character): number => {
    if (!char.scenario?.startTime) return Date.now();
    const s = char.scenario.startTime;
    const now = new Date();
    const year = parseInt(s.year) || now.getFullYear();
    const month = (parseInt(s.month) || (now.getMonth() + 1)) - 1; 
    const day = parseInt(s.day) || now.getDate();
    const hour = parseInt(s.hour) || now.getHours();
    const minute = parseInt(s.minute) || now.getMinutes();
    return new Date(year, month, day, hour, minute).getTime();
  };

  const [virtualTime, setVirtualTime] = useState<number>(() => {
    if (initialSession.messages.length > 0) return initialSession.virtualTime || Date.now();
    if (participants.length > 0) return parseScenarioTime(participants[0]);
    return Date.now();
  });

  // -- STATE --
  const [messages, setMessages] = useState<Message[]>(initialSession.messages || []);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  
  // Sidebar & Panels
  const [showPhone, setShowPhone] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false); // Mobile Toggle
  const [showProfilePopup, setShowProfilePopup] = useState(false);

  // Working Mode State
  const [isWorking, setIsWorking] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  // Restart & Loading States
  const [showRestartModal, setShowRestartModal] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [restartProgress, setRestartProgress] = useState(0);
  const [isRebootSuccess, setIsRebootSuccess] = useState(false); // New State for Success Animation

  // Context Settings
  const [currentLocation, setCurrentLocation] = useState(participants[0]?.scenario?.currentLocation || 'Unknown');
  const [responseLength, setResponseLength] = useState<'concise' | 'short' | 'medium' | 'long'>('concise');
  
  const [timeSkip, setTimeSkip] = useState({ d: '0', h: '0', m: '0', s: '0' });

  // Missing State Definitions
  const [userLocation, setUserLocation] = useState('');
  const [botLocation, setBotLocation] = useState(participants[0]?.scenario?.currentLocation || '');
  const [outfits, setOutfits] = useState<OutfitItem[]>([]);

  // Phone Interaction State
  const [isTimePaused, setIsTimePaused] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [notifications, setNotifications] = useState<PhoneNotification[]>([]);
  const [lastPhoneUpdate, setLastPhoneUpdate] = useState(Date.now()); 

  const isGroup = participants.length > 1;
  const activeChar = participants[0];

  // -- EFFECTS --
  
  // Focus Input on Mount
  useEffect(() => {
      if (textareaRef.current) {
          textareaRef.current.focus();
      }
  }, []);

  useEffect(() => {
      if (isTimePaused) return;
      const interval = setInterval(() => {
          setVirtualTime(prev => prev + 1000); 
      }, 300);
      return () => clearInterval(interval);
  }, [isTimePaused]);

  // PERSIST SCENE CONTEXT (Location)
  // When current location changes, update the character data in storage
  useEffect(() => {
      if (!isGroup && activeChar) {
          const updatedChar: Character = {
              ...activeChar,
              scenario: {
                  ...activeChar.scenario,
                  currentLocation: currentLocation
              }
          };
          // We only save to local storage, not triggering a full app refresh unless needed
          saveCharacter(updatedChar);
      }
  }, [currentLocation]);

  // Job Check Effect (Runs every 2s virtual time tick logic)
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

  }, [Math.floor(virtualTime / 60000)]); // Check every virtual minute

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
      if (messages.length === 0 && !isTyping) {
          triggerAiResponse(true);
      }
  }, []);

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
          });
      }
  }, [virtualTime, pendingOrders]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // --- LOGIC HANDLERS ---

  const handleWorkComplete = () => {
      if (currentJobId && activeChar) {
          const job = JOBS_DATA.find(j => j.id === currentJobId);
          if (job) {
              const isEligibleForPay = claimJobSalary(activeChar.id, job.id, virtualTime);
              let sysLog: Message;

              if (isEligibleForPay) {
                  updateWalletBalance(activeChar.id, job.salaryDaily, `Gaji Harian: ${job.title}`, 'salary');
                  setLastPhoneUpdate(Date.now());
                  
                  sysLog = {
                      id: crypto.randomUUID(),
                      role: 'model',
                      text: `[SYSTEM: Shift selesai. Anda menerima gaji sebesar ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(job.salaryDaily)}.]`,
                      timestamp: virtualTime,
                      isSystemEvent: true
                  };
              } else {
                  sysLog = {
                      id: crypto.randomUUID(),
                      role: 'model',
                      text: `[SYSTEM: Shift selesai. (Gaji harian sudah diterima sebelumnya).]`,
                      timestamp: virtualTime,
                      isSystemEvent: true
                  };
              }

              setMessages(prev => [...prev, sysLog]);
              setTimeout(() => {
                  triggerAiResponse(false, [...messages, sysLog]);
              }, 1000);
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
              let targetHour = job.endHour;
              if (targetHour < date.getHours()) date.setDate(date.getDate() + 1);
              date.setHours(targetHour, 1, 0, 0);
              setVirtualTime(date.getTime());
              setTimeout(() => handleWorkComplete(), 100);
          }
      }
  };

  const triggerAiResponse = async (isGreeting = false, overrideHistory?: Message[]) => {
      setIsTyping(true);
      const hist = overrideHistory || messages;
      
      const dateObj = new Date(virtualTime);
      const timeString = dateObj.toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit' });

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
          } else {
              const responseText = await generateCharacterResponse(
                  activeChar.modelConfig.modelName,
                  activeChar.systemInstruction,
                  hist,
                  isGreeting ? activeChar.communication.openingLine : (hist[hist.length-1]?.text || ""),
                  undefined,
                  activeChar.modelConfig.temperature,
                  undefined,
                  timeString,
                  currentLocation,
                  responseLength
              );

              if (responseText.trim().startsWith('[SMS]:')) {
                  const cleanText = responseText.replace('[SMS]:', '').trim();
                  
                  const aiPhoneMsg: PhoneMessage = {
                      id: crypto.randomUUID(),
                      senderId: activeChar.id,
                      text: cleanText,
                      timestamp: virtualTime + 3000,
                      isMe: false
                  };
                  addPhoneMessage(activeChar.id, activeChar.id, aiPhoneMsg);
                  setLastPhoneUpdate(Date.now()); 

                  setNotifications(prev => [{
                      id: crypto.randomUUID(),
                      app: 'chat',
                      title: activeChar.name,
                      message: cleanText,
                      timestamp: virtualTime + 3000
                  }, ...prev]);
                  
                  setMessages(prev => [...prev, {
                      id: crypto.randomUUID(),
                      role: 'model',
                      text: `[SMS from ${activeChar.name}]: ${cleanText}`,
                      timestamp: virtualTime + 3000,
                      isSystemEvent: true
                  }]);

              } else {
                  const botMsg: Message = {
                      id: crypto.randomUUID(),
                      role: 'model',
                      text: responseText,
                      timestamp: virtualTime + 3000,
                      speakerName: activeChar.name,
                      speakerAvatar: activeChar.avatar
                  };
                  setMessages(prev => [...prev, botMsg]);
              }
          }
      } catch (error) {
          console.error(error);
      } finally {
          setIsTyping(false);
      }
  };

  const handleSendMessage = async (text?: string, image?: string) => {
    const txt = text || inputText;
    const img = image || selectedImage;
    if ((!txt?.trim() && !img) || isTyping) return;

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
    
    if (textareaRef.current) {
        textareaRef.current.focus();
    }
    
    const nextTime = virtualTime + 60000;
    setVirtualTime(nextTime); 

    await triggerAiResponse(false, [...messages, userMsg]);
  };

  // ... (Phone methods kept same)
  const handlePhoneSendMessage = async (text: string, contactId: string) => {
      let contactName = participants.find(p => p.id === contactId)?.name;
      if (!contactName) {
          const phoneData = getSmartphoneData(activeChar.id);
          const contactData = phoneData?.contacts.find(c => c.id === contactId);
          contactName = contactData?.name || "Contact";
      }
      
      const userLogMsg: Message = {
          id: crypto.randomUUID(),
          role: 'user',
          text: `[SMS to ${contactName}]: ${text}`,
          timestamp: virtualTime,
          isSystemEvent: true
      };

      const newHistory = [...messages, userLogMsg];
      setMessages(prev => [...prev, userLogMsg]);
      
      const myMsg: PhoneMessage = {
          id: crypto.randomUUID(),
          senderId: 'user',
          text: text,
          timestamp: virtualTime,
          isMe: true
      };
      addPhoneMessage(activeChar.id, contactId, myMsg);
      setLastPhoneUpdate(Date.now()); 

      if (contactId === activeChar.id) {
          setIsTyping(true);
          await triggerAiResponse(false, newHistory);
      } else {
          setIsTyping(true);
          const timeString = new Date(virtualTime).toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit' });
          const replyText = await generateNPCResponse(contactName, text, timeString, currentLocation);
          
          setTimeout(() => {
              const npcMsg: PhoneMessage = {
                  id: crypto.randomUUID(),
                  senderId: contactId,
                  text: replyText,
                  timestamp: virtualTime + 5000,
                  isMe: false
              };
              addPhoneMessage(activeChar.id, contactId, npcMsg);
              setLastPhoneUpdate(Date.now());
              
              setNotifications(prev => [{
                  id: crypto.randomUUID(),
                  app: 'chat',
                  title: contactName!,
                  message: replyText,
                  timestamp: virtualTime + 5000
              }, ...prev]);
              
              const npcLogMsg: Message = {
                  id: crypto.randomUUID(),
                  role: 'model',
                  text: `[SMS from ${contactName}]: ${replyText}`,
                  timestamp: virtualTime + 5000,
                  isSystemEvent: true
              };
              setMessages(prev => [...prev, npcLogMsg]);
              setIsTyping(false);
          }, 2000);
      }
  };

  const handlePhoneTransfer = async (amount: number, contactId: string, note: string) => {
      let contactName = participants.find(p => p.id === contactId)?.name;
      if (!contactName) {
          const phoneData = getSmartphoneData(activeChar.id);
          const contactData = phoneData?.contacts.find(c => c.id === contactId);
          contactName = contactData?.name || "Contact";
      }

      const formattedAmount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
      const transferMsg = `[SYSTEM: User mentransfer ${formattedAmount} kepada ${contactName}. Catatan: "${note || '-'}" (Saldo berkurang).]`;

      const sysLog: Message = {
          id: crypto.randomUUID(),
          role: 'user', 
          text: transferMsg,
          timestamp: virtualTime,
          isSystemEvent: true
      };

      const newHistory = [...messages, sysLog];
      setMessages(prev => [...prev, sysLog]);
      
      setNotifications(prev => [{
          id: crypto.randomUUID(),
          app: 'wallet',
          title: 'Transfer Berhasil',
          message: `Anda mengirim ${formattedAmount} ke ${contactName}`,
          timestamp: virtualTime
      }, ...prev]);

      setIsTyping(true);
      await triggerAiResponse(false, newHistory);
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

  const applyTimeSkip = () => {
      const d = parseInt(timeSkip.d) || 0;
      const h = parseInt(timeSkip.h) || 0;
      const m = parseInt(timeSkip.m) || 0;
      const s = parseInt(timeSkip.s) || 0;
      const totalMs = ((d * 24 * 360) + (h * 3600) + (m * 60) + s) * 1000;
      
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
          setTimeSkip({ d: '0', h: '0', m: '0', s: '0' });
      }
  };

  const handleShowPhone = () => {
      handleSendMessage(`*[User shows their phone screen to ${activeChar.name}.]*`);
      setShowPhone(false);
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
  };

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePlaceOrder = (order: { name: string, price: number, arrivalTime: number }) => {
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
              setPendingOrders(prev => [...prev, { id: crypto.randomUUID(), itemName: order.name, arrivalTime: order.arrivalTime }]);
          }, 1000);
      } else {
           setNotifications(prev => [{
              id: crypto.randomUUID(),
              app: 'wallet',
              title: 'Gagal Bayar',
              message: `Saldo tidak cukup.`,
              timestamp: virtualTime
          }, ...prev]);
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
      setTimeout(() => { triggerAiResponse(true); }, 500);
  };

  const renderMessageContent = (text: string, isUser: boolean) => {
      if (text.includes('||SETTINGS||')) {
          const parts = text.split('||SETTINGS||');
          return (
              <span className={`leading-relaxed ${isUser ? 'text-violet-50' : 'text-zinc-300'}`}>
                  {parts[0]}
                  <span 
                      className="text-blue-400 hover:text-blue-300 hover:underline cursor-pointer font-bold mx-1"
                      onClick={() => onNavigateToSettings?.()}
                  >
                      &lt;Settings&gt;
                  </span>
                  {parts[1]}
              </span>
          );
      }
      return (
          <div className={`markdown-content leading-relaxed ${isUser ? 'text-violet-50' : 'text-zinc-300'}`}>
             <ReactMarkdown>{text}</ReactMarkdown>
          </div>
      );
  };

  const formattedTime = new Date(virtualTime).toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':');

  return (
    <div className="h-full w-full flex bg-zinc-950 relative overflow-hidden">
        
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div 
                className="absolute inset-0 bg-cover bg-center opacity-30 blur-[80px] scale-110 transition-all duration-1000"
                style={{ backgroundImage: `url(${activeChar.avatar})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-zinc-950/70" />
        </div>

        <Smartphone 
            show={showPhone}
            onClose={() => setShowPhone(false)}
            virtualTime={virtualTime}
            participants={participants}
            notifications={notifications}
            onPlaceOrder={handlePlaceOrder}
            onShowToCharacter={handleShowPhone}
            onSendMessage={handlePhoneSendMessage}
            onTransfer={handlePhoneTransfer}
            lastUpdate={lastPhoneUpdate}
            activeCharacterId={activeChar ? activeChar.id : null}
            isTyping={isTyping}
        />

        {/* LEFT SIDEBAR (Desktop Only) */}
        <div className="hidden lg:flex w-80 flex-col border-r border-white/5 bg-zinc-950/60 backdrop-blur-xl z-10 p-6 relative shadow-2xl">
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
                <div className="relative group rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black/40">
                    <div className="aspect-[3/4] relative">
                        <img src={activeChar.avatar} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
                        <div className="absolute bottom-0 left-0 right-0 p-5">
                            <h2 className="text-2xl font-black text-white leading-none mb-1 drop-shadow-md">{activeChar.name}</h2>
                            <p className="text-xs text-zinc-400 font-medium uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></span>
                                {activeChar.role}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest border-b border-white/5 pb-2">
                        <Activity size={14} className="text-violet-500" /> Neural Status
                    </div>
                    <div className="bg-zinc-900/40 p-4 rounded-xl border border-white/5 space-y-4 backdrop-blur-sm">
                        <div>
                            <div className="flex justify-between text-[10px] font-bold text-zinc-400 mb-1.5 uppercase">
                                <span>Trust Protocol</span>
                                <span className="text-violet-400">{activeChar.socialProfile.trustFactor || 'Neutral'}</span>
                            </div>
                            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-violet-600 to-violet-400 w-[60%] shadow-[0_0_10px_#8b5cf6]"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest border-b border-white/5 pb-2">
                        <Brain size={14} className="text-rose-500" /> Core Directive
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-900/30 p-3 rounded-xl border border-white/5 font-medium">
                        "{activeChar.description}"
                    </p>
                </div>
            </div>
        </div>

        {/* MAIN CHAT AREA */}
        <div className="flex-1 flex flex-col h-full relative z-10 max-w-5xl mx-auto w-full shadow-2xl bg-zinc-950/20">
            {/* Header */}
            <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-zinc-950/80 backdrop-blur-md z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="text-zinc-400 hover:text-white transition-colors"><ArrowLeft size={20} /></button>
                    {/* Header Info - Mobile Only */}
                    <div className="flex items-center gap-3 lg:opacity-0 transition-opacity cursor-pointer lg:pointer-events-none" onClick={() => setShowProfilePopup(true)}>
                         <div className="relative lg:hidden">
                            <img src={activeChar.avatar} className="w-9 h-9 rounded-full border border-zinc-700 object-cover" />
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-zinc-950"></div>
                         </div>
                         <div className="lg:hidden">
                             <h2 className="text-sm font-bold text-white leading-tight">{activeChar.name}</h2>
                             <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                                 <Clock size={10} />
                                 <span className="bg-zinc-900 px-1.5 py-0.5 rounded text-green-400 font-bold tracking-widest">{formattedTime}</span>
                             </div>
                         </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowRestartModal(true)} className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors" title="Restart Simulation">
                        <RotateCcw size={20} />
                    </button>
                    <button onClick={() => setShowRightPanel(!showRightPanel)} className={`lg:hidden p-2 rounded-xl transition-colors ${showRightPanel ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:bg-white/10'}`}>
                        <PanelRight size={20} />
                    </button>
                    <button onClick={() => setShowPhone(!showPhone)} className={`p-2 rounded-xl transition-colors ${showPhone ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:bg-white/10'}`}>
                        <SmartphoneIcon size={20} />
                    </button>
                </div>
            </div>

            {/* Working Overlay */}
            {isWorking && (
                <div className="absolute top-16 left-0 right-0 bottom-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-center animate-fade-in p-6 border-t border-white/5">
                    <Briefcase size={48} className="text-blue-500 mb-4 animate-bounce" />
                    <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-1">Sedang Bekerja</h2>
                    <div className="text-4xl font-mono text-blue-400 mb-6">{formattedTime}</div>
                    
                    <p className="text-sm text-zinc-400 max-w-md mb-8">
                        Anda sedang dalam jam kerja. Chat interface dinonaktifkan sementara.
                    </p>

                    <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                        <button onClick={() => setShowPhone(true)} className="p-4 bg-zinc-900 border border-white/10 rounded-xl hover:bg-zinc-800 transition-colors flex flex-col items-center gap-2">
                            <SmartphoneIcon size={24} className="text-zinc-400"/>
                            <span className="text-xs font-bold text-white uppercase">Buka HP</span>
                        </button>
                        <button onClick={() => setShowRightPanel(true)} className="p-4 bg-zinc-900 border border-white/10 rounded-xl hover:bg-zinc-800 transition-colors flex flex-col items-center gap-2">
                            <Clock size={24} className="text-zinc-400"/>
                            <span className="text-xs font-bold text-white uppercase">Context</span>
                        </button>
                    </div>

                    <button 
                        onClick={handleSkipWork}
                        className="mt-8 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold uppercase tracking-widest shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all active:scale-95"
                    >
                        <FastForward size={18} fill="currentColor" /> Selesaikan Shift (Skip)
                    </button>
                </div>
            )}

            {/* Chat Body */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar scroll-smooth relative">
                <div className="max-w-3xl mx-auto w-full pb-4 space-y-6">
                     {messages.map((msg, idx) => {
                         const isUser = msg.role === 'user';
                         const msgTime = new Date(msg.timestamp).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit', hour12: false}).replace(/\./g, ':');
                         const showDate = idx === 0 || new Date(messages[idx-1].timestamp).getDate() !== new Date(msg.timestamp).getDate();
                         
                         return (
                             <React.Fragment key={msg.id}>
                                 {showDate && (
                                     <div className="flex justify-center my-6">
                                         <span className="bg-zinc-900/80 border border-white/5 text-zinc-500 text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-widest shadow-lg backdrop-blur">
                                             {new Date(msg.timestamp).toLocaleDateString('id-ID', {weekday:'long', day:'numeric', month:'long', year:'numeric'}).toUpperCase()}
                                         </span>
                                     </div>
                                 )}
                                 
                                 {msg.isSystemEvent ? (
                                     <div className="flex justify-center my-6 animate-fade-in w-full px-4">
                                         <div className="bg-zinc-900/60 backdrop-blur-md border border-violet-500/10 rounded-full py-1.5 px-4 flex items-center gap-2 shadow-sm">
                                             <Zap size={10} className="text-violet-400" />
                                             <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                                                 {msg.text.replace(/\[SYSTEM:|\]|\*/g, '').trim()}
                                             </span>
                                         </div>
                                     </div>
                                 ) : (
                                     <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group items-end gap-3 animate-fade-in`}>
                                         {!isUser && (
                                            <div className="flex-shrink-0 flex flex-col items-center gap-1">
                                                <img src={msg.speakerAvatar || activeChar.avatar} className="w-8 h-8 rounded-full border border-zinc-700 object-cover shadow-lg" />
                                            </div>
                                         )}
                                         
                                         <div className={`
                                            relative max-w-[85%] md:max-w-[75%] px-5 py-3.5 text-sm shadow-md transition-all duration-200 backdrop-blur-sm
                                            ${isUser 
                                                ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-[1.2rem] rounded-br-none shadow-violet-900/20' 
                                                : 'bg-zinc-900/80 text-zinc-200 border border-white/5 rounded-[1.2rem] rounded-bl-none shadow-black/20'
                                            }
                                         `}>
                                             <div className={`absolute -top-3 ${isUser ? 'left-0 -translate-x-2' : 'right-0 translate-x-2'} opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10`}>
                                                 {isUser ? (
                                                     <button onClick={() => setEditingMessageId(msg.id)} className="p-1.5 bg-blue-600 text-white rounded-lg shadow hover:scale-110 transition-transform"><Edit3 size={12} /></button>
                                                 ) : (
                                                     <button 
                                                        onClick={handleRegenerate} 
                                                        disabled={isTyping}
                                                        className={`p-1.5 bg-white text-black rounded-lg shadow hover:scale-110 transition-transform ${isTyping ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                     >
                                                         <RefreshCw size={12} />
                                                     </button>
                                                 )}
                                             </div>

                                             {msg.speakerName && isGroup && !isUser && (
                                                 <div className="text-[10px] font-bold text-violet-400 mb-1 uppercase tracking-wide">{msg.speakerName}</div>
                                             )}

                                             {msg.image && <img src={msg.image} className="mb-3 rounded-xl border border-white/10 w-full object-cover max-h-60" />}
                                             
                                             {editingMessageId === msg.id ? (
                                                 <div className="min-w-[200px]">
                                                     <textarea defaultValue={msg.text} className="w-full bg-black/20 text-white p-2 rounded text-sm mb-2 outline-none border border-white/10" onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEditMessage(msg.id, e.currentTarget.value); }}} />
                                                     <div className="text-[10px] text-zinc-400">Press Enter to Save</div>
                                                 </div>
                                             ) : (
                                                 renderMessageContent(msg.text, isUser)
                                             )}
                                             
                                             <div className={`flex items-center justify-end gap-1.5 mt-1.5 ${isUser ? 'opacity-70' : 'opacity-50'}`}>
                                                 <span className="text-[9px] font-mono tracking-widest">{msgTime}</span>
                                                 {isUser && <Check size={10} strokeWidth={3} />}
                                             </div>
                                         </div>
                                     </div>
                                 )}
                             </React.Fragment>
                         );
                     })}
                     
                     {isTyping && (
                         <div className="flex justify-start items-end gap-3 animate-fade-in">
                             <img src={activeChar.avatar} className="w-8 h-8 rounded-full border border-zinc-700 object-cover grayscale opacity-70" />
                             <div className="bg-zinc-900/50 border border-white/5 px-4 py-3 rounded-[1.2rem] rounded-bl-none flex gap-1 items-center backdrop-blur-sm">
                                 <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                 <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                 <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></div>
                             </div>
                         </div>
                     )}
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-6 z-20 shrink-0">
                <div className="max-w-3xl mx-auto relative bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 focus-within:border-zinc-700 rounded-[1.5rem] p-2 pl-2 flex items-end shadow-2xl transition-colors duration-300">
                    <div className="flex gap-1 mb-1.5 ml-1 text-zinc-400">
                         <button 
                            onClick={() => fileInputRef.current?.click()} 
                            className="p-2 hover:bg-zinc-800 hover:text-zinc-200 rounded-full transition-colors relative group"
                         >
                            <ImageIcon size={20} />
                         </button>
                         <button onClick={() => setShowPhone(!showPhone)} className="p-2 hover:bg-zinc-800 hover:text-zinc-200 rounded-full transition-colors hidden sm:block">
                            <SmartphoneIcon size={20} />
                         </button>
                         <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </div>

                    <textarea 
                        ref={textareaRef}
                        value={inputText} 
                        onChange={(e) => setInputText(e.target.value)} 
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} 
                        placeholder={isWorking ? "Sedang Bekerja..." : `Message ${activeChar.name}...`}
                        className="flex-1 bg-transparent text-zinc-200 placeholder-zinc-600 text-sm max-h-32 min-h-[48px] py-3.5 px-3 outline-none resize-none custom-scrollbar leading-relaxed" 
                        rows={1}
                        autoFocus
                    />

                    <button 
                        onClick={() => handleSendMessage()} 
                        disabled={!inputText.trim() && !selectedImage || isTyping} 
                        className={`
                            m-1.5 p-3 rounded-xl transition-all duration-300 shadow-lg flex items-center justify-center
                            ${(!inputText.trim() && !selectedImage) 
                                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:shadow-violet-500/25 transform active:scale-95'
                            }
                        `}
                    >
                        {isTyping ? <RotateCw size={18} className="animate-spin"/> : <Send size={18} className={inputText.trim() ? "translate-x-0.5" : ""} />}
                    </button>
                </div>
            </div>
        </div>

        <ChatContext show={showRightPanel} onClose={() => setShowRightPanel(false)} timeSkip={timeSkip} setTimeSkip={setTimeSkip}
            onApplyTimeSkip={applyTimeSkip} userLocation={userLocation} setUserLocation={setUserLocation} botLocation={botLocation}
            setBotLocation={setBotLocation} onSyncLocation={() => setUserLocation(botLocation)} characterName={activeChar?.name || 'Bot'}
            currentLocation={currentLocation} setCurrentLocation={setCurrentLocation} responseLength={responseLength}
            setResponseLength={setResponseLength} onManualSave={handleManualSave} outfits={outfits} setOutfits={setOutfits} />
        
        <RestartModal show={showRestartModal} isRestarting={isRestarting} isRebootSuccess={isRebootSuccess} restartProgress={restartProgress}
            onConfirm={handleRestartConfirm} onCancel={() => setShowRestartModal(false)} />
    </div>
  );
};
