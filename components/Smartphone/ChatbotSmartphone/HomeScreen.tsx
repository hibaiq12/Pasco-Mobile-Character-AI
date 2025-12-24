
import React, { useMemo } from 'react';
import { Briefcase, ShoppingBag, Smartphone as SmartphoneIcon, Backpack, MessageCircle, CreditCard } from 'lucide-react';
import { Character } from '../../../types';

interface ChatbotHomeScreenProps {
    onLaunch: (app: string) => void;
    virtualTime: number;
    character: Character | null;
}

export const ChatbotHomeScreen: React.FC<ChatbotHomeScreenProps> = ({ onLaunch, virtualTime, character }) => {
    
    // Calculate Age Detail (YY:MM:DD)
    const ageDetails = useMemo(() => {
        if (!character?.birthday) return { years: '?', months: '?', days: '?' };
        
        const parts = character.birthday.split(':').map(Number); // DD:MM:YYYY
        // Handle potential parsing errors
        if (parts.length !== 3 || parts.some(isNaN)) return { years: '?', months: '?', days: '?' };
        
        const [d, m, y] = parts;
        const birthDate = new Date(y, m - 1, d);
        const currentDate = new Date(virtualTime);

        let years = currentDate.getFullYear() - birthDate.getFullYear();
        let months = currentDate.getMonth() - birthDate.getMonth();
        let days = currentDate.getDate() - birthDate.getDate();

        if (days < 0) {
            months--;
            // Get days in previous month
            const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
            days += prevMonth.getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        return { years, months, days };
    }, [character, virtualTime]);

    // Reusable App Icon Component
    const AppIcon = ({ icon: Icon, color, label, onClick }: any) => (
        <button 
            onClick={onClick} 
            className="flex flex-col items-center gap-1.5 group active:scale-90 transition-transform duration-200"
        >
            <div className={`w-[60px] h-[60px] ${color} rounded-[14px] flex items-center justify-center text-white shadow-lg relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none"></div>
                <Icon size={28} strokeWidth={2} fill="currentColor" className="opacity-95 drop-shadow-sm relative z-10" />
            </div>
            <span className="text-[11px] text-white/90 font-medium drop-shadow-md tracking-tight">{label}</span>
        </button>
    );

    return (
        <div className="h-full flex flex-col relative z-10 animate-fade-in">
            
            {/* Widget Area: Chatbot Profile */}
            <div className="mt-8 px-6 mb-4">
                <div className="w-full bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-[22px] p-4 flex items-center gap-4 shadow-2xl relative overflow-hidden">
                    
                    {/* Left: Avatar Circle */}
                    <div className="shrink-0 relative">
                        <div className="w-16 h-16 rounded-full border-2 border-white/20 shadow-lg overflow-hidden relative z-10">
                            {character?.avatar ? (
                                <img src={character.avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-zinc-700"></div>
                            )}
                        </div>
                    </div>

                    {/* Right: Info */}
                    <div className="flex flex-col justify-center min-w-0 z-10">
                        <h2 className="text-lg font-bold text-white truncate leading-tight mb-1">{character?.name || 'Unknown'}</h2>
                        <div className="text-[10px] text-zinc-400 font-mono flex items-center gap-2">
                            <span className="bg-zinc-800 px-2 py-0.5 rounded text-violet-300 font-bold border border-white/5">
                                {ageDetails.years} Y
                            </span>
                            <span className="bg-zinc-800 px-2 py-0.5 rounded text-blue-300 font-bold border border-white/5">
                                {ageDetails.months} M
                            </span>
                            <span className="bg-zinc-800 px-2 py-0.5 rounded text-green-300 font-bold border border-white/5">
                                {ageDetails.days} D
                            </span>
                        </div>
                    </div>

                    {/* Background Deco */}
                    <div className="absolute right-[-10px] bottom-[-10px] opacity-10 rotate-12">
                        <SmartphoneIcon size={80} />
                    </div>
                </div>
            </div>

            {/* Main Grid Apps - Restricted List */}
            <div className="flex-1 px-6 pt-2">
                <div className="grid grid-cols-4 gap-x-4 gap-y-6">
                    <AppIcon 
                        icon={Briefcase} 
                        color="bg-gradient-to-b from-orange-400 to-red-500" 
                        label="JobHub" 
                        onClick={() => onLaunch('jobs')} 
                    />
                    <AppIcon 
                        icon={ShoppingBag} 
                        color="bg-gradient-to-b from-pink-400 to-rose-600" 
                        label="Shop" 
                        onClick={() => onLaunch('shop')} 
                    />
                    <AppIcon 
                        icon={Backpack} 
                        color="bg-gradient-to-b from-amber-600 to-orange-700" 
                        label="Inventory" 
                        onClick={() => onLaunch('inventory')} 
                    />
                    {/* Empty slots for grid alignment if needed */}
                </div>
            </div>

            {/* Dock Area - Restricted Apps */}
            <div className="px-4 pb-5 mt-auto">
                <div className="bg-white/20 backdrop-blur-2xl border border-white/5 rounded-[32px] p-4 flex justify-around items-end shadow-2xl">
                    <AppIcon 
                        icon={MessageCircle} 
                        color="bg-gradient-to-b from-green-400 to-emerald-600" 
                        label="Chat" 
                        onClick={() => onLaunch('chat')} 
                    />
                    <AppIcon 
                        icon={CreditCard} 
                        color="bg-gradient-to-b from-blue-400 to-indigo-600" 
                        label="Wallet" 
                        onClick={() => onLaunch('wallet')} 
                    />
                </div>
            </div>
        </div>
    );
};
