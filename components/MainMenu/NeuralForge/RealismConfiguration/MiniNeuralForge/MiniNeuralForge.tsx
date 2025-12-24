
import React, { useState, useMemo, useEffect } from 'react';
import { Contact, saveSmartphoneData, getSmartphoneData } from '../../../../../services/smartphoneStorage';
import { HIYORI_CONTACTS } from '../../../../../services/StorageServices/CharacterStorage/RealismCharacter/HiyoriKanade/SmartphoneContact/index';
import { 
    Users, MessageCircle, Brain, BookOpen, Fingerprint, Smartphone, RefreshCw, Scale, UserPlus, ArrowLeft, 
    ScanFace, Eye, Speaker, Activity, HeartHandshake, Layers, Sword, MapPin, Save, ChevronRight, Sparkles, Plus, Settings2
} from 'lucide-react';
import { InputField } from '../SharedComponents';

interface MiniNeuralForgeProps {
    onBack: () => void;
}

type MiniSection = 'identity' | 'dialogue' | 'visuals' | 'voice' | 'psyche' | 'emotional' | 'moral' | 'social' | 'duality' | 'capabilities' | 'lore' | 'memory' | 'scenario';

const TABS = [
    { id: 'identity', label: 'Identity', icon: Fingerprint },
    { id: 'dialogue', label: 'Dialogue', icon: MessageCircle },
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

export const MiniNeuralForge: React.FC<MiniNeuralForgeProps> = ({ onBack }) => {
    // --- STATE MANAGEMENT ---
    // ROBUST DATA LOADING: Handles partial/corrupt .psc files gracefully
    const [contacts, setContacts] = useState<Contact[]>(() => {
        try {
            const stored = getSmartphoneData('char-hiyori');
            // Validate that stored data exists and has a valid contacts array
            if (stored && Array.isArray(stored.contacts) && stored.contacts.length > 0) {
                return stored.contacts;
            }
        } catch (e) {
            console.warn("MiniNeuralForge: Error loading contacts from storage, reverting to defaults.", e);
        }
        // Fallback to constants if storage is empty or corrupt
        return HIYORI_CONTACTS;
    });
    
    // Default to first contact if list is not empty
    const [selectedId, setSelectedId] = useState<string | null>(contacts.length > 0 ? contacts[0].id : null); 
    const [activeSection, setActiveSection] = useState<MiniSection>('dialogue');
    const [isSaved, setIsSaved] = useState(false);

    // Derived Active Contact
    const activeContact = useMemo(() => 
        contacts.find(c => c.id === selectedId) || null
    , [contacts, selectedId]);

    // --- PARSING ---
    const [parsedSections, setParsedSections] = useState<Record<string, string>>({});

    useEffect(() => {
        if (activeContact) {
            const desc = activeContact.description || "";
            const newSections: Record<string, string> = {};
            const mainSplit = desc.split(/\[([A-Z]+)\]/);
            newSections['dialogue'] = mainSplit[0].trim();

            const regex = /\[([A-Z]+)\]([\s\S]*?)(?=\[|$)/g;
            let match;
            while ((match = regex.exec(desc)) !== null) {
                const key = match[1].toLowerCase();
                const content = match[2].trim();
                newSections[key] = content;
            }
            setParsedSections(newSections);
        }
    }, [activeContact?.id]);

    // --- ACTIONS ---
    const updateContactField = (field: keyof Contact, value: any) => {
        setContacts(prev => prev.map(c => 
            c.id === selectedId ? { ...c, [field]: value } : c
        ));
    };

    const updateSection = (section: string, value: string) => {
        if (!activeContact) return;
        const updatedSections = { ...parsedSections, [section]: value };
        setParsedSections(updatedSections);

        let compiled = updatedSections['dialogue'] || "";
        Object.entries(updatedSections).forEach(([key, val]) => {
            const content = val as string;
            if (key !== 'dialogue' && content && content.trim()) {
                compiled += `\n\n[${key.toUpperCase()}]\n${content.trim()}`;
            }
        });
        updateContactField('description', compiled);
    };

    // Auto-save logic
    useEffect(() => {
        const timer = setTimeout(() => {
            const currentData = getSmartphoneData('char-hiyori');
            // Robust save: Only save if we have base data, otherwise init it
            if (currentData) {
                const updatedData = { ...currentData, contacts: contacts };
                saveSmartphoneData('char-hiyori', updatedData);
                setIsSaved(true);
                setTimeout(() => setIsSaved(false), 2000);
            }
        }, 1000); // Debounce save
        return () => clearTimeout(timer);
    }, [contacts]);

    const handleReset = () => {
        if (window.confirm("Reset all contacts to original defaults?")) {
            setContacts(HIYORI_CONTACTS);
            if (HIYORI_CONTACTS.length > 0) setSelectedId(HIYORI_CONTACTS[0].id);
        }
    };

    // --- RENDER ---
    return (
        <div className="h-full w-full bg-[#09090b] flex flex-col md:flex-row overflow-hidden relative font-sans text-zinc-200">
            
            {/* === LEFT RAIL: PROTOCOLS === */}
            <div className="w-12 h-full border-r border-white/5 flex flex-col items-center py-6 bg-zinc-950 shrink-0 z-30">
                 <button 
                    onClick={onBack} 
                    className="p-2 mb-8 text-zinc-500 hover:text-white transition-colors hover:bg-white/5 rounded-lg"
                    title="Exit"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="flex-1 flex items-center justify-center">
                    <span className="writing-vertical-lr rotate-180 text-[10px] font-black tracking-[0.3em] text-zinc-600 uppercase whitespace-nowrap opacity-80 hover:text-blue-500 transition-colors cursor-default">
                        NEURAL PROTOCOLS
                    </span>
                </div>
                <div className="mt-auto flex flex-col gap-3 opacity-30">
                     <div className="w-1 h-1 rounded-full bg-zinc-500"></div>
                     <div className="w-1 h-1 rounded-full bg-zinc-500"></div>
                     <div className="w-1 h-8 rounded-full bg-blue-500"></div>
                </div>
            </div>

            {/* === MIDDLE PANEL: ROSTER LIST === */}
            <div className={`
                flex flex-col h-full w-full md:w-[400px] shrink-0 z-20 bg-[#09090b] border-r border-white/5
                ${selectedId ? 'hidden md:flex' : 'flex'}
            `}>
                
                {/* Header */}
                <div className="p-6 pb-2">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-xl font-black text-white tracking-tighter flex items-center gap-2">
                                <Brain size={24} className="text-blue-500" />
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">NEURAL FORGE</span>
                            </h1>
                            <div className="flex items-center gap-2 mt-1.5">
                                <span className="px-1.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[9px] font-bold text-blue-400 uppercase tracking-wider">
                                    Story Mode
                                </span>
                                <span className="text-[9px] text-zinc-600 font-mono">V.2.4</span>
                            </div>
                        </div>
                    </div>

                    {/* NPC ROSTER Title Card */}
                    <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-xl flex items-center justify-between shadow-lg mb-4 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Users size={60} />
                        </div>
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-white/5 flex items-center justify-center text-zinc-400 shadow-lg">
                                <Users size={18} fill="currentColor" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none">NPC Roster</h3>
                                <p className="text-[10px] text-zinc-500 mt-1 font-medium">Manage Active Personas</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleReset} 
                            className="p-2 rounded-lg bg-black/20 hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors relative z-10"
                            title="Reset Defaults"
                        >
                            <RefreshCw size={14} />
                        </button>
                    </div>
                </div>

                {/* List Container */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6 space-y-3">
                    {contacts.map(contact => {
                        const isSelected = selectedId === contact.id;
                        return (
                            <div 
                                key={contact.id}
                                onClick={() => setSelectedId(contact.id)}
                                className={`
                                    relative p-3.5 rounded-2xl cursor-pointer transition-all duration-300 group overflow-hidden border
                                    ${isSelected 
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-500/50 shadow-xl shadow-blue-900/20 translate-x-2 z-10' 
                                        : 'bg-zinc-900/20 border-white/5 hover:bg-zinc-900/60 hover:border-white/10 hover:shadow-md'}
                                `}
                            >
                                {/* Active Indicator Glow */}
                                {isSelected && <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none"></div>}

                                <div className="flex items-center gap-4 relative z-10">
                                    {/* Avatar */}
                                    <div className="relative shrink-0">
                                        <div className={`w-12 h-12 rounded-full p-[2px] ${isSelected ? 'bg-white/20' : 'bg-zinc-800'}`}>
                                            <img 
                                                src={contact.avatar} 
                                                className="w-full h-full rounded-full object-cover bg-zinc-950" 
                                                alt={contact.name} 
                                            />
                                        </div>
                                        {contact.isSystem && (
                                            <div className="absolute -bottom-1 -right-1 bg-zinc-950 text-zinc-500 p-1 rounded-full border border-zinc-800 shadow-sm text-[8px]">
                                                <Smartphone size={10} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0 py-0.5">
                                        <h4 className={`text-sm font-bold truncate leading-tight ${isSelected ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>
                                            {contact.name}
                                        </h4>
                                        <p className={`text-[10px] truncate mt-1 ${isSelected ? 'text-blue-100/70 font-medium' : 'text-zinc-500 group-hover:text-zinc-400'}`}>
                                            {contact.lastMessage || "No active data."}
                                        </p>
                                    </div>

                                    {/* Active Arrow */}
                                    {isSelected && (
                                        <div className="pr-2 animate-pulse">
                                            <ChevronRight size={16} className="text-white" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    <div className="h-20 md:h-0"></div>
                </div>
            </div>

            {/* === PANEL 3: EDITOR (Right Side) === */}
            <div className={`
                flex-col h-full w-full bg-[#0c0c0e] flex-1 z-20 transition-transform duration-300
                ${selectedId ? 'flex' : 'hidden md:flex'}
            `}>
                {activeContact ? (
                    <div className="flex flex-col h-full w-full animate-in fade-in slide-in-from-right-4 duration-500">
                        
                        {/* Editor Header */}
                        <div className="h-16 px-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/50 backdrop-blur-md sticky top-0 z-30">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setSelectedId(null)} className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-white">
                                    <ArrowLeft size={20} />
                                </button>
                                <img src={activeContact.avatar} className="w-9 h-9 rounded-xl object-cover border border-white/10" />
                                <div>
                                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">{activeContact.name}</h2>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className={`w-1.5 h-1.5 rounded-full ${isSaved ? 'bg-emerald-500' : 'bg-blue-500 animate-pulse'}`}></span>
                                        <span className="text-[9px] text-zinc-500 font-mono">{isSaved ? 'SYNCED' : 'EDITING'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs Scroll */}
                        <div className="border-b border-white/5 bg-zinc-950/30 shrink-0 sticky top-16 z-20">
                            <div className="flex overflow-x-auto no-scrollbar px-2 gap-1 py-1">
                                {TABS.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveSection(tab.id as MiniSection)}
                                        className={`
                                            flex items-center gap-2 px-4 py-3 text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border-b-2
                                            ${activeSection === tab.id 
                                                ? 'border-blue-500 text-blue-400 bg-blue-500/5' 
                                                : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}
                                        `}
                                    >
                                        <tab.icon size={14} />
                                        <span>{tab.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Editor Content Area */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 relative bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/5 via-zinc-950 to-zinc-950">
                            <div className="max-w-2xl mx-auto space-y-6 pb-20">
                                 {/* --- DIALOGUE SECTION (MAIN) --- */}
                                 {activeSection === 'dialogue' && (
                                    <div className="space-y-4 animate-fade-in">
                                        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 shadow-lg relative group">
                                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 block flex items-center gap-2">
                                                <Brain size={14} className="text-blue-500"/> System Directive (Persona)
                                            </label>
                                            <textarea 
                                                value={parsedSections['dialogue'] || ''}
                                                onChange={(e) => updateSection('dialogue', e.target.value)}
                                                className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-xs text-zinc-300 font-mono outline-none focus:border-blue-500/50 transition-all resize-none leading-relaxed h-64 placeholder-zinc-700 custom-scrollbar"
                                                placeholder="Define core personality here..."
                                            />
                                        </div>
                                        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 shadow-lg">
                                            <div className="flex items-center gap-2 mb-4 text-zinc-400">
                                                <MessageCircle size={16} />
                                                <h3 className="text-xs font-bold uppercase tracking-widest">Starter Message</h3>
                                            </div>
                                            <InputField 
                                                labelKey="Preview Text" 
                                                value={activeContact.lastMessage} 
                                                onChange={(v) => updateContactField('lastMessage', v)} 
                                                placeholderKey="Displayed in chat list..."
                                            />
                                        </div>
                                    </div>
                                 )}
                                 
                                 {/* --- IDENTITY SECTION --- */}
                                 {activeSection === 'identity' && (
                                    <div className="space-y-4 animate-fade-in">
                                        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 shadow-lg">
                                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Core Identity</h3>
                                            <InputField 
                                                labelKey="Display Name" 
                                                value={activeContact.name} 
                                                onChange={(v) => updateContactField('name', v)} 
                                                placeholderKey="Name"
                                            />
                                        </div>
                                        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 shadow-lg">
                                            <InputField 
                                                labelKey="Avatar URL" 
                                                value={activeContact.avatar || ''} 
                                                onChange={(v) => updateContactField('avatar', v)} 
                                                placeholderKey="https://..."
                                            />
                                        </div>
                                    </div>
                                 )}

                                 {/* --- GENERIC SECTIONS --- */}
                                 {activeSection !== 'identity' && activeSection !== 'dialogue' && (
                                     <div className="animate-fade-in">
                                         <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 shadow-lg flex flex-col min-h-[400px]">
                                             <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
                                                 <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                                     {React.createElement(TABS.find(t => t.id === activeSection)!.icon as any, { size: 18 })}
                                                 </div>
                                                 <div>
                                                     <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-widest">
                                                         {TABS.find(t => t.id === activeSection)?.label} Config
                                                     </h3>
                                                     <p className="text-[9px] text-zinc-500 font-mono">
                                                         Appended as [{activeSection.toUpperCase()}] block
                                                     </p>
                                                 </div>
                                             </div>
                                             <textarea 
                                                 value={parsedSections[activeSection] || ''}
                                                 onChange={(e) => updateSection(activeSection, e.target.value)}
                                                 className="flex-1 w-full bg-black/20 border border-white/5 rounded-xl p-4 text-xs text-zinc-300 font-mono outline-none focus:border-blue-500/50 transition-all resize-none leading-relaxed placeholder-zinc-700 custom-scrollbar"
                                                 placeholder={`Define ${activeSection} parameters...`}
                                             />
                                             <div className="mt-4 flex items-center justify-end text-[9px] text-zinc-600 gap-2">
                                                 <Settings2 size={10} />
                                                 <span>Raw Input Mode</span>
                                             </div>
                                         </div>
                                     </div>
                                 )}
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-600 space-y-4">
                        <div className="w-24 h-24 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center">
                            <Users size={48} className="opacity-20" />
                        </div>
                        <p className="text-xs font-medium tracking-wide">Select a Neural Node to Configure</p>
                    </div>
                )}
            </div>
        </div>
    );
};
