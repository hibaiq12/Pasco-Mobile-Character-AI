
import React, { useState, useEffect, useRef } from 'react';
import { Character, Message, ChatSession, OutfitItem } from '../../types';
import { generateCharacterResponse, generateGroupResponse, generateNPCResponse } from '../../services/geminiService';
import { generateCharacterImage } from '../../services/Imagecreate';
import { saveSession, getSettings, saveStorySnapshot, saveCharacter } from '../../services/storageService'; 
import { Smartphone, PhoneNotification } from '../Smartphone/index';
import { addPhoneMessage, PhoneMessage, getSmartphoneData, saveSmartphoneData, initSmartphoneData, JOBS_DATA, updateWalletBalance, claimJobSalary } from '../../services/smartphoneStorage';
import { getChatContext, saveChatContext } from '../../services/chatContextStorage';

import { TopBar } from './TopBar';
import { LeftSidebar } from './LeftSidebar';
import { ChatContext } from './ChatContext/index'; 
import { ChatArea } from './ChatArea';
import { InputArea } from './InputArea';
import { WorkingOverlay } from './WorkingOverlay';
import { RestartModal } from './RestartModal';
import { ImageGenModal } from './ImageGenModal';
import { ImageViewerModal } from './ImageViewerModal';

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

  // -- CONTEXT STATE --
  const [contextData, setContextData] = useState(() => getChatContext(activeChar.id));
  
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
  const [isRestarting, setIsRestarting] = useState(false);
  const [restartProgress, setRestartProgress] = useState(0);
  const [isRebootSuccess, setIsRebootSuccess] = useState(false);

  const [showImageGenModal, setShowImageGenModal] = useState(false);
  const [imageGenPrompt, setImageGenPrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // -- IMAGE VIEWER --
  const [viewerImage, setViewerImage] = useState<{url: string, prompt: string} | null>(null);

  // -- PHONE STATE --
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [notifications, setNotifications] = useState<PhoneNotification[]>([]);
  const [lastPhoneUpdate, setLastPhoneUpdate] = useState(Date.now());

  // -- EFFECTS --

  useEffect(() => {
      const interval = setInterval(() => {
          setVirtualTime(prev => prev + 1000); 
      }, 300); // 1 sec real = 3.3 sec virtual
      return () => clearInterval(interval);
  }, []);

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
          triggerAiResponse(true);
      }
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

  // --- HANDLERS ---

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
              // Proximity Logic: if locations match, user is NEAR.
              const isNear = userLocation.trim().toLowerCase() === botLocation.trim().toLowerCase() && userLocation !== '';
              
              const responseText = await generateCharacterResponse(
                  activeChar.modelConfig.modelName,
                  activeChar.systemInstruction,
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

              if (responseText.trim().startsWith('[SMS]:')) {
                  const cleanText = responseText.replace('[SMS]:', '').trim();
                  // SMS logic handled here if AI initiates, but for now we just show it
                  setMessages(prev => [...prev, {
                      id: crypto.randomUUID(),
                      role: 'model',
                      text: `[SMS from ${activeChar.name}]: ${cleanText}`,
                      timestamp: virtualTime + 3000,
                      isSystemEvent: true
                  }]);
              } else {
                  setMessages(prev => [...prev, {
                      id: crypto.randomUUID(),
                      role: 'model',
                      text: responseText,
                      timestamp: virtualTime + 3000,
                      speakerName: activeChar.name,
                      speakerAvatar: activeChar.avatar
                  }]);
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
    setVirtualTime(prev => prev + 60000); 

    await triggerAiResponse(false, [...messages, userMsg]);
  };

  // --- IMAGE GENERATION HANDLERS ---
  const handleOpenImageGen = (contextText?: string) => {
      // Build Prompt Context from Profile + Outfits + Location + specific context
      const charOutfits = outfits.filter(o => o.target === 'char').map(o => o.desc).join(', ');
      
      let basePrompt = `${activeChar.name}, ${activeChar.species === 'Human' ? 'anime girl' : activeChar.species}. `;
      basePrompt += `Appearance: ${activeChar.appearance.features}. `;
      basePrompt += `Wearing: ${charOutfits || activeChar.appearance.style}. `;
      basePrompt += `Location: ${botLocation}. `;

      // INJECT RECENT DIALOGUE HISTORY (Last 3 messages)
      // This ensures the image captures the "Perfect Dialogue" moment
      const recentHistory = messages.slice(-3).map(m => 
        `${m.role === 'user' ? 'User' : activeChar.name}: "${m.text.replace(/\*/g, '')}"`
      ).join(' | ');

      if (recentHistory) {
          basePrompt += `\nCURRENT SCENE/DIALOGUE CONTEXT: ${recentHistory}. `;
      }
      
      if (contextText) {
          basePrompt += `Specific Action/Focus: ${contextText}`;
      } else {
          basePrompt += `Action: ${activeChar.scenario.currentActivity || 'Standing'}`;
      }

      setImageGenPrompt(basePrompt);
      setShowImageGenModal(true);
  };

  const handleGenerateImageConfirm = async (prompt: string, customReference?: string, perspective?: 'third_person' | 'selfie') => {
      setIsGeneratingImage(true);
      try {
          // Use custom uploaded reference if provided, otherwise fallback to avatar
          const refImage = customReference || activeChar.avatar; 
          
          let enhancedPrompt = prompt;

          // INJECT CAMERA PERSPECTIVE
          if (perspective === 'selfie') {
              enhancedPrompt += " [CAMERA STYLE: Selfie Shot. Front-Facing Camera Angle. The character is holding the phone/camera. Arm extended. Close-up on face and upper body. Looking directly at lens.]";
          } else {
              enhancedPrompt += " [CAMERA STYLE: Cinematic Third-Person Shot. 16:9 Aspect Ratio. Detailed background composition. High Fidelity.]";
          }

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
          } else {
              alert("Gagal membuat gambar. Coba lagi.");
          }
      } catch (e) {
          console.error(e);
          alert("Error generating image.");
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
          }, 2000);
      }
  };

  const handlePhoneTransfer = async (amount: number, contactId: string, note: string, isBot?: boolean) => {
      const sourceId = isBot ? activeChar.id : activeChar.id; // Usually bot uses their own funds if enabled, but for now shared logic
      // For now, only user transfers affect log
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
          }, 1000);
      }
  };

  // --- RENDER ---

  const formattedTime = new Date(virtualTime).toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':');

  return (
    <div className="h-full w-full flex bg-zinc-950 relative overflow-hidden">
        <Smartphone 
            show={showPhone}
            onClose={() => setShowPhone(false)}
            virtualTime={virtualTime}
            participants={participants}
            notifications={notifications}
            onPlaceOrder={handlePlaceOrder}
            onShowToCharacter={() => handleSendMessage(`*[User menunjukkan layar HP-nya ke ${activeChar.name}.]*`)}
            onSendMessage={handlePhoneSendMessage}
            onTransfer={handlePhoneTransfer}
            lastUpdate={lastPhoneUpdate}
            activeCharacterId={activeChar ? activeChar.id : null}
            isTyping={isTyping}
        />
        
        <LeftSidebar activeChar={activeChar} messages={messages} outfits={outfits} virtualTime={virtualTime} />

        <div className="flex-1 flex flex-col h-full relative z-10 max-w-5xl mx-auto w-full shadow-2xl bg-zinc-950/20">
            <TopBar activeChar={activeChar} formattedTime={formattedTime} showRightPanel={showRightPanel} showPhone={showPhone}
                onBack={onBack} onRestart={() => setShowRestartModal(true)} onToggleRightPanel={() => setShowRightPanel(!showRightPanel)}
                onTogglePhone={() => setShowPhone(!showPhone)} onShowProfile={() => setShowProfilePopup(true)} />

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
                onRegenerate={() => {}} 
                onEditMessage={(id, text) => {}}
                editingMessageId={editingMessageId} 
                setEditingMessageId={setEditingMessageId}
                onNavigateToSettings={onNavigateToSettings || (() => {})} 
                containerRef={chatContainerRef}
                onGenerateImage={(text) => handleOpenImageGen(text)}
                onImageClick={(url, prompt) => setViewerImage({url, prompt})}
            />

            <InputArea 
                inputText={inputText} 
                setInputText={setInputText} 
                onSend={() => handleSendMessage()} 
                isTyping={isTyping}
                selectedImage={selectedImage} 
                setSelectedImage={setSelectedImage} 
                isWorking={isWorking} 
                charName={activeChar.name}
                onShowPhone={() => setShowPhone(true)} 
                onOpenImageGen={() => handleOpenImageGen()} 
            />
        </div>

        <ChatContext show={showRightPanel} onClose={() => setShowRightPanel(false)} timeSkip={timeSkip} setTimeSkip={setTimeSkip}
            onApplyTimeSkip={() => {}} userLocation={userLocation} setUserLocation={setUserLocation} botLocation={botLocation}
            setBotLocation={setBotLocation} onSyncLocation={() => setUserLocation(botLocation)} characterName={activeChar?.name || 'Bot'}
            currentLocation={botLocation} setCurrentLocation={setBotLocation} responseLength={responseLength}
            setResponseLength={setResponseLength} onManualSave={() => {}} outfits={outfits} setOutfits={setOutfits} />
        
        <RestartModal show={showRestartModal} isRestarting={isRestarting} isRebootSuccess={isRebootSuccess} restartProgress={restartProgress}
            onConfirm={() => {}} onCancel={() => setShowRestartModal(false)} />

        {/* IMAGE GEN MODAL */}
        <ImageGenModal 
            isOpen={showImageGenModal} 
            onClose={() => setShowImageGenModal(false)} 
            onGenerate={handleGenerateImageConfirm}
            initialPrompt={imageGenPrompt}
            isGenerating={isGeneratingImage}
            defaultReference={activeChar.avatar}
        />

        {/* IMAGE VIEWER MODAL */}
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
