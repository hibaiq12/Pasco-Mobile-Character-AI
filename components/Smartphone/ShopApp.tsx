
import React, { useState, useRef } from 'react';
import { ChevronLeft, ShoppingBag, Settings, Wallet, X, Image as ImageIcon, AlignLeft, Edit2, Tag, Check } from 'lucide-react';
import { CharacterPhoneData } from '../../services/smartphoneStorage';

interface ShopAppProps {
    virtualTime: number;
    onNavigate: (view: string) => void;
    onPlaceOrder: (order: { name: string, price: number, arrivalTime: number }) => void;
    onHome: () => void;
    phoneData: CharacterPhoneData | null;
}

// Detailed Category Pricing Mapping
const CATEGORY_PRICES: Record<string, number> = {
    "Snack": 5000, "Minuman": 8500, "Alat Tulis": 12000, "Bahan Masakan": 15000, "Pakan Hewan": 22000,
    "Buku": 45000, "Pakaian Dalam": 48000, "Kaos Kaki": 25000, "Topi": 55000, "Aksesoris Gadget": 65000,
    "Pakaian": 85000, "Pakaian Tidur": 95000, "Perlengkapan Mandi": 35000, "Mainan": 120000,
    "Sepatu": 250000, "Tas": 350000, "Kacamata": 175000, "Parfum": 450000, "Skincare": 180000,
    "Jam Tangan": 1200000, "Gadget": 3500000, "Elektronik": 2500000, "Kamera & Fotografi": 8500000,
    "Otomotif": 15000000, "Aksesoris Kendaraan": 750000, "Perhiasan": 2500000, "Laptop": 12000000,
    "Barang Lainnya": 50000 // Default fallback
};

const SHOP_CATEGORIES = Object.keys(CATEGORY_PRICES).concat([
    "Alat Kebersihan", "Perlengkapan Rumah Tangga", "Perabot Rumah", "Dekorasi Rumah", 
    "Alat Listrik Rumah", "Audio & Musik", "Perlengkapan Sekolah", "Perlengkapan Kantor",
    "Kesehatan", "Perawatan Diri", "Kosmetik", "Bayi & Anak", "Hobi & Koleksi", 
    "Alat Olahraga", "Perlengkapan Outdoor", "Perkakas & Alat", "Tiket & Voucher", 
    "Hadiah", "Bunga", "Kartu Ucapan", "Hewan Peliharaan", "Perlengkapan Hewan"
]);

// Fallback pricing for categories not explicitly in the map
const getCategoryPrice = (cat: string) => CATEGORY_PRICES[cat] || 75000;

const PRICE_PER_DESC_WORD = 750;
const PRICE_PER_TITLE_WORD = 250;

export const ShopApp: React.FC<ShopAppProps> = ({ virtualTime, onNavigate, onPlaceOrder, onHome, phoneData }) => {
    // Configuration State
    const [qualityLevel, setQualityLevel] = useState(2); // 0-4
    const [quantityStr, setQuantityStr] = useState('1'); 
    const [showConfig, setShowConfig] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    
    // Inputs
    const [itemName, setItemName] = useState('');
    const [customImage, setCustomImage] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Manual Price Override State
    const [isEditingPrice, setIsEditingPrice] = useState(false);
    const [manualPriceStr, setManualPriceStr] = useState('');
    const [useManualPrice, setUseManualPrice] = useState(false);

    // Mappings
    const QUALITY_LABELS = ['Terburuk', 'Buruk', 'Lumayan', 'Baik', 'Terbaik'];
    const QUALITY_MULTIPLIERS = [0.5, 0.8, 1.0, 1.5, 2.5];

    // Computed Values
    const categoryBasePrice = selectedCategory ? getCategoryPrice(selectedCategory) : 0;
    
    // Word Counts
    const descWordCount = description.trim().length > 0 ? description.trim().split(/\s+/).length : 0;
    const titleWordCount = itemName.trim().length > 0 ? itemName.trim().split(/\s+/).length : 0;
    
    const wordPriceTotal = (descWordCount * PRICE_PER_DESC_WORD) + (titleWordCount * PRICE_PER_TITLE_WORD);
    
    // Formula: (CategoryBase + WordPrices) * QualityMultiplier * Quantity
    const baseCombined = categoryBasePrice + wordPriceTotal;
    const quantity = parseInt(quantityStr) || 0;
    const priceMultiplier = QUALITY_MULTIPLIERS[qualityLevel];
    
    const calculatedTotalPrice = (baseCombined * priceMultiplier) * quantity;

    // Determine Final Price (The Algorithm: Manual Override takes precedence)
    const finalPrice = useManualPrice ? (parseInt(manualPriceStr.replace(/\D/g, '')) || 0) : calculatedTotalPrice;

    const walletBalance = phoneData?.wallet.balance || 0;
    
    // Validasi Pembayaran: Cek saldo terhadap finalPrice (bukan calculated)
    const canPay = walletBalance >= finalPrice && quantity > 0 && selectedCategory !== null && descWordCount > 0 && itemName.trim().length > 0;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (/^\d*$/.test(val)) {
            setQuantityStr(val);
        }
    };

    const handleManualPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '');
        if (val) {
            setManualPriceStr(parseInt(val).toLocaleString('id-ID'));
        } else {
            setManualPriceStr('');
        }
    };

    const togglePriceEdit = () => {
        if (isEditingPrice) {
            // Saving the edit
            setIsEditingPrice(false);
            // If manual price is set, use it. Otherwise revert to calculation.
            if (manualPriceStr && manualPriceStr !== '0') {
                setUseManualPrice(true);
            } else {
                setUseManualPrice(false); 
            }
        } else {
            // Starting edit
            setManualPriceStr(finalPrice.toLocaleString('id-ID'));
            setIsEditingPrice(true);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setCustomImage(event.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
        e.target.value = ''; 
    };

    // --- DELIVERY TIME LOGIC ---
    const calculateArrivalTime = () => {
        const date = new Date(virtualTime);
        const hour = date.getHours();
        
        let targetDate = new Date(date);
        let startHour = 8;
        let endHour = 17;

        if (hour >= 19 && hour < 22) {
            // Malam (19-22) -> Besok 13:00 - 17:00
            targetDate.setDate(date.getDate() + 1);
            startHour = 13;
            endHour = 17;
        } else if (hour >= 22 || hour < 6) {
            // Tengah Malam (22-06) -> Lusa (2 hari lagi) 08:00 - 17:00
            targetDate.setDate(date.getDate() + 2);
            startHour = 8;
            endHour = 17;
        } else {
            // Pagi/Siang (06-19) -> Besok 08:00 - 17:00
            targetDate.setDate(date.getDate() + 1);
            startHour = 8;
            endHour = 17;
        }

        // Random hour within range
        const randomHour = Math.floor(Math.random() * (endHour - startHour)) + startHour;
        const randomMinute = Math.floor(Math.random() * 60);
        
        targetDate.setHours(randomHour, randomMinute, 0, 0);
        return targetDate.getTime();
    };

    const handlePay = () => {
        if (!canPay) return;
        
        // Use user provided Item Name in the order details
        const itemDetail = `${itemName} (${selectedCategory})`;
        const arrivalTime = calculateArrivalTime();

        // Send the FINAL PRICE (Modified or Calculated) to the order handler
        onPlaceOrder({ 
            name: itemDetail, 
            price: finalPrice, 
            arrivalTime: arrivalTime
        });
        onHome();
    };

    return (
        <div className="h-full flex flex-col bg-white animate-fade-in relative z-10 font-sans">
            {/* Header */}
            <div className="bg-white p-4 sticky top-0 z-20 flex items-center justify-between shadow-sm">
                 <button onClick={() => onNavigate('home')} className="text-zinc-800 p-1 hover:bg-zinc-100 rounded-full transition-colors">
                     <ChevronLeft size={24} />
                 </button>
                 <h2 className="font-bold text-zinc-800 flex items-center gap-2">
                     <ShoppingBag size={18} /> Shop
                 </h2>
                 <div className="w-6"></div>
            </div>
            
            <div className="flex-1 overflow-y-auto pb-4">
                
                {/* 1. KOTAK MERAH (Balance) */}
                <div className="mx-4 mt-4 bg-red-500 rounded-2xl p-4 text-white shadow-lg flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Wallet Balance</p>
                        <h3 className="text-2xl font-black">{formatCurrency(walletBalance)}</h3>
                    </div>
                    <div className="bg-white/20 p-2 rounded-full">
                        <Wallet size={24} />
                    </div>
                </div>

                {/* 2. KOTAK MERAH TUA/COKLAT (Categories) */}
                <div className="mx-4 mt-4">
                    <div className="bg-[#3E1F1F] rounded-xl p-3 shadow-inner border border-red-900/30">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-bold text-red-200 uppercase tracking-wider">Select Category</span>
                            {selectedCategory && (
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-bold text-orange-300">
                                        Starts: {formatCurrency(categoryBasePrice)}
                                    </span>
                                    <span className="text-[9px] font-bold text-white bg-red-600 px-2 py-0.5 rounded">{selectedCategory}</span>
                                </div>
                            )}
                        </div>
                        <div className="max-h-[90px] overflow-y-auto custom-scrollbar pr-1">
                            <div className="grid grid-cols-3 gap-2">
                                {SHOP_CATEGORIES.map((cat, i) => {
                                    const isSelected = selectedCategory === cat;
                                    return (
                                        <button 
                                            key={i} 
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`
                                                text-[9px] font-bold px-2 py-2 rounded-lg border shadow-sm transition-all duration-200 flex items-center justify-center text-center
                                                ${isSelected 
                                                    ? 'bg-red-500 text-white border-red-400 scale-95 shadow-inner' 
                                                    : 'bg-[#5D2E2E] text-[#FFD1D1] border-[#7A3E3E] hover:bg-[#7A3E3E] hover:text-white'}
                                            `}
                                        >
                                            {cat}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. HIJAU (Title) */}
                <div className="mx-4 mt-6">
                    <h1 className="text-green-600 font-black text-2xl uppercase tracking-tighter italic inline-block border-b-4 border-green-500 pb-1">
                        CHECKOUT
                    </h1>
                </div>

                {/* 4. ITEM NAME INPUT */}
                <div className="mx-4 mt-4">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Tag size={16} className="text-zinc-400" />
                        </div>
                        <input 
                            type="text" 
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                            placeholder="Nama Barang (Wajib)"
                            className="w-full pl-10 pr-4 py-3 bg-zinc-100 border-2 border-zinc-200 rounded-xl focus:border-green-500 focus:bg-white outline-none font-bold text-zinc-800 text-sm transition-all placeholder-zinc-400"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">
                                + {formatCurrency(titleWordCount * PRICE_PER_TITLE_WORD)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 5. KOTAK KUNING (Image Input) */}
                <div className="mx-4 mt-4 p-1.5 bg-yellow-400 rounded-3xl shadow-xl overflow-hidden relative">
                    <div 
                        onClick={() => !customImage && fileInputRef.current?.click()}
                        className={`
                            rounded-[1.3rem] overflow-hidden relative aspect-video group bg-yellow-50 border-2 border-dashed border-yellow-600/30
                            flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-yellow-100
                        `}
                    >
                        {customImage ? (
                            <>
                                <img 
                                    src={customImage} 
                                    alt="Custom Product" 
                                    className="w-full h-full object-cover"
                                />
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setCustomImage(null); }}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col items-center text-yellow-700">
                                <ImageIcon size={32} className="mb-2 opacity-50" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Tap to Upload Image</span>
                                <span className="text-[9px] opacity-70 bg-yellow-200 px-2 py-0.5 rounded-full mt-1">(Optional)</span>
                            </div>
                        )}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleImageUpload} 
                        />
                    </div>
                </div>

                {/* 6. KOTAK ORANYE (Description Input) */}
                <div className="mx-4 mt-4 bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 shadow-sm relative group focus-within:border-orange-400 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] font-bold text-orange-800 uppercase flex items-center gap-1">
                            <AlignLeft size={12}/> Description (Mandatory)
                        </label>
                        <span className="text-[9px] font-mono text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">
                            {formatCurrency(PRICE_PER_DESC_WORD)} / word
                        </span>
                    </div>
                    
                    <textarea 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your custom item here..."
                        className="w-full bg-transparent text-xs text-orange-900 placeholder-orange-300 font-medium outline-none resize-none h-24 custom-scrollbar leading-relaxed"
                    />
                    
                    <div className="flex justify-end items-center mt-2 border-t border-orange-200 pt-2 gap-2">
                        <span className="text-[10px] text-orange-500 font-bold">{descWordCount} words</span>
                        <span className="text-[10px] bg-orange-200 text-orange-800 font-bold px-2 py-0.5 rounded-full">
                            + {formatCurrency(descWordCount * PRICE_PER_DESC_WORD)}
                        </span>
                    </div>
                </div>

                {/* 7. KOTAK HITAM (Price & Config) */}
                <div className="mx-4 mt-4 bg-black text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between border border-zinc-800">
                    <div className="flex-1 mr-4">
                        <div className="flex justify-between items-center mb-1">
                            <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Total Estimate</p>
                            {useManualPrice && <span className="text-[9px] text-yellow-500 font-bold bg-yellow-500/20 px-1.5 rounded">MODIFIED</span>}
                        </div>
                        
                        {isEditingPrice ? (
                            <div className="flex items-center border-b border-white pb-1">
                                <span className="text-sm font-bold text-zinc-400 mr-2">Rp</span>
                                <input 
                                    type="text"
                                    value={manualPriceStr}
                                    onChange={handleManualPriceChange}
                                    className="w-full bg-transparent text-xl font-mono font-bold text-white outline-none"
                                    autoFocus
                                />
                            </div>
                        ) : (
                            <div className={`text-xl font-mono font-bold ${useManualPrice ? 'text-yellow-400' : 'text-green-400'}`}>
                                {formatCurrency(finalPrice)}
                            </div>
                        )}
                    </div>
                    
                    <div className="flex gap-2">
                        {/* Edit Price Button */}
                        <button 
                            onClick={togglePriceEdit}
                            className={`p-3 rounded-xl transition-all ${isEditingPrice ? 'bg-green-600 text-white shadow-lg' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'}`}
                            title="Modify Price"
                        >
                            {isEditingPrice ? <Check size={20} /> : <Edit2 size={20} />}
                        </button>

                        {/* Config Button */}
                        <button 
                            onClick={() => setShowConfig(!showConfig)}
                            className={`p-3 rounded-xl transition-all ${showConfig ? 'bg-zinc-800 text-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-white text-black hover:bg-zinc-200'}`}
                        >
                            <Settings size={20} className={showConfig ? "animate-spin-slow" : ""} />
                        </button>
                    </div>
                </div>

                {/* 8. KOTAK BIRU (Configuration) */}
                {showConfig && (
                    <div className="mx-4 mt-4 bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 shadow-inner animate-in slide-in-from-top-4">
                        
                        {/* Quality Slider */}
                        <div className="mb-6">
                            <div className="flex justify-between items-end mb-2">
                                <label className="text-xs font-bold text-blue-800 uppercase">Kualitas (Multiplier)</label>
                                <span className="text-[10px] bg-blue-200 text-blue-900 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                    {QUALITY_LABELS[qualityLevel]} (x{QUALITY_MULTIPLIERS[qualityLevel]})
                                </span>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="4" 
                                step="1" 
                                value={qualityLevel}
                                onChange={(e) => setQualityLevel(parseInt(e.target.value))}
                                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="flex justify-between mt-1 text-[8px] text-blue-400 uppercase font-bold">
                                <span>Terburuk</span>
                                <span>Terbaik</span>
                            </div>
                        </div>

                        {/* Quantity Input */}
                        <div>
                            <label className="text-xs font-bold text-blue-800 uppercase mb-2 block">Kuantitas</label>
                            <div className="flex items-center bg-white border-2 border-blue-100 rounded-xl px-4 py-2 focus-within:border-blue-400 transition-colors">
                                <input 
                                    type="text" 
                                    value={quantityStr}
                                    onChange={handleQuantityChange}
                                    placeholder="0"
                                    className="w-full text-lg font-bold text-zinc-800 outline-none bg-transparent placeholder-zinc-300"
                                />
                                <span className="text-xs font-bold text-zinc-400 uppercase">Unit</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* 9. KOTAK UNGU/PINK (Pay Button) */}
                <div className="mx-4 mt-6 mb-8">
                    <button 
                        onClick={handlePay}
                        disabled={!canPay}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-zinc-300 disabled:to-zinc-400 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl shadow-lg shadow-pink-500/30 transform active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm border-b-4 border-purple-800 disabled:border-zinc-500"
                    >
                        <ShoppingBag size={18} fill="currentColor" />
                        {canPay 
                            ? 'Pay Now' 
                            : (!selectedCategory 
                                ? 'Select Category'
                                : (!itemName.trim() 
                                    ? 'Enter Item Name' 
                                    : (descWordCount === 0 
                                        ? 'Enter Description' 
                                        : (quantity === 0 ? 'Enter Quantity' : 'Insufficient Funds'))))}
                    </button>
                </div>
            </div>
        </div>
    );
};
