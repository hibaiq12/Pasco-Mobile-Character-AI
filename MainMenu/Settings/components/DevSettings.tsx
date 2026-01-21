
import React, { useState, useRef, useEffect } from 'react';
import { AppSettings } from '../../../types';
import { t } from '../../../services/translationService';
import { Terminal, ShieldAlert, CloudDownload, Timer, Key, Lock } from 'lucide-react';

interface DevSettingsProps {
    settings: AppSettings;
    setSettings: (s: AppSettings) => void;
}

export const DevSettings: React.FC<DevSettingsProps> = ({ settings, setSettings }) => {
    // PIN Modal State
    const [showPinModal, setShowPinModal] = useState(false);
    const [pin, setPin] = useState<string[]>(new Array(6).fill(''));
    const [error, setError] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    
    // Focus first input when modal opens
    useEffect(() => {
        if (showPinModal) {
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
        }
    }, [showPinModal]);

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

    // Developer Token Mode Handlers
    const isDevTokenMode = settings.defaultModel === 'openrouter-api' && 
                           settings.openRouterKey === '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' &&
                           settings.openRouterModel === 'z-ai/glm-4.5-air:free';

    const handleDevTokenToggle = (checked: boolean) => {
        if (checked) {
            setShowPinModal(true);
            setPin(new Array(6).fill(''));
            setError(false);
        } else {
            // Revert to safe default when unchecked
            setSettings({
                ...settings,
                defaultModel: 'gemini-2.5-flash'
            });
        }
    };

    const handlePinChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        
        const newPin = [...pin];
        newPin[index] = value.slice(-1);
        setPin(newPin);
        setError(false);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const confirmDevToken = () => {
        if (pin.join('') === '160825') {
            setSettings({
                ...settings,
                defaultModel: 'openrouter-api',
                openRouterKey: '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',
                openRouterModel: 'z-ai/glm-4.5-air:free',
                enablePreviewMode: false // Automatically disable Preview Mode (AI Offline)
            });
            setShowPinModal(false);
        } else {
            setError(true);
            setPin(new Array(6).fill(''));
            inputRefs.current[0]?.focus();
        }
    };

    return (
        <div className="space-y-8 animate-fade-in relative">
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

                {/* Mode Token Developer - Protected */}
                <div className="p-6 bg-zinc-950/30 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
                    <div className="max-w-[70%]">
                        <h3 className="font-medium text-zinc-200 mb-1 flex items-center gap-2">
                            <Key size={16} className="text-emerald-500" />
                            Mode Token Developer
                        </h3>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                            Automatically configures AI settings to use OpenRouter API with Developer Token (Free Tier: z-ai/glm-4.5-air).
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={isDevTokenMode}
                            onChange={(e) => handleDevTokenToggle(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-14 h-8 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600 shadow-inner"></div>
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

            {/* PIN MODAL FOR TOKEN DEVELOPER */}
            {showPinModal && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-zinc-900 border border-white/10 p-6 rounded-2xl shadow-2xl w-full max-w-sm relative">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                                <Lock size={24} className="text-emerald-500" />
                            </div>
                            <h3 className="text-lg font-bold text-white uppercase tracking-wider">Authorize Access</h3>
                            <p className="text-xs text-zinc-400 text-center -mt-2">Enter Developer PIN to activate Token Mode.</p>
                            
                            {/* 6-Digit Input Grid */}
                            <div className="flex justify-center gap-2 my-4">
                                {pin.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => { inputRefs.current[index] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handlePinChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className={`
                                            w-10 h-12 bg-black/50 border rounded-lg text-center text-xl font-bold font-mono text-white outline-none transition-all
                                            ${error ? 'border-red-500 text-red-500' : 'border-zinc-700 focus:border-emerald-500 focus:shadow-[0_0_10px_rgba(16,185,129,0.2)]'}
                                        `}
                                        autoComplete="off"
                                    />
                                ))}
                            </div>
                            
                            {error && <p className="text-red-500 text-xs font-bold animate-pulse -mt-2">INVALID PIN</p>}

                            <div className="flex gap-2 w-full mt-2">
                                <button onClick={() => setShowPinModal(false)} className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white font-bold text-xs uppercase transition-colors">Cancel</button>
                                <button onClick={confirmDevToken} className="flex-1 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 font-bold text-xs uppercase transition-colors shadow-lg shadow-emerald-900/20">Verify</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
