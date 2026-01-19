
import React from 'react';
import { InputField } from '../../SharedComponents';
import { BookOpen } from 'lucide-react';

interface LoreConfigProps {
    data: any;
    onChange: (key: string, value: any) => void;
}

export const LoreConfig: React.FC<LoreConfigProps> = ({ data, onChange }) => {
    return (
        <div className="space-y-4 animate-fade-in w-full">
            <div className="bg-zinc-900/30 p-5 md:p-6 rounded-3xl border border-white/5">
                <div className="flex items-center gap-2 mb-5 text-amber-400">
                    <BookOpen size={18} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Character Depth</span>
                </div>
                
                <div className="space-y-5">
                    <InputField 
                        labelKey="Backstory / Context"
                        value={data.description || ''}
                        onChange={(v) => onChange('description', v)}
                        multiline
                        placeholderKey="Describe who they are and their history with the protagonist..."
                        className="min-h-[120px] md:min-h-[150px]"
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InputField 
                            labelKey="Role / Archetype"
                            value={data.role || ''}
                            onChange={(v) => onChange('role', v)}
                            placeholderKey="e.g. Childhood Friend"
                        />
                        <InputField 
                            labelKey="Relation to User"
                            value={data.relation || ''}
                            onChange={(v) => onChange('relation', v)}
                            placeholderKey="e.g. Supportive"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
