
import React from 'react';
import { Sparkles, X, Clock, Play, MapPin, AlignJustify, Save } from 'lucide-react';

interface RightSidebarProps {
    show: boolean;
    onClose: () => void;
    timeSkip: { d: string, h: string, m: string, s: string };
    setTimeSkip: (val: any) => void;
    onApplyTimeSkip: () => void;
    currentLocation: string;
    setCurrentLocation: (val: string) => void;
    responseLength: string;
    setResponseLength: (val: 'concise' | 'short' | 'medium' | 'long') => void;
    onManualSave: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
    show, onClose,
    timeSkip, setTimeSkip, onApplyTimeSkip,
    currentLocation, setCurrentLocation,
    responseLength, setResponseLength,
    onManualSave
}) => {
    return (
        <div className={`
            fixed lg:static top-0 right-0 h-full w-80 bg-zinc-950/60 lg:backdrop-blur-xl border-l border-white/5 z-50 lg:z-10 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col
            ${show ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}>
            {/* Header */}
            <div className="p-6 pb-4 border-b border-white/5 flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles size={14} className="text-violet-400"/> Scene Context
                </span>
                <button onClick={onClose} className="lg:hidden text-zinc-500 hover:text-white"><X size={18}/></button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                
                <div className="mb-8">
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase mb-3 flex items-center gap-2"><Clock size={12}/> Time Skip</h4>
                    <div className="bg-zinc-900/50 p-3 rounded-xl border border-white/5">
                        <div className="grid grid-cols-4 gap-1 mb-2 text-[9px] text-zinc-500 font-mono text-center tracking-wider"><div>DAY</div><div>HR</div><div>MIN</div><div>SEC</div></div>
                        <div className="flex items-center gap-1 bg-black/30 border border-zinc-700 rounded-lg p-1 mb-3">
                            <input type="number" min="0" value={timeSkip.d} onChange={(e) => setTimeSkip({...timeSkip, d: e.target.value})} className="w-full bg-transparent text-center text-sm font-mono text-white outline-none p-1" placeholder="00" />
                            <span className="text-zinc-700 font-bold">:</span>
                            <input type="number" min="0" value={timeSkip.h} onChange={(e) => setTimeSkip({...timeSkip, h: e.target.value})} className="w-full bg-transparent text-center text-sm font-mono text-white outline-none p-1" placeholder="00" />
                            <span className="text-zinc-700 font-bold">:</span>
                            <input type="number" min="0" value={timeSkip.m} onChange={(e) => setTimeSkip({...timeSkip, m: e.target.value})} className="w-full bg-transparent text-center text-sm font-mono text-white outline-none p-1" placeholder="00" />
                            <span className="text-zinc-700 font-bold">:</span>
                            <input type="number" min="0" value={timeSkip.s} onChange={(e) => setTimeSkip({...timeSkip, s: e.target.value})} className="w-full bg-transparent text-center text-sm font-mono text-white outline-none p-1" placeholder="00" />
                        </div>
                        <button onClick={onApplyTimeSkip} className="w-full bg-zinc-800 hover:bg-violet-600 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-2 uppercase tracking-wide transition-all shadow-lg active:scale-95">
                            Advance Time <Play size={10} fill="currentColor"/>
                        </button>
                    </div>
                </div>

                <div className="mb-8">
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase mb-3 flex items-center gap-2"><MapPin size={12}/> Location</h4>
                    <div className="bg-zinc-900/50 p-1 rounded-xl border border-white/5">
                        <input 
                            value={currentLocation} 
                            onChange={(e) => setCurrentLocation(e.target.value)} 
                            className="bg-transparent w-full text-sm text-white outline-none placeholder-zinc-600 p-3" 
                            placeholder="Set location..." 
                        />
                    </div>
                </div>

                <div className="mb-8">
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase mb-3 flex items-center gap-2"><AlignJustify size={12}/> Verbosity</h4>
                    <div className="flex flex-col gap-2">
                        {[{ id: 'concise', label: 'Concise' }, { id: 'short', label: 'Short' }, { id: 'long', label: 'Long' }].map(opt => (
                            <button key={opt.id} onClick={() => setResponseLength(opt.id as any)} className={`text-left p-3 rounded-xl border transition-all ${responseLength === opt.id ? 'bg-violet-600/20 border-violet-500 text-violet-200' : 'bg-zinc-900/50 border-white/5 text-zinc-400 hover:bg-zinc-900'}`}>
                                <div className="text-xs font-bold">{opt.label}</div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-auto border-t border-white/5 pt-6">
                    <button onClick={onManualSave} className="w-full bg-white text-black hover:bg-zinc-200 font-bold py-3 rounded-xl text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform">
                        <Save size={14} /> Save Checkpoint
                    </button>
                </div>
            </div>
        </div>
    );
};
