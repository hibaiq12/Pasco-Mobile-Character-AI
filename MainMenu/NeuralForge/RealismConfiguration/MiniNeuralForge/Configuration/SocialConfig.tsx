
import React from 'react';
import { Slider, InputField } from '../../SharedComponents';
import { Users, Globe, UserCheck } from 'lucide-react';

interface SocialConfigProps {
    data: any;
    onChange: (key: string, value: any) => void;
}

export const SocialConfig: React.FC<SocialConfigProps> = ({ data, onChange }) => {
    return (
        <div className="space-y-6 animate-fade-in w-full">
            <div className="bg-zinc-900/30 p-5 rounded-3xl border border-white/5 space-y-6">
                <div className="flex items-center gap-2 mb-2 text-blue-400">
                    <Users size={18} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Social Energy</span>
                </div>
                
                <Slider 
                    label="Social Battery"
                    value={data.socialBattery || 50}
                    onChange={(v) => onChange('socialBattery', v)}
                    leftLabel="Introvert"
                    rightLabel="Extrovert"
                    accentColor="blue"
                />

                <div className="space-y-2">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase ml-1">Popularity / Reputation</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {['Loner', 'Average', 'Popular', 'Celebrity'].map(pop => (
                            <button
                                key={pop}
                                onClick={() => onChange('popularity', pop)}
                                className={`
                                    py-2.5 text-[10px] font-bold uppercase rounded-xl border transition-all
                                    ${data.popularity === pop 
                                        ? 'bg-blue-600/30 border-blue-500 text-blue-200' 
                                        : 'bg-black/20 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'}
                                `}
                            >
                                {pop}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-zinc-900 to-black p-5 rounded-3xl border border-white/5 space-y-4">
                <div className="flex items-center gap-2 mb-2 text-indigo-400">
                    <Globe size={18} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Network</span>
                </div>
                <InputField 
                    labelKey="Social Circle"
                    value={data.socialCircle || ''}
                    onChange={(v) => onChange('socialCircle', v)}
                    placeholderKey="e.g. Gamers, Elites, Rebels"
                />
            </div>
        </div>
    );
};
