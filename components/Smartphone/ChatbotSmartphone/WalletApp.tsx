
import React from 'react';
import { CharacterPhoneData } from '../../../services/smartphoneStorage';
import { ChevronLeft, Wallet, History, ArrowUpRight } from 'lucide-react';

interface WalletAppProps {
    view: string;
    phoneData: CharacterPhoneData | null;
    onNavigate: (view: string) => void;
    onTransfer: (amount: number, contactId: string, note: string) => void;
    onHome: () => void;
}

export const WalletApp: React.FC<WalletAppProps> = ({ phoneData, onNavigate, onHome }) => {
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    return (
        <div className="h-full flex flex-col bg-zinc-950 animate-fade-in relative z-10 font-sans">
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-6 pb-10 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20"><Wallet size={100} /></div>
                
                <div className="flex items-center gap-2 mb-6 text-white cursor-pointer" onClick={onHome}>
                    <ChevronLeft size={20} /> <span className="font-bold text-sm tracking-wide">Bot Wallet</span>
                </div>

                <div className="text-white relative z-10">
                    <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest mb-1">Current Assets</p>
                    <h2 className="text-3xl font-black tracking-tight drop-shadow-md">
                        {formatCurrency(phoneData?.wallet.balance || 0).replace('Rp', '').trim()} <span className="text-sm font-medium opacity-70">IDR</span>
                    </h2>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 -mt-6 relative z-20">
                <div className="bg-zinc-900 rounded-2xl p-4 shadow-lg border border-white/5 mb-4">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <History size={12} /> Transaction Log
                    </h3>
                    <div className="space-y-3">
                        {phoneData?.wallet.transactions.map((tx, i) => (
                            <div key={i} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-sm border border-white/5">
                                        {tx.icon}
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-zinc-200">{tx.name}</h4>
                                        <p className="text-[9px] text-zinc-500">{tx.date}</p>
                                    </div>
                                </div>
                                <span className={`text-xs font-mono font-bold ${tx.type === 'transfer' || tx.type === 'payment' ? 'text-red-400' : 'text-green-400'}`}>
                                    {tx.type === 'transfer' || tx.type === 'payment' ? '-' : '+'}{formatCurrency(tx.amount).replace('Rp', '')}
                                </span>
                            </div>
                        ))}
                        {phoneData?.wallet.transactions.length === 0 && (
                            <p className="text-[10px] text-zinc-600 text-center py-4">No transactions yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
