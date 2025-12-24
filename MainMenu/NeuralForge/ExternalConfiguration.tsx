
import React, { useMemo, useState, useEffect } from 'react';
import { Character } from '../../types';
import { t } from '../../services/translationService';
import { ChevronLeft, Dna, Play, PanelLeftOpen, PanelLeftClose, Zap, Activity, BrainCircuit, X, Fingerprint, Layers, BookOpen, AlertTriangle, ScanFace } from 'lucide-react';
import { analyzeNeuralCoherence, AnalysisResult } from './NeuralThinking';

// Re-export untuk kompatibilitas jika ada file lain yang pakai
export const calculateCoherenceScore = (formData: Partial<Character>): number => {
    return analyzeNeuralCoherence(formData).score;
};

export const getCoherenceStatus = (score: number) => {
    if (score < 40) return { label: "Artificial Intelligence", color: "text-zinc-500", bar: "bg-zinc-700", stroke: "#52525b", glow: "shadow-none" };
    if (score < 70) return { label: "Simulated Persona", color: "text-blue-400", bar: "bg-blue-600", stroke: "#60a5fa", glow: "shadow-blue-500/50" };
    if (score < 90) return { label: "Complex Soul", color: "text-violet-400", bar: "bg-violet-500", stroke: "#a78bfa", glow: "shadow-violet-500/50" };
    return { label: "Human-Like Entity", color: "text-emerald-400", bar: "bg-gradient-to-r from-emerald-500 to-cyan-400", stroke: "#34d399", glow: "shadow-emerald-500/50" };
};

// --- MODAL COMPONENT ---
const CoherenceDetailsModal = ({ analysis, onClose }: { analysis: AnalysisResult, onClose: () => void }) => {
    const status = getCoherenceStatus(analysis.score);
    const [animate, setAnimate] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        // Trigger entry animation
        requestAnimationFrame(() => setAnimate(true));
    }, []);

    const handleClose = () => {
        setIsClosing(true);
        // Wait for animation to finish before unmounting
        setTimeout(onClose, 300);
    };

    // Circular Progress Logic
    const radius = 58;
    const circumference = 2 * Math.PI * radius;
    const progressOffset = circumference - (analysis.score / 100) * circumference;

    const MetricBar = ({ label, value, icon: Icon, color }: any) => (
        <div className="mb-4 group">
            <div className="flex justify-between items-end mb-1.5">
                <div className="flex items-center gap-2 text-zinc-400 group-hover:text-zinc-300 transition-colors">
                    <Icon size={14} className={color} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
                </div>
                <span className={`text-[10px] font-mono font-bold ${color}`}>{Math.round(value)}%</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5 relative">
                {/* Background Track */}
                <div className="absolute inset-0 bg-white/5"></div>
                {/* Active Bar */}
                <div 
                    className={`h-full transition-all duration-1000 ease-out ${color.replace('text-', 'bg-')} relative`} 
                    style={{ width: animate ? `${value}%` : '0%' }}
                >
                    <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-white/50 shadow-[0_0_10px_white]"></div>
                </div>
            </div>
        </div>
    );

    return (
        <div 
            className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`} 
            onClick={handleClose}
        >
            <div 
                className={`
                    w-full max-w-md bg-[#09090b] border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative flex flex-col max-h-[85vh]
                    transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1) transform
                    ${isClosing ? 'scale-95 translate-y-4 opacity-0' : 'scale-100 translate-y-0 opacity-100 animate-in fade-in zoom-in-95 slide-in-from-bottom-4'}
                `}
                onClick={e => e.stopPropagation()}
            >
                {/* Header Graphic */}
                <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-violet-900/10 via-violet-900/5 to-transparent pointer-events-none" />
                <div className="absolute top-[-50px] right-[-50px] text-violet-500/5 animate-spin-slow">
                    <BrainCircuit size={250} />
                </div>

                <div className="p-6 relative z-10 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Activity size={18} className="text-violet-400" />
                                Neural Analysis
                            </h3>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono mt-1">Realism Protocol V2.1</p>
                        </div>
                        <button 
                            onClick={handleClose} 
                            className="p-1.5 text-zinc-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full active:scale-90"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Main Score - Improved SVG */}
                    <div className="flex flex-col items-center mb-8 relative">
                        <div className="relative w-40 h-40 flex items-center justify-center">
                            {/* Glow Filter Definition */}
                            <svg width="0" height="0">
                                <defs>
                                    <filter id="glow-filter" x="-50%" y="-50%" width="200%" height="200%">
                                        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                                        <feMerge>
                                            <feMergeNode in="coloredBlur"/>
                                            <feMergeNode in="SourceGraphic"/>
                                        </feMerge>
                                    </filter>
                                </defs>
                            </svg>

                            <svg className="w-full h-full transform -rotate-90 drop-shadow-xl" viewBox="0 0 128 128">
                                {/* Track */}
                                <circle 
                                    cx="64" cy="64" r={radius} 
                                    stroke="currentColor" strokeWidth="6" 
                                    fill="transparent" 
                                    className="text-zinc-800/50" 
                                />
                                {/* Progress */}
                                <circle 
                                    cx="64" cy="64" r={radius} 
                                    stroke={status.stroke} 
                                    strokeWidth="6" 
                                    fill="transparent"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={animate ? progressOffset : circumference}
                                    strokeLinecap="round"
                                    className="transition-all duration-[1.5s] ease-out"
                                    style={{ filter: 'url(#glow-filter)' }}
                                />
                            </svg>
                            
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-4xl font-black ${status.color} tracking-tighter drop-shadow-md`}>
                                    {Math.round(analysis.score)}
                                </span>
                                <span className="text-[9px] text-zinc-500 font-bold uppercase mt-1 tracking-widest">Integrity</span>
                            </div>
                        </div>
                        
                        <div className={`mt-4 px-4 py-1.5 rounded-full border border-white/5 bg-white/5 ${status.color} text-[10px] font-bold uppercase tracking-widest shadow-lg backdrop-blur-md`}>
                            {status.label}
                        </div>
                    </div>

                    {/* Metrics Breakdown */}
                    <div className="space-y-3 mb-6 bg-zinc-900/30 p-5 rounded-2xl border border-white/5 shadow-inner">
                        <MetricBar label="Psychometric Depth" value={analysis.breakdown.psyche} icon={BrainCircuit} color="text-pink-400" />
                        <MetricBar label="Internal Conflict" value={analysis.breakdown.duality} icon={Layers} color="text-violet-400" />
                        <MetricBar label="Narrative Weight" value={analysis.breakdown.lore} icon={BookOpen} color="text-amber-400" />
                        <MetricBar label="Identity Definition" value={analysis.breakdown.identity} icon={Fingerprint} color="text-blue-400" />
                        <MetricBar label="Human Imperfection" value={analysis.breakdown.complexity} icon={ScanFace} color="text-red-400" />
                    </div>

                    {/* Detection Logs */}
                    <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 border-b border-white/5 pb-1">System Detection Logs</h4>
                        {analysis.details.length > 0 ? (
                            analysis.details.map((detail, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-[10px] text-zinc-300 font-mono bg-black/40 p-2.5 rounded-lg border border-white/5 animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                                    <Zap size={10} className="text-yellow-500 shrink-0" />
                                    {detail}
                                </div>
                            ))
                        ) : (
                            <div className="text-[10px] text-zinc-600 italic text-center py-2">Insufficient data for detailed analysis.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- HEADER COMPONENT ---
interface ForgeHeaderProps {
    onCancel: () => void;
    onSave: () => void;
}

export const ForgeHeader: React.FC<ForgeHeaderProps> = ({ onCancel, onSave }) => {
    return (
        <div className="hidden md:flex h-14 px-4 border-b border-white/5 items-center justify-between bg-zinc-950/80 backdrop-blur-md z-50 shrink-0">
            <div className="flex items-center gap-4">
                <button onClick={onCancel} className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/5">
                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-medium">{t('forge.exit')}</span>
                </button>
                <div className="h-4 w-[1px] bg-zinc-800 mx-1"></div>
                <h2 className="text-xs font-bold text-white flex items-center gap-2 tracking-wide">
                    <BrainCircuit size={14} className="text-violet-500" />
                    {t('forge.title')} <span className="text-emerald-500 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 text-[9px] uppercase tracking-wider">Neural Engine V2</span>
                </h2>
            </div>
            <button 
                onClick={onSave}
                className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-lg shadow-[0_0_15px_rgba(8,145,178,0.4)] hover:shadow-[0_0_25px_rgba(8,145,178,0.6)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 border border-cyan-400/50"
            >
                <Play size={12} fill="currentColor" />
                {t('forge.materialize')}
            </button>
        </div>
    );
};

// --- SIDEBAR COMPONENT ---
interface ForgeSidebarProps {
    modules: { id: string; icon: React.ReactNode; labelKey: string }[];
    activeSection: string;
    setActiveSection: (id: any) => void;
    isCollapsed: boolean;
    setIsCollapsed: (v: boolean) => void;
    formData: Partial<Character>;
}

export const ForgeSidebar: React.FC<ForgeSidebarProps> = ({ 
    modules, activeSection, setActiveSection, isCollapsed, setIsCollapsed, formData 
}) => {
    
    // Gunakan NeuralThinking untuk analisis mendalam
    const analysis = useMemo(() => analyzeNeuralCoherence(formData), [formData]);
    const status = getCoherenceStatus(analysis.score);
    const [showAnalysis, setShowAnalysis] = useState(false);

    return (
        <>
            <div className={`flex flex-shrink-0 bg-zinc-950 border-r border-white/5 flex-col transition-all duration-300 ease-in-out z-20 ${isCollapsed ? 'w-[50px] md:w-[60px] items-center' : 'w-64'}`}>
                <div className={`hidden md:flex items-center p-3 border-b border-white/5 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                    {!isCollapsed && <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest px-2">{t('forge.sidebar.modules')}</span>}
                    <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-zinc-500 hover:text-white p-1 rounded hover:bg-white/5 transition-colors">
                        {isCollapsed ? <PanelLeftOpen size={16}/> : <PanelLeftClose size={16}/>}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-1 md:p-2 space-y-2 w-full pt-4 md:pt-2">
                    {modules.map(mod => (
                        <button 
                            key={mod.id} 
                            onClick={() => setActiveSection(mod.id)}
                            title={isCollapsed ? t(mod.labelKey) : ''}
                            className={`
                                flex items-center rounded-lg transition-all duration-200 group relative
                                ${isCollapsed ? 'justify-center p-2 w-10 h-10' : 'w-full p-2 gap-3 text-left'}
                                ${activeSection === mod.id 
                                    ? 'bg-violet-600/10 border border-violet-500/30 text-white shadow-[inset_0_0_10px_rgba(139,92,246,0.1)]' 
                                    : 'text-zinc-400 hover:bg-zinc-900 border border-transparent'}
                            `}
                        >
                            <div className={`transition-colors ${activeSection === mod.id ? 'text-violet-400' : 'text-zinc-600 group-hover:text-zinc-400'}`}>
                                {React.cloneElement(mod.icon as any, { size: 18 })}
                            </div>
                            {!isCollapsed && <span className="text-[11px] font-bold uppercase tracking-wide flex-1 truncate">{t(mod.labelKey)}</span>}
                            
                            {/* Active Indicator */}
                            {!isCollapsed && activeSection === mod.id && <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse shadow-[0_0_8px_#8b5cf6]" />}
                        </button>
                    ))}
                </div>
                
                {/* NEURAL SCORE VISUALIZER (Interactive) */}
                <div 
                    onClick={() => setShowAnalysis(true)}
                    className="p-4 border-t border-white/5 bg-gradient-to-b from-zinc-900/50 to-black backdrop-blur transition-all flex flex-col items-center justify-center relative overflow-hidden cursor-pointer group hover:bg-white/5"
                >
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 bg-violet-500/0 group-hover:bg-violet-500/5 transition-colors pointer-events-none"></div>

                    {/* Background Pulse Effect for high scores */}
                    {analysis.score > 80 && (
                        <div className="absolute inset-0 bg-emerald-500/5 animate-pulse pointer-events-none"></div>
                    )}

                    {/* Collapsed/Mobile View */}
                    <div className={`flex flex-col items-center gap-1 relative ${isCollapsed ? 'flex' : 'hidden'}`}>
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center bg-zinc-900 ${analysis.score > 90 ? 'border-emerald-500 shadow-[0_0_10px_#10b981]' : 'border-zinc-700'}`}>
                            <span className={`text-[9px] font-bold ${status.color}`}>{Math.round(analysis.score)}</span>
                        </div>
                    </div>

                    {/* Expanded View (Desktop) */}
                    <div className={`w-full relative z-10 ${!isCollapsed ? 'block' : 'hidden'}`}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-1.5 text-zinc-300">
                                <Activity size={12} className={analysis.score > 50 ? "text-blue-400 animate-pulse" : "text-zinc-600"} />
                                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-white transition-colors">Humanity Index</span>
                            </div>
                            <span className={`font-mono text-[10px] font-black ${status.color}`}>{Math.round(analysis.score)}%</span>
                        </div>
                        
                        {/* Multi-layered Progress Bar */}
                        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mb-2 relative border border-black group-hover:border-zinc-600 transition-colors">
                            {/* Base Bar */}
                            <div 
                                className={`absolute top-0 left-0 h-full transition-all duration-700 ease-out ${status.bar}`} 
                                style={{width: `${analysis.score}%`}}
                            ></div>
                            
                            {/* Shimmer Effect */}
                            <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine" style={{ display: analysis.score > 0 ? 'block' : 'none' }}></div>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="text-[9px] font-bold uppercase tracking-tight text-zinc-500 group-hover:text-zinc-400">{status.label}</div>
                            {/* Micro Details */}
                            <div className="text-[8px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 group-hover:text-white group-hover:bg-zinc-700 transition-colors">
                                DETAILS
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Portal */}
            {showAnalysis && <CoherenceDetailsModal analysis={analysis} onClose={() => setShowAnalysis(false)} />}
        </>
    );
};
