
import React from 'react';
import { Slider, InputField } from '../../SharedComponents';
import { Heart, Link, Shield } from 'lucide-react';

interface RelationshipConfigProps {
    data: any;
    onChange: (key: string, value: any) => void;
}

export const RelationshipConfig: React.FC<RelationshipConfigProps> = ({ data, onChange }) => {
    return (
        <div className="space-y-6 animate-fade-in w-full">
            
            {/* Connection Card */}
            <div className="bg-gradient-to-r from-pink-900/20 to-zinc-900 p-5 rounded-3xl border border-pink-500/20 space-y-6">
                <div className="flex items-center gap-2 text-pink-400">
                    <Link size={18} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Connection to User</span>
                </div>

                <InputField 
                    labelKey="Relationship Label"
                    value={data.relationshipLabel || ''}
                    onChange={(v) => onChange('relationshipLabel', v)}
                    placeholderKey="e.g. Ex-Girlfriend, Rival, Mentor"
                    className="w-full"
                />

                <Slider 
                    label="Trust Level"
                    value={data.trustLevel || 50}
                    onChange={(v) => onChange('trustLevel', v)}
                    leftLabel="Distrust"
                    rightLabel="Devotion"
                    accentColor="rose"
                />
            </div>

            {/* Dynamic & History */}
            <div className="bg-zinc-900/30 p-5 rounded-3xl border border-white/5 space-y-5">
                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                    <Shield size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">History & Dynamic</span>
                </div>

                <InputField 
                    labelKey="Interaction Dynamic"
                    value={data.dynamic || ''}
                    onChange={(v) => onChange('dynamic', v)}
                    placeholderKey="e.g. Awkward silence, Constant bickering"
                    tooltipKey="How do they act when around the user?"
                />

                <InputField 
                    labelKey="Shared History / Context"
                    value={data.sharedHistory || ''}
                    onChange={(v) => onChange('sharedHistory', v)}
                    multiline
                    placeholderKey="e.g. Met in high school, betrayed them once..."
                    className="min-h-[100px]"
                />
            </div>
        </div>
    );
};
