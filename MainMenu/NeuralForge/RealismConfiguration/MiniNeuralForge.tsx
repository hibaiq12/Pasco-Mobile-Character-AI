
import React, { useState } from 'react';
import { UserPlus, Trash2, ArrowLeft, MessageSquare, Shield, Smartphone, Plus, User, Info, Search, X } from 'lucide-react';
import { Contact } from '../../../services/smartphoneStorage';
import { t } from '../../../services/translationService';

interface MiniNeuralForgeProps {
    onBack: () => void;
}

// Initial mock contacts for the forge preview
const INITIAL_NPC_TEMPLATES = [
    { name: 'Ibu', desc: 'Caring mother figure, protective and worried.' },
    { name: 'Ayah', desc: 'Stoic father, direct and logic-oriented.' },
    { name: 'Sahabat', desc: 'Cheerful best friend, supportive and energetic.' },
    { name: 'Rival', desc: 'Competitive classmate, teasing and ambitious.' }
];

export const MiniNeuralForge: React.FC<MiniNeuralForgeProps> = ({ onBack }) => {
    const [contacts, setContacts] = useState<Partial<Contact>[]>([
        { id: '1', name: 'Ibu Sayang 🌹', lastMessage: 'Jangan lupa makan ya.', isOnline: false },
        { id: '2', name: 'Dodi (Sobat)', lastMessage: 'Mabar kuy!', isOnline: true }
    ]);
    
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');

    const handleAdd = () => {
        if (!newName.trim()) return;
        const newContact: Partial<Contact> = {
            id: Date.now().toString(),
            name: newName,
            lastMessage: 'Neural link established.',
            isOnline: false,
            description: newDesc
        };
        setContacts([newContact, ...contacts]);
        setNewName('');
        setNewDesc('');
        setIsAdding(false);
    };

    const handleRemove = (id: string) => {
        setContacts(contacts.filter(c => c.id !== id));
    };

    return (
        <div className="h-full flex flex-col bg-zinc-950 font-sans text-zinc-200">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-blue-400">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-white">NPC Roster</h3>
                        <p className="text-[8px] text-zinc-500 font-mono tracking-tighter uppercase">Mini Neural Forge v1.0</p>
                    </div>
                </div>
                {!isAdding && (
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg shadow-blue-900/20 transition-all active:scale-95"
                    >
                        <Plus size={16} />
                    </button>
                )}
            </div>

            {/* List or Add Form */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {isAdding ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">New Neural Profile</span>
                            <button onClick={() => setIsAdding(false)} className="text-zinc-500 hover:text-white"><X size={14}/></button>
                        </div>
                        
                        <div className="space-y-3 bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
                            <div>
                                <label className="text-[9px] font-bold text-zinc-500 uppercase ml-1">Profile Name</label>
                                <input 
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    placeholder="e.g. Kakak Kelas"
                                    className="w-full bg-black/50 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[9px] font-bold text-zinc-500 uppercase ml-1">Archetype Bias</label>
                                <textarea 
                                    value={newDesc}
                                    onChange={e => setNewDesc(e.target.value)}
                                    placeholder="Describe their personality and relation to the user..."
                                    className="w-full bg-black/50 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-blue-500 outline-none h-24 resize-none leading-relaxed"
                                />
                            </div>
                            <button 
                                onClick={handleAdd}
                                disabled={!newName.trim()}
                                className="w-full bg-blue-600 disabled:bg-zinc-800 disabled:text-zinc-600 py-3 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-blue-900/20 transition-all active:scale-95 mt-2"
                            >
                                Implant Profile
                            </button>
                        </div>

                        <div>
                            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest ml-1 mb-2 block">Quick Templates</span>
                            <div className="grid grid-cols-2 gap-2">
                                {INITIAL_NPC_TEMPLATES.map(temp => (
                                    <button 
                                        key={temp.name}
                                        onClick={() => { setNewName(temp.name); setNewDesc(temp.desc); }}
                                        className="p-2 bg-zinc-900 border border-white/5 rounded-lg text-[9px] text-zinc-400 hover:text-blue-300 hover:border-blue-500/30 text-left transition-all"
                                    >
                                        {temp.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="bg-blue-500/5 border border-blue-500/20 p-3 rounded-xl mb-4">
                            <p className="text-[9px] text-blue-300 leading-relaxed italic">
                                <Info size={10} className="inline mr-1" />
                                These NPC profiles will populate the protagonist's smartphone during the simulation.
                            </p>
                        </div>

                        {contacts.map(contact => (
                            <div 
                                key={contact.id}
                                className="group bg-zinc-900/40 border border-white/5 p-3 rounded-xl flex items-center justify-between hover:bg-zinc-900 hover:border-white/10 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-white/5 relative overflow-hidden">
                                        <User size={20} className="text-zinc-600" />
                                        {contact.isOnline && (
                                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-zinc-900 rounded-full"></div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-xs font-bold text-zinc-200 truncate">{contact.name}</h4>
                                        <p className="text-[9px] text-zinc-500 truncate">{contact.lastMessage}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleRemove(contact.id!)}
                                    className="p-2 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}

                        {contacts.length === 0 && (
                            <div className="py-10 flex flex-col items-center justify-center opacity-30">
                                <Smartphone size={32} className="mb-2" />
                                <p className="text-[10px] uppercase font-bold tracking-widest">Phone Disconnected</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            {!isAdding && (
                <div className="p-4 border-t border-white/5 bg-black/40 backdrop-blur-sm">
                    <div className="flex justify-between items-center text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                        <span>Total Profiles</span>
                        <span className="text-blue-500">{contacts.length} / 15</span>
                    </div>
                </div>
            )}
        </div>
    );
};
