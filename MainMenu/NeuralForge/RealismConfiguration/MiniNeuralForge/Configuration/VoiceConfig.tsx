
import React from 'react';
import { Slider, InputField } from '../../SharedComponents';
import { Speaker, Mic } from 'lucide-react';

interface VoiceConfigProps {
    data: any;
    onChange: (key: string, value: any) => void;
}

export const VoiceConfig: React.FC<VoiceConfigProps> = ({ data, onChange }) => {
    return (
        <div className="space-y-6 animate-fade-in w-full">
            {/* Grid stacks on mobile, 2 cols on md+ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                
                {/* Acoustics Panel */}
                <div className="bg-zinc-900/30 p-5 rounded-2xl border border-white/5 h-full">
                    <div className="flex items-center gap-2 mb-6 text-violet-400">
                        <Speaker size={18} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Acoustics</span>
                    </div>
                    <div className="space-y-6">
                        <Slider 
                            label="Pitch"
                            value={((data.pitch || 1.0) - 0.5) * 100}
                            onChange={(v) => onChange('pitch', 0.5 + (v / 100))}
                            leftLabel="Deep"
                            rightLabel="High"
                            accentColor="violet"
                        />
                        <Slider 
                            label="Speed"
                            value={((data.speed || 1.0) - 0.5) * 100}
                            onChange={(v) => onChange('speed', 0.5 + (v / 100))}
                            leftLabel="Slow"
                            rightLabel="Fast"
                            accentColor="violet"
                        />
                    </div>
                </div>

                {/* Style Panel */}
                <div className="bg-zinc-900/30 p-5 rounded-2xl border border-white/5 h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-6 text-pink-400">
                        <Mic size={18} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Style</span>
                    </div>
                    <div className="space-y-5 flex-1">
                        <div className="space-y-2">
                            <label className="text-[9px] font-bold text-zinc-500 uppercase ml-1">Tone Type</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['Neutral', 'Soft', 'Raspy', 'Cheery'].map(tone => (
                                    <button
                                        key={tone}
                                        onClick={() => onChange('tone', tone)}
                                        className={`
                                            py-2.5 text-[10px] font-bold border rounded-xl transition-all
                                            ${data.tone === tone 
                                                ? 'bg-violet-500/20 border-violet-500 text-violet-300' 
                                                : 'bg-black/20 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'}
                                        `}
                                    >
                                        {tone}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <InputField 
                            labelKey="Quirks / Stutter"
                            value={data.quirks || ''}
                            onChange={(v) => onChange('quirks', v)}
                            placeholderKey="e.g. Stutters when nervous"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
