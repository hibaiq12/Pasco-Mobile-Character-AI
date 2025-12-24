
import React, { useState } from 'react';
import { Character } from '../../../../types';
import { InputField, Tooltip } from './SharedComponents';
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
        <div className="space-y-6 animate-fade-in">
             <div className="bg-zinc-900/30 p-6 border border-white/5 rounded-2xl relative backdrop-blur-sm">
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <div className="flex items-center mb-3 gap-2">
                            <label className="text-[10px] uppercase font-bold text-zinc-500 block tracking-widest font-sans">{t('forge.label.voice_tone')}</label>
                            <Tooltip textKey="forge.tip.voice_tone" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {['Neutral','Soft','Raspy','Robotic'].map(tStr => (
                                <button key={tStr} onClick={() => setFormData({...formData, communication: {...formData.communication!, voiceConfig: {...formData.communication!.voiceConfig, tone: tStr}}})} className={`py-2.5 text-[9px] font-bold uppercase rounded-lg border transition-all ${formData.communication?.voiceConfig.tone === tStr ? 'bg-blue-500/20 border-blue-500/50 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'bg-zinc-900/50 border-white/5 text-zinc-500 hover:border-white/10 hover:text-zinc-300'}`}>{t(`forge.tone.${tStr.toLowerCase()}`)}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold text-zinc-500 mb-3 block tracking-widest font-sans">{t('forge.label.vocab')}</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['simple','average','academic'].map(v => (
                                <button key={v} onClick={() => setFormData({...formData, communication: {...formData.communication!, vocabularyLevel: v as any}})} className={`py-2.5 text-[9px] font-bold uppercase rounded-lg border transition-all ${formData.communication?.vocabularyLevel === v ? 'bg-violet-500/20 border-violet-500/50 text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.1)]' : 'bg-zinc-900/50 border-white/5 text-zinc-500 hover:border-white/10 hover:text-zinc-300'}`}>{t(`forge.vocab.${v}`)}</button>
                            ))}
                        </div>
                    </div>
                 </div>
             </div>

             <InputField labelKey="forge.label.opening" value={formData.communication?.openingLine || ''} onChange={(v) => setFormData({...formData, communication: {...formData.communication!, openingLine: v}})} multiline placeholderKey="forge.ph.opening" tooltipKey="forge.tip.opening" />
             <InputField labelKey="forge.label.quirks" value={formData.communication?.quirks || ''} onChange={(v) => setFormData({...formData, communication: {...formData.communication!, quirks: v}})} placeholderKey="forge.ph.quirks" tooltipKey="forge.tip.quirks" />
             
             <button 
                onClick={handleVoicePreview} 
                className="w-full py-3 bg-zinc-800/50 hover:bg-zinc-800 border border-white/10 hover:border-blue-500/30 text-zinc-400 hover:text-blue-400 rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-sm group active:scale-95"
             >
                 <Volume2 size={14} className="group-hover:text-blue-400 transition-colors" />
                 {isPreviewingVoice ? t('forge.btn.synthesizing') : t('forge.btn.test_voice')}
             </button>
        </div>
    );
};
