import React from 'react';
import { Maximize, MousePointerClick, AppWindow } from 'lucide-react';
import { AppSettings } from '../../../../types';

interface FullscreenSettingsProps {
    settings: AppSettings;
    setSettings: (s: AppSettings) => void;
}

export const FullscreenSettings: React.FC<FullscreenSettingsProps> = ({ settings, setSettings }) => {
    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <Maximize size={18} className="text-violet-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Fullscreen Options</h3>
            </div>

            <div className="space-y-4 bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
                <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center group-hover:bg-violet-600/20 transition-colors">
                            <MousePointerClick size={16} className="text-zinc-400 group-hover:text-violet-400 transition-colors" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Enable Tap to Fullscreen</p>
                            <p className="text-xs text-zinc-500">Tap anywhere continuously to enter/exit fullscreen</p>
                        </div>
                    </div>
                    <div className="relative">
                        <input
                            type="checkbox"
                            checked={settings.enableTapToFullscreen ?? true}
                            onChange={(e) => setSettings({ ...settings, enableTapToFullscreen: e.target.checked })}
                            className="sr-only"
                        />
                        <div className={`w-10 h-6 rounded-full transition-colors ${settings.enableTapToFullscreen !== false ? 'bg-violet-600' : 'bg-zinc-800 border border-white/10'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${settings.enableTapToFullscreen !== false ? 'translate-x-5' : 'translate-x-1'}`} />
                        </div>
                    </div>
                </label>

                <div className={`transition-all duration-300 overflow-hidden ${settings.enableTapToFullscreen !== false ? 'max-h-96 opacity-100 mt-4 pt-4 border-t border-white/5' : 'max-h-0 opacity-0'}`}>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Tap Count</span>
                                <span className="text-xs text-violet-400 font-mono">{settings.fullscreenTaps ?? 3} Clicks</span>
                            </div>
                            <input 
                                type="range" 
                                min="1" max="5" step="1"
                                value={settings.fullscreenTaps ?? 3}
                                onChange={(e) => setSettings({...settings, fullscreenTaps: parseInt(e.target.value)})}
                                className="w-full accent-violet-500"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Time Window</span>
                                <span className="text-xs text-violet-400 font-mono">{settings.fullscreenTime ?? 800} ms</span>
                            </div>
                            <input 
                                type="range" 
                                min="100" max="2000" step="100"
                                value={settings.fullscreenTime ?? 800}
                                onChange={(e) => setSettings({...settings, fullscreenTime: parseInt(e.target.value)})}
                                className="w-full accent-violet-500"
                            />
                            <p className="mt-2 text-[10px] text-zinc-500">Maximum delay between taps</p>
                        </div>

                        <label className="flex items-center justify-between cursor-pointer group mt-4 pt-4 border-t border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center group-hover:bg-violet-600/20 transition-colors">
                                    <AppWindow size={16} className="text-zinc-400 group-hover:text-violet-400 transition-colors" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">Borderless Screen</p>
                                    <p className="text-xs text-zinc-500">Remove outer margins and borders when in fullscreen</p>
                                </div>
                            </div>
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={settings.fullscreenBorderless ?? false}
                                    onChange={(e) => setSettings({ ...settings, fullscreenBorderless: e.target.checked })}
                                    className="sr-only"
                                />
                                <div className={`w-10 h-6 rounded-full transition-colors ${settings.fullscreenBorderless ? 'bg-violet-600' : 'bg-zinc-800 border border-white/10'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${settings.fullscreenBorderless ? 'translate-x-5' : 'translate-x-1'}`} />
                                </div>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};
