
import React from 'react';
import { Hexagon, Cpu, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
    return (
        <div className="flex flex-col items-center animate-in fade-in slide-in-from-top-10 duration-1000 z-20">
            <div className="relative mb-6 md:mb-10 group cursor-default">
                {/* Rotating Outer Ring */}
                <div className="absolute inset-[-15px] rounded-full border border-violet-500/10 border-t-violet-400/30 animate-spin-slow"></div>
                <div className="absolute inset-[-25px] rounded-full border border-transparent border-b-blue-500/20 animate-spin-slow direction-reverse" style={{ animationDirection: 'reverse', animationDuration: '20s' }}></div>
                
                {/* Logo Container */}
                <div className="w-20 h-20 md:w-28 md:h-28 bg-[#0c0c0e]/80 backdrop-blur-xl rounded-3xl border border-white/10 flex items-center justify-center relative shadow-[0_0_60px_rgba(139,92,246,0.15)] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/10 to-transparent"></div>
                    
                    {/* Inner Logo Icon */}
                    <div className="relative z-10 text-white drop-shadow-[0_0_15px_rgba(167,139,250,0.6)]">
                        <Hexagon size={40} className="md:w-14 md:h-14 text-zinc-400 fill-[#050505] stroke-[1.5]" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Cpu size={18} className="md:w-6 md:h-6 text-violet-400 animate-pulse" />
                        </div>
                    </div>

                    {/* Corner Accents */}
                    <div className="absolute top-2 left-2 w-1 h-1 bg-violet-400/50 rounded-full"></div>
                    <div className="absolute top-2 right-2 w-1 h-1 bg-violet-400/50 rounded-full"></div>
                    <div className="absolute bottom-2 left-2 w-1 h-1 bg-violet-400/50 rounded-full"></div>
                    <div className="absolute bottom-2 right-2 w-1 h-1 bg-violet-400/50 rounded-full"></div>
                </div>
                
                {/* Mobile Sparkle Decor */}
                <div className="md:hidden absolute -top-4 -right-4 text-violet-400 opacity-50 animate-pulse">
                    <Sparkles size={20} />
                </div>
            </div>

            <div className="text-center space-y-2">
                <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-violet-100 to-zinc-500 drop-shadow-sm">
                    PASCO
                </h1>
                <div className="flex items-center justify-center gap-3 opacity-80">
                    <div className="h-px w-6 md:w-12 bg-gradient-to-r from-transparent to-violet-500/50"></div>
                    <p className="text-[10px] md:text-xs font-mono text-violet-200/70 tracking-[0.3em] uppercase">Neural Interface Gateway</p>
                    <div className="h-px w-6 md:w-12 bg-gradient-to-l from-transparent to-violet-500/50"></div>
                </div>
            </div>
        </div>
    );
};
