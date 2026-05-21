
import React, { useState, useRef, useEffect } from 'react';
import { Lock } from 'lucide-react';

interface PreviewPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onVerify: (pin: string) => void;
    error?: boolean;
}

export const PreviewPopup: React.FC<PreviewPopupProps> = ({ isOpen, onClose, onVerify, error }) => {
    // 5 kotak sesuai instruksi "buat dalam 5 kotak"
    const [pin, setPin] = useState<string[]>(new Array(5).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                setPin(new Array(5).fill(''));
                inputRefs.current[0]?.focus();
            }, 100);
        }
    }, [isOpen]);

    const handlePinChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newPin = [...pin];
        newPin[index] = value.slice(-1);
        setPin(newPin);
        
        // Pindah ke kotak berikutnya jika ada input dan bukan kotak terakhir
        if (value && index < 4) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        // Kirim jika menekan Enter dan PIN sudah lengkap
        if (e.key === 'Enter' && pin.every(d => d !== '')) {
            handleVerify();
        }
    };

    const handleVerify = () => {
        const fullPin = pin.join('');
        if (fullPin.length === 5) {
            onVerify(fullPin);
        }
    };

    if (!isOpen) return null;

    const isPinComplete = pin.every(d => d !== '');

    return (
        <div className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className={`bg-[#0c0c0e] border border-white/10 p-10 rounded-[2.5rem] shadow-2xl w-full max-w-[420px] relative flex flex-col items-center transition-transform ${error ? 'animate-shake' : ''}`}>
                
                {/* Lock Icon */}
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
                    <div className="relative w-20 h-20 bg-zinc-900/50 rounded-full flex items-center justify-center border border-blue-500/30">
                        <Lock size={32} className="text-blue-500 fill-blue-500/10" />
                    </div>
                </div>

                <h3 className="text-2xl font-black text-white uppercase tracking-[0.2em] mb-3">Authorize Access</h3>
                <p className="text-xs text-zinc-500 mb-10 font-medium">Enter Pin to continue.</p>

                {/* PIN Boxes (5 Slots) */}
                <div className="flex justify-center gap-3 mb-10">
                    {pin.map((digit, index) => (
                        <div key={index} className="relative">
                            <input
                                ref={(el) => { inputRefs.current[index] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handlePinChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className={`
                                    w-14 h-16 bg-zinc-900/30 border-2 rounded-2xl text-center text-3xl font-black font-mono text-white outline-none transition-all 
                                    ${error ? 'border-red-500' : (digit ? 'border-blue-500/50 bg-zinc-900/60' : 'border-white/5 focus:border-blue-500 focus:bg-zinc-900/80')}
                                `}
                                autoComplete="off"
                            />
                        </div>
                    ))}
                </div>

                {error && (
                    <div className="text-red-500 text-[10px] font-black uppercase tracking-widest mb-8 animate-bounce bg-red-500/10 px-4 py-1.5 rounded-full border border-red-500/20">
                        Access Denied: Invalid Protocol
                    </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-5 w-full">
                    <button 
                        onClick={onClose} 
                        className="py-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 border border-white/5"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleVerify}
                        disabled={!isPinComplete}
                        className={`py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl active:scale-95 border
                            ${isPinComplete 
                                ? 'bg-[#1e40af] hover:bg-blue-600 text-white shadow-blue-900/40 border-blue-400/20' 
                                : 'bg-zinc-800 text-zinc-600 border-transparent cursor-not-allowed opacity-50'}
                        `}
                    >
                        Verify
                    </button>
                </div>
            </div>
        </div>
    );
};
