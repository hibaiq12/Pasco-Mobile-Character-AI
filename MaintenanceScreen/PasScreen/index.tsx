
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Background } from './components/Background';
import { Header } from './components/Header';
import { SelectionCards } from './components/SelectionCards';
import { Footer } from './components/Footer';
import { SYSTEM_LOGS } from './textlog';
import { playSfx } from '../../services/SoundService';
import { AlertTriangle, Lock, Zap, CheckCircle, MonitorPlay } from 'lucide-react';

interface PasScreenProps {
    onEnterHub: () => void;
    onEnterMaintenance: () => void;
    onEnterPreview?: () => void;
    isPreview?: boolean;
}

export const PasScreen: React.FC<PasScreenProps> = ({ onEnterHub, onEnterMaintenance, onEnterPreview, isPreview = false }) => {
    const [hovered, setHovered] = useState<'hub' | 'maintenance' | 'preview' | null>(null);
    const [bootSequence, setBootSequence] = useState(0);
    
    // UI Logic States
    const [confirmTarget, setConfirmTarget] = useState<'hub' | 'maintenance' | 'preview' | null>(null);
    const [isBooting, setIsBooting] = useState(false);
    const [logLines, setLogLines] = useState<string[]>([]);
    
    // Password Logic
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState(false);
    
    const logContainerRef = useRef<HTMLDivElement>(null);

    // Initial Simulated Boot Text Sequence (Footer)
    useEffect(() => {
        const interval = setInterval(() => {
            setBootSequence(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                const increment = Math.random() > 0.5 ? Math.floor(Math.random() * 5) + 1 : 0;
                return Math.min(100, prev + increment);
            });
        }, 50);
        return () => clearInterval(interval);
    }, []);

    // --- BOOT SEQUENCE LOGIC ---
    const startBootSequence = () => {
        // 1. Log Scrolling Animation
        // Hitung speed agar seluruh log selesai dalam ~3 detik.
        // Total Time = 3000ms. Total Lines = SYSTEM_LOGS.length.
        // Interval = 3000 / length.
        const totalDuration = 3000;
        const totalLines = SYSTEM_LOGS.length;
        const speed = Math.max(5, Math.floor(totalDuration / totalLines)); // Min 5ms
        
        let lineIndex = 0;
        const logInterval = setInterval(() => {
            if (lineIndex < totalLines) {
                // Add chunks of lines to ensure speed if necessary
                const linesToAdd = 1; 
                const newLines = SYSTEM_LOGS.slice(lineIndex, lineIndex + linesToAdd);
                
                setLogLines(prev => {
                    const updated = [...prev, ...newLines];
                    return updated.slice(-25); // Keep DOM light
                });
                
                lineIndex += linesToAdd;
                
                if (logContainerRef.current) {
                    logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
                }
            } else {
                clearInterval(logInterval);
                // FINISH BOOT
                setTimeout(() => {
                    if (confirmTarget === 'hub') onEnterHub();
                    else if (confirmTarget === 'maintenance') onEnterMaintenance();
                    else if (confirmTarget === 'preview' && onEnterPreview) onEnterPreview();
                }, 200);
            }
        }, speed);
    };

    const handleConfirm = useCallback(() => {
        playSfx('success');
        setConfirmTarget(null);
        setIsBooting(true);
        startBootSequence();
    }, [confirmTarget, onEnterHub, onEnterMaintenance, onEnterPreview, startBootSequence]);

    // --- PASSWORD AUTO SUBMIT LOGIC ---
    useEffect(() => {
        if (confirmTarget === 'preview') {
            if (password === '16825') {
                // Correct Password
                setTimeout(() => handleConfirm(), 0);
            } else if (password.length >= 5) {
                // Wrong Password (Auto clear after slight delay)
                playSfx('error');
                setTimeout(() => setPasswordError(true), 0);
                setTimeout(() => {
                    setPassword('');
                    setPasswordError(false);
                }, 500);
            }
        }
    }, [password, confirmTarget, handleConfirm]);

    // --- HANDLERS ---

    const handleSelect = (target: 'hub' | 'maintenance' | 'preview') => {
        playSfx('click');
        setConfirmTarget(target);
        setPassword('');
        setPasswordError(false);
    };

    const handleCancel = () => {
        playSfx('click');
        setConfirmTarget(null);
        setPassword('');
    };

    const getIcon = () => {
        if (confirmTarget === 'hub') return <Zap size={32} />;
        if (confirmTarget === 'maintenance') return <Lock size={32} />;
        if (confirmTarget === 'preview') return <MonitorPlay size={32} />;
        return null;
    };
    
    const getColorClass = (type: 'bg' | 'border' | 'text' | 'shadow') => {
        const target = confirmTarget;
        if (target === 'hub') {
            if (type === 'bg') return 'bg-violet-500/10';
            if (type === 'border') return 'border-violet-500/30';
            if (type === 'text') return 'text-violet-400';
            if (type === 'shadow') return 'shadow-violet-900/20';
        }
        if (target === 'maintenance') {
            if (type === 'bg') return 'bg-amber-500/10';
            if (type === 'border') return 'border-amber-500/30';
            if (type === 'text') return 'text-amber-400';
            if (type === 'shadow') return 'shadow-amber-900/20';
        }
        if (target === 'preview') {
            if (type === 'bg') return 'bg-blue-500/10';
            if (type === 'border') return 'border-blue-500/30';
            if (type === 'text') return 'text-blue-400';
            if (type === 'shadow') return 'shadow-blue-900/20';
        }
        return '';
    };

    return (
        <div className={`${isPreview ? 'absolute inset-0 z-10 w-full h-full' : 'fixed inset-0 z-[9999]'} bg-[#030303] text-white font-sans flex flex-col items-center justify-center overflow-hidden select-none`}>
            
            <Background hovered={hovered as any} />

            {/* --- MAIN CONTENT CONTAINER --- */}
            <div className={`relative z-20 w-full flex flex-col items-center gap-6 p-6 md:p-12 transition-all duration-500 ${isBooting ? 'scale-110 opacity-0 blur-md' : 'scale-100 opacity-100'}`}>
                <Header />
                
                <SelectionCards 
                    onEnterHub={() => handleSelect('hub')} 
                    onEnterMaintenance={() => handleSelect('maintenance')}
                    onEnterPreview={() => handleSelect('preview')}
                    hovered={hovered} 
                    setHovered={setHovered} 
                />
                
                <div className="mt-8">
                     <Footer bootSequence={bootSequence} />
                </div>
            </div>

            {/* --- CONFIRMATION POPUP (GLASSMORPHISM) --- */}
            {confirmTarget && !isBooting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="w-full max-w-sm bg-[#0a0a0c] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden transform transition-all scale-100">
                        {/* Decor */}
                        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${confirmTarget === 'hub' ? 'from-violet-600 to-cyan-500' : (confirmTarget === 'preview' ? 'from-blue-600 to-cyan-500' : 'from-amber-600 to-red-500')}`}></div>
                        
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${getColorClass('bg')} ${getColorClass('border')} ${getColorClass('text')} animate-pulse`}>
                                {getIcon()}
                            </div>
                            
                            <div>
                                <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-1">
                                    {confirmTarget === 'hub' ? 'Initialize Hub?' : (confirmTarget === 'preview' ? 'Developer Access' : 'Enter Restricted?')}
                                </h3>
                                <p className="text-xs text-zinc-400 leading-relaxed px-4">
                                    {confirmTarget === 'hub' 
                                        ? 'You are about to establish a neural link with the main system. Proceed?' 
                                        : (confirmTarget === 'preview' ? 'Enter PIN to bypass security protocols.' : 'Warning: This area contains system-level configurations. Authorized personnel only.')}
                                </p>
                            </div>

                            {confirmTarget === 'preview' && (
                                <div className="w-full px-4 mb-2">
                                     <input 
                                        type="text" 
                                        inputMode="numeric"
                                        maxLength={5}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value.replace(/\D/g,''))}
                                        placeholder="ENTER PIN"
                                        autoFocus
                                        className={`
                                            w-full bg-black/50 border-2 rounded-xl py-3 text-center text-xl font-mono text-white tracking-[0.5em] outline-none transition-all
                                            ${passwordError ? 'border-red-500 animate-shake' : 'border-white/10 focus:border-blue-500'}
                                        `}
                                     />
                                     {passwordError && <p className="text-[9px] text-red-500 font-bold mt-2 uppercase tracking-widest">ACCESS DENIED</p>}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3 w-full mt-2">
                                <button 
                                    onClick={handleCancel}
                                    className="py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold text-xs rounded-xl transition-colors uppercase tracking-wider"
                                >
                                    Cancel
                                </button>
                                {confirmTarget !== 'preview' && (
                                    <button 
                                        onClick={handleConfirm}
                                        className={`py-3 font-bold text-xs rounded-xl text-white shadow-lg uppercase tracking-wider transition-transform active:scale-95 ${confirmTarget === 'hub' ? 'bg-violet-600 hover:bg-violet-500 shadow-violet-900/20' : 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/20'}`}
                                    >
                                        Confirm
                                    </button>
                                )}
                                {confirmTarget === 'preview' && (
                                     <div className="py-3 flex items-center justify-center font-bold text-xs text-zinc-600 uppercase tracking-wider bg-zinc-900/50 rounded-xl cursor-not-allowed">
                                         Input PIN
                                     </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- BOOT SEQUENCE OVERLAY (LOG ONLY) --- */}
            {isBooting && (
                <div className="fixed inset-0 z-[60] bg-black flex flex-col font-mono text-xs">
                    {/* Log Area - Centered and Large */}
                    <div className="flex-1 flex flex-col justify-center items-center p-8 overflow-hidden">
                        <div 
                            ref={logContainerRef}
                            className="w-full max-w-2xl h-[70vh] overflow-hidden flex flex-col justify-end text-green-500/90 leading-relaxed space-y-1.5 font-bold"
                            style={{ textShadow: '0 0 8px rgba(34, 197, 94, 0.6)' }}
                        >
                            {logLines.map((line, i) => (
                                <div key={i} className="animate-in slide-in-from-bottom-4 fade-in duration-75 truncate border-l-2 border-green-900/50 pl-2">
                                    <span className="mr-2 opacity-50 text-[10px]">{`>>`}</span>
                                    {line}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Status */}
                    <div className="p-4 border-t border-green-900/30 bg-green-950/10 text-center">
                        <span className="text-green-400 font-bold uppercase tracking-[0.5em] animate-pulse">
                            ESTABLISHING CONNECTION...
                        </span>
                    </div>
                </div>
            )}

        </div>
    );
};
