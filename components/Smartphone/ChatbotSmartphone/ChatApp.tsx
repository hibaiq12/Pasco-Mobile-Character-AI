
import React, { useRef, useEffect } from 'react';
import { CharacterPhoneData } from '../../../services/smartphoneStorage';
import { ChevronLeft, User, MessageCircle } from 'lucide-react';

interface ChatAppProps {
    view: string;
    phoneData: CharacterPhoneData | null;
    activeContactId: string | null;
    virtualTime: number;
    onNavigate: (view: string) => void;
    onSelectContact: (id: string | null) => void;
    onSendMessage: (text: string, contactId: string) => void;
    activeCharacterId?: string | null;
    refreshData?: () => void;
}

export const ChatApp: React.FC<ChatAppProps> = ({
    view, phoneData, activeContactId, virtualTime,
    onNavigate, onSelectContact, onSendMessage,
    activeCharacterId, refreshData
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (view === 'chat_detail') {
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [view, activeContactId]);

    // LIST VIEW
    if (view === 'chat') {
        return (
            <div className="h-full flex flex-col bg-black animate-fade-in relative z-10">
                <div className="p-4 bg-zinc-900/80 backdrop-blur-md border-b border-white/5 flex items-center gap-3 sticky top-0 z-20">
                    <button onClick={() => onNavigate('home')} className="p-1 text-blue-500"><ChevronLeft size={24} /></button>
                    <h2 className="text-xl font-bold text-white tracking-tight">Bot Chats</h2>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    {phoneData?.contacts.map(contact => (
                        <div 
                            key={contact.id}
                            onClick={() => { onSelectContact(contact.id); onNavigate('chat_detail'); }}
                            className="flex items-center gap-3 p-3 hover:bg-zinc-900 rounded-xl cursor-pointer transition-colors border-b border-white/5"
                        >
                            <img src={contact.avatar} className="w-12 h-12 rounded-full bg-zinc-800 object-cover" />
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <h3 className="font-bold text-white text-sm">{contact.name}</h3>
                                    <span className="text-[10px] text-zinc-500">{new Date(contact.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                </div>
                                <p className="text-xs text-zinc-500 truncate">{contact.lastMessage}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // DETAIL VIEW
    if (view === 'chat_detail' && activeContactId) {
        const contact = phoneData?.contacts.find(c => c.id === activeContactId);
        
        return (
            <div className="h-full flex flex-col bg-[#0b141a] animate-slide-left relative z-10">
                <div className="p-2 bg-zinc-900/90 backdrop-blur-md border-b border-white/5 flex items-center gap-2 shrink-0 z-20">
                     <button onClick={() => { onNavigate('chat'); onSelectContact(null); }} className="text-blue-500 p-1">
                         <ChevronLeft size={24}/>
                     </button>
                     <img src={contact?.avatar} className="w-8 h-8 rounded-full object-cover" />
                     <span className="font-bold text-white text-sm truncate flex-1">{contact?.name}</span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black/50">
                     {/* For Bot Phone, we only show Read-Only history usually, or simplified */}
                     {/* Assuming Bot sees messages stored in its storage key */}
                     <div className="flex justify-center my-4">
                        <span className="text-[10px] text-zinc-500 bg-zinc-900 px-3 py-1 rounded-full">Encrypted Connection</span>
                     </div>
                     {/* Normally we would map messages here similar to User phone but read from Bot Data */}
                     <div className="flex flex-col items-center justify-center h-full text-zinc-600 space-y-2">
                        <MessageCircle size={32} />
                        <p className="text-xs text-center px-6">
                            This interface allows the persona to view their communication logs. 
                            <br/>(Visual Representation Only)
                        </p>
                     </div>
                </div>
            </div>
        );
    }

    return null;
};
