
import React from 'react';
import { Binary, Globe, Wifi, Activity } from 'lucide-react';

interface FooterProps {
    bootSequence: number;
}

export const Footer: React.FC<FooterProps> = ({ bootSequence }) => {
    return (
        <div className="w-full max-w-5xl z-20 animate-in fade-in duration-1000 delay-500">
            
            {/* MOBILE FOOTER: Floating Compact Glass */}
            <div className="md:hidden fixed bottom-6 left-6 right-6 bg-[#0f0f11]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative w-8 h-8 flex items-center justify-center">
                         <div className="absolute inset-0 bg-violet-500/20 rounded-full animate-ping"></div>
                         <div className="relative bg-zinc-900 border border-white/10 rounded-full p-1.5 text-violet-400">
                             <Activity size={16} />
                         </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Pasco OS</span>
                        <span className="text-[8px] font-mono text-zinc-500">v0.8.4 • Stable</span>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1.5 text-[9px] font-mono text-cyan-400">
                        <span className="animate-pulse">●</span>
                        <span>{bootSequence}%</span>
                    </div>
                    <div className="w-16 h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-violet-500 to-cyan-500" 
                            style={{ width: `${bootSequence}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* DESKTOP FOOTER: Full Info Bar */}
            <div className="hidden md:flex w-full justify-between items-end border-t border-white/5 pt-6 pb-6">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-600">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#0f0f11] border border-white/5">
                            <Binary size={10} className="text-violet-500" />
                            <span>HASH: 0x8F2A...9C1</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#0f0f11] border border-white/5">
                            <Globe size={10} className="text-cyan-500" />
                            <span>ASIA/JKT</span>
                        </div>
                    </div>
                    <div className="text-[9px] text-zinc-500 font-medium tracking-wide uppercase opacity-70">
                        Pasco Neural Interface v0.8.4 // Stable Channel
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="text-right">
                            <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1 flex justify-end items-center gap-2">
                                <Wifi size={10} className={bootSequence > 80 ? "text-violet-500 animate-pulse" : "text-zinc-600"} />
                                System Integrity
                            </div>
                            <div className="text-lg font-mono text-zinc-200 font-bold tabular-nums">{bootSequence}%</div>
                    </div>
                    
                    <div className="w-32 h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                        <div 
                            className="h-full bg-gradient-to-r from-violet-600 to-cyan-400 transition-all duration-100 ease-out shadow-[0_0_10px_#8b5cf6]" 
                            style={{ width: `${bootSequence}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
