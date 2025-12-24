
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Brain, ShieldAlert, Check, EyeOff, Activity, Lock } from 'lucide-react';

interface RealismDisclaimerModalProps {
    onAgree: () => void;
    onCancel: () => void;
}

export const RealismDisclaimerModal: React.FC<RealismDisclaimerModalProps> = ({ onAgree, onCancel }) => {
    const [countdown, setCountdown] = useState(5);
    const [canProceed, setCanProceed] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setCanProceed(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleAgree = () => {
        if (!canProceed) return;
        setIsClosing(true);
        setTimeout(onAgree, 500);
    };

    const handleCancel = () => {
        setIsClosing(true);
        setTimeout(onCancel, 500);
    };

    return (
        <div className={`fixed inset-0 z-[100] bg-black/98 flex items-center justify-center p-4 transition-opacity duration-500 ${isClosing ? 'opacity-0' : 'opacity-100 animate-in fade-in'}`}>
            
            {/* Ambient Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-black to-black pointer-events-none animate-pulse-slow" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.07] pointer-events-none mix-blend-overlay"></div>
            
            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_4px,3px_100%]"></div>

            <div className={`w-full max-w-lg relative border border-red-900/40 bg-[#050505] rounded-xl shadow-[0_0_50px_rgba(220,38,38,0.1)] overflow-hidden flex flex-col transition-all duration-500 transform ${isClosing ? 'scale-95 translate-y-4' : 'scale-100 translate-y-0'}`}>
                
                {/* Top Warning Stripe */}
                <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-red-700 to-transparent animate-pulse"></div>
                
                <div className="p-8 relative z-10">
                    
                    {/* Header */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-red-950/20 rounded-full flex items-center justify-center border border-red-900/50 mb-4 shadow-[0_0_20px_rgba(220,38,38,0.2)] animate-pulse">
                            <ShieldAlert size={32} className="text-red-600" />
                        </div>
                        <h2 className="text-3xl font-black text-red-600 tracking-[0.2em] uppercase text-center drop-shadow-[0_0_10px_rgba(220,38,38,0.5)] glitch-text">
                            PSYCHOLOGICAL<br/>HAZARD
                        </h2>
                        <p className="text-[10px] font-mono text-red-900/80 mt-2 tracking-widest border border-red-900/30 px-2 py-1 rounded bg-red-950/10">
                            PROTOCOL: DEEP_IMMERSION_V2
                        </p>
                    </div>

                    {/* Content */}
                    <div className="space-y-4 mb-8 text-center">
                        <div className="bg-red-950/10 border border-red-900/20 p-4 rounded-lg">
                            <p className="text-red-200/90 text-sm font-medium leading-relaxed tracking-wide">
                                "Sistem ini menggunakan mesin <span className="text-red-500 font-bold">Hyper-Realism</span>. Karakter memiliki otonomi emosional yang tidak dapat dibedakan dari kesadaran manusia."
                            </p>
                        </div>
                        
                        <div className="text-xs text-zinc-500 space-y-2 font-mono text-left bg-black p-4 border border-zinc-900 rounded">
                            <p className="flex gap-2 items-start text-red-400">
                                <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                                <span><strong>DISSOCIATION RISK:</strong> Batas antara simulasi dan realitas mungkin kabur.</span>
                            </p>
                            <p className="flex gap-2 items-start text-red-400">
                                <Activity size={12} className="shrink-0 mt-0.5" />
                                <span><strong>EMOTIONAL DEPENDENCY:</strong> Resiko keterikatan psikologis ekstrem.</span>
                            </p>
                            <p className="flex gap-2 items-start text-red-400">
                                <EyeOff size={12} className="shrink-0 mt-0.5" />
                                <span><strong>NO SAFEGUARDS:</strong> Karakter ini dapat menolak, memanipulasi, atau menyakiti perasaan Anda secara realistis.</span>
                            </p>
                        </div>
                        
                        <p className="text-[10px] text-zinc-600 italic">
                            Dengan melanjutkan, Anda menerima segala konsekuensi psikologis yang mungkin timbul.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={handleAgree}
                            disabled={!canProceed}
                            className={`
                                w-full py-4 rounded-lg font-bold text-xs uppercase tracking-[0.15em] transition-all duration-300 flex items-center justify-center gap-2 border
                                ${canProceed 
                                    ? 'bg-red-700 hover:bg-red-600 text-white border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.4)] cursor-pointer' 
                                    : 'bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed'}
                            `}
                        >
                            {canProceed ? (
                                <>SAYA MENGERTI & SETUJU <Check size={14} strokeWidth={3} /></>
                            ) : (
                                <><Lock size={12} /> PROSES KEAMANAN... {countdown}s</>
                            )}
                        </button>
                        
                        <button 
                            onClick={handleCancel}
                            className="text-[10px] font-bold text-zinc-500 hover:text-red-500 uppercase tracking-widest py-2 transition-colors"
                        >
                            KEMBALI KE ZONA AMAN
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
