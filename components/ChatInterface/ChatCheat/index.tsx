
import React, { useState } from 'react';
import { X, Terminal, Brain, ShieldAlert, Command } from 'lucide-react';
import { Character } from '../../../types';
import { NeuroCheat } from './NeuroCheat';

interface ChatCheatProps {
    isOpen: boolean;
    onClose: () => void;
    activeChar: Character;
    onUpdateCharacter: (char: Character) => void;
}

export const ChatCheat: React.FC<ChatCheatProps> = ({ isOpen, onClose, activeChar, onUpdateCharacter }) => {
    const [activeTab, setActiveTab] = useState<'neuro' | 'system'>('neuro');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
            <div className="w-full max-w-lg bg-[#0a0a0c] border border-green-500/30 rounded-2xl shadow-[0_0_50px_rgba(34,197,94,0.1)] flex flex-col max-h-[85vh] overflow-hidden relative">
                
                {/* Header (Terminal Style) */}
                <div className="bg-green-950/20 border-b border-green-500/20 p-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2 text-green-500">
                        <Terminal size={18} />
                        <h2 className="text-sm font-bold font-mono tracking-widest uppercase">System_Override_V1.0</h2>
                    </div>
                    <button onClick={onClose} className="text-green-700 hover:text-green-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-green-500/20 bg-black/40 shrink-0">
                    <button 
                        onClick={() => setActiveTab('neuro')}
                        className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'neuro' ? 'bg-green-500/10 text-green-400 border-b-2 border-green-500' : 'text-zinc-600 hover:text-green-600 hover:bg-green-500/5'}`}
                    >
                        <Brain size={14} /> NeuroSense
                    </button>
                    <button 
                        onClick={() => setActiveTab('system')}
                        className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'system' ? 'bg-green-500/10 text-green-400 border-b-2 border-green-500' : 'text-zinc-600 hover:text-green-600 hover:bg-green-500/5'}`}
                    >
                        <ShieldAlert size={14} /> System Flags
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
                    {activeTab === 'neuro' && (
                        <NeuroCheat 
                            character={activeChar} 
                            onChange={onUpdateCharacter} 
                        />
                    )}
                    {activeTab === 'system' && (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-2 opacity-50">
                            <Command size={32} />
                            <p className="text-xs font-mono uppercase">System Flags Module: Offline</p>
                        </div>
                    )}
                </div>

                {/* Footer Status */}
                <div className="p-2 border-t border-green-500/20 bg-black/60 text-center shrink-0">
                    <p className="text-[9px] font-mono text-green-600/50 uppercase tracking-[0.2em] animate-pulse">
                        Injecting variables into active session...
                    </p>
                </div>
            </div>
        </div>
    );
};
