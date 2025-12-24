
import React from 'react';
import { Character } from '../../../../types';
import { InputField } from './SharedComponents';
import { t } from '../../../../services/translationService';
import { HeartHandshake } from 'lucide-react';

interface EmotionalConfigProps {
    formData: Partial<Character>;
    setFormData: (data: Partial<Character>) => void;
    suggestions: Record<string, string[]>;
}

export const EmotionalConfig: React.FC<EmotionalConfigProps> = ({ formData, setFormData, suggestions }) => {
    return (
        <div className="space-y-6 animate-fade-in">
             <div className="bg-zinc-900/30 border border-white/5 p-5 rounded-2xl">
                <InputField labelKey="forge.label.stability" value={formData.emotionalProfile?.stability || ''} onChange={(v) => setFormData({...formData, emotionalProfile: {...formData.emotionalProfile!, stability: v}})} placeholderKey="forge.ph.stability" tooltipKey="forge.tip.stability" />
             </div>
             
             <div className="grid grid-cols-1 gap-4 p-6 bg-gradient-to-br from-zinc-900/50 to-black rounded-2xl border border-white/5 relative">
                 <div className="flex items-center gap-2 mb-2 border-b border-white/5 pb-3">
                     <HeartHandshake size={16} className="text-blue-400" />
                     <h4 className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest font-sans">{t('forge.label.triggers')}</h4>
                 </div>
                 
                 <InputField labelKey="forge.label.joy" value={formData.emotionalProfile?.joyTriggers || ''} onChange={(v) => setFormData({...formData, emotionalProfile: {...formData.emotionalProfile!, joyTriggers: v}})} placeholderKey="forge.ph.joy" suggestions={suggestions.joy} tooltipKey="forge.tip.triggers" />
                 <InputField labelKey="forge.label.anger" value={formData.emotionalProfile?.angerTriggers || ''} onChange={(v) => setFormData({...formData, emotionalProfile: {...formData.emotionalProfile!, angerTriggers: v}})} placeholderKey="forge.ph.anger" suggestions={suggestions.anger} tooltipKey="forge.tip.triggers" />
                 <InputField labelKey="forge.label.sadness" value={formData.emotionalProfile?.sadnessTriggers || ''} onChange={(v) => setFormData({...formData, emotionalProfile: {...formData.emotionalProfile!, sadnessTriggers: v}})} placeholderKey="forge.ph.sadness" suggestions={suggestions.sadness} tooltipKey="forge.tip.triggers" />
             </div>
        </div>
    );
};
