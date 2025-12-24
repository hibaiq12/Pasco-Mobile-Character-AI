
import React, { useState, useEffect, useRef } from 'react';
import { Lock, AlertTriangle, ArrowRight, Loader2, Construction, ShieldAlert, Clock } from 'lucide-react';

// --- CONFIGURATION ---
export const IS_MAINTENANCE_MODE = true; 

const SECRET_PIN = '120308';

interface MaintenanceProps {
    onUnlock: () => void;
}

export const MaintenanceModal: React.FC<MaintenanceProps> = ({ onUnlock }) => {
    const [pin, setPin] = useState<string[]>(new Array(6).fill(''));
    const [error, setError] = useState('');
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [shake, setShake] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    
    const [countdown, setCountdown] = useState<string>("--:--:--");

    useEffect(() => {
        if (!IS_MAINTENANCE_MODE) {
            onUnlock();
            return;
        }

        const checkTime = () => {
            const now = new Date();
            const jakartaTimeStr = now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
            const jakartaDate = new Date(jakartaTimeStr);
            const h = jakartaDate.getHours();
            const m = jakartaDate.getMinutes();

            /**
             * OPERATIONAL WINDOWS:
             * 1. 23:15 - 23:59
             * 2. 00:15 - 04:00
             */
            const isWindow1 = (h === 23 && m >= 15);
            const isWindow2 = (h === 0 && m >= 15) || (h > 0 && h < 4);

            if (isWindow1 || isWindow2) {
                if (!isUnlocking) {
                    setIsUnlocking(true);
                    onUnlock();
                }
                return;
            }

            // HITUNG TARGET PEMBUKAAN TERDEKAT
            let targetDate = new Date(jakartaDate);
            
            if (h === 0 && m < 15) {
                targetDate.setHours(0, 15, 0, 0);
            } else if (h < 23 || (h === 23 && m < 15)) {
                targetDate.setHours(23, 15, 0, 0);
            } else {
                targetDate.setDate(targetDate.getDate() + 1);
                targetDate.setHours(0, 15, 0, 0);
            }

            const diff = targetDate.getTime() - jakartaDate.getTime();

            if (diff > 0) {
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setCountdown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            } else {
                setCountdown("00:00:00");
            }
        };

        const timerInterval = setInterval(checkTime, 1000);
        checkTime();

        return () => clearInterval(timerInterval);
    }, [onUnlock, isUnlocking]);

    useEffect(() => {
        if (inputRefs.current[0]) inputRefs.current[0].focus();
    }, []);

    const handleChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;
        const newPin = [...pin];
        newPin[index] = value.substring(value.length - 1);
        setPin(newPin);
        setError('');
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) inputRefs.current[index - 1]?.focus();
    };

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (isUnlocking) return;
        const enteredPin = pin.join('');
        if (enteredPin === SECRET_PIN) {
            setIsUnlocking(true);
            setError('');
            setTimeout(() => onUnlock(), 800); 
        } else {
            setError('ACCESS DENIED: Invalid Credentials');
            setPin(new Array(6).fill(''));
            inputRefs.current[0]?.focus();
            setShake(true);
            setTimeout(() => setShake(false), 300);
        }
    };

    return (
        <div className="fixed inset-0 z-[999] bg-zinc-950 flex flex-col items-center justify-center p-6 font-sans text-zinc-200 select-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-zinc-950 to-zinc-950 pointer-events-none" />
            
            <div className={`w-full max-w-md relative z-10 flex flex-col items-center transition-transform duration-300 ${shake ? 'translate-x-2' : ''}`}>
                <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mb-8 border border-amber-500/30 shadow-[0_0_60px_rgba(245,158,11,0.4)] animate-pulse">
                    <Construction size={40} className="text-amber-500" />
                </div>

                <h1 className="text-3xl font-black text-white tracking-[0.2em] uppercase mb-6 text-center">
                    Under Maintenance
                </h1>
                
                <div className="bg-black/60 border border-zinc-800/80 p-6 rounded-2xl mb-10 w-full text-center backdrop-blur-md shadow-xl flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                        <Clock size={12} /> System Resumes In
                    </div>
                    <p className="text-3xl text-amber-400 font-mono font-black tracking-widest drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">
                        {countdown}
                    </p>
                    <div className="mt-2 text-[9px] text-zinc-600 uppercase font-bold space-y-1">
                        <div>Slot 1: 23:15 - 23:59</div>
                        <div>Slot 2: 00:15 - 04:00</div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="w-full space-y-8">
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                            <Lock size={12} /> Security Bypass
                        </label>
                        <div className="flex justify-center gap-3 sm:gap-4">
                            {pin.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => { inputRefs.current[index] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-10 h-12 sm:w-12 sm:h-14 bg-zinc-900/80 border border-zinc-700 rounded-xl text-center text-xl sm:text-2xl font-bold text-white focus:border-amber-500 outline-none transition-all shadow-inner"
                                    autoComplete="off"
                                />
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center justify-center gap-2 text-red-500 text-xs font-bold animate-bounce bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                            <ShieldAlert size={14} />
                            <span>{error}</span>
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={isUnlocking}
                        className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 ${pin.every(d => d !== '') && !isUnlocking ? 'bg-white text-black shadow-lg transform hover:-translate-y-1' : 'bg-zinc-900 text-zinc-600 border border-zinc-800'}`}
                    >
                        {isUnlocking ? <Loader2 size={14} className="animate-spin mx-auto" /> : "Verify Access"}
                    </button>
                </form>

                <div className="mt-12 text-[9px] text-zinc-700 font-mono tracking-widest uppercase text-center space-y-1">
                    <div>Status: Midnight Maintenance Protocol</div>
                    <div className="text-amber-600/50">Next Window: 23:15 / 00:15</div>
                </div>
            </div>
        </div>
    );
};
