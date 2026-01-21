
import React from 'react';
import { ArrowLeft, RotateCcw, PanelRight, Smartphone as SmartphoneIcon, Clock, Cpu, Zap, Server } from 'lucide-react';
import { Character } from '../../types';

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
    
    // Helper to determine model badge appearance
    const getModelBadge = (modelName?: string) => {
        const m = (modelName || 'gemini-2.5-flash').toLowerCase();
        
        if (m.includes('openrouter')) {
            return { 
                label: 'OpenRouter', 
                color: 'text-blue-400', 
                bg: 'bg-blue-500/10', 
                border: 'border-blue-500/20', 
                icon: Server 
            };
        }
        if (m.includes('kobold')) {
            return { 
                label: 'KoboldAI', 
                color: 'text-orange-400', 
                bg: 'bg-orange-500/10', 
                border: 'border-orange-500/20', 
                icon: Cpu 
            };
        }
        if (m.includes('pro') || m.includes('3.0')) {
            return { 
                label: 'Gemini 3.0 Pro', 
                color: 'text-violet-400', 
                bg: 'bg-violet-500/10', 
                border: 'border-violet-500/20', 
                icon: Zap 
            };
        }
        // Default / Flash
        return { 
            label: 'Gemini 2.5', 
            color: 'text-emerald-400', 
            bg: 'bg-emerald-500/10', 
            border: 'border-emerald-500/20', 
            icon: Zap 
        };
    };

    const modelInfo = getModelBadge(activeChar.modelConfig?.modelName);
    const BadgeIcon = modelInfo.icon;

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

                {/* MODEL BADGE */}
                {/* Visible on all screens, adjusted for mobile fit */}
                <div className={`
                    flex items-center gap-2 px-2.5 py-1 rounded-full border backdrop-blur-md transition-all shrink-0
                    ${modelInfo.bg} ${modelInfo.border}
                `}>
                    <BadgeIcon size={12} className={modelInfo.color} />
                    <span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-wider ${modelInfo.color} hidden sm:inline`}>
                        {modelInfo.label}
                    </span>
                    {/* Short label for mobile */}
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${modelInfo.color} sm:hidden`}>
                        {modelInfo.label.split(' ')[0]}
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
