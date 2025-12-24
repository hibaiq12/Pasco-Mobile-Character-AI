
import React from 'react';
import { Cpu, Loader2, Zap } from 'lucide-react';
import { UPDATE_MESSAGES } from './Messages';
import { useUpdateLogic } from './Logic';

export const UpdateUI: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const { progress } = useUpdateLogic(onComplete);

    return (
        <div className="fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center p-8 text-zinc-200">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-black to-black pointer-events-none" />
            
            <div className="w-full max-w-sm space-y-10 relative z-10 text-center">
                <div className="relative inline-block">
                    <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/30 animate-pulse">
                        <Cpu size={36} className="text-blue-500" />
                    </div>
                    <div className="absolute -top-1 -right-1">
                        <Zap size={16} className="text-blue-400 fill-current animate-bounce" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-black tracking-[0.3em] uppercase text-white">
                        {UPDATE_MESSAGES.title}
                    </h1>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                        {UPDATE_MESSAGES.subtitle}
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-end px-1">
                        <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">
                            {UPDATE_MESSAGES.progressLabel}
                        </span>
                        <span className="text-xs font-mono font-bold text-blue-400">
                            {Math.floor(progress)}%
                        </span>
                    </div>
                    <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                        <div 
                            className="h-full bg-blue-500 transition-all duration-300 shadow-[0_0_10px_#3b82f6]" 
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <div className="space-y-3 pt-4">
                    <div className="flex items-center justify-center gap-2 text-[9px] text-zinc-400 font-medium">
                        <Loader2 size={12} className="animate-spin" />
                        {UPDATE_MESSAGES.status}
                    </div>
                    <p className="text-[8px] text-zinc-600 italic">
                        {UPDATE_MESSAGES.warning}
                    </p>
                </div>
            </div>

            <div className="absolute bottom-10 text-[8px] font-mono text-zinc-800 tracking-widest uppercase">
                {UPDATE_MESSAGES.versionLabel}
            </div>
        </div>
    );
};
