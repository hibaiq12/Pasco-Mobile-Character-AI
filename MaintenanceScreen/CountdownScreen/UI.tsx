
import React from 'react';
import { Sparkles, PartyPopper, Zap } from 'lucide-react';
import { COUNTDOWN_MESSAGES } from './Messages';
import { useCountdownLogic } from './Logic';

export const CountdownUI: React.FC<{ onUnlock: () => void }> = ({ onUnlock }) => {
    const { progress, timeLeft, statusText } = useCountdownLogic(onUnlock);

    return (
        <div className="fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center p-8 text-white select-none overflow-hidden font-sans">
            
            {/* --- BACKGROUND ATMOSPHERE (Fireworks/Party Vibe) --- */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/40 via-black to-black pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-amber-600/20 via-transparent to-transparent pointer-events-none animate-pulse-slow" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-cyan-600/20 via-transparent to-transparent pointer-events-none animate-pulse-slow" />
            
            {/* Animated Particles/Stars */}
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
            <div className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping opacity-75 delay-300"></div>
            <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-purple-500 rounded-full animate-pulse opacity-50 blur-sm"></div>

            <div className="w-full max-w-lg relative z-10 flex flex-col items-center space-y-8">
                
                {/* --- HEADER: FESTIVE ICON --- */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-500 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-1000 animate-spin-slow"></div>
                    <div className="relative w-28 h-28 bg-black rounded-full flex items-center justify-center border border-white/10 shadow-2xl">
                        <PartyPopper size={48} className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                        <div className="absolute -top-2 -right-2">
                             <Sparkles size={24} className="text-cyan-400 animate-bounce" />
                        </div>
                    </div>
                </div>

                {/* --- TEXT: GOLDEN GRADIENT --- */}
                <div className="text-center space-y-2">
                    <p className="text-sm font-bold text-purple-300 tracking-[0.3em] uppercase animate-pulse">
                        {COUNTDOWN_MESSAGES.subtitle}
                    </p>
                    <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-200 via-yellow-400 to-amber-600 drop-shadow-sm tracking-tighter uppercase">
                        {COUNTDOWN_MESSAGES.title}
                    </h1>
                </div>

                {/* --- COUNTDOWN TIMER (BIG & BOLD) --- */}
                <div className="py-6 relative">
                     <div className="text-6xl md:text-8xl font-mono font-bold text-white tracking-widest drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]">
                         {timeLeft || "00:00:00"}
                     </div>
                     <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-20"></div>
                </div>

                {/* --- PROGRESS BAR (COLORFUL) --- */}
                <div className="w-full space-y-4 px-4">
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-widest flex items-center gap-2">
                            <Zap size={12} className="fill-current" /> {statusText}
                        </span>
                        <span className="text-xl font-black text-fuchsia-400 drop-shadow-lg">
                            {progress.toFixed(1)}%
                        </span>
                    </div>

                    <div className="h-4 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/10 relative shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                        {/* Colorful Gradient Bar */}
                        <div 
                            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.6)] transition-all duration-1000 ease-linear relative" 
                            style={{ width: `${progress}%` }}
                        >
                            {/* Shine Effect */}
                            <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent"></div>
                            <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-white shadow-[0_0_10px_white]"></div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-[9px] text-zinc-500 font-bold tracking-[0.2em] uppercase text-center pt-8 opacity-60">
                    Pasco Neural Interface v0.8.4
                </div>
            </div>
        </div>
    );
};
