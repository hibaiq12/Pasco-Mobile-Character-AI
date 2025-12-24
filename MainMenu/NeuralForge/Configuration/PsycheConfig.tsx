
import React from 'react';
import { Character } from '../../../../types';
import { Slider } from './SharedComponents';
import { t } from '../../../../services/translationService';

interface PsycheConfigProps {
    formData: Partial<Character>;
    setFormData: (data: Partial<Character>) => void;
}

export const PsycheConfig: React.FC<PsycheConfigProps> = ({ formData, setFormData }) => {
    return (
        <div className="space-y-4 bg-zinc-900/20 p-4 rounded-xl border border-white/5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Slider 
                    label={t('forge.label.openness')} 
                    value={formData.psychometrics?.openness || 50} 
                    onChange={(v) => setFormData({...formData, psychometrics: {...formData.psychometrics!, openness: v}})} 
                    leftLabel={t('forge.sl.traditional')} rightLabel={t('forge.sl.visionary')} 
                    insight={t('forge.insight.openness')}
                />
                <Slider 
                    label={t('forge.label.conscientiousness')} 
                    value={formData.psychometrics?.conscientiousness || 50} 
                    onChange={(v) => setFormData({...formData, psychometrics: {...formData.psychometrics!, conscientiousness: v}})} 
                    leftLabel={t('forge.sl.chaotic')} rightLabel={t('forge.sl.disciplined')} accentColor="emerald" 
                    insight={t('forge.insight.conscientiousness')}
                />
                <Slider 
                    label={t('forge.label.extraversion')} 
                    value={formData.psychometrics?.extraversion || 50} 
                    onChange={(v) => setFormData({...formData, psychometrics: {...formData.psychometrics!, extraversion: v}})} 
                    leftLabel={t('forge.sl.solitary')} rightLabel={t('forge.sl.social')} accentColor="yellow" 
                    insight={t('forge.insight.extraversion')}
                />
                <Slider 
                    label={t('forge.label.agreeableness')} 
                    value={formData.psychometrics?.agreeableness || 50} 
                    onChange={(v) => setFormData({...formData, psychometrics: {...formData.psychometrics!, agreeableness: v}})} 
                    leftLabel={t('forge.sl.challenging')} rightLabel={t('forge.sl.cooperative')} accentColor="pink" 
                    insight={t('forge.insight.agreeableness')}
                />
            </div>
            <Slider 
                label={t('forge.label.neuroticism')} 
                value={formData.psychometrics?.neuroticism || 50} 
                onChange={(v) => setFormData({...formData, psychometrics: {...formData.psychometrics!, neuroticism: v}})} 
                leftLabel={t('forge.sl.confident')} rightLabel={t('forge.sl.sensitive')} accentColor="red" 
                insight={t('forge.insight.neuroticism')}
            />
            
            <div className="pt-3 border-t border-white/5 mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Slider 
                    label={t('forge.label.decision')} 
                    value={formData.psychometrics?.decisionStyle || 50} 
                    onChange={(v) => setFormData({...formData, psychometrics: {...formData.psychometrics!, decisionStyle: v}})} 
                    leftLabel={t('forge.sl.logic')} rightLabel={t('forge.sl.emotion')} accentColor="cyan" 
                />
                <Slider 
                    label={t('forge.label.empathy')} 
                    value={formData.psychometrics?.empathy || 50} 
                    onChange={(v) => setFormData({...formData, psychometrics: {...formData.psychometrics!, empathy: v}})} 
                    leftLabel={t('forge.sl.cold')} rightLabel={t('forge.sl.warm')} accentColor="blue" 
                />
            </div>
        </div>
    );
};
