
import React, { useState } from 'react';
import { HelpCircle, Brain, Info, Shuffle, Loader2, Sparkles } from 'lucide-react';
import { t } from '../../../services/translationService';

// --- TOOLTIP ---
export const Tooltip = ({ textKey, fallback }: { textKey: string, fallback?: string }) => {
    const [show, setShow] = useState(false);
    const translatedText = t(textKey);
    const displayText = translatedText !== textKey ? translatedText : (fallback || translatedText);

    return (
        <div className="relative inline-block ml-1">
            <button 
                className="text-zinc-500 hover:text-violet-400 transition-colors cursor-help p-0.5 active:text-violet-400"
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
                onClick={(e) => { e.preventDefault(); setShow(!show); }}
                type="button"
            >
                <HelpCircle size={12} />
            </button>
            {show && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-zinc-950 border border-zinc-800 p-2 rounded shadow-2xl z-[100] text-[10px] leading-relaxed text-zinc-300 pointer-events-none animate-fade-in">
                    <div className="whitespace-pre-wrap">{displayText}</div>
                </div>
            )}
        </div>
    );
};

// --- SLIDER ---
interface SliderProps {
    label: string;
    value: number;
    onChange: (val: number) => void;
    leftLabel: string;
    rightLabel: string;
    accentColor?: string;
    insight?: string;
    warning?: string;
}

export const Slider: React.FC<SliderProps> = ({ label, value, onChange, leftLabel, rightLabel, accentColor = "violet", insight, warning }) => {
    const colors: Record<string, any> = {
        violet: { text: 'text-violet-400', gradient: 'bg-gradient-to-r from-violet-600 to-violet-400', border: 'border-violet-400' },
        blue: { text: 'text-blue-400', gradient: 'bg-gradient-to-r from-blue-600 to-blue-400', border: 'border-blue-400' },
        emerald: { text: 'text-emerald-400', gradient: 'bg-gradient-to-r from-emerald-600 to-emerald-400', border: 'border-emerald-400' },
        yellow: { text: 'text-yellow-400', gradient: 'bg-gradient-to-r from-yellow-600 to-yellow-400', border: 'border-yellow-400' },
        pink: { text: 'text-pink-400', gradient: 'bg-gradient-to-r from-pink-600 to-pink-400', border: 'border-pink-400' },
        red: { text: 'text-red-400', gradient: 'bg-gradient-to-r from-red-600 to-red-400', border: 'border-red-400' },
        cyan: { text: 'text-cyan-400', gradient: 'bg-gradient-to-r from-cyan-600 to-cyan-400', border: 'border-cyan-400' },
    };

    const theme = colors[accentColor] || colors.violet;

    return (
        <div className="group p-3 bg-zinc-900/40 rounded-lg border border-white/5 hover:border-white/10 transition-all duration-300 touch-none">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</span>
                </div>
                <span className={`text-[10px] font-mono font-bold ${theme.text} bg-zinc-950/80 px-1.5 py-0.5 rounded border border-white/10 min-w-[2.5rem] text-center`}>
                    {value}%
                </span>
            </div>
            
            <div className="relative h-5 flex items-center select-none mb-1">
                <div className="absolute w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`absolute h-full rounded-full ${theme.gradient}`} style={{ width: `${value}%`, opacity: 0.9 }}></div>
                </div>
                <input 
                    type="range" min="0" max="100" value={value} 
                    onChange={(e) => onChange(parseInt(e.target.value))}
                    className="absolute w-full h-full opacity-0 cursor-pointer z-30 touch-manipulation"
                />
                <div className={`absolute h-3 w-3 bg-zinc-950 rounded-full border-2 ${theme.border} z-20 pointer-events-none transition-all shadow-lg`} style={{ left: `calc(${value}% - 6px)` }}></div>
            </div>

            <div className="flex justify-between text-[9px] font-medium text-zinc-600 uppercase tracking-wider">
                <span>{leftLabel}</span>
                <span>{rightLabel}</span>
            </div>

            {(insight || warning) && (
                <div className="mt-2 pt-2 border-t border-white/5 flex flex-col gap-1 animate-fade-in">
                    {insight && (
                        <div className="text-[10px] text-zinc-400 flex items-start gap-1.5 leading-relaxed">
                            <Brain size={12} className={`${theme.text} shrink-0 mt-0.5`} />
                            <span>{insight}</span>
                        </div>
                    )}
                    {warning && (
                        <div className="text-[10px] text-amber-500/90 flex items-start gap-1.5 bg-amber-900/10 p-1.5 rounded border border-amber-500/10 leading-relaxed">
                            <Info size={12} className="shrink-0 mt-0.5" />
                            <span>{warning}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// --- INPUT FIELD ---
interface InputFieldProps {
    labelKey: string;
    value: string;
    onChange: (val: string) => void;
    placeholderKey?: string;
    multiline?: boolean;
    className?: string;
    helperTextKey?: string;
    tooltipKey?: string;
    suggestions?: string[];
}

export const InputField: React.FC<InputFieldProps> = ({ labelKey, value, onChange, placeholderKey, multiline = false, className = "", helperTextKey, tooltipKey, suggestions }) => {
    
    const handleSuggest = () => {
        if (suggestions && suggestions.length > 0) {
            const random = suggestions[Math.floor(Math.random() * suggestions.length)];
            onChange(random);
        }
    };

    const label = t(labelKey);
    const placeholder = placeholderKey ? t(placeholderKey) : '';
    const helperText = helperTextKey ? t(helperTextKey) : undefined;

    return (
        <div className={`space-y-1.5 ${className}`}>
            <div className="flex justify-between items-baseline px-1">
                <div className="flex items-center gap-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{label}</label>
                    {tooltipKey && <Tooltip textKey={tooltipKey} fallback={`Configure the ${label} parameter.`} />}
                    {!tooltipKey && <Tooltip textKey={`forge.tooltip.generic`} fallback={`Configure the ${label} parameter.`} />}
                </div>
                {helperText && <span className="text-[9px] text-violet-400/80">{helperText}</span>}
            </div>
            
            <div className="relative group">
                {multiline ? (
                    <textarea 
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-black/20 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-300 placeholder-zinc-700 focus:border-violet-500/50 focus:bg-zinc-900/50 focus:ring-1 focus:ring-violet-500/20 outline-none transition-all text-xs leading-relaxed resize-none min-h-[80px]"
                    />
                ) : (
                    <input 
                    type="text" 
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`w-full bg-black/20 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-300 placeholder-zinc-700 focus:border-violet-500/50 focus:bg-zinc-900/50 focus:ring-1 focus:ring-violet-500/20 outline-none transition-all text-xs ${suggestions ? 'pr-8' : ''}`}
                    />
                )}
                
                {suggestions && !multiline && (
                    <button 
                        onClick={handleSuggest}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-zinc-600 hover:text-violet-400 hover:bg-violet-500/10 rounded transition-all active:scale-95"
                        title="Surprise me (Random Example)"
                    >
                        <Shuffle size={12} />
                    </button>
                )}
                
                {suggestions && multiline && (
                     <button 
                        onClick={handleSuggest}
                        className="absolute right-2 top-2 p-1 text-zinc-600 hover:text-violet-400 hover:bg-violet-500/10 rounded transition-all z-10 bg-zinc-900/50 backdrop-blur border border-zinc-800"
                        title="Surprise me (Random Example)"
                    >
                        <Shuffle size={12} />
                    </button>
                )}
            </div>
        </div>
    );
};

// --- AUTO BUTTON ---
export const AutoConfigButton = ({ onClick, isGenerating, sectionName }: { onClick: () => void, isGenerating: boolean, sectionName: string }) => (
    <button 
        onClick={onClick} 
        disabled={isGenerating}
        className="w-full md:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/10 border border-violet-500/30 text-violet-300 hover:bg-violet-500/20 hover:border-violet-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(124,58,237,0.1)] group active:scale-[0.98]"
    >
        {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} className="text-violet-400 group-hover:text-white transition-colors" />}
        <span className="text-[9px] font-bold uppercase tracking-wider group-hover:text-white transition-colors">
            {isGenerating ? t('forge.thinking') : t('forge.auto')}
        </span>
    </button>
);
