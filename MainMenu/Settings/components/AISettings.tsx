
import React, { useState } from 'react';
import { AppSettings } from '../../../types';
import { AVAILABLE_MODELS } from '../../../constants';
import { t } from '../../../services/translationService';
import { Cpu, Check, Link, Key, Loader2, CheckCircle, XCircle, Sliders, Zap } from 'lucide-react';

interface AISettingsProps {
    settings: AppSettings;
    setSettings: (s: AppSettings) => void;
}

export const AISettings: React.FC<AISettingsProps> = ({ settings, setSettings }) => {
    const [apiStatus, setApiStatus] = useState<{
        kobold: 'idle' | 'testing' | 'success' | 'error';
        openrouter: 'idle' | 'testing' | 'success' | 'error';
    }>({ kobold: 'idle', openrouter: 'idle' });

    const testKobold = async () => {
        if (!settings.koboldUrl) return;
        
        // Security Check: Mixed Content
        if (window.location.protocol === 'https:' && settings.koboldUrl.startsWith('http:')) {
             alert("Browser Security Error: Cannot access HTTP (Localhost) from an HTTPS website.\n\nTo fix this:\n1. Use a browser extension to 'Allow CORS/Mixed Content'.\n2. Or use a cloud proxy (e.g. TryCloudflare) for your local Kobold.");
             setApiStatus(prev => ({ ...prev, kobold: 'error' }));
             return;
        }
    
        setApiStatus(prev => ({ ...prev, kobold: 'testing' }));
        try {
            // Normalize URL: remove trailing slash
            const baseUrl = settings.koboldUrl.replace(/\/$/, '');
            
            // Try Standard KoboldCPP/United Endpoint first
            try {
                const response = await fetch(`${baseUrl}/v1/model`, { method: 'GET' });
                if (response.ok) {
                    setApiStatus(prev => ({ ...prev, kobold: 'success' }));
                    setTimeout(() => setApiStatus(prev => ({ ...prev, kobold: 'idle' })), 3000);
                    return;
                }
            } catch (e) { /* Continue to fallback */ }
    
            // Fallback: Try legacy endpoint or just version
            const response2 = await fetch(`${baseUrl}/extra/version`, { method: 'GET' });
            if (response2.ok) {
                 setApiStatus(prev => ({ ...prev, kobold: 'success' }));
            } else {
                 // Last ditch: try just the base url if it returns JSON
                 const response3 = await fetch(`${baseUrl}/api/v1/model`, { method: 'GET' });
                 if (response3.ok) {
                     setApiStatus(prev => ({ ...prev, kobold: 'success' }));
                 } else {
                     throw new Error("Endpoint unreachable");
                 }
            }
        } catch (e) {
            console.error(e);
            setApiStatus(prev => ({ ...prev, kobold: 'error' }));
        }
        setTimeout(() => setApiStatus(prev => ({ ...prev, kobold: 'idle' })), 3000);
    };
    
    const testOpenRouter = async () => {
        if (!settings.openRouterKey) return;
        setApiStatus(prev => ({ ...prev, openrouter: 'testing' }));
        try {
            const response = await fetch("https://openrouter.ai/api/v1/auth/key", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${settings.openRouterKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": window.location.origin, // Required by OpenRouter
                    "X-Title": "Pasco App" // Required by OpenRouter
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                // Ensure we actually got valid data back
                if (data && data.data) {
                    setApiStatus(prev => ({ ...prev, openrouter: 'success' }));
                } else {
                    throw new Error("Invalid response data");
                }
            } else {
                throw new Error("Invalid Key or Network Error");
            }
        } catch (e) {
            console.error("OpenRouter Test Error:", e);
            setApiStatus(prev => ({ ...prev, openrouter: 'error' }));
        }
        setTimeout(() => setApiStatus(prev => ({ ...prev, openrouter: 'idle' })), 3000);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h2 className="text-2xl font-semibold text-white mb-2">{t('set.global.title')}</h2>
                <p className="text-zinc-500 text-sm">{t('set.global.desc')}</p>
            </div>

            <div className="space-y-8">
                <div>
                    <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-4">{t('set.model.title')}</label>
                    <div className="grid grid-cols-1 gap-4">
                        {AVAILABLE_MODELS.map(model => (
                            <div 
                                key={model.id}
                                onClick={() => setSettings({...settings, defaultModel: model.id})}
                                className={`
                                    cursor-pointer relative p-5 rounded-2xl border transition-all duration-300 flex flex-col
                                    ${settings.defaultModel === model.id 
                                        ? 'bg-violet-600/10 border-violet-500/50 shadow-[0_0_20px_rgba(124,58,237,0.1)]' 
                                        : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900'}
                                `}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`mt-1 p-2 rounded-full ${settings.defaultModel === model.id ? 'bg-violet-500 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                                        <Cpu size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`font-bold ${settings.defaultModel === model.id ? 'text-white' : 'text-zinc-300'}`}>{model.name}</span>
                                            {settings.defaultModel === model.id && <Check size={16} className="text-violet-400" />}
                                        </div>
                                        <p className="text-xs text-zinc-500 leading-relaxed">{model.desc}</p>
                                    </div>
                                </div>

                                {/* Config Fields for External APIs */}
                                {settings.defaultModel === 'kobold-api' && model.id === 'kobold-api' && (
                                     <div className="mt-4 pt-4 border-t border-white/5 w-full animate-fade-in" onClick={e => e.stopPropagation()}>
                                        <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1.5 block">API Endpoint URL</label>
                                        <div className="flex gap-2">
                                            <div className="flex-1 flex items-center bg-black/20 border border-zinc-700 rounded-lg px-3 py-2 focus-within:border-violet-500/50 transition-colors">
                                                <Link size={14} className="text-zinc-500 mr-2" />
                                                <input 
                                                    type="text" 
                                                    value={settings.koboldUrl}
                                                    onChange={(e) => setSettings({...settings, koboldUrl: e.target.value})}
                                                    placeholder="http://localhost:5000/api"
                                                    className="bg-transparent text-sm text-zinc-300 outline-none w-full placeholder-zinc-700 font-mono"
                                                />
                                            </div>
                                            <button 
                                                onClick={testKobold}
                                                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-bold text-zinc-300 transition-colors border border-zinc-700 flex items-center gap-2 min-w-[80px] justify-center"
                                                title="Test Connection"
                                            >
                                                {apiStatus.kobold === 'testing' && <Loader2 size={14} className="animate-spin" />}
                                                {apiStatus.kobold === 'success' && <CheckCircle size={14} className="text-green-500" />}
                                                {apiStatus.kobold === 'error' && <XCircle size={14} className="text-red-500" />}
                                                {apiStatus.kobold === 'idle' && <span>Test</span>}
                                            </button>
                                        </div>
                                     </div>
                                )}
                                {settings.defaultModel === 'openrouter-api' && model.id === 'openrouter-api' && (
                                     <div className="mt-4 pt-4 border-t border-white/5 w-full animate-fade-in" onClick={e => e.stopPropagation()}>
                                        <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1.5 block">OpenRouter Key</label>
                                        <div className="flex gap-2">
                                            <div className="flex-1 flex items-center bg-black/20 border border-zinc-700 rounded-lg px-3 py-2 focus-within:border-violet-500/50 transition-colors">
                                                <Key size={14} className="text-zinc-500 mr-2" />
                                                <input 
                                                    type="password" 
                                                    value={settings.openRouterKey}
                                                    onChange={(e) => setSettings({...settings, openRouterKey: e.target.value})}
                                                    placeholder="sk-or-..."
                                                    className="bg-transparent text-sm text-zinc-300 outline-none w-full placeholder-zinc-700 font-mono"
                                                />
                                            </div>
                                            <button 
                                                onClick={testOpenRouter}
                                                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-bold text-zinc-300 transition-colors border border-zinc-700 flex items-center gap-2 min-w-[80px] justify-center"
                                                title="Test Connection"
                                            >
                                                {apiStatus.openrouter === 'testing' && <Loader2 size={14} className="animate-spin" />}
                                                {apiStatus.openrouter === 'success' && <CheckCircle size={14} className="text-green-500" />}
                                                {apiStatus.openrouter === 'error' && <XCircle size={14} className="text-red-500" />}
                                                {apiStatus.openrouter === 'idle' && <span>Test</span>}
                                            </button>
                                        </div>
                                     </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-zinc-950/30 p-6 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center mb-6">
                        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">{t('set.temp.title')}</label>
                        <span className="bg-zinc-900 px-3 py-1 rounded-md text-violet-300 font-mono text-sm">{settings.defaultTemperature.toFixed(1)}</span>
                    </div>
                    
                    <div className="relative h-2 bg-zinc-800 rounded-full mb-2">
                        <div 
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 rounded-full" 
                            style={{width: `${settings.defaultTemperature * 100}%`}}
                        />
                        <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.1"
                            value={settings.defaultTemperature}
                            onChange={(e) => setSettings({...settings, defaultTemperature: parseFloat(e.target.value)})}
                            className="absolute top-[-8px] left-0 w-full h-6 opacity-0 cursor-pointer"
                        />
                        <div 
                            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg pointer-events-none transition-all"
                            style={{left: `calc(${settings.defaultTemperature * 100}% - 8px)`}}
                        />
                    </div>

                    <div className="flex justify-between text-[10px] text-zinc-600 uppercase font-medium mt-3">
                        <span>Rigid / Logical</span>
                        <span>Balanced</span>
                        <span>Creative / Chaotic</span>
                    </div>
                </div>
                
                {/* Token Configuration */}
                <div className="bg-zinc-950/30 p-6 rounded-2xl border border-white/5">
                     <div className="flex items-center gap-3 mb-6">
                         <div className="p-2 bg-zinc-900 rounded-lg text-zinc-400">
                             <Sliders size={18} />
                         </div>
                         <div>
                             <h3 className="font-bold text-zinc-200 text-sm">{t('set.token.title')}</h3>
                             <p className="text-xs text-zinc-500">Control the maximum length of the AI's response.</p>
                         </div>
                     </div>

                     <div className="grid grid-cols-2 gap-3 mb-6">
                         <button 
                             onClick={() => setSettings({...settings, tokenMode: 'auto'})}
                             className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${settings.tokenMode === 'auto' ? 'bg-violet-600/20 border-violet-500 text-violet-200' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800'}`}
                         >
                             <Zap size={20} className="mb-2" />
                             <span className="text-xs font-bold uppercase">{t('set.token.auto')}</span>
                         </button>
                         <button 
                             onClick={() => setSettings({...settings, tokenMode: 'manual'})}
                             className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${settings.tokenMode === 'manual' ? 'bg-violet-600/20 border-violet-500 text-violet-200' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800'}`}
                         >
                             <Sliders size={20} className="mb-2" />
                             <span className="text-xs font-bold uppercase">{t('set.token.manual')}</span>
                         </button>
                     </div>

                     {settings.tokenMode === 'manual' ? (
                         <div className="animate-fade-in">
                             <div className="flex justify-between items-center mb-4">
                                 <label className="text-xs font-medium text-zinc-400 uppercase">Max Tokens</label>
                                 <span className="bg-zinc-900 px-3 py-1 rounded-md text-violet-300 font-mono text-sm">{settings.maxOutputTokens}</span>
                             </div>
                             <input 
                                 type="range" 
                                 min="100" 
                                 max="8192" 
                                 step="100"
                                 value={settings.maxOutputTokens || 2048}
                                 onChange={(e) => setSettings({...settings, maxOutputTokens: parseInt(e.target.value)})}
                                 className="w-full h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-violet-600"
                             />
                             <p className="text-[10px] text-zinc-500 mt-3 text-center">
                                 Setting a hard limit will cut off the AI if it exceeds this number.
                             </p>
                         </div>
                     ) : (
                         <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-lg animate-fade-in">
                             <p className="text-xs text-violet-300 text-center leading-relaxed">
                                 <strong>Auto Mode Active:</strong> The AI will dynamically adjust its response length based on the context of your chat. Short messages will receive concise, natural replies.
                             </p>
                         </div>
                     )}
                </div>

            </div>
        </div>
    );
};
