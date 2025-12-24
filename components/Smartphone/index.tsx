import React, { useState, useEffect, useRef } from 'react';
import { Character } from '../../types';
import { getSmartphoneData, initSmartphoneData, CharacterPhoneData, saveSmartphoneData, Contact } from '../../services/smartphoneStorage';
import { getChatbotData, initChatbotData } from '../../services/ChatbotSmartphoneStorage'; 
import { Bell, Battery, Wifi, Signal, ChevronRight, ChevronLeft } from 'lucide-react';

// --- USER APPS ---
import { HomeScreen } from './HomeScreen';
import { ChatApp as UserChatApp } from './ChatApp'; 
import { WalletApp as UserWalletApp } from './WalletApp';
import { JobApp as UserJobApp } from './JobApp';
import { ShopApp as UserShopApp } from './ShopApp';
import { CheatApp } from './CheatApp'; 
import { SettingsApp } from './SettingsApp';
import { InventoryApp as UserInventoryApp } from './InventoryApp'; 
import { SocialApp } from './SocialApp/index';

// --- BOT APPS ---
import { ChatbotHomeScreen } from './ChatbotSmartphone/HomeScreen';
import { ChatApp as BotChatApp } from './ChatbotSmartphone/ChatApp';
import { JobApp as BotJobApp } from './ChatbotSmartphone/JobApp';
import { WalletApp as BotWalletApp } from './ChatbotSmartphone/WalletApp';
import { ShopApp as BotShopApp } from './ChatbotSmartphone/ShopApp';
import { InventoryApp as BotInventoryApp } from './ChatbotSmartphone/InventoryApp';

export interface PhoneNotification {
  id: string;
  app: 'chat' | 'wallet' | 'shop' | 'job';
  title: string;
  message: string;
  timestamp: number;
}

interface SmartphoneProps {
  show: boolean;
  onClose: () => void;
  virtualTime: number;
  participants: Character[];
  notifications: PhoneNotification[];
  onPlaceOrder: (order: { name: string, price: number, arrivalTime: number }, isBot?: boolean) => void;
  onShowToCharacter: () => void;
  onSendMessage: (text: string, contactId: string) => void;
  onTransfer: (amount: number, contactId: string, note: string, isBot?: boolean) => void;
  lastUpdate: number;
  activeCharacterId: string | null;
  isTyping?: boolean;
  onCall?: (contactId: string) => void;
  onVideoCall?: (contactId: string) => void;
  phoneWallpaper?: string | null;
  onUpdateWallpaper?: (type: 'chat' | 'phone', base64: string) => void;
  onCheat?: (action: { type: string, value: any }) => void;
  forcedWeather?: { condition: string; temp: number } | null;
}

export const Smartphone: React.FC<SmartphoneProps> = ({
  show,
  onClose,
  virtualTime,
  participants,
  notifications,
  onPlaceOrder,
  onShowToCharacter,
  onSendMessage,
  onTransfer,
  lastUpdate,
  activeCharacterId,
  isTyping,
  onCall,
  onVideoCall,
  phoneWallpaper,
  onUpdateWallpaper,
  onCheat,
  forcedWeather
}) => {
  const [currentPage, setCurrentPage] = useState(0); 
  const [userPhoneData, setUserPhoneData] = useState<CharacterPhoneData | null>(null);
  const [botPhoneData, setBotPhoneData] = useState<CharacterPhoneData | null>(null);
  const [activeApp, setActiveApp] = useState<string>('home');
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [currentNotif, setCurrentNotif] = useState<PhoneNotification | null>(null);
  const [isClosingPhone, setIsClosingPhone] = useState(false);
  const [isClosingApp, setIsClosingApp] = useState(false);
  const [renderPhone, setRenderPhone] = useState(show);

  const dragStartX = useRef<number | null>(null);
  const isDragging = useRef(false);
  const MIN_SWIPE_DISTANCE = 50;

  useEffect(() => {
      if (show) {
          setRenderPhone(true);
          setIsClosingPhone(false);
      } else {
          setIsClosingPhone(true);
          const timer = setTimeout(() => setRenderPhone(false), 500); 
          return () => clearTimeout(timer);
      }
  }, [show]);

  const refreshData = () => {
    if (activeCharacterId && participants.length > 0) {
        let uData = getSmartphoneData(activeCharacterId); 
        if (!uData) {
            const char = participants.find(p => p.id === activeCharacterId);
            if (char) uData = initSmartphoneData(char); 
        }
        setUserPhoneData(uData);

        let bData = getChatbotData(activeCharacterId); 
        if (!bData) {
             const char = participants.find(p => p.id === activeCharacterId);
             if (char) {
                 bData = initChatbotData(char); 
             }
        }
        setBotPhoneData(bData);
    }
  };

  useEffect(() => {
    refreshData();
  }, [activeCharacterId, lastUpdate, show]);

  useEffect(() => {
      if (notifications.length > 0) {
          const latest = notifications[0];
          if (currentNotif?.id !== latest.id) {
            setCurrentNotif(latest);
            const timer = setTimeout(() => setCurrentNotif(null), 3000);
            return () => clearTimeout(timer);
          }
      }
  }, [notifications]);

  const handleNotifClick = (notif: PhoneNotification) => {
      if (currentPage !== 0) setCurrentPage(0);
      
      setCurrentNotif(null);
      if (notif.app === 'chat') {
          const contact = userPhoneData?.contacts.find(c => c.name === notif.title);
          if (contact) {
              setActiveContactId(contact.id);
              setActiveApp('chat_detail');
          } else {
              setActiveApp('chat');
          }
      } else if (notif.app === 'wallet') {
          setActiveApp('wallet');
      } else if (notif.app === 'job') {
          setActiveApp('jobs');
      } else {
          setActiveApp('home');
      }
  };

  const handleHome = () => {
      if (activeApp === 'home') {
          // Do nothing
      } else {
          setIsClosingApp(true);
          setTimeout(() => {
              setActiveApp('home');
              setActiveContactId(null);
              setIsClosingApp(false);
          }, 250); 
      }
  };

  const handleDragStart = (clientX: number) => {
      if (activeApp !== 'home') return; 
      dragStartX.current = clientX;
      isDragging.current = true;
  };

  const handleDragMove = (clientX: number) => {
      // Could implement 1:1 follow movement here
  };

  const handleDragEnd = (clientX: number) => {
      if (!isDragging.current || dragStartX.current === null) return;
      isDragging.current = false;

      const diff = dragStartX.current - clientX;
      
      if (diff > MIN_SWIPE_DISTANCE && currentPage === 0) {
          setCurrentPage(1);
      }
      
      if (diff < -MIN_SWIPE_DISTANCE && currentPage === 1) {
          setCurrentPage(0);
      }
      
      dragStartX.current = null;
  };

  const formattedTime = new Date(virtualTime).toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit' });
  const defaultWallpaper = 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=2532&auto=format&fit=crop';
  
  const isBotPhone = currentPage === 1;
  const activeCharObj = participants.find(p => p.id === activeCharacterId);

  const handlePlaceOrderWrapper = (order: { name: string, price: number, arrivalTime: number }) => {
      onPlaceOrder(order, isBotPhone);
  };

  const handleTransferWrapper = (amount: number, contactId: string, note: string) => {
      onTransfer(amount, contactId, note, isBotPhone);
  };

  const handleCheatWrapper = (action: { type: string, value: any }) => {
      if (action.type === 'money') {
          refreshData(); 
      }
      if (onCheat) onCheat(action);
  }

  // --- CALL HANDLERS: WRAPPING THE ID PASS-THROUGH ---
  const handleUserCall = (contactId: string) => {
      if (onCall) onCall(contactId);
  };

  const handleUserVideoCall = (contactId: string) => {
      if (onVideoCall) onVideoCall(contactId);
  };

  if (!renderPhone) return null;

  return (
    <div className={`
        fixed z-50 bottom-4 left-0 right-0 mx-auto w-[92vw] h-[85vh] 
        md:bottom-6 md:right-6 md:left-auto md:mx-0 md:w-[340px] md:h-[700px]
        max-w-[340px] max-h-[700px] perspective-1000 origin-bottom
        ${isClosingPhone ? 'animate-phone-exit' : 'animate-phone-enter'}
    `}>
        {/* Physical Buttons */}
        <div className="absolute -left-[3px] top-32 w-[3px] h-10 bg-zinc-600 rounded-l-md shadow-sm"></div>
        <div className="absolute -left-[3px] top-44 w-[3px] h-10 bg-zinc-600 rounded-l-md shadow-sm"></div>
        <div className="absolute -right-[3px] top-40 w-[3px] h-16 bg-zinc-600 rounded-r-md shadow-sm"></div>

        <div className="w-full h-full bg-[#1c1c1e] rounded-[3.5rem] shadow-2xl border-[6px] border-[#3a3a3c] ring-1 ring-black/50 overflow-hidden relative flex flex-col box-border">
            
            {/* Screen Bezel */}
            <div className="absolute inset-0 border-[8px] border-black rounded-[3.2rem] pointer-events-none z-50 shadow-inner"></div>

            {/* Dynamic Island */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-b-2xl z-[60] flex items-center justify-center pointer-events-none">
                <div className="w-20 h-4 bg-[#000] rounded-full flex items-center justify-end px-2">
                    <div className="w-1.5 h-1.5 bg-[#111] rounded-full ring-1 ring-white/5"></div>
                </div>
            </div>

            {/* Status Bar */}
            <div className="h-12 bg-transparent flex justify-between items-center px-8 pt-4 shrink-0 select-none z-40 text-white pointer-events-none">
                <span className="text-[12px] font-semibold tracking-wide drop-shadow-md">{formattedTime}</span>
                <div className="flex gap-1.5 items-center drop-shadow-md">
                    <Signal size={12} strokeWidth={2.5}/>
                    <Wifi size={12} strokeWidth={2.5}/>
                    <Battery size={12} strokeWidth={2.5}/>
                </div>
            </div>

            {/* Notification Popover */}
            <div className="absolute top-2 left-0 right-0 z-[70] flex justify-center pointer-events-none">
                 {currentNotif && !isBotPhone && (
                     <div 
                        onClick={() => handleNotifClick(currentNotif)}
                        className="bg-black/90 backdrop-blur-xl rounded-[2rem] p-3 px-4 flex items-center gap-3 shadow-2xl border border-white/10 cursor-pointer animate-in slide-in-from-top-4 duration-300 pointer-events-auto max-w-[90%] w-auto mt-2"
                     >
                         <div className={`p-2 rounded-full ${currentNotif.app === 'chat' ? 'bg-green-500' : 'bg-blue-500'} text-white`}>
                             <Bell size={12} fill="currentColor" />
                         </div>
                         <div className="flex-1 min-w-0 pr-2">
                             <h4 className="text-[10px] font-bold text-white uppercase tracking-wider opacity-80">{currentNotif.title}</h4>
                             <p className="text-xs text-white font-medium truncate max-w-[150px]">{currentNotif.message}</p>
                         </div>
                     </div>
                 )}
            </div>

            {/* Main Content Area */}
            <div 
                className="flex-1 overflow-hidden relative bg-black"
                onMouseDown={(e) => handleDragStart(e.clientX)}
                onMouseMove={(e) => handleDragMove(e.clientX)}
                onMouseUp={(e) => handleDragEnd(e.clientX)}
                onMouseLeave={(e) => isDragging.current && handleDragEnd(e.clientX)}
                
                onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
                onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
                onTouchEnd={(e) => handleDragEnd(e.changedTouches[0].clientX)}
            >
                {/* Wallpaper */}
                {activeApp === 'home' && (
                    <div 
                        className="absolute inset-0 bg-cover bg-center transition-all duration-500"
                        style={{ backgroundImage: `url('${isBotPhone ? (activeCharObj?.avatar || defaultWallpaper) : (phoneWallpaper || defaultWallpaper)}')` }}
                    >
                        {isBotPhone && <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>}
                    </div>
                )}
                
                {/* Page Slider Container */}
                <div className={`w-full h-full relative transition-transform duration-500 ease-in-out ${currentPage === 1 ? '-translate-x-full' : 'translate-x-0'}`}>
                    
                    {/* === PAGE 0: USER PHONE === */}
                    <div className="absolute top-0 left-0 w-full h-full" style={{ left: '0%' }}>
                        {activeApp === 'home' && currentPage === 0 && (
                            <HomeScreen 
                                onLaunch={setActiveApp} 
                                onShowToCharacter={onShowToCharacter}
                                virtualTime={virtualTime} 
                                forcedWeather={forcedWeather} 
                            />
                        )}
                        {/* Apps Render Area (User) */}
                        {activeApp !== 'home' && currentPage === 0 && (
                             <div className={`absolute inset-0 z-20 bg-zinc-950 ${isClosingApp ? 'animate-app-exit' : 'animate-app-enter'}`}>
                                {(activeApp === 'chat' || activeApp === 'chat_detail' || activeApp === 'add_contact') && (
                                    <UserChatApp 
                                        view={activeApp}
                                        phoneData={userPhoneData}
                                        activeContactId={activeContactId}
                                        activeCharacterId={activeCharacterId}
                                        isTyping={isTyping}
                                        virtualTime={virtualTime}
                                        onNavigate={setActiveApp}
                                        onSelectContact={setActiveContactId}
                                        onSendMessage={onSendMessage}
                                        refreshData={refreshData}
                                        onCall={handleUserCall} 
                                        onVideoCall={handleUserVideoCall} 
                                        onShowChat={onShowToCharacter} 
                                    />
                                )}
                                {(activeApp === 'wallet' || activeApp === 'transfer_select' || activeApp === 'transfer_amount' || activeApp === 'contacts') && (
                                    <UserWalletApp 
                                        view={activeApp}
                                        phoneData={userPhoneData}
                                        onNavigate={setActiveApp}
                                        onTransfer={handleTransferWrapper}
                                        onHome={handleHome}
                                    />
                                )}
                                {activeApp === 'jobs' && (
                                    <UserJobApp 
                                        phoneData={userPhoneData}
                                        activeCharacterId={activeCharacterId}
                                        onNavigate={setActiveApp}
                                        refreshData={refreshData}
                                    />
                                )}
                                {activeApp === 'shop' && (
                                    <UserShopApp 
                                        virtualTime={virtualTime}
                                        onNavigate={setActiveApp}
                                        onPlaceOrder={handlePlaceOrderWrapper}
                                        onHome={handleHome}
                                        phoneData={userPhoneData} 
                                    />
                                )}
                                {activeApp === 'cheat' && (
                                    <CheatApp 
                                        onNavigate={setActiveApp}
                                        activeCharacterId={activeCharacterId}
                                        participants={participants}
                                        onCheat={handleCheatWrapper}
                                    />
                                )}
                                {activeApp === 'settings' && (
                                    <SettingsApp 
                                        onNavigate={setActiveApp}
                                        onUpdateWallpaper={onUpdateWallpaper || (() => {})}
                                    />
                                )}
                                {activeApp === 'inventory' && (
                                    <UserInventoryApp 
                                        phoneData={userPhoneData}
                                        onNavigate={setActiveApp}
                                    />
                                )}
                                {activeApp === 'social' && (
                                    <SocialApp
                                        phoneData={userPhoneData}
                                        onNavigate={setActiveApp}
                                        virtualTime={virtualTime}
                                        activeCharacterId={activeCharacterId}
                                        activeCharacter={activeCharObj}
                                    />
                                )}
                             </div>
                        )}
                    </div>

                    {/* === PAGE 1: BOT PHONE === */}
                    <div className="absolute top-0 left-0 w-full h-full" style={{ left: '100%' }}>
                        {activeApp === 'home' && currentPage === 1 && (
                            <ChatbotHomeScreen 
                                onLaunch={setActiveApp} 
                                virtualTime={virtualTime}
                                character={activeCharObj || null}
                            />
                        )}
                        {activeApp !== 'home' && currentPage === 1 && (
                             <div className={`absolute inset-0 z-20 bg-zinc-950 ${isClosingApp ? 'animate-app-exit' : 'animate-app-enter'}`}>
                                 {activeApp === 'jobs' && (
                                    <BotJobApp 
                                        phoneData={botPhoneData}
                                        activeCharacterId={activeCharacterId} 
                                        onNavigate={setActiveApp}
                                        refreshData={refreshData}
                                    />
                                )}
                                {activeApp === 'inventory' && (
                                    <BotInventoryApp 
                                        phoneData={botPhoneData}
                                        onNavigate={setActiveApp}
                                        activeCharacterId={activeCharacterId}
                                    />
                                )}
                                {activeApp === 'shop' && (
                                    <BotShopApp 
                                        virtualTime={virtualTime}
                                        onNavigate={setActiveApp}
                                        onPlaceOrder={handlePlaceOrderWrapper}
                                        onHome={handleHome}
                                        phoneData={botPhoneData} 
                                    />
                                )}
                                {(activeApp === 'wallet' || activeApp === 'transfer_select' || activeApp === 'transfer_amount' || activeApp === 'contacts') && (
                                    <BotWalletApp 
                                        view={activeApp}
                                        phoneData={botPhoneData}
                                        onNavigate={setActiveApp}
                                        onTransfer={handleTransferWrapper}
                                        onHome={handleHome}
                                    />
                                )}
                                {(activeApp === 'chat' || activeApp === 'chat_detail') && (
                                    <BotChatApp 
                                        view={activeApp}
                                        phoneData={botPhoneData}
                                        activeContactId={null} 
                                        activeCharacterId={activeCharacterId}
                                        virtualTime={virtualTime}
                                        onNavigate={setActiveApp}
                                        onSelectContact={() => {}} 
                                        onSendMessage={() => {}} 
                                        refreshData={refreshData}
                                    />
                                )}
                             </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Page Indicators */}
            {activeApp === 'home' && (
                <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-2 z-50 pointer-events-none">
                    <div className={`w-2 h-2 rounded-full transition-all ${currentPage === 0 ? 'bg-white w-4' : 'bg-white/30'}`} />
                    <div className={`w-2 h-2 rounded-full transition-all ${currentPage === 1 ? 'bg-white w-4' : 'bg-white/30'}`} />
                </div>
            )}

            {/* Home Indicator */}
            <div 
                className="h-6 bg-transparent shrink-0 flex justify-center items-start relative z-50 cursor-pointer group" 
                onClick={() => { if(activeApp !== 'home') handleHome(); else onClose(); }}
            >
                 <div className="w-32 h-1.5 bg-white/40 rounded-full mt-2 backdrop-blur-md shadow-sm group-hover:bg-white/60 transition-colors"></div>
            </div>
        </div>
    </div>
  );
};