
import React, { useState, useEffect, useRef } from 'react';
import { Character } from '../types';
import { getSmartphoneData, initSmartphoneData, CharacterPhoneData, toggleJobApplication, JOBS_DATA, Contact, addPhoneContact } from '../services/smartphoneStorage';
import { X, MessageCircle, Briefcase, CreditCard, ShoppingBag, ArrowLeft, ChevronLeft, Send, Search, Bell, Battery, Wifi, ChevronRight, CheckCircle, Clock, Smartphone as SmartphoneIcon, MapPin, Play, User, DollarSign, LogOut, Plus, UserPlus } from 'lucide-react';

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
  onPlaceOrder: (order: { name: string, price: number, arrivalTime: number }) => void;
  onShowToCharacter: () => void;
  onSendMessage: (text: string, contactId: string) => void;
  onTransfer: (amount: number, contactId: string, note: string) => void;
  lastUpdate: number;
  activeCharacterId: string | null;
  isTyping?: boolean;
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
  isTyping
}) => {
  const [phoneData, setPhoneData] = useState<CharacterPhoneData | null>(null);
  const [activeApp, setActiveApp] = useState<string>('home');
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [currentNotif, setCurrentNotif] = useState<PhoneNotification | null>(null);
  const [inputText, setInputText] = useState('');
  
  // Wallet State
  const [transferTargetId, setTransferTargetId] = useState<string | null>(null);
  const [transferAmount, setTransferAmount] = useState('');

  // Add Contact State
  const [newContactName, setNewContactName] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync Data
  const refreshData = () => {
    if (activeCharacterId && participants.length > 0) {
        let data = getSmartphoneData(activeCharacterId);
        if (!data) {
            const char = participants.find(p => p.id === activeCharacterId);
            if (char) {
                data = initSmartphoneData(char);
            }
        }
        setPhoneData(data);
    }
  };

  useEffect(() => {
    refreshData();
  }, [activeCharacterId, lastUpdate, show]);

  // Handle Notification
  useEffect(() => {
      if (notifications.length > 0) {
          const latest = notifications[0];
          // Only show if it's new (simple check via ID or timestamp could be better, but this works for basic flow)
          if (currentNotif?.id !== latest.id) {
            setCurrentNotif(latest);
            const timer = setTimeout(() => setCurrentNotif(null), 3000);
            return () => clearTimeout(timer);
          }
      }
  }, [notifications]);

  // Scroll to bottom on new message in Chat Detail or Typing
  useEffect(() => {
    if (activeApp === 'chat_detail') {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }
  }, [phoneData, activeApp, activeContactId, isTyping]);

  // Notification Click
  const handleNotifClick = (notif: PhoneNotification) => {
      setCurrentNotif(null);
      if (notif.app === 'chat') {
          const contact = phoneData?.contacts.find(c => c.name === notif.title);
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

  const handleBack = () => {
      if (activeApp === 'chat_detail') {
          setActiveApp('chat');
          setActiveContactId(null);
      } else if (activeApp === 'add_contact') {
          setActiveApp('chat');
          setNewContactName('');
      } else if (activeApp === 'transfer_amount') {
          setActiveApp('transfer_select');
      } else if (activeApp === 'transfer_select') {
          setActiveApp('wallet');
      } else if (activeApp !== 'home') {
          setActiveApp('home');
      } else {
          onClose();
      }
  };

  const handleHome = () => {
      if (activeApp === 'home') {
          onClose();
      } else {
          setActiveApp('home');
          setActiveContactId(null);
      }
  };

  const handleAppLaunch = (app: string) => {
      setActiveApp(app);
  };

  const handleSendMessageInternal = () => {
      if (!inputText.trim() || !activeContactId) return;
      
      // Call parent handler
      onSendMessage(inputText, activeContactId);
      
      // Optimistic update for UI smoothness (optional, but helps perceived speed)
      // The real data comes from `lastUpdate` prop triggering `refreshData`
      setInputText('');
      
      // Force scroll after a short delay to account for re-render
      setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
  };

  const handleJobToggle = (jobId: string) => {
      if (activeCharacterId) {
          toggleJobApplication(activeCharacterId, jobId);
          refreshData();
      }
  };

  const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  const formattedTime = new Date(virtualTime).toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit' });

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[320px] h-[640px] bg-black rounded-[3rem] shadow-2xl border-4 border-zinc-800 overflow-hidden flex flex-col ring-4 ring-black/50 animate-slide-up origin-bottom-right">
        
        {/* Notch / Status Bar */}
        <div className="h-8 bg-black flex justify-between items-center px-6 pt-2 shrink-0 select-none">
            <span className="text-[10px] font-bold text-white">{formattedTime}</span>
            <div className="flex gap-1.5 text-white">
                <Wifi size={10} />
                <Battery size={10} />
            </div>
        </div>

        {/* Dynamic Island / Notification Area */}
        <div className="relative px-2 h-14 shrink-0 flex items-center justify-center">
             {currentNotif ? (
                 <div 
                    onClick={() => handleNotifClick(currentNotif)}
                    className="absolute top-0 w-[90%] bg-zinc-900 rounded-2xl p-3 flex items-center gap-3 shadow-lg border border-white/10 cursor-pointer animate-in slide-in-from-top-2 duration-300"
                 >
                     <div className={`p-2 rounded-xl ${currentNotif.app === 'chat' ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'}`}>
                         <Bell size={14} />
                     </div>
                     <div className="flex-1 min-w-0">
                         <h4 className="text-xs font-bold text-white truncate">{currentNotif.title}</h4>
                         <p className="text-[10px] text-zinc-400 truncate">{currentNotif.message}</p>
                     </div>
                 </div>
             ) : (
                <div className="w-24 h-6 bg-black rounded-b-xl border-x border-b border-zinc-800 absolute top-0"></div>
             )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden relative bg-zinc-950">
            {/* Background Wallpaper */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 pointer-events-none" />
            
            {/* HOME SCREEN */}
            {activeApp === 'home' && (
                <div className="h-full flex flex-col p-6 animate-fade-in relative z-10">
                    <div className="mt-8 grid grid-cols-4 gap-4">
                        <button onClick={() => handleAppLaunch('chat')} className="flex flex-col items-center gap-1 group">
                            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-900/20 group-hover:scale-105 transition-transform">
                                <MessageCircle size={24} fill="white" />
                            </div>
                            <span className="text-[10px] text-zinc-300 font-medium">Chat</span>
                        </button>

                        <button onClick={() => handleAppLaunch('wallet')} className="flex flex-col items-center gap-1 group">
                            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/20 group-hover:scale-105 transition-transform">
                                <CreditCard size={24} />
                            </div>
                            <span className="text-[10px] text-zinc-300 font-medium">Wallet</span>
                        </button>
                        
                        <button onClick={() => handleAppLaunch('jobs')} className="flex flex-col items-center gap-1 group">
                            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-900/20 group-hover:scale-105 transition-transform">
                                <Briefcase size={24} />
                            </div>
                            <span className="text-[10px] text-zinc-300 font-medium">JobHub</span>
                        </button>

                        <button onClick={() => handleAppLaunch('shop')} className="flex flex-col items-center gap-1 group">
                            <div className="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-pink-900/20 group-hover:scale-105 transition-transform">
                                <ShoppingBag size={24} />
                            </div>
                            <span className="text-[10px] text-zinc-300 font-medium">Shop</span>
                        </button>
                        
                        {/* Show to Character Feature */}
                        <button onClick={onShowToCharacter} className="flex flex-col items-center gap-1 group">
                            <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center text-white shadow-lg border border-white/10 group-hover:scale-105 transition-transform">
                                <SmartphoneIcon size={24} />
                            </div>
                            <span className="text-[10px] text-zinc-300 font-medium">Show</span>
                        </button>
                    </div>
                </div>
            )}

            {/* CHAT LIST */}
            {activeApp === 'chat' && (
                <div className="h-full flex flex-col bg-black animate-fade-in relative z-10">
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button onClick={handleBack} className="p-1"><ChevronLeft className="text-blue-500" /></button>
                            <h2 className="text-lg font-bold text-white">Chats</h2>
                        </div>
                        <button onClick={() => setActiveApp('add_contact')} className="text-blue-500 hover:text-blue-400 p-1">
                            <Plus size={24} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {phoneData?.contacts.map(contact => {
                            const isCharTyping = isTyping && contact.id === activeCharacterId;
                            // Clean up preview link for list view
                            const previewSafeText = contact.lastMessage.replace('||SETTINGS||', '<Settings>');
                            return (
                                <div 
                                    key={contact.id}
                                    onClick={() => { setActiveContactId(contact.id); setActiveApp('chat_detail'); }}
                                    className="flex items-center gap-3 p-3 hover:bg-zinc-900 border-b border-zinc-900 cursor-pointer"
                                >
                                    <img src={contact.avatar} className="w-10 h-10 rounded-full bg-zinc-800 object-cover" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline">
                                            <h3 className="font-bold text-white text-sm">{contact.name}</h3>
                                            <span className="text-[10px] text-zinc-500">{new Date(contact.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                        </div>
                                        <p className={`text-xs truncate ${contact.unread > 0 ? 'text-blue-400 font-bold' : 'text-zinc-500'}`}>
                                            {isCharTyping ? <span className="text-green-500 italic animate-pulse">Typing...</span> : previewSafeText}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ADD CONTACT */}
            {activeApp === 'add_contact' && (
                <div className="h-full flex flex-col bg-zinc-950 animate-slide-left relative z-10 p-6">
                    <div className="flex items-center gap-2 mb-8">
                        <button onClick={() => { setActiveApp('chat'); setNewContactName(''); }} className="p-1 text-blue-500"><ChevronLeft size={24} /></button>
                        <h2 className="text-xl font-bold text-white">New Contact</h2>
                    </div>

                    <div className="flex flex-col items-center mb-8">
                        <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center mb-4 border border-zinc-700 overflow-hidden">
                            {newContactName ? (
                                <img src={`https://api.dicebear.com/7.x/micah/svg?seed=${newContactName}&backgroundColor=b6e3f4`} className="w-full h-full object-cover" />
                            ) : (
                                <UserPlus size={40} className="text-zinc-500" />
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-zinc-500 font-bold uppercase ml-2">Name</label>
                            <input 
                                type="text" 
                                value={newContactName}
                                onChange={(e) => setNewContactName(e.target.value)}
                                placeholder="Enter name..."
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                                autoFocus
                            />
                        </div>
                        <button 
                            onClick={() => {
                                if (newContactName.trim() && activeCharacterId) {
                                    const newContact: Contact = {
                                        id: `contact_${Date.now()}`,
                                        name: newContactName.trim(),
                                        avatar: `https://api.dicebear.com/7.x/micah/svg?seed=${newContactName}&backgroundColor=b6e3f4`,
                                        lastMessage: 'Contact added',
                                        timestamp: virtualTime,
                                        unread: 0,
                                        isOnline: false,
                                        isSystem: false
                                    };
                                    addPhoneContact(activeCharacterId, newContact);
                                    setNewContactName('');
                                    refreshData();
                                    setActiveApp('chat');
                                }
                            }}
                            disabled={!newContactName.trim()}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 mt-4"
                        >
                            Save Contact
                        </button>
                    </div>
                </div>
            )}

            {/* CHAT DETAIL */}
            {activeApp === 'chat_detail' && activeContactId && (
                <div className="h-full flex flex-col bg-zinc-900 animate-slide-left relative z-10">
                    <div className="p-3 bg-zinc-800/80 backdrop-blur border-b border-white/5 flex items-center gap-2 shrink-0 z-20">
                         <button onClick={handleBack} className="text-blue-500 flex items-center text-sm font-medium pr-2">
                             <ChevronLeft size={20}/>
                         </button>
                         <img src={phoneData?.contacts.find(c => c.id === activeContactId)?.avatar} className="w-8 h-8 rounded-full object-cover" />
                         <span className="font-bold text-white text-sm truncate flex-1">
                             {phoneData?.contacts.find(c => c.id === activeContactId)?.name}
                         </span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-black">
                         {phoneData?.messages[activeContactId]?.map(msg => (
                             <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                                 <div className={`
                                     max-w-[75%] px-3 py-2 rounded-2xl text-xs leading-relaxed
                                     ${msg.isMe ? 'bg-green-600 text-white rounded-br-sm' : 'bg-zinc-800 text-zinc-200 rounded-bl-sm'}
                                 `}>
                                     {/* Render text, stripping special markers for phone UI */}
                                     {msg.text.replace('||SETTINGS||', '<Settings>')}
                                     <div className={`text-[9px] mt-1 text-right opacity-70`}>
                                         {new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                     </div>
                                 </div>
                             </div>
                         ))}
                         {isTyping && activeContactId === activeCharacterId && (
                             <div className="flex justify-start animate-fade-in">
                                 <div className="bg-zinc-800 text-zinc-200 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1">
                                     <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                     <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                     <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></div>
                                 </div>
                             </div>
                         )}
                         <div ref={messagesEndRef} />
                    </div>

                    <div className="p-3 bg-zinc-800 shrink-0 flex gap-2">
                        <input 
                            type="text" 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessageInternal()}
                            placeholder="iMessage"
                            className="flex-1 bg-black border border-zinc-700 rounded-full px-4 py-2 text-sm text-white focus:border-green-500 outline-none"
                        />
                        <button 
                            onClick={handleSendMessageInternal}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${inputText.trim() ? 'bg-green-500 text-white' : 'bg-zinc-700 text-zinc-500'}`}
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* WALLET */}
            {activeApp === 'wallet' && (
                <div className="h-full flex flex-col bg-zinc-950 animate-fade-in relative z-10">
                    <div className="p-6 bg-gradient-to-br from-blue-600 to-blue-800 text-white pb-8 rounded-b-3xl shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><CreditCard size={120} /></div>
                        <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={handleBack}>
                            <ChevronLeft size={20} /> <span className="text-sm font-bold">Wallet</span>
                        </div>
                        <p className="text-blue-200 text-xs font-medium uppercase tracking-wider mb-1">Total Balance</p>
                        <h2 className="text-3xl font-bold tracking-tight">{formatCurrency(phoneData?.wallet.balance || 0)}</h2>
                        
                        <div className="flex gap-4 mt-6">
                            <button onClick={() => setActiveApp('transfer_select')} className="flex-1 bg-white/20 hover:bg-white/30 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 backdrop-blur-sm transition-colors">
                                <Send size={14} /> Transfer
                            </button>
                            <button className="flex-1 bg-white/20 hover:bg-white/30 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 backdrop-blur-sm transition-colors opacity-50 cursor-not-allowed">
                                <Clock size={14} /> History
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Recent Transactions</h3>
                        <div className="space-y-3">
                            {phoneData?.wallet.transactions.map((tx, i) => (
                                <div key={i} className="flex items-center gap-3 bg-zinc-900/50 p-3 rounded-xl border border-white/5">
                                    <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-lg">
                                        {tx.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-white">{tx.name}</h4>
                                        <p className="text-[10px] text-zinc-500">{tx.date}</p>
                                    </div>
                                    <span className={`text-xs font-bold ${tx.type === 'transfer' || tx.type === 'payment' ? 'text-red-400' : 'text-green-400'}`}>
                                        {tx.type === 'transfer' || tx.type === 'payment' ? '-' : '+'}{formatCurrency(tx.amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
            {/* TRANSFER: Select Contact */}
            {activeApp === 'transfer_select' && (
                <div className="h-full flex flex-col bg-zinc-950 animate-slide-left relative z-10">
                     <div className="p-4 border-b border-white/10 flex items-center gap-3">
                        <button onClick={handleBack} className="p-1"><ChevronLeft className="text-white" /></button>
                        <h2 className="text-lg font-bold text-white">Send to...</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                         {phoneData?.contacts.map(contact => (
                             <button 
                                key={contact.id} 
                                onClick={() => { setTransferTargetId(contact.id); setActiveApp('transfer_amount'); }}
                                className="w-full flex items-center gap-3 p-3 hover:bg-zinc-900 rounded-xl transition-colors"
                             >
                                 <img src={contact.avatar} className="w-10 h-10 rounded-full object-cover bg-zinc-800" />
                                 <span className="font-bold text-white text-sm">{contact.name}</span>
                             </button>
                         ))}
                    </div>
                </div>
            )}

            {/* TRANSFER: Enter Amount */}
            {activeApp === 'transfer_amount' && (
                <div className="h-full flex flex-col bg-zinc-950 animate-slide-left relative z-10 p-6">
                    <button onClick={handleBack} className="mb-8 w-8 h-8 flex items-center justify-center bg-zinc-900 rounded-full text-white"><ChevronLeft/></button>
                    <h2 className="text-xl font-bold text-white mb-2">Enter Amount</h2>
                    <p className="text-sm text-zinc-500 mb-8">Sending to {phoneData?.contacts.find(c => c.id === transferTargetId)?.name}</p>
                    
                    <div className="relative mb-8">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">Rp</span>
                        <input 
                            type="number" 
                            value={transferAmount}
                            onChange={e => setTransferAmount(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl py-4 pl-12 pr-4 text-2xl font-bold text-white focus:border-blue-500 outline-none"
                            placeholder="0"
                            autoFocus
                        />
                    </div>
                    
                    <button 
                        onClick={() => {
                            if (transferTargetId && transferAmount) {
                                onTransfer(parseInt(transferAmount), transferTargetId, "Transfer");
                                setTransferAmount('');
                                handleHome();
                            }
                        }}
                        disabled={!transferAmount || parseInt(transferAmount) <= 0}
                        className="w-full bg-blue-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold py-4 rounded-2xl transition-all active:scale-95"
                    >
                        Confirm Transfer
                    </button>
                </div>
            )}

            {/* JOBS */}
            {activeApp === 'jobs' && (
                <div className="h-full flex flex-col bg-zinc-50 animate-fade-in relative z-10">
                     <div className="bg-orange-500 p-4 pb-6 rounded-b-3xl shadow-lg">
                        <div className="flex items-center gap-2 mb-4 text-white cursor-pointer" onClick={handleBack}>
                            <ChevronLeft size={20} /> <span className="font-bold">JobHub</span>
                        </div>
                        <h2 className="text-2xl font-black text-white italic tracking-tighter">FIND YOUR<br/>DREAM JOB</h2>
                     </div>

                     <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {JOBS_DATA.map(job => {
                            const isApplied = phoneData?.activeJobs.includes(job.id);
                            return (
                                <div key={job.id} className="bg-white p-4 rounded-xl shadow-sm border border-zinc-200 flex flex-col gap-2">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg text-white ${job.color}`}>
                                                {job.icon}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-zinc-900 text-sm">{job.title}</h3>
                                                <p className="text-xs text-zinc-500">{job.company} • {job.type}</p>
                                                {/* ADDED: Working Hours Display */}
                                                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-zinc-500 font-mono bg-zinc-100 px-1.5 py-0.5 rounded w-fit">
                                                    <Clock size={10} />
                                                    {job.startHour.toString().padStart(2, '0')}:00 - {job.endHour.toString().padStart(2, '0')}:00
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100">
                                         <span className="text-xs font-bold text-green-600">
                                            {formatCurrency(job.salaryDaily)}<span className="text-zinc-400 font-normal">/day</span>
                                         </span>
                                         <button 
                                            onClick={() => handleJobToggle(job.id)}
                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-colors ${isApplied ? 'bg-red-100 text-red-600' : 'bg-zinc-900 text-white'}`}
                                         >
                                            {isApplied ? 'Resign' : 'Apply'}
                                         </button>
                                    </div>
                                </div>
                            );
                        })}
                     </div>
                </div>
            )}

            {/* SHOP */}
            {activeApp === 'shop' && (
                <div className="h-full flex flex-col bg-pink-50 animate-fade-in relative z-10">
                    <div className="p-4 bg-white/80 backdrop-blur sticky top-0 z-20 border-b border-pink-100 flex items-center justify-between">
                         <button onClick={handleBack}><ChevronLeft size={24} className="text-pink-600"/></button>
                         <h2 className="font-bold text-pink-600 flex items-center gap-1"><ShoppingBag size={18}/> Shop</h2>
                         <div className="w-6"></div>
                    </div>
                    
                    <div className="p-4 grid grid-cols-2 gap-3 overflow-y-auto">
                        {[
                            { name: "Coffee", price: 25000, icon: "☕" },
                            { name: "Flowers", price: 150000, icon: "💐" },
                            { name: "Gift Box", price: 250000, icon: "🎁" },
                            { name: "Chocolate", price: 50000, icon: "🍫" },
                            { name: "Sneakers", price: 1200000, icon: "👟" },
                            { name: "Watch", price: 2500000, icon: "⌚" },
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-3 rounded-xl shadow-sm flex flex-col items-center text-center gap-2">
                                <div className="text-4xl mb-1">{item.icon}</div>
                                <h3 className="text-sm font-bold text-zinc-800">{item.name}</h3>
                                <p className="text-xs text-pink-500 font-bold">{formatCurrency(item.price)}</p>
                                <button 
                                    onClick={() => {
                                        onPlaceOrder({ name: item.name, price: item.price, arrivalTime: virtualTime + 10000 });
                                        handleHome();
                                    }}
                                    className="w-full py-1.5 bg-pink-500 text-white rounded-lg text-[10px] font-bold mt-1 active:scale-95 transition-transform"
                                >
                                    BUY
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Home Indicator */}
        <div className="h-5 bg-black shrink-0 flex justify-center items-center relative z-20" onClick={handleHome}>
             <div className="w-24 h-1 bg-white/20 rounded-full"></div>
        </div>
    </div>
  );
};
