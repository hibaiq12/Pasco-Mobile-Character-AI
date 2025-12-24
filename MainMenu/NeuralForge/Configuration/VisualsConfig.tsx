
import React from 'react';
import { Character } from '../../../../types';
import { InputField } from './SharedComponents';

interface VisualsConfigProps {
    formData: Partial<Character>;
    setFormData: (data: Partial<Character>) => void;
    suggestions: Record<string, string[]>;
}

export const VisualsConfig: React.FC<VisualsConfigProps> = ({ formData, setFormData, suggestions }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <InputField labelKey="forge.label.height" value={formData.appearance?.height || ''} onChange={(v) => setFormData({...formData, appearance: {...formData.appearance!, height: v}})} placeholderKey="forge.ph.height" tooltipKey="forge.tip.height" />
                <InputField labelKey="forge.label.build" value={formData.appearance?.build || ''} onChange={(v) => setFormData({...formData, appearance: {...formData.appearance!, build: v}})} placeholderKey="forge.ph.build" tooltipKey="forge.tip.build" />
            </div>
            <InputField labelKey="forge.label.features" value={formData.appearance?.features || ''} onChange={(v) => setFormData({...formData, appearance: {...formData.appearance!, features: v}})} multiline placeholderKey="forge.ph.features" className="h-28" tooltipKey="forge.tip.features" />
            
            <InputField 
                labelKey="forge.label.style" 
                value={formData.appearance?.style || ''} 
                onChange={(v) => setFormData({...formData, appearance: {...formData.appearance!, style: v}})} 
                placeholderKey="forge.ph.style" 
                tooltipKey="forge.tip.style"
                suggestions={suggestions.style}
            />
        </div>
    );
};
