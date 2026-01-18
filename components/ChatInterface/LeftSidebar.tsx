import React from 'react';
import { Character, Message, OutfitItem } from '../../types';
import { Activity, Brain, Eye, Zap, Fingerprint, Layers, Shield, Hash, BarChart3, X } from 'lucide-react';
import { useProfileEngine } from './ProfileEngine';

interface LeftSidebarProps {
    activeChar: Character;
    messages: Message[];
    outfits?: OutfitItem[];
    virtualTime: number;
    isMobile?: boolean;
    onClose?: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ activeChar, messages, outfits = [], virtualTime, isMobile, onClose }) => {
    
    // Initialize Realtime Engine
    const profile = useProfileEngine(activeChar, messages, outfits, virtualTime);

    return (
        <div className={`
            flex-col font-sans overflow-hidden transition-all duration-300
            ${isMobile 
                ? 'flex fixed inset-0 z-[60] w-full h-full bg-black/95 backdrop-blur-xl p-6 animate-in fade-in slide-in-from-bottom-4' 
                : 'hidden lg:flex w-80 border-r border-white/5 bg-[#0a0a0a] z-10 p-6 relative shadow-2xl h-full'
            }
        `}>
            
            {/* Ambient Background Glow based on Stability */}
            <div 
                className="absolute top-0 left-0 right-0 h-96 opacity-10 pointer-events-none transition-colors duration-1000"
                style={{ 
                    background: `radial-gradient(circle at 50% 0%, ${profile.psyche.stability < 40 ? '#ef4444' : '#8b5cf6'}, transparent 70%)` 
                }}
            />

            {/* Mobile Close Button */}
            {isMobile && (
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 z-50 p-2.5 bg-zinc-800/50 rounded-full text-zinc-400 hover:text-white border border-white/10 active:scale-95 transition-all shadow-lg backdrop-blur-md"
                >
                    <X size={24} />
                </button>
            )}

            {/* --- 1. CHARACTER HEADER --- */}
            <div className="relative group rounded-[2rem] overflow-hidden shadow-lg border border-white/5 bg-zinc-900 mb-6 shrink-0 aspect-[4/5] md:aspect-auto md:h-64">
                <img 
                    src={activeChar.avatar} 
                    className="w-full h-full object-cover transition-transform duration-[20s] ease-linear group-hover:scale-110 opacity-90 group-hover:opacity-100" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
                
                <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h2 className="text-3xl font-black text-white leading-none mb-2 tracking-tighter drop-shadow-xl">{activeChar.name}</h2>
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px_currentColor] ${profile.psyche.stability < 40 ? 'text-red-500 bg-red-500' : 'text-green-500 bg-green-500'}`}></span>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">
                            NEURAL SYNC ACTIVE
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-1 relative z-10 pb-10">
                
                {/* --- 2. VISUAL STATE (LIVE) --- */}
                <div className="space-y-2 animate-fade-in">
                    <div className="flex items-center gap-2 text-cyan-400 text-[10px] font-bold uppercase tracking-widest pb-1 border-b border-white/5">
                        <Eye size={12} /> Visual State (Live)
                    </div>
                    <div className="bg-zinc-900/50 p-3 rounded-xl border border-white/5 text-xs text-zinc-300 leading-relaxed font-medium shadow-inner">
                        {profile.visualState}
                    </div>
                </div>

                {/* --- 3. PSYCHE STABILITY --- */}
                <div className="space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between text-rose-400 text-[10px] font-bold uppercase tracking-widest pb-1 border-b border-white/5">
                        <div className="flex items-center gap-2"><Activity size={12} /> Psyche Stability</div>
                        <span className="font-mono">{profile.psyche.stability}%</span>
                    </div>
                    
                    <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-white/5">
                        <div 
                            className={`h-full transition-all duration-1000 ease-out relative ${profile.psyche.stability < 40 ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-rose-500 shadow-[0_0_10px_#f43f5e]'}`}
                            style={{ width: `${profile.psyche.stability}%` }}
                        ></div>
                    </div>
                    
                    {profile.psyche.warning ? (
                        <p className="text-[9px] text-red-500 font-bold italic text-right animate-pulse">
                            {profile.psyche.warning}
                        </p>
                    ) : (
                        <p className="text-[9px] text-zinc-600 italic text-right">System Nominal</p>
                    )}
                </div>

                {/* --- 4. SOCIAL PROTOCOL --- */}
                <div className="space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between text-violet-400 text-[10px] font-bold uppercase tracking-widest pb-1 border-b border-white/5">
                        <div className="flex items-center gap-2"><Fingerprint size={12} /> Social Protocol</div>
                        <span className="bg-violet-900/30 px-1.5 py-0.5 rounded text-violet-300 border border-violet-500/20">LEVEL {profile.social.level}</span>
                    </div>
                    
                    <div className="bg-zinc-900/30 p-3 rounded-xl border border-white/5">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">{profile.social.label}</span>
                            <span className="text-[9px] text-zinc-400 font-mono">{Math.floor(profile.social.trust)}/{profile.social.maxTrust}</span>
                        </div>
                        <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-violet-500 shadow-[0_0_10px_#8b5cf6] transition-all duration-1000 ease-out"
                                style={{ width: `${profile.social.percent}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* --- 5. DEEP LAYER DRIFT (GRID) --- */}
                <div className="space-y-2 animate-fade-in">
                    <div className="flex items-center gap-2 text-amber-400 text-[10px] font-bold uppercase tracking-widest pb-1 border-b border-white/5">
                        <Layers size={12} /> Deep Layer Drift
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-zinc-900/50 p-3 rounded-xl border border-white/5 flex flex-col gap-1">
                            <span className="text-[8px] text-zinc-600 uppercase font-bold tracking-wider">Alignment</span>
                            <span className="text-[10px] text-zinc-200 font-bold truncate">{profile.duality.alignment}</span>
                        </div>
                        <div className="bg-zinc-900/50 p-3 rounded-xl border border-white/5 flex flex-col gap-1">
                            <span className="text-[8px] text-zinc-600 uppercase font-bold tracking-wider">Mask Integrity</span>
                            <span className={`text-[10px] font-bold truncate ${profile.duality.integrityColor}`}>
                                {profile.duality.maskIntegrity}
                            </span>
                        </div>
                    </div>
                </div>

                {/* --- 6. ACTIVE MEMORY ENGRAM --- */}
                <div className="space-y-2 animate-fade-in pb-4">
                    <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold uppercase tracking-widest pb-1 border-b border-white/5">
                        <Brain size={12} /> Active Memory Engram
                    </div>
                    <div className="bg-black/60 p-3 rounded-xl border border-emerald-500/10 relative overflow-hidden group">
                        {/* Scanning Line Effect */}
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-emerald-500/50 shadow-[0_0_10px_#10b981] animate-[scan_3s_linear_infinite] opacity-50 pointer-events-none"></div>
                        
                        <p className="text-[10px] text-emerald-200/80 font-mono leading-relaxed relative z-10 break-words">
                            FOCUS: <span className="text-emerald-400">[{profile.memory.focus.join(', ')}]</span>
                        </p>
                    </div>
                </div>

                {/* --- 7. CORE DIRECTIVE (STATIC) --- */}
                <div className="pt-2 border-t border-white/5">
                    <div className="flex items-center justify-between text-zinc-600 text-[9px] font-bold uppercase tracking-widest mb-2">
                        <span className="flex items-center gap-2"><Shield size={10} /> Core Directive</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                        "{activeChar.description.slice(0, 100)}{activeChar.description.length > 100 ? '...' : ''}"
                    </p>
                </div>

            </div>
        </div>
    );
};