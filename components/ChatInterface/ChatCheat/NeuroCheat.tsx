
import React from 'react';
import { Character } from '../../../types';
import { Activity, Brain, Heart, Layers, Scale, Zap } from 'lucide-react';

interface NeuroCheatProps {
    character: Character;
    onChange: (updatedChar: Character) => void;
}

export const NeuroCheat: React.FC<NeuroCheatProps> = ({ character, onChange }) => {
    
    const updatePsych = (key: keyof typeof character.psychometrics, val: number) => {
        onChange({
            ...character,
            psychometrics: {
                ...character.psychometrics,
                [key]: val
            }
        });
    };

    const updateEmotional = (key: keyof typeof character.emotionalProfile, val: string) => {
        onChange({
            ...character,
            emotionalProfile: {
                ...character.emotionalProfile,
                [key]: val
            }
        });
    };

    const updateSocial = (key: keyof typeof character.socialProfile, val: string) => {
        onChange({
            ...character,
            socialProfile: {
                ...character.socialProfile,
                [key]: val
            }
        });
    };

    const updateLore = (key: keyof typeof character.lore, val: string) => {
        onChange({
            ...character,
            lore: {
                ...character.lore,
                [key]: val
            }
        });
    };

    const updateDuality = (key: keyof typeof character.duality, val: string) => {
        onChange({
            ...character,
            duality: {
                ...character.duality,
                [key]: val
            }
        });
    };

    return (
        <div className="space-y-6 p-1">
            {/* PSYCHE SECTION */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-rose-400 border-b border-rose-500/20 pb-2">
                    <Activity size={16} />
                    <h3 className="text-xs font-black uppercase tracking-widest">Psyche Override</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                         <label className="text-[9px] font-bold text-zinc-500 uppercase">Neuroticism (Stability Inv)</label>
                         <input 
                             type="range" min="0" max="100" 
                             value={character.psychometrics.neuroticism}
                             onChange={(e) => updatePsych('neuroticism', parseInt(e.target.value))}
                             className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-rose-500"
                         />
                         <div className="flex justify-between text-[8px] text-zinc-600 font-mono">
                             <span>STABLE</span>
                             <span>VOLATILE</span>
                         </div>
                     </div>
                     <div className="space-y-1">
                         <label className="text-[9px] font-bold text-zinc-500 uppercase">Agreeableness</label>
                         <input 
                             type="range" min="0" max="100" 
                             value={character.psychometrics.agreeableness}
                             onChange={(e) => updatePsych('agreeableness', parseInt(e.target.value))}
                             className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-emerald-500"
                         />
                         <div className="flex justify-between text-[8px] text-zinc-600 font-mono">
                             <span>HOSTILE</span>
                             <span>FRIENDLY</span>
                         </div>
                     </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase">Base Stability Status</label>
                    <div className="flex gap-2">
                        {['Fragile', 'Moderate', 'High', 'Stoic'].map(s => (
                            <button
                                key={s}
                                onClick={() => updateEmotional('stability', s)}
                                className={`flex-1 py-1.5 text-[9px] font-bold uppercase rounded border transition-all ${character.emotionalProfile.stability === s ? 'bg-rose-500/20 border-rose-500 text-rose-300' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* SOCIAL SECTION */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-blue-400 border-b border-blue-500/20 pb-2">
                    <Heart size={16} />
                    <h3 className="text-xs font-black uppercase tracking-widest">Relationship Hack</h3>
                </div>

                <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase">Relationship Label (Override)</label>
                    <input 
                        type="text" 
                        value={character.lore.userRelationship}
                        onChange={(e) => updateLore('userRelationship', e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-blue-200 focus:border-blue-500 outline-none font-mono"
                        placeholder="e.g. Soulmate, Enemy"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase">Trust Factor</label>
                    <div className="grid grid-cols-3 gap-2">
                         {['Low', 'Medium', 'High', 'Blind', 'Broken'].map(t => (
                             <button
                                key={t}
                                onClick={() => updateSocial('trustFactor', t)}
                                className={`py-1.5 text-[9px] font-bold uppercase rounded border transition-all ${character.socialProfile.trustFactor === t ? 'bg-blue-500/20 border-blue-500 text-blue-300' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
                             >
                                 {t}
                             </button>
                         ))}
                    </div>
                </div>
            </div>

            {/* DUALITY SECTION */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-amber-400 border-b border-amber-500/20 pb-2">
                    <Layers size={16} />
                    <h3 className="text-xs font-black uppercase tracking-widest">Duality/Mask</h3>
                </div>

                <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase">Mask Description</label>
                    <input 
                        type="text" 
                        value={character.duality.mask}
                        onChange={(e) => updateDuality('mask', e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-amber-200 focus:border-amber-500 outline-none font-mono"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase">Breaking Point Trigger</label>
                    <input 
                        type="text" 
                        value={character.duality.breakingPoint}
                        onChange={(e) => updateDuality('breakingPoint', e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-amber-200 focus:border-amber-500 outline-none font-mono"
                    />
                </div>
            </div>

            <div className="p-3 bg-zinc-900/50 rounded-lg border border-white/5 text-[9px] text-zinc-500 font-mono italic text-center">
                *Changes injected directly into neural matrix. No reload required.
            </div>
        </div>
    );
};
