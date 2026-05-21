
import React, { useRef, useEffect, useState } from 'react';
import { Lock, Construction, ShieldAlert, Clock, Loader2, LogIn, MonitorPlay, AlertCircle, ServerCrash } from 'lucide-react';
import { MAINTENANCE_MESSAGES } from './Messages';
import { useMaintenanceLogic } from './Logic';

export const MaintenanceUI: React.FC<{ onUnlock: () => void; onNavigateToPreview: () => void; isPreview?: boolean }> = ({ onUnlock, onNavigateToPreview, isPreview = false }) => {
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [selectedDestination, setSelectedDestination] = useState<'hub' | 'preview' | null>(null);
    const [selectionError, setSelectionError] = useState(false);

    const handleUnlockAction = () => {
        if (selectedDestination === 'hub') {
            onUnlock();
        } else if (selectedDestination === 'preview') {
            onNavigateToPreview();
        }
    };

    // Updated hook usage (no countdown returned)
    const { pin, error, shake, handlePinChange, verifyPin } = useMaintenanceLogic(handleUnlockAction, isUnlocking, setIsUnlocking);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDestination) {
            setSelectionError(true);
            return;
        }
        if (verifyPin()) { 
            /* Handled in hook */ 
        } 
        else { 
            inputRefs.current[0]?.focus(); 
        }
    };

    const handleSelect = (dest: 'hub' | 'preview') => {
        setSelectedDestination(dest);
        setSelectionError(false);
    };

    return (
        <div className={`${isPreview ? 'absolute inset-0 z-10 w-full h-full' : 'fixed inset-0 z-[999]'} bg-zinc-950 flex flex-col items-center justify-center p-6 text-zinc-200 select-none overflow-hidden`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-zinc-950 to-zinc-950 pointer-events-none" />
            
            <div className={`w-full max-w-md relative z-10 flex flex-col items-center transition-transform duration-300 ${shake ? 'translate-x-2' : ''}`}>
                <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 border border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.3)] animate-pulse">
                    <Construction size={32} className="text-amber-500" />
                </div>

                <h1 className="text-2xl font-black text-white tracking-[0.2em] uppercase mb-4 text-center">
                    {MAINTENANCE_MESSAGES.title}
                </h1>
                
                <div className="bg-black/60 border border-zinc-800/80 p-5 rounded-2xl mb-8 w-full text-center backdrop-blur-md shadow-xl flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2 text-zinc-500 text-[9px] font-bold uppercase tracking-widest">
                        <ServerCrash size={12} /> {MAINTENANCE_MESSAGES.timerLabel}
                    </div>
                    <p className="text-xl text-amber-500/80 font-mono font-bold tracking-widest uppercase">
                        SYSTEM LOCKED
                    </p>

                    <div className="w-full grid grid-cols-2 gap-4 mt-6">
                        {/* Hub Button (Red) */}
                        <button 
                            onClick={() => handleSelect('hub')} 
                            className={`
                                relative py-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 group
                                ${selectedDestination === 'hub' 
                                    ? 'bg-red-900/20 border-red-500 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' 
                                    : 'bg-zinc-900/40 border-zinc-800 text-zinc-600 hover:border-red-900/50 hover:text-red-900/50'
                                }
                            `}
                        >
                            <LogIn size={24} className={selectedDestination === 'hub' ? 'animate-pulse' : ''} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Access Hub</span>
                            {selectedDestination === 'hub' && (
                                <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444]"></div>
                            )}
                        </button>
                        
                        {/* PasPreview Button (Blue) */}
                        <button 
                            onClick={() => handleSelect('preview')} 
                            className={`
                                relative py-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 group
                                ${selectedDestination === 'preview' 
                                    ? 'bg-blue-900/20 border-blue-500 text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]' 
                                    : 'bg-zinc-900/40 border-zinc-800 text-zinc-600 hover:border-blue-900/50 hover:text-blue-900/50'
                                }
                            `}
                        >
                            <MonitorPlay size={24} className={selectedDestination === 'preview' ? 'animate-pulse' : ''} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">PasPreview</span>
                            {selectedDestination === 'preview' && (
                                <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]"></div>
                            )}
                        </button>
                    </div>

                    {/* Slot Info (Below Buttons) */}
                    <div className="mt-4 text-[8px] text-zinc-600 uppercase font-bold space-y-0.5 text-center w-full border-t border-white/5 pt-3">
                        {MAINTENANCE_MESSAGES.slots.map(s => <div key={s}>{s}</div>)}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="w-full space-y-6">
                    <div className="space-y-3">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                            <Lock size={10} /> {MAINTENANCE_MESSAGES.inputLabel}
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
                                    onChange={(e) => {
                                        const nextIdx = handlePinChange(index, e.target.value);
                                        if (nextIdx !== null) inputRefs.current[nextIdx]?.focus();
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Backspace' && !pin[index] && index > 0) inputRefs.current[index - 1]?.focus();
                                    }}
                                    className="w-10 h-12 bg-zinc-900/80 border border-zinc-700 rounded-lg text-center text-xl font-bold text-white focus:border-amber-500 outline-none transition-all"
                                    autoComplete="off"
                                />
                            ))}
                        </div>
                    </div>
                    
                    {selectionError && (
                         <div className="flex items-center justify-center gap-2 text-amber-500 text-[10px] font-bold animate-pulse bg-amber-500/5 py-2 rounded-lg border border-amber-500/10">
                            <AlertCircle size={12} />
                            <span>PLEASE SELECT A DESTINATION</span>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center justify-center gap-2 text-red-500 text-[10px] font-bold animate-bounce bg-red-500/5 py-2 rounded-lg border border-red-500/10">
                            <ShieldAlert size={12} />
                            <span>{MAINTENANCE_MESSAGES.errorLabel}</span>
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={isUnlocking}
                        className={`w-full py-3.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 ${pin.every(d => d !== '') && !isUnlocking ? 'bg-white text-black shadow-lg' : 'bg-zinc-900 text-zinc-600 border border-zinc-800'}`}
                    >
                        {isUnlocking ? <Loader2 size={14} className="animate-spin mx-auto" /> : MAINTENANCE_MESSAGES.buttonLabel}
                    </button>
                </form>

                <div className="mt-8 text-[8px] text-zinc-700 font-mono tracking-widest uppercase text-center">
                    <div>{MAINTENANCE_MESSAGES.systemStatus}</div>
                    <div className="text-amber-600/40 mt-1">{MAINTENANCE_MESSAGES.nextWindow}</div>
                </div>
            </div>
        </div>
    );
};
