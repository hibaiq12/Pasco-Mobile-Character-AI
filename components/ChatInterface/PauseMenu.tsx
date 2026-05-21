import React, { useEffect, useState } from 'react';
import { Play, Save, Database, Smartphone, LogOut, AlertTriangle, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PauseMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    onSave: () => void;
    onLoad: () => void;
    onSmartphone: () => void;
    onScreen: () => void;
    onExit: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({ x, y, onClose, onSave, onLoad, onSmartphone, onScreen, onExit }) => {
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [isDesktop] = useState(() => {
        if (typeof window === 'undefined') return true;
        const check = () => {
            return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.matchMedia("(pointer: coarse)").matches;
        };
        return !check();
    });

    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };
        // Mencegah scroll ketika pause menu terbuka
        document.body.style.overflow = 'hidden';
        document.addEventListener('contextmenu', handleContextMenu);
        
        return () => {
            document.body.style.overflow = 'auto';
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, []);

    // Ensure menu doesn't go off-screen
    const safeX = Math.min(x, window.innerWidth - 220);
    const safeY = Math.min(y, window.innerHeight - 300);

    return (
        <motion.div 
            className="fixed inset-0 z-[99990] flex items-center justify-center bg-black/40"
            style={{ backdropFilter: 'blur(15px)' }} // 75% equivalent aesthetic blur
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
        >
            <AnimatePresence mode="wait">
                {!showExitConfirm ? (
                    <motion.div 
                        key="menu"
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
                        className="absolute bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 w-56 shadow-[0_30px_60px_rgba(0,0,0,0.5),0_0_40px_rgba(150,0,255,0.15)] flex flex-col gap-0.5 overflow-hidden"
                        style={{ top: safeY, left: safeX }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-4 py-3 mb-1 flex items-center justify-between border-b border-white/5 opacity-80">
                            <span className="text-[9px] font-mono text-[#b966ff] tracking-[0.2em] uppercase font-bold text-shadow-glow">Shortcut Menu</span>
                        </div>

                        <button onClick={onClose} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/5 text-zinc-300 hover:text-white rounded-xl transition-all duration-200 text-xs font-medium group relative overflow-hidden">
                            <Play size={14} className="text-zinc-500 group-hover:text-[#9600FF] transition-colors relative z-10" />
                            <span className="relative z-10 tracking-wide">Resume</span>
                        </button>
                        
                        <button onClick={() => { onSave(); onClose(); }} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/5 text-zinc-300 hover:text-white rounded-xl transition-all duration-200 text-xs font-medium group relative overflow-hidden">
                            <Save size={14} className="text-zinc-500 group-hover:text-[#9600FF] transition-colors relative z-10" />
                            <span className="relative z-10 tracking-wide">Quick Save</span>
                        </button>
                        
                        <button onClick={() => { onLoad(); onClose(); }} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/5 text-zinc-300 hover:text-white rounded-xl transition-all duration-200 text-xs font-medium group relative overflow-hidden">
                            <Database size={14} className="text-zinc-500 group-hover:text-[#9600FF] transition-colors relative z-10" />
                            <span className="relative z-10 tracking-wide">Bank Data</span>
                        </button>

                        {isDesktop && (
                            <button onClick={() => { onScreen(); onClose(); }} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/5 text-zinc-300 hover:text-white rounded-xl transition-all duration-200 text-xs font-medium group relative overflow-hidden">
                                <Monitor size={14} className="text-zinc-500 group-hover:text-[#9600FF] transition-colors relative z-10" />
                                <span className="relative z-10 tracking-wide">Screen</span>
                            </button>
                        )}

                        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-1.5"></div>

                        <button onClick={() => { onSmartphone(); onClose(); }} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/5 text-zinc-300 hover:text-white rounded-xl transition-all duration-200 text-xs font-medium group relative overflow-hidden">
                            <Smartphone size={14} className="text-zinc-500 group-hover:text-[#9600FF] transition-colors relative z-10" />
                            <span className="relative z-10 tracking-wide">Smartphone</span>
                        </button>
                        
                        <button onClick={() => setShowExitConfirm(true)} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-rose-500/10 text-zinc-300 hover:text-rose-400 rounded-xl transition-all duration-200 text-xs font-medium group mt-1 relative overflow-hidden">
                            <LogOut size={14} className="text-zinc-500 group-hover:text-rose-500 transition-colors relative z-10" />
                            <span className="relative z-10 tracking-wide">Exit Chat</span>
                        </button>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="confirm"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
                        className="bg-zinc-950/90 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 w-[380px] shadow-[0_0_50px_rgba(244,63,94,0.1)] flex flex-col items-center text-center isolate"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-6">
                            <AlertTriangle size={32} className="text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                        </div>
                        <h2 className="text-2xl font-semibold text-white mb-3 tracking-tight">Keluar ke Hub?</h2>
                        <p className="text-sm text-zinc-400 mb-8 leading-relaxed max-w-[280px]">
                            Apakah kamu yakin ingin meninggalkan percakapan ini dan kembali ke menu utama? Progres yang belum di-save mungkin akan hilang.
                        </p>
                        
                        <div className="flex w-full gap-3">
                            <button 
                                onClick={() => setShowExitConfirm(false)}
                                className="flex-1 py-3.5 px-4 rounded-xl font-medium text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                Batal
                            </button>
                            <button 
                                onClick={onExit}
                                className="flex-1 py-3.5 px-4 rounded-xl font-medium text-white bg-rose-600 hover:bg-rose-500 hover:shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-all"
                            >
                                Ya, Keluar
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
