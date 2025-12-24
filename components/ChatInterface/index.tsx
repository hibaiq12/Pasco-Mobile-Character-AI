
import React, { useState, useEffect, useRef } from 'react';
import { Character, Message, ChatSession } from '../../types';
import { generateCharacterResponse, generateGroupResponse, generateNPCResponse } from '../../services/geminiService';
import { generateCharacterImage } from '../../services/Imagecreate';
import { saveSession, getSettings, saveStorySnapshot, saveCharacter } from '../../services/storageService'; 
import { Smartphone, PhoneNotification } from '../Smartphone/index';
import { addPhoneMessage, PhoneMessage, getSmartphoneData, saveSmartphoneData, initSmartphoneData, JOBS_DATA, updateWalletBalance, claimJobSalary } from '../../services/smartphoneStorage'; 
import { getChatContext, saveChatContext } from '../../services/chatContextStorage';
import { isLocationFar } from '../../services/SmartphoneChat';
import { getWeather } from '../../services/weatherService';

import { TopBar } from './TopBar';
import { LeftSidebar } from './LeftSidebar';
import { ChatContext } from './ChatContext/index';
import { ChatArea } from './ChatArea';
import { InputArea } from './InputArea';
import { WorkingOverlay } from './WorkingOverlay';
import { RestartModal } from './RestartModal';
import { ImageGenModal } from './ImageGenModal';
import { ImageViewerModal } from './ImageViewerModal';

export interface OutfitItem {
    id: string;
    target: 'user' | 'char';
    part: string;
    desc: string;
}

interface ChatInterfaceProps {
  participants: Character[];
  initialSession: ChatSession;
  onBack: () => void;
  onNavigateToSettings?: () => void;
}

interface PendingOrder {
    id: string;
    itemName: string;
    arrivalTime: number;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ participants, initialSession, onBack, onNavigateToSettings }) => {
  const settings = getSettings();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const activeChar = participants[0];
  const isGroup = participants.length > 1;

  // -- VIRTUAL TIME SYNC --
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
  
  // UI Panels
  const [showPhone, setShowPhone] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false); // Mobile Toggle for Context
  const [showProfilePopup, setShowProfilePopup] = useState(false); // Mobile Profile

  // Context States (Synced with ChatContextStorage)
  const [userLocation, setUserLocation] = useState('');
  const [botLocation, setBotLocation] = useState('');
  const [outfits, setOutfits] = useState<OutfitItem[]>([]);
  const [responseLength, setResponseLength] = useState<'concise' | 'short' | 'medium' | 'long'>('concise');
  const [timeSkip, setTimeSkip] = useState({ d: '0', h: '0', m: '0', s: '0' });

  // Work Mode
  const [isWorking, setIsWorking] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  // Restart
  const [showRestartModal, setShowRestartModal] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [restartProgress, setRestartProgress] = useState(0);
  const [isRebootSuccess, setIsRebootSuccess] = useState(false);

  // Phone Interaction
  const [isTimePaused, setIsTimePaused] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [notifications, setNotifications] = useState<PhoneNotification[]>([]);
  const [lastPhoneUpdate, setLastPhoneUpdate] = useState(Date.now()); 

  // Image Gen
  const [showImageGen, setShowImageGen] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageGenPrompt, setImageGenPrompt] = useState('');
  const [viewingImage, setViewingImage] = useState<{ url: string; prompt: string } | null>(null);

  // -- INITIALIZATION & SYNC --

  useEffect(() => {
      // Load Context
      if (activeChar) {
          const ctx = getChatContext(activeChar.id);
          setUserLocation(ctx.userLocation || '');
          setBotLocation(ctx.botLocation || activeChar.scenario?.currentLocation || '');
          setOutfits(ctx.outfits || []);
          setResponseLength(ctx.responseLength || 'concise');
      }
  }, [activeChar.id]);

  useEffect(() => {
      // Save Context & Character Location Sync
      if (activeChar) {
          saveChatContext(activeChar.id, {
              userLocation,
              botLocation,
              outfits,
              responseLength,
              timeSkip
          });
          
          // Update character location in storage if changed
          if (botLocation && botLocation !== activeChar.scenario?.currentLocation) {
              const updatedChar = { ...activeChar, scenario: { ...activeChar.scenario, currentLocation: botLocation } };
              saveCharacter(updatedChar);
          }
      }
  }, [userLocation, botLocation, outfits, responseLength, timeSkip, activeChar]);

  useEffect(() => {
      if (isTimePaused) return;
      const interval = setInterval(() => {
          setVirtualTime(prev => prev + 1000); 
      }, 300);
      return () => clearInterval(interval);
  }, [isTimePaused]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
      if (messages.length === 0 && !isTyping) {
          triggerAiResponse(true);
      }
  }, []);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // -- LOGIC HANDLERS --

  const triggerAiResponse = async (isGreeting = false, overrideHistory?: Message[]) => {
      setIsTyping(true);
      const hist = overrideHistory || messages;
      
      const dateObj = new Date(virtualTime);
      const timeString = dateObj.toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit' });
      const weather = getWeather(virtualTime);
      const weatherStr = `${weather.condition}, ${weather.temperature}°C`;

      // Determine Communication Mode
      const isFar = isLocationFar(userLocation, botLocation);
      
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
                  botLocation, // Use Bot Location for context
                  responseLength,
                  activeChar.communication.vocabularyLevel,
                  isFar ? 'smartphone' : 'normal',
                  weatherStr
              );

              // Check for SMS prefix in response
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

  const handleSendMessage = async () => {
    if ((!inputText.trim() && !selectedImage) || isTyping) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      text: inputText,
      image: selectedImage || undefined,
      timestamp: virtualTime
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setSelectedImage(null);
    
    // Advance time slightly
    setVirtualTime(prev => prev + 60000); 

    await triggerAiResponse(false, [...messages, userMsg]);
  };

  // Phone & Jobs Logic
  useEffect(() => {
      // Job Shift Check
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
          if (isWorking) handleWorkComplete();
          setIsWorking(false);
          setCurrentJobId(null);
      }
  }, [Math.floor(virtualTime / 60000)]);

  const handleWorkComplete = () => {
      if (currentJobId && activeChar) {
          const job = JOBS_DATA.find(j => j.id === currentJobId);
          if (job) {
              const isEligible = claimJobSalary(activeChar.id, job.id, virtualTime);
              let msg = isEligible 
                  ? `[SYSTEM: Shift selesai. Anda menerima gaji sebesar ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(job.salaryDaily)}.]`
                  : `[SYSTEM: Shift selesai. (Gaji sudah diterima).]`;
              
              if (isEligible) {
                  updateWalletBalance(activeChar.id, job.salaryDaily, `Gaji: ${job.title}`, 'salary');
                  setLastPhoneUpdate(Date.now());
              }

              const sysLog: Message = {
                  id: crypto.randomUUID(),
                  role: 'model',
                  text: msg,
                  timestamp: virtualTime,
                  isSystemEvent: true
              };
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
              let targetHour = job.endHour;
              if (targetHour < date.getHours()) date.setDate(date.getDate() + 1);
              date.setHours(targetHour, 1, 0, 0);
              setVirtualTime(date.getTime());
              setTimeout(() => handleWorkComplete(), 100);
          }
      }
  };

  // Image Generation
  const handleGenerateImageConfirm = async (prompt: string, customReference?: string, perspective?: 'third_person' | 'selfie') => {
      setShowImageGen(false);
      
      // Use a unique ID for the loading message to ensure we remove the correct one later
      const loadingId = 'loading-' + Date.now();
      
      const loadingMsg: Message = {
          id: loadingId,
          role: 'model',
          text: `*[Visualizing: ${prompt}...]*`,
          timestamp: virtualTime,
          isSystemEvent: true
      };
      
      // 1. Add Loading Message
      setMessages(prev => [...prev, loadingMsg]);
      setIsGeneratingImage(true);

      // Safe access to character data
      if (!activeChar) {
          setIsGeneratingImage(false);
          setMessages(prev => prev.filter(m => m.id !== loadingId));
          return;
      }

      // Construct Prompt
      const charDescription = (activeChar.appearance?.features || "") + " " + (activeChar.appearance?.build || "");
      const currentOutfit = outfits.map(o => o.desc).join(', ') || activeChar.appearance?.style || "Default style";
      let perspectivePrompt = perspective === 'selfie' ? " Selfie angle, close up." : " Cinematic shot.";
      const fullPrompt = `Character: ${charDescription}. Outfit: ${currentOutfit}. Location: ${botLocation}. Action: ${prompt}.${perspectivePrompt}`;
      const referenceImage = customReference || activeChar.avatar;

      try {
          // 2. Call API
          const base64Image = await generateCharacterImage(fullPrompt, referenceImage, activeChar.id);
          
          // 3. Update State: Remove loading AND add result atomically
          setMessages(prev => {
              // Filter out the specific loading message
              const filtered = prev.filter(m => m.id !== loadingId);
              
              if (base64Image) {
                  const imageMsg: Message = {
                      id: crypto.randomUUID(),
                      role: 'model',
                      text: `[Visualisasi: ${prompt}]`,
                      image: base64Image,
                      timestamp: virtualTime,
                      speakerName: activeChar.name,
                      speakerAvatar: activeChar.avatar
                  };
                  return [...filtered, imageMsg];
              } else {
                  const errorMsg: Message = {
                      id: crypto.randomUUID(),
                      role: 'model',
                      text: `[SYSTEM: VISUALISASI GAGAL.]`,
                      timestamp: virtualTime,
                      isSystemEvent: true
                  };
                  return [...filtered, errorMsg];
              }
          });
      } catch (e) {
          console.error("Image Gen Error:", e);
          // On error, remove loading and show system error
          setMessages(prev => {
              const filtered = prev.filter(m => m.id !== loadingId);
              const errorMsg: Message = {
                  id: crypto.randomUUID(),
                  role: 'model',
                  text: `[SYSTEM: Error generating image.]`,
                  timestamp: virtualTime,
                  isSystemEvent: true
              };
              return [...filtered, errorMsg];
          });
      } finally {
          setIsGeneratingImage(false);
      }
  };

  const handleRegenerateFromViewer = (prompt: string) => {
      const currentRef = viewingImage?.url;
      setViewingImage(null); 
      setTimeout(() => {
          handleGenerateImageConfirm(prompt, currentRef); 
      }, 500);
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

  // Restart Logic
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
      
      setTimeout(() => {
          triggerAiResponse(true); 
      }, 500);
  };

  // --- RENDER ---
  const formattedTime = new Date(virtualTime).toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':');

  return (
    <div className="h-full w-full flex bg-zinc-950 relative overflow-hidden">
        
        {/* Background Atmosphere */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div 
                className="absolute inset-0 bg-cover bg-center opacity-30 blur-[80px] scale-110 transition-all duration-1000"
                style={{ backgroundImage: `url(${activeChar.avatar})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-zinc-950/70" />
        </div>

        {/* OVERLAYS */}
        <Smartphone 
            show={showPhone}
            onClose={() => setShowPhone(false)}
            virtualTime={virtualTime}
            participants={participants}
            notifications={notifications}
            onPlaceOrder={(order, isBot) => { /* Handle logic */ }}
            onShowToCharacter={() => {
                handleSendMessage(); // Assuming user sends current input
                setShowPhone(false);
            }}
            onSendMessage={(text, contactId) => { /* Handle logic */ }}
            onTransfer={(amount, contactId, note, isBot) => { /* Handle logic */ }}
            lastUpdate={lastPhoneUpdate}
            activeCharacterId={activeChar ? activeChar.id : null}
            isTyping={isTyping}
        />

        <RestartModal 
            show={showRestartModal}
            isRestarting={isRestarting}
            isRebootSuccess={isRebootSuccess}
            restartProgress={restartProgress}
            onConfirm={handleRestartConfirm}
            onCancel={() => setShowRestartModal(false)}
        />

        <ImageGenModal 
            isOpen={showImageGen}
            onClose={() => setShowImageGen(false)}
            onGenerate={handleGenerateImageConfirm}
            initialPrompt={imageGenPrompt}
            isGenerating={isGeneratingImage}
            defaultReference={activeChar.avatar}
        />

        <ImageViewerModal 
            isOpen={!!viewingImage}
            onClose={() => setViewingImage(null)}
            imageUrl={viewingImage?.url || ''}
            prompt={viewingImage?.prompt || ''}
            onRegenerate={handleRegenerateFromViewer}
        />

        {/* LEFT SIDEBAR (Profile) */}
        <LeftSidebar 
            activeChar={activeChar}
            messages={messages}
            outfits={outfits}
            virtualTime={virtualTime}
            isMobile={showProfilePopup}
            onClose={() => setShowProfilePopup(false)}
        />

        {/* CENTER CHAT */}
        <div className="flex-1 flex flex-col h-full relative z-10 max-w-5xl mx-auto w-full shadow-2xl bg-zinc-950/20">
            <TopBar 
                activeChar={activeChar}
                formattedTime={formattedTime}
                showRightPanel={showRightPanel}
                showPhone={showPhone}
                onBack={onBack}
                onRestart={() => setShowRestartModal(true)}
                onToggleRightPanel={() => setShowRightPanel(!showRightPanel)}
                onTogglePhone={() => setShowPhone(!showPhone)}
                onShowProfile={() => setShowProfilePopup(true)}
            />

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
                onRegenerate={() => triggerAiResponse(false, messages.slice(0, -1))}
                onEditMessage={(id, text) => {
                    const newMsgs = [...messages];
                    const idx = newMsgs.findIndex(m => m.id === id);
                    if (idx !== -1) {
                        newMsgs[idx].text = text;
                        setMessages(newMsgs);
                        setEditingMessageId(null);
                    }
                }}
                editingMessageId={editingMessageId}
                setEditingMessageId={setEditingMessageId}
                onNavigateToSettings={onNavigateToSettings || (() => {})}
                containerRef={chatContainerRef}
                onGenerateImage={(text) => { setImageGenPrompt(text); setShowImageGen(true); }}
                onImageClick={(url, prompt) => setViewingImage({ url, prompt })}
            />

            <InputArea 
                inputText={inputText}
                setInputText={setInputText}
                onSend={handleSendMessage}
                isTyping={isTyping}
                selectedImage={selectedImage}
                setSelectedImage={setSelectedImage}
                isWorking={isWorking}
                charName={activeChar.name}
                onShowPhone={() => setShowPhone(true)}
                onOpenImageGen={() => { setImageGenPrompt(''); setShowImageGen(true); }}
            />
        </div>

        {/* RIGHT SIDEBAR (Context) */}
        <ChatContext 
            show={showRightPanel}
            onClose={() => setShowRightPanel(false)}
            timeSkip={timeSkip}
            setTimeSkip={setTimeSkip}
            onApplyTimeSkip={() => {
                const d = parseInt(timeSkip.d) || 0;
                const h = parseInt(timeSkip.h) || 0;
                const m = parseInt(timeSkip.m) || 0;
                const s = parseInt(timeSkip.s) || 0;
                const totalMs = ((d * 24 * 3600) + (h * 3600) + (m * 60) + s) * 1000;
                if (totalMs > 0) {
                    setVirtualTime(prev => prev + totalMs);
                    setMessages(prev => [...prev, {
                        id: crypto.randomUUID(),
                        role: 'model',
                        text: `[SYSTEM: Time advanced by ${d}d ${h}h ${m}m ${s}s]`,
                        timestamp: virtualTime + totalMs,
                        isSystemEvent: true
                    }]);
                    setTimeSkip({ d: '0', h: '0', m: '0', s: '0' });
                }
            }}
            userLocation={userLocation}
            setUserLocation={setUserLocation}
            botLocation={botLocation}
            setBotLocation={setBotLocation}
            currentLocation={botLocation} 
            setCurrentLocation={setBotLocation}
            onSyncLocation={() => setUserLocation(botLocation)}
            responseLength={responseLength}
            setResponseLength={setResponseLength}
            onManualSave={handleManualSave}
            characterName={activeChar.name}
            outfits={outfits}
            setOutfits={setOutfits}
        />
    </div>
  );
};
