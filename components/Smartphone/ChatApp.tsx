import React, { useState, useRef, useEffect } from 'react';
import { CharacterPhoneData, Contact, addPhoneContact } from '../../services/smartphoneStorage';
import { ChevronLeft, Plus, UserPlus, Send, Phone, Video, CheckCheck, Smile, Cast } from 'lucide-react';

interface ChatAppProps {
    view: string;
    phoneData: CharacterPhoneData | null;
    activeContactId: string | null;
    activeCharacterId: string | null;
    isTyping?: boolean;
    virtualTime: number;
    onNavigate: (view: string) => void;
    onSelectContact: (id: string | null) => void;
    onSendMessage: (text: string, contactId: string) => void;
    refreshData: () => void;
    onCall?: (contactId: string) => void;
    onVideoCall?: (contactId: string) => void;
    onShowChat?: () => void;
}

export const ChatApp: React.FC<ChatAppProps> = ({
    view, phoneData, activeContactId, activeCharacterId, isTyping, virtualTime,
    onNavigate, onSelectContact, onSendMessage, refreshData, onCall, onVideoCall, onShowChat
}) => {
    const [newContactName, setNewContactName] = useState('');
    const [newContactDesc, setNewContactDesc] = useState('');
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (view === 'chat_detail') {
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [phoneData, view, activeContactId, isTyping]);

    const handleSendMessageInternal = () => {
        if (!inputText.trim() || !activeContactId) return;
        onSendMessage(inputText, activeContactId);
        setInputText('');
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    if (view === 'chat') {
        return (
            <div className="h-full flex flex-col bg-black animate-fade-in relative z-10">
                <div className="p-4 bg-zinc-900/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <button onClick={() => onNavigate('home')} className="p-1 text-blue-500 hover:text-blue-400 transition-colors"><ChevronLeft size={24} /></button>
                        <h2 className="text-xl font-bold text-white tracking-tight">Chats</h2>
                    </div>
                    <button onClick={() => onNavigate('add_contact')} className="text-blue-500 hover:text-blue-400 p-2 rounded-full hover:bg-blue-500/10 transition-colors">
                        <Plus size={24} />
                    </button>
                </div>
                <div className="px-4 py-2 bg-black">
                    <div className="bg-zinc-900 rounded-xl px-3 py-2 flex items-center gap-2">
                        <UserPlus size={16} className="text-zinc-600" />
                        <span className="text-zinc-600 text-xs font-medium">Search conversations...</span>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {phoneData?.contacts.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-40 text-zinc-600">
                            <p className="text-xs">No contacts yet.</p>
                        </div>
                    )}
                    {phoneData?.contacts.map(contact => {
                        const isThisContactTyping = isTyping && (contact.id === activeCharacterId || contact.id === activeContactId);
                        const previewSafeText = contact.lastMessage.replace('||SETTINGS||', '<Settings>');
                        const timeString = new Date(contact.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
                        
                        return (
                            <div 
                                key={contact.id}
                                onClick={() => { onSelectContact(contact.id); onNavigate('chat_detail'); }}
                                className="flex items-center gap-3 p-3 pl-4 hover:bg-zinc-900 border-b border-zinc-900/50 cursor-pointer transition-colors group"
                            >
                                <div className="relative">
                                    <img src={contact.avatar} className="w-12 h-12 rounded-full bg-zinc-800 object-cover border border-zinc-800" />
                                    {contact.isOnline && (
                                        <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h3 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">{contact.name}</h3>
                                        <span className={`text-[10px] ${contact.unread > 0 ? 'text-blue-500 font-bold' : 'text-zinc-600'}`}>{timeString}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className={`text-xs truncate max-w-[85%] ${contact.unread > 0 ? 'text-white font-medium' : 'text-zinc-500'}`}>
                                            {isThisContactTyping ? <span className="text-blue-400 italic animate-pulse">Typing...</span> : previewSafeText}
                                        </p>
                                        {contact.unread > 0 && (
                                            <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-[9px] font-bold text-white">
                                                {contact.unread}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (view === 'add_contact') {
        return (
            <div className="h-full flex flex-col bg-zinc-950 animate-slide-left relative z-10 p-6">
                <div className="flex items-center gap-2 mb-8">
                    <button onClick={() => { onNavigate('chat'); setNewContactName(''); setNewContactDesc(''); }} className="p-1 text-blue-500"><ChevronLeft size={24} /></button>
                    <h2 className="text-xl font-bold text-white">New Contact</h2>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center mb-4 border border-zinc-700 overflow-hidden shadow-2xl">
                            {newContactName ? (
                                <img src={`https://api.dicebear.com/7.x/micah/svg?seed=${newContactName}&backgroundColor=b6e3f4`} className="w-full h-full object-cover" />
                            ) : (
                                <UserPlus size={40} className="text-zinc-500" />
                            )}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-zinc-500 font-bold uppercase ml-2 mb-1 block">Contact Name</label>
                            <input 
                                type="text" 
                                value={newContactName}
                                onChange={(e) => setNewContactName(e.target.value)}
                                placeholder="Enter name..."
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none transition-colors text-lg"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 font-bold uppercase ml-2 mb-1 block">Personality Description</label>
                            <textarea 
                                value={newContactDesc}
                                onChange={(e) => setNewContactDesc(e.target.value)}
                                placeholder="Describe their personality (e.g. Strict but caring, Funny, Shy)..."
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none transition-colors text-sm h-32 resize-none"
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
                                        isSystem: false,
                                        description: newContactDesc.trim() 
                                    };
                                    addPhoneContact(activeCharacterId, newContact);
                                    setNewContactName('');
                                    setNewContactDesc('');
                                    refreshData();
                                    onNavigate('chat');
                                }
                            }}
                            disabled={!newContactName.trim()}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 mt-4 text-sm uppercase tracking-wide"
                        >
                            Save Contact
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'chat_detail' && activeContactId) {
        const contact = phoneData?.contacts.find(c => c.id === activeContactId);
        
        const getStatus = () => {
            if (isTyping) return "typing...";
            if (contact?.isOnline) return "online";
            return `last seen ${new Date(virtualTime - 300000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`;
        };

        return (
            <div className="h-full flex flex-col bg-[#0b141a] animate-slide-left relative z-10">
                <div className="px-2 py-2 bg-zinc-900/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between shrink-0 z-20 shadow-sm">
                     <div className="flex items-center gap-1 overflow-hidden">
                         <button onClick={() => { onNavigate('chat'); onSelectContact(null); }} className="text-blue-500 flex items-center text-sm font-medium p-1 hover:bg-white/5 rounded-full transition-colors">
                             <ChevronLeft size={24}/>
                         </button>
                         <div className="flex items-center gap-3">
                             <img src={contact?.avatar} className="w-9 h-9 rounded-full object-cover" />
                             <div className="flex flex-col">
                                 <span className="font-bold text-white text-sm truncate leading-tight">
                                     {contact?.name}
                                 </span>
                                 <span className={`text-[10px] leading-tight ${isTyping ? 'text-blue-400 font-bold animate-pulse' : 'text-zinc-500'}`}>
                                     {getStatus()}
                                 </span>
                             </div>
                         </div>
                     </div>
                     <div className="flex items-center text-blue-500 gap-1">
                         <button onClick={onShowChat} className="p-2 hover:bg-white/5 rounded-full" title="Show Chat">
                             <Cast size={20} />
                         </button>
                         <button onClick={() => onVideoCall && onVideoCall(activeContactId)} className="p-2 hover:bg-white/5 rounded-full"><Video size={20}/></button>
                         <button onClick={() => onCall && onCall(activeContactId)} className="p-2 hover:bg-white/5 rounded-full"><Phone size={18}/></button>
                     </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0b141a] bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-opacity-5">
                     <div className="flex justify-center mb-4">
                         <div className="bg-[#1f2c34] text-yellow-500/80 text-[10px] px-3 py-1.5 rounded-lg text-center shadow-sm max-w-[80%] leading-relaxed border border-yellow-500/10">
                             Messages are end-to-end encrypted. No one outside of this chat, not even Pasco, can read or listen to them.
                         </div>
                     </div>

                     {phoneData?.messages[activeContactId]?.map((msg, idx) => {
                         const isLast = idx === phoneData.messages[activeContactId]!.length - 1;
                         const showTail = isLast || phoneData.messages[activeContactId]![idx + 1]?.isMe !== msg.isMe;

                         return (
                             <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'} mb-1`}>
                                 <div className={`
                                     max-w-[80%] px-3 py-1.5 text-sm leading-relaxed relative shadow-sm
                                     ${msg.isMe 
                                         ? 'bg-[#005c4b] text-[#e9edef] rounded-lg rounded-tr-none' 
                                         : 'bg-[#202c33] text-[#e9edef] rounded-lg rounded-tl-none'
                                     }
                                     ${!showTail && msg.isMe ? 'rounded-tr-lg mr-2' : ''}
                                     ${!showTail && !msg.isMe ? 'rounded-tl-lg ml-2' : ''}
                                     ${showTail && msg.isMe ? 'rounded-tr-none' : ''}
                                     ${showTail && !msg.isMe ? 'rounded-tl-none' : ''}
                                 `}>
                                     {showTail && msg.isMe && (
                                         <svg viewBox="0 0 8 13" height="13" width="8" className="absolute top-0 -right-[8px] text-[#005c4b] fill-current"><path d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z"></path></svg>
                                     )}
                                     {showTail && !msg.isMe && (
                                         <svg viewBox="0 0 8 13" height="13" width="8" className="absolute top-0 -left-[8px] text-[#202c33] fill-current scale-x-[-1]"><path d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z"></path></svg>
                                     )}

                                     <span className="whitespace-pre-wrap">
                                         {msg.text.replace('||SETTINGS||', '<Settings>')}
                                     </span>
                                     <div className="flex justify-end items-center gap-1 mt-0.5 select-none">
                                         <span className="text-[9px] text-white/50">
                                             {new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                         </span>
                                         {msg.isMe && (
                                             <CheckCheck size={12} className="text-blue-400" />
                                         )}
                                     </div>
                                 </div>
                             </div>
                         );
                     })}
                     
                     {isTyping && (
                         <div className="flex justify-start animate-fade-in pl-2">
                             <div className="bg-[#202c33] text-zinc-400 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1 shadow-sm">
                                 <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                 <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                 <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></div>
                             </div>
                         </div>
                     )}
                     <div ref={messagesEndRef} className="h-2" />
                </div>

                <div className="p-2 bg-[#202c33] shrink-0 flex items-end gap-2 pb-6 md:pb-2">
                    <button className="p-3 text-zinc-400 hover:text-zinc-200 transition-colors">
                        <Plus size={20} />
                    </button>
                    <div className="flex-1 bg-[#2a3942] rounded-2xl flex items-center min-h-[42px] px-3 py-1">
                        <input 
                            type="text" 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessageInternal()}
                            placeholder="Message"
                            className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-200 placeholder-zinc-500 py-2"
                        />
                        <button className="text-zinc-400 hover:text-zinc-200 ml-2">
                            <Smile size={20} />
                        </button>
                    </div>
                    <button 
                        onClick={handleSendMessageInternal}
                        className={`p-3 rounded-full flex items-center justify-center transition-all duration-200 ${inputText.trim() ? 'bg-[#005c4b] text-white hover:bg-[#007a65]' : 'bg-[#2a3942] text-zinc-500'}`}
                    >
                        <Send size={18} className={inputText.trim() ? "translate-x-0.5" : ""} />
                    </button>
                </div>
            </div>
        );
    }

    return null;
};