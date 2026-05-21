
import React from 'react';
import { Smartphone, ArrowRight, Construction, ShieldCheck, Zap, MonitorPlay, Lock } from 'lucide-react';

interface SelectionCardsProps {
    onEnterHub: () => void;
    onEnterMaintenance: () => void;
    onEnterPreview: () => void;
    hovered: 'hub' | 'maintenance' | 'preview' | null;
    setHovered: (val: 'hub' | 'maintenance' | 'preview' | null) => void;
}

export const SelectionCards: React.FC<SelectionCardsProps> = ({ onEnterHub, onEnterMaintenance, onEnterPreview, hovered, setHovered }) => {
    return (
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 w-full max-w-sm md:max-w-6xl h-auto md:h-[380px] animate-in fade-in zoom-in-95 duration-1000 delay-300 z-20">
            
            {/* === CARD 1: ENTER HUB (PRIMARY) === */}
            <button
                onClick={onEnterHub}
                onMouseEnter={() => setHovered('hub')}
                onMouseLeave={() => setHovered(null)}
                className={`
                    flex-1 relative group overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] border transition-all duration-500 text-left
                    flex flex-row md:flex-col justify-between items-center md:items-start p-5 md:p-10 outline-none focus:scale-[1.02]
                    ${hovered === 'hub' 
                        ? 'bg-violet-900/20 border-violet-500/50 shadow-[0_0_60px_rgba(139,92,246,0.2)] scale-[1.02]' 
                        : 'bg-[#0f0f11]/60 border-white/5 md:border-white/10 hover:bg-[#1a1a1d]'}
                    ${hovered && hovered !== 'hub' ? 'opacity-40 scale-95 blur-[1px]' : 'opacity-100'}
                `}
            >
                {/* Mobile Layout */}
                <div className="md:hidden flex items-center gap-4 w-full">
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20">
                        <Smartphone size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-base font-bold text-white uppercase tracking-wider">Enter Hub</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            <p className="text-[10px] text-zinc-400 font-mono">System Online</p>
                        </div>
                    </div>
                    <div className="text-zinc-500 bg-white/5 p-2 rounded-full">
                        <ArrowRight size={18} />
                    </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:flex relative z-10 h-full flex-col w-full">
                    <div className="flex justify-between items-start w-full">
                        <div className={`p-5 rounded-3xl transition-colors duration-500 ${hovered === 'hub' ? 'bg-violet-600 text-white shadow-[0_0_30px_rgba(139,92,246,0.4)]' : 'bg-zinc-900 text-zinc-500 border border-white/5'}`}>
                            <Smartphone size={32} />
                        </div>
                        <div className={`transition-all duration-500 ${hovered === 'hub' ? 'translate-x-1 text-violet-400' : 'text-zinc-700'}`}>
                            <ArrowRight size={28} className="-rotate-45" />
                        </div>
                    </div>
                    <div className="mt-auto">
                        <div className="flex items-center gap-2 mb-2">
                             <Zap size={14} className={hovered === 'hub' ? 'text-cyan-400 animate-pulse' : 'text-zinc-600'} />
                             <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Primary System</span>
                        </div>
                        <h3 className={`text-3xl font-black uppercase tracking-wide mb-3 transition-colors duration-300 ${hovered === 'hub' ? 'text-white' : 'text-zinc-300'}`}>
                            Enter Hub
                        </h3>
                        <p className="text-sm text-zinc-500 leading-relaxed font-medium max-w-[300px]">
                            Initialize main neural interface. Access active links, chat modules, and social feeds.
                        </p>
                    </div>
                </div>
            </button>

            {/* === CARD 2: PREVIEW SCREEN (BLUE) === */}
             <button
                onClick={onEnterPreview}
                onMouseEnter={() => setHovered('preview')}
                onMouseLeave={() => setHovered(null)}
                className={`
                    flex-1 relative group overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] border transition-all duration-500 text-left
                    flex flex-row md:flex-col justify-between items-center md:items-start p-5 md:p-10 outline-none focus:scale-[1.02]
                    ${hovered === 'preview' 
                        ? 'bg-blue-900/20 border-blue-500/50 shadow-[0_0_60px_rgba(59,130,246,0.2)] scale-[1.02]' 
                        : 'bg-[#0f0f11]/60 border-white/5 md:border-white/10 hover:bg-[#1a1a1d]'}
                    ${hovered && hovered !== 'preview' ? 'opacity-40 scale-95 blur-[1px]' : 'opacity-100'}
                `}
            >
                {/* Mobile Layout */}
                <div className="md:hidden flex items-center gap-4 w-full">
                    <div className="p-3.5 rounded-2xl bg-zinc-800 border border-blue-500/30 text-blue-400 shadow-lg shadow-blue-500/10">
                        <MonitorPlay size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-base font-bold text-blue-100 uppercase tracking-wider">Preview Dev</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                            <p className="text-[10px] text-zinc-400 font-mono">Restricted Access</p>
                        </div>
                    </div>
                    <div className="text-zinc-500 bg-white/5 p-2 rounded-full">
                        <Lock size={18} />
                    </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:flex relative z-10 h-full flex-col w-full">
                    <div className="flex justify-between items-start w-full">
                        <div className={`p-5 rounded-3xl transition-colors duration-300 ${hovered === 'preview' ? 'bg-blue-600 text-white shadow-[0_0_30px_rgba(59,130,246,0.4)]' : 'bg-zinc-900 text-zinc-500 border border-white/5'}`}>
                            <MonitorPlay size={28} />
                        </div>
                        <div className={`flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border transition-colors ${hovered === 'preview' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' : 'border-zinc-800 text-zinc-700'}`}>
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span> Restricted
                        </div>
                    </div>
                    <div className="mt-auto">
                        <div className="flex items-center gap-2 mb-2">
                             <Lock size={14} className={hovered === 'preview' ? 'text-blue-400' : 'text-zinc-600'} />
                             <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Developer Mode</span>
                        </div>
                        <h3 className={`text-3xl font-black uppercase tracking-wide mb-3 transition-colors duration-300 ${hovered === 'preview' ? 'text-blue-100' : 'text-zinc-300'}`}>
                            Preview Screen
                        </h3>
                        <p className="text-sm text-zinc-500 leading-relaxed font-medium max-w-[300px]">
                            Access developer tools and system preview modules. Requires authorization PIN.
                        </p>
                    </div>
                </div>
            </button>

            {/* === CARD 3: MAINTENANCE (AMBER) === */}
            <button
                onClick={onEnterMaintenance}
                onMouseEnter={() => setHovered('maintenance')}
                onMouseLeave={() => setHovered(null)}
                className={`
                    flex-1 relative group overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] border transition-all duration-500 text-left
                    flex flex-row md:flex-col justify-between items-center md:items-start p-5 md:p-10 outline-none focus:scale-[1.02]
                    ${hovered === 'maintenance' 
                        ? 'bg-amber-950/20 border-amber-500/40 shadow-[0_0_60px_rgba(245,158,11,0.1)] scale-[1.02]' 
                        : 'bg-[#0f0f11]/60 border-white/5 md:border-white/10 hover:bg-[#1a1a1d]'}
                    ${hovered && hovered !== 'maintenance' ? 'opacity-40 scale-95 blur-[1px]' : 'opacity-100'}
                `}
            >
                {/* Mobile Layout */}
                <div className="md:hidden flex items-center gap-4 w-full">
                    <div className="p-3.5 rounded-2xl bg-zinc-800 border border-amber-500/30 text-amber-500">
                        <Construction size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-base font-bold text-amber-100 uppercase tracking-wider">Maintenance</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                            <p className="text-[10px] text-zinc-400 font-mono">Restricted Access</p>
                        </div>
                    </div>
                    <div className="text-zinc-500 bg-white/5 p-2 rounded-full">
                        <ShieldCheck size={18} />
                    </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:flex relative z-10 h-full flex-col w-full">
                    <div className="flex justify-between items-start w-full">
                        <div className={`p-5 rounded-3xl transition-colors duration-300 ${hovered === 'maintenance' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-zinc-900 text-zinc-500 border border-white/5'}`}>
                            <Construction size={28} />
                        </div>
                        <div className={`flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border transition-colors ${hovered === 'maintenance' ? 'border-amber-500/30 text-amber-500 bg-amber-500/10' : 'border-zinc-800 text-zinc-700'}`}>
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span> Restricted
                        </div>
                    </div>
                    <div className="mt-auto">
                        <div className="flex items-center gap-2 mb-2">
                             <ShieldCheck size={14} className={hovered === 'maintenance' ? 'text-amber-500' : 'text-zinc-600'} />
                             <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Admin Panel</span>
                        </div>
                        <h3 className={`text-3xl font-black uppercase tracking-wide mb-3 transition-colors duration-300 ${hovered === 'maintenance' ? 'text-amber-100' : 'text-zinc-300'}`}>
                            Maintenance
                        </h3>
                        <p className="text-sm text-zinc-500 leading-relaxed font-medium max-w-[300px]">
                            Access low-level protocols, debug tools, patch updates, and backend configuration.
                        </p>
                    </div>
                </div>
            </button>
        </div>
    );
};
