
import React, { useState, useEffect } from 'react';
import { CharacterPhoneData } from '../../services/smartphoneStorage';
import { ChevronLeft, Send, QrCode, CreditCard, ArrowUpRight, Plus, Wallet, Receipt, ScanLine, ArrowDownLeft, MoreHorizontal, History, User } from 'lucide-react';

interface WalletAppProps {
    view: string;
    phoneData: CharacterPhoneData | null;
    onNavigate: (view: string) => void;
    onTransfer: (amount: number, contactId: string, note: string) => void;
    onHome: () => void;
}

export const WalletApp: React.FC<WalletAppProps> = ({ view, phoneData, onNavigate, onTransfer, onHome }) => {
    // Internal Navigation State for Wallet App
    const [internalView, setInternalView] = useState<'dashboard' | 'pay' | 'contacts'>('dashboard');

    // Payment State
    const [payNominal, setPayNominal] = useState('');
    const [payTarget, setPayTarget] = useState('');
    const [payNote, setPayNote] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Transfer State
    const [selectedContact, setSelectedContact] = useState<string | null>(null);

    // Sync with parent view props if needed, though we manage internal state for Pay/Dashboard
    useEffect(() => {
        if (view === 'wallet') setInternalView('dashboard');
    }, [view]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    // Auto-comma formatter (e.g. 50,000)
    const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^0-9]/g, '');
        if (!raw) {
            setPayNominal('');
            return;
        }
        const formatted = parseInt(raw).toLocaleString('en-US'); // Uses commas
        setPayNominal(formatted);
    };

    const getRawAmount = (formatted: string) => {
        return parseInt(formatted.replace(/,/g, '')) || 0;
    };

    const handlePay = () => {
        const amount = getRawAmount(payNominal);
        if (amount <= 0) return;
        if (amount > (phoneData?.wallet.balance || 0)) {
            alert("Saldo tidak cukup!");
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            // Treat Payment as a Transfer to the "Target"
            // We use a dummy ID for the contact since it's a direct payment
            onTransfer(amount * -1, 'payment_gateway', `Pay: ${payTarget} (${payNote})`); 
            setIsLoading(false);
            setPayNominal('');
            setPayTarget('');
            setPayNote('');
            setInternalView('dashboard');
        }, 1500);
    };

    // Handle selecting a contact for transfer (Mapped from Dashboard "Send")
    const handleContactSelect = (contactId: string) => {
        setSelectedContact(contactId);
        setPayTarget(phoneData?.contacts.find(c => c.id === contactId)?.name || 'Unknown');
        setInternalView('pay'); // Reuse pay view but with pre-filled target
    };

    // --- CONTACT LIST FOR TRANSFER ---
    if (internalView === 'contacts') {
        return (
            <div className="h-full flex flex-col bg-zinc-50 animate-fade-in relative z-10">
                <div className="bg-blue-600 p-4 text-white flex items-center gap-4 shadow-md">
                    <button onClick={() => setInternalView('dashboard')}><ChevronLeft /></button>
                    <span className="font-bold text-lg">Select Contact</span>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                     {phoneData?.contacts.length === 0 && <p className="text-center text-zinc-500 mt-10 text-xs">No contacts found.</p>}
                     {phoneData?.contacts.map(contact => (
                         <div 
                            key={contact.id} 
                            onClick={() => handleContactSelect(contact.id)}
                            className="flex items-center gap-3 p-3 bg-white mb-2 rounded-xl shadow-sm cursor-pointer hover:bg-blue-50 transition-colors"
                         >
                             <img src={contact.avatar} className="w-10 h-10 rounded-full object-cover bg-zinc-200" />
                             <span className="font-bold text-zinc-800 text-sm">{contact.name}</span>
                         </div>
                     ))}
                </div>
            </div>
        );
    }

    // --- PAY / QR VIEW ---
    if (internalView === 'pay') {
        return (
            <div className="h-full flex flex-col bg-zinc-50 animate-fade-in relative z-10">
                <div className="bg-blue-600 p-4 text-white flex items-center gap-4 shadow-md">
                    <button onClick={() => setInternalView('dashboard')}><ChevronLeft /></button>
                    <span className="font-bold text-lg">{selectedContact ? 'Transfer' : 'Scan / Pay'}</span>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    {!selectedContact && (
                        <div className="flex justify-center mb-8">
                            <div className="w-24 h-24 bg-white border-2 border-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                                <QrCode size={48} className="text-blue-600" />
                            </div>
                        </div>
                    )}

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Nominal (Rp)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">Rp</span>
                                <input 
                                    type="text" 
                                    value={payNominal} 
                                    onChange={handleNominalChange}
                                    placeholder="0"
                                    className="w-full bg-white border border-zinc-300 rounded-xl py-3 pl-12 pr-4 text-xl font-bold text-zinc-800 focus:border-blue-500 outline-none shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Target</label>
                            <input 
                                type="text" 
                                value={payTarget} 
                                onChange={(e) => setPayTarget(e.target.value)}
                                placeholder="e.g. Starbucks, Token Listrik"
                                disabled={!!selectedContact} // Disable if selected from contact
                                className="w-full bg-white border border-zinc-300 rounded-xl py-3 px-4 text-sm text-zinc-800 focus:border-blue-500 outline-none shadow-sm disabled:bg-zinc-100"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Catatan</label>
                            <input 
                                type="text" 
                                value={payNote} 
                                onChange={(e) => setPayNote(e.target.value)}
                                placeholder="Optional note"
                                className="w-full bg-white border border-zinc-300 rounded-xl py-3 px-4 text-sm text-zinc-800 focus:border-blue-500 outline-none shadow-sm"
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handlePay}
                        disabled={!payNominal || !payTarget || isLoading}
                        className="w-full mt-8 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        {isLoading ? 'Processing...' : (selectedContact ? 'Confirm Transfer' : 'Confirm Payment')}
                    </button>
                </div>
            </div>
        );
    }

    // --- DASHBOARD VIEW ---
    return (
        <div className="h-full flex flex-col bg-[#f0f2f5] animate-fade-in relative z-10 font-sans">
            {/* Header Gradient */}
            <div className="bg-gradient-to-b from-blue-500 to-blue-600 px-6 pt-8 pb-16 relative">
                <div className="flex justify-between items-center text-white mb-6">
                    <div className="flex items-center gap-2" onClick={onHome}>
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <Wallet size={16} />
                        </div>
                        <span className="font-bold tracking-wide">DANA+</span>
                    </div>
                    <div className="flex gap-3">
                        <MoreHorizontal className="text-white/80" />
                    </div>
                </div>

                <div className="text-white">
                    <p className="text-blue-100 text-xs font-medium mb-1">Total Balance</p>
                    <div className="flex items-baseline gap-1">
                        <h2 className="text-3xl font-bold tracking-tight">
                            {formatCurrency(phoneData?.wallet.balance || 0).replace('Rp', '').trim()}
                        </h2>
                        <span className="text-sm font-medium opacity-80">IDR</span>
                    </div>
                </div>
            </div>

            {/* Main Action Card */}
            <div className="px-4 -mt-10 relative z-10">
                <div className="bg-white rounded-2xl shadow-lg p-4 flex justify-between items-center">
                    <div className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80">
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-1">
                            <Plus size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-zinc-600">Top Up</span>
                    </div>
                    {/* SEND BUTTON - Mapped to Contacts */}
                    <div className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80" onClick={() => setInternalView('contacts')}>
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-1">
                            <Send size={18} />
                        </div>
                        <span className="text-[10px] font-bold text-zinc-600">Send</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80">
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-1">
                            <ArrowDownLeft size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-zinc-600">Request</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80">
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-1">
                            <History size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-zinc-600">History</span>
                    </div>
                </div>
            </div>

            {/* Service Grid */}
            <div className="p-6 grid grid-cols-4 gap-y-6 gap-x-4">
                {[
                    { name: 'Games', icon: '🎮', color: 'bg-indigo-100 text-indigo-600' },
                    { name: 'Pulsa', icon: '📱', color: 'bg-red-100 text-red-600' },
                    { name: 'Rewards', icon: '🎁', color: 'bg-orange-100 text-orange-600' },
                    { name: 'Play', icon: '▶️', color: 'bg-green-100 text-green-600' },
                    { name: 'Travel', icon: '✈️', color: 'bg-sky-100 text-sky-600' },
                    { name: 'Hadiah', icon: '📅', color: 'bg-yellow-100 text-yellow-600' },
                    { name: 'Listrik', icon: '💡', color: 'bg-amber-100 text-amber-600' },
                    { name: 'More', icon: '::', color: 'bg-zinc-100 text-zinc-600' },
                ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm ${item.color}`}>
                            {item.icon}
                        </div>
                        <span className="text-[10px] text-zinc-500 font-medium text-center leading-tight">{item.name}</span>
                    </div>
                ))}
            </div>

            {/* Bottom Nav (Floating) */}
            <div className="absolute bottom-6 left-6 right-6 h-16 bg-white rounded-full shadow-2xl flex items-center justify-between px-8 border border-zinc-100">
                <div className="flex flex-col items-center gap-1 text-blue-600">
                    <Wallet size={20} />
                    <span className="text-[9px] font-bold">Dompet</span>
                </div>
                
                {/* PAY BUTTON (QR) */}
                <div className="relative -top-6">
                    <button 
                        onClick={() => { setSelectedContact(null); setPayTarget(''); setInternalView('pay'); }}
                        className="w-16 h-16 bg-blue-500 hover:bg-blue-400 rounded-full flex flex-col items-center justify-center text-white shadow-lg border-4 border-[#f0f2f5] transition-transform active:scale-95"
                    >
                        <ScanLine size={24} />
                        <span className="text-[9px] font-bold mt-0.5">PAY</span>
                    </button>
                </div>

                <div className="flex flex-col items-center gap-1 text-zinc-400 hover:text-zinc-600 cursor-pointer">
                    <User size={20} />
                    <span className="text-[9px] font-bold">Saya</span>
                </div>
            </div>
        </div>
    );
};
