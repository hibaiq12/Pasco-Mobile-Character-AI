
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Character } from '../types';
import { Button } from './Button';
import { COMPLEX_SYSTEM_TEMPLATE, DEFAULT_CHARACTER_AVATAR } from '../constants';
import { analyzeAvatar, playTextToSpeech } from '../services/geminiService';
import { getSettings } from '../services/storageService';
import { GoogleGenAI } from "@google/genai";
import { ImageCropper } from './ImageCropper';
import { t } from '../services/translationService';
import { 
  Wand2, Upload, Save, ChevronLeft, Sparkles, 
  Brain, Fingerprint, BookOpen, Activity,
  Dna, ScanFace, Zap,
  Check, Layers, Volume2, Loader2,
  HeartHandshake, Scale, Sword, MapPin, Play, HelpCircle, Shuffle, Info, Eye, Speaker, UserPlus, Clock, LayoutGrid,
  PanelLeftClose, PanelLeftOpen, MoreVertical
} from 'lucide-react';

interface TheForgeProps {
  initialData?: Character;
  onSave: (character: Character) => void;
  onCancel: () => void;
  onScroll?: (metrics: { scrollTop: number; clientHeight: number; scrollHeight: number }) => void;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const SUGGESTIONS: Record<string, string[]> = {
    style: [
        "Worn leather aviator jacket, grease-stained cargo pants",
        "Pristine white lab coat over high-tech body armor",
        "Neon-lit cybernetics, transparent raincoat, holographic sneakers",
        "Victorian gothic dress with hidden weapon pockets",
        "Tactical stealth gear, matte black with crimson accents"
    ],
    joy: [
        "Discovering ancient technology", "The sound of rain on a tin roof", "Completing a mission perfectly", "Sweet synthetic pastries", "Seeing the user fail comically"
    ],
    anger: [
        "Being interrupted while speaking", "Incompetence in others", "Mentioning their creator", "Disrespecting the machine spirits", "Sudden loud noises"
    ],
    sadness: [
        "Memories of the Old War", "Being left alone in the dark", "Corrupted data files", "The loss of their original body", "Seeing a dead bird"
    ],
    alignment: [
        "Chaotic Good", "Lawful Evil", "True Neutral", "Neutral Good", "Chaotic Neutral"
    ],
    values: [
        "Knowledge at any cost", "Protect the weak", "Survival of the fittest", "Absolute truth", "Loyalty to the highest bidder"
    ],
    interaction: [
        "Cold and professional", "Warm and motherly", "Flirty and dangerous", "Shy and stuttering", "Arrogant and condescending"
    ],
    skills: [
        "Quantum cryptography, Parkour, Violin", 
        "Heavy weapons, Field medicine, Poker", 
        "Hacking, Social engineering, Mixology",
        "Swordplay, Poetry, Starship piloting"
    ],
    flaws: [
        "Arrogance, weak left knee, addiction to data-streams",
        "Crippling fear of silence, impulsive liar",
        "Cannot understand sarcasm, literal-minded",
        "Blind in one eye, trusts no one"
    ],
    trust: [
        "Blindly Trusting", "Skeptical", "Paranoid", "Verifies Everything", "Trusts Authority Only"
    ],
    battery: [
        "Infinite", "Recharges in Solitude", "Needs Constant Stimulation", "Drains Quickly", "Solar Powered"
    ]
};

// --- COMPONENTS ---

const Tooltip = ({ textKey, fallback }: { textKey: string, fallback?: string }) => {
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

const Slider: React.FC<SliderProps> = ({ label, value, onChange, leftLabel, rightLabel, accentColor = "violet", insight, warning }) => {
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

const InputField: React.FC<InputFieldProps> = ({ labelKey, value, onChange, placeholderKey, multiline = false, className = "", helperTextKey, tooltipKey, suggestions }) => {
    
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
                
                {/* Suggestions Button inside input */}
                {suggestions && !multiline && (
                    <button 
                        onClick={handleSuggest}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-zinc-600 hover:text-violet-400 hover:bg-violet-500/10 rounded transition-all active:scale-95"
                        title="Surprise me (Random Example)"
                    >
                        <Shuffle size={12} />
                    </button>
                )}
                
                {/* Suggestions Button for Multiline (Top Right) */}
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

const AutoConfigButton = ({ onClick, isGenerating, sectionName }: { onClick: () => void, isGenerating: boolean, sectionName: string }) => (
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

type ForgeSection = 
  'identity' | 'visuals' | 'voice' | 'psyche' | 'emotional' | 
  'moral' | 'social' | 'duality' | 'capabilities' | 'lore' | 
  'memory' | 'scenario';

interface ModuleButtonProps {
    id: ForgeSection;
    icon: React.ReactNode;
    labelKey: string;
    isActive: boolean;
    isCollapsed: boolean;
    onClick: (id: ForgeSection) => void;
}

const ModuleButton: React.FC<ModuleButtonProps> = ({ id, icon, labelKey, isActive, isCollapsed, onClick }) => {
    const label = t(labelKey);
    return (
          <button 
            onClick={() => onClick(id)}
            title={isCollapsed ? label : ''}
            className={`
                flex items-center rounded-lg transition-all duration-200 group relative
                ${isCollapsed ? 'justify-center p-2 w-10 h-10' : 'w-full p-2 gap-3 text-left'}
                ${isActive 
                    ? 'bg-violet-600/10 border border-violet-500/30 text-white shadow-[inset_0_0_10px_rgba(139,92,246,0.1)]' 
                    : 'text-zinc-400 hover:bg-zinc-900 border border-transparent'}
            `}
          >
              <div className={`transition-colors ${isActive ? 'text-violet-400' : 'text-zinc-600 group-hover:text-zinc-400'}`}>
                {React.cloneElement(icon as any, { size: 18 })}
              </div>
              
              {!isCollapsed && (
                <>
                    <span className="text-[11px] font-bold uppercase tracking-wide flex-1 truncate">{label}</span>
                    {isActive && <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse shadow-[0_0_8px_#8b5cf6]" />}
                </>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                  <div className="absolute left-full ml-3 px-2 py-1 bg-zinc-900 border border-white/10 rounded text-[10px] font-bold text-zinc-300 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                      {label}
                  </div>
              )}
          </button>
    );
};

export const TheForge: React.FC<TheForgeProps> = ({ initialData, onSave, onCancel, onScroll }) => {
  const settings = getSettings();
  const [activeSection, setActiveSection] = useState<ForgeSection>('identity');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true); // Default collapsed (mobile friendly)
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
  const [isPreviewingVoice, setIsPreviewingVoice] = useState(false);
  
  // Image Cropper State
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Auto-expand sidebar on desktop
  useEffect(() => {
      if (window.innerWidth >= 768) {
          setIsSidebarCollapsed(false);
      }
  }, []);

  // V1.5 Data Structure
  const [formData, setFormData] = useState<Partial<Character>>(initialData || {
    id: crypto.randomUUID(),
    name: '',
    description: '', // Auto-filled by avatar or manual
    avatar: '', 
    age: '',
    birthday: '',
    gender: '',
    species: '',
    originWorld: '',
    role: '',
    
    appearance: { height: '', build: '', features: '', style: '' },
    
    psychometrics: { openness: 50, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 50, decisionStyle: 50, empathy: 50 },
    
    emotionalProfile: { stability: '', joyTriggers: '', angerTriggers: '', sadnessTriggers: '' },
    
    moralProfile: { alignment: '', values: '', philosophy: '' },
    
    socialProfile: { socialBattery: '', trustFactor: '', interactionStyle: '' },
    
    duality: { mask: '', core: '', breakingPoint: '' },
    
    capabilities: { skills: '', flaws: '' },
    
    lore: { backstory: '', secrets: '', allies: '', enemies: '', userRelationship: '' },
    
    memory: { memories: [], obsessions: '' },
    
    scenario: { 
        currentLocation: '', 
        currentActivity: '',
        startTime: {
            year: '2150',
            month: '01',
            day: '01',
            hour: '08',
            minute: '00'
        } 
    },
    
    communication: {
        style: 'casual',
        sentenceLength: 'balanced',
        vocabularyLevel: 'average',
        emotionalRelay: 'balanced',
        quirks: '',
        openingLine: '',
        voiceConfig: { pitch: 1.0, speed: 1.0, tone: 'Neutral' }
    },

    modelConfig: { 
        modelName: settings.defaultModel || 'gemini-2.5-flash', 
        temperature: settings.defaultTemperature || 0.7 
    }
  });

  // --- BETA PROTOCOL: REALISM / COHERENCE ENGINE ---
  const coherenceScore = useMemo(() => {
      let score = 0;
      const d = formData;
      if (!d) return 0;

      if (d.name?.trim()) score += 5;
      if (d.role?.trim() && d.species?.trim()) score += 5;
      if (d.age?.trim() && d.originWorld?.trim()) score += 5;

      if (d.avatar) score += 5;
      if (d.appearance?.features?.trim() && d.appearance?.style?.trim()) score += 5;

      if (d.communication?.openingLine?.trim()) score += 5;
      if (d.communication?.quirks?.trim()) score += 5;

      const p = d.psychometrics;
      if (p && (p.openness !== 50 || p.neuroticism !== 50 || p.extraversion !== 50)) score += 5;

      if (d.emotionalProfile?.stability?.trim()) score += 5;
      if (d.emotionalProfile?.joyTriggers?.trim() || d.emotionalProfile?.angerTriggers?.trim()) score += 5;

      if (d.moralProfile?.alignment?.trim()) score += 5;

      if (d.socialProfile?.interactionStyle?.trim()) score += 5;

      if (d.duality?.mask?.trim() && d.duality?.core?.trim()) score += 5;
      if (d.duality?.breakingPoint?.trim()) score += 5;

      if (d.capabilities?.skills?.trim() || d.capabilities?.flaws?.trim()) score += 5;

      if (d.lore?.backstory && d.lore.backstory.length > 20) score += 5;
      if (d.lore?.secrets?.trim()) score += 5;

      if (d.memory?.memories && d.memory.memories.length > 0) score += 10;

      if (d.scenario?.currentLocation?.trim()) score += 5;

      return Math.min(100, score);
  }, [formData]); 

  const getCoherenceStatus = (score: number) => {
      if (score < 30) return { label: t('forge.status.faint'), color: "text-zinc-500", bar: "bg-zinc-700" };
      if (score < 60) return { label: t('forge.status.building'), color: "text-blue-400", bar: "bg-blue-600" };
      if (score < 90) return { label: t('forge.status.stable'), color: "text-violet-400", bar: "bg-violet-500" };
      return { label: t('forge.status.alive'), color: "text-emerald-400", bar: "bg-emerald-500 shadow-[0_0_15px_#10b981]" };
  };

  const status = getCoherenceStatus(coherenceScore);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [memoryInput, setMemoryInput] = useState('');
  
  // DRAG & DROP + CROP HANDLERS
  const handleFileSelection = (file: File) => {
     if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setCropImage(reader.result as string);
        };
        reader.readAsDataURL(file);
     }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelection(file);
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFileSelection(file);
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
    } catch (e) {
       console.error(e);
       alert(t('forge.error.analysis'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBirthdayChange = (val: string) => {
      let newAge = formData.age;
      
      // Auto-calculate age
      const parts = val.split(':');
      if (parts.length === 3) {
          const d = parseInt(parts[0]);
          const m = parseInt(parts[1]);
          const y = parseInt(parts[2]);
          if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
               const birthDate = new Date(y, m - 1, d);
               const today = new Date();
               let age = today.getFullYear() - birthDate.getFullYear();
               const mDiff = today.getMonth() - birthDate.getMonth();
               if (mDiff < 0 || (mDiff === 0 && today.getDate() < birthDate.getDate())) {
                   age--;
               }
               // Assume non-negative for valid update
               if (age >= 0) newAge = age.toString();
          }
      }
      setFormData({ ...formData, birthday: val, age: newAge });
  };

  const handleAutoGenerate = async (section: string) => {
      setIsGenerating(prev => ({...prev, [section]: true}));
      const sectionKeyMap: Record<string, string> = {
          'visuals': 'appearance',
          'voice': 'communication',
          'psyche': 'psychometrics',
          'emotional': 'emotionalProfile',
          'moral': 'moralProfile',
          'social': 'socialProfile',
          'memory': 'memory',
          'scenario': 'scenario'
      };
      
      const targetKey = sectionKeyMap[section] || section;
      
      let attempt = 0;
      const maxRetries = 2;

      while (attempt < maxRetries) {
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `You are a creative character writer. Based on this partial character data: ${JSON.stringify(formData)}, generate a JSON object for the '${targetKey}' property. Make it realistic and coherent.`,
                config: { responseMimeType: "application/json" }
            });
            
            const result = JSON.parse(response.text || "{}");
            setFormData(prev => ({ ...prev, [targetKey]: { ...prev[targetKey as keyof Character] as any, ...result } }));
            break; // Success
        } catch (e: any) {
            const isRateLimit = e.message?.includes('429') || e.status === 429;
            if (isRateLimit && attempt < maxRetries - 1) {
                await wait(2000 * (attempt + 1));
                attempt++;
                continue;
            }
            console.error("Auto-Config Failed", e);
            if (isRateLimit) {
                alert(t('forge.error.rate_limit'));
            }
            break;
        }
      }
      setIsGenerating(prev => ({...prev, [section]: false}));
  };

  const handleVoicePreview = async () => {
    if (isPreviewingVoice) return;
    setIsPreviewingVoice(true);
    const voiceName = formData.communication?.voiceConfig.tone === 'Soft' ? 'Zephyr' : 'Fenrir';
    await playTextToSpeech(t('forge.voice.test_phrase'), voiceName);
    setIsPreviewingVoice(false);
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
    const finalAvatar = formData.avatar || DEFAULT_CHARACTER_AVATAR;
    const fullCharacter: Character = {
      ...formData as Character,
      avatar: finalAvatar,
      systemInstruction: compileSystemInstruction(),
      lastUpdated: Date.now()
    };
    onSave(fullCharacter);
  };

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

  return (
    <div className="h-full flex flex-col bg-zinc-950 relative overflow-hidden">
        {/* CROPPER MODAL */}
        {cropImage && (
            <ImageCropper 
                imageSrc={cropImage} 
                onCancel={() => setCropImage(null)} 
                onCrop={handleCropComplete} 
            />
        )}

        {/* Desktop Header */}
        <div className="hidden md:flex h-14 px-4 border-b border-white/5 items-center justify-between bg-zinc-950/80 backdrop-blur-md z-50 shrink-0">
            <div className="flex items-center gap-4">
                <button onClick={onCancel} className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/5">
                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-medium">{t('forge.exit')}</span>
                </button>
                <div className="h-4 w-[1px] bg-zinc-800 mx-1"></div>
                <h2 className="text-xs font-bold text-white flex items-center gap-2 tracking-wide">
                    <Dna size={14} className="text-violet-500" />
                    {t('forge.title')} <span className="text-red-500 font-mono bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 text-[9px]">{t('forge.beta')}</span>
                </h2>
            </div>
            <button 
                onClick={handleSave}
                className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-lg shadow-[0_0_15px_rgba(8,145,178,0.4)] hover:shadow-[0_0_25px_rgba(8,145,178,0.6)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 border border-cyan-400/50"
            >
                <Play size={12} fill="currentColor" />
                {t('forge.materialize')}
            </button>
        </div>

        {/* Mobile Header (Optimized with Materialize Button & Status) */}
        <div className="md:hidden h-14 px-3 border-b border-white/5 flex items-center justify-between bg-zinc-950/90 backdrop-blur-lg z-50 sticky top-0 shrink-0 shadow-lg shadow-black/20">
             <div className="flex items-center gap-3">
                 <button onClick={onCancel} className="p-2 -ml-1 text-zinc-400 hover:text-white active:scale-90 transition-transform bg-white/5 rounded-full border border-white/5">
                     <ChevronLeft size={16} />
                 </button>
                 <div className="flex flex-col">
                     <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">Forge</span>
                     <div className="flex items-center gap-1.5">
                         <div className={`w-1.5 h-1.5 rounded-full ${status.color.replace('text-', 'bg-')} animate-pulse`}></div>
                         <span className={`text-[9px] font-mono ${status.color} font-bold`}>{Math.round(coherenceScore)}%</span>
                     </div>
                 </div>
             </div>
             
             {/* Mobile Materialize Button - Matches Desktop Style */}
             <button 
                onClick={handleSave}
                className="bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-bold text-[10px] uppercase tracking-widest px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(8,145,178,0.4)] flex items-center gap-2 transition-all active:scale-95 border border-cyan-400/50"
             >
                <Play size={10} fill="currentColor" />
                {t('forge.materialize')}
             </button>
        </div>

        <div className="flex-1 flex overflow-hidden relative z-10 flex-row">
            
            {/* Sidebar (Vertical on both Desktop and Mobile) */}
            <div 
                className={`
                    flex flex-shrink-0 bg-zinc-950 border-r border-white/5 flex-col transition-all duration-300 ease-in-out z-20
                    ${isSidebarCollapsed ? 'w-[50px] md:w-[60px] items-center' : 'w-64'}
                `}
            >
                {/* Desktop Toggle Header */}
                <div className={`hidden md:flex items-center p-3 border-b border-white/5 ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
                    {!isSidebarCollapsed && <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest px-2">{t('forge.sidebar.modules')}</span>}
                    <button 
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className="text-zinc-500 hover:text-white p-1 rounded hover:bg-white/5 transition-colors"
                    >
                        {isSidebarCollapsed ? <PanelLeftOpen size={16}/> : <PanelLeftClose size={16}/>}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-1 md:p-2 space-y-2 w-full pt-4 md:pt-2">
                    {MODULES.map(mod => (
                         <ModuleButton 
                             key={mod.id} 
                             id={mod.id as ForgeSection} 
                             icon={mod.icon} 
                             labelKey={mod.labelKey} 
                             isActive={activeSection === mod.id}
                             isCollapsed={isSidebarCollapsed}
                             onClick={setActiveSection}
                         />
                    ))}
                </div>
                
                {/* Coherence Stats */}
                <div className={`p-3 border-t border-white/5 bg-zinc-900/30 backdrop-blur transition-all flex flex-col items-center justify-center`}>
                     {/* Collapsed/Mobile View */}
                     <div className={`flex flex-col items-center gap-1 group relative ${isSidebarCollapsed ? 'flex' : 'hidden'}`}>
                         <div className="w-8 h-8 rounded-full border-2 border-zinc-800 flex items-center justify-center bg-zinc-900">
                             <span className={`text-[9px] font-bold ${status.color}`}>{Math.round(coherenceScore)}</span>
                         </div>
                     </div>

                     {/* Expanded View (Desktop) */}
                     <div className={`w-full ${!isSidebarCollapsed ? 'block' : 'hidden'}`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5 text-zinc-300">
                                <Zap size={12} className="text-green-400 fill-green-400" />
                                <span className="text-[9px] font-bold uppercase tracking-wider text-green-400/80">{t('forge.beta_protocol')}</span>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-[9px] items-end">
                                <span className="text-zinc-500 font-medium">{t('forge.coherence')}</span>
                                <span className={`font-mono font-bold ${status.color}`}>{Math.round(coherenceScore)}%</span>
                            </div>
                            <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-300 ease-out ${status.bar}`} 
                                    style={{width: `${coherenceScore}%`}}
                                ></div>
                            </div>
                        </div>
                     </div>
                </div>
            </div>

            {/* Content Area - Attached onScroll here */}
            <div 
                className="flex-1 overflow-y-auto bg-gradient-to-br from-zinc-900 to-black px-3 py-4 md:p-8 pt-6 custom-scrollbar relative"
                onScroll={(e) => onScroll?.({
                    scrollTop: e.currentTarget.scrollTop,
                    clientHeight: e.currentTarget.clientHeight,
                    scrollHeight: e.currentTarget.scrollHeight
                })}
            >
                <div className="max-w-3xl mx-auto animate-fade-in pb-32 md:pb-10">
                    
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-6 pb-4 border-b border-white/5 gap-4">
                        <h3 className="text-lg md:text-xl font-bold text-white uppercase tracking-tight flex items-center gap-2">
                            {/* Dynamic Header Icon */}
                            <span className="md:hidden text-violet-500">
                                {MODULES.find(m => m.id === activeSection)?.icon}
                            </span>
                            {/* Translated Header */}
                            {t(`forge.mod.${activeSection}`)} <span className="text-zinc-600 hidden md:inline">{t('forge.header.config')}</span>
                        </h3>
                        <AutoConfigButton 
                            sectionName={activeSection} 
                            onClick={() => handleAutoGenerate(activeSection)} 
                            isGenerating={!!isGenerating[activeSection]} 
                        />
                    </div>

                    {/* === 1. IDENTITY === */}
                    {activeSection === 'identity' && (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
                            {/* Hero Avatar - DRAG & DROP ENABLED */}
                            <div className="md:col-span-4 flex flex-col items-center gap-3">
                                <div 
                                    className={`
                                        relative w-32 h-32 md:w-full md:h-auto md:aspect-square rounded-full md:rounded-xl overflow-hidden border-2 
                                        ${isDragOver ? 'border-violet-500 border-dashed bg-violet-500/10' : 'border-zinc-700 bg-black'} 
                                        cursor-pointer group shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all
                                    `}
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    {formData.avatar ? (
                                        <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700 group-hover:text-zinc-500 transition-colors">
                                            <Upload size={24} className="mb-1" />
                                            <span className="text-[9px] uppercase font-bold text-center px-4">
                                                {isDragOver ? t('forge.drop_active') : t('forge.drop_idle')}
                                            </span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3 pointer-events-none">
                                         <span className="text-[10px] font-bold text-white">{t('forge.change_avatar')}</span>
                                    </div>
                                </div>
                                
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                                
                                <button onClick={handleAutoAnalyze} className="w-full py-2 text-[9px] font-bold uppercase tracking-widest border border-zinc-700 rounded-lg hover:bg-zinc-800 hover:border-zinc-600 hover:text-white text-zinc-400 transition-all flex items-center justify-center gap-1.5 active:scale-95">
                                    <ScanFace size={12} />
                                    {t('forge.analyze')}
                                </button>
                            </div>

                            <div className="md:col-span-8 space-y-4">
                                <InputField labelKey="forge.label.name" value={formData.name || ''} onChange={(v) => setFormData({...formData, name: v})} placeholderKey="forge.ph.name" tooltipKey="forge.tip.name" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField labelKey="forge.label.role" value={formData.role || ''} onChange={(v) => setFormData({...formData, role: v})} tooltipKey="forge.tip.role" />
                                    <InputField labelKey="forge.label.species" value={formData.species || ''} onChange={(v) => setFormData({...formData, species: v})} tooltipKey="forge.tip.species" />
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <InputField labelKey="forge.label.age" value={formData.age || ''} onChange={(v) => setFormData({...formData, age: v})} tooltipKey="forge.tip.age" className="col-span-1"/>
                                    <InputField labelKey="forge.label.gender" value={formData.gender || ''} onChange={(v) => setFormData({...formData, gender: v})} tooltipKey="forge.tip.gender" className="col-span-1"/>
                                    <InputField labelKey="forge.label.origin" value={formData.originWorld || ''} onChange={(v) => setFormData({...formData, originWorld: v})} tooltipKey="forge.tip.origin" className="col-span-2 md:col-span-1" />
                                </div>
                                <InputField labelKey="forge.label.birthday" value={formData.birthday || ''} onChange={handleBirthdayChange} placeholderKey="forge.ph.birthday" tooltipKey="forge.tip.birthday" />
                            </div>
                        </div>
                    )}

                    {/* === 2. VISUALS === */}
                    {activeSection === 'visuals' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <InputField labelKey="forge.label.height" value={formData.appearance?.height || ''} onChange={(v) => setFormData({...formData, appearance: {...formData.appearance!, height: v}})} placeholderKey="forge.ph.height" tooltipKey="forge.tip.height" />
                                <InputField labelKey="forge.label.build" value={formData.appearance?.build || ''} onChange={(v) => setFormData({...formData, appearance: {...formData.appearance!, build: v}})} placeholderKey="forge.ph.build" tooltipKey="forge.tip.build" />
                            </div>
                            <InputField labelKey="forge.label.features" value={formData.appearance?.features || ''} onChange={(v) => setFormData({...formData, appearance: {...formData.appearance!, features: v}})} multiline placeholderKey="forge.ph.features" className="h-28" tooltipKey="forge.tip.features" />
                            
                            <InputField 
                                labelKey="forge.label.style" 
                                value={formData.appearance?.style || ''} 
                                onChange={(v) => setFormData({...formData, appearance: {...formData.appearance!, style: v}})} 
                                placeholderKey="forge.ph.style" 
                                tooltipKey="forge.tip.style"
                                suggestions={SUGGESTIONS.style}
                            />
                        </div>
                    )}

                    {/* === 3. VOICE === */}
                    {activeSection === 'voice' && (
                        <div className="space-y-6">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <div className="flex items-center mb-2">
                                        <label className="text-[10px] uppercase font-bold text-zinc-500 block tracking-widest ml-1">{t('forge.label.voice_tone')}</label>
                                        <Tooltip textKey="forge.tip.voice_tone" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['Neutral','Soft','Raspy','Robotic'].map(tStr => (
                                            <button key={tStr} onClick={() => setFormData({...formData, communication: {...formData.communication!, voiceConfig: {...formData.communication!.voiceConfig, tone: tStr}}})} className={`py-2 text-[9px] font-bold uppercase rounded-lg border transition-all ${formData.communication?.voiceConfig.tone === tStr ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-900/20' : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}>{t(`forge.tone.${tStr.toLowerCase()}`)}</button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-zinc-500 mb-2 block tracking-widest ml-1">{t('forge.label.vocab')}</label>
                                    <div className="grid grid-cols-3 gap-1">
                                        {['simple','average','academic'].map(v => (
                                            <button key={v} onClick={() => setFormData({...formData, communication: {...formData.communication!, vocabularyLevel: v as any}})} className={`py-2 text-[9px] font-bold uppercase rounded-lg border transition-all ${formData.communication?.vocabularyLevel === v ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-900/20' : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}>{t(`forge.vocab.${v}`)}</button>
                                        ))}
                                    </div>
                                </div>
                             </div>
                             <InputField labelKey="forge.label.opening" value={formData.communication?.openingLine || ''} onChange={(v) => setFormData({...formData, communication: {...formData.communication!, openingLine: v}})} multiline placeholderKey="forge.ph.opening" tooltipKey="forge.tip.opening" />
                             <InputField labelKey="forge.label.quirks" value={formData.communication?.quirks || ''} onChange={(v) => setFormData({...formData, communication: {...formData.communication!, quirks: v}})} placeholderKey="forge.ph.quirks" tooltipKey="forge.tip.quirks" />
                             <Button size="sm" onClick={handleVoicePreview} icon={<Volume2 size={14}/>} className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300 rounded-lg text-[10px] uppercase tracking-widest">{isPreviewingVoice ? t('forge.btn.synthesizing') : t('forge.btn.test_voice')}</Button>
                        </div>
                    )}

                    {/* === 4. PSYCHOMETRICS === */}
                    {activeSection === 'psyche' && (
                        <div className="space-y-4 bg-zinc-900/20 p-4 rounded-xl border border-white/5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Slider 
                                    label={t('forge.label.openness')} 
                                    value={formData.psychometrics?.openness || 50} 
                                    onChange={(v) => setFormData({...formData, psychometrics: {...formData.psychometrics!, openness: v}})} 
                                    leftLabel={t('forge.sl.traditional')} rightLabel={t('forge.sl.visionary')} 
                                    insight={t('forge.insight.openness')}
                                />
                                <Slider 
                                    label={t('forge.label.conscientiousness')} 
                                    value={formData.psychometrics?.conscientiousness || 50} 
                                    onChange={(v) => setFormData({...formData, psychometrics: {...formData.psychometrics!, conscientiousness: v}})} 
                                    leftLabel={t('forge.sl.chaotic')} rightLabel={t('forge.sl.disciplined')} accentColor="emerald" 
                                    insight={t('forge.insight.conscientiousness')}
                                />
                                <Slider 
                                    label={t('forge.label.extraversion')} 
                                    value={formData.psychometrics?.extraversion || 50} 
                                    onChange={(v) => setFormData({...formData, psychometrics: {...formData.psychometrics!, extraversion: v}})} 
                                    leftLabel={t('forge.sl.solitary')} rightLabel={t('forge.sl.social')} accentColor="yellow" 
                                    insight={t('forge.insight.extraversion')}
                                />
                                <Slider 
                                    label={t('forge.label.agreeableness')} 
                                    value={formData.psychometrics?.agreeableness || 50} 
                                    onChange={(v) => setFormData({...formData, psychometrics: {...formData.psychometrics!, agreeableness: v}})} 
                                    leftLabel={t('forge.sl.challenging')} rightLabel={t('forge.sl.cooperative')} accentColor="pink" 
                                    insight={t('forge.insight.agreeableness')}
                                />
                            </div>
                            <Slider 
                                label={t('forge.label.neuroticism')} 
                                value={formData.psychometrics?.neuroticism || 50} 
                                onChange={(v) => setFormData({...formData, psychometrics: {...formData.psychometrics!, neuroticism: v}})} 
                                leftLabel={t('forge.sl.confident')} rightLabel={t('forge.sl.sensitive')} accentColor="red" 
                                insight={t('forge.insight.neuroticism')}
                            />
                            
                            <div className="pt-3 border-t border-white/5 mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Slider 
                                    label={t('forge.label.decision')} 
                                    value={formData.psychometrics?.decisionStyle || 50} 
                                    onChange={(v) => setFormData({...formData, psychometrics: {...formData.psychometrics!, decisionStyle: v}})} 
                                    leftLabel={t('forge.sl.logic')} rightLabel={t('forge.sl.emotion')} accentColor="cyan" 
                                />
                                <Slider 
                                    label={t('forge.label.empathy')} 
                                    value={formData.psychometrics?.empathy || 50} 
                                    onChange={(v) => setFormData({...formData, psychometrics: {...formData.psychometrics!, empathy: v}})} 
                                    leftLabel={t('forge.sl.cold')} rightLabel={t('forge.sl.warm')} accentColor="blue" 
                                />
                            </div>
                        </div>
                    )}

                    {/* === 5. EMOTIONAL === */}
                    {activeSection === 'emotional' && (
                        <div className="space-y-6">
                             <InputField labelKey="forge.label.stability" value={formData.emotionalProfile?.stability || ''} onChange={(v) => setFormData({...formData, emotionalProfile: {...formData.emotionalProfile!, stability: v}})} placeholderKey="forge.ph.stability" tooltipKey="forge.tip.stability" />
                             <div className="grid grid-cols-1 gap-4 p-4 bg-zinc-900/30 rounded-xl border border-white/5">
                                 <h4 className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">{t('forge.label.triggers')}</h4>
                                 <InputField labelKey="forge.label.joy" value={formData.emotionalProfile?.joyTriggers || ''} onChange={(v) => setFormData({...formData, emotionalProfile: {...formData.emotionalProfile!, joyTriggers: v}})} placeholderKey="forge.ph.joy" suggestions={SUGGESTIONS.joy} tooltipKey="forge.tip.triggers" />
                                 <InputField labelKey="forge.label.anger" value={formData.emotionalProfile?.angerTriggers || ''} onChange={(v) => setFormData({...formData, emotionalProfile: {...formData.emotionalProfile!, angerTriggers: v}})} placeholderKey="forge.ph.anger" suggestions={SUGGESTIONS.anger} tooltipKey="forge.tip.triggers" />
                                 <InputField labelKey="forge.label.sadness" value={formData.emotionalProfile?.sadnessTriggers || ''} onChange={(v) => setFormData({...formData, emotionalProfile: {...formData.emotionalProfile!, sadnessTriggers: v}})} placeholderKey="forge.ph.sadness" suggestions={SUGGESTIONS.sadness} tooltipKey="forge.tip.triggers" />
                             </div>
                        </div>
                    )}

                     {/* === 6. MORAL === */}
                     {activeSection === 'moral' && (
                        <div className="space-y-6">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField labelKey="forge.label.alignment" value={formData.moralProfile?.alignment || ''} onChange={(v) => setFormData({...formData, moralProfile: {...formData.moralProfile!, alignment: v}})} placeholderKey="forge.ph.alignment" suggestions={SUGGESTIONS.alignment} tooltipKey="forge.tip.alignment" />
                                <InputField labelKey="forge.label.values" value={formData.moralProfile?.values || ''} onChange={(v) => setFormData({...formData, moralProfile: {...formData.moralProfile!, values: v}})} placeholderKey="forge.ph.values" suggestions={SUGGESTIONS.values} tooltipKey="forge.tip.values" />
                             </div>
                             <InputField labelKey="forge.label.philosophy" value={formData.moralProfile?.philosophy || ''} onChange={(v) => setFormData({...formData, moralProfile: {...formData.moralProfile!, philosophy: v}})} placeholderKey="forge.ph.philosophy" multiline tooltipKey="forge.tip.philosophy" />
                        </div>
                    )}

                    {/* === 7. SOCIAL === */}
                     {activeSection === 'social' && (
                        <div className="space-y-6">
                             <InputField labelKey="forge.label.social_battery" value={formData.socialProfile?.socialBattery || ''} onChange={(v) => setFormData({...formData, socialProfile: {...formData.socialProfile!, socialBattery: v}})} placeholderKey="forge.ph.social_battery" tooltipKey="forge.tip.battery" suggestions={SUGGESTIONS.battery} />
                             <InputField labelKey="forge.label.trust" value={formData.socialProfile?.trustFactor || ''} onChange={(v) => setFormData({...formData, socialProfile: {...formData.socialProfile!, trustFactor: v}})} placeholderKey="forge.ph.trust" tooltipKey="forge.tip.trust" suggestions={SUGGESTIONS.trust} />
                             <InputField labelKey="forge.label.interaction" value={formData.socialProfile?.interactionStyle || ''} onChange={(v) => setFormData({...formData, socialProfile: {...formData.socialProfile!, interactionStyle: v}})} placeholderKey="forge.ph.interaction" suggestions={SUGGESTIONS.interaction} tooltipKey="forge.tip.interaction" />
                        </div>
                    )}

                    {/* === 8. DUALITY === */}
                    {activeSection === 'duality' && (
                         <div className="space-y-6">
                             <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl space-y-3">
                                 <div className="flex items-center gap-2 text-violet-400 mb-1">
                                     <ScanFace size={14} />
                                     <span className="text-[10px] font-bold uppercase">{t('forge.label.mask')}</span>
                                 </div>
                                 <InputField labelKey="forge.label.name" value={formData.duality?.mask || ''} onChange={(v) => setFormData({...formData, duality: {...formData.duality!, mask: v}})} multiline placeholderKey="forge.ph.mask" tooltipKey="forge.tip.mask" className="h-20"/>
                             </div>
                             
                             <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl space-y-3">
                                 <div className="flex items-center gap-2 text-rose-400 mb-1">
                                     <Fingerprint size={14} />
                                     <span className="text-[10px] font-bold uppercase">{t('forge.label.core')}</span>
                                 </div>
                                 <InputField labelKey="forge.label.name" value={formData.duality?.core || ''} onChange={(v) => setFormData({...formData, duality: {...formData.duality!, core: v}})} multiline placeholderKey="forge.ph.core" tooltipKey="forge.tip.core" className="h-20"/>
                             </div>

                             <InputField labelKey="forge.label.breaking" value={formData.duality?.breakingPoint || ''} onChange={(v) => setFormData({...formData, duality: {...formData.duality!, breakingPoint: v}})} placeholderKey="forge.ph.breaking" helperTextKey="forge.helper.break" tooltipKey="forge.tip.break" />
                         </div>
                    )}

                    {/* === 9. CAPABILITIES === */}
                    {activeSection === 'capabilities' && (
                         <div className="space-y-6">
                             <InputField labelKey="forge.label.skills" value={formData.capabilities?.skills || ''} onChange={(v) => setFormData({...formData, capabilities: {...formData.capabilities!, skills: v}})} multiline placeholderKey="forge.ph.skills" suggestions={SUGGESTIONS.skills} tooltipKey="forge.tip.skills" />
                             <InputField labelKey="forge.label.flaws" value={formData.capabilities?.flaws || ''} onChange={(v) => setFormData({...formData, capabilities: {...formData.capabilities!, flaws: v}})} multiline placeholderKey="forge.ph.flaws" suggestions={SUGGESTIONS.flaws} tooltipKey="forge.tip.flaws" />
                         </div>
                    )}

                    {/* === 10. LORE === */}
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

                    {/* === 11. MEMORY === */}
                    {activeSection === 'memory' && (
                         <div className="space-y-6">
                             <div className="p-4 bg-zinc-900/30 rounded-xl border border-white/5">
                                 <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 block flex items-center gap-2">
                                    {t('forge.label.memories')}
                                    <Tooltip textKey="forge.tip.memories" />
                                 </label>
                                 <div className="flex gap-2 mb-3">
                                    <input type="text" className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:border-violet-500/50 outline-none transition-colors" placeholder={t('forge.ph.memories_input')} value={memoryInput} onChange={e=>setMemoryInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addMemory()} />
                                    <Button size="sm" onClick={addMemory} className="py-2 text-[10px]">{t('forge.btn.add')}</Button>
                                 </div>
                                 <div className="flex flex-wrap gap-2 min-h-[40px]">
                                    {formData.memory?.memories?.length === 0 && <span className="text-zinc-600 text-[10px] italic">{t('forge.no_memories')}</span>}
                                    {formData.memory?.memories?.map((m, i) => (
                                        <span key={i} className="bg-violet-500/10 border border-violet-500/20 px-2 py-1 rounded text-[10px] text-violet-300 flex items-center gap-1.5 animate-fade-in">
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

                    {/* === 12. SCENARIO === */}
                    {activeSection === 'scenario' && (
                         <div className="space-y-6">
                             <InputField labelKey="forge.label.location" value={formData.scenario?.currentLocation || ''} onChange={(v) => setFormData({...formData, scenario: {...formData.scenario!, currentLocation: v}})} placeholderKey="forge.ph.location" tooltipKey="forge.tip.location" />
                             <InputField labelKey="forge.label.activity" value={formData.scenario?.currentActivity || ''} onChange={(v) => setFormData({...formData, scenario: {...formData.scenario!, currentActivity: v}})} placeholderKey="forge.ph.activity" tooltipKey="forge.tip.activity" />
                             
                             {/* Temporal Anchor Card */}
                             <div className="p-4 bg-zinc-900/30 border border-white/5 rounded-xl">
                                <div className="flex items-center mb-3 gap-2">
                                    <Clock size={14} className="text-violet-400" />
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                        {t('forge.label.time_anchor')}
                                    </label>
                                    <Tooltip textKey="forge.tip.startTime" />
                                </div>
                                
                                <div className="grid grid-cols-5 gap-2">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[8px] text-zinc-600 font-mono text-center">{t('forge.time.year')}</span>
                                        <input 
                                            type="number" 
                                            className="bg-black/30 border border-zinc-800 rounded text-center py-2 text-sm text-violet-200 font-mono focus:border-violet-500/50 outline-none"
                                            placeholder="2150"
                                            value={formData.scenario?.startTime?.year || ''}
                                            onChange={(e) => setFormData({...formData, scenario: {...formData.scenario!, startTime: {...formData.scenario!.startTime!, year: e.target.value}}})}
                                            maxLength={4}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[8px] text-zinc-600 font-mono text-center">{t('forge.time.month')}</span>
                                        <input 
                                            type="number" 
                                            className="bg-black/30 border border-zinc-800 rounded text-center py-2 text-sm text-violet-200 font-mono focus:border-violet-500/50 outline-none"
                                            placeholder="01"
                                            value={formData.scenario?.startTime?.month || ''}
                                            onChange={(e) => setFormData({...formData, scenario: {...formData.scenario!, startTime: {...formData.scenario!.startTime!, month: e.target.value}}})}
                                            maxLength={2}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[8px] text-zinc-600 font-mono text-center">{t('forge.time.day')}</span>
                                        <input 
                                            type="number" 
                                            className="bg-black/30 border border-zinc-800 rounded text-center py-2 text-sm text-violet-200 font-mono focus:border-violet-500/50 outline-none"
                                            placeholder="01"
                                            value={formData.scenario?.startTime?.day || ''}
                                            onChange={(e) => setFormData({...formData, scenario: {...formData.scenario!, startTime: {...formData.scenario!.startTime!, day: e.target.value}}})}
                                            maxLength={2}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[8px] text-zinc-600 font-mono text-center">{t('forge.time.hour')}</span>
                                        <input 
                                            type="number" 
                                            className="bg-black/30 border border-zinc-800 rounded text-center py-2 text-sm text-violet-200 font-mono focus:border-violet-500/50 outline-none"
                                            placeholder="08"
                                            value={formData.scenario?.startTime?.hour || ''}
                                            onChange={(e) => setFormData({...formData, scenario: {...formData.scenario!, startTime: {...formData.scenario!.startTime!, hour: e.target.value}}})}
                                            maxLength={2}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[8px] text-zinc-600 font-mono text-center">{t('forge.time.minute')}</span>
                                        <input 
                                            type="number" 
                                            className="bg-black/30 border border-zinc-800 rounded text-center py-2 text-sm text-violet-200 font-mono focus:border-violet-500/50 outline-none"
                                            placeholder="00"
                                            value={formData.scenario?.startTime?.minute || ''}
                                            onChange={(e) => setFormData({...formData, scenario: {...formData.scenario!, startTime: {...formData.scenario!.startTime!, minute: e.target.value}}})}
                                            maxLength={2}
                                        />
                                    </div>
                                </div>
                             </div>
                         </div>
                    )}

                </div>
            </div>

        </div>
    </div>
  );
};
