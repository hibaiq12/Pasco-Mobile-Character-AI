
import React, { useState } from 'react';
import { CharacterPhoneData, InventoryItem, updateInventoryItem } from '../../services/smartphoneStorage';
import { ChevronLeft, Backpack, PackageOpen, Tag, Clock, Edit2, Save, X } from 'lucide-react';

interface InventoryAppProps {
    phoneData: CharacterPhoneData | null;
    onNavigate: (view: string) => void;
}

export const InventoryApp: React.FC<InventoryAppProps> = ({ phoneData, onNavigate }) => {
    const inventory = phoneData?.inventory || [];
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    
    // Edit Form State
    const [editName, setEditName] = useState('');
    const [editCategory, setEditCategory] = useState('');
    const [editDescription, setEditDescription] = useState('');

    const handleItemClick = (item: InventoryItem) => {
        setSelectedItem(item);
        setIsEditing(false); // Reset edit state when opening new item
    };

    const handleStartEdit = () => {
        if (!selectedItem) return;
        setEditName(selectedItem.name);
        setEditCategory(selectedItem.category || 'General');
        setEditDescription(selectedItem.description || '');
        setIsEditing(true);
    };

    const handleSaveEdit = () => {
        if (!selectedItem || !phoneData) return;
        
        // Use storage helper to update
        // We need the character ID (Assuming phoneData doesn't have it directly accessible, we usually pass it or derive it)
        // Wait, phoneData doesn't store the ID of the character. 
        // We need to fetch the ID from somewhere. 
        // HACK: The Smartphone component usually re-fetches data. We can try to infer or pass ID.
        // Actually, we can just update local state and let the parent refresh? 
        // No, we need to persist.
        // Let's assume we can get the characterID from the context or we can hack it by passing the characterId prop to InventoryApp if needed.
        // Looking at Smartphone/index.tsx, it renders InventoryApp.
        // We need to pass `activeCharacterId` to InventoryApp for editing to work properly via helper.
        // BUT, since we have the data object here, maybe we can just modify it and save?
        // Let's modify `saveSmartphoneData` logic or update parent.
        // The `saveSmartphoneData` helper needs an ID. 
        // Let's try to grab ID from the contacts (Self/Me is not stored there usually). 
        // The safest way is to find the Key in localStorage that matches this data object.
        // OR better: Ask parent to pass ID. 
        
        // Since I cannot change the Props signature easily without breaking index.tsx, 
        // I will find the key in localStorage.
        let charId = '';
        const store = localStorage.getItem('pasco_phone_storage_v2');
        if (store) {
            const parsed = JSON.parse(store);
            // Find key where value equals our phoneData
            // This is risky if objects are cloned.
            // Better to iterate keys and find active one.
            // Actually, `phoneData` is a prop.
            // Let's check `activeCharacterId` in `index.tsx`.
            // For now, let's implement a workaround: loop through keys to find matching data structure.
            for (const key in parsed) {
                if (JSON.stringify(parsed[key].inventory) === JSON.stringify(inventory)) {
                    charId = key;
                    break;
                }
            }
        }

        if (charId) {
            updateInventoryItem(charId, selectedItem.id, {
                name: editName,
                category: editCategory,
                description: editDescription
            });
            
            // Update local state to reflect immediately
            const updatedItem = { ...selectedItem, name: editName, category: editCategory, description: editDescription };
            setSelectedItem(updatedItem);
            setIsEditing(false);
            
            // Note: The parent won't refresh automatically unless we trigger it.
            // Ideally `onNavigate` triggers a refresh or we add a `onRefresh` prop.
            // For now, next time user opens phone it will be synced.
        }
    };

    if (selectedItem) {
        return (
            <div className="h-full flex flex-col bg-zinc-900 animate-slide-left relative z-10 font-sans">
                {/* Detail Header */}
                <div className="bg-zinc-950 p-4 border-b border-zinc-800 flex items-center justify-between">
                    <button onClick={() => setSelectedItem(null)} className="text-zinc-400 p-1 hover:text-white rounded-full transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <span className="font-bold text-white text-sm">Item Details</span>
                    <div className="w-6"></div>
                </div>

                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="flex justify-center mb-6">
                        <div className="w-24 h-24 bg-zinc-800 rounded-2xl flex items-center justify-center border border-zinc-700 shadow-2xl">
                            <PackageOpen size={48} className="text-orange-500" />
                        </div>
                    </div>

                    {isEditing ? (
                        <div className="space-y-4 animate-fade-in">
                            <div>
                                <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1 block">Name</label>
                                <input 
                                    value={editName} 
                                    onChange={e => setEditName(e.target.value)} 
                                    className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:border-orange-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1 block">Category</label>
                                <input 
                                    value={editCategory} 
                                    onChange={e => setEditCategory(e.target.value)} 
                                    className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:border-orange-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1 block">Description</label>
                                <textarea 
                                    value={editDescription} 
                                    onChange={e => setEditDescription(e.target.value)} 
                                    className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:border-orange-500 outline-none h-32 resize-none"
                                />
                            </div>
                            <div className="flex gap-2 pt-4">
                                <button onClick={() => setIsEditing(false)} className="flex-1 py-3 bg-zinc-800 text-zinc-300 rounded-xl font-bold text-xs uppercase">Cancel</button>
                                <button onClick={handleSaveEdit} className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2">
                                    <Save size={14} /> Save
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-fade-in">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-white mb-1">{selectedItem.name}</h2>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500 bg-orange-900/20 px-2 py-1 rounded border border-orange-500/20">
                                    {selectedItem.category || 'General'}
                                </span>
                            </div>

                            <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                                <h4 className="text-[10px] font-bold text-zinc-500 uppercase mb-2">Description</h4>
                                <p className="text-sm text-zinc-300 leading-relaxed">
                                    {selectedItem.description || "No description available for this item."}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-800">
                                    <span className="text-[10px] text-zinc-500 block mb-1">Quantity</span>
                                    <span className="text-lg font-mono text-white font-bold">x{selectedItem.quantity}</span>
                                </div>
                                <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-800">
                                    <span className="text-[10px] text-zinc-500 block mb-1">Source</span>
                                    <span className="text-sm font-bold text-white capitalize">{selectedItem.source}</span>
                                </div>
                            </div>

                            <button onClick={handleStartEdit} className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2 transition-colors">
                                <Edit2 size={14} /> Edit Item Info
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-zinc-900 animate-fade-in relative z-10 font-sans">
            {/* Header */}
            <div className="bg-zinc-950 p-4 border-b border-zinc-800 sticky top-0 z-20 flex items-center justify-between shadow-sm">
                 <button onClick={() => onNavigate('home')} className="text-zinc-400 p-1 hover:text-white rounded-full transition-colors">
                     <ChevronLeft size={24} />
                 </button>
                 <h2 className="font-bold text-white flex items-center gap-2 text-lg tracking-wide">
                     <Backpack size={20} className="text-orange-500" /> Inventory
                 </h2>
                 <div className="w-6"></div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {inventory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-600 space-y-3 opacity-60">
                        <Backpack size={48} strokeWidth={1} />
                        <p className="text-sm font-medium">Tas Kosong</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {inventory.map((item) => (
                            <div 
                                key={item.id} 
                                onClick={() => handleItemClick(item)}
                                className="bg-black/40 border border-zinc-800 p-4 rounded-xl flex items-center justify-between group hover:border-zinc-700 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-500 group-hover:text-zinc-300 transition-colors">
                                        <PackageOpen size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-sm leading-tight">{item.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ${
                                                item.source === 'shop' ? 'bg-blue-900/30 text-blue-400' :
                                                item.source === 'gift' ? 'bg-pink-900/30 text-pink-400' :
                                                'bg-zinc-800 text-zinc-400'
                                            }`}>
                                                {item.source}
                                            </span>
                                            <span className="text-[9px] text-zinc-600 flex items-center gap-1">
                                                <Clock size={8} /> {new Date(item.addedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-orange-500 font-mono font-bold text-lg">x{item.quantity}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {/* Footer Stats */}
            <div className="p-4 bg-zinc-950 border-t border-zinc-800 text-center">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                    {inventory.length} Items • Capacity: ∞
                </p>
            </div>
        </div>
    );
};
