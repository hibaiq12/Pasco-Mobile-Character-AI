
import React, { useState } from 'react';
import { CharacterPhoneData } from '../../../services/smartphoneStorage';
import { botUpdateInventory } from '../../../services/ChatbotSmartphoneStorage'; // Use Bot Service
import { ChevronLeft, Backpack, PackageOpen, Edit2, Save } from 'lucide-react';

interface InventoryAppProps {
    phoneData: CharacterPhoneData | null;
    onNavigate: (view: string) => void;
    activeCharacterId: string | null; // Need this to identify which bot inventory to update
}

export const InventoryApp: React.FC<InventoryAppProps> = ({ phoneData, onNavigate, activeCharacterId }) => {
    const inventory = phoneData?.inventory || [];
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    
    // Edit Form
    const [editDesc, setEditDesc] = useState('');

    const handleItemClick = (item: any) => {
        setSelectedItem(item);
        setEditDesc(item.description || '');
        setIsEditing(false);
    };

    const handleSave = () => {
        if (activeCharacterId && selectedItem) {
            botUpdateInventory(activeCharacterId, selectedItem.id, { description: editDesc });
            setSelectedItem({ ...selectedItem, description: editDesc });
            setIsEditing(false);
        }
    };

    if (selectedItem) {
        return (
            <div className="h-full flex flex-col bg-zinc-900 animate-slide-left relative z-10 font-sans">
                <div className="bg-zinc-950 p-4 border-b border-zinc-800 flex items-center justify-between">
                    <button onClick={() => setSelectedItem(null)} className="text-zinc-400 p-1 hover:text-white"><ChevronLeft size={24} /></button>
                    <span className="font-bold text-white text-sm">Bot Item Detail</span>
                    <div className="w-6"></div>
                </div>
                <div className="p-6 flex-1 overflow-y-auto">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-zinc-800 rounded-2xl flex items-center justify-center border border-zinc-700">
                            <PackageOpen size={40} className="text-amber-500" />
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-white text-center mb-1">{selectedItem.name}</h2>
                    <p className="text-xs text-zinc-500 text-center uppercase tracking-widest mb-6">{selectedItem.category}</p>
                    
                    {isEditing ? (
                        <div className="space-y-3">
                            <textarea 
                                value={editDesc}
                                onChange={e => setEditDesc(e.target.value)}
                                className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-white text-sm h-32 focus:border-amber-500 outline-none"
                            />
                            <button onClick={handleSave} className="w-full py-3 bg-amber-600 text-white rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2">
                                <Save size={14} /> Save
                            </button>
                        </div>
                    ) : (
                        <div className="bg-black/30 rounded-xl p-4 border border-white/5 mb-4">
                            <p className="text-sm text-zinc-300 leading-relaxed">{selectedItem.description || "No description."}</p>
                        </div>
                    )}
                    
                    {!isEditing && (
                        <button onClick={() => setIsEditing(true)} className="w-full py-3 bg-zinc-800 text-zinc-300 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2">
                            <Edit2 size={14} /> Edit Note
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-zinc-900 animate-fade-in relative z-10 font-sans">
            <div className="bg-zinc-950 p-4 border-b border-zinc-800 sticky top-0 z-20 flex items-center justify-between">
                 <button onClick={() => onNavigate('home')} className="text-zinc-400 p-1 hover:text-white"><ChevronLeft size={24} /></button>
                 <h2 className="font-bold text-white flex items-center gap-2 text-lg"><Backpack size={20} className="text-amber-500" /> Bot Bag</h2>
                 <div className="w-6"></div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {inventory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-600 space-y-3 opacity-60">
                        <Backpack size={48} strokeWidth={1} />
                        <p className="text-sm font-medium">Kosong</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {inventory.map((item) => (
                            <div key={item.id} onClick={() => handleItemClick(item)} className="bg-black/40 border border-zinc-800 p-3 rounded-xl flex items-center justify-between cursor-pointer hover:bg-zinc-800 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-500">
                                        <PackageOpen size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-sm">{item.name}</h3>
                                        <span className="text-[9px] text-zinc-500 uppercase">{item.category}</span>
                                    </div>
                                </div>
                                <span className="text-amber-500 font-mono font-bold text-lg">x{item.quantity}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
