
import React from 'react';
import { Contact } from '../../../../../services/smartphoneStorage';
import { 
    ArrowLeft, Brain, MessageCircle, Fingerprint, Eye, Speaker, Activity, 
    HeartHandshake, Scale, UserPlus, Layers, Sword, BookOpen, MapPin, 
    Sparkles, Trash2, Settings2, Zap, Save, Cpu
} from 'lucide-react';
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
    { id: 'dialogue', label: 'Dialogue', icon: MessageCircle, color: 'text-blue-400', sub: 'Core Persona' },
    { id: 'identity', label: 'Identity', icon: Fingerprint, color: 'text-violet-400', sub: 'Basic Info' },
    { id: 'visuals', label: 'Visuals', icon: Eye, color: 'text-emerald-400', sub: 'Appearance' },
    { id: 'voice', label: 'Voice', icon: Speaker, color: 'text-amber-400', sub: 'Tone & Pitch' },
    { id: 'psyche', label: 'Psyche', icon: Activity, color: 'text-rose-400', sub: 'Personality' },
    { id: 'emotional', label: 'Emotion', icon: HeartHandshake, color: 'text-pink-400', sub: 'Triggers' },
    { id: 'moral', label: 'Moral', icon: Scale, color: 'text-cyan-400', sub: 'Ethics' },
    { id: 'social', label: 'Social', icon: UserPlus, color: 'text-indigo-400', sub: 'Interaction' },
    { id: 'duality', label: 'Duality', icon: Layers, color: 'text-yellow-400', sub: 'Conflict' },
    { id: 'capabilities', label: 'Skills', icon: Sword, color: 'text-red-400', sub: 'Abilities' },
    { id: 'lore', label: 'Lore', icon: BookOpen, color: 'text-sky-400', sub: 'Backstory' },
    { id: 'memory', label: 'Memory', icon: Brain, color: 'text-green-400', sub: 'Anchors' },
    { id: 'scenario', label: 'Scene', icon: MapPin, color: 'text-orange-400', sub: 'Context' },
];

export const EditorPanel: React.FC<EditorPanelProps> = ({ 
    activeContact, activeSection, setActiveSection, parsedSections, 
    onUpdateSection, onUpdateContact, onClose, isSaved 
}) => {
    
    // Helper to get active tab config
    const currentTab = TABS.find(t => t.id === activeSection) || TABS[0];

    return (
        <div className="flex flex-col h-full w-full bg-[#0d0d0f] animate-slide-in">
            {/* Sticky Header */}
            <div className="px-6 pt-8 pb-4 bg-[#0d0d0f]/90 backdrop-blur-xl shrink-0 z-30">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={onClose} className="p-2 -ml-2 text-zinc-500 hover:text-white transition-all active:scale-90">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex flex-col items-center">
                        <h2 className="text-sm font-black text-white uppercase tracking-tight truncate max-w-[150px]">
                            {activeContact.name}
                        </h2>
                        <div className="flex items-center gap-1">
                            <div className={`w-1 h-1 rounded-full ${isSaved ? 'bg-emerald-500' : 'bg-blue-500 animate-pulse'}`}></div>
                            <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">
                                {isSaved ? 'Synchronized' : 'Uplinking'}
                            </span>
                        </div>
                    </div>
                    <button className="p-2 -mr-2 text-zinc-700 hover:text-red-400 transition-colors">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* TABS */}
            <div className="border-b border-white/5 bg-zinc-950/30 shrink-0 overflow-x-auto no-scrollbar">
                <div className="flex px-4 py-3 gap-2 snap-x">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSection(tab.id)}
                            className={`
                                flex items-center justify-center min-w-[42px] h-[42px] rounded-2xl transition-all snap-start border
                                ${activeSection === tab.id 
                                    ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-900/20 scale-105' 
                                    : 'bg-zinc-900/50 border-white/5 text-zinc-500 hover:text-zinc-300'}
                            `}
                            title={tab.label}
                        >
                            <tab.icon size={18} strokeWidth={2.5} />
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                <div className="max-w-full">
                    
                    {/* Module Title Indicator */}
                    <div className="flex items-center gap-2 mb-6 opacity-60">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 whitespace-nowrap">
                            {activeSection} Protocol
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>
                    </div>

                    {activeSection === 'identity' && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="p-5 bg-zinc-900/20 border border-white/5 rounded-3xl space-y-4">
                                <InputField labelKey="Designation" value={activeContact.name} onChange={(v) => onUpdateContact('name', v)} className="bg-transparent" />
                                <InputField labelKey="Portrait Port" value={activeContact.avatar || ''} onChange={(v) => onUpdateContact('avatar', v)} placeholderKey="https://..." />
                            </div>
                            <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-center gap-3">
                                <Cpu size={14} className="text-blue-400" />
                                <p className="text-[9px] text-blue-300 leading-tight">Update node designation to refresh cross-linked memory engrams.</p>
                            </div>
                        </div>
                    )}

                    {activeSection === 'dialogue' && (
                        <div className="space-y-4 animate-fade-in flex flex-col h-full">
                            <div className="bg-zinc-900/40 border border-blue-500/20 rounded-[2rem] p-6 flex flex-col min-h-[350px] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6 opacity-5 text-white pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                                    <Brain size={120} />
                                </div>

                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 bg-blue-600/10 rounded-xl text-blue-500">
                                        <Zap size={16} className="animate-pulse" />
                                    </div>
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Neural Core Logic</span>
                                </div>

                                <textarea 
                                    value={parsedSections['dialogue'] || ''}
                                    onChange={(e) => onUpdateSection('dialogue', e.target.value)}
                                    className="flex-1 w-full bg-transparent text-xs text-zinc-300 font-mono outline-none resize-none leading-relaxed placeholder-zinc-800"
                                    placeholder="Input behavior protocols..."
                                />
                                
                                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-[8px] font-bold text-zinc-600 uppercase tracking-widest">
                                    <span>Sync Mode: Realtime</span>
                                    <span>V2.1.0</span>
                                </div>
                            </div>
                            <InputField labelKey="Last Sync Status" value={activeContact.lastMessage} onChange={(v) => onUpdateContact('lastMessage', v)} className="bg-zinc-900/20 p-5 rounded-2xl border border-white/5" />
                        </div>
                    )}

                    {/* GENERIC HANDLER FOR ALL OTHER SECTIONS (Moral, Social, Lore, etc.) */}
                    {activeSection !== 'identity' && activeSection !== 'dialogue' && (
                        <div className="animate-fade-in">
                             <div className="bg-zinc-900/40 border border-white/10 rounded-[2rem] p-6 min-h-[400px] flex flex-col relative overflow-hidden">
                                
                                {/* Dynamic Header based on Current Tab */}
                                <div className="flex items-center gap-4 mb-6 relative z-10">
                                    <div className={`p-3 bg-zinc-950 rounded-2xl shadow-xl border border-white/10 ${currentTab.color}`}>
                                        {React.createElement(currentTab.icon as any, { size: 20, strokeWidth: 2.5 })}
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-black text-white uppercase tracking-widest">{currentTab.label} Module</h3>
                                        <p className="text-[9px] text-zinc-600 font-medium uppercase mt-0.5">{currentTab.sub || 'Configuration'}</p>
                                    </div>
                                </div>
                                
                                <textarea 
                                    value={parsedSections[activeSection] || ''}
                                    onChange={(e) => onUpdateSection(activeSection, e.target.value)}
                                    className="flex-1 w-full bg-black/30 border border-white/5 rounded-[1.5rem] p-4 text-xs text-zinc-300 font-mono outline-none focus:border-blue-500/30 transition-all resize-none leading-relaxed shadow-inner relative z-10"
                                    placeholder={`[${activeSection.toUpperCase()}] Waiting for input... Define strict parameters here.`}
                                />
                                
                                <div className="mt-4 flex items-center justify-between text-[9px] font-black uppercase text-zinc-600 relative z-10">
                                    <div className="flex items-center gap-1.5">
                                        <Settings2 size={10} />
                                        <span>Manual Override</span>
                                    </div>
                                    <span>Encrypted Layer Active</span>
                                </div>

                                {/* Background Decoration */}
                                <div className="absolute -right-6 -bottom-6 opacity-5 pointer-events-none transform rotate-12">
                                    {React.createElement(currentTab.icon as any, { size: 150 })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
