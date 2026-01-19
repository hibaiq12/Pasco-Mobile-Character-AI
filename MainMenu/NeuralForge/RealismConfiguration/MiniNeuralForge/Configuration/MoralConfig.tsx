
import React from 'react';
import { InputField } from '../../SharedComponents';
import { Scale, Heart } from 'lucide-react';

interface MoralConfigProps {
    data: any;
    onChange: (key: string, value: any) => void;
}

export const MoralConfig: React.FC<MoralConfigProps> = ({ data, onChange }) => {
    
    const ALIGNMENTS = [
        ['Lawful Good', 'Neutral Good', 'Chaotic Good'],
        ['Lawful Neutral', 'True Neutral', 'Chaotic Neutral'],
        ['Lawful Evil', 'Neutral Evil', 'Chaotic Evil']
    ];

    return (
        <div className="space-y-6 animate-fade-in w-full">
            <div className="bg-zinc-900/30 p-5 rounded-3xl border border-white/5">
                <div className="flex items-center gap-2 mb-4 text-amber-400">
                    <Scale size={18} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Moral Alignment</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                    {ALIGNMENTS.flat().map(align => (
                        <button
                            key={align}
                            onClick={() => onChange('alignment', align)}
                            className={`
                                py-3 text-[9px] font-bold uppercase rounded-lg border transition-all text-center
                                ${data.alignment === align 
                                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md' 
                                    : 'bg-black/20 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'}
                            `}
                        >
                            {align.replace(' ', '\n')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-zinc-900/30 p-5 rounded-3xl border border-white/5 space-y-4">
                <div className="flex items-center gap-2 mb-2 text-rose-400">
                    <Heart size={18} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Core Values</span>
                </div>
                <InputField 
                    labelKey="Primary Belief"
                    value={data.coreValue || ''}
                    onChange={(v) => onChange('coreValue', v)}
                    placeholderKey="e.g. Loyalty above all"
                    tooltipKey="What drives their decisions?"
                />
                <InputField 
                    labelKey="Red Line (Forbidden)"
                    value={data.forbidden || ''}
                    onChange={(v) => onChange('forbidden', v)}
                    placeholderKey="e.g. Betraying a friend"
                    tooltipKey="What will they never do?"
                />
            </div>
        </div>
    );
};
