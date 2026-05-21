
import React, { useEffect, useState } from 'react';
import { ArrowLeft, RotateCcw, PanelRight, Smartphone as SmartphoneIcon, Clock, Cpu, Zap, Server } from 'lucide-react';
import { Character } from '../../types';
import { getSettings } from '../../services/storageService';

interface TopBarProps {
    activeChar: Character;
    formattedTime: string;
    showRightPanel: boolean;
    showPhone: boolean;
    onBack: () => void;
    onRestart: () => void;
    onToggleRightPanel: () => void;
    onTogglePhone: () => void;
    onShowProfile: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
    activeChar, formattedTime, showRightPanel, showPhone,
    onBack, onRestart, onToggleRightPanel, onTogglePhone, onShowProfile
}) => {
    
    // Read global settings to determine visual state of model badge
    const [modelBadge, setModelBadge] = useState({
        label: 'GEMINI',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        icon: Zap
    });

    useEffect(() => {
        const settings = getSettings();
        const model = (settings.defaultModel || '').toLowerCase();

        // LOGIC VISUAL
        setTimeout(() => {
            if (model.includes('gemini-3')) {
                // GEMINI 3.0 PRO (Light Blue / Cyan)
                setModelBadge({
                    label: 'GEMINI',
                    color: 'text-sky-400',
                    bg: 'bg-sky-500/10',
                    border: 'border-sky-500/20',
                    icon: Zap
                });
            } else if (model.includes('openrouter')) {
                // OPENROUTER (Blue/Indigo)
                setModelBadge({
                    label: 'OPENROUTER',
                    color: 'text-indigo-400',
                    bg: 'bg-indigo-500/10',
                    border: 'border-indigo-500/20',
                    icon: Server
                });
            } else if (model.includes('ollama')) {
                // OLLAMA (Blue/Cyan/White)
                setModelBadge({
                    label: 'OLLAMA',
                    color: 'text-cyan-400',
                    bg: 'bg-cyan-500/10',
                    border: 'border-cyan-500/20',
                    icon: Cpu
                });
            } else if (model.includes('kobold')) {
                // KOBOLD AI (Red)
                // Kita ambil nama model dari settings, kalau kosong pake default 'KOBOLD CPP'
                const koboldLabel = settings.koboldModel ? settings.koboldModel.toUpperCase() : 'KOBOLD CPP';
                setModelBadge({
                    label: koboldLabel,
                    color: 'text-red-400',
                    bg: 'bg-red-500/10',
                    border: 'border-red-500/20',
                    icon: Zap
                });
            } else {
                // GEMINI 2.5 FLASH (Standard Emerald/Green)
                setModelBadge({
                    label: 'GEMINI',
                    color: 'text-emerald-400',
                    bg: 'bg-emerald-500/10',
                    border: 'border-emerald-500/20',
                    icon: Zap
                });
            }
        }, 0);
    }, [activeChar]); // Re-run if character changes, though mostly depends on global settings

    const BadgeIcon = modelBadge.icon;

    return (
        <div className="h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-6 bg-zinc-950/80 backdrop-blur-md z-10 shrink-0">
            <div className="flex items-center gap-3 md:gap-4 flex-1 overflow-hidden mr-2">
                <button 
                    onClick={onBack} 
                    className="text-zinc-400 hover:text-white transition-colors p-1.5 hover:bg-white/5 rounded-lg shrink-0"
                >
                    <ArrowLeft size={20} />
                </button>
                
                {/* Header Info - Mobile Only (Clickable for Profile) */}
                <div className="flex items-center gap-3 lg:hidden cursor-pointer overflow-hidden" onClick={onShowProfile}>
                     <div className="relative shrink-0">
                        <img src={activeChar.avatar} className="w-8 h-8 rounded-full border border-zinc-700 object-cover" />
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-zinc-950"></div>
                     </div>
                     <div className="min-w-0">
                         <h2 className="text-sm font-bold text-white leading-tight truncate">{activeChar.name}</h2>
                         <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
                             <span className="text-green-400 font-bold">{formattedTime}</span>
                         </div>
                     </div>
                </div>

                {/* MODEL BADGE (VISUAL INDICATOR) */}
                <div className={`
                    flex items-center gap-2 px-2.5 py-1 rounded-full border backdrop-blur-md transition-all shrink-0
                    ${modelBadge.bg} ${modelBadge.border}
                `}>
                    <BadgeIcon size={12} className={modelBadge.color} />
                    <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest ${modelBadge.color}`}>
                        {modelBadge.label}
                    </span>
                </div>
            </div>

            {/* Center Time for Desktop (Absolute Center) */}
            <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-2 text-zinc-500 font-mono text-xs bg-black/40 px-4 py-1.5 rounded-full border border-white/5 shadow-sm">
                 <Clock size={12} />
                 <span>{formattedTime}</span>
            </div>

            <div className="flex gap-2 shrink-0">
                {/* RESTART BUTTON */}
                <button onClick={onRestart} className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors" title="Restart Simulation">
                    <RotateCcw size={20} />
                </button>
                <button onClick={onToggleRightPanel} className={`lg:hidden p-2 rounded-xl transition-colors ${showRightPanel ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:bg-white/10'}`}>
                    <PanelRight size={20} />
                </button>
                <button onClick={onTogglePhone} className={`p-2 rounded-xl transition-colors ${showPhone ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:bg-white/10'}`}>
                    <SmartphoneIcon size={20} />
                </button>
            </div>
        </div>
    );
};
