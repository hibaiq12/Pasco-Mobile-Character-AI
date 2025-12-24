
import React, { useState } from 'react';
import { HelpCircle, Brain, Info, Shuffle, Loader2, Sparkles } from 'lucide-react';
import { t } from '../../../services/translationService';

// --- TOOLTIP (STANDARD DARK THEME) ---
export const Tooltip = ({ textKey, fallback }: { textKey: string, fallback?: string }) => {
    const [show, setShow] = useState(false);
    const translatedText = t(textKey);
    const displayText = translatedText !== textKey ? translatedText : (fallback || translatedText);

    return (
        <div className="relative inline-block ml-1">
            <button 
                className="text-blue-400 hover:text-white transition-colors cursor-help p-0.5 active:text-white"
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
                onClick={(e) => { e.preventDefault(); setShow(!show); }}
                type="button"
            >
                <HelpCircle size={12} />
            </button>
            {show && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-zinc-900/90 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-2xl z-[100] text-[10px] leading-relaxed text-zinc-300 pointer-events-none animate-fade-in font-sans">
                    <div className="whitespace-pre-wrap">{displayText}</div>
                </div>
            )}
        </div>
    );
};

// --- SLIDER (GLASSMORPHISM BLUE THEME) ---
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

export const Slider: React.FC<SliderProps> = ({ label, value, onChange, leftLabel, rightLabel, accentColor = "blue", insight, warning }) => {
    const colors: Record<string, any> = {
        blue: { text: 'text-blue-400', gradient: 'bg-gradient-to-r from-blue-600 to-cyan-400', border: 'border-blue-400', glow: 'shadow-blue-500/20' },
        cyan: { text: 'text-cyan-400', gradient: 'bg-gradient-to-r from-cyan-600 to-teal-400', border: 'border-cyan-400', glow: 'shadow-cyan-500/20' },
        emerald: { text: 'text-emerald-400', gradient: 'bg-gradient-to-r from-emerald-600 to-green-400', border: 'border-emerald-400', glow: 'shadow-emerald-500/20' },
        rose: { text: 'text-rose-400', gradient: 'bg-gradient-to-r from-rose-600 to-pink-400', border: 'border-rose-400', glow: 'shadow-rose-500/20' },
        amber: { text: 'text-amber-400', gradient: 'bg-gradient-to-r from-amber-600 to-yellow-400', border: 'border-amber-400', glow: 'shadow-amber-500/20' },
        violet: { text: 'text-violet-400', gradient: 'bg-gradient-to-r from-violet-600 to-purple-400', border: 'border-violet-400', glow: 'shadow-violet-500/20' },
    };

    const theme = colors[accentColor] || colors.blue;

    return (
        <div className="group p-4 bg-zinc-900/40 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 touch-none">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                    {/* CHANGED: Text color to Blue-300 for contrast */}
                    <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest font-sans">{label}</span>
                </div>
                <span className={`text-[10px] font-mono font-bold ${theme.text} bg-white/5 px-2 py-0.5 rounded-md border border-white/5 min-w-[2.5rem] text-center`}>
                    {value}%
                </span>
            </div>
            
            <div className="relative h-6 flex items-center select-none mb-1">
                {/* Track */}
                <div className="absolute w-full h-1.5 bg-zinc-800/50 rounded-full overflow-hidden">
                    <div className={`absolute h-full rounded-full ${theme.gradient} transition-all duration-300`} style={{ width: `${value}%`, opacity: 0.8 }}></div>
                </div>
                
                <input 
                    type="range" min="0" max="100" value={value} 
                    onChange={(e) => onChange(parseInt(e.target.value))}
                    className="absolute w-full h-full opacity-0 cursor-pointer z-30 touch-manipulation"
                />
                
                {/* Thumb */}
                <div 
                    className={`absolute h-4 w-4 bg-zinc-950 rounded-full border-2 ${theme.border} z-20 pointer-events-none transition-all shadow-lg ${theme.glow}`} 
                    style={{ left: `calc(${value}% - 8px)` }}
                ></div>
            </div>

            <div className="flex justify-between text-[9px] font-medium text-zinc-500 uppercase tracking-wider font-sans mt-1">
                <span>{leftLabel}</span>
                <span>{rightLabel}</span>
            </div>

            {(insight || warning) && (
                <div className="mt-3 pt-3 border-t border-white/5 flex flex-col gap-2 animate-fade-in">
                    {insight && (
                        <div className="text-[10px] text-zinc-400 flex items-start gap-2 leading-relaxed font-sans">
                            <Brain size={12} className={`${theme.text} shrink-0 mt-0.5`} />
                            <span>{insight}</span>
                        </div>
                    )}
                    {warning && (
                        <div className="text-[10px] text-amber-200 flex items-start gap-2 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 leading-relaxed font-sans">
                            <Info size={12} className="shrink-0 mt-0.5 text-amber-400" />
                            <span>{warning}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// --- INPUT FIELD (GLASSMORPHISM) ---
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
        <div className={`space-y-2 ${className}`}>
            <div className="flex justify-between items-baseline px-1">
                <div className="flex items-center gap-1.5">
                    {/* CHANGED: Text color to Blue-300 */}
                    <label className="text-[10px] font-bold text-blue-300 uppercase tracking-widest font-sans">{label}</label>
                    {tooltipKey && <Tooltip textKey={tooltipKey} fallback={`Configure the ${label} parameter.`} />}
                    {!tooltipKey && <Tooltip textKey={`forge.tooltip.generic`} fallback={`Configure the ${label} parameter.`} />}
                </div>
                {helperText && <span className="text-[9px] text-blue-400 italic font-sans">{helperText}</span>}
            </div>
            
            <div className="relative group">
                {multiline ? (
                    <textarea 
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:border-blue-500/40 focus:bg-zinc-900/60 focus:ring-1 focus:ring-blue-500/10 outline-none transition-all text-xs leading-relaxed resize-none min-h-[80px] font-sans shadow-inner"
                    />
                ) : (
                    <input 
                    type="text" 
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`w-full bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:border-blue-500/40 focus:bg-zinc-900/60 focus:ring-1 focus:ring-blue-500/10 outline-none transition-all text-xs font-sans shadow-inner ${suggestions ? 'pr-9' : ''}`}
                    />
                )}
                
                {suggestions && !multiline && (
                    <button 
                        onClick={handleSuggest}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all active:scale-95"
                        title="Surprise me (Random Example)"
                    >
                        <Shuffle size={12} />
                    </button>
                )}
                
                {suggestions && multiline && (
                     <button 
                        onClick={handleSuggest}
                        className="absolute right-3 top-3 p-1.5 text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all z-10 bg-zinc-900/80 backdrop-blur border border-white/10"
                        title="Surprise me (Random Example)"
                    >
                        <Shuffle size={12} />
                    </button>
                )}
            </div>
        </div>
    );
};

// --- AUTO BUTTON (BLUE THEME) ---
export const AutoConfigButton = ({ onClick, isGenerating, sectionName }: { onClick: () => void, isGenerating: boolean, sectionName: string }) => (
    <button 
        onClick={onClick} 
        disabled={isGenerating}
        className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(59,130,246,0.1)] group active:scale-[0.98]"
    >
        {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} className="text-blue-400 group-hover:text-white transition-colors" />}
        <span className="text-[9px] font-bold uppercase tracking-wider group-hover:text-blue-100 transition-colors font-sans">
            {isGenerating ? t('forge.thinking') : t('forge.auto')}
        </span>
    </button>
);
