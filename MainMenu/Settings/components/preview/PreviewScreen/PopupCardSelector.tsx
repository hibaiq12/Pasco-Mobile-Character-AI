
import React from 'react';
import { FileText, Sparkles, ShieldAlert, ArrowRight, LayoutTemplate } from 'lucide-react';

interface PopupCardSelectorProps {
    onNavigate: (moduleId: string) => void;
}

export const PopupCardSelector: React.FC<PopupCardSelectorProps> = ({ onNavigate }) => {
    const options = [
        {
            id: 'popup_changelog',
            title: 'Changelog',
            desc: 'System Updates & Patch Notes',
            icon: FileText,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20'
        },
        {
            id: 'popup_banner',
            title: 'New Arrival',
            desc: 'Character Introduction Banner',
            icon: Sparkles,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20'
        },
        {
            id: 'popup_disclaimer',
            title: 'Hazard Disclaimer',
            desc: 'Realism Protocol Warning',
            icon: ShieldAlert,
            color: 'text-red-400',
            bg: 'bg-red-500/10',
            border: 'border-red-500/20'
        }
    ];

    return (
        <div className="h-full w-full bg-zinc-950 flex flex-col p-6 animate-in fade-in zoom-in-95">
            <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="p-3 bg-zinc-900 rounded-xl border border-white/5">
                    <LayoutTemplate size={24} className="text-purple-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white uppercase tracking-wider">Pop Up Cards</h2>
                    <p className="text-xs text-zinc-500">Select interface to render.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 overflow-y-auto custom-scrollbar">
                {options.map((opt) => (
                    <button
                        key={opt.id}
                        onClick={() => onNavigate(opt.id)}
                        className={`
                            group flex items-center gap-4 p-4 rounded-xl border transition-all duration-300
                            ${opt.bg} ${opt.border} hover:bg-zinc-900 hover:border-white/20
                        `}
                    >
                        <div className={`p-3 rounded-lg bg-black/40 ${opt.color}`}>
                            <opt.icon size={20} />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className={`text-sm font-bold ${opt.color} group-hover:text-white transition-colors`}>
                                {opt.title}
                            </h3>
                            <p className="text-[10px] text-zinc-400 group-hover:text-zinc-300">
                                {opt.desc}
                            </p>
                        </div>
                        <ArrowRight size={16} className="text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </button>
                ))}
            </div>
        </div>
    );
};
