
import React from 'react';
import { InputField } from '../../SharedComponents';
import { MessageSquare, Quote } from 'lucide-react';

interface DialogueConfigProps {
    data: any;
    onChange: (key: string, value: any) => void;
}

export const DialogueConfig: React.FC<DialogueConfigProps> = ({ data, onChange }) => {
    return (
        <div className="space-y-4 animate-fade-in w-full">
            <div className="bg-zinc-900/30 p-5 md:p-6 rounded-3xl border border-white/5 space-y-6">
                
                {/* Section 1 */}
                <div>
                    <div className="flex items-center gap-2 mb-3 text-cyan-400">
                        <MessageSquare size={18} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">First Impression</span>
                    </div>
                    <InputField 
                        labelKey="Opening Message"
                        value={data.lastMessage || ''}
                        onChange={(v) => onChange('lastMessage', v)}
                        placeholderKey="e.g. Hey, long time no see!"
                        tooltipKey="The text that appears in the smartphone preview."
                    />
                </div>

                <div className="h-px bg-white/5 w-full"></div>

                {/* Section 2 */}
                <div>
                    <div className="flex items-center gap-2 mb-4 text-zinc-400">
                        <Quote size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Speaking Style</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-bold text-zinc-500 uppercase ml-1">Formality Level</label>
                            <div className="flex gap-2">
                                {['Formal', 'Casual', 'Slang'].map((style) => (
                                    <button
                                        key={style}
                                        onClick={() => onChange('speechStyle', style)}
                                        className={`
                                            flex-1 py-2.5 text-[10px] font-bold uppercase rounded-xl border transition-all
                                            ${data.speechStyle === style 
                                                ? 'bg-cyan-900/30 border-cyan-500 text-cyan-300' 
                                                : 'bg-black/20 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'}
                                        `}
                                    >
                                        {style}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <InputField 
                            labelKey="Sample Phrase"
                            value={data.samplePhrase || ''}
                            onChange={(v) => onChange('samplePhrase', v)}
                            placeholderKey="e.g. 'Gaskeun ngab!'"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
