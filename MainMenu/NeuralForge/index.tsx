
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Character } from '../../types';
import { COMPLEX_SYSTEM_TEMPLATE, DEFAULT_CHARACTER_AVATAR } from '../../constants';
import { analyzeAvatar } from '../../services/geminiService';
import { getSettings } from '../../services/storageService';
import { GoogleGenAI } from "@google/genai";
import { ImageCropper } from '../../components/ImageCropper';
import { t } from '../../services/translationService';
import { 
  ChevronLeft, ScanFace, Eye, Speaker, Activity, HeartHandshake, Scale, UserPlus, Layers, Sword, BookOpen, Brain, MapPin, Play, Dna
} from 'lucide-react';

// --- CONFIG COMPONENTS ---
import { AutoConfigButton, InputField, Tooltip } from './Configuration/SharedComponents';
import { IdentityConfig } from './Configuration/IdentityConfig';
import { VisualsConfig } from './Configuration/VisualsConfig';
import { VoiceConfig } from './Configuration/VoiceConfig';
import { PsycheConfig } from './Configuration/PsycheConfig';
import { EmotionalConfig } from './Configuration/EmotionalConfig';
import { ScenarioConfig } from './Configuration/ScenarioConfig';
import { Button } from '../../components/Button';

// --- EXTERNAL CONFIG (Header & Sidebar & Neural Thinking) ---
import { ForgeHeader, ForgeSidebar, calculateCoherenceScore, getCoherenceStatus } from './ExternalConfiguration';

// --- REALISM FORGE ---
import { RealismForge } from './RealismConfiguration/RealismForge';

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

interface TheForgeProps {
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

export const TheForge: React.FC<TheForgeProps> = ({ initialData, onSave, onCancel, onScroll }) => {
  const settings = getSettings();
  
  // --- REALISM CHECK ---
  // If character ID matches a Realism character (e.g. Hiyori), serve the RealismForge instead.
  // Currently checking hardcoded 'char-hiyori', in future can check a property.
  const isRealismCharacter = initialData?.id === 'char-hiyori' || initialData?.id?.startsWith('realism-');

  if (isRealismCharacter) {
      return (
          <RealismForge 
              initialData={initialData} 
              onSave={onSave} 
              onCancel={onCancel} 
          />
      );
  }

  // --- STANDARD FORGE LOGIC BELOW ---

  const [activeSection, setActiveSection] = useState<ForgeSection>('identity');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [memoryInput, setMemoryInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Animation State
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
      if (window.innerWidth >= 768) setIsSidebarCollapsed(false);
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

  // Neural Thinking Score (Real-time)
  const coherenceScore = useMemo(() => calculateCoherenceScore(formData), [formData]);
  const status = getCoherenceStatus(coherenceScore);

  // --- TRANSITION HANDLERS ---
  const handleExit = (callback: () => void) => {
      setIsExiting(true);
      setTimeout(callback, 400); // Wait for exit animation
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
            h-full flex flex-col bg-zinc-950 relative overflow-hidden transition-all duration-500 ease-in-out
            ${isExiting ? 'opacity-0 scale-[0.98] translate-y-4' : 'opacity-100 scale-100 translate-y-0 animate-in fade-in slide-in-from-bottom-2'}
        `}
    >
        {cropImage && <ImageCropper imageSrc={cropImage} onCancel={() => setCropImage(null)} onCrop={handleCropComplete} />}

        {/* HEADER (EXTERNAL) */}
        <ForgeHeader onCancel={() => handleExit(onCancel)} onSave={handleSave} />

        {/* MOBILE HEADER (Simple) */}
        <div className="md:hidden h-14 px-3 border-b border-white/5 flex items-center justify-between bg-zinc-950/90 backdrop-blur-lg z-50 sticky top-0 shrink-0 shadow-lg shadow-black/20">
             <div className="flex items-center gap-3">
                 <button onClick={() => handleExit(onCancel)} className="p-2 -ml-1 text-zinc-400 hover:text-white active:scale-90 transition-transform bg-white/5 rounded-full border border-white/5">
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
             <button 
                onClick={handleSave}
                className="bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-bold text-[10px] uppercase tracking-widest px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(8,145,178,0.4)] flex items-center gap-2 transition-all active:scale-95 border border-cyan-400/50"
             >
                <Play size={10} fill="currentColor" />
                {t('forge.materialize')}
             </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 flex overflow-hidden relative z-10 flex-row">
            
            {/* SIDEBAR (EXTERNAL) */}
            <ForgeSidebar 
                modules={MODULES}
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                isCollapsed={isSidebarCollapsed}
                setIsCollapsed={setIsSidebarCollapsed}
                formData={formData}
            />

            {/* MAIN PANEL */}
            <div className="flex-1 overflow-y-auto bg-gradient-to-br from-zinc-900 to-black px-3 py-4 md:p-8 pt-6 custom-scrollbar relative" onScroll={(e) => onScroll?.({ scrollTop: e.currentTarget.scrollTop, clientHeight: e.currentTarget.clientHeight, scrollHeight: e.currentTarget.scrollHeight })}>
                <div className="max-w-3xl mx-auto animate-fade-in pb-32 md:pb-10">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-6 pb-4 border-b border-white/5 gap-4">
                        <h3 className="text-lg md:text-xl font-bold text-white uppercase tracking-tight flex items-center gap-2">
                            {t(`forge.mod.${activeSection}`)} <span className="text-zinc-600 hidden md:inline">{t('forge.header.config')}</span>
                        </h3>
                        <AutoConfigButton sectionName={activeSection} onClick={() => handleAutoGenerate(activeSection)} isGenerating={!!isGenerating[activeSection]} />
                    </div>

                    {activeSection === 'identity' && <IdentityConfig formData={formData} setFormData={setFormData} fileInputRef={fileInputRef} handleImageUpload={handleImageUpload} isDragOver={isDragOver} handleDragOver={(e)=>{e.preventDefault();setIsDragOver(true)}} handleDragLeave={(e)=>{e.preventDefault();setIsDragOver(false)}} handleDrop={(e)=>{e.preventDefault();setIsDragOver(false);handleFileSelection(e.dataTransfer.files?.[0])}} handleAutoAnalyze={handleAutoAnalyze} />}
                    {activeSection === 'visuals' && <VisualsConfig formData={formData} setFormData={setFormData} suggestions={SUGGESTIONS} />}
                    {activeSection === 'voice' && <VoiceConfig formData={formData} setFormData={setFormData} />}
                    {activeSection === 'psyche' && <PsycheConfig formData={formData} setFormData={setFormData} />}
                    {activeSection === 'emotional' && <EmotionalConfig formData={formData} setFormData={setFormData} suggestions={SUGGESTIONS} />}
                    {activeSection === 'scenario' && <ScenarioConfig formData={formData} setFormData={setFormData} />}
                    
                    {/* Fallback for other sections using simple inputs for now */}
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
                             <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl space-y-3">
                                 <div className="flex items-center gap-2 text-violet-400 mb-1">
                                     <ScanFace size={14} />
                                     <span className="text-[10px] font-bold uppercase">{t('forge.label.mask')}</span>
                                 </div>
                                 <InputField labelKey="forge.label.name" value={formData.duality?.mask || ''} onChange={(v) => setFormData({...formData, duality: {...formData.duality!, mask: v}})} multiline placeholderKey="forge.ph.mask" tooltipKey="forge.tip.mask" className="h-20"/>
                             </div>
                             
                             <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl space-y-3">
                                 <div className="flex items-center gap-2 text-rose-400 mb-1">
                                     <Dna size={14} />
                                     <span className="text-[10px] font-bold uppercase">{t('forge.label.core')}</span>
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
                </div>
            </div>
        </div>
    </div>
  );
};

export default TheForge;
