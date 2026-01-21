
import React from 'react';
import { Character } from '../../../types';
import { NeuralProfile } from './ProfileEngine';
import { Activity, Zap } from 'lucide-react';

interface NeuralHeaderProps {
    character: Character;
    profile: NeuralProfile;
}

export const NeuralHeader: React.FC<NeuralHeaderProps> = ({ character, profile }) => {
    const isCritical = profile.psyche.stability < 30;
    const stabilityColor = isCritical ? 'text-red-500 shadow-red-500/50' : 'text-emerald-400 shadow-emerald-500/50';

    return (
        <div className="relative group w-full aspect-[4/5] md:aspect-square lg:aspect-[4/5] rounded-[2rem] overflow-hidden border border-white/10 bg-black shadow-2xl">
            {/* Image Layer */}
            <div className="absolute inset-0 transition-transform duration-[20s] ease-linear group-hover:scale-110">
                <img 
                    src={character.avatar} 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700" 
                    alt={character.name}
                />
            </div>

            {/* Scanning Line Animation */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent h-[20%] w-full animate-scan opacity-30 pointer-events-none"></div>
            
            {/* Holographic Overlay / Glitch Effect (Static for now) */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay"></div>
            
            {/* Bottom Gradient for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
            
            {/* Content Info */}
            <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-black text-white tracking-tighter drop-shadow-lg leading-none">
                        {character.name}
                    </h2>
                    {/* Status Dot */}
                    <div className="relative">
                        <div className={`w-2.5 h-2.5 rounded-full ${stabilityColor.split(' ')[0]} shadow-[0_0_15px_currentColor] animate-pulse`}></div>
                        {isCritical && <div className="absolute inset-0 w-full h-full bg-red-500 rounded-full animate-ping opacity-75"></div>}
                    </div>
                </div>

                <div className="flex items-center gap-3 mt-1">
                    <span className="px-2 py-0.5 bg-white/10 backdrop-blur-md rounded text-[9px] font-bold text-white/90 uppercase tracking-widest border border-white/10">
                        {character.role}
                    </span>
                    {profile.isProcessing && (
                        <span className="text-[9px] text-cyan-400 font-mono flex items-center gap-1 animate-pulse">
                            <Zap size={10} fill="currentColor"/> PROCESSING
                        </span>
                    )}
                </div>
            </div>

            {/* Top Right ID Badge */}
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded text-[8px] font-mono text-zinc-500">
                ID: {character.id.split('-')[1]?.toUpperCase() || 'UNK'}
            </div>
        </div>
    );
};
