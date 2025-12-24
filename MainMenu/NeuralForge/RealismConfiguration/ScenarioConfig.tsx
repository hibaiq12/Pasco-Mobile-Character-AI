
import React from 'react';
import { Character } from '../../../../types';
import { InputField, Tooltip } from './SharedComponents';
import { Clock, MapPin } from 'lucide-react';
import { t } from '../../../../services/translationService';

interface ScenarioConfigProps {
    formData: Partial<Character>;
    setFormData: (data: Partial<Character>) => void;
}

export const ScenarioConfig: React.FC<ScenarioConfigProps> = ({ formData, setFormData }) => {
    return (
         <div className="space-y-6 animate-fade-in">
             <div className="grid grid-cols-1 gap-4 p-5 border border-white/5 bg-zinc-900/30 rounded-2xl backdrop-blur-sm">
                <InputField labelKey="forge.label.location" value={formData.scenario?.currentLocation || ''} onChange={(v) => setFormData({...formData, scenario: {...formData.scenario!, currentLocation: v}})} placeholderKey="forge.ph.location" tooltipKey="forge.tip.location" />
                <InputField labelKey="forge.label.activity" value={formData.scenario?.currentActivity || ''} onChange={(v) => setFormData({...formData, scenario: {...formData.scenario!, currentActivity: v}})} placeholderKey="forge.ph.activity" tooltipKey="forge.tip.activity" />
             </div>
             
             {/* Temporal Anchor Card (Glass Style) */}
             <div className="p-6 bg-gradient-to-br from-zinc-900 to-black border border-white/5 rounded-2xl relative overflow-hidden">
                <div className="absolute -right-6 -top-6 opacity-5 pointer-events-none">
                    <Clock size={120} />
                </div>
                
                <div className="flex items-center mb-5 gap-2 border-b border-white/5 pb-3">
                    <Clock size={16} className="text-violet-400" />
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-sans">
                        {t('forge.label.time_anchor')}
                    </label>
                    <Tooltip textKey="forge.tip.startTime" />
                </div>
                
                <div className="grid grid-cols-5 gap-2 relative z-10">
                    <div className="flex flex-col gap-1">
                        <span className="text-[8px] text-zinc-500 font-mono text-center uppercase tracking-wider">{t('forge.time.year')}</span>
                        <input 
                            type="number" 
                            className="bg-black/40 border border-white/10 rounded-lg text-center py-2 text-sm text-violet-200 font-mono focus:border-violet-500/50 outline-none shadow-inner"
                            placeholder="2150"
                            value={formData.scenario?.startTime?.year || ''}
                            onChange={(e) => setFormData({...formData, scenario: {...formData.scenario!, startTime: {...formData.scenario!.startTime!, year: e.target.value}}})}
                            maxLength={4}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[8px] text-zinc-500 font-mono text-center uppercase tracking-wider">{t('forge.time.month')}</span>
                        <input 
                            type="number" 
                            className="bg-black/40 border border-white/10 rounded-lg text-center py-2 text-sm text-violet-200 font-mono focus:border-violet-500/50 outline-none shadow-inner"
                            placeholder="01"
                            value={formData.scenario?.startTime?.month || ''}
                            onChange={(e) => setFormData({...formData, scenario: {...formData.scenario!, startTime: {...formData.scenario!.startTime!, month: e.target.value}}})}
                            maxLength={2}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[8px] text-zinc-500 font-mono text-center uppercase tracking-wider">{t('forge.time.day')}</span>
                        <input 
                            type="number" 
                            className="bg-black/40 border border-white/10 rounded-lg text-center py-2 text-sm text-violet-200 font-mono focus:border-violet-500/50 outline-none shadow-inner"
                            placeholder="01"
                            value={formData.scenario?.startTime?.day || ''}
                            onChange={(e) => setFormData({...formData, scenario: {...formData.scenario!, startTime: {...formData.scenario!.startTime!, day: e.target.value}}})}
                            maxLength={2}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[8px] text-zinc-500 font-mono text-center uppercase tracking-wider">{t('forge.time.hour')}</span>
                        <input 
                            type="number" 
                            className="bg-black/40 border border-white/10 rounded-lg text-center py-2 text-sm text-violet-200 font-mono focus:border-violet-500/50 outline-none shadow-inner"
                            placeholder="08"
                            value={formData.scenario?.startTime?.hour || ''}
                            onChange={(e) => setFormData({...formData, scenario: {...formData.scenario!, startTime: {...formData.scenario!.startTime!, hour: e.target.value}}})}
                            maxLength={2}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[8px] text-zinc-500 font-mono text-center uppercase tracking-wider">{t('forge.time.minute')}</span>
                        <input 
                            type="number" 
                            className="bg-black/40 border border-white/10 rounded-lg text-center py-2 text-sm text-violet-200 font-mono focus:border-violet-500/50 outline-none shadow-inner"
                            placeholder="00"
                            value={formData.scenario?.startTime?.minute || ''}
                            onChange={(e) => setFormData({...formData, scenario: {...formData.scenario!, startTime: {...formData.scenario!.startTime!, minute: e.target.value}}})}
                            maxLength={2}
                        />
                    </div>
                </div>
             </div>
         </div>
    );
};
