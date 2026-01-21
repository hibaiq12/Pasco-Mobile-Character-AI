
import React, { useState, useMemo } from 'react';
import { Sparkles, X, Clock, Play, MapPin, AlignJustify, Save, Link2, User, Bot, Briefcase, Shirt, MessageSquare, Maximize2, Minimize2 } from 'lucide-react';
import { OutfitItem } from '../../../types';
import { WardrobeEditor } from './WardrobeEditor';
import { t } from '../../../services/translationService';

interface ChatContextProps {
    show: boolean;
    onClose: () => void;
    timeSkip: { d: string, h: string, m: string, s: string };
    setTimeSkip: (val: any) => void;
    onApplyTimeSkip: () => void;
    userLocation: string;
    setUserLocation: (val: string) => void;
    botLocation: string;
    setBotLocation: (val: string) => void;
    currentLocation: string; 
    setCurrentLocation: (val: string) => void;
    onSyncLocation: () => void;
    responseLength: string;
    setResponseLength: (val: 'concise' | 'short' | 'medium' | 'long') => void;
    onManualSave: () => void;
    characterName: string;
    outfits?: OutfitItem[];
    setOutfits?: (items: OutfitItem[]) => void;
}

const VERBOSITY_LEVELS = [
    { 
        id: 'concise', 
        label: 'Concise', 
        icon: Minimize2,
        desc: 'Direct, 1-2 sentences. Best for fast-paced chat.' 
    },
    { 
        id: 'short', // Mapping "Normal" to 'short' API value
        label: 'Normal', 
        icon: MessageSquare,
        desc: 'Balanced & conversational. The standard mode.' 
    },
    { 
        id: 'long', 
        label: 'Detailed', 
        icon: Maximize2,
        desc: 'Descriptive, inner monologues, immersive roleplay.' 
    },
];

export const ChatContext: React.FC<ChatContextProps> = ({
    show, onClose,
    timeSkip, setTimeSkip, onApplyTimeSkip,
    userLocation, setUserLocation,
    botLocation, setBotLocation,
    onSyncLocation,
    responseLength, setResponseLength,
    onManualSave, characterName,
    outfits = [], setOutfits
}) => {
    // State to toggle views
    const [view, setView] = useState<'main' | 'wardrobe'>('main');

    const isBotWorking = botLocation === 'Bekerja';
    const isUserWorking = userLocation === 'Bekerja';

    const handleTimeChange = (field: string, value: string) => {
        if (!/^\d*$/.test(value)) return;
        setTimeSkip({ ...timeSkip, [field]: value });
    };

    // Calculate current slider index (0, 1, 2)
    // Fallback: If data is 'medium' or invalid, default to 1 (Short/Normal)
    const currentVerbosityIndex = useMemo(() => {
        const idx = VERBOSITY_LEVELS.findIndex(v => v.id === responseLength);
        return idx === -1 ? 1 : idx;
    }, [responseLength]);

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newIndex = parseInt(e.target.value);
        const newMode = VERBOSITY_LEVELS[newIndex].id as 'concise' | 'short' | 'long';
        setResponseLength(newMode);
    };

    return (
        <div className={`
            fixed lg:static top-0 right-0 h-full w-80 z-50 lg:z-10 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col border-l border-white/5
            bg-black/85 backdrop-blur-xl lg:bg-zinc-950/60 lg:backdrop-blur-xl
            ${show ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}>
            {/* Header - Conditional based on view */}
            <div className="p-6 pb-4 border-b border-white/5 flex justify-between items-center shrink-0">
                {view === 'main' ? (
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <Sparkles size={14} className="text-violet-400"/> {t('ctx.title')}
                    </span>
                ) : (
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <Shirt size={14} className="text-violet-400"/> {t('wd.title')}
                    </span>
                )}
                <button onClick={onClose} className="lg:hidden text-zinc-500 hover:text-white"><X size={18}/></button>
            </div>

            {/* Content Area */}
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                
                {view === 'main' ? (
                    /* === MAIN CONTEXT VIEW === */
                    <div className="animate-fade-in space-y-8">
                        <div>
                            <h4 className="text-[10px] font-bold text-zinc-500 uppercase mb-3 flex items-center gap-2"><Clock size={12}/> {t('ctx.time')}</h4>
                            <div className="bg-zinc-900/50 p-3 rounded-xl border border-white/5">
                                <div className="grid grid-cols-4 gap-1 mb-2 text-[9px] text-zinc-500 font-mono text-center tracking-wider"><div>DAY</div><div>HR</div><div>MIN</div><div>SEC</div></div>
                                <div className="flex items-center gap-1 bg-black/30 border border-zinc-700 rounded-lg p-1 mb-3">
                                    <input type="text" value={timeSkip.d === '0' ? '' : timeSkip.d} onChange={(e) => handleTimeChange('d', e.target.value)} className="w-full bg-transparent text-center text-sm font-mono text-white outline-none p-1 placeholder-zinc-700 focus:placeholder-transparent" placeholder="0" />
                                    <span className="text-zinc-700 font-bold">:</span>
                                    <input type="text" value={timeSkip.h === '0' ? '' : timeSkip.h} onChange={(e) => handleTimeChange('h', e.target.value)} className="w-full bg-transparent text-center text-sm font-mono text-white outline-none p-1 placeholder-zinc-700 focus:placeholder-transparent" placeholder="0" />
                                    <span className="text-zinc-700 font-bold">:</span>
                                    <input type="text" value={timeSkip.m === '0' ? '' : timeSkip.m} onChange={(e) => handleTimeChange('m', e.target.value)} className="w-full bg-transparent text-center text-sm font-mono text-white outline-none p-1 placeholder-zinc-700 focus:placeholder-transparent" placeholder="0" />
                                    <span className="text-zinc-700 font-bold">:</span>
                                    <input type="text" value={timeSkip.s === '0' ? '' : timeSkip.s} onChange={(e) => handleTimeChange('s', e.target.value)} className="w-full bg-transparent text-center text-sm font-mono text-white outline-none p-1 placeholder-zinc-700 focus:placeholder-transparent" placeholder="0" />
                                </div>
                                <button onClick={onApplyTimeSkip} className="w-full bg-zinc-800 hover:bg-violet-600 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-2 uppercase tracking-wide transition-all shadow-lg active:scale-95 group">
                                    Advance Time <Play size={10} fill="currentColor" className="group-hover:translate-x-0.5 transition-transform"/>
                                </button>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-2"><MapPin size={12}/> {t('ctx.loc')}</h4>
                            </div>
                            
                            <div className="flex gap-2 mb-3">
                                <button onClick={() => setBotLocation(userLocation)} disabled={isBotWorking} className={`flex-1 text-[9px] border py-1.5 rounded flex items-center justify-center gap-1.5 transition-colors active:scale-95 ${isBotWorking ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-zinc-800 hover:bg-blue-600 text-zinc-300 hover:text-white border-white/5 hover:border-blue-500'}`} title="Set Chatbot location to match User">
                                    <span className="opacity-50">{t('ctx.loc.match')}</span> <User size={10} />
                                </button>
                                <button onClick={onSyncLocation} disabled={isUserWorking} className={`flex-1 text-[9px] border py-1.5 rounded flex items-center justify-center gap-1.5 transition-colors active:scale-95 ${isUserWorking ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-zinc-800 hover:bg-violet-600 text-zinc-300 hover:text-white border-white/5 hover:border-violet-500'}`} title="Set User location to match Chatbot">
                                    <span className="opacity-50">{t('ctx.loc.match')}</span> <Bot size={10} />
                                </button>
                            </div>
                            
                            <div className="space-y-3">
                                <div className={`p-2 rounded-xl border relative group transition-colors ${isUserWorking ? 'bg-blue-900/20 border-blue-500/30' : 'bg-zinc-900/50 border-white/5 focus-within:border-blue-500/50'}`}>
                                    <div className={`absolute top-2 right-2 ${isUserWorking ? 'text-blue-400' : 'text-zinc-600'}`}>{isUserWorking ? <Briefcase size={12}/> : <User size={12}/>}</div>
                                    <label className="text-[8px] font-bold text-zinc-600 uppercase block mb-1 ml-1">{t('ctx.loc.user')}</label>
                                    <input value={userLocation} onChange={(e) => setUserLocation(e.target.value)} disabled={isUserWorking} className={`bg-transparent w-full text-sm outline-none px-1 pb-1 ${isUserWorking ? 'text-blue-200 font-bold cursor-not-allowed' : 'text-white placeholder-zinc-700'}`} placeholder="Where are you?" />
                                </div>

                                <div className={`p-2 rounded-xl border relative group transition-colors ${isBotWorking ? 'bg-orange-900/20 border-orange-500/30' : 'bg-zinc-900/50 border-white/5 focus-within:border-violet-500/50'}`}>
                                    <div className={`absolute top-2 right-2 ${isBotWorking ? 'text-orange-400' : 'text-zinc-600'}`}>{isBotWorking ? <Briefcase size={12}/> : <Bot size={12}/>}</div>
                                    <label className="text-[8px] font-bold text-zinc-600 uppercase block mb-1 ml-1">{characterName.split(' ')[0]}'s Position</label>
                                    <input value={botLocation} onChange={(e) => setBotLocation(e.target.value)} disabled={isBotWorking} className={`bg-transparent w-full text-sm outline-none px-1 pb-1 ${isBotWorking ? 'text-orange-200 font-bold cursor-not-allowed' : 'text-white placeholder-zinc-700'}`} placeholder="Where are they?" />
                                </div>
                            </div>
                            
                            {userLocation.trim().toLowerCase() !== botLocation.trim().toLowerCase() && (
                                <div className="mt-2 text-[9px] text-amber-500 bg-amber-900/20 border border-amber-500/20 p-2 rounded-lg flex gap-2 items-start animate-fade-in">
                                    <div className="shrink-0 mt-0.5"><Link2 size={10}/></div>
                                    <span>Locations mismatch. Communications will be routed via Smartphone (SMS Protocol).</span>
                                </div>
                            )}
                        </div>

                        {/* WARDROBE ENTRY BUTTON */}
                        <div>
                            <h4 className="text-[10px] font-bold text-zinc-500 uppercase mb-3 flex items-center gap-2"><Shirt size={12}/> {t('ctx.wardrobe')}</h4>
                            <button 
                                onClick={() => setView('wardrobe')}
                                className="w-full bg-zinc-900/50 border border-white/10 hover:bg-zinc-800 text-zinc-300 p-3 rounded-xl flex items-center justify-between group transition-colors"
                            >
                                <span className="text-xs font-medium">{t('ctx.wardrobe.btn')}</span>
                                <div className="bg-zinc-800 group-hover:bg-zinc-700 p-1.5 rounded-lg transition-colors">
                                    <AlignJustify size={14} />
                                </div>
                            </button>
                        </div>

                        {/* RESPONSE VERBOSITY (Refined Slider) */}
                        <div>
                            <h4 className="text-[10px] font-bold text-zinc-500 uppercase mb-4 flex items-center gap-2">
                                <AlignJustify size={12}/> Response Verbosity
                            </h4>
                            
                            <div className="px-1">
                                <div className="relative h-10 flex items-center select-none">
                                    {/* Track */}
                                    <div className="absolute w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-violet-600 to-indigo-400 transition-all duration-300 ease-out" 
                                            style={{ width: `${currentVerbosityIndex * 50}%` }}
                                        />
                                    </div>
                                    
                                    {/* Markers */}
                                    <div className="absolute inset-0 flex justify-between items-center px-0.5 pointer-events-none">
                                        {[0, 1, 2].map((idx) => (
                                            <div 
                                                key={idx}
                                                className={`
                                                    w-4 h-4 rounded-full border-2 transition-all duration-300 z-10
                                                    ${idx <= currentVerbosityIndex ? 'bg-zinc-950 border-violet-500' : 'bg-zinc-900 border-zinc-700'}
                                                    ${idx === currentVerbosityIndex ? 'scale-125 shadow-[0_0_10px_rgba(139,92,246,0.5)]' : ''}
                                                `}
                                            />
                                        ))}
                                    </div>

                                    {/* Input */}
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="2" 
                                        step="1"
                                        value={currentVerbosityIndex}
                                        onChange={handleSliderChange}
                                        className="absolute w-full h-full opacity-0 cursor-pointer z-20"
                                    />
                                </div>

                                {/* Labels & Icon */}
                                <div className="flex justify-between mt-1 text-[10px] font-bold uppercase text-zinc-500 mb-4">
                                    <span className={currentVerbosityIndex === 0 ? "text-violet-400" : ""}>Concise</span>
                                    <span className={currentVerbosityIndex === 1 ? "text-violet-400" : ""}>Normal</span>
                                    <span className={currentVerbosityIndex === 2 ? "text-violet-400" : ""}>Detailed</span>
                                </div>

                                {/* Dynamic Description Box */}
                                <div className="bg-zinc-900/80 p-3 rounded-xl border border-white/5 animate-fade-in flex gap-3 items-center min-h-[60px]">
                                    <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400 shrink-0">
                                        {React.createElement(VERBOSITY_LEVELS[currentVerbosityIndex].icon, { size: 16 })}
                                    </div>
                                    <div className="flex-1">
                                        <span className="block text-[10px] font-bold text-violet-300 uppercase mb-0.5">
                                            {VERBOSITY_LEVELS[currentVerbosityIndex].label} Mode
                                        </span>
                                        <p className="text-[10px] text-zinc-400 leading-tight">
                                            {VERBOSITY_LEVELS[currentVerbosityIndex].desc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto border-t border-white/5 pt-6">
                            <button onClick={onManualSave} className="w-full bg-white text-black hover:bg-zinc-200 font-bold py-3 rounded-xl text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform">
                                <Save size={14} /> {t('ctx.save')}
                            </button>
                        </div>
                    </div>
                ) : (
                    /* === WARDROBE EDITOR VIEW === */
                    <WardrobeEditor 
                        outfits={outfits}
                        setOutfits={setOutfits || (() => {})}
                        characterName={characterName}
                        onBack={() => setView('main')}
                    />
                )}
            </div>
        </div>
    );
};
