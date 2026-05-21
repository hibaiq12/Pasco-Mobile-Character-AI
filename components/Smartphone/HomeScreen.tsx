
import React from 'react';
import { MessageCircle, CreditCard, Briefcase, ShoppingBag, Smartphone as SmartphoneIcon, Calendar, CloudSun, Settings, Cloud, CloudRain, CloudLightning, CloudDrizzle, Sun, Moon, Wind, Backpack, Terminal, Snowflake, CloudFog, Music, MapPin, Droplets, Zap, Sparkles } from 'lucide-react';
import { getWeather } from '../../services/weatherService';

interface HomeScreenProps {
    onLaunch: (app: string) => void;
    onShowToCharacter: () => void;
    virtualTime?: number;
    forcedWeather?: { condition: string; temp: number } | null;
}

// Reusable App Icon Component
const AppIcon = ({ icon: Icon, color, label, onClick, isGradient = true }: { icon: any, color: string, label: string, onClick: () => void, isGradient?: boolean }) => (
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

// Map icon name string to Lucide component
const WeatherIcon = ({ iconName, className }: { iconName: string, className?: string }) => {
    const props = { size: 48, strokeWidth: 1.5, className }; // Increased size
    switch(iconName) {
        case 'Cloud': return <Cloud {...props} />;
        case 'CloudRain': return <CloudRain {...props} />;
        case 'CloudDrizzle': return <CloudDrizzle {...props} />;
        case 'CloudLightning': return <CloudLightning {...props} />;
        case 'Sun': return <Sun {...props} />;
        case 'Moon': return <Moon {...props} />;
        case 'Wind': return <Wind {...props} />;
        case 'Snowflake': return <Snowflake {...props} />;
        case 'CloudFog': return <CloudFog {...props} />;
        default: return <CloudSun {...props} />;
    }
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ onLaunch, onShowToCharacter, virtualTime = 0, forcedWeather }) => {
    
    // Use virtualTime if provided, otherwise fallback to a stable reference or 0
    const date = new Date(virtualTime || 1704067200000); // Default to 2024-01-01 if 0
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
        season: naturalWeather.season,
        humidity: naturalWeather.humidity // Keep natural humidity
    } : naturalWeather;

    // Helper for background gradients based on weather
    const getWeatherGradient = () => {
        const cond = activeWeather.condition;
        if (cond.includes('Night')) return 'bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] border-indigo-500/20'; // Deep Indigo Night
        if (cond === 'Sunny') return 'bg-gradient-to-br from-[#0ea5e9] via-[#3b82f6] to-[#2563eb] border-blue-400/30'; // Vibrant Blue
        if (cond === 'Rainy' || cond === 'Stormy') return 'bg-gradient-to-br from-[#334155] via-[#475569] to-[#1e293b] border-slate-500/30'; // Stormy Slate
        if (cond === 'Cloudy' || cond === 'Overcast') return 'bg-gradient-to-br from-[#64748b] via-[#94a3b8] to-[#64748b] border-slate-400/30 text-slate-50'; // Cloudy Gray
        if (cond === 'Snowy') return 'bg-gradient-to-br from-[#e2e8f0] via-[#cbd5e1] to-[#94a3b8] text-slate-700 border-white/50'; // Snow White
        return 'bg-gradient-to-br from-blue-500 to-indigo-600'; // Default
    };

    const bgClass = getWeatherGradient();
    const isLightBg = activeWeather.condition === 'Snowy';
    const textColor = isLightBg ? 'text-slate-800' : 'text-white';
    const subTextColor = isLightBg ? 'text-slate-600' : 'text-white/70';

    return (
        <div className="h-full flex flex-col relative z-10 animate-fade-in">
            
            {/* Widget Area */}
            <div className="mt-6 px-6 mb-2">
                <div className="flex gap-4 h-[155px]"> {/* Fixed Height for consistency */}
                    
                    {/* Calendar Widget */}
                    <div className="w-1/2 h-full bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-[22px] flex flex-col overflow-hidden shadow-2xl relative group">
                        {/* Header Red Bar */}
                        <div className="h-7 bg-red-600 flex items-center justify-center shrink-0 shadow-sm relative z-10">
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
                    
                    {/* REDESIGNED Weather Widget */}
                    <div className={`w-1/2 h-full rounded-[22px] p-4 flex flex-col justify-between shadow-2xl relative overflow-hidden border transition-all duration-1000 ${bgClass}`}>
                        
                        {/* Dynamic Background Shapes */}
                        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>

                        {/* Top: Header */}
                        <div className="flex justify-between items-start relative z-10">
                            <div className="flex flex-col">
                                <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${subTextColor}`}>
                                    <CloudSun size={12} strokeWidth={2.5} /> PasWeather
                                </span>
                                <span className={`text-[9px] font-medium opacity-60 ${textColor} ml-0.5 mt-0.5`}>{timeStr}</span>
                            </div>
                            <div className={`${textColor} drop-shadow-lg transform translate-x-2 -translate-y-1`}>
                                <WeatherIcon iconName={activeWeather.iconName} />
                            </div>
                        </div>

                        {/* Bottom: Temp & Details */}
                        <div className="relative z-10 flex flex-col">
                            <span className={`text-5xl font-thin tracking-tighter leading-none ${textColor} drop-shadow-sm`}>
                                {activeWeather.temperature}°
                            </span>
                            <span className={`text-xs font-medium ${textColor} capitalize mb-2 line-clamp-1`}>
                                {activeWeather.description}
                            </span>
                            
                            {/* Micro Stats */}
                            <div className={`flex items-center gap-3 text-[9px] font-bold ${subTextColor}`}>
                                <span className="flex items-center gap-1">
                                    <Droplets size={8} strokeWidth={3} /> {activeWeather.humidity}%
                                </span>
                                <span className="flex items-center gap-1">
                                    <Wind size={8} strokeWidth={3} /> 5km
                                </span>
                            </div>
                        </div>

                        {/* Override Indicator */}
                        {forcedWeather && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-md" title="Override Active"></div>}
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

                    {/* Spootidy (Music App) */}
                    <AppIcon 
                        icon={Music} 
                        color="bg-gradient-to-b from-green-400 to-emerald-600" 
                        label="Spootidy" 
                        onClick={() => onLaunch('spootidy')} 
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
