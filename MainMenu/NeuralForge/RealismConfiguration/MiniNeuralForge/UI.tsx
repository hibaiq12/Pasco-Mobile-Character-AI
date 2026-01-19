
import React, { useState } from 'react';
import { ArrowLeft, Plus, User, Trash2, Save, Smartphone, ChevronRight, Speaker, BookOpen, Brain, MessageSquare, DollarSign, Sparkles, Scale, Users, Heart, Zap, Search, MoreHorizontal } from 'lucide-react';
import { Contact } from '../../../services/smartphoneStorage';
import { VoiceConfig } from './Configuration/VoiceConfig';
import { LoreConfig } from './Configuration/LoreConfig';
import { MemoryConfig } from './Configuration/MemoryConfig';
import { DialogueConfig } from './Configuration/DialogueConfig';
import { WealthConfig } from './Configuration/WealthConfig';
import { MoralConfig } from './Configuration/MoralConfig';
import { SocialConfig } from './Configuration/SocialConfig';
import { RelationshipConfig } from './Configuration/RelationshipConfig';

interface MiniNeuralForgeProps {
    onBack: () => void;
}

// Default Data for new contact
const DEFAULT_CONTACT: Partial<Contact> & { [key: string]: any } = {
    name: '',
    lastMessage: 'Connected.',
    isOnline: false,
    description: '',
    role: 'Acquaintance',
    wealthLevel: 50,
    spendingHabit: 'Balanced',
    pitch: 1.0,
    speed: 1.0,
    tone: 'Neutral',
    memories: '',
    speechStyle: 'Casual',
    alignment: 'True Neutral',
    coreValue: 'Survival',
    socialBattery: 50,
    popularity: 'Average',
    trustLevel: 50,
    relationshipLabel: 'Stranger'
};

const TABS = [
    { id: 'lore', label: 'Lore', icon: BookOpen },
    { id: 'voice', label: 'Voice', icon: Speaker },
    { id: 'memory', label: 'Memory', icon: Brain },
    { id: 'dialogue', label: 'Dialogue', icon: MessageSquare },
    { id: 'wealth', label: 'Wealth', icon: DollarSign },
    { id: 'moral', label: 'Moral', icon: Scale },
    { id: 'social', label: 'Social', icon: Users },
    { id: 'relationship', label: 'Relation', icon: Heart },
];

export const MiniNeuralForge: React.FC<MiniNeuralForgeProps> = ({ onBack }) => {
    const [viewMode, setViewMode] = useState<'list' | 'editor'>('list');
    
    // Mock Data - In real implementation this should sync with smartphoneStorage
    const [contacts, setContacts] = useState<any[]>([
        { ...DEFAULT_CONTACT, id: '1', name: 'Ibu Sayang 🌹', description: 'Protective mother', wealthLevel: 60, relationshipLabel: 'Mother', role: 'Family' },
        { ...DEFAULT_CONTACT, id: '2', name: 'Dodi (Sobat)', description: 'Gaming buddy', wealthLevel: 30, relationshipLabel: 'Best Friend', role: 'Friend' }
    ]);
    
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('lore');
    const [searchQuery, setSearchQuery] = useState('');

    // --- HANDLERS ---

    const handleCreateNew = () => {
        const newId = Date.now().toString();
        const newContact = { ...DEFAULT_CONTACT, id: newId, name: 'New Persona' };
        setEditData(newContact);
        setEditingId(newId);
        setViewMode('editor');
        setActiveTab('lore');
    };

    const handleEdit = (contact: any) => {
        setEditData({ ...contact }); 
        setEditingId(contact.id);
        setViewMode('editor');
        setActiveTab('lore');
    };

    const handleSave = () => {
        if (editingId) {
            setContacts(prev => {
                const exists = prev.find(c => c.id === editingId);
                if (exists) {
                    return prev.map(c => c.id === editingId ? editData : c);
                } else {
                    return [editData, ...prev];
                }
            });
        }
        setViewMode('list');
        setEditingId(null);
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setContacts(prev => prev.filter(c => c.id !== id));
    };

    const updateField = (key: string, value: any) => {
        setEditData((prev: any) => ({ ...prev, [key]: value }));
    };

    // Filtered Contacts
    const filteredContacts = contacts.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.role?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // --- RENDER EDITOR ---

    if (viewMode === 'editor') {
        return (
            <div className="h-full w-full flex flex-col bg-zinc-950 font-sans text-zinc-200 animate-in fade-in slide-in-from-right-4">
                
                {/* 1. EDITOR HEADER (Sticky) */}
                <div className="px-4 py-3 border-b border-white/10 bg-zinc-900/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setViewMode('list')} className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white active:scale-95">
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex flex-col">
                            <input 
                                value={editData.name} 
                                onChange={(e) => updateField('name', e.target.value)}
                                className="bg-transparent border-none outline-none font-bold text-white text-sm md:text-base placeholder-zinc-600 w-32 md:w-64 focus:ring-0 truncate"
                                placeholder="Name..."
                            />
                            <span className="text-[10px] text-cyan-400 uppercase tracking-wider font-bold flex items-center gap-1">
                                <Sparkles size={10} /> NPC Config
                            </span>
                        </div>
                    </div>
                    <button 
                        onClick={handleSave}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                    >
                        <Save size={14} /> <span className="hidden sm:inline">Save Profile</span>
                    </button>
                </div>

                {/* 2. NAVIGATION TABS (Sticky below header, Horizontal Scroll) */}
                <div className="bg-zinc-950/80 backdrop-blur-sm border-b border-white/5 sticky top-[60px] z-20 shadow-sm">
                    <div className="flex overflow-x-auto no-scrollbar px-4 py-3 gap-2 md:gap-3 snap-x">
                        {TABS.map(tab => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    title={tab.label}
                                    className={`
                                        snap-start shrink-0 flex items-center justify-center gap-2 
                                        p-2.5 md:px-4 md:py-2 rounded-xl md:rounded-full
                                        text-[10px] md:text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border
                                        ${isActive 
                                            ? 'bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)] scale-105' 
                                            : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'}
                                    `}
                                >
                                    <tab.icon size={16} className={isActive ? 'animate-pulse' : ''} />
                                    <span className="hidden md:inline">{tab.label}</span>
                                </button>
                            );
                        })}
                        <div className="w-2 shrink-0"></div>
                    </div>
                </div>

                {/* 3. CONTENT AREA (Responsive Container) */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-gradient-to-b from-zinc-900 to-black">
                    <div className="p-4 md:p-8 max-w-4xl mx-auto pb-32 min-h-full">
                        {activeTab === 'lore' && <LoreConfig data={editData} onChange={updateField} />}
                        {activeTab === 'voice' && <VoiceConfig data={editData} onChange={updateField} />}
                        {activeTab === 'memory' && <MemoryConfig data={editData} onChange={updateField} />}
                        {activeTab === 'dialogue' && <DialogueConfig data={editData} onChange={updateField} />}
                        {activeTab === 'wealth' && <WealthConfig data={editData} onChange={updateField} />}
                        {activeTab === 'moral' && <MoralConfig data={editData} onChange={updateField} />}
                        {activeTab === 'social' && <SocialConfig data={editData} onChange={updateField} />}
                        {activeTab === 'relationship' && <RelationshipConfig data={editData} onChange={updateField} />}
                    </div>
                </div>
            </div>
        );
    }

    // --- LIST MODE (ROSTER) ---
    return (
        <div className="h-full w-full flex flex-col bg-zinc-950 font-sans text-zinc-200 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

            {/* Header */}
            <div className="p-4 md:p-6 border-b border-white/5 bg-zinc-900/80 backdrop-blur-xl flex flex-col gap-4 shrink-0 sticky top-0 z-20 shadow-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white border border-transparent hover:border-white/10">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h3 className="text-sm md:text-lg font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
                                NPC Network
                            </h3>
                            <p className="text-[10px] text-zinc-500 font-mono tracking-wider flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                {contacts.length} Active Personas
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={handleCreateNew}
                        className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all active:scale-95 flex items-center gap-2 border border-white/10"
                    >
                        <Plus size={18} /> <span className="hidden md:inline text-xs font-bold uppercase tracking-wider">New</span>
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-400 transition-colors" size={16} />
                    <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search neural signatures..."
                        className="w-full bg-black/40 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all placeholder-zinc-600"
                    />
                </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar space-y-3 relative z-10">
                {filteredContacts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-zinc-600 gap-4 opacity-50 border-2 border-dashed border-zinc-800 rounded-3xl m-4">
                        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800">
                            <Smartphone size={32} />
                        </div>
                        <p className="text-xs uppercase font-bold tracking-widest">No Signals Found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredContacts.map((contact, idx) => (
                            <div 
                                key={contact.id}
                                onClick={() => handleEdit(contact)}
                                className="group bg-zinc-900/40 backdrop-blur-sm border border-white/5 p-4 rounded-2xl relative overflow-hidden cursor-pointer hover:border-blue-500/30 hover:bg-zinc-900/60 transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-xl"
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                {/* Card Header */}
                                <div className="flex items-start justify-between mb-3 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center border border-white/5 relative overflow-hidden group-hover:border-blue-500/30 transition-colors shadow-inner">
                                            <User size={20} className="text-zinc-500 group-hover:text-blue-400 transition-colors" />
                                            {/* Decor Dots */}
                                            <div className="absolute top-1 right-1 w-1 h-1 bg-white/10 rounded-full"></div>
                                            <div className="absolute bottom-1 left-1 w-1 h-1 bg-white/10 rounded-full"></div>
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors truncate">{contact.name}</h4>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-zinc-400 uppercase tracking-wide">
                                                    {contact.role || 'NPC'}
                                                </span>
                                                {contact.relationshipLabel && (
                                                    <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300 uppercase tracking-wide truncate max-w-[80px]">
                                                        {contact.relationshipLabel}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Action Menu (Hover) */}
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 p-1 rounded-lg backdrop-blur">
                                        <button 
                                            onClick={(e) => handleDelete(contact.id, e)}
                                            className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                        <div className="w-px h-4 bg-white/10 self-center mx-0.5"></div>
                                        <div className="p-1.5 text-zinc-400 hover:text-white">
                                            <ChevronRight size={14} />
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Description / Stats */}
                                <div className="relative z-10 space-y-3">
                                    <p className="text-[10px] text-zinc-500 line-clamp-2 h-8 leading-relaxed">
                                        {contact.description || 'No detailed description provided for this persona.'}
                                    </p>
                                    
                                    {/* Mini Stats Grid */}
                                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] text-zinc-600 uppercase font-bold tracking-wider mb-1">Wealth</span>
                                            <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-emerald-500/50 rounded-full" 
                                                    style={{ width: `${contact.wealthLevel || 50}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[8px] text-zinc-600 uppercase font-bold tracking-wider mb-1">Trust</span>
                                            <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-blue-500/50 rounded-full" 
                                                    style={{ width: `${contact.trustLevel || 50}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Background Glow Effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
