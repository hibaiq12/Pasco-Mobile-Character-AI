import React from 'react';
import { AppSettings } from '../../../../types';
import { MousePointer2, Smartphone, Monitor } from 'lucide-react';
import { CustomCursor } from '../../../../components/ChatInterface/CustomCursor';

interface CursorSettingsProps {
    settings: AppSettings;
    setSettings: (s: AppSettings) => void;
}

export const CursorSettings: React.FC<CursorSettingsProps> = ({ settings, setSettings }) => {
    
    const previewStates: ('idle' | 'default' | 'selecting' | 'clicking' | 'hovering')[] = ['default', 'idle', 'selecting', 'clicking'];
    const previewLabels = ['Idle (Base)', 'Breathing', 'Text/Block', 'Click/Press'];

    return (
        <div className="space-y-6">
            <div className="py-4 px-2 flex items-center gap-4">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-violet-900/50 to-transparent"></div>
                <span className="text-[9px] font-black text-violet-500 uppercase tracking-[0.3em] whitespace-nowrap italic">Cursor & UI Tracking</span>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-violet-900/50 to-transparent"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Mobile Gesture Control */}
                <div className="p-6 bg-zinc-950/30 rounded-3xl border border-white/5 flex flex-col justify-between group hover:border-violet-500/20 transition-all space-y-4">
                    <div>
                        <h3 className="font-bold text-zinc-200 mb-1 flex items-center gap-2 uppercase text-xs tracking-wider">
                            <Smartphone size={16} className="text-violet-500" />
                            Custom Gesture (Mobile)
                        </h3>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase opacity-60 leading-relaxed">
                            Enables multi-touch interactive particle trailing across the canvas.
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-auto">
                        <input 
                            type="checkbox" 
                            checked={settings.enableMobileGesture ?? true}
                            onChange={(e) => setSettings({...settings, enableMobileGesture: e.target.checked})}
                            className="sr-only peer"
                        />
                        <div className="w-14 h-8 bg-zinc-800 rounded-full peer peer-checked:bg-violet-600 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-full"></div>
                    </label>
                </div>

                {/* Desktop Cursor Shape */}
                <div className="p-6 bg-zinc-950/30 rounded-3xl border border-white/5 flex flex-col justify-between group hover:border-cyan-500/20 transition-all space-y-4">
                    <div>
                        <h3 className="font-bold text-zinc-200 mb-1 flex items-center gap-2 uppercase text-xs tracking-wider">
                            <Monitor size={16} className="text-cyan-500" />
                            Desktop Cursor Type
                        </h3>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase opacity-60 leading-relaxed">
                            Changes the global pointer style. Tactical uses crosshairs for interactions.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                        <button
                            onClick={() => setSettings({...settings, cursorType: 'default'})}
                            className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                (settings.cursorType || 'default') === 'default'
                                ? 'bg-zinc-100 text-black border-zinc-100'
                                : 'bg-zinc-900/50 text-zinc-600 border-zinc-800/50 hover:border-zinc-500'
                            }`}
                        >
                            Default
                        </button>
                        <button
                            onClick={() => setSettings({...settings, cursorType: 'tactical'})}
                            className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                settings.cursorType === 'tactical'
                                ? 'bg-cyan-600 text-white border-cyan-500'
                                : 'bg-zinc-900/50 text-zinc-600 border-zinc-800/50 hover:border-zinc-500'
                            }`}
                        >
                            Tactical
                        </button>
                    </div>
                </div>

                {/* Cursor Color Selection */}
                <div className="p-6 md:col-span-2 bg-zinc-950/30 rounded-3xl border border-white/5 flex flex-col group hover:border-white/10 transition-all overflow-hidden relative">
                    <div className="flex flex-col md:flex-row gap-6 md:items-start z-10 w-full relative">
                        {/* Selector Area */}
                        <div className="flex-shrink-0 w-full md:w-1/3 space-y-4">
                            <div>
                                <h3 className="font-bold text-zinc-200 mb-1 flex items-center gap-2 uppercase text-xs tracking-wider">
                                    <MousePointer2 size={16} className="text-white" />
                                    Terminal Accent Color
                                </h3>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase opacity-60 mb-4">
                                    Define the master hex for tracking components.
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 min-w-10 rounded-full overflow-hidden border-2 border-zinc-700 p-0.5 relative">
                                    <input 
                                        type="color" 
                                        value={settings.cursorColor || '#8400FF'} 
                                        onChange={(e) => setSettings({...settings, cursorColor: e.target.value})}
                                        className="absolute inset-[-10px] h-20 w-20 cursor-pointer"
                                    />
                                </div>
                                <input 
                                    type="text" 
                                    value={settings.cursorColor || '#8400FF'}
                                    onChange={(e) => setSettings({...settings, cursorColor: e.target.value})}
                                    className="bg-zinc-900 text-zinc-300 px-3 py-2 rounded-lg font-mono text-sm border border-zinc-800 w-28 uppercase focus:border-violet-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Preview Area */}
                        <div className="flex-1 w-full bg-black/60 rounded-2xl p-4 border border-white/5">
                            <h4 className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-3">Live Hologram Preview</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {previewStates.map((state, i) => (
                                    <div key={state} className="bg-zinc-900/50 rounded-xl h-24 border border-zinc-800/50 relative flex flex-col overflow-hidden items-center justify-end pb-2 group">
                                        {/* Cursor Instance rendered absolutely in center */}
                                        <CustomCursor 
                                            settings={settings} 
                                            isStaticPreview={true} 
                                            previewState={state} 
                                        />
                                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider relative z-10">{previewLabels[i]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                    {/* Background glow based on color */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-3xl" style={{ backgroundColor: settings.cursorColor || '#8400FF' }}></div>
                </div>

            </div>
        </div>
    );
};
