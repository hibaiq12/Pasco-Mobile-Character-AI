
import React from 'react';
import { Contact } from '../../../../../services/smartphoneStorage';
import { Users, RefreshCw, Smartphone, ChevronRight, ArrowLeft, Search } from 'lucide-react';

interface RosterListProps {
    contacts: Contact[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onReset: () => void;
    onBack: () => void;
}

export const RosterList: React.FC<RosterListProps> = ({ contacts, selectedId, onSelect, onReset, onBack }) => {
    return (
        <div className="flex flex-col h-full w-full p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <button onClick={onBack} className="p-2 -ml-2 text-zinc-500 hover:text-white transition-all active:scale-90">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex flex-col items-center">
                    <h2 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Neural Roster</h2>
                    <div className="w-10 h-0.5 bg-blue-600 rounded-full mt-1"></div>
                </div>
                <button onClick={onReset} className="p-2 -mr-2 text-zinc-600 hover:text-red-400 transition-colors">
                    <RefreshCw size={16} />
                </button>
            </div>

            {/* Search Simulation */}
            <div className="relative mb-6 group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-700">
                    <Search size={14} />
                </div>
                <input 
                    type="text" 
                    placeholder="Search node..."
                    className="w-full bg-zinc-900/40 border border-white/5 rounded-2xl py-2.5 pl-9 pr-4 text-xs text-zinc-300 placeholder-zinc-700 outline-none focus:border-blue-500/30 transition-all"
                />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pb-8">
                {contacts.map(contact => (
                    <div 
                        key={contact.id}
                        onClick={() => onSelect(contact.id)}
                        className="group relative p-4 rounded-[1.5rem] bg-zinc-900/20 border border-white/5 hover:bg-zinc-900/40 hover:border-white/10 transition-all cursor-pointer active:scale-95"
                    >
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="relative">
                                <img src={contact.avatar} className="w-12 h-12 rounded-2xl object-cover border border-white/10 grayscale group-hover:grayscale-0 transition-all duration-500" alt="" />
                                {contact.isSystem && (
                                    <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-lg shadow-xl">
                                        <Smartphone size={8} />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-zinc-200 group-hover:text-blue-400 transition-colors truncate">
                                    {contact.name}
                                </h4>
                                <p className="text-[9px] text-zinc-600 font-mono tracking-tighter truncate">
                                    NODE_{contact.id.toUpperCase().slice(-6)}
                                </p>
                            </div>
                            <ChevronRight size={14} className="text-zinc-700 group-hover:text-blue-500 transition-colors" />
                        </div>
                        
                        {/* Selected Indicator */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                ))}
            </div>

            {/* Footer Stat */}
            <div className="pt-4 border-t border-white/5 flex justify-center">
                <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest">
                    Synchronized Entities: {contacts.length}
                </span>
            </div>
        </div>
    );
};
