
import React, { useState } from 'react';
import { AppSettings } from '../../../types';
import { Terminal, ShieldAlert, Key, AlertTriangle, MonitorPlay } from 'lucide-react';
import { t } from '../../../services/translationService';
import { saveSettings } from '../../../services/storageService';
import { PreviewPopup } from './preview/previewpopup';

interface DevSettingsProps {
    settings: AppSettings;
    setSettings: (s: AppSettings) => void;
    onNavigateToPreview?: () => void;
}

export const DevSettings: React.FC<DevSettingsProps> = ({ settings, setSettings, onNavigateToPreview }) => {
    const [showPopup, setShowPopup] = useState(false);
    const [popupError, setPopupError] = useState(false);

    const handleOverrideToggle = (key: 'devForceMaintenance' | 'devForceUpdate' | 'devForceCountdown', value: boolean) => {
        const newSettings = { ...settings };
        if (value) {
            newSettings.devForceMaintenance = false;
            newSettings.devForceUpdate = false;
            newSettings.devForceCountdown = false;
        }
        newSettings[key] = value;
        setSettings(newSettings);
    };

    const isDevTokenMode = settings.defaultModel === 'openrouter-api' && 
                           settings.openRouterModel === 'mistralai/devstral-2512:free';

    const handleVerify = (pin: string) => {
        if (pin === '16825') {
            setPopupError(false);
            setShowPopup(false);
            
            const newSettings = { ...settings, enablePreviewMode: true };
            setSettings(newSettings);
            saveSettings(newSettings);
            
            if (onNavigateToPreview) {
                onNavigateToPreview();
            }
        } else {
            setPopupError(true);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in relative pb-10">
            <div className="py-4 px-2 flex items-center gap-4">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-red-900/50 to-transparent"></div>
                <span className="text-[9px] font-black text-red-500 uppercase tracking-[0.3em] whitespace-nowrap italic">Developer Console</span>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-red-900/50 to-transparent"></div>
            </div>

            <div className="space-y-4">
                {/* Fast Disclaimer */}
                <div className="p-6 bg-zinc-950/30 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-red-500/20 transition-all">
                    <div className="max-w-[70%]">
                        <h3 className="font-bold text-zinc-200 mb-1 flex items-center gap-2 uppercase text-xs tracking-wider">
                            <AlertTriangle size={16} className="text-red-500" />
                            Fast Disclaimer
                        </h3>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase opacity-60">Bypasses the mandatory 5-second countdown on Realism Hazard screens.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={settings.disableDisclaimerCountdown || false} onChange={(e) => setSettings({...settings, disableDisclaimerCountdown: e.target.checked})} className="sr-only peer" />
                        <div className="w-14 h-8 bg-zinc-800 rounded-full peer peer-checked:bg-red-600 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-full"></div>
                    </label>
                </div>

                {/* Preview Mode Toggle */}
                <div className="p-6 bg-zinc-950/30 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-amber-500/20 transition-all">
                    <div className="max-w-[70%]">
                        <h3 className="font-bold text-zinc-200 mb-1 flex items-center gap-2 uppercase text-xs tracking-wider">
                            <Terminal size={16} className="text-amber-500" />
                            {t('set.dev.preview')}
                        </h3>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase opacity-60">Disables the AI Neural Engine connection. (Offline Mode)</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={settings.enablePreviewMode} onChange={(e) => setSettings({...settings, enablePreviewMode: e.target.checked})} className="sr-only peer" />
                        <div className="w-14 h-8 bg-zinc-800 rounded-full peer peer-checked:bg-amber-600 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-full"></div>
                    </label>
                </div>

                {/* API Developer Key */}
                <div className="p-6 bg-zinc-950/30 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-emerald-500/20 transition-all">
                    <div className="max-w-[70%]">
                        <h3 className="font-bold text-zinc-200 mb-1 flex items-center gap-2 uppercase text-xs tracking-wider">
                            <Key size={16} className="text-emerald-500" />
                            API Developer Key
                        </h3>
                        <p className="text-[10px] text-zinc-500 leading-relaxed uppercase font-bold opacity-60">Automatically configures AI settings for OpenRouter Devstral.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={isDevTokenMode} onChange={() => {}} className="sr-only peer" />
                        <div className="w-14 h-8 bg-zinc-800 rounded-full peer peer-checked:bg-emerald-600 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-full"></div>
                    </label>
                </div>

                {/* Access Developer Preview */}
                <div className="p-6 bg-blue-950/20 rounded-3xl border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between group hover:bg-blue-950/30 transition-all gap-4">
                    <div className="flex-1">
                        <h3 className="font-black text-blue-100 mb-1 flex items-center gap-2 uppercase tracking-widest text-sm italic">
                            <MonitorPlay size={20} className="text-blue-400" />
                            Access Developer Preview
                        </h3>
                        <p className="text-[10px] text-blue-400/60 leading-relaxed font-bold uppercase">Bypass all functional gates to test core modules directly.</p>
                    </div>
                    <button onClick={() => setShowPopup(true)} className="px-8 py-3 bg-[#1e40af] hover:bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 active:scale-95 transition-all w-full sm:w-auto">Launch</button>
                </div>

                <div className="py-4 px-2 flex items-center gap-4">
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>
                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] whitespace-nowrap italic">System Overrides</span>
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>
                </div>

                <div className="p-6 bg-zinc-950/30 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-red-500/20 transition-all">
                    <div className="max-w-[70%]">
                        <h3 className="font-bold text-zinc-200 mb-1 flex items-center gap-2 uppercase text-xs tracking-wider">
                            <ShieldAlert size={16} className="text-red-500" />
                            Maintenance Mode
                        </h3>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={settings.devForceMaintenance || false} onChange={(e) => handleOverrideToggle('devForceMaintenance', e.target.checked)} className="sr-only peer" />
                        <div className="w-14 h-8 bg-zinc-800 rounded-full peer peer-checked:bg-red-600 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-full"></div>
                    </label>
                </div>
            </div>

            <PreviewPopup isOpen={showPopup} onClose={() => setShowPopup(false)} onVerify={handleVerify} error={popupError} />
        </div>
    );
};
