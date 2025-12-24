
import React from 'react';
import { Sparkles, ArrowRight, Users, Smartphone, Clock, Brain, Layout, Flame, Flower, CloudSun, CreditCard, Zap, Activity } from 'lucide-react';

interface ChangelogModalProps {
  onClose: () => void;
  onClaim: () => void;
}

const ROSTER_DATA = [
    { 
        name: "Del Piero", 
        desc: "80s Cartel Leader", 
        avatar: "https://i.pinimg.com/736x/77/e8/66/77e866bc2c333a1b12ed079c9316c6b8.jpg",
        color: "from-red-900/40 to-black",
        borderColor: "border-red-500/30",
        textColor: "text-red-200",
        emoji: "🚬",
        isNsfw: true
    },
    { 
        name: "Sparkle", 
        desc: "Masked Fool", 
        avatar: "https://i.pinimg.com/736x/ec/b3/59/ecb359f4f9b881c9c142bfb7967de746.jpg",
        color: "from-red-500/20 to-rose-500/5",
        borderColor: "border-red-500/30",
        textColor: "text-red-200",
        emoji: "🎭",
        isNsfw: true
    },
    { 
        name: "Hanabi", 
        desc: "Seductive Swimmer", 
        avatar: "https://i.pinimg.com/736x/9b/40/79/9b4079e2ea6a02418c3d752561379d36.jpg",
        color: "from-rose-600/20 to-pink-600/5",
        borderColor: "border-rose-500/30",
        textColor: "text-rose-200",
        emoji: "🎆",
        isNsfw: true
    },
    { 
        name: "Hu Tao", 
        desc: "Wangsheng Director", 
        avatar: "https://i.pinimg.com/736x/8b/8b/fc/8b8bfcc43bfc78aeb2d37ad2ca3cb258.jpg",
        color: "from-orange-600/20 to-red-600/5",
        borderColor: "border-orange-500/30",
        textColor: "text-orange-200",
        emoji: "👻",
        isNsfw: false
    },
    { 
        name: "Shia", 
        desc: "Bunny Companion", 
        avatar: "https://i.pinimg.com/736x/eb/94/46/eb9446b4adb9cd19fe1707ffdcd792a3.jpg",
        color: "from-blue-400/20 to-cyan-400/5",
        borderColor: "border-blue-400/30",
        textColor: "text-blue-200",
        emoji: "🐰",
        isNsfw: true
    },
    { 
        name: "Shikimori", 
        desc: "Cool Girlfriend", 
        avatar: "https://i.pinimg.com/736x/52/a8/82/52a88258eef6575c777a7683145b4081.jpg",
        color: "from-pink-400/20 to-fuchsia-400/5",
        borderColor: "border-pink-400/30",
        textColor: "text-pink-200",
        emoji: "✨",
        isNsfw: false
    },
    { 
        name: "Firefly", 
        desc: "Fragile & Submissive", 
        avatar: "https://i.pinimg.com/736x/90/df/b3/90dfb35dc98dd62dec52b4e50393a079.jpg",
        color: "from-teal-400/20 to-emerald-400/5",
        borderColor: "border-teal-400/30",
        textColor: "text-teal-200",
        emoji: "🍩",
        isNsfw: true
    },
    { 
        name: "Vespera", 
        desc: "Dominant Mistress", 
        avatar: "https://i.pinimg.com/736x/9e/bd/8d/9ebd8d412f62f110b98d0ddd05ecd953.jpg",
        color: "from-violet-600/20 to-purple-900/5",
        borderColor: "border-violet-500/30",
        textColor: "text-violet-200",
        emoji: "🌑",
        isNsfw: true
    },
    { 
        name: "Selene", 
        desc: "Office Dominatrix", 
        avatar: "https://i.pinimg.com/736x/c8/26/8c/c8268c81d56eca27fde4f69d7fc32a5c.jpg",
        color: "from-slate-500/20 to-zinc-700/5",
        borderColor: "border-slate-500/30",
        textColor: "text-slate-200",
        emoji: "👓",
        isNsfw: true
    },
    { 
        name: "Raven", 
        desc: "Latex Tsundere", 
        avatar: "https://i.pinimg.com/736x/dd/37/77/dd37775ff6bf134a00e8c3e3911e3821.jpg",
        color: "from-zinc-700/20 to-black/5",
        borderColor: "border-zinc-600/30",
        textColor: "text-zinc-200",
        emoji: "🖤",
        isNsfw: true
    }
];

export const ChangelogModal: React.FC<ChangelogModalProps> = ({ onClose, onClaim }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-zinc-950 border border-violet-500/30 w-full max-w-2xl rounded-3xl shadow-[0_0_50px_rgba(124,58,237,0.15)] relative overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header Background */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-900/40 to-transparent pointer-events-none" />

        <div className="p-8 relative z-10 flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-cyan-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-cyan-500/30">Massive Update</span>
            <span className="text-zinc-500 text-xs font-mono">Build v0.8.3</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Pasco: <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-300">Realism White and Blue</span>
          </h2>

          <div className="space-y-8">
            
            {/* Section: New Arrival - Hiyori Kanade */}
            <div className="bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-100 border border-white/50 p-5 rounded-2xl relative overflow-hidden shadow-[0_0_30px_rgba(186,230,253,0.3)] group">
                <div className="absolute right-[-10px] top-[-10px] opacity-20 transition-transform group-hover:scale-110 duration-700 pointer-events-none text-blue-400">
                    <Flower size={120} />
                </div>
                {/* Glossy Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shine pointer-events-none z-20"></div>
                
                <div className="relative z-10 text-zinc-800">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-lg">NEW ARRIVAL</span>
                        <h3 className="text-xl font-black text-blue-900 tracking-tight">Hiyori Kanade</h3>
                    </div>
                    <div className="flex gap-4">
                        <img 
                            src="https://i.pinimg.com/736x/2c/f0/66/2cf0669f2ff4ae553abfa4140264afbf.jpg" 
                            className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover"
                        />
                        <div className="flex-1">
                            <p className="text-sm text-zinc-600 italic mb-3 font-medium">
                                "E-eh... ini cuma baju rumah kok... Mama bilang bahannya nyaman..."
                            </p>
                            <div className="grid grid-cols-2 gap-4 text-xs text-zinc-500">
                                <div>
                                    <strong className="block text-blue-600 uppercase text-[10px] mb-0.5 font-bold">Role</strong>
                                    Innocent Student
                                </div>
                                <div>
                                    <strong className="block text-blue-600 uppercase text-[10px] mb-0.5 font-bold">Trait</strong>
                                    Obedient & Pure
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section: Expanded Roster */}
            <div className="bg-zinc-900/50 p-5 rounded-xl border border-white/5">
                <div className="flex items-center gap-2 mb-4">
                    <Users size={16} className="text-violet-400"/>
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Roster Expansion</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ROSTER_DATA.map((char, i) => (
                        <div key={i} className={`flex items-center gap-4 p-3 bg-gradient-to-r ${char.color} border ${char.borderColor} rounded-2xl hover:brightness-110 transition-all duration-300 group relative overflow-hidden`}>
                            {/* Avatar */}
                            <div className="relative shrink-0">
                                <div className="w-14 h-14 rounded-full p-0.5 bg-white/10 overflow-hidden relative z-10 shadow-lg">
                                    <img src={char.avatar} className="w-full h-full object-cover rounded-full transform group-hover:scale-110 transition-transform duration-500" alt={char.name} />
                                </div>
                                <div className={`absolute inset-0 bg-${char.textColor.split('-')[1]}-500/20 blur-md rounded-full -z-10 group-hover:opacity-100 opacity-0 transition-opacity duration-500`} />
                            </div>
                            
                            {/* Info */}
                            <div className="flex-1 min-w-0 relative z-10">
                                <div className="flex items-center justify-between">
                                    <h4 className={`text-sm font-black uppercase tracking-wide ${char.textColor}`}>{char.name}</h4>
                                    <span className="text-lg leading-none filter drop-shadow-md grayscale group-hover:grayscale-0 transition-all">{char.emoji}</span>
                                </div>
                                
                                <p className="text-[10px] text-zinc-400 leading-tight line-clamp-1 mb-1.5">{char.desc}</p>
                                
                                <div className="flex gap-1.5">
                                    {char.isNsfw && (
                                        <span className="flex items-center gap-1 bg-red-500/10 text-red-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-red-500/20">
                                            <Flame size={8} fill="currentColor"/> 18+
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            {/* Subtle Shine Effect */}
                            <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent transform skew-x-12 group-hover:animate-shine pointer-events-none" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Section: UI/UX & Functional Updates */}
            <div className="bg-gradient-to-r from-zinc-900 to-black p-5 rounded-xl border border-white/5 relative overflow-hidden">
                <div className="absolute -right-8 -bottom-8 text-white/5">
                    <Smartphone size={100} />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Layout size={14} className="text-blue-400"/>
                    Visual & System Overhaul
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-violet-500/10 text-violet-400 rounded-lg shrink-0"><Smartphone size={16}/></div>
                        <div>
                            <h4 className="text-xs font-bold text-zinc-200">OS Animations</h4>
                            <p className="text-[10px] text-zinc-500">Animasi slide dan transisi aplikasi yang mulus dan responsif.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0"><CreditCard size={16}/></div>
                        <div>
                            <h4 className="text-xs font-bold text-zinc-200">Functional Economy</h4>
                            <p className="text-[10px] text-zinc-500">Saldo wallet berkurang saat belanja. Gaji kerja otomatis masuk.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg shrink-0"><CloudSun size={16}/></div>
                        <div>
                            <h4 className="text-xs font-bold text-zinc-200">Atmosphere System</h4>
                            <p className="text-[10px] text-zinc-500">Cuaca dan waktu dinamis yang terbaca oleh karakter AI.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-pink-500/10 text-pink-400 rounded-lg shrink-0"><Sparkles size={16}/></div>
                        <div>
                            <h4 className="text-xs font-bold text-zinc-200">Glassmorphism UI</h4>
                            <p className="text-[10px] text-zinc-500">Tampilan modern dengan transparansi dan blur yang lebih dalam.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section: AI Realism (Deep Dive) */}
            <div className="bg-zinc-900/30 p-5 rounded-xl border border-white/5">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Brain size={14} className="text-purple-400"/>
                    Hyper-Realism AI Protocol
                </h3>
                <div className="space-y-3">
                    <div className="bg-black/40 p-3 rounded-lg border border-white/5 flex gap-3">
                        <Activity size={16} className="text-zinc-500 mt-0.5 shrink-0" />
                        <div>
                            <strong className="text-xs text-zinc-300 block">Deep Context Retention</strong>
                            <p className="text-[10px] text-zinc-500 leading-relaxed">Karakter mengingat lokasi, cuaca, saldo, dan interaksi HP Anda dalam percakapan.</p>
                        </div>
                    </div>
                    <div className="bg-black/40 p-3 rounded-lg border border-white/5 flex gap-3">
                        <Zap size={16} className="text-zinc-500 mt-0.5 shrink-0" />
                        <div>
                            <strong className="text-xs text-zinc-300 block">Physical Presence</strong>
                            <p className="text-[10px] text-zinc-500 leading-relaxed">AI menyadari batasan fisik (jarak). Mereka akan menggunakan SMS jika lokasi Anda berbeda.</p>
                        </div>
                    </div>
                </div>
            </div>

          </div>
          
          <div className="mt-8 pt-8 border-t border-white/5 text-center">
              <p className="text-xs text-zinc-600 font-mono">System initialized. Welcome to the new reality.</p>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-6 border-t border-white/5 bg-zinc-900/50 backdrop-blur flex flex-col md:flex-row items-center gap-4">
          <p className="text-xs text-zinc-500 text-center md:text-left flex-1">
            *Memories synchronized successfully.
          </p>
          <button 
            onClick={onClaim}
            className="w-full md:w-auto bg-white text-black hover:bg-violet-50 font-bold py-3 px-8 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            Update System <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
};
