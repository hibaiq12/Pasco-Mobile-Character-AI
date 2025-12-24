
import React, { useState } from 'react';
import { ChevronLeft, ShoppingBag, Tag, CheckCircle } from 'lucide-react';
import { CharacterPhoneData } from '../../../services/smartphoneStorage';

interface ShopAppProps {
    virtualTime: number;
    onNavigate: (view: string) => void;
    onPlaceOrder: (order: { name: string, price: number, arrivalTime: number }) => void;
    onHome: () => void;
    phoneData: CharacterPhoneData | null;
}

export const ShopApp: React.FC<ShopAppProps> = ({ virtualTime, onNavigate, onPlaceOrder, onHome, phoneData }) => {
    const [selectedItem, setSelectedItem] = useState<any>(null);

    const ITEMS = [
        { name: "Luxury Gift", price: 500000, icon: "🎁", desc: "For User" },
        { name: "Coffee", price: 25000, icon: "☕", desc: "Energy boost" },
        { name: "Flowers", price: 150000, icon: "💐", desc: "Decoration" },
        { name: "Book", price: 120000, icon: "📚", desc: "Knowledge" },
        { name: "Snack", price: 15000, icon: "🍫", desc: "Tasty" },
        { name: "Outfit", price: 850000, icon: "👗", desc: "New style" }
    ];

    const handleBuy = () => {
        if (!selectedItem) return;
        if ((phoneData?.wallet.balance || 0) < selectedItem.price) {
            alert("Bot Insufficient Funds");
            return;
        }
        
        onPlaceOrder({
            name: selectedItem.name,
            price: selectedItem.price,
            arrivalTime: virtualTime + 5000
        });
        onHome();
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    return (
        <div className="h-full flex flex-col bg-zinc-900 animate-fade-in relative z-10 font-sans">
            <div className="bg-zinc-950 p-4 sticky top-0 z-20 flex items-center justify-between border-b border-white/5">
                 <button onClick={() => onNavigate('home')} className="text-zinc-400 p-1 hover:text-white rounded-full transition-colors">
                     <ChevronLeft size={24} />
                 </button>
                 <h2 className="font-bold text-white flex items-center gap-2">
                     <ShoppingBag size={18} className="text-pink-500"/> Bot Shop
                 </h2>
                 <div className="w-6"></div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 pb-20 custom-scrollbar">
                <div className="grid grid-cols-2 gap-3">
                    {ITEMS.map((item, i) => (
                        <div 
                            key={i} 
                            onClick={() => setSelectedItem(item)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedItem?.name === item.name ? 'bg-pink-900/20 border-pink-500' : 'bg-black/40 border-zinc-800 hover:bg-zinc-900'}`}
                        >
                            <div className="text-3xl mb-2 text-center">{item.icon}</div>
                            <h3 className="text-sm font-bold text-white text-center">{item.name}</h3>
                            <p className="text-[10px] text-zinc-500 text-center mb-2">{item.desc}</p>
                            <div className="text-center text-xs font-mono font-bold text-pink-400">
                                {formatCurrency(item.price)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-4 bg-zinc-950 border-t border-white/5">
                <button 
                    onClick={handleBuy}
                    disabled={!selectedItem}
                    className="w-full bg-pink-600 hover:bg-pink-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wider text-xs"
                >
                    {selectedItem ? `Buy ${selectedItem.name}` : 'Select Item'}
                </button>
            </div>
        </div>
    );
};
