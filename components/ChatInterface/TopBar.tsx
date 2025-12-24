
import React from 'react';
import { ArrowLeft, RotateCcw, PanelRight, Smartphone as SmartphoneIcon, Clock } from 'lucide-react';
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
    return (
        <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-zinc-950/80 backdrop-blur-md z-10 shrink-0">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="text-zinc-400 hover:text-white transition-colors"><ArrowLeft size={20} /></button>
                {/* Header Info - Mobile Only */}
                <div className="flex items-center gap-3 lg:opacity-0 transition-opacity cursor-pointer lg:pointer-events-none" onClick={onShowProfile}>
                     <div className="relative lg:hidden">
                        <img src={activeChar.avatar} className="w-9 h-9 rounded-full border border-zinc-700 object-cover" />
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-zinc-950"></div>
                     </div>
                     <div className="lg:hidden">
                         <h2 className="text-sm font-bold text-white leading-tight">{activeChar.name}</h2>
                         <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                             <Clock size={10} />
                             <span className="bg-zinc-900 px-1.5 py-0.5 rounded text-green-400 font-bold tracking-widest">{formattedTime}</span>
                         </div>
                     </div>
                </div>
            </div>
            <div className="flex gap-2">
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
