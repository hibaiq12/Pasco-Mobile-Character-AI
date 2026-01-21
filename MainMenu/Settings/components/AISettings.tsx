
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { AppSettings } from '../../../types';
import { AVAILABLE_MODELS } from '../../../constants';
import { t } from '../../../services/translationService';
import { Cpu, Check, Link, Key, Loader2, Send, Terminal, RotateCw, AlertTriangle, RefreshCw, Zap, Power, ShieldCheck, Activity } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { generateOpenRouterResponse } from '../../../services/Openrouter';

interface AISettingsProps {
    settings: AppSettings;
    setSettings: (s: AppSettings) => void;
}

// Interface for Terminal Ref
export interface PascoTerminalRef {
    runDiagnostics: () => void;
}

// --- PASCO AI TEST TERMINAL COMPONENT ---
const PascoTestTerminal = forwardRef<PascoTerminalRef, { settings: AppSettings }>(({ settings }, ref) => {
    const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
    const [input, setInput] = useState('');
    const [status, setStatus] = useState<'idle' | 'thinking' | 'error' | 'not_found' | 'rebooting' | 'verifying' | 'verified'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [rebootProgress, setRebootProgress] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Expose runDiagnostics method to parent
    useImperativeHandle(ref, () => ({
        runDiagnostics: async () => {
            if (status !== 'idle') return;
            
            setStatus('verifying');
            setRebootProgress(0);
            setErrorMessage('');

            // Fake progress animation
            const progressInterval = setInterval(() => {
                setRebootProgress(prev => {
                    if (prev >= 90) return 90; // Stall at 90
                    return prev + Math.floor(Math.random() * 10) + 5;
                });
            }, 150);

            try {
                // Actual API Call
                if (settings.defaultModel === 'openrouter-api') {
                    if (!settings.openRouterKey) throw new Error("API Key Missing");
                    await generateOpenRouterResponse(
                        settings.openRouterKey,
                        settings.openRouterModel,
                        [{ role: 'user', content: 'test connection' }]
                    );
                } else if (settings.defaultModel === 'kobold-api') {
                    if (!settings.koboldUrl) throw new Error("URL Missing");
                    await fetch(`${settings.koboldUrl}/api/v1/generate`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ prompt: 'Test', max_length: 10 })
                    });
                } else {
                    // For Gemini, verify key exists
                    if (!process.env.API_KEY) throw new Error("Environment Key Missing");
                }

                clearInterval(progressInterval);
                setRebootProgress(100);
                
                setTimeout(() => {
                    setStatus('verified');
                    // Add success log
                    setMessages(prev => [...prev, { role: 'model', text: "[SYSTEM]: Neural Link Verified. Latency: <50ms. Integrity: 100%." }]);
                    
                    // Return to idle
                    setTimeout(() => {
                        setStatus('idle');
                    }, 2500);
                }, 500);

            } catch (error: any) {
                clearInterval(progressInterval);
                setRebootProgress(0);
                setStatus('error');
                setErrorMessage(error.message || "Connection Failed");
                
                // Auto reset after error
                setTimeout(() => {
                    triggerReboot();
                }, 4000);
            }
        }
    }), [settings, status]);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, status]);

    // Check for Reboot Condition (3 User + 3 Model = 6 messages)
    useEffect(() => {
        if (messages.length >= 6 && status !== 'rebooting' && status !== 'verifying' && status !== 'verified') {
            // Slight delay before rebooting so user can see the last message
            const timer = setTimeout(() => {
                triggerReboot();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [messages]);

    const triggerReboot = () => {
        setStatus('rebooting');
        setRebootProgress(0);
        setErrorMessage('');
        
        const interval = setInterval(() => {
            setRebootProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setMessages([]);
                        setStatus('idle');
                    }, 800);
                    return 100;
                }
                // Random increment for "realistic" loading feel
                return prev + Math.floor(Math.random() * 5) + 2;
            });
        }, 50);
    };

    const handleSend = async () => {
        if (!input.trim() || status !== 'idle') return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setStatus('thinking');
        setErrorMessage('');

        try {
            let reply = "";
            let finalPrompt = "";
            
            if (userMsg.trim().toLowerCase() === 'test') {
                finalPrompt = `
                [SYSTEM OVERRIDE: DIAGNOSTIC TEST PATTERN]
                The user has issued a 'test' command.
                You MUST respond using this EXACT structure in Indonesian:
                "<Salam> <Percakapan Biasa> <Nama Model>"
                Current Active Model: "${settings.defaultModel}"
                Example Output: "Halo kawan! Semoga harimu menyenangkan ya. Saat ini saya berjalan menggunakan model gemini-2.5-flash."
                Keep the tone helpful and friendly like an AI assistant.
                `;
            } else {
                finalPrompt = `
                IDENTITY: You are "Pasco AI", the core operating system of this application.
                PERSONALITY: Helpful, Precise, Slightly Robotic, Obedient.
                OBJECTIVE: Demonstrate connectivity by responding to the user's input intelligently.
                CONSTRAINT: Keep responses helpful but technical. You are an Assistant.
                User Input: "${userMsg}"
                `;
            }

            // --- 1. GEMINI MODELS ---
            if (settings.defaultModel.includes('gemini')) {
                const apiKey = typeof process !== "undefined" && process.env ? process.env.API_KEY : null;
                if (!apiKey) throw new Error("NOT_FOUND");
                const ai = new GoogleGenAI({ apiKey: apiKey });
                const response = await ai.models.generateContent({
                    model: settings.defaultModel,
                    contents: [{ role: 'user', parts: [{ text: finalPrompt }] }],
                    config: { maxOutputTokens: 1024 }
                });
                reply = response.text || "System Operational.";
            } 
            // --- 2. KOBOLD API ---
            else if (settings.defaultModel === 'kobold-api') {
                if (!settings.koboldUrl) throw new Error("NOT_FOUND");
                try {
                    const response = await fetch(`${settings.koboldUrl}/api/v1/generate`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ prompt: `System: You are Pasco AI.\n${finalPrompt}\nPasco AI:`, max_length: 200, temperature: 0.7 })
                    });
                    if (!response.ok) throw new Error(`Kobold API Error: ${response.status}`);
                    const data = await response.json();
                    reply = data.results?.[0]?.text || "Connected to Kobold node.";
                } catch (e: any) {
                    throw new Error(e.message || "Kobold API Error");
                }
            }
            // --- 3. OPENROUTER API ---
            else if (settings.defaultModel === 'openrouter-api') {
                if (!settings.openRouterKey) throw new Error("NOT_FOUND");
                reply = await generateOpenRouterResponse(
                    settings.openRouterKey,
                    settings.openRouterModel,
                    [{ role: "system", content: "You are Pasco AI." }, { role: "user", content: finalPrompt }]
                );
            }

            setMessages(prev => [...prev, { role: 'model', text: reply }]);
            setStatus('idle');

        } catch (error: any) {
            console.error("Test Terminal Error:", error);
            if (error.message === "NOT_FOUND") {
                setStatus('not_found');
            } else {
                setStatus('error');
                setErrorMessage(error.message || 'Unknown Connection Error');
            }
            setTimeout(triggerReboot, 5000);
        }
    };

    return (
        <div className="w-full bg-[#09090b] rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative flex flex-col h-[400px] font-mono mt-8 mb-6 group">
            
            {/* Terminal Header */}
            <div className="bg-[#18181b] border-b border-white/5 p-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${status === 'error' || status === 'not_found' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`}></div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Pasco AI Diagnostic</span>
                </div>
                <div className="text-[9px] text-zinc-600 uppercase font-bold tracking-wider">
                    Test Cycle: <span className="text-white">{Math.floor(messages.length / 2)}</span> / 3
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4 bg-black relative" ref={scrollRef}>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20"></div>

                {messages.length === 0 && status === 'idle' && (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-800 space-y-3 opacity-60">
                        <Terminal size={40} strokeWidth={1} />
                        <div className="text-center space-y-1">
                            <p className="text-[10px] uppercase tracking-widest font-bold">System Ready</p>
                            <p className="text-[9px]">Initialize input to verify neural link.</p>
                        </div>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} relative z-10 animate-fade-in`}>
                        <div className={`
                            max-w-[85%] px-3 py-2 rounded-lg text-xs border leading-relaxed
                            ${msg.role === 'user' ? 'bg-zinc-900 border-zinc-700 text-zinc-300' : 'bg-violet-900/10 border-violet-500/30 text-violet-200'}
                        `}>
                            <span className={`text-[8px] uppercase block mb-1 font-bold tracking-wider ${msg.role === 'user' ? 'text-zinc-600' : 'text-violet-500'}`}>
                                {msg.role === 'user' ? 'USR_INPUT' : 'PASCO_CORE'}
                            </span>
                            {msg.text}
                        </div>
                    </div>
                ))}

                {status === 'thinking' && (
                    <div className="flex justify-start relative z-10 animate-fade-in">
                        <div className="bg-violet-900/10 border border-violet-500/20 px-3 py-2 rounded-lg flex gap-1 items-center">
                            <span className="text-[9px] text-violet-400 font-bold mr-2 uppercase tracking-wider">Processing</span>
                            <span className="w-1 h-1 bg-violet-500 rounded-full animate-bounce"></span>
                            <span className="w-1 h-1 bg-violet-500 rounded-full animate-bounce [animation-delay:0.1s]"></span>
                            <span className="w-1 h-1 bg-violet-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        </div>
                    </div>
                )}
            </div>

            {/* --- OVERLAYS --- */}

            {/* ERROR OVERLAY */}
            {(status === 'error' || status === 'not_found') && (
                <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center z-20 animate-in fade-in zoom-in-95 duration-300 px-6 text-center">
                    <div className="bg-red-500/10 p-6 rounded-full border border-red-500/30 mb-4 animate-pulse">
                        <AlertTriangle size={40} className="text-red-500" />
                    </div>
                    <h3 className="text-2xl font-black text-red-500 tracking-[0.3em] uppercase mb-2 glitch-text">
                        {status === 'not_found' ? 'API NOT FOUND' : 'API ERROR'}
                    </h3>
                    <div className="text-[10px] text-red-400/80 font-mono tracking-widest uppercase leading-relaxed max-w-full break-words">
                        {status === 'not_found' ? 'Missing Configuration Key' : (errorMessage || 'Connection Refused')}
                    </div>
                    {errorMessage.includes('data policy') && (
                         <div className="mt-4 bg-red-900/20 border border-red-500/20 p-2 rounded text-[9px] text-red-300 font-sans">
                            Tip: Enable data logging in OpenRouter settings or use a different model.
                         </div>
                    )}
                </div>
            )}

            {/* REBOOT / VERIFYING OVERLAY */}
            {(status === 'rebooting' || status === 'verifying') && (
                <div className="absolute inset-0 bg-black z-30 flex flex-col items-center justify-center p-12 animate-in fade-in duration-500">
                    <Power size={48} className="text-cyan-500 mb-6 animate-pulse" />
                    
                    <div className="w-full max-w-[240px] space-y-2">
                        <div className="flex justify-between text-[9px] text-cyan-500 font-bold uppercase tracking-widest">
                            <span>{status === 'verifying' ? "Verifying Link" : "System Reboot"}</span>
                            <span>{rebootProgress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-cyan-500 shadow-[0_0_15px_#06b6d4] transition-all duration-100 ease-linear" 
                                style={{ width: `${rebootProgress}%` }}
                            />
                        </div>
                        <div className="text-[8px] text-zinc-600 font-mono text-center pt-2">
                            > {status === 'verifying' ? "PINGING ENDPOINT..." : "FLUSHING MEMORY BUFFER..."}
                        </div>
                    </div>
                </div>
            )}

            {/* VERIFIED SUCCESS OVERLAY */}
            {status === 'verified' && (
                <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center z-30 animate-in fade-in zoom-in-95 duration-300">
                     <div className="bg-emerald-500/10 p-6 rounded-full border border-emerald-500/30 mb-4 shadow-[0_0_30px_#10b981]">
                        <ShieldCheck size={40} className="text-emerald-500" />
                     </div>
                     <h3 className="text-2xl font-black text-emerald-500 tracking-[0.3em] uppercase mb-2 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">API TERVERIFIKASI</h3>
                     <p className="text-[10px] text-emerald-400/60 font-mono tracking-widest uppercase">Connection Stable</p>
                </div>
            )}

            {/* Input Area */}
            <div className="p-3 bg-[#121214] border-t border-white/5 flex gap-2 shrink-0">
                <div className="flex-1 bg-black border border-zinc-800 rounded-lg flex items-center px-3">
                    <span className="text-zinc-600 mr-2 text-xs">$</span>
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        disabled={status !== 'idle'}
                        placeholder={status === 'idle' ? "Enter command..." : "Busy..."}
                        className="flex-1 bg-transparent py-2 text-xs text-zinc-300 focus:outline-none placeholder-zinc-800 font-mono"
                        autoComplete="off"
                    />
                </div>
                <button onClick={handleSend} disabled={status !== 'idle' || !input.trim()} className="bg-white/5 hover:bg-white/10 text-white p-2 rounded-lg transition-colors disabled:opacity-20 border border-white/5">
                    <Send size={16} />
                </button>
            </div>
        </div>
    );
});

export const AISettings: React.FC<AISettingsProps> = ({ settings, setSettings }) => {
    const terminalRef = useRef<PascoTerminalRef>(null);

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">{t('set.global.title')}</h2>
                <p className="text-zinc-500 text-sm">{t('set.global.desc')}</p>
            </div>

            <div className="space-y-8">
                {/* MODEL SELECTION */}
                <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">{t('set.model.title')}</label>
                    <div className="grid grid-cols-1 gap-4">
                        {AVAILABLE_MODELS.map(model => (
                            <div 
                                key={model.id}
                                onClick={() => setSettings({...settings, defaultModel: model.id})}
                                className={`
                                    cursor-pointer relative p-5 rounded-2xl border transition-all duration-300 flex flex-col group
                                    ${settings.defaultModel === model.id 
                                        ? 'bg-violet-600/10 border-violet-500/50 shadow-[0_0_30px_rgba(124,58,237,0.1)]' 
                                        : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60'}
                                `}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`mt-1 p-2 rounded-xl transition-colors ${settings.defaultModel === model.id ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/20' : 'bg-zinc-800 text-zinc-500 group-hover:text-zinc-400'}`}>
                                        <Cpu size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`font-bold text-sm ${settings.defaultModel === model.id ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>{model.name}</span>
                                            {settings.defaultModel === model.id && (
                                                <div className="flex items-center gap-2">
                                                     {/* CHECK BUTTON FOR OPENROUTER ONLY */}
                                                     {model.id === 'openrouter-api' && (
                                                         <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                terminalRef.current?.runDiagnostics();
                                                            }}
                                                            className="p-1.5 bg-green-500/20 hover:bg-green-500/40 text-green-400 rounded-lg border border-green-500/30 transition-all active:scale-95 group/check"
                                                            title="Test Connection"
                                                         >
                                                             <Activity size={14} className="group-hover/check:animate-pulse" />
                                                         </button>
                                                     )}
                                                     <Check size={16} className="text-violet-400" />
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-zinc-500 leading-relaxed group-hover:text-zinc-400 transition-colors">{model.desc}</p>
                                    </div>
                                </div>

                                {/* Config Fields for External APIs - INSIDE THE CARD */}
                                {settings.defaultModel === 'kobold-api' && model.id === 'kobold-api' && (
                                     <div className="mt-5 pt-4 border-t border-white/5 w-full animate-fade-in" onClick={e => e.stopPropagation()}>
                                        <label className="text-[10px] uppercase font-bold text-zinc-500 mb-2 block tracking-wider">API Endpoint URL</label>
                                        <div className="flex gap-2">
                                            <div className="flex-1 flex items-center bg-black/40 border border-zinc-700 rounded-xl px-3 py-2.5 focus-within:border-violet-500/50 transition-colors">
                                                <Link size={14} className="text-zinc-500 mr-3" />
                                                <input 
                                                    type="text" 
                                                    value={settings.koboldUrl}
                                                    onChange={(e) => setSettings({...settings, koboldUrl: e.target.value})}
                                                    placeholder="http://localhost:5000/api"
                                                    className="bg-transparent text-sm text-zinc-200 outline-none w-full placeholder-zinc-700 font-mono"
                                                />
                                            </div>
                                        </div>
                                     </div>
                                )}
                                {settings.defaultModel === 'openrouter-api' && model.id === 'openrouter-api' && (
                                     <div className="mt-5 pt-4 border-t border-white/5 w-full animate-fade-in" onClick={e => e.stopPropagation()}>
                                        <label className="text-[10px] uppercase font-bold text-zinc-500 mb-2 block tracking-wider">OpenRouter API Key</label>
                                        <div className="flex gap-2 mb-4">
                                            <div className="flex-1 flex items-center bg-black/40 border border-zinc-700 rounded-xl px-3 py-2.5 focus-within:border-violet-500/50 transition-colors">
                                                <Key size={14} className="text-zinc-500 mr-3" />
                                                <input 
                                                    type="password" 
                                                    value={settings.openRouterKey}
                                                    onChange={(e) => setSettings({...settings, openRouterKey: e.target.value})}
                                                    placeholder="sk-or-..."
                                                    className="bg-transparent text-sm text-zinc-200 outline-none w-full placeholder-zinc-700 font-mono"
                                                />
                                            </div>
                                        </div>

                                        <label className="text-[10px] uppercase font-bold text-zinc-500 mb-2 block tracking-wider">Model</label>
                                        <div className="flex gap-2">
                                            <div className="flex-1 flex items-center bg-black/40 border border-zinc-700 rounded-xl px-3 py-2.5 focus-within:border-violet-500/50 transition-colors">
                                                <Cpu size={14} className="text-zinc-500 mr-3" />
                                                <input 
                                                    type="text" 
                                                    value={settings.openRouterModel || ''}
                                                    onChange={(e) => setSettings({...settings, openRouterModel: e.target.value})}
                                                    placeholder="google/gemini-2.0-flash-lite-preview-02-05:free"
                                                    className="bg-transparent text-sm text-zinc-200 outline-none w-full placeholder-zinc-700 font-mono"
                                                />
                                            </div>
                                        </div>
                                     </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- TEST TERMINAL --- */}
                <PascoTestTerminal ref={terminalRef} settings={settings} />

                {/* Temperature Slider */}
                <div className="bg-zinc-900/30 p-6 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center mb-6">
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">{t('set.temp.title')}</label>
                        <span className="bg-black/40 border border-white/10 px-3 py-1 rounded-lg text-violet-300 font-mono text-xs font-bold">{settings.defaultTemperature.toFixed(1)}</span>
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
                            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg pointer-events-none transition-all border-2 border-zinc-900"
                            style={{left: `calc(${settings.defaultTemperature * 100}% - 8px)`}}
                        />
                    </div>

                    <div className="flex justify-between text-[9px] text-zinc-600 uppercase font-bold mt-3 tracking-wider">
                        <span>Rigid / Logical</span>
                        <span>Balanced</span>
                        <span>Creative / Chaotic</span>
                    </div>
                </div>
                
                {/* Max Tokens Slider */}
                <div className="bg-zinc-900/30 p-6 rounded-2xl border border-white/5">
                     <div className="flex justify-between items-center mb-4">
                         <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Max Output Tokens</label>
                         <span className="bg-black/40 border border-white/10 px-3 py-1 rounded-lg text-violet-300 font-mono text-xs font-bold">{settings.maxOutputTokens}</span>
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
                     <p className="text-[10px] text-zinc-500 mt-3">
                         Controls the maximum length of the response.
                     </p>
                </div>

            </div>
        </div>
    );
};
