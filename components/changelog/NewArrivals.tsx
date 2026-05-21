
import React from 'react';
import { Flower, BookOpen, MessageCircle, Brain, Zap, Flame, ShieldAlert, Sparkles } from 'lucide-react';
import { t } from '../../services/translationService';

export const NewArrivals: React.FC = () => {
    
    // Data khusus untuk Story Mode Roster di dalam banner
    const STORY_ROSTER = [
        {
            name: "Hiyori Kanade",
            desc: "Innocent Student",
            avatar: "https://i.pinimg.com/736x/2c/f0/66/2cf0669f2ff4ae553abfa4140264afbf.jpg",
            color: "from-cyan-900/40 to-blue-950/20",
            borderColor: "border-cyan-500/30",
            textColor: "text-cyan-200",
            emoji: "🌸",
            isNsfw: true
        },
        {
            name: "Hikaru Sora",
            desc: "Cheerful Tomboy",
            avatar: "https://i.pinimg.com/736x/b9/c6/40/b9c6406066a8903b730c1718f108db8d.jpg",
            color: "from-violet-900/40 to-purple-950/20",
            borderColor: "border-violet-500/30",
            textColor: "text-violet-200",
            emoji: "☀️",
            isNsfw: true
        }
    ];

    return (
        <div className="space-y-6">
            {/* Section: New Arrival - Hiyori Kanade */}
            <div className="bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-100 border border-white/50 p-6 rounded-3xl relative overflow-hidden shadow-[0_0_40px_rgba(186,230,253,0.2)] group transition-all hover:scale-[1.01] duration-500">
                <div className="absolute right-[-20px] top-[-20px] opacity-10 transition-transform group-hover:scale-125 duration-700 pointer-events-none text-blue-500 rotate-12">
                    <Flower size={160} />
                </div>
                
                {/* Holographic Scan Effect */}
                <div className="absolute left-0 top-0 w-full h-[2px] bg-white/80 shadow-[0_0_15px_white] opacity-0 group-hover:opacity-50 group-hover:animate-holo-scan pointer-events-none z-20"></div>

                <div className="relative z-10 text-zinc-800 flex flex-col md:flex-row gap-6 items-start">
                    <div className="relative">
                         <img 
                            src="https://i.pinimg.com/736x/2c/f0/66/2cf0669f2ff4ae553abfa4140264afbf.jpg" 
                            className="w-24 h-24 rounded-2xl border-4 border-white shadow-xl object-cover transform -rotate-3 group-hover:rotate-0 transition-transform duration-500"
                        />
                        <div className="absolute -bottom-3 -right-3 bg-white p-1.5 rounded-lg shadow-md">
                            <Sparkles size={16} className="text-cyan-500" />
                        </div>
                    </div>
                    
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                             <h3 className="text-2xl font-black text-blue-900 tracking-tight">Hiyori Kanade</h3>
                             <span className="bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{t('banner.new_arrival')}</span>
                        </div>
                        
                        <p className="text-sm text-zinc-600 italic mb-4 font-medium leading-relaxed bg-white/40 p-3 rounded-lg border border-white/50">
                            "E-eh... ini cuma baju rumah kok... Mama bilang bahannya nyaman..."
                        </p>
                        <div className="flex gap-4">
                             <div className="flex flex-col">
                                 <span className="text-[9px] font-bold text-blue-400 uppercase">Role</span>
                                 <span className="text-xs font-bold text-blue-900">Innocent Student</span>
                             </div>
                             <div className="w-px h-8 bg-blue-200"></div>
                             <div className="flex flex-col">
                                 <span className="text-[9px] font-bold text-blue-400 uppercase">Trait</span>
                                 <span className="text-xs font-bold text-blue-900">Obedient & Pure</span>
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section: New Arrival - Hikaru Sora */}
            <div className="bg-gradient-to-br from-slate-50 via-purple-50 to-violet-100 border border-white/50 p-6 rounded-3xl relative overflow-hidden shadow-[0_0_40px_rgba(167,139,250,0.2)] group transition-all hover:scale-[1.01] duration-500">
                <div className="absolute right-[-20px] top-[-20px] opacity-10 transition-transform group-hover:scale-125 duration-700 pointer-events-none text-violet-500 rotate-12">
                    {/* Changed Zap to Sparkles for feminine feel */}
                    <Sparkles size={160} />
                </div>

                {/* Holographic Scan Effect */}
                <div className="absolute left-0 top-0 w-full h-[2px] bg-white/80 shadow-[0_0_15px_white] opacity-0 group-hover:opacity-50 group-hover:animate-holo-scan pointer-events-none z-20"></div>
                
                <div className="relative z-10 text-zinc-800 flex flex-col md:flex-row gap-6 items-start">
                    <div className="relative">
                         <img 
                            src="https://i.pinimg.com/736x/b9/c6/40/b9c6406066a8903b730c1718f108db8d.jpg" 
                            className="w-24 h-24 rounded-2xl border-4 border-white shadow-xl object-cover transform rotate-3 group-hover:rotate-0 transition-transform duration-500"
                        />
                        <div className="absolute -bottom-3 -right-3 bg-white p-1.5 rounded-lg shadow-md">
                            {/* Changed Zap to Sparkles */}
                            <Sparkles size={16} className="text-violet-500" />
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                             <h3 className="text-2xl font-black text-violet-900 tracking-tight">Hikaru Sora</h3>
                             <span className="bg-violet-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{t('banner.new_arrival')}</span>
                        </div>

                        <p className="text-sm text-zinc-600 italic mb-4 font-medium leading-relaxed bg-white/40 p-3 rounded-lg border border-white/50">
                            "Hehe... hai! Kamu kelihatan capek ya? Sini istirahat bentar sama aku!"
                        </p>
                        <div className="flex gap-4">
                             <div className="flex flex-col">
                                 <span className="text-[9px] font-bold text-violet-400 uppercase">Role</span>
                                 <span className="text-xs font-bold text-violet-900">Cheerful Tomboy</span>
                             </div>
                             <div className="w-px h-8 bg-violet-200"></div>
                             <div className="flex flex-col">
                                 <span className="text-[9px] font-bold text-violet-400 uppercase">Trait</span>
                                 <span className="text-xs font-bold text-violet-900">Energetic & Clumsy</span>
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* NEW BANNER: STORY MODE UPDATE */}
            <div className="relative overflow-hidden rounded-3xl border border-yellow-500/40 bg-gradient-to-br from-yellow-950/40 to-amber-900/10 p-8 shadow-[0_0_40px_rgba(234,179,8,0.15)] group animate-fade-in-up">
                {/* Background decorations */}
                <div className="absolute -right-12 -top-12 text-yellow-500/10 animate-spin-slow pointer-events-none">
                    <BookOpen size={180} />
                </div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none mix-blend-overlay"></div>
                
                {/* Header */}
                <div className="relative z-10 mb-8 flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/50 shadow-lg shadow-yellow-500/20">
                        <BookOpen size={28} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500">
                            STORY MODE UPDATE
                        </h3>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-600/80">
                            Breaking The Limits
                        </p>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="relative z-10 grid grid-cols-1 gap-6">
                    {/* Feature Highlights */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-zinc-300">
                        <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-yellow-500/5 transition-colors border border-transparent hover:border-yellow-500/10">
                            <MessageCircle size={18} className="mt-0.5 shrink-0 text-yellow-500" />
                            <div>
                                <strong className="block text-yellow-200 text-sm mb-1">Mini Chatbot Ecosystem</strong>
                                <span className="text-[11px] opacity-70 leading-relaxed block">Interaksi NPC via Smartphone yang hidup dan merespon konteks.</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-yellow-500/5 transition-colors border border-transparent hover:border-yellow-500/10">
                            <Brain size={18} className="mt-0.5 shrink-0 text-yellow-500" />
                            <div>
                                <strong className="block text-yellow-200 text-sm mb-1">Psychological Depth</strong>
                                <span className="text-[11px] opacity-70 leading-relaxed block">Realisme detail dengan memori jangka panjang dan trauma.</span>
                            </div>
                        </div>
                    </div>

                    {/* 18+ / Limit Break Section */}
                    <div className="rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-950/40 to-red-900/10 p-5 relative overflow-hidden group/alert">
                        <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover/alert:opacity-100 transition-opacity"></div>
                        <div className="relative z-10 flex items-start gap-4">
                            <div className="p-2.5 bg-red-500/20 text-red-400 rounded-xl shrink-0 animate-pulse border border-red-500/20">
                                <Flame size={24} fill="currentColor" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black uppercase tracking-widest text-red-400 mb-1">
                                    UNFILTERED INTIMACY (18+)
                                </h4>
                                <p className="text-xs leading-relaxed text-red-200/70">
                                    Pendalaman karakter yang intim dan fitur romance yang diluar batas standar. Karakter memiliki otonomi penuh atas hasrat dan emosi mereka.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* STORY MODE ROSTER LIST */}
                    <div className="mt-2 pt-6 border-t border-yellow-500/20">
                        <h4 className="text-[10px] font-bold text-yellow-500/70 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <BookOpen size={12}/> Story Mode Characters
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {STORY_ROSTER.map((char, i) => (
                                <div key={i} className={`flex items-center gap-4 p-3 bg-gradient-to-r ${char.color} border ${char.borderColor} rounded-2xl hover:brightness-110 transition-all duration-300 group relative overflow-hidden`}>
                                    {/* Avatar */}
                                    <div className="relative shrink-0">
                                        <div className="w-12 h-12 rounded-full p-0.5 bg-white/10 overflow-hidden relative z-10 shadow-lg">
                                            <img src={char.avatar} className="w-full h-full object-cover rounded-full transform group-hover:scale-110 transition-transform duration-500" alt={char.name} />
                                        </div>
                                        <div className={`absolute inset-0 bg-${char.textColor.split('-')[1]}-500/20 blur-md rounded-full -z-10 group-hover:opacity-100 opacity-0 transition-opacity duration-500`} />
                                    </div>
                                    
                                    {/* Info */}
                                    <div className="flex-1 min-w-0 relative z-10">
                                         <div className="flex items-center justify-between">
                                            <h4 className={`text-xs font-black uppercase tracking-wide ${char.textColor}`}>{char.name}</h4>
                                            <span className="text-sm leading-none filter drop-shadow-md grayscale group-hover:grayscale-0 transition-all">{char.emoji}</span>
                                        </div>
                                        
                                        <p className="text-[9px] text-zinc-400 leading-tight line-clamp-1 mb-1">{char.desc}</p>
                                        
                                        {char.isNsfw && (
                                            <span className="flex items-center gap-1 bg-red-500/10 text-red-400 text-[8px] font-bold px-1.5 py-0.5 rounded border border-red-500/20 w-fit">
                                                <Flame size={8} fill="currentColor"/> 18+
                                            </span>
                                        )}
                                    </div>
                                    
                                    {/* Subtle Shine Effect */}
                                    <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent transform skew-x-12 group-hover:animate-shine pointer-events-none" />
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
