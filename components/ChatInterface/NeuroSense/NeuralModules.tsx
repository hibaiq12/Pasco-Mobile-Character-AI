
import React from 'react';
import { Eye, Activity, Fingerprint, Layers, Brain, Shield, AlertTriangle, Plus, Quote, Trash2, Cpu, Zap, Hash, Heart, Skull, User, UserCheck, Users, Network, Sparkles, Gem, Sword, ShieldAlert } from 'lucide-react';
import { NeuralProfile } from './ProfileEngine';

// --- SHARED: Module Header ---
const ModuleHeader = ({ icon: Icon, title, color = "text-zinc-400", action }: any) => (
    <div className={`flex items-center justify-between mb-2 pl-1`}>
        <div className={`flex items-center gap-2 ${color} text-[10px] font-bold uppercase tracking-[0.15em]`}>
            <Icon size={12} className="shrink-0" />
            <span>{title}</span>
        </div>
        {action}
    </div>
);

// Helper to map string icon name to Component
const IconMap: Record<string, any> = {
    Heart, Skull, User, UserCheck, Users, Network, Sparkles, Gem, Sword, ShieldAlert, Zap, Fingerprint
};

// 1. VISUAL STATE (Terminal Style)
export const VisualState = ({ state }: { state: string }) => (
    <div className="group">
        <ModuleHeader icon={Eye} title="Visual Cortex" color="text-cyan-400" />
        <div className="bg-black/40 p-3 rounded-lg border-l-2 border-cyan-500/50 text-xs text-cyan-100/80 leading-relaxed font-mono relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            <span className="text-cyan-600 mr-2">Observed:</span>
            {state}
        </div>
    </div>
);

// 2. PSYCHE STABILITY (Segmented Bar)
export const PsycheStability = ({ psyche }: { psyche: NeuralProfile['psyche'] }) => {
    // Calculate segments (20 blocks)
    const segments = 20;
    const activeSegments = Math.floor((psyche.stability / 100) * segments);
    
    // Dynamic Color
    let barColor = "bg-emerald-500";
    let glowColor = "shadow-[0_0_10px_#10b981]";
    if (psyche.stability < 60) { barColor = "bg-yellow-500"; glowColor = "shadow-[0_0_10px_#eab308]"; }
    if (psyche.stability < 30) { barColor = "bg-red-500"; glowColor = "shadow-[0_0_10px_#ef4444]"; }

    return (
        <div>
            <div className="flex justify-between items-end mb-2">
                <ModuleHeader icon={Activity} title="Psyche Stability" color="text-rose-400" />
                <span className="text-[10px] font-mono font-bold text-zinc-300">{psyche.stability}%</span>
            </div>
            
            <div className="flex gap-[2px] h-3 w-full opacity-90 mb-2">
                {Array.from({ length: segments }).map((_, i) => (
                    <div 
                        key={i}
                        className={`flex-1 rounded-sm transition-all duration-300 ${i < activeSegments ? `${barColor} ${glowColor}` : 'bg-zinc-800/50'}`}
                        style={{ opacity: i < activeSegments ? 1 : 0.2 }}
                    ></div>
                ))}
            </div>

            {/* EQ & Recovery Metrics */}
            <div className="flex justify-between gap-2 px-1">
                <div className="flex items-center gap-1.5 text-[8px] text-zinc-500 font-mono">
                    <Cpu size={8} /> EQ: <span className="text-zinc-300">{psyche.emotionalIntelligence}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[8px] text-zinc-500 font-mono">
                    <Zap size={8} /> REC: <span className="text-zinc-300">+{psyche.recoveryRate}/t</span>
                </div>
            </div>

            {psyche.warning && (
                <div className="mt-2 flex items-center gap-2 text-[9px] text-red-400 font-bold bg-red-950/20 px-2 py-1.5 rounded border border-red-500/20 animate-pulse">
                    <AlertTriangle size={10} />
                    {psyche.warning}
                </div>
            )}
        </div>
    );
};

// 3. SOCIAL PROTOCOL (RELATIONSHIP ENGINE UI)
// Updated to support new colorful tiers
export const SocialProtocol = ({ social }: { social: NeuralProfile['social'] }) => {
    // Correctly handle both Component object and String key for Icon
    let TierIcon = User;
    if (social.tier.icon) {
        if (typeof social.tier.icon === 'string') {
            TierIcon = IconMap[social.tier.icon] || User;
        } else {
            TierIcon = social.tier.icon;
        }
    }
    
    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <ModuleHeader icon={Heart} title="Social Link" color={social.tier.color} />
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border bg-black/40 ${social.tier.color.replace('text-', 'border-').replace('400', '500/30')}`}>
                    <TierIcon size={10} className={social.tier.color} />
                    <span className={`text-[9px] font-bold uppercase ${social.tier.color}`}>
                        {social.tier.label}
                    </span>
                </div>
            </div>
            
            <div className="bg-zinc-900 p-4 rounded-xl border border-white/5 relative overflow-hidden group">
                {/* Background Glow based on Tier Color */}
                <div className="absolute inset-0 opacity-10 pointer-events-none transition-colors duration-500" style={{ background: social.tier.glowColor }}></div>
                
                <div className="flex justify-between items-end mb-2 text-[9px] font-bold text-zinc-500 uppercase tracking-wider relative z-10">
                    <span className="flex items-center gap-1">
                        {social.context}
                    </span>
                    <span className="font-mono text-zinc-400">
                        SCORE: <span className={social.score < 0 ? 'text-red-400' : 'text-emerald-400'}>{social.score}</span>
                    </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-black rounded-full overflow-hidden relative border border-white/5">
                    <div 
                        className={`h-full transition-all duration-1000 ease-out ${social.tier.barColor}`}
                        style={{ 
                            width: `${social.progress}%`,
                            boxShadow: `0 0 10px ${social.tier.glowColor}`
                        }}
                    >
                        <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-white/50"></div>
                    </div>
                </div>
                
                {/* Trend Indicator */}
                <div className="mt-2 flex justify-between items-center text-[8px] font-mono relative z-10">
                    <span className="text-zinc-600">Next Tier: {social.tier.maxScore + 1} PTS</span>
                    <span className={`uppercase font-bold ${
                        social.trend === 'improving' ? 'text-emerald-500' : 
                        social.trend === 'deteriorating' ? 'text-red-500' : 'text-zinc-600'
                    }`}>
                        {social.trend === 'improving' ? '▲ RISING' : social.trend === 'deteriorating' ? '▼ FALLING' : '• STABLE'}
                    </span>
                </div>
            </div>
        </div>
    );
};

// 4. DEEP LAYER DRIFT (Grid Layout)
export const DeepLayerDrift = ({ duality }: { duality: NeuralProfile['duality'] }) => (
    <div>
        <ModuleHeader icon={Layers} title="Deep Layer Drift" color="text-amber-400" />
        <div className="grid grid-cols-2 gap-px bg-white/5 border border-white/5 rounded-lg overflow-hidden">
            <div className="bg-zinc-900/80 p-3 flex flex-col gap-1">
                <span className="text-[8px] text-zinc-500 uppercase font-bold tracking-wider">Alignment</span>
                <span className="text-[10px] text-zinc-200 font-bold truncate">{duality.alignment}</span>
            </div>
            <div className="bg-zinc-900/80 p-3 flex flex-col gap-1">
                <span className="text-[8px] text-zinc-500 uppercase font-bold tracking-wider">Mask Integrity</span>
                <span className={`text-[10px] font-bold truncate ${duality.integrityColor} drop-shadow-sm`}>
                    {duality.maskIntegrity}
                </span>
            </div>
        </div>
    </div>
);

// 5. ACTIVE MEMORY (REFINED CHIPS UI)
export const ActiveMemory = ({ memory }: { memory: NeuralProfile['memory'] }) => (
    <div className="relative">
        <div className="flex justify-between items-center mb-2">
            <ModuleHeader icon={Brain} title="Active Engrams" color="text-emerald-400" />
            <div className="flex gap-1">
                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="w-1 h-1 bg-emerald-500/50 rounded-full"></span>
            </div>
        </div>
        
        <div className="bg-black/40 border border-emerald-500/10 p-3 rounded-xl relative overflow-hidden group">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98105_1px,transparent_1px),linear-gradient(to_bottom,#10b98105_1px,transparent_1px)] bg-[size:12px_12px] pointer-events-none"></div>
            
            {/* Scanning Line */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent animate-scan opacity-30 pointer-events-none"></div>
            
            <div className="flex flex-wrap gap-2 relative z-10">
                {memory.focus.length === 0 ? (
                    <span className="text-[9px] text-zinc-600 italic font-mono px-1">Scanning context stream...</span>
                ) : (
                    memory.focus.map((keyword, i) => (
                        <div 
                            key={i} 
                            className="
                                flex items-center pl-2 pr-3 py-1 rounded-[4px] 
                                bg-emerald-950/30 border-l-2 border-emerald-500/40 
                                hover:bg-emerald-900/30 hover:border-emerald-400 
                                transition-all duration-300 cursor-default group/chip
                            "
                        >
                            <span className="text-[10px] font-bold text-emerald-400/80 group-hover/chip:text-emerald-300 tracking-wide uppercase font-mono">
                                {keyword}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    </div>
);

// 6. SHARED MEMORIES (Replaces Core Directive)
interface SharedMemoriesProps {
    memories: string[]; // This will contain JSON strings
    onAdd: () => void;
    onDelete: (index: number) => void;
}

export const SharedMemoriesModule = ({ memories, onAdd, onDelete }: SharedMemoriesProps) => (
    <div className="pt-4 border-t border-white/5">
        <ModuleHeader 
            icon={Quote} 
            title="Shared Memories" 
            color="text-white" 
            action={
                <button 
                    onClick={onAdd}
                    className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors"
                    title="Implant New Memory"
                >
                    <Plus size={14} />
                </button>
            }
        />
        
        <div className="space-y-2 mt-2">
            {memories.length === 0 ? (
                <div className="text-[9px] text-zinc-600 italic text-center py-4 border border-dashed border-zinc-800 rounded-lg">
                    No shared memories anchored yet.
                </div>
            ) : (
                memories.slice().reverse().map((memStr, i) => {
                    let parsed;
                    try {
                        parsed = JSON.parse(memStr);
                        if (typeof parsed !== 'object' || !parsed.title) parsed = { title: memStr, description: "Raw memory fragment." };
                    } catch (e) {
                        parsed = { title: "Legacy Memory", description: memStr };
                    }

                    const originalIndex = memories.length - 1 - i;

                    return (
                        <div key={i} className="bg-zinc-900/40 border-l-2 border-white/20 pl-3 py-2 pr-2 hover:bg-zinc-900/80 hover:border-white/50 transition-all group cursor-default relative rounded-lg">
                            <div className="flex justify-between items-baseline pr-6">
                                <span className="text-[10px] font-bold text-zinc-300 group-hover:text-white transition-colors">
                                    "{parsed.title}"
                                </span>
                            </div>
                            <p className="text-[9px] text-zinc-500 leading-relaxed line-clamp-2 mt-0.5 group-hover:text-zinc-400 pr-6">
                                {parsed.description}
                            </p>
                            
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onDelete(originalIndex);
                                }}
                                className="absolute top-2 right-2 p-1.5 text-zinc-600 hover:text-red-400 bg-zinc-900/50 hover:bg-zinc-800 rounded-md transition-all opacity-50 group-hover:opacity-100 z-20"
                                title="Delete Memory"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    );
                })
            )}
        </div>
    </div>
);
