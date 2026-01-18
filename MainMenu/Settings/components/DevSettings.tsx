import React from 'react';
import { AppSettings } from '../../../types';
import { t } from '../../../services/translationService';
import { Terminal, ShieldAlert, CloudDownload, Timer } from 'lucide-react';

interface DevSettingsProps {
    settings: AppSettings;
    setSettings: (s: AppSettings) => void;
}

export const DevSettings: React.FC<DevSettingsProps> = ({ settings, setSettings }) => {
    
    // Helper to handle mutually exclusive system state overrides
    const handleOverrideToggle = (key: 'devForceMaintenance' | 'devForceUpdate' | 'devForceCountdown', value: boolean) => {
        const newSettings = { ...settings };
        
        // Reset all overrides first if the new value is true
        if (value) {
            newSettings.devForceMaintenance = false;
            newSettings.devForceUpdate = false;
            newSettings.devForceCountdown = false;
        }
        
        // Set the specific key
        newSettings[key] = value;
        
        setSettings(newSettings);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h2 className="text-2xl font-semibold text-white mb-2">{t('set.dev.title')}</h2>
                <p className="text-zinc-500 text-sm">{t('set.dev.desc')}</p>
            </div>

            <div className="space-y-4">
                {/* Preview Mode - Independent */}
                <div className="p-6 bg-zinc-950/30 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
                    <div className="max-w-[70%]">
                        <h3 className="font-medium text-zinc-200 mb-1 flex items-center gap-2">
                            <Terminal size={16} className="text-amber-500" />
                            {t('set.dev.preview')}
                        </h3>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                            Disables the AI Neural Engine connection. Chat responses will be generated algorithmically to save tokens and debug the UI.
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={settings.enablePreviewMode}
                            onChange={(e) => setSettings({...settings, enablePreviewMode: e.target.checked})}
                            className="sr-only peer"
                        />
                        <div className="w-14 h-8 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-amber-600 shadow-inner"></div>
                    </label>
                </div>

                {/* VISUAL SEPARATOR */}
                <div className="py-4 px-2 flex items-center gap-4">
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>
                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] whitespace-nowrap">System Overrides</span>
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>
                </div>

                {/* Force Maintenance Mode */}
                <div className="p-6 bg-zinc-950/30 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
                    <div className="max-w-[70%]">
                        <h3 className="font-medium text-zinc-200 mb-1 flex items-center gap-2">
                            <ShieldAlert size={16} className="text-red-500" />
                            Maintenance Mode
                        </h3>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                            Forces the application into the Midnight Maintenance screen. Use the developer PIN to bypass.
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={settings.devForceMaintenance || false}
                            onChange={(e) => handleOverrideToggle('devForceMaintenance', e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-14 h-8 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600 shadow-inner"></div>
                    </label>
                </div>

                {/* Force Update Mode */}
                <div className="p-6 bg-zinc-950/30 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
                    <div className="max-w-[70%]">
                        <h3 className="font-medium text-zinc-200 mb-1 flex items-center gap-2">
                            <CloudDownload size={16} className="text-blue-500" />
                            Update Screen
                        </h3>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                            Triggers the System Update simulation screen with progress bar.
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={settings.devForceUpdate || false}
                            onChange={(e) => handleOverrideToggle('devForceUpdate', e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-14 h-8 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
                    </label>
                </div>

                {/* Force Countdown Mode */}
                <div className="p-6 bg-zinc-950/30 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
                    <div className="max-w-[70%]">
                        <h3 className="font-medium text-zinc-200 mb-1 flex items-center gap-2">
                            <Timer size={16} className="text-purple-500" />
                            Celebration Countdown
                        </h3>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                            Shows the festive countdown screen (Scheduled for 06:00 - 10:35 WIB).
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={settings.devForceCountdown || false}
                            onChange={(e) => handleOverrideToggle('devForceCountdown', e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-14 h-8 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600 shadow-inner"></div>
                    </label>
                </div>
            </div>
        </div>
    );
};