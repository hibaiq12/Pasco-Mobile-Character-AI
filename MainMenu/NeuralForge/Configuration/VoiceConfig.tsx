
import React, { useState } from 'react';
import { Character } from '../../../../types';
import { InputField, Tooltip } from './SharedComponents';
import { Button } from '../../../components/Button';
import { Volume2 } from 'lucide-react';
import { t } from '../../../../services/translationService';
import { playTextToSpeech } from '../../../../services/geminiService';

interface VoiceConfigProps {
    formData: Partial<Character>;
    setFormData: (data: Partial<Character>) => void;
}

export const VoiceConfig: React.FC<VoiceConfigProps> = ({ formData, setFormData }) => {
    const [isPreviewingVoice, setIsPreviewingVoice] = useState(false);

    const handleVoicePreview = async () => {
        if (isPreviewingVoice) return;
        setIsPreviewingVoice(true);
        const voiceName = formData.communication?.voiceConfig.tone === 'Soft' ? 'Zephyr' : 'Fenrir';
        await playTextToSpeech(t('forge.voice.test_phrase'), voiceName);
        setIsPreviewingVoice(false);
    };

    return (
        <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <div className="flex items-center mb-2">
                        <label className="text-[10px] uppercase font-bold text-zinc-500 block tracking-widest ml-1">{t('forge.label.voice_tone')}</label>
                        <Tooltip textKey="forge.tip.voice_tone" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {['Neutral','Soft','Raspy','Robotic'].map(tStr => (
                            <button key={tStr} onClick={() => setFormData({...formData, communication: {...formData.communication!, voiceConfig: {...formData.communication!.voiceConfig, tone: tStr}}})} className={`py-2 text-[9px] font-bold uppercase rounded-lg border transition-all ${formData.communication?.voiceConfig.tone === tStr ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-900/20' : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}>{t(`forge.tone.${tStr.toLowerCase()}`)}</button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-500 mb-2 block tracking-widest ml-1">{t('forge.label.vocab')}</label>
                    <div className="grid grid-cols-3 gap-1">
                        {['simple','average','academic'].map(v => (
                            <button key={v} onClick={() => setFormData({...formData, communication: {...formData.communication!, vocabularyLevel: v as any}})} className={`py-2 text-[9px] font-bold uppercase rounded-lg border transition-all ${formData.communication?.vocabularyLevel === v ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-900/20' : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}>{t(`forge.vocab.${v}`)}</button>
                        ))}
                    </div>
                </div>
             </div>
             <InputField labelKey="forge.label.opening" value={formData.communication?.openingLine || ''} onChange={(v) => setFormData({...formData, communication: {...formData.communication!, openingLine: v}})} multiline placeholderKey="forge.ph.opening" tooltipKey="forge.tip.opening" />
             <InputField labelKey="forge.label.quirks" value={formData.communication?.quirks || ''} onChange={(v) => setFormData({...formData, communication: {...formData.communication!, quirks: v}})} placeholderKey="forge.ph.quirks" tooltipKey="forge.tip.quirks" />
             <Button size="sm" onClick={handleVoicePreview} icon={<Volume2 size={14}/>} className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300 rounded-lg text-[10px] uppercase tracking-widest">{isPreviewingVoice ? t('forge.btn.synthesizing') : t('forge.btn.test_voice')}</Button>
        </div>
    );
};
