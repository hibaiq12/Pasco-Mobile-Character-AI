
import React from 'react';
import { Contact } from '../../../../../services/smartphoneStorage';
import { ArrowLeft, Brain, MessageCircle, Fingerprint, Eye, Speaker, Activity, HeartHandshake, Scale, UserPlus, Layers, Sword, BookOpen, MapPin, Sparkles, Save, Trash2, Settings2 } from 'lucide-react';
import { InputField } from '../SharedComponents';

interface EditorPanelProps {
    activeContact: Contact;
    activeSection: string;
    setActiveSection: (id: any) => void;
    parsedSections: Record<string, string>;
    onUpdateSection: (section: string, value: string) => void;
    onUpdateContact: (field: keyof Contact, value: any) => void;
    onClose: () => void;
    isSaved: boolean;
}

const TABS = [
    { id: 'dialogue', label: 'Dialogue', icon: MessageCircle },
    { id: 'identity', label: 'Identity', icon: Fingerprint },
    { id: 'visuals', label: 'Visuals', icon: Eye },
    { id: 'voice', label: 'Voice', icon: Speaker },
    { id: 'psyche', label: 'Psyche', icon: Activity },
    { id: 'emotional', label: 'Emotion', icon: HeartHandshake },
    { id: 'moral', label: 'Moral', icon: Scale },
    { id: 'social', label: 'Social', icon: UserPlus },
    { id: 'duality', label: 'Duality', icon: Layers },
    { id: 'capabilities', label: 'Skills', icon: Sword },
    { id: 'lore', label: 'Lore', icon: BookOpen },
    { id: 'memory', label: 'Memory', icon: Brain },
    { id: 'scenario', label: 'Scene', icon: MapPin },
];

export const EditorPanel: React.FC<EditorPanelProps> = ({ 
    activeContact, activeSection, setActiveSection, parsedSections, 
    onUpdateSection, onUpdateContact, onClose, isSaved 
}) => {
    return (
        <div className="flex-1 flex flex-col h-full bg-[#0a0a0a] animate-in slide-in-from-right-2 duration-300 overflow-hidden">
            {/* Header */}
            <div className="h-14 md:h-16 px-4 md:px-6 border-b border-white/5 bg-zinc-900/80 backdrop-blur-xl shrink-0 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center gap-3 overflow-hidden">
                    <button 
                        onClick={onClose} 
                        className="p-2 -ml-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all active:scale-90"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl overflow-hidden border border-white/10 shrink-0 shadow-lg">
                        <img src={activeContact.avatar} className="w-full h-full object-cover" alt="" />
                    </div>
                    
                    <div className="min-w-0">
                        <h2 className="text-xs md:text-sm font-black text-white truncate tracking-tight">{activeContact.name}</h2>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${isSaved ? 'bg-emerald-500' : 'bg-blue-400 animate-pulse'}`}></span>
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">{isSaved ? 'Synchronized' : 'Transmitting...'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2 text-zinc-500 hover:text-red-400 transition-colors">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Tabs - Optimized Scroll Container */}
            <div className="border-b border-white/5 bg-zinc-950 shrink-0 shadow-inner">
                <div className="flex overflow-x-auto no-scrollbar px-3 py-2 gap-2 snap-x">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSection(tab.id)}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-xl 
                                text-[10px] font-black uppercase tracking-[0.1em] transition-all whitespace-nowrap snap-start border
                                ${activeSection === tab.id 
                                    ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/20 scale-105' 
                                    : 'bg-zinc-900 text-zinc-500 border-white/5 hover:text-zinc-300 hover:border-zinc-700'}
                            `}
                        >
                            <tab.icon size={12} strokeWidth={3} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-10 pb-32 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/5 via-transparent to-transparent">
                <div className="max-w-2xl mx-auto space-y-6">
                    
                    {activeSection === 'identity' && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="bg-zinc-900/50 p-5 rounded-3xl border border-white/5 shadow-xl">
                                <InputField labelKey="Identity Designation" value={activeContact.name} onChange={(v) => onUpdateContact('name', v)} className="bg-black/20" />
                            </div>
                            <div className="bg-zinc-900/50 p-5 rounded-3xl border border-white/5 shadow-xl">
                                <InputField labelKey="Neural Signature (Avatar)" value={activeContact.avatar || ''} onChange={(v) => onUpdateContact('avatar', v)} placeholderKey="https://..." />
                            </div>
                        </div>
                    )}

                    {activeSection === 'dialogue' && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="bg-zinc-900/80 p-5 rounded-[2rem] border border-blue-500/20 shadow-2xl flex flex-col min-h-[400px]">
                                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                                    <label className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Sparkles size={14} className="text-blue-500"/> System Core Protocol
                                    </label>
                                    <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400">
                                        <Brain size={12} />
                                    </div>
                                </div>
                                <textarea 
                                    value={parsedSections['dialogue'] || ''}
                                    onChange={(e) => onUpdateSection('dialogue', e.target.value)}
                                    className="flex-1 w-full bg-transparent text-xs text-zinc-300 font-mono outline-none resize-none leading-relaxed placeholder-zinc-700"
                                    placeholder="Input neural behavior logic..."
                                />
                                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center opacity-40">
                                    <span className="text-[8px] font-bold text-zinc-500 uppercase">Latency: Minimal</span>
                                    <span className="text-[8px] font-mono text-zinc-500">ENG_V2.5</span>
                                </div>
                            </div>
                            <div className="bg-zinc-900/50 p-5 rounded-3xl border border-white/5 shadow-xl">
                                <InputField labelKey="Neural Sync Trace (Last Msg)" value={activeContact.lastMessage} onChange={(v) => onUpdateContact('lastMessage', v)} />
                            </div>
                        </div>
                    )}

                    {activeSection !== 'identity' && activeSection !== 'dialogue' && (
                        <div className="animate-fade-in">
                             <div className="bg-zinc-900/80 p-6 rounded-[2rem] border border-white/5 shadow-2xl flex flex-col min-h-[450px] relative overflow-hidden">
                                {/* Decorative BG Icon */}
                                <div className="absolute -right-8 -top-8 text-white/[0.02] transform rotate-12 scale-150 pointer-events-none">
                                    {React.createElement(TABS.find(t => t.id === activeSection)!.icon as any, { size: 180 })}
                                </div>

                                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/5 relative z-10">
                                    <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-500 border border-blue-500/20 shadow-lg">
                                        {React.createElement(TABS.find(t => t.id === activeSection)!.icon as any, { size: 20, strokeWidth: 2.5 })}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-white uppercase tracking-[0.1em]">{activeSection} Module</h3>
                                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Neural Context Injection</p>
                                    </div>
                                </div>
                                
                                <textarea 
                                    value={parsedSections[activeSection] || ''}
                                    onChange={(e) => onUpdateSection(activeSection, e.target.value)}
                                    className="flex-1 w-full bg-black/20 border border-white/5 rounded-2xl p-4 text-xs text-zinc-300 font-mono outline-none focus:border-blue-500/40 transition-all resize-none leading-relaxed relative z-10 shadow-inner"
                                    placeholder={`[${activeSection.toUpperCase()}] Waiting for input matrix...`}
                                />
                                
                                <div className="mt-4 flex items-center justify-between text-[9px] font-black uppercase text-zinc-600 relative z-10">
                                    <div className="flex items-center gap-1.5">
                                        <Settings2 size={10} />
                                        <span>Manual Override Ready</span>
                                    </div>
                                    <span>Sync: Stable</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
