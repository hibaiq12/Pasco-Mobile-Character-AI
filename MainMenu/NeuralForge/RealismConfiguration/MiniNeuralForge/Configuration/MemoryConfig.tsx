
import React from 'react';
import { InputField } from '../../SharedComponents';
import { Brain, Zap } from 'lucide-react';

interface MemoryConfigProps {
    data: any;
    onChange: (key: string, value: any) => void;
}

export const MemoryConfig: React.FC<MemoryConfigProps> = ({ data, onChange }) => {
    return (
        <div className="space-y-4 animate-fade-in w-full">
            {/* Key Memories Section */}
            <div className="bg-gradient-to-br from-blue-900/20 to-black p-5 md:p-6 rounded-3xl border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                    <Brain size={18} className="text-blue-400" />
                    <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Shared Memory</span>
                </div>
                <p className="text-[10px] md:text-xs text-zinc-500 mb-5 leading-relaxed max-w-lg">
                    Specific events or facts this NPC remembers about the protagonist. This creates a sense of continuity.
                </p>
                
                <InputField 
                    labelKey="Key Memories"
                    value={data.memories || ''}
                    onChange={(v) => onChange('memories', v)}
                    multiline
                    placeholderKey="e.g. Remembered the user's birthday, Knows user hates spicy food..."
                    className="min-h-[100px] md:min-h-[120px] bg-black/40"
                />
            </div>

            {/* Obsession Section - Flex col on mobile, row on desktop */}
            <div className="bg-zinc-900/30 p-4 md:p-5 rounded-2xl border border-white/5 flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex items-center gap-3 md:w-auto">
                    <div className="p-3 bg-zinc-800 rounded-full text-yellow-500 shrink-0">
                        <Zap size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase md:hidden">Current Obsession</span>
                </div>
                
                <div className="flex-1 w-full">
                    <InputField 
                        labelKey="Current Obsession / Topic"
                        value={data.obsession || ''}
                        onChange={(v) => onChange('obsession', v)}
                        placeholderKey="e.g. Online Gambling, K-Pop"
                        className="w-full"
                    />
                </div>
            </div>
        </div>
    );
};
