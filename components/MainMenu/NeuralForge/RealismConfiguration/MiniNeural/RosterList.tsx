
import React from 'react';
import { Contact } from '../../../../../services/smartphoneStorage';
import { Users, RefreshCw, Smartphone, ChevronRight, ArrowLeft } from 'lucide-react';

interface RosterListProps {
    contacts: Contact[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onReset: () => void;
    onBack: () => void;
}

export const RosterList: React.FC<RosterListProps> = ({ contacts, selectedId, onSelect, onReset, onBack }) => {
    return (
        <div className="flex flex-col h-full bg-zinc-950">
            {/* Header */}
            <div className="h-14 md:h-16 px-4 md:px-6 border-b border-blue-500/20 flex items-center justify-between bg-zinc-900/40 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={onBack} 
                        className="p-2 -ml-2 text-zinc-500 hover:text-white transition-colors active:scale-90"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                        <Users size={16} className="text-blue-500" />
                        <h2 className="text-[11px] md:text-xs font-black text-white uppercase tracking-[0.15em]">
                            NPC Roster
                        </h2>
                    </div>
                </div>
                <button 
                    onClick={onReset} 
                    className="p-2 hover:bg-white/5 rounded-full text-zinc-500 hover:text-blue-400 transition-colors active:scale-90"
                    title="Reset Roster"
                >
                    <RefreshCw size={14} />
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 pb-24">
                {contacts.map(contact => (
                    <div 
                        key={contact.id}
                        onClick={() => onSelect(contact.id)}
                        className={`
                            p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-4 group active:scale-[0.98]
                            ${selectedId === contact.id 
                                ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-900/20' 
                                : 'bg-zinc-900/40 border-white/5 hover:border-blue-500/30 hover:bg-zinc-900/60'}
                        `}
                    >
                        <div className="relative shrink-0">
                            <img 
                                src={contact.avatar} 
                                className={`w-11 h-11 rounded-full object-cover border-2 transition-colors ${selectedId === contact.id ? 'border-white/40' : 'border-white/10 group-hover:border-blue-500/40 shadow-md'}`} 
                                alt={contact.name} 
                            />
                            {contact.isSystem && (
                                <div className="absolute -bottom-0.5 -right-0.5 bg-zinc-950 rounded-full p-1 border border-zinc-800 shadow-sm">
                                    <Smartphone size={8} className="text-blue-400" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className={`text-sm font-bold truncate leading-tight ${selectedId === contact.id ? 'text-white' : 'text-zinc-200'}`}>
                                {contact.name}
                            </h4>
                            <p className={`text-[10px] truncate mt-1 font-medium font-mono ${selectedId === contact.id ? 'text-blue-100' : 'text-zinc-500'}`}>
                                {contact.id.toUpperCase()}
                            </p>
                        </div>
                        <ChevronRight size={16} className={`${selectedId === contact.id ? 'text-white' : 'text-zinc-700'} group-hover:translate-x-0.5 transition-transform`} />
                    </div>
                ))}
            </div>
        </div>
    );
};
