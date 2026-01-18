
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Character } from '../../../types';
import { COMPLEX_SYSTEM_TEMPLATE, DEFAULT_CHARACTER_AVATAR } from '../../../constants';
import { analyzeAvatar } from '../../../services/geminiService';
import { getSettings } from '../../../services/storageService';
import { GoogleGenAI } from "@google/genai";
import { ImageCropper } from '../../../components/ImageCropper';
import { Button } from '../../../components/Button';
import { t } from '../../../services/translationService';
import { 
  ChevronLeft, ScanFace, Eye, Speaker, Activity, HeartHandshake, Scale, UserPlus, Layers, Sword, BookOpen, Brain, MapPin, Play, Dna,
  Sparkles, Crown, PanelLeftClose, PanelLeftOpen, Flower, X, Wind, CloudSun, Zap, Fingerprint, BrainCircuit, MessageCircle, Save, ArrowLeft
} from 'lucide-react';

// --- REALISM CONFIG COMPONENTS ---
import { AutoConfigButton, InputField } from './SharedComponents';
import { IdentityConfig } from './IdentityConfig';
import { VisualsConfig } from './VisualsConfig';
import { VoiceConfig } from './VoiceConfig';
import { PsycheConfig } from './PsycheConfig';
import { EmotionalConfig } from './EmotionalConfig';
import { ScenarioConfig } from './ScenarioConfig';
import { MiniNeuralForge } from './MiniNeuralForge'; 

// --- EXTERNAL UTILS ---
import { calculateCoherenceScore } from '../ExternalConfiguration';
import { analyzeNeuralCoherence } from '../NeuralThinking';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const SUGGESTIONS: Record<string, string[]> = {
    style: ["Worn leather aviator jacket", "Pristine white lab coat", "Neon-lit cybernetics", "Victorian gothic dress", "Tactical stealth gear"],
    joy: ["Discovering ancient technology", "The sound of rain", "Completing a mission", "Sweet pastries", "Seeing the user fail"],
    anger: ["Being interrupted", "Incompetence", "Mentioning creator", "Disrespect", "Loud noises"],
    sadness: ["Memories of War", "Being alone", "Corrupted data", "Loss of body", "Dead bird"],
    alignment: ["Chaotic Good", "Lawful Evil", "True Neutral", "Neutral Good", "Chaotic Neutral"],
    values: ["Knowledge", "Protect the weak", "Survival", "Truth", "Loyalty"],
    interaction: ["Cold professional", "Warm motherly", "Flirty dangerous", "Shy stuttering", "Arrogant"],
    skills: ["Quantum cryptography", "Heavy weapons", "Hacking", "Swordplay", "Piloting"],
    flaws: ["Arrogance", "Weak knee", "Addiction", "Fear of silence", "Literal-minded"],
    trust: ["Blindly Trusting", "Skeptical", "Paranoid", "Verifies Everything"],
    battery: ["Infinite", "Recharges in Solitude", "Needs Stimulation", "Drains Quickly"]
};

interface RealismForgeProps {
  initialData?: Character;
  onSave: (character: Character) => void;
  onCancel: () => void;
  onScroll?: (metrics: { scrollTop: number; clientHeight: number; scrollHeight: number }) => void;
}

type ForgeSection = 'identity' | 'visuals' | 'voice' | 'psyche' | 'emotional' | 'moral' | 'social' | 'duality' | 'capabilities' | 'lore' | 'memory' | 'scenario';

const MODULES = [
    { id: 'identity', icon: <ScanFace size={18}/>, labelKey: 'forge.mod.identity' },
    { id: 'visuals', icon: <Eye size={18}/>, labelKey: 'forge.mod.visuals' },
    { id: 'voice', icon: <Speaker size={18}/>, labelKey: 'forge.mod.voice' },
    { id: 'psyche', icon: <Activity size={18}/>, labelKey: 'forge.mod.psyche' },
    { id: 'emotional', icon: <HeartHandshake size={18}/>, labelKey: 'forge.mod.emotional' },
    { id: 'moral', icon: <Scale size={18}/>, labelKey: 'forge.mod.moral' },
    { id: 'social', icon: <UserPlus size={18}/>, labelKey: 'forge.mod.social' },
    { id: 'duality', icon: <Layers size={18}/>, labelKey: 'forge.mod.duality' },
    { id: 'capabilities', icon: <Sword size={18}/>, labelKey: 'forge.mod.capabilities' },
    { id: 'lore', icon: <BookOpen size={18}/>, labelKey: 'forge.mod.lore' },
    { id: 'memory', icon: <Brain size={18}/>, labelKey: 'forge.mod.memory' },
    { id: 'scenario', icon: <MapPin size={18}/>, labelKey: 'forge.mod.scenario' },
];

// --- REALISM ANALYSIS MODAL ---
const RealismAnalysisModal = ({ 
    score, 
    formData, 
    onClose 
}: { 
    score: number, 
    formData: Partial<Character>, 
    onClose: () => void 
}) => {
    const analysis = useMemo(() => analyzeNeuralCoherence(formData), [formData]);
    const [animate, setAnimate] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        requestAnimationFrame(() => setAnimate(true));
    }, []);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 300);
    };

    const radius = 58;
    const circumference = 2 * Math.PI * radius;
    const progressOffset = circumference - (score / 100) * circumference;

    const MetricBar = ({ label, value, icon: Icon, color }: any) => (
        <div className="mb-4 group">
            <div className="flex justify-between items-end mb-1.5">
                <div className="flex items-center gap-2 text-slate-500 group-hover:text-blue-600 transition-colors">
                    <Icon size={14} className={color} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
                </div>
                <span className={`text-[10px] font-mono font-bold ${color}`}>{Math.round(value)}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden border border-slate-300 relative">
                <div 
                    className={`h-full transition-all duration-1000 ease-out ${color.replace('text-', 'bg-')} relative`} 
                    style={{ width: animate ? `${value}%` : '0%' }}
                >
                </div>
            </div>
        </div>
    );

    return (
        <div className={`fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`} onClick={handleClose}>
            <div className={`
                w-full max-w-md bg-gradient-to-b from-white to-blue-50 border border-blue-200 rounded-3xl shadow-2xl overflow-hidden relative flex flex-col max-h-[85vh]
                transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1) transform
                ${isClosing ? 'scale-95 translate-y-4 opacity-0' : 'scale-100 translate-y-0 opacity-100 animate-in fade-in zoom-in-95 slide-in-from-bottom-4'}
            `} onClick={e => e.stopPropagation()}>
                
                <div className="absolute top-[-50px] right-[-50px] text-blue-200/40 pointer-events-none animate-[spin_60s_linear_infinite]">
                    <Flower size={200} strokeWidth={0.5} />
                </div>
                <div className="absolute bottom-[-30px] left-[-30px] text-blue-200/30 pointer-events-none rotate-45">
                    <Flower size={150} strokeWidth={0.5} />
                </div>

                <div className="p-6 relative z-10 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Activity size={18} className="text-blue-500" />
                                Realism Analysis
                            </h3>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mt-1">Story Mode Engine V2.1</p>
                        </div>
                        <button onClick={handleClose} className="p-1.5 text-slate-400 hover:text-slate-800 transition-colors bg-slate-100 hover:bg-slate-200 rounded-full active:scale-90">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="flex flex-col items-center mb-8 relative">
                        <div className="relative w-40 h-40 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90 drop-shadow-lg" viewBox="0 0 128 128">
                                <circle cx="64" cy="64" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-200" />
                                <circle cx="64" cy="64" r={radius} stroke="#3b82f6" strokeWidth="6" fill="transparent" strokeDasharray={circumference} strokeDashoffset={animate ? progressOffset : circumference} strokeLinecap="round" className="transition-all duration-[1.5s] ease-out" />
                            </svg>
                            
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-black text-blue-600 tracking-tighter">
                                    {Math.round(score)}
                                </span>
                                <span className="text-[9px] text-slate-500 font-bold uppercase mt-1 tracking-widest">Depth</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 mb-6 bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-blue-100 shadow-sm">
                        <MetricBar label="Psychometric Depth" value={analysis.breakdown.psyche} icon={BrainCircuit} color="text-pink-500" />
                        <MetricBar label="Internal Conflict" value={analysis.breakdown.duality} icon={Layers} color="text-violet-500" />
                        <MetricBar label="Narrative Weight" value={analysis.breakdown.lore} icon={BookOpen} color="text-amber-500" />
                        <MetricBar label="Identity Definition" value={analysis.breakdown.identity} icon={Fingerprint} color="text-blue-500" />
                        <MetricBar label="Human Imperfection" value={analysis.breakdown.complexity} icon={ScanFace} color="text-red-500" />
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 border-b border-blue-100 pb-1">System Detection Logs</h4>
                        {analysis.details.length > 0 ? (
                            analysis.details.map((detail, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-[10px] text-slate-600 font-mono bg-white p-2.5 rounded-lg border border-slate-200 animate-fade-in shadow-sm" style={{ animationDelay: `${idx * 100}ms` }}>
                                    <Zap size={10} className="text-blue-500 shrink-0" />
                                    {detail}
                                </div>
                            ))
                        ) : (
                            <div className="text-[10px] text-slate-400 italic text-center py-2">Insufficient data for detailed analysis.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const RealismForge: React.FC<RealismForgeProps> = ({ initialData, onSave, onCancel, onScroll }) => {
  const settings = getSettings();
  const [activeSection, setActiveSection] = useState<ForgeSection>('identity');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [memoryInput, setMemoryInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  // MINI NEURAL FORGE STATE
  const [showMiniForge, setShowMiniForge] = useState(false);
  
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
      if (window.innerWidth >= 768) {
          setIsSidebarCollapsed(false);
      }
  }, []);

  const [formData, setFormData] = useState<Partial<Character>>(initialData || {
    id: crypto.randomUUID(),
    name: '', description: '', avatar: '', age: '', birthday: '', gender: '', species: '', originWorld: '', role: '',
    appearance: { height: '', build: '', features: '', style: '' },
    psychometrics: { openness: 50, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 50, decisionStyle: 50, empathy: 50 },
    emotionalProfile: { stability: '', joyTriggers: '', angerTriggers: '', sadnessTriggers: '' },
    moralProfile: { alignment: '', values: '', philosophy: '' },
    socialProfile: { socialBattery: '', trustFactor: '', interactionStyle: '' },
    duality: { mask: '', core: '', breakingPoint: '' },
    capabilities: { skills: '', flaws: '' },
    lore: { backstory: '', secrets: '', allies: '', enemies: '', userRelationship: '' },
    memory: { memories: [], obsessions: '' },
    scenario: { currentLocation: '', currentActivity: '', startTime: { year: '2150', month: '01', day: '01', hour: '08', minute: '00' } },
    communication: { style: 'casual', sentenceLength: 'balanced', vocabularyLevel: 'average', emotionalRelay: 'balanced', quirks: '', openingLine: '', voiceConfig: { pitch: 1.0, speed: 1.0, tone: 'Neutral' } },
    modelConfig: { modelName: settings.defaultModel || 'gemini-2.5-flash', temperature: settings.defaultTemperature || 0.7 }
  });

  const coherenceScore = useMemo(() => calculateCoherenceScore(formData), [formData]);

  const handleExit = (callback: () => void) => {
      setIsExiting(true);
      setTimeout(callback, 400); 
  };

  const handleFileSelection = (file: File) => {
     if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setCropImage(reader.result as string);
        reader.readAsDataURL(file);
     }
  };
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelection(file);
    e.target.value = '';
  };
  const handleCropComplete = (base64: string) => {
      setFormData(prev => ({ ...prev, avatar: base64 }));
      setCropImage(null);
  };
  const handleAutoAnalyze = async () => {
    if (!formData.avatar) return;
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeAvatar(formData.avatar);
      setFormData(prev => ({ 
          ...prev, 
          description: analysis,
          appearance: { ...prev.appearance!, features: "Based on visual analysis..." } 
      }));
    } catch (e) { alert(t('forge.error.analysis')); } finally { setIsAnalyzing(false); }
  };
  const handleAutoGenerate = async (section: string) => {
      setIsGenerating(prev => ({...prev, [section]: true}));
      const sectionKeyMap: Record<string, string> = {
          'visuals': 'appearance', 'voice': 'communication', 'psyche': 'psychometrics',
          'emotional': 'emotionalProfile', 'moral': 'moralProfile', 'social': 'socialProfile',
          'memory': 'memory', 'scenario': 'scenario'
      };
      const targetKey = sectionKeyMap[section] || section;
      try {
          const response = await ai.models.generateContent({
              model: "gemini-2.5-flash",
              contents: `You are a creative character writer. Based on this partial character data: ${JSON.stringify(formData)}, generate a JSON object for the '${targetKey}' property. Make it realistic and coherent.`,
              config: { responseMimeType: "application/json" }
          });
          const result = JSON.parse(response.text || "{}");
          setFormData(prev => ({ ...prev, [targetKey]: { ...prev[targetKey as keyof Character] as any, ...result } }));
      } catch (e) { console.error("Auto-Config Failed", e); }
      setIsGenerating(prev => ({...prev, [section]: false}));
  };

  const addMemory = () => {
      if(memoryInput.trim()) {
          setFormData(prev => ({
              ...prev,
              memory: {
                  ...prev.memory!,
                  memories: [...(prev.memory?.memories || []), memoryInput.trim()]
              }
          }));
          setMemoryInput('');
      }
  };

  const compileSystemInstruction = () => {
      const d = formData;
      let prompt = COMPLEX_SYSTEM_TEMPLATE;
      prompt = prompt.replace('{{NAME}}', d.name || 'Unknown').replace('{{ROLE}}', d.role || 'Unknown');
      prompt = prompt.replace('{{SPECIES}}', d.species || 'Human');
      prompt = prompt.replace('{{ORIGIN_WORLD}}', d.originWorld || 'Earth');
      prompt = prompt.replace('{{AGE}}', d.age || '?');
      prompt = prompt.replace('{{GENDER}}', d.gender || '?');
      prompt = prompt.replace('{{HEIGHT}}', d.appearance?.height || '');
      prompt = prompt.replace('{{BUILD}}', d.appearance?.build || '');
      prompt = prompt.replace('{{FEATURES}}', d.appearance?.features || '');
      prompt = prompt.replace('{{STYLE}}', d.appearance?.style || '');
      prompt = prompt.replace('{{OPENNESS}}', String(d.psychometrics?.openness));
      prompt = prompt.replace('{{CONSCIENTIOUSNESS}}', String(d.psychometrics?.conscientiousness));
      prompt = prompt.replace('{{EXTRAVERSION}}', String(d.psychometrics?.extraversion));
      prompt = prompt.replace('{{AGREEABLENESS}}', String(d.psychometrics?.agreeableness));
      prompt = prompt.replace('{{NEUROTICISM}}', String(d.psychometrics?.neuroticism));
      prompt = prompt.replace('{{DECISION_STYLE}}', String(d.psychometrics?.decisionStyle));
      prompt = prompt.replace('{{EMPATHY}}', String(d.psychometrics?.empathy));
      prompt = prompt.replace('{{STABILITY}}', d.emotionalProfile?.stability || 'Stable');
      prompt = prompt.replace('{{JOY_TRIGGERS}}', d.emotionalProfile?.joyTriggers || '');
      prompt = prompt.replace('{{ANGER_TRIGGERS}}', d.emotionalProfile?.angerTriggers || '');
      prompt = prompt.replace('{{SADNESS_TRIGGERS}}', d.emotionalProfile?.sadnessTriggers || '');
      prompt = prompt.replace('{{ALIGNMENT}}', d.moralProfile?.alignment || 'Neutral');
      prompt = prompt.replace('{{VALUES}}', d.moralProfile?.values || '');
      prompt = prompt.replace('{{SOCIAL_BATTERY}}', d.socialProfile?.socialBattery || '');
      prompt = prompt.replace('{{INTERACTION_STYLE}}', d.socialProfile?.interactionStyle || '');
      prompt = prompt.replace('{{TRUST_FACTOR}}', d.socialProfile?.trustFactor || '');
      prompt = prompt.replace('{{MASK}}', d.duality?.mask || '');
      prompt = prompt.replace('{{CORE}}', d.duality?.core || '');
      prompt = prompt.replace('{{BREAKING_POINT}}', d.duality?.breakingPoint || '');
      prompt = prompt.replace('{{SKILLS}}', d.capabilities?.skills || '');
      prompt = prompt.replace('{{FLAWS}}', d.capabilities?.flaws || '');
      prompt = prompt.replace('{{BACKSTORY}}', d.lore?.backstory || '');
      prompt = prompt.replace('{{SECRETS}}', d.lore?.secrets || '');
      prompt = prompt.replace('{{ALLIES}}', d.lore?.allies || '');
      prompt = prompt.replace('{{ENEMIES}}', d.lore?.enemies || '');
      prompt = prompt.replace('{{USER_RELATIONSHIP}}', d.lore?.userRelationship || 'Stranger');
      prompt = prompt.replace('{{MEMORIES}}', d.memory?.memories?.join('; ') || '');
      prompt = prompt.replace('{{OBSESSIONS}}', d.memory?.obsessions || '');
      prompt = prompt.replace('{{LOCATION}}', d.scenario?.currentLocation || 'Void');
      prompt = prompt.replace('{{ACTION}}', d.scenario?.currentActivity || 'Waiting');
      prompt = prompt.replace('{{USER_NAME}}', settings.userName || 'User');
      prompt = prompt.replace('{{VOCABULARY}}', d.communication?.vocabularyLevel || 'Average');
      prompt = prompt.replace('{{EMOTIONAL_RELAY}}', d.communication?.emotionalRelay || 'Balanced');
      prompt = prompt.replace('{{VOICE_TONE}}', d.communication?.voiceConfig.tone || 'Neutral');
      prompt = prompt.replace('{{PITCH}}', String(d.communication?.voiceConfig.pitch));
      prompt = prompt.replace('{{SPEED}}', String(d.communication?.voiceConfig.speed));
      prompt = prompt.replace('{{QUIRKS}}', d.communication?.quirks || '');
      prompt = prompt.replace('{{OPENING_LINE}}', d.communication?.openingLine || 'Hello');
      return prompt;
  };

  const handleSave = () => {
    if (!formData.name) { alert("Identity designation (Name) is required."); return; }
    const fullCharacter: Character = {
      ...formData as Character,
      avatar: formData.avatar || DEFAULT_CHARACTER_AVATAR,
      systemInstruction: compileSystemInstruction(),
      lastUpdated: Date.now()
    };
    handleExit(() => onSave(fullCharacter));
  };

  return (
    <div 
        className={`
            h-full flex flex-col bg-zinc-950 relative overflow-hidden transition-all duration-500 ease-in-out font-sans text-zinc-200
            ${isExiting ? 'opacity-0 scale-[0.98] translate-y-4' : 'opacity-100 scale-100 translate-y-0 animate-in fade-in slide-in-from-bottom-2'}
        `}
    >
        {cropImage && <ImageCropper imageSrc={cropImage} onCancel={() => setCropImage(null)} onCrop={handleCropComplete} />}
        
        {/* Analysis Pop-up Card */}
        {showAnalysis && (
            <RealismAnalysisModal score={coherenceScore} formData={formData} onClose={() => setShowAnalysis(false)} />
        )}

        {/* HEADER */}
        <div className="hidden md:flex h-14 px-4 border-b border-white/10 items-center justify-between bg-zinc-950/90 backdrop-blur-md z-50 shrink-0 shadow-lg">
            <div className="flex items-center gap-4">
                <button onClick={() => handleExit(onCancel)} className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/5">
                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-widest">{t('forge.exit')}</span>
                </button>
                <div className="h-4 w-[1px] bg-white/10 mx-1"></div>
                <h2 className="text-xs font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2">
                    <Crown size={14} className="text-blue-400 fill-blue-400/20" />
                    {t('forge.title')} <span className="text-blue-400 font-mono tracking-widest bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 text-[8px]">STORY MODE</span>
                </h2>
            </div>
            
            {/* Header Actions - Conditional based on MiniForge */}
            {showMiniForge ? (
                <button 
                    onClick={() => setShowMiniForge(false)}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-[10px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-lg shadow-lg transition-all active:scale-95"
                >
                    <Save size={12} fill="currentColor" />
                    Save & Back to NRF
                </button>
            ) : (
                <button 
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-400 hover:to-cyan-300 text-white font-black text-[10px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-lg shadow-[0_0_15px_rgba(56,189,248,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 border border-cyan-400/50"
                >
                    <Play size={12} fill="currentColor" />
                    {t('forge.materialize')}
                </button>
            )}
        </div>

        {/* MOBILE HEADER */}
        <div className="md:hidden h-14 px-4 border-b border-white/10 flex items-center justify-between bg-zinc-950/90 backdrop-blur-lg z-50 sticky top-0 shrink-0 shadow-lg shadow-black/20">
             <div className="flex items-center gap-3">
                 <button onClick={() => handleExit(onCancel)} className="p-2 -ml-2 text-zinc-400 hover:text-white">
                     <ChevronLeft size={20} />
                 </button>
                 <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                     <Crown size={12}/> Story Mode
                 </span>
             </div>
             
             {showMiniForge ? (
                 <button onClick={() => setShowMiniForge(false)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-md">
                     Save & Back
                 </button>
             ) : (
                 <div className="flex items-center gap-2">
                     <button 
                        onClick={() => setShowMiniForge(true)}
                        className="p-2 rounded-lg transition-colors text-zinc-400 hover:bg-white/10"
                     >
                        <MessageCircle size={18} />
                     </button>
                     <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-md">
                         SAVE
                     </button>
                 </div>
             )}
        </div>

        {/* CONTENT */}
        <div className="flex-1 flex overflow-hidden relative z-10 flex-row">
            
            {/* SIDEBAR (HIYORI THEME: White/Blue + Flower) */}
            <div className={`
                flex flex-shrink-0 flex-col transition-all duration-300 ease-in-out z-20 relative overflow-hidden
                ${isSidebarCollapsed ? 'w-[50px] md:w-[60px] items-center' : 'w-64'}
                bg-gradient-to-b from-white via-blue-50 to-blue-100 border-r border-blue-200/50
            `}>
                {/* Decorative Flower Background */}
                <div className="absolute -top-10 -right-10 text-blue-200/40 pointer-events-none animate-[spin_60s_linear_infinite]">
                    <Flower size={200} strokeWidth={0.5} />
                </div>
                <div className="absolute bottom-10 -left-10 text-blue-300/20 pointer-events-none">
                    <Flower size={150} strokeWidth={0.5} />
                </div>

                {/* Desktop Toggle Header */}
                <div className={`hidden md:flex items-center p-3 border-b border-blue-200/30 relative z-10 ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
                    {!isSidebarCollapsed && <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-2">Protocols</span>}
                    <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="text-slate-400 hover:text-blue-600 p-1 rounded hover:bg-blue-100 transition-colors">
                        {isSidebarCollapsed ? <PanelLeftOpen size={16}/> : <PanelLeftClose size={16}/>}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-1 md:p-2 space-y-2 w-full pt-4 md:pt-2 relative z-10">
                    
                    {!showMiniForge && MODULES.map(mod => (
                        <button 
                            key={mod.id} 
                            onClick={() => setActiveSection(mod.id as any)}
                            title={isSidebarCollapsed ? t(mod.labelKey) : ''}
                            className={`
                                flex items-center rounded-lg transition-all duration-200 group relative border
                                ${isSidebarCollapsed ? 'justify-center p-2 w-10 h-10' : 'w-full p-2 gap-3 text-left'}
                                ${activeSection === mod.id 
                                    ? 'bg-blue-100/80 border-blue-200 text-blue-600 shadow-sm' 
                                    : 'text-slate-500 hover:text-blue-500 hover:bg-white/60 border-transparent'}
                            `}
                        >
                            <div className={`transition-colors ${activeSection === mod.id ? 'text-blue-500' : 'text-slate-400 group-hover:text-blue-400'}`}>
                                {React.cloneElement(mod.icon as any, { size: 18 })}
                            </div>
                            {!isSidebarCollapsed && <span className="text-[11px] font-bold uppercase tracking-widest flex-1 truncate font-sans">{t(mod.labelKey)}</span>}
                            
                            {!isSidebarCollapsed && activeSection === mod.id && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />}
                        </button>
                    ))}
                </div>
                
                {/* BOTTOM SIDEBAR ACTIONS */}
                <div className="p-2 border-t border-blue-200/30 bg-white/40 backdrop-blur-sm relative z-10 space-y-1 flex flex-col">
                    
                    {/* MINI FORGE TOGGLE (Moved Here) */}
                    {!showMiniForge && (
                        <button 
                            onClick={() => setShowMiniForge(true)}
                            className={`
                                w-full flex items-center justify-center rounded-lg transition-all duration-200 group relative border
                                ${isSidebarCollapsed ? 'p-2 aspect-square' : 'p-2.5 gap-3 text-left justify-start'}
                                bg-white/50 border-blue-100 hover:bg-white hover:border-blue-300 text-slate-500 hover:text-blue-600 shadow-sm
                            `}
                            title="Mini Neural Forge"
                        >
                            <div className={`transition-colors text-blue-400 group-hover:text-blue-600`}>
                                <MessageCircle size={18} />
                            </div>
                            {!isSidebarCollapsed && (
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold uppercase tracking-widest font-sans text-slate-600 group-hover:text-blue-600">Mini Forge</span>
                                    <span className="text-[8px] text-slate-400 leading-none">NPC Roster</span>
                                </div>
                            )}
                        </button>
                    )}

                    {/* COHERENCE METER - HIDDEN WHEN MINI FORGE IS ACTIVE */}
                    {!showMiniForge && (
                        <div 
                            onClick={() => setShowAnalysis(true)}
                            className={`
                                cursor-pointer hover:bg-white/60 transition-colors group rounded-lg border border-transparent hover:border-blue-100
                                ${isSidebarCollapsed ? 'p-1 flex flex-col items-center justify-center gap-1' : 'p-2'}
                            `}
                        >
                            <div className={`flex items-center justify-between mb-1 ${isSidebarCollapsed ? 'hidden' : 'flex'}`}>
                                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-blue-600 transition-colors">Depth</span>
                                <span className="text-[9px] font-mono font-bold text-blue-600">{Math.round(coherenceScore)}%</span>
                            </div>
                            
                            <div className={`rounded-full bg-slate-200 overflow-visible relative ${isSidebarCollapsed ? 'w-1 h-6 mx-auto' : 'w-full h-1'}`}>
                                <div 
                                    className={`rounded-full shadow-[0_0_10px_rgba(59,130,246,0.6)] transition-all duration-1000 ${isSidebarCollapsed ? 'w-full bottom-0 absolute bg-blue-500' : 'h-full bg-gradient-to-r from-blue-400 to-cyan-400'}`}
                                    style={isSidebarCollapsed ? { height: `${coherenceScore}%` } : { width: `${coherenceScore}%` }}
                                ></div>
                            </div>

                            {/* Collapsed score explicitly shown */}
                            {isSidebarCollapsed && (
                                <span className="text-[8px] font-mono font-bold text-blue-600 mt-0.5">{Math.round(coherenceScore)}%</span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* MAIN PANEL (CONFIGURATIONS) */}
            <div 
                className={`
                    flex-1 overflow-y-auto bg-gradient-to-br from-white via-blue-50 to-blue-100 relative custom-scrollbar
                    ${showMiniForge ? 'p-0' : 'px-3 py-4 md:p-8 pt-6'}
                `}
                onScroll={(e) => onScroll?.({ scrollTop: e.currentTarget.scrollTop, clientHeight: e.currentTarget.clientHeight, scrollHeight: e.currentTarget.scrollHeight })}
            >
                {/* BACKGROUND DECORATIONS (ANIMATED SVGS) */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                    <Flower className="absolute top-10 right-10 text-blue-200/40 w-64 h-64 animate-[spin_60s_linear_infinite]" strokeWidth={0.5} />
                    <Sparkles className="absolute bottom-20 left-10 text-blue-300/30 w-32 h-32 animate-pulse-slow" />
                    <Wind className="absolute top-1/3 left-20 text-cyan-200/30 w-40 h-40 animate-float" strokeWidth={1} />
                    <CloudSun className="absolute top-20 left-1/2 text-blue-100/50 w-24 h-24" />
                    <Sparkles className="absolute bottom-10 right-20 text-blue-200/30 w-16 h-16 animate-pulse" />
                </div>

                <div className={`
                    relative z-10 animate-fade-in
                    ${showMiniForge ? 'w-full h-full' : 'max-w-3xl mx-auto pb-32 md:pb-10'}
                `}>
                    
                    {showMiniForge ? (
                        <div className="h-full w-full relative z-50 flex flex-col shadow-2xl bg-zinc-950/95 backdrop-blur-xl">
                            <MiniNeuralForge onBack={() => setShowMiniForge(false)} />
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-6 pb-4 border-b border-blue-200/50 gap-4">
                                <h3 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-[0.1em] flex items-center gap-3 font-sans">
                                    {t(`forge.mod.${activeSection}`)} 
                                    <span className="text-blue-200 text-lg hidden md:inline">//</span>
                                    <span className="text-slate-400 text-xs font-sans font-bold tracking-widest hidden md:inline">{t('forge.header.config')}</span>
                                </h3>
                                <AutoConfigButton sectionName={activeSection} onClick={() => handleAutoGenerate(activeSection)} isGenerating={!!isGenerating[activeSection]} />
                            </div>

                            {activeSection === 'identity' && <IdentityConfig formData={formData} setFormData={setFormData} fileInputRef={fileInputRef} handleImageUpload={handleImageUpload} isDragOver={isDragOver} handleDragOver={(e)=>{e.preventDefault();setIsDragOver(true)}} handleDragLeave={(e)=>{e.preventDefault();setIsDragOver(false)}} handleDrop={(e)=>{e.preventDefault();setIsDragOver(false);handleFileSelection(e.dataTransfer.files?.[0])}} handleAutoAnalyze={handleAutoAnalyze} />}
                            {activeSection === 'visuals' && <VisualsConfig formData={formData} setFormData={setFormData} suggestions={SUGGESTIONS} />}
                            {activeSection === 'voice' && <VoiceConfig formData={formData} setFormData={setFormData} />}
                            {activeSection === 'psyche' && <PsycheConfig formData={formData} setFormData={setFormData} />}
                            {activeSection === 'emotional' && <EmotionalConfig formData={formData} setFormData={setFormData} suggestions={SUGGESTIONS} />}
                            {activeSection === 'scenario' && <ScenarioConfig formData={formData} setFormData={setFormData} />}
                            
                            {activeSection === 'moral' && (
                                <div className="space-y-6">
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InputField labelKey="forge.label.alignment" value={formData.moralProfile?.alignment || ''} onChange={(v) => setFormData({...formData, moralProfile: {...formData.moralProfile!, alignment: v}})} placeholderKey="forge.ph.alignment" suggestions={SUGGESTIONS.alignment} tooltipKey="forge.tip.alignment" />
                                        <InputField labelKey="forge.label.values" value={formData.moralProfile?.values || ''} onChange={(v) => setFormData({...formData, moralProfile: {...formData.moralProfile!, values: v}})} placeholderKey="forge.ph.values" suggestions={SUGGESTIONS.values} tooltipKey="forge.tip.values" />
                                     </div>
                                     <InputField labelKey="forge.label.philosophy" value={formData.moralProfile?.philosophy || ''} onChange={(v) => setFormData({...formData, moralProfile: {...formData.moralProfile!, philosophy: v}})} placeholderKey="forge.ph.philosophy" multiline tooltipKey="forge.tip.philosophy" />
                                </div>
                            )}
                            {activeSection === 'social' && (
                                <div className="space-y-6">
                                     <InputField labelKey="forge.label.social_battery" value={formData.socialProfile?.socialBattery || ''} onChange={(v) => setFormData({...formData, socialProfile: {...formData.socialProfile!, socialBattery: v}})} placeholderKey="forge.ph.social_battery" tooltipKey="forge.tip.battery" suggestions={SUGGESTIONS.battery} />
                                     <InputField labelKey="forge.label.trust" value={formData.socialProfile?.trustFactor || ''} onChange={(v) => setFormData({...formData, socialProfile: {...formData.socialProfile!, trustFactor: v}})} placeholderKey="forge.ph.trust" tooltipKey="forge.tip.trust" suggestions={SUGGESTIONS.trust} />
                                     <InputField labelKey="forge.label.interaction" value={formData.socialProfile?.interactionStyle || ''} onChange={(v) => setFormData({...formData, socialProfile: {...formData.socialProfile!, interactionStyle: v}})} placeholderKey="forge.ph.interaction" suggestions={SUGGESTIONS.interaction} tooltipKey="forge.tip.interaction" />
                                </div>
                            )}
                            {activeSection === 'duality' && (
                                 <div className="space-y-6">
                                     <div className="p-5 bg-zinc-900/50 border border-white/5 rounded-2xl space-y-4 backdrop-blur-sm">
                                         <div className="flex items-center gap-2 text-blue-400 mb-1">
                                             <ScanFace size={16} />
                                             <span className="text-[10px] font-bold uppercase tracking-widest">{t('forge.label.mask')}</span>
                                         </div>
                                         <InputField labelKey="forge.label.name" value={formData.duality?.mask || ''} onChange={(v) => setFormData({...formData, duality: {...formData.duality!, mask: v}})} multiline placeholderKey="forge.ph.mask" tooltipKey="forge.tip.mask" className="h-20"/>
                                     </div>
                                     
                                     <div className="p-5 bg-zinc-900/50 border border-white/5 rounded-2xl space-y-4 backdrop-blur-sm">
                                         <div className="flex items-center gap-2 text-rose-400 mb-1">
                                             <Dna size={16} />
                                             <span className="text-[10px] font-bold uppercase tracking-widest">{t('forge.label.core')}</span>
                                         </div>
                                         <InputField labelKey="forge.label.name" value={formData.duality?.core || ''} onChange={(v) => setFormData({...formData, duality: {...formData.duality!, core: v}})} multiline placeholderKey="forge.ph.core" tooltipKey="forge.tip.core" className="h-20"/>
                                     </div>

                                     <InputField labelKey="forge.label.breaking" value={formData.duality?.breakingPoint || ''} onChange={(v) => setFormData({...formData, duality: {...formData.duality!, breakingPoint: v}})} placeholderKey="forge.ph.breaking" helperTextKey="forge.helper.break" tooltipKey="forge.tip.break" />
                                 </div>
                            )}
                            {activeSection === 'capabilities' && (
                                 <div className="space-y-6">
                                     <InputField labelKey="forge.label.skills" value={formData.capabilities?.skills || ''} onChange={(v) => setFormData({...formData, capabilities: {...formData.capabilities!, skills: v}})} multiline placeholderKey="forge.ph.skills" suggestions={SUGGESTIONS.skills} tooltipKey="forge.tip.skills" />
                                     <InputField labelKey="forge.label.flaws" value={formData.capabilities?.flaws || ''} onChange={(v) => setFormData({...formData, capabilities: {...formData.capabilities!, flaws: v}})} multiline placeholderKey="forge.ph.flaws" suggestions={SUGGESTIONS.flaws} tooltipKey="forge.tip.flaws" />
                                 </div>
                            )}
                            {activeSection === 'lore' && (
                                 <div className="space-y-6">
                                     <InputField labelKey="forge.label.backstory" value={formData.lore?.backstory || ''} onChange={(v) => setFormData({...formData, lore: {...formData.lore!, backstory: v}})} multiline className="h-40" placeholderKey="forge.ph.backstory" tooltipKey="forge.tip.backstory" />
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InputField labelKey="forge.label.allies" value={formData.lore?.allies || ''} onChange={(v) => setFormData({...formData, lore: {...formData.lore!, allies: v}})} tooltipKey="forge.tip.allies" />
                                        <InputField labelKey="forge.label.enemies" value={formData.lore?.enemies || ''} onChange={(v) => setFormData({...formData, lore: {...formData.lore!, enemies: v}})} tooltipKey="forge.tip.enemies" />
                                     </div>
                                     <InputField labelKey="forge.label.secrets" value={formData.lore?.secrets || ''} onChange={(v) => setFormData({...formData, lore: {...formData.lore!, secrets: v}})} placeholderKey="forge.ph.secrets" tooltipKey="forge.tip.secrets" />
                                     <InputField labelKey="forge.label.relationship" value={formData.lore?.userRelationship || ''} onChange={(v) => setFormData({...formData, lore: {...formData.lore!, userRelationship: v}})} placeholderKey="forge.ph.relationship" tooltipKey="forge.tip.userRelationship" />
                                 </div>
                            )}
                            {activeSection === 'memory' && (
                                 <div className="space-y-6">
                                     <div className="p-5 bg-zinc-900/50 rounded-2xl border border-white/5 backdrop-blur-sm">
                                         <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 block flex items-center gap-2">
                                            {t('forge.label.memories')}
                                            <span className="text-zinc-700">///</span>
                                         </label>
                                         <div className="flex gap-2 mb-3">
                                            <input type="text" className="flex-1 bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-sm focus:border-blue-500/50 outline-none transition-colors text-zinc-200 font-sans" placeholder={t('forge.ph.memories_input')} value={memoryInput} onChange={e=>setMemoryInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addMemory()} />
                                            <Button size="sm" onClick={addMemory} className="py-2 text-[10px] bg-zinc-800 border border-white/5 text-zinc-300 hover:bg-zinc-700 rounded-xl font-bold uppercase tracking-wider">{t('forge.btn.add')}</Button>
                                         </div>
                                         <div className="flex flex-wrap gap-2 min-h-[40px]">
                                            {formData.memory?.memories?.length === 0 && <span className="text-zinc-600 text-[10px] italic font-sans">{t('forge.no_memories')}</span>}
                                            {formData.memory?.memories?.map((m, i) => (
                                                <span key={i} className="bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded text-[10px] text-blue-300 flex items-center gap-1.5 animate-fade-in font-medium">
                                                    <Brain size={10} />
                                                    {m}
                                                    <button onClick={() => setFormData(prev => ({...prev, memory: {...prev.memory!, memories: prev.memory!.memories.filter((_, idx) => idx !== i)}}))} className="hover:text-white ml-1">×</button>
                                                </span>
                                            ))}
                                         </div>
                                     </div>
                                     <InputField labelKey="forge.label.obsessions" value={formData.memory?.obsessions || ''} onChange={(v) => setFormData({...formData, memory: {...formData.memory!, obsessions: v}})} placeholderKey="forge.ph.obsessions" tooltipKey="forge.tip.obsessions" />
                                 </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};
