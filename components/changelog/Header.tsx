
import React from 'react';
import { t } from '../../services/translationService';
import { Zap } from 'lucide-react';

export const Header: React.FC = () => {
    return (
        <div className="relative">
            <div className="flex items-center gap-3 mb-3">
                <span className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.2)] flex items-center gap-1">
                    <Zap size={10} fill="currentColor" />
                    {t('changelog.massive')}
                </span>
                <span className="text-zinc-600 text-[10px] font-mono tracking-wider border-l border-zinc-800 pl-3">
                    BUILD_HASH: v0.8.4
                </span>
            </div>
          
            <h2 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tighter">
                PASCO <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-200 group-hover:animate-glitch inline-block">REALISM</span>
            </h2>
            <p className="text-sm text-zinc-400 font-medium max-w-md leading-relaxed">
                The boundary between simulation and reality has been dissolved. Welcome to the White & Blue era.
            </p>
            
            {/* Animated Gradient Line */}
            <div className="mt-8 mb-8 relative w-full">
                 {/* Container Background */}
                 <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                    {/* The Bar */}
                    <div className="h-full w-full bg-gradient-to-r from-blue-600 via-blue-400 to-white shadow-[0_0_50px_rgba(59,130,246,1)] animate-expand-line origin-left rounded-full"></div>
                 </div>
                 
                 {/* Moving Shine Effect */}
                 <div className="absolute top-0 left-0 h-1.5 w-full overflow-hidden rounded-full pointer-events-none mix-blend-overlay">
                    <div className="w-20 h-full bg-white/40 blur-md animate-[shine_2s_infinite]"></div>
                 </div>
            </div>
        </div>
    );
};
