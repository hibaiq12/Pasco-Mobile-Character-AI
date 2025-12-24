
import React, { useState, useMemo, useEffect } from 'react';
import { Contact, saveSmartphoneData, getSmartphoneData } from '../../../../../services/smartphoneStorage';
import { HIYORI_CONTACTS } from '../../../../../services/StorageServices/CharacterStorage/RealismCharacter/HiyoriKanade/SmartphoneContact/index';
import { 
    Users, MessageCircle, Brain, BookOpen, Fingerprint, Smartphone, RefreshCw, Scale, UserPlus, ArrowLeft, 
    ScanFace, Eye, Speaker, Activity, HeartHandshake, Layers, Sword, MapPin, Save, ChevronRight, Sparkles, Settings2
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
    const [contacts, setContacts] = useState<Contact[]>(() => {
        const stored = getSmartphoneData('char-hiyori');
        if (stored && stored.contacts.length > 0) return stored.contacts;
        return HIYORI_CONTACTS;
    });
    
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState<MiniSection>('dialogue');
    const [isSaved, setIsSaved] = useState(false);

    // Derived Active Contact
    const activeContact = useMemo(() => 
        contacts.find(c => c.id === selectedId) || null
    , [contacts, selectedId]);

    // --- PARSING LOGIC ---
    const [parsedSections, setParsedSections] = useState<Record<string, string>>({});

    useEffect(() => {
        if (activeContact) {
            const desc = activeContact.description || "";
            const newSections: Record<string, string> = {};
            
            // Default Dialogue (Content before any tag)
            const mainSplit = desc.split(/\[([A-Z]+)\]/);
            newSections['dialogue'] = mainSplit[0].trim();

            // Regex to find blocks: [HEADER] content
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

        // Recompile description
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
            if (currentData) {
                const updatedData = { ...currentData, contacts: contacts };
                saveSmartphoneData('char-hiyori', updatedData);
                setIsSaved(true);
                setTimeout(() => setIsSaved(false), 2000);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [contacts]);

    const handleReset = () => {
        if (window.confirm("Reset all contacts to original defaults?")) {
            setContacts(HIYORI_CONTACTS);
            setSelectedId(null);
        }
    };

    // --- RENDER ---
    return (
        <div className="h-full w-full bg-zinc-950 flex flex-col md:flex-row overflow-hidden relative font-sans text-zinc-200">
            
            {/* === PANEL 1: ROSTER LIST === */}
            <div className={`
                flex-col h-full w-full md:w-80 border-r border-white/5 bg-zinc-950 z-10 transition-transform duration-300 absolute md:relative
                ${selectedId ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}
            `}>
                <div className="h-16 px-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/50 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                            <Users size={16} className="text-blue-500" /> Roster
                        </h2>
                    </div>
                    <button onClick={handleReset} className="p-2 rounded-full hover:bg-white/5 text-zinc-500 hover:text-blue-400 transition-colors">
                        <RefreshCw size={16} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                    {contacts.map(contact => (
                        <div 
                            key={contact.id}
                            onClick={() => setSelectedId(contact.id)}
                            className={`
                                p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-4 group active:scale-[0.98]
                                ${selectedId === contact.id 
                                    ? 'bg-blue-600/10 border-blue-500/50' 
                                    : 'bg-zinc-900/40 border-white/5 hover:bg-zinc-900 hover:border-white/10'}
                            `}
                        >
                            <div className="relative shrink-0">
                                <img src={contact.avatar} className="w-12 h-12 rounded-full object-cover bg-zinc-800 border border-white/10" alt={contact.name} />
                                {contact.isSystem && (
                                    <div className="absolute -bottom-1 -right-1 bg-zinc-900 rounded-full p-0.5 border border-zinc-700">
                                        <Smartphone size={10} className="text-blue-400" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className={`text-sm font-bold truncate ${selectedId === contact.id ? 'text-blue-400' : 'text-zinc-200'}`}>
                                    {contact.name}
                                </h4>
                                <p className="text-[10px] text-zinc-500 truncate mt-0.5 font-medium">
                                    {contact.id.replace('contact_', '')}
                                </p>
                            </div>
                            <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400" />
                        </div>
                    ))}
                    <div className="h-20 md:h-0"></div>
                </div>
            </div>

            {/* === PANEL 2: EDITOR === */}
            <div className={`
                flex-col h-full w-full bg-zinc-950 absolute md:relative z-20 transition-transform duration-300 md:translate-x-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black
                ${selectedId ? 'translate-x-0' : 'translate-x-full'}
            `}>
                {activeContact ? (
                    <>
                        {/* Editor Header */}
                        <div className="h-16 px-4 md:px-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/80 backdrop-blur-md shrink-0 sticky top-0 z-30">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <button onClick={() => setSelectedId(null)} className="md:hidden p-2 -ml-2 rounded-full hover:bg-white/5 text-zinc-400 transition-colors">
                                    <ArrowLeft size={20} />
                                </button>
                                <img src={activeContact.avatar} className="w-8 h-8 rounded-full border border-white/10 object-cover" />
                                <div className="min-w-0">
                                    <h2 className="text-sm font-bold text-white truncate">{activeContact.name}</h2>
                                    <div className="flex items-center gap-1.5">
                                        <span className={`w-1.5 h-1.5 rounded-full ${isSaved ? 'bg-green-500' : 'bg-zinc-600'} transition-colors`}></span>
                                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{isSaved ? 'Saved' : 'Editing'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="hidden md:flex items-center gap-2 text-xs font-bold text-zinc-500">
                                {isSaved && <span className="text-green-500 flex items-center gap-1 animate-fade-in"><Save size={12}/> Synced</span>}
                            </div>
                        </div>

                        {/* Scrollable Tabs */}
                        <div className="border-b border-white/5 bg-zinc-950/50 shrink-0 sticky top-0 z-20">
                            <div className="flex overflow-x-auto no-scrollbar px-2">
                                {TABS.map(tab => {
                                    const isActive = activeSection === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveSection(tab.id as MiniSection)}
                                            className={`
                                                flex items-center gap-2 px-4 py-3 text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border-b-2
                                                ${isActive 
                                                    ? 'border-blue-500 text-blue-400 bg-blue-500/5' 
                                                    : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}
                                            `}
                                        >
                                            <tab.icon size={14} />
                                            <span className="hidden md:inline">{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 relative">
                             <div className="max-w-3xl mx-auto space-y-6 pb-20">
                                
                                {/* Background Watermark */}
                                <div className="absolute top-10 right-10 text-white/5 pointer-events-none transform rotate-12 scale-150">
                                    {React.createElement(TABS.find(t => t.id === activeSection)!.icon as any, { size: 200 })}
                                </div>

                                {/* Identity Module */}
                                {activeSection === 'identity' && (
                                    <div className="space-y-6 animate-fade-in relative z-10">
                                        <div className="bg-zinc-900/50 p-5 rounded-2xl border border-white/5 shadow-lg">
                                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Core Identity</h3>
                                            <InputField 
                                                labelKey="Display Name" 
                                                value={activeContact.name} 
                                                onChange={(v) => updateContactField('name', v)} 
                                                placeholderKey="Name displayed in contact list"
                                            />
                                        </div>
                                        <div className="bg-zinc-900/50 p-5 rounded-2xl border border-white/5 shadow-lg flex flex-col md:flex-row gap-6 items-center">
                                            <img src={activeContact.avatar} className="w-24 h-24 rounded-2xl object-cover border-2 border-white/10 shadow-xl" />
                                            <div className="flex-1 w-full">
                                                 <InputField 
                                                    labelKey="Avatar URL" 
                                                    value={activeContact.avatar || ''} 
                                                    onChange={(v) => updateContactField('avatar', v)} 
                                                    placeholderKey="https://..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Dialogue Module (Main) */}
                                {activeSection === 'dialogue' && (
                                    <div className="space-y-6 animate-fade-in relative z-10 h-full flex flex-col">
                                        <div className="bg-zinc-900/50 p-1 rounded-2xl border border-white/5 shadow-lg flex flex-col h-[50vh] md:h-auto">
                                            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                                                <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                                    <Brain size={14}/> System Directive (Persona)
                                                </label>
                                                <Sparkles size={12} className="text-zinc-600" />
                                            </div>
                                            <textarea 
                                                value={parsedSections['dialogue'] || ''}
                                                onChange={(e) => updateSection('dialogue', e.target.value)}
                                                className="flex-1 w-full bg-transparent p-4 text-xs text-zinc-300 font-mono outline-none resize-none leading-relaxed placeholder-zinc-700"
                                                placeholder="Define the NPC's core personality, relationship to user, and behavior patterns here..."
                                            />
                                        </div>

                                        <div className="bg-zinc-900/50 p-5 rounded-2xl border border-white/5 shadow-lg">
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

                                {/* GENERIC MODULES (Moral, Social, etc.) */}
                                {activeSection !== 'identity' && activeSection !== 'dialogue' && (
                                    <div className="animate-fade-in relative z-10 h-full">
                                        <div className="bg-zinc-900/50 p-1 rounded-2xl border border-white/5 shadow-lg flex flex-col h-[60vh]">
                                            <div className="p-4 border-b border-white/5 flex items-center gap-3">
                                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                                    {React.createElement(TABS.find(t => t.id === activeSection)!.icon as any, { size: 16 })}
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
                                                className="flex-1 w-full bg-transparent p-5 text-xs text-zinc-300 font-mono outline-none resize-none leading-relaxed placeholder-zinc-700"
                                                placeholder={`Define ${activeSection} parameters here...\nExample: "Always prioritizes safety" or "Is suspicious of strangers"`}
                                            />
                                            
                                            <div className="p-2 border-t border-white/5 flex justify-end">
                                                <div className="flex items-center gap-2 text-[9px] text-zinc-500">
                                                    <Settings2 size={10} />
                                                    <span>Raw Input Mode</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                             </div>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-zinc-600">
                        <p>Select a contact to edit</p>
                    </div>
                )}
            </div>
        </div>
    );
};
