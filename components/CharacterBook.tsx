
import React, { useState } from 'react';
import { Character } from '../types';
import { X, Play, User, Brain, BookOpen, Fingerprint, Heart, Zap, Sparkles, Ruler, Shirt, Music, Activity, Shield, Info, Microscope, FileText, Lock, Eye, Dna, History, Globe, Calendar, Clock } from 'lucide-react';
import { t } from '../services/translationService';

interface CharacterBookProps {
  character: Character;
  onClose: () => void;
  onStartChat: () => void;
}

export const CharacterBook: React.FC<CharacterBookProps> = ({ character, onClose, onStartChat }) => {
  const [activeTab, setActiveTab] = useState<'identity' | 'psyche' | 'lore'>('identity');
  const isHiyori = character.id === 'char-hiyori';

  // Component: Stat Bar
  const StatBar = ({ label, value, color = "bg-violet-500" }: { label: string, value: number, color?: string }) => (
    <div className="mb-4 group">
      <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-500 mb-1.5 tracking-wider group-hover:text-zinc-300 transition-colors">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-zinc-800/50 rounded-full overflow-hidden border border-white/5">
        <div className={`h-full ${color} shadow-[0_0_10px_currentColor] transition-all duration-1000 ease-out`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );

  // Component: Info Tag
  const InfoTag = ({ icon: Icon, label, value }: any) => (
    <div className="bg-zinc-900/40 border border-white/5 p-3 rounded-xl flex items-start gap-3 hover:bg-zinc-800/60 hover:border-white/10 transition-all group">
        <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400 group-hover:text-white group-hover:bg-zinc-700 transition-colors shrink-0">
            <Icon size={16} />
        </div>
        <div>
            <span className="text-[9px] font-bold text-zinc-500 uppercase block mb-0.5 tracking-wide">{label}</span>
            <span className="text-xs text-zinc-200 font-medium leading-tight block">{value || 'Unknown'}</span>
        </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-black md:bg-black/90 md:backdrop-blur-xl overflow-y-auto custom-scrollbar animate-fade-in">
        
        {/* Close Button (Floating & Sticky) */}
        <button 
            onClick={onClose}
            className="fixed top-6 right-6 z-[110] p-2.5 bg-black/50 hover:bg-white text-white hover:text-black rounded-full transition-all backdrop-blur-md border border-white/10 group shadow-2xl"
        >
            <X size={24} className="group-hover:rotate-90 transition-transform" />
        </button>

        <div className="min-h-full w-full flex flex-col md:flex-row md:items-center md:justify-center md:p-8">
            
            {/* MAIN CARD CONTAINER */}
            <div className="w-full md:max-w-6xl bg-[#09090b] md:rounded-[3rem] md:border md:border-white/10 md:shadow-2xl overflow-hidden flex flex-col md:flex-row relative min-h-[100dvh] md:min-h-[85vh] md:h-[85vh]">
                
                {/* === LEFT COLUMN: VISUALS (Sticky on Desktop, Top on Mobile) === */}
                <div className="w-full md:w-5/12 relative group shrink-0 h-[55vh] md:h-full">
                    {/* Image with Gradient Fade */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent z-10 md:bg-gradient-to-r" />
                    <img 
                        src={character.avatar} 
                        className="w-full h-full object-cover object-top transition-transform duration-[30s] ease-linear group-hover:scale-110"
                        alt={character.name}
                    />
                    
                    {/* Character Overlay Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20 md:p-10 pb-16 md:pb-10">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="px-2.5 py-1 bg-violet-600 text-white text-[10px] font-bold uppercase rounded tracking-wider shadow-lg shadow-violet-900/50 flex items-center gap-1">
                                <Activity size={10} /> {character.role}
                            </span>
                            {isHiyori && (
                                <span className="px-2.5 py-1 bg-cyan-500/20 text-cyan-200 border border-cyan-500/30 text-[10px] font-bold uppercase rounded backdrop-blur-md flex items-center gap-1">
                                    <Dna size={10} /> Pure / Innocent
                                </span>
                            )}
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-white leading-none tracking-tighter drop-shadow-2xl mb-3">
                            {character.name}
                        </h1>
                        <div className="relative pl-3 border-l-2 border-violet-500 bg-gradient-to-r from-black/60 to-transparent p-2 rounded-r-xl backdrop-blur-sm">
                            <p className="text-xs md:text-sm text-zinc-200 font-medium italic leading-relaxed">
                                "{character.communication.openingLine}"
                            </p>
                        </div>
                    </div>
                </div>

                {/* === RIGHT COLUMN: DATA SCROLL === */}
                <div className="w-full md:w-7/12 flex flex-col bg-zinc-950 relative -mt-8 md:mt-0 rounded-t-[2.5rem] md:rounded-none z-20 border-t border-white/10 md:border-t-0 border-l-0 md:border-l overflow-hidden h-full">
                    
                    {/* Navigation Tabs (Sticky) */}
                    <div className="flex border-b border-white/5 px-6 pt-6 pb-0 bg-zinc-950/80 backdrop-blur-md z-30 sticky top-0 shrink-0">
                        {[
                            { id: 'identity', label: t('book.tab.identity'), icon: Fingerprint },
                            { id: 'psyche', label: t('book.tab.psyche'), icon: Brain },
                            { id: 'lore', label: t('book.tab.lore'), icon: History },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`
                                    flex-1 pb-4 text-[10px] md:text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all relative
                                    ${activeTab === tab.id ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}
                                `}
                            >
                                <tab.icon size={14} className={activeTab === tab.id ? 'text-violet-400' : ''} />
                                {tab.label}
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 shadow-[0_0_15px_#8b5cf6]" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Scrollable Content Area */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar relative z-10 pb-32">
                        {/* Noise Texture */}
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay fixed"></div>

                        {activeTab === 'identity' && (
                            <div className="space-y-6 animate-fade-in">
                                {/* HIYORI SPECIAL: Psychological Report */}
                                {isHiyori && (
                                    <div className="bg-gradient-to-br from-blue-950/30 to-zinc-900 border border-blue-500/20 p-5 rounded-2xl relative overflow-hidden group">
                                        <div className="absolute -right-6 -top-6 text-blue-500/5 group-hover:text-blue-500/10 transition-colors duration-500">
                                            <Microscope size={140} />
                                        </div>
                                        <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <FileText size={14} /> Subject Analysis: Psychological Impact
                                        </h3>
                                        <div className="relative z-10 space-y-3">
                                            <p className="text-xs text-blue-100/80 leading-relaxed font-light">
                                                <strong>Core Mechanism:</strong> "Comfort = Safety". Hiyori associates her glossy home clothes with parental love and safety. She wears them not for display, but to feel secure.
                                            </p>
                                            <div className="h-px w-full bg-blue-500/20"></div>
                                            <p className="text-xs text-blue-100/80 leading-relaxed font-light">
                                                <strong>Social Defense:</strong> "Safety = Not Observed". She is terrified of being noticed or judged. If she feels "seen", she retreats. She prefers loose clothes in public to become invisible.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* NEW: Personal Data Matrix (Expanded Identity) */}
                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-white/5 pb-1">{t('book.sect.personal')}</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <InfoTag icon={Dna} label={t('book.label.species')} value={character.species} />
                                        <InfoTag icon={Globe} label={t('book.label.origin')} value={character.originWorld} />
                                        <InfoTag icon={User} label={t('book.label.gender')} value={character.gender} />
                                        <InfoTag icon={Calendar} label={t('book.label.birthday')} value={character.birthday} />
                                        <InfoTag icon={Clock} label={t('book.label.age')} value={character.age} />
                                    </div>
                                </div>

                                <div className="space-y-3 mt-6">
                                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-white/5 pb-1">{t('book.sect.physical')}</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <InfoTag icon={Ruler} label={t('book.label.height')} value={character.appearance.height} />
                                        <InfoTag icon={Activity} label={t('book.label.build')} value={character.appearance.build} />
                                    </div>
                                    <InfoTag icon={Sparkles} label={t('book.label.features')} value={character.appearance.features} />
                                    <InfoTag icon={Shirt} label={t('book.label.style')} value={character.appearance.style} />
                                </div>
                                
                                <div className="bg-zinc-900/50 p-5 rounded-2xl border border-white/5 mt-4 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-5">
                                        <Music size={80} />
                                    </div>
                                    <div className="flex items-center gap-2 mb-4 text-violet-400">
                                        <Music size={16} />
                                        <span className="text-xs font-bold uppercase tracking-wider">{t('book.sect.voice')}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3 text-center relative z-10">
                                        <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                                            <span className="block text-[9px] text-zinc-500 uppercase mb-1">{t('book.label.tone')}</span>
                                            <span className="text-xs text-white font-bold">{character.communication.voiceConfig.tone}</span>
                                        </div>
                                        <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                                            <span className="block text-[9px] text-zinc-500 uppercase mb-1">{t('book.label.pitch')}</span>
                                            <span className="text-xs text-white font-bold">{character.communication.voiceConfig.pitch}x</span>
                                        </div>
                                        <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                                            <span className="block text-[9px] text-zinc-500 uppercase mb-1">{t('book.label.v_style')}</span>
                                            <span className="text-xs text-white font-bold">{character.communication.style}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'psyche' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="bg-zinc-900/30 p-6 rounded-2xl border border-white/5">
                                    <h3 className="text-xs font-bold text-white uppercase mb-6 flex items-center gap-2 border-b border-white/5 pb-3">
                                        <Brain size={14} className="text-violet-400"/> Psychometrics
                                    </h3>
                                    <StatBar label={t('forge.label.openness')} value={character.psychometrics.openness} color="bg-blue-500" />
                                    <StatBar label={t('forge.label.conscientiousness')} value={character.psychometrics.conscientiousness} color="bg-emerald-500" />
                                    <StatBar label={t('forge.label.extraversion')} value={character.psychometrics.extraversion} color="bg-orange-500" />
                                    <StatBar label={t('forge.label.agreeableness')} value={character.psychometrics.agreeableness} color="bg-pink-500" />
                                    <StatBar label={t('forge.label.empathy')} value={character.psychometrics.empathy} color="bg-cyan-500" />
                                </div>

                                {/* HIYORI SPECIAL: Observation Log */}
                                {isHiyori && (
                                    <div className="bg-black/40 p-5 rounded-2xl border border-zinc-800 relative">
                                        <div className="absolute top-4 right-4 text-zinc-700 animate-pulse">
                                            <Eye size={20} />
                                        </div>
                                        <h4 className="text-[10px] font-bold text-zinc-500 uppercase mb-4 flex items-center gap-2">
                                            Behavioral Observations
                                        </h4>
                                        <ul className="space-y-3">
                                            <li className="flex gap-3 text-xs text-zinc-400">
                                                <span className="text-red-500 font-mono">01.</span>
                                                <span>Constantly seeks reassurance and permission.</span>
                                            </li>
                                            <li className="flex gap-3 text-xs text-zinc-400">
                                                <span className="text-red-500 font-mono">02.</span>
                                                <span>Fidgets with clothes when feeling "observed".</span>
                                            </li>
                                            <li className="flex gap-3 text-xs text-zinc-400">
                                                <span className="text-red-500 font-mono">03.</span>
                                                <span>Does not understand adult subtext. Innocent responses.</span>
                                            </li>
                                            <li className="flex gap-3 text-xs text-zinc-300 bg-white/5 p-2 rounded">
                                                <span className="text-violet-400 font-mono">NOTE:</span>
                                                <span>Treat with gentle guidance. High dependency.</span>
                                            </li>
                                        </ul>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 gap-3">
                                    <div className="bg-rose-950/10 p-4 rounded-xl border border-rose-500/10 flex gap-4 items-center">
                                        <div className="p-3 bg-rose-500/10 rounded-full text-rose-500 shrink-0"><Heart size={18}/></div>
                                        <div>
                                            <h4 className="text-[10px] font-bold text-rose-400 uppercase mb-1">{t('forge.label.joy')}</h4>
                                            <p className="text-xs text-rose-100/70 leading-relaxed">{character.emotionalProfile.joyTriggers}</p>
                                        </div>
                                    </div>
                                    <div className="bg-yellow-950/10 p-4 rounded-xl border border-yellow-500/10 flex gap-4 items-center">
                                        <div className="p-3 bg-yellow-500/10 rounded-full text-yellow-500 shrink-0"><Zap size={18}/></div>
                                        <div>
                                            <h4 className="text-[10px] font-bold text-yellow-400 uppercase mb-1">{t('forge.label.anger')}</h4>
                                            <p className="text-xs text-yellow-100/70 leading-relaxed">{character.emotionalProfile.angerTriggers}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'lore' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="bg-zinc-900/30 p-6 rounded-2xl border border-white/5">
                                    <h3 className="text-xs font-bold text-zinc-400 uppercase border-b border-white/10 pb-3 mb-4 flex items-center gap-2">
                                        <Info size={14} /> {t('forge.label.backstory')}
                                    </h3>
                                    <p className="text-zinc-300 leading-relaxed text-sm whitespace-pre-wrap font-light tracking-wide">
                                        {character.lore.backstory}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-zinc-500 uppercase border-b border-white/10 pb-2">Classified Archives</h3>
                                    
                                    <div className="bg-red-950/5 border border-red-500/20 p-5 rounded-2xl relative overflow-hidden group hover:bg-red-950/10 transition-colors">
                                        <div className="absolute -right-4 -top-4 text-red-500/5 group-hover:text-red-500/10 transition-colors">
                                            <Shield size={100} />
                                        </div>
                                        <h4 className="text-[10px] font-bold text-red-400 uppercase mb-2 flex items-center gap-2">
                                            <Lock size={12} /> {t('forge.label.secrets')}
                                        </h4>
                                        <p className="text-sm text-red-200/90 italic font-serif leading-relaxed relative z-10">
                                            "{character.lore.secrets}"
                                        </p>
                                    </div>
                                    
                                    {character.memory.obsessions && (
                                        <div className="bg-violet-950/5 border border-violet-500/20 p-5 rounded-2xl">
                                            <h4 className="text-[10px] font-bold text-violet-400 uppercase mb-2">{t('forge.label.obsessions')}</h4>
                                            <p className="text-sm text-violet-200/90">
                                                {character.memory.obsessions}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {/* Bottom Spacer to ensure content isn't hidden by sticky footer */}
                        <div className="h-10"></div>
                    </div>

                    {/* Footer Action (Sticky Bottom) */}
                    <div className="p-6 md:p-8 border-t border-white/5 bg-zinc-950/90 backdrop-blur-xl flex justify-between items-center gap-4 relative z-40 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                        <div className="hidden md:block">
                            <p className="text-[10px] text-zinc-500 font-mono">{t('book.ready')}</p>
                            <p className="text-[10px] text-zinc-600">v0.8.3</p>
                        </div>
                        <button 
                            onClick={onStartChat}
                            className="w-full md:w-auto px-8 py-4 bg-white text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(255,255,255,0.3)] active:scale-95 group"
                        >
                            {t('book.btn.init')} <Play size={14} fill="currentColor" className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
