
import React from 'react';
import { Character } from '../../../../types';
import { InputField } from './SharedComponents';
import { t } from '../../../../services/translationService';

interface EmotionalConfigProps {
    formData: Partial<Character>;
    setFormData: (data: Partial<Character>) => void;
    suggestions: Record<string, string[]>;
}

export const EmotionalConfig: React.FC<EmotionalConfigProps> = ({ formData, setFormData, suggestions }) => {
    return (
        <div className="space-y-6">
             <InputField labelKey="forge.label.stability" value={formData.emotionalProfile?.stability || ''} onChange={(v) => setFormData({...formData, emotionalProfile: {...formData.emotionalProfile!, stability: v}})} placeholderKey="forge.ph.stability" tooltipKey="forge.tip.stability" />
             <div className="grid grid-cols-1 gap-4 p-4 bg-zinc-900/30 rounded-xl border border-white/5">
                 <h4 className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">{t('forge.label.triggers')}</h4>
                 <InputField labelKey="forge.label.joy" value={formData.emotionalProfile?.joyTriggers || ''} onChange={(v) => setFormData({...formData, emotionalProfile: {...formData.emotionalProfile!, joyTriggers: v}})} placeholderKey="forge.ph.joy" suggestions={suggestions.joy} tooltipKey="forge.tip.triggers" />
                 <InputField labelKey="forge.label.anger" value={formData.emotionalProfile?.angerTriggers || ''} onChange={(v) => setFormData({...formData, emotionalProfile: {...formData.emotionalProfile!, angerTriggers: v}})} placeholderKey="forge.ph.anger" suggestions={suggestions.anger} tooltipKey="forge.tip.triggers" />
                 <InputField labelKey="forge.label.sadness" value={formData.emotionalProfile?.sadnessTriggers || ''} onChange={(v) => setFormData({...formData, emotionalProfile: {...formData.emotionalProfile!, sadnessTriggers: v}})} placeholderKey="forge.ph.sadness" suggestions={suggestions.sadness} tooltipKey="forge.tip.triggers" />
             </div>
        </div>
    );
};
