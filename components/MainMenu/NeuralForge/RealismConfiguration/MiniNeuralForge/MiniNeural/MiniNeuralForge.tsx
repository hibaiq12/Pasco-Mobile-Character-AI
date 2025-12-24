
import React, { useState, useMemo, useEffect } from 'react';
import { Contact, saveSmartphoneData, getSmartphoneData } from '../../../../../../../services/smartphoneStorage';
import { HIYORI_CONTACTS } from '../../../../../../../services/StorageServices/CharacterStorage/RealismCharacter/HiyoriKanade/SmartphoneContact/index';
import { 
    Users, MessageCircle, Brain, BookOpen, Fingerprint, Smartphone, RefreshCw, Scale, UserPlus, ArrowLeft, 
    ScanFace, Eye, Speaker, Activity, HeartHandshake, Layers, Sword, MapPin, Save
} from 'lucide-react';
import { InputField } from '../../../SharedComponents';

interface MiniNeuralForgeProps {
    onBack: () => void;
}

// Full Neural Forge Categories + Dialogue
type MiniSection = 'identity' | 'dialogue' | 'visuals' | 'voice' | 'psyche' | 'emotional' | 'moral' | 'social' | 'duality' | 'capabilities' | 'lore' | 'memory' | 'scenario';

const TABS = [
    { id: 'identity', label: 'Identity', icon: Fingerprint },
    { id: 'dialogue', label: 'Dialogue', icon: MessageCircle }, // Core behavior
    { id: 'visuals', label: 'Visuals', icon: Eye },
    { id: 'voice', label: 'Voice', icon: Speaker },
    { id: 'psyche', label: 'Psyche', icon: Activity },
    { id: 'emotional', label: 'Emotional', icon: HeartHandshake },
    { id: 'moral', label: 'Moral', icon: Scale },
    { id: 'social', label: 'Social', icon: UserPlus },
    { id: 'duality', label: 'Duality', icon: Layers },
    { id: 'capabilities', label: 'Skills', icon: Sword },
    { id: 'lore', label: 'Lore', icon: BookOpen },
    { id: 'memory', label: 'Memory', icon: Brain },
    { id: 'scenario', label: 'Scenario', icon: MapPin },
];

export const MiniNeuralForge: React.FC<MiniNeuralForgeProps> = ({ onBack }) => {
    // --- STATE MANAGEMENT ---
    const [contacts, setContacts] = useState<Contact[]>(() => {
        const stored = getSmartphoneData('char-hiyori');
        if (stored && stored.contacts.length > 0) return stored.contacts;
        return HIYORI_CONTACTS;
    });
    
    const [selectedId, setSelectedId] = useState<string | null>(null); // Null means "Show List"
    const [activeSection, setActiveSection] = useState<MiniSection>('dialogue');
    
    // Derived Active Contact
    const activeContact = useMemo(() => 
        contacts.find(c => c.id === selectedId) || null
    , [contacts, selectedId]);

    // --- PARSING LOGIC (Description Field Splitting) ---
    // We store all extra data in the 'description' field using headers like [VISUALS] ...
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
    }, [activeContact?.id]); // Only re-parse on ID switch to avoid loop

    // --- SAVE LOGIC ---
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

    // Auto-save to storage
    useEffect(() => {
        const currentData = getSmartphoneData('char-hiyori');
        if (currentData) {
            const updatedData = { ...currentData, contacts: contacts };
            saveSmartphoneData('char-hiyori', updatedData);
        }
    }, [contacts]);

    const handleReset = () => {
        if (window.confirm("Reset all contacts to original defaults?")) {
            setContacts(HIYORI_CONTACTS);
            setSelectedId(null);
        }
    };

    // --- RENDER ---

    return (
        <div className="h-full flex flex-col bg-zinc-950 overflow-hidden">
            
            {/* === LEFT PANEL: ROSTER LIST === */}
            {/* Always hidden if a contact is selected, otherwise flex-1 */}
            <div className={`
                flex-col gap-3 shrink-0 h-full overflow-hidden transition-all duration-300
                ${selectedId ? 'hidden' : 'flex w-full'}
            `}>
                <div className="bg-white/90 backdrop-blur-md p-4 border-b border-blue-100 shadow-sm flex items-center justify-between shrink-0 z-10">
                    <div className="flex items-center gap-2 text-slate-800">
                        <Users size={18} className="text-blue-600" />
                        <h3 className="text-xs font-black uppercase tracking-widest">NPC Roster</h3>
                    </div>
                    <div className="flex gap-1">
                        <button onClick={handleReset} className="p-2 hover:bg-blue-100 rounded-full text-blue-500 transition-colors" title="Reset Defaults">
                            <RefreshCw size={14} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 p-2">
                    {contacts.map(contact => (
                        <div 
                            key={contact.id}
                            onClick={() => setSelectedId(contact.id)}
                            className={`
                                p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 group relative overflow-hidden
                                ${selectedId === contact.id 
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white border-blue-400 shadow-md' 
                                    : 'bg-white/80 hover:bg-white border-white/50 hover:border-blue-200 text-slate-600'}
                            `}
                        >
                            <img src={contact.avatar} className="w-10 h-10 rounded-full object-cover bg-slate-200 border-2 border-white/20 shadow-sm" alt={contact.name} />
                            <div className="flex-1 min-w-0 relative z-10">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-[11px] font-bold truncate">{contact.name}</h4>
                                    {contact.isSystem && <Smartphone size={12} className={selectedId === contact.id ? 'text-blue-200' : 'text-slate-400'} />}
                                </div>
                                <p className={`text-[9px] truncate mt-0.5 ${selectedId === contact.id ? 'text-blue-100' : 'text-slate-400'}`}>
                                    {contact.id}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* === RIGHT PANEL: CONFIGURATION === */}
            {/* Only shown if a contact is selected, takes full width/height */}
            {selectedId && activeContact ? (
                <div className="flex-1 flex flex-col bg-gradient-to-br from-white via-blue-50/50 to-indigo-50/30 shadow-2xl overflow-hidden relative h-full w-full animate-in slide-in-from-right-10 duration-300">
                    
                    {/* Header */}
                    <div className="p-3 md:p-4 border-b border-blue-100/50 bg-white/60 backdrop-blur-md flex justify-between items-center shrink-0 z-20 sticky top-0">
                        <div className="flex gap-2 md:gap-3 items-center min-w-0">
                            {/* Back Button always visible */}
                            <button 
                                onClick={() => setSelectedId(null)} 
                                className="p-2 -ml-2 text-slate-500 hover:text-blue-600 active:scale-90 transition-transform"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            
                            <img src={activeContact.avatar} className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover shadow-md border-2 border-white" alt="Active Contact" />
                            <div className="min-w-0">
                                <h2 className="text-sm md:text-base font-black text-slate-800 tracking-tight leading-none mb-0.5 truncate">
                                    {activeContact.name}
                                </h2>
                                <span className="text-[9px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 truncate block w-fit">
                                    {activeSection.toUpperCase()}
                                </span>
                            </div>
                        </div>
                        {/* Save visual indicator */}
                        <div className="flex items-center gap-1 text-[9px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200 opacity-50">
                            <Save size={10} /> <span className="hidden md:inline">Auto-Sync</span>
                        </div>
                    </div>

                    {/* Scrollable Tabs - Optimized for Mobile */}
                    <div className="border-b border-blue-100/30 bg-white/40 backdrop-blur-sm shrink-0">
                        <div className="flex overflow-x-auto no-scrollbar px-2 gap-1 snap-x">
                            {TABS.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveSection(tab.id as MiniSection)}
                                    className={`
                                        flex items-center justify-center md:justify-start gap-1.5 px-3 py-3 rounded-t-lg 
                                        text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap snap-start border-b-2
                                        min-w-[40px] md:min-w-auto
                                        ${activeSection === tab.id 
                                            ? 'text-blue-600 border-blue-500 bg-blue-50/50' 
                                            : 'text-slate-400 border-transparent hover:text-slate-600 hover:bg-white/50'}
                                    `}
                                    title={tab.label}
                                >
                                    <tab.icon size={16} />
                                    {/* Hide label on mobile to save space, visible on MD+ */}
                                    <span className="hidden md:inline">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Area - Compact on Mobile & Scrollable */}
                    <div className="flex-1 overflow-auto p-3 md:p-4 bg-blue-50/20 relative">
                        
                        {/* Background Decor */}
                        <div className="absolute top-10 right-10 opacity-5 pointer-events-none">
                            {TABS.find(t => t.id === activeSection)?.icon && React.createElement(TABS.find(t => t.id === activeSection)!.icon as any, { size: 200 })}
                        </div>

                        {/* --- IDENTITY SECTION --- */}
                        {activeSection === 'identity' && (
                            <div className="space-y-3 md:space-y-5 animate-fade-in mx-auto">
                                <div className="bg-white p-3 md:p-5 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                                    <InputField 
                                        labelKey="Display Name" 
                                        value={activeContact.name} 
                                        onChange={(v) => updateContactField('name', v)} 
                                        placeholderKey="Name displayed in contact list"
                                    />
                                </div>
                                <div className="bg-white p-3 md:p-5 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <img src={activeContact.avatar} className="w-12 h-12 md:w-16 md:h-16 rounded-xl object-cover bg-slate-100" />
                                        <div className="flex-1">
                                            <InputField 
                                                labelKey="Avatar URL" 
                                                value={activeContact.avatar || ''} 
                                                onChange={(v) => updateContactField('avatar', v)} 
                                                placeholderKey="https://..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- DIALOGUE SECTION (MAIN) --- */}
                        {activeSection === 'dialogue' && (
                            <div className="space-y-3 md:space-y-5 animate-fade-in h-full flex flex-col mx-auto">
                                {/* Acting / Persona Config */}
                                <div className="bg-white p-3 md:p-5 rounded-2xl border border-blue-100 shadow-sm flex-1 flex flex-col hover:shadow-md transition-shadow">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 md:mb-3 block flex items-center gap-2">
                                        <Brain size={14} className="text-blue-400"/> System Directive (Core Persona)
                                    </label>
                                    <textarea 
                                        value={parsedSections['dialogue'] || ''}
                                        onChange={(e) => updateSection('dialogue', e.target.value)}
                                        className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl p-3 md:p-4 text-xs text-slate-700 font-mono outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all resize-none leading-relaxed"
                                        placeholder="Define the NPC's core personality, relationship to user, and behavior patterns here. This is the main instruction block."
                                    />
                                </div>

                                <div className="bg-white p-3 md:p-5 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-2 mb-2 md:mb-3 text-slate-700">
                                        <MessageCircle size={16} className="text-blue-500" />
                                        <h3 className="text-xs font-black uppercase tracking-widest">Starter Message</h3>
                                    </div>
                                    <InputField 
                                        labelKey="Last Message (Preview)" 
                                        value={activeContact.lastMessage} 
                                        onChange={(v) => updateContactField('lastMessage', v)} 
                                        placeholderKey="The message shown in the list..."
                                    />
                                </div>
                            </div>
                        )}

                        {/* --- GENERIC SECTIONS (MAPPED TO DESCRIPTION) --- */}
                        {activeSection !== 'identity' && activeSection !== 'dialogue' && (
                            <div className="h-full flex flex-col animate-fade-in mx-auto">
                                <div className="bg-white p-4 md:p-6 rounded-2xl border border-blue-100 shadow-sm flex-1 flex flex-col relative overflow-hidden">
                                    {/* Section Header */}
                                    <div className="flex items-center gap-3 mb-3 md:mb-4 pb-3 md:pb-4 border-b border-slate-100">
                                        <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                                            {React.createElement(TABS.find(t => t.id === activeSection)!.icon as any, { size: 20 })}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                                                {TABS.find(t => t.id === activeSection)?.label} Config
                                            </h3>
                                            <p className="text-[10px] text-slate-400 font-medium">
                                                Advanced configuration for [{activeSection.toUpperCase()}].
                                            </p>
                                        </div>
                                    </div>

                                    <textarea 
                                        value={parsedSections[activeSection] || ''}
                                        onChange={(e) => updateSection(activeSection, e.target.value)}
                                        className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl p-3 md:p-4 text-xs text-slate-700 font-mono outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all resize-none leading-relaxed"
                                        placeholder={`Define ${activeSection} parameters here... e.g. "Strict moral code regarding..." or "Visual features include..."`}
                                    />
                                    
                                    <div className="mt-3 flex items-center justify-end gap-2 text-[9px] text-slate-400">
                                        <Brain size={12} />
                                        <span>Will be appended to System Directive as [{activeSection.toUpperCase()}]</span>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            ) : null}
        </div>
    );
};
