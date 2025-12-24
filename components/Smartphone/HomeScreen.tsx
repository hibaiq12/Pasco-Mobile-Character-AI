
import React from 'react';
import { MessageCircle, CreditCard, Briefcase, ShoppingBag, Smartphone as SmartphoneIcon, Calendar, CloudSun, Settings, Cloud, CloudRain, CloudLightning, CloudDrizzle, Sun, Moon, Wind, Backpack, Terminal, Snowflake, CloudFog, Globe } from 'lucide-react';
import { getWeather } from '../../services/weatherService';

interface HomeScreenProps {
    onLaunch: (app: string) => void;
    onShowToCharacter: () => void;
    virtualTime?: number;
    forcedWeather?: { condition: string; temp: number } | null;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onLaunch, onShowToCharacter, virtualTime = Date.now(), forcedWeather }) => {
    
    const date = new Date(virtualTime);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dayNum = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'long' }); 
    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

    // Fetch Deterministic Weather OR Use Forced Weather
    const naturalWeather = getWeather(virtualTime);
    
    const activeWeather = forcedWeather ? {
        condition: forcedWeather.condition,
        temperature: forcedWeather.temp,
        description: forcedWeather.condition, 
        iconName: (() => {
            switch(forcedWeather.condition) {
                case 'Sunny': return 'Sun';
                case 'Rainy': return 'CloudRain';
                case 'Stormy': return 'CloudLightning';
                case 'Cloudy': return 'Cloud';
                case 'Snowy': return 'Snowflake';
                case 'Foggy': return 'CloudFog';
                default: return 'Sun';
            }
        })(),
        season: naturalWeather.season // Keep natural season even if weather forced
    } : naturalWeather;

    // Map icon name string to Lucide component
    const WeatherIcon = () => {
        switch(activeWeather.iconName) {
            case 'Cloud': return <Cloud size={16} />;
            case 'CloudRain': return <CloudRain size={16} />;
            case 'CloudDrizzle': return <CloudDrizzle size={16} />;
            case 'CloudLightning': return <CloudLightning size={16} />;
            case 'Sun': return <Sun size={16} />;
            case 'Moon': return <Moon size={16} />;
            case 'Wind': return <Wind size={16} />;
            case 'Snowflake': return <Snowflake size={16} />;
            case 'CloudFog': return <CloudFog size={16} />;
            default: return <CloudSun size={16} />;
        }
    };

    // Reusable App Icon Component
    const AppIcon = ({ icon: Icon, color, label, onClick, isGradient = true }: any) => (
        <button 
            onClick={onClick} 
            className="flex flex-col items-center gap-1.5 group active:scale-90 transition-transform duration-200"
        >
            <div className={`w-[60px] h-[60px] ${color} rounded-[14px] flex items-center justify-center text-white shadow-lg relative overflow-hidden`}>
                {/* Gloss Effect */}
                {isGradient && <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none"></div>}
                <Icon size={28} strokeWidth={2} fill="currentColor" className="opacity-95 drop-shadow-sm relative z-10" />
            </div>
            <span className="text-[11px] text-white/90 font-medium drop-shadow-md tracking-tight">{label}</span>
        </button>
    );

    return (
        <div className="h-full flex flex-col relative z-10 animate-fade-in">
            
            {/* Widget Area */}
            <div className="mt-6 px-6 mb-2">
                <div className="flex gap-4">
                    {/* REFINED Calendar Widget */}
                    <div className="w-1/2 aspect-square bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-[22px] flex flex-col overflow-hidden shadow-2xl relative group">
                        {/* Header Red Bar */}
                        <div className="h-8 bg-red-600 flex items-center justify-center shrink-0 shadow-sm relative z-10">
                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">{month}</span>
                        </div>
                        
                        {/* Body */}
                        <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-white/5 to-transparent relative">
                            <span className="text-5xl font-light text-white tracking-tighter leading-none drop-shadow-lg">
                                {dayNum}
                            </span>
                            <span className="text-[10px] font-medium text-zinc-400 mt-1 uppercase tracking-wide">
                                {dayName}
                            </span>
                        </div>

                        {/* Subtle Reflection */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none opacity-50"></div>
                    </div>
                    
                    {/* Weather/Clock Widget (Dynamic) */}
                    <div className={`w-1/2 aspect-square backdrop-blur-xl border border-white/10 rounded-[22px] p-4 flex flex-col justify-between shadow-2xl text-white relative overflow-hidden transition-colors duration-1000 ${
                        activeWeather.condition === 'Stormy' ? 'bg-gradient-to-b from-slate-800 to-slate-900' :
                        activeWeather.condition === 'Sunny' ? 'bg-gradient-to-b from-blue-400 to-blue-600' :
                        activeWeather.condition === 'Snowy' ? 'bg-gradient-to-b from-slate-200 to-slate-400 text-slate-800' :
                        'bg-gradient-to-b from-blue-500/20 to-blue-600/20'
                    }`}>
                        <div className="flex justify-between items-start relative z-10">
                            <div className="text-[10px] font-bold uppercase tracking-wider opacity-90 flex flex-col">
                                <span>PasWeather</span>
                                <span className="opacity-70 text-[9px]">{activeWeather.season}</span>
                            </div>
                            <WeatherIcon />
                        </div>
                        <div className="relative z-10">
                            <div className="text-3xl font-light tracking-tight">{timeStr}</div>
                            <div className="text-[10px] font-medium opacity-80 mt-1 flex flex-col">
                                <span className="capitalize">{activeWeather.description}</span>
                                <span className="font-bold">{activeWeather.temperature}°C</span>
                            </div>
                        </div>
                        {/* Weather BG Effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
                        {forcedWeather && <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full m-2 animate-pulse" title="Override Active"></div>}
                    </div>
                </div>
            </div>

            {/* Main Grid Apps */}
            <div className="flex-1 px-6 pt-4">
                <div className="grid grid-cols-4 gap-x-4 gap-y-6">
                    <AppIcon 
                        icon={Briefcase} 
                        color="bg-gradient-to-b from-orange-400 to-red-500" 
                        label="JobHub" 
                        onClick={() => onLaunch('jobs')} 
                    />

                    {/* NEW: CONNECTED (Social App) */}
                    <AppIcon 
                        icon={Globe} 
                        color="bg-gradient-to-b from-cyan-400 to-violet-500" 
                        label="Connected" 
                        onClick={() => onLaunch('social')} 
                    />

                    <AppIcon 
                        icon={ShoppingBag} 
                        color="bg-gradient-to-b from-pink-400 to-rose-600" 
                        label="Shop" 
                        onClick={() => onLaunch('shop')} 
                    />
                    
                    <AppIcon 
                        icon={Settings} 
                        color="bg-gradient-to-b from-zinc-400 to-zinc-600" 
                        label="Settings" 
                        onClick={() => onLaunch('settings')} 
                    />
                    
                    <AppIcon 
                        icon={Backpack} 
                        color="bg-gradient-to-b from-amber-600 to-orange-700" 
                        label="Inventory" 
                        onClick={() => onLaunch('inventory')} 
                    />
                </div>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-1.5 pb-3">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-white/30 rounded-full"></div>
            </div>

            {/* Dock Area */}
            <div className="px-4 pb-5">
                <div className="bg-white/20 backdrop-blur-2xl border border-white/5 rounded-[32px] p-4 flex justify-between items-end shadow-2xl">
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
                    <AppIcon 
                        icon={SmartphoneIcon} 
                        color="bg-gradient-to-b from-zinc-600 to-black" 
                        label="Show" 
                        onClick={onShowToCharacter} 
                    />
                    <AppIcon 
                        icon={Terminal} 
                        color="bg-black border border-green-900/50" 
                        label="Cheat" 
                        onClick={() => onLaunch('cheat')} 
                    />
                </div>
            </div>
        </div>
    );
};
