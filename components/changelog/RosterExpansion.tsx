
import React from 'react';
import { Users, Flame } from 'lucide-react';
import { t } from '../../services/translationService';
import { ROSTER_DATA } from './constants';

export const RosterExpansion: React.FC = () => {
    return (
        <div className="bg-zinc-900/50 p-5 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 mb-4">
                <Users size={16} className="text-violet-400"/>
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">{t('changelog.roster')}</h3>
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
    );
};
