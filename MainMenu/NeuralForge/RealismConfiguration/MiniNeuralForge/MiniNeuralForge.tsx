
import React, { useState, useMemo } from 'react';
import { Contact, saveSmartphoneData, getSmartphoneData } from '../../../../../services/smartphoneStorage';
import { HIYORI_CONTACTS } from '../../../../../services/StorageServices/CharacterStorage/RealismCharacter/HiyoriKanade/SmartphoneContact/index';
import { Users, MessageCircle, Brain, BookOpen, Fingerprint, Save, Smartphone, RefreshCw, Scale, UserPlus, ArrowLeft } from 'lucide-react';
import { InputField } from '../SharedComponents';

interface MiniNeuralForgeProps {
    onBack: () => void;
}

type MiniSection = 'identity' | 'moral' | 'social' | 'lore' | 'memory' | 'dialogue';

export const MiniNeuralForge: React.FC<MiniNeuralForgeProps> = ({ onBack }) => {
    // Initialize with Hiyori's contacts.
    // Checks if storage exists, otherwise loads defaults from the file system.
    const [contacts, setContacts] = useState<Contact[]>(() => {
        const stored = getSmartphoneData('char-hiyori');
        if (stored && stored.contacts.length > 0) {
            return stored.contacts;
        }
        return HIYORI_CONTACTS;
    });
    
    const [selectedId, setSelectedId] = useState<string>(contacts[0]?.id || '');
    const [activeSection, setActiveSection] = useState<MiniSection>('dialogue');

    // Find active contact
    const activeContact = useMemo(() => 
        contacts.find(c => c.id === selectedId) || contacts[0]
    , [contacts, selectedId]);

    // Handle Field Updates
    const updateField = (field: keyof Contact, value: any) => {
        setContacts(prev => prev.map(c => 
            c.id === activeContact.id ? { ...c, [field]: value } : c
        ));
    };

    const handleSave = () => {
        const currentData = getSmartphoneData('char-hiyori');
        if (currentData) {
            const updatedData = {
                ...currentData,
                contacts: contacts
            };
            saveSmartphoneData('char-hiyori', updatedData);
            alert("Mini-Souls Updated Successfully.");
        } else {
            alert("Main simulation data not found. Please initialize the character in the Hub first.");
        }
    };

    const handleReset = () => {
        if (window.confirm("Reset all contacts to original Hiyori defaults?")) {
            setContacts(HIYORI_CONTACTS);
        }
    };

    const TABS = [
        { id: 'identity', label: 'Identity', icon: Fingerprint },
        { id: 'dialogue', label: 'Dialogue', icon: MessageCircle },
        { id: 'moral', label: 'Moral', icon: Scale },
        { id: 'social', label: 'Social', icon: UserPlus },
        { id: 'lore', label: 'Lore', icon: BookOpen },
        { id: 'memory', label: 'Memory', icon: Brain },
    ];

    if (!activeContact) return <div className="p-10 text-center text-white">Loading Neural Matrices...</div>;

    return (
        <div className="h-full flex flex-col md:flex-row gap-4 animate-fade-in p-1 md:p-0">
            
            {/* LEFT PANEL: ROSTER */}
            <div className="w-full md:w-72 flex flex-col gap-3 shrink-0">
                <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-blue-100 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-700">
                        <Users size={18} className="text-blue-500" />
                        <h3 className="text-xs font-black uppercase tracking-widest">NPC Roster</h3>
                    </div>
                    <div className="flex gap-1">
                        <button onClick={handleReset} className="p-1.5 hover:bg-blue-100 rounded-full text-blue-400 transition-colors" title="Reset Defaults">
                            <RefreshCw size={14} />
                        </button>
                        <button onClick={onBack} className="p-1.5 hover:bg-red-100 rounded-full text-red-400 transition-colors md:hidden" title="Back">
                            <ArrowLeft size={14} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1 max-h-[30vh] md:max-h-[calc(100vh-200px)]">
                    {contacts.map(contact => (
                        <div 
                            key={contact.id}
                            onClick={() => setSelectedId(contact.id)}
                            className={`
                                p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 group
                                ${selectedId === contact.id 
                                    ? 'bg-blue-600 text-white border-blue-500 shadow-md transform scale-[1.02]' 
                                    : 'bg-white/40 hover:bg-white/80 border-white/50 hover:border-blue-200 text-slate-600'}
                            `}
                        >
                            <img src={contact.avatar} className="w-10 h-10 rounded-full object-cover bg-slate-200 border border-white/20" alt={contact.name} />
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-[11px] font-bold truncate">{contact.name}</h4>
                                    {contact.isSystem && <Smartphone size={12} className={selectedId === contact.id ? 'text-blue-200' : 'text-slate-400'} />}
                                </div>
                                <p className={`text-[9px] truncate mt-0.5 ${selectedId === contact.id ? 'text-blue-100' : 'text-slate-400'}`}>
                                    {contact.lastMessage}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT PANEL: CONFIGURATION */}
            <div className="flex-1 flex flex-col bg-gradient-to-br from-white to-blue-50/50 rounded-[2rem] border border-white/60 shadow-xl overflow-hidden relative min-h-[500px]">
                
                {/* Header */}
                <div className="p-6 border-b border-blue-100/50 bg-white/40 backdrop-blur-md flex justify-between items-start">
                    <div className="flex gap-4 items-center">
                        <div className="relative group cursor-pointer shrink-0">
                            <img src={activeContact.avatar} className="w-14 h-14 rounded-2xl object-cover shadow-lg border-2 border-white" alt="Active Contact" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1">{activeContact.name}</h2>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                    {activeContact.id}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onBack} className="bg-slate-200 hover:bg-slate-300 text-slate-600 px-4 py-2 rounded-xl text-[10px] font-bold transition-all uppercase tracking-wide hidden md:block">
                            Back
                        </button>
                        <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide">
                            <Save size={14} /> Save Roster
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex px-6 pt-4 gap-1 border-b border-blue-100/30 pb-0 overflow-x-auto no-scrollbar">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSection(tab.id as MiniSection)}
                            className={`
                                flex items-center gap-2 px-4 py-3 rounded-t-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap
                                ${activeSection === tab.id 
                                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500' 
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}
                            `}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-blue-50/30">
                    
                    {activeSection === 'identity' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                            <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm">
                                <InputField 
                                    labelKey="Display Name" 
                                    value={activeContact.name} 
                                    onChange={(v) => updateField('name', v)} 
                                    placeholderKey="Name displayed in contact list"
                                />
                            </div>
                            <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm">
                                <InputField 
                                    labelKey="Avatar URL" 
                                    value={activeContact.avatar || ''} 
                                    onChange={(v) => updateField('avatar', v)} 
                                    placeholderKey="https://..."
                                />
                            </div>
                        </div>
                    )}

                    {activeSection === 'dialogue' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 h-full flex flex-col">
                            {/* Acting / Persona Config */}
                            <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm flex-1 flex flex-col">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block flex items-center gap-2">
                                    <Brain size={14} className="text-blue-400"/> System Directive (Acting Persona)
                                </label>
                                <textarea 
                                    value={activeContact.description || ''}
                                    onChange={(e) => updateField('description', e.target.value)}
                                    className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 font-mono outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all resize-none leading-relaxed"
                                    placeholder="Define the NPC's core personality, relationship to user, and behavior patterns here. How do they text? Do they use emojis? Are they rude or polite?"
                                />
                                <p className="text-[9px] text-slate-400 mt-2 italic">
                                    *This prompt dictates how the chatbot behaves in the smartphone context.
                                </p>
                            </div>

                            {/* Starter Message */}
                            <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-3 text-slate-700">
                                    <MessageCircle size={16} className="text-blue-500" />
                                    <h3 className="text-xs font-black uppercase tracking-widest">Starter Message</h3>
                                </div>
                                <InputField 
                                    labelKey="Last Message (Preview)" 
                                    value={activeContact.lastMessage} 
                                    onChange={(v) => updateField('lastMessage', v)} 
                                    placeholderKey="The message shown in the list..."
                                />
                            </div>
                        </div>
                    )}

                    {(activeSection === 'moral' || activeSection === 'social' || activeSection === 'lore' || activeSection === 'memory') && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 animate-in fade-in space-y-4 text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-400 mb-2">
                                <Brain size={32} />
                            </div>
                            <h3 className="text-sm font-bold text-slate-600">Unified Persona Matrix</h3>
                            <p className="text-xs font-medium max-w-xs leading-relaxed text-slate-500">
                                For Mini-NPCs, configuration for <strong>{activeSection}</strong> is merged into the <strong>Dialogue / System Directive</strong> tab.
                            </p>
                            <button 
                                onClick={() => setActiveSection('dialogue')}
                                className="px-6 py-2.5 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-lg hover:bg-blue-500 transition-all"
                            >
                                Go to Dialogue Config
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
