
import React, { useState } from 'react';
import { AppSettings } from '../../../../types';
import { ChevronDown, ChevronUp, Settings } from 'lucide-react';

interface PerformanceSettingsProps {
    settings: AppSettings;
    setSettings: (s: AppSettings) => void;
}

export const PerformanceSettings: React.FC<PerformanceSettingsProps> = ({ settings, setSettings }) => {
    const [isPerformanceExpand, setIsPerformanceExpand] = useState(false);

    return (
        <div className="space-y-4 animate-fade-in relative">
            <div className={`p-6 bg-zinc-950/30 rounded-3xl border transition-all ${isPerformanceExpand ? 'border-zinc-500/30' : 'border-white/5 hover:border-zinc-500/20'}`}>
                <button 
                    onClick={() => setIsPerformanceExpand(!isPerformanceExpand)}
                    className="w-full flex items-center justify-between group"
                >
                    <div className="flex items-center gap-2">
                        <Settings size={16} className="text-zinc-500 group-hover:text-zinc-300" />
                        <h3 className="font-bold text-zinc-200 uppercase text-xs tracking-wider">Performance Settings</h3>
                    </div>
                    {isPerformanceExpand ? <ChevronUp size={16} className="text-zinc-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
                </button>

                {isPerformanceExpand && (
                    <div className="mt-6 pt-6 border-t border-white/5 space-y-4 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-[11px] font-bold text-zinc-300 uppercase tracking-wide">Show FPS Counter</h4>
                                <p className="text-[10px] text-zinc-500 uppercase mt-0.5">Displays a real-time frame rate monitor.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={settings.showFps || false}
                                    onChange={(e) => setSettings({...settings, showFps: e.target.checked})}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-zinc-800 rounded-full peer peer-checked:bg-zinc-100 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:bg-black"></div>
                            </label>
                        </div>

                        {settings.showFps && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider ml-1">FPS Position</h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: 'top-left', label: 'Top Left' },
                                            { id: 'top-center', label: 'Top Mid' },
                                            { id: 'top-right', label: 'Top Right' },
                                            { id: 'bottom-left', label: 'Down Left' },
                                            { id: 'bottom-center', label: 'Down Mid' },
                                            { id: 'bottom-right', label: 'Down Right' }
                                        ].map(pos => (
                                            <button
                                                key={pos.id}
                                                onClick={() => setSettings({...settings, fpsPosition: pos.id as AppSettings['fpsPosition']})}
                                                className={`py-3 px-1 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all border ${
                                                    (settings.fpsPosition || 'top-right') === pos.id 
                                                    ? 'bg-zinc-100 text-black border-zinc-100 shadow-[0_0_15px_rgba(255,255,255,0.1)]' 
                                                    : 'bg-zinc-900 text-zinc-600 border-zinc-800/50 hover:border-zinc-600 hover:text-zinc-400'
                                                }`}
                                            >
                                                {pos.label}
                                            </button>
                                        ))}
                                    </div>
                                    <button 
                                        onClick={() => setSettings({...settings, fpsPosition: 'discord'})}
                                        className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                            settings.fpsPosition === 'discord'
                                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)]'
                                            : 'bg-zinc-900 text-indigo-400/50 border-zinc-800/50 hover:border-indigo-500/30 hover:text-indigo-400'
                                        }`}
                                    >
                                        Discord FPS
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider ml-1">FPS Size</h4>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[
                                            { size: 0, label: '10%' },
                                            { size: 1, label: '25%' },
                                            { size: 2, label: '50%' },
                                            { size: 3, label: '100%' }
                                        ].map(opt => (
                                            <button
                                                key={opt.size}
                                                onClick={() => setSettings({...settings, fpsSize: opt.size})}
                                                className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                                                    (settings.fpsSize || 0) === opt.size
                                                    ? 'bg-zinc-100 text-black border-zinc-100'
                                                    : 'bg-zinc-900 text-zinc-600 border-zinc-800/50 hover:border-zinc-500'
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Divider for Core Performance Configs */}
                        <div className="py-4 px-2 flex items-center gap-4">
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>
                            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] whitespace-nowrap italic">Core Config</span>
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-[11px] font-bold text-zinc-300 uppercase tracking-wide">Efek Animasi NeuroSense</h4>
                                    <p className="text-[10px] text-zinc-500 uppercase mt-0.5">Toggle complex shader/visual effects for NeuroSense.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={!settings.disableNeuroAnimations}
                                        onChange={(e) => setSettings({...settings, disableNeuroAnimations: !e.target.checked})}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-zinc-800 rounded-full peer peer-checked:bg-violet-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:bg-white"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-[11px] font-bold text-zinc-300 uppercase tracking-wide">Animasi Dipercepat</h4>
                                    <p className="text-[10px] text-zinc-500 uppercase mt-0.5">Reduces motion duration by up to 50% for snappier UI.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={settings.fastAnimations || false}
                                        onChange={(e) => setSettings({...settings, fastAnimations: e.target.checked})}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-zinc-800 rounded-full peer peer-checked:bg-emerald-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:bg-white"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-[11px] font-bold text-zinc-300 uppercase tracking-wide">Matikan Efek Blur</h4>
                                    <p className="text-[10px] text-zinc-500 uppercase mt-0.5">Disables heavy backdrop-blur effects (huge perf boost on low-end).</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={settings.disableBlur || false}
                                        onChange={(e) => setSettings({...settings, disableBlur: e.target.checked})}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-zinc-800 rounded-full peer peer-checked:bg-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:bg-black"></div>
                                </label>
                            </div>
                        </div>

                        {/* Divider for Fullscreen Configs */}
                        <div className="py-4 px-2 flex items-center gap-4">
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>
                            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] whitespace-nowrap italic">Fullscreen Logic</span>
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-[11px] font-bold text-zinc-300 uppercase tracking-wide">Click Count Limit</h4>
                                    <span className="text-[10px] font-mono text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded">{settings.fullscreenTaps || 2} Clicks</span>
                                </div>
                                <p className="text-[10px] text-zinc-500 uppercase">Clicks required to trigger fullscreen.</p>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    step="1"
                                    value={settings.fullscreenTaps || 2}
                                    onChange={(e) => setSettings({...settings, fullscreenTaps: parseInt(e.target.value)})}
                                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-[11px] font-bold text-zinc-300 uppercase tracking-wide">Time Interval</h4>
                                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">{settings.fullscreenTime || 500} ms</span>
                                </div>
                                <p className="text-[10px] text-zinc-500 uppercase">Maximum time window for the clicks.</p>
                                <input
                                    type="range"
                                    min="100"
                                    max="1000"
                                    step="100"
                                    value={settings.fullscreenTime || 500}
                                    onChange={(e) => setSettings({...settings, fullscreenTime: parseInt(e.target.value)})}
                                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
