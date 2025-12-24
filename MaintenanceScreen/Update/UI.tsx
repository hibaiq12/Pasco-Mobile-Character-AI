
import React, { useRef, useEffect, useState } from 'react';
import { Lock, CloudDownload, ShieldAlert, Zap, Loader2, RefreshCw, CheckCircle2 } from 'lucide-react';
import { UPDATE_MESSAGES, CHANGELOG_DATA } from './Messages';
import { useUpdateLogic } from './Logic';
import { useMaintenanceLogic } from '../Maintenance/Logic';

export const UpdateUI: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [isVerifying, setIsVerifying] = useState(false);
    
    // Custom complete handler that triggers the bar finish instead of instant unlock
    const { progress, completeUpdate, isFinishing } = useUpdateLogic(onComplete);
    
    // We pass a local callback to verifyPin so we can control the bar finish
    const { pin, error, shake, handlePinChange, verifyPin } = useMaintenanceLogic(
        () => {
            setIsVerifying(true);
            completeUpdate(); // Correct PIN: Start finishing the bar to 100%
        }, 
        isVerifying, 
        setIsVerifying
    );
    
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        verifyPin();
    };

    return (
        <div className="fixed inset-0 z-[999] bg-zinc-950 flex flex-col items-center justify-center p-6 text-zinc-200 select-none overflow-hidden">
            {/* Background Ambient Glow */}
            <div className={`absolute inset-0 transition-colors duration-1000 ${isFinishing ? 'bg-blue-900/10' : 'bg-amber-900/5'}`} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-zinc-950 to-zinc-950 pointer-events-none" />
            
            <div className={`w-full max-w-md relative z-10 flex flex-col items-center transition-all duration-500 ${shake ? 'translate-x-2' : ''} ${isFinishing && progress > 98 ? 'scale-110 opacity-0 blur-lg' : 'scale-100'}`}>
                
                {/* STATUS ICON */}
                <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 border border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.3)] group">
                    {isFinishing ? (
                        <Zap size={32} className="text-cyan-400 animate-pulse" />
                    ) : (
                        <CloudDownload size={32} className="text-blue-400 animate-bounce" />
                    )}
                </div>

                <h1 className="text-2xl font-black text-white tracking-[0.2em] uppercase mb-4 text-center">
                    {isFinishing ? "Materializing" : UPDATE_MESSAGES.title}
                </h1>
                
                {/* PROGRESS BAR SECTION */}
                <div className="bg-black/60 border border-zinc-800/80 p-5 rounded-2xl mb-8 w-full backdrop-blur-md shadow-xl relative overflow-hidden">
                    <div className="flex justify-between items-end mb-3 relative z-10">
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            {isFinishing ? <CheckCircle2 size={10} className="text-cyan-400" /> : <RefreshCw size={10} className="animate-spin-slow" />} 
                            {isFinishing ? "FINALIZING CORE..." : UPDATE_MESSAGES.progressLabel}
                        </span>
                        <span className={`text-sm font-mono font-bold ${isFinishing ? 'text-cyan-400' : 'text-blue-400'}`}>
                            {Math.floor(progress)}%
                        </span>
                    </div>
                    
                    <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5 relative z-10">
                        <div 
                            className={`h-full transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.5)] ${isFinishing ? 'bg-gradient-to-r from-blue-400 to-white' : 'bg-gradient-to-r from-blue-600 to-cyan-400'}`} 
                            style={{ width: `${progress}%` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shine"></div>
                    </div>
                    
                    <p className="text-[8px] text-zinc-600 uppercase font-bold mt-2 text-center tracking-tighter relative z-10">
                        {isFinishing ? "Neural pathways established. Syncing engrams..." : UPDATE_MESSAGES.status}
                    </p>

                    {/* Progress Stall Indicator */}
                    {!isFinishing && progress >= 74 && (
                        <div className="mt-2 text-center">
                            <span className="text-[8px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30 animate-pulse">
                                AUTHORIZATION REQUIRED TO COMPLETE
                            </span>
                        </div>
                    )}
                </div>

                {/* PIN INPUT FORM */}
                <div className={`w-full transition-all duration-500 ${isFinishing ? 'opacity-30 pointer-events-none grayscale' : 'opacity-100'}`}>
                    <form onSubmit={handleSubmit} className="w-full space-y-6">
                        <div className="space-y-3">
                            <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                                <Lock size={10} /> {UPDATE_MESSAGES.inputLabel}
                            </label>
                            <div className="flex justify-center gap-2">
                                {pin.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => { inputRefs.current[index] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        disabled={isFinishing}
                                        onChange={(e) => {
                                            const nextIdx = handlePinChange(index, e.target.value);
                                            if (nextIdx !== null) inputRefs.current[nextIdx]?.focus();
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Backspace' && !pin[index] && index > 0) inputRefs.current[index - 1]?.focus();
                                        }}
                                        className="w-10 h-12 bg-zinc-900/80 border border-zinc-700 rounded-lg text-center text-xl font-bold text-white focus:border-blue-500 outline-none transition-all shadow-inner"
                                        autoComplete="off"
                                    />
                                ))}
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center justify-center gap-2 text-red-500 text-[10px] font-bold animate-bounce bg-red-500/5 py-2 rounded-lg border border-red-500/10">
                                <ShieldAlert size={12} />
                                <span>ACCESS DENIED</span>
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={isVerifying || isFinishing}
                            className={`w-full py-3.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 ${pin.every(d => d !== '') && !isVerifying ? 'bg-blue-600 text-white shadow-lg' : 'bg-zinc-900 text-zinc-600 border border-zinc-800'}`}
                        >
                            {isVerifying ? <Loader2 size={14} className="animate-spin mx-auto" /> : UPDATE_MESSAGES.buttonLabel}
                        </button>
                    </form>
                </div>

                {/* HORIZONTAL CHANGELOG */}
                <div className="w-full mt-8">
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <Zap size={12} className="text-yellow-500 fill-yellow-500/20" />
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Incoming Patches</span>
                    </div>
                    <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar snap-x">
                        {CHANGELOG_DATA.map((item, i) => (
                            <div 
                                key={i} 
                                className="snap-center shrink-0 w-[200px] bg-white/5 border border-white/5 p-3 rounded-xl backdrop-blur-sm hover:border-blue-500/30 transition-colors"
                            >
                                <h4 className="text-blue-400 text-[10px] font-black uppercase mb-1">{item.tag}</h4>
                                <p className="text-[10px] text-zinc-300 leading-relaxed line-clamp-2">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-4 text-[8px] text-zinc-700 font-mono tracking-widest uppercase text-center">
                    <div>{UPDATE_MESSAGES.versionLabel}</div>
                    <div className="text-blue-600/40 mt-1">Status: {isFinishing ? 'Executing materialization' : 'Awaiting Authorization'}</div>
                </div>
            </div>
        </div>
    );
};
