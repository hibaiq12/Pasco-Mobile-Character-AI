
import React, { useState, useEffect } from 'react';
import { Character } from '../../../../types';
import { InputField } from './SharedComponents';
import { User, Activity, ScanFace, Ruler, Shirt, Info, Layers, CircleDot, UserCheck } from 'lucide-react';
import { t } from '../../../../services/translationService';

interface VisualsConfigProps {
    formData: Partial<Character>;
    setFormData: (data: Partial<Character>) => void;
    suggestions: Record<string, string[]>;
}

export const VisualsConfig: React.FC<VisualsConfigProps> = ({ formData, setFormData, suggestions }) => {
    
    const [anatomyType, setAnatomyType] = useState<'Female' | 'Male' | 'Non-Ordinary'>(
        formData.gender === 'Female' ? 'Female' : (formData.gender === 'Male' ? 'Male' : 'Female')
    );

    // Helper to safely parse existing string
    const getField = (regex: RegExp, group: number = 1) => {
        const m = formData.appearance?.build?.match(regex);
        return m ? m[group] : '';
    };

    // Body Parts Local State - Initialized from formData string parsing
    const [cupSize, setCupSize] = useState(() => getField(/Chest: ([A-Z])-Cup/));
    const [chestDesc, setChestDesc] = useState(() => getField(/Chest: [A-Z]-Cup \((.*?)\)/) || getField(/Chest: (.*?)\./));
    const [waist, setWaist] = useState(() => getField(/Waist: ([^.]+)/));
    const [hips, setHips] = useState(() => getField(/Hips: ([^.]+)/));
    const [curves, setCurves] = useState(() => {
        const fullBuild = formData.appearance?.build || '';
        const firstSentence = fullBuild.split('.')[0] || '';
        // If it starts with Hourglass, use it
        return firstSentence.replace(' Silhouette', '');
    });
    const [musculature, setMusculature] = useState(() => getField(/Musculature: ([^.]+)/));
    
    // Head Parts Local State
    const [headShape, setHeadShape] = useState(() => {
        const m = formData.appearance?.features?.match(/Face Shape: ([^.]+)/);
        return m ? m[1] : '';
    });
    const [jawline, setJawline] = useState(() => {
        const m = formData.appearance?.features?.match(/Jawline: ([^.]+)/);
        return m ? m[1] : '';
    });
    const [skin, setSkin] = useState('');

    // --- COMPILATION LOGIC ---
    useEffect(() => {
        let buildString = "";
        
        if (anatomyType === 'Female') {
            const chestPart = cupSize ? `${cupSize}-Cup` : '';
            const chestFull = [chestPart, chestDesc ? `(${chestDesc})` : ''].filter(Boolean).join(' ');
            const lowerBody = [waist ? `Waist: ${waist}` : '', hips ? `Hips: ${hips}` : ''].filter(Boolean).join('. ');
            
            const parts = [
                curves ? `${curves} Silhouette` : (formData.appearance?.build?.split('.')[0] || "Average"),
                chestFull ? `Chest: ${chestFull}` : '',
                lowerBody,
                musculature ? `Musculature: ${musculature}` : ''
            ].filter(Boolean).join('. ');
            
            // Only update if changed to avoid loop
            if (parts !== formData.appearance?.build && (cupSize || waist || hips)) {
                setFormData({ ...formData, appearance: { ...formData.appearance!, build: parts } });
            }
        } else if (anatomyType === 'Male') {
            const parts = [
                formData.appearance?.build?.split('.')[0] || "Average",
                chestDesc ? `Chest: ${chestDesc}` : '',
                musculature ? `Physique: ${musculature}` : '',
                waist ? `Waist: ${waist}` : ''
            ].filter(Boolean).join('. ');

             if (chestDesc || musculature) {
                setFormData({ ...formData, appearance: { ...formData.appearance!, build: parts } });
             }
        }
    }, [cupSize, chestDesc, waist, hips, curves, musculature, anatomyType]);

    // Head Compilation (Simple append if not exists)
    useEffect(() => {
        if (headShape || jawline) {
            let feat = formData.appearance?.features || '';
            // Basic replacement logic or append
            if (!feat.includes('Face Shape:') && headShape) feat += ` Face Shape: ${headShape}.`;
            if (!feat.includes('Jawline:') && jawline) feat += ` Jawline: ${jawline}.`;
            // Note: Full parsing/replacement for features is complex, doing simple append for now or manual edit
        }
    }, [headShape, jawline]);


    return (
        <div className="space-y-8 animate-fade-in pb-10 w-[90%]">
            
            {/* 1. GENERAL STATURE */}
            <div className="bg-gradient-to-r from-white/80 to-blue-50/80 backdrop-blur-md p-6 rounded-3xl border border-blue-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                    <Ruler size={120} className="text-blue-900" />
                </div>
                
                <div className="flex items-center gap-2 mb-6 text-slate-700">
                    <Ruler size={18} className="text-blue-500" />
                    <h3 className="text-sm font-black uppercase tracking-widest">General Stature</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    <InputField 
                        labelKey="forge.label.height" 
                        value={formData.appearance?.height || ''} 
                        onChange={(v) => setFormData({...formData, appearance: {...formData.appearance!, height: v}})} 
                        placeholderKey="forge.ph.height" 
                        tooltipKey="forge.tip.height" 
                        className="bg-white/50"
                    />
                    <InputField 
                        labelKey="forge.label.build" 
                        value={formData.appearance?.build || ''} 
                        onChange={(v) => setFormData({...formData, appearance: {...formData.appearance!, build: v}})} 
                        placeholderKey="forge.ph.build" 
                        tooltipKey="forge.tip.build"
                        helperTextKey="forge.tip.build" 
                    />
                </div>
            </div>

            {/* 2. ANATOMY ENGINE */}
            <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-1 rounded-3xl shadow-lg ring-1 ring-blue-50">
                <div className="bg-gradient-to-b from-white to-slate-50 rounded-[1.4rem] p-6">
                    
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 gap-4">
                        <div className="flex items-center gap-2 text-slate-700">
                            <Activity size={18} className="text-blue-500" />
                            <h3 className="text-sm font-black uppercase tracking-widest">Anatomy Configuration</h3>
                        </div>
                        
                        {/* GENDER SELECTOR TABS - Scrollable on Mobile */}
                        <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto no-scrollbar max-w-full">
                            {(['Female', 'Male', 'Non-Ordinary'] as const).map(type => (
                                <button
                                    key={type}
                                    onClick={() => setAnatomyType(type)}
                                    className={`
                                        px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap flex-shrink-0
                                        ${anatomyType === type 
                                            ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' 
                                            : 'text-slate-400 hover:text-slate-600'}
                                    `}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* CHEST / BUST CONFIGURATION */}
                        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 relative">
                            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3 block flex items-center gap-2">
                                <Layers size={12}/> 
                                {anatomyType === 'Female' ? 'Chest & Bust Metrics' : anatomyType === 'Male' ? 'Torso & Pectorals' : 'Chassis / Core'}
                            </label>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {anatomyType === 'Female' && (
                                    <>
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase ml-1">Cup Size</span>
                                            <div className="relative">
                                                <input 
                                                    type="text" 
                                                    value={cupSize} 
                                                    onChange={(e) => setCupSize(e.target.value)} 
                                                    placeholder="e.g. C, Double D"
                                                    className="w-full bg-white border border-blue-100 rounded-xl px-3 py-3 text-slate-700 text-xs font-bold outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder-slate-300"
                                                />
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                                    {['A','B','C','D','E'].map(sz => (
                                                        <button key={sz} onClick={() => setCupSize(sz)} className={`w-6 h-6 rounded text-[9px] font-bold transition-colors ${cupSize === sz ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-blue-100'}`}>
                                                            {sz}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase ml-1">Shape / Descriptor</span>
                                            <input 
                                                type="text" 
                                                value={chestDesc} 
                                                onChange={(e) => setChestDesc(e.target.value)} 
                                                placeholder="e.g. Perky, Heavy"
                                                className="w-full bg-white border border-blue-100 rounded-xl px-3 py-3 text-slate-700 text-xs font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                                            />
                                        </div>
                                    </>
                                )}
                                
                                {anatomyType !== 'Female' && (
                                    <div className="col-span-1 md:col-span-2 space-y-1">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase ml-1">Torso Definition</span>
                                        <input 
                                            type="text" 
                                            value={chestDesc} 
                                            onChange={(e) => setChestDesc(e.target.value)} 
                                            placeholder="e.g. Broad shoulders, Defined pecs"
                                            className="w-full bg-white border border-blue-100 rounded-xl px-3 py-3 text-slate-700 text-xs font-medium outline-none focus:border-blue-400 transition-all"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* CURVES & LOWER BODY */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Waist</label>
                                <input 
                                    type="text" 
                                    value={waist} 
                                    onChange={(e) => setWaist(e.target.value)} 
                                    placeholder="e.g. Narrow"
                                    className="w-full bg-white/70 border border-slate-200 rounded-xl px-3 py-3 text-slate-700 text-xs outline-none focus:border-blue-400 transition-all"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Hips</label>
                                <input 
                                    type="text" 
                                    value={hips} 
                                    onChange={(e) => setHips(e.target.value)} 
                                    placeholder="e.g. Wide"
                                    className="w-full bg-white/70 border border-slate-200 rounded-xl px-3 py-3 text-slate-700 text-xs outline-none focus:border-blue-400 transition-all"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Musculature</label>
                                <input 
                                    type="text" 
                                    value={musculature} 
                                    onChange={(e) => setMusculature(e.target.value)} 
                                    placeholder="e.g. Toned"
                                    className="w-full bg-white/70 border border-slate-200 rounded-xl px-3 py-3 text-slate-700 text-xs outline-none focus:border-blue-400 transition-all"
                                />
                            </div>
                        </div>

                        {/* SILHOUETTE SUMMARY */}
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Overall Silhouette</label>
                            <input 
                                type="text" 
                                value={curves} 
                                onChange={(e) => setCurves(e.target.value)} 
                                placeholder="e.g. Hourglass, Pear-shaped"
                                className="w-full bg-white/70 border border-slate-200 rounded-xl px-3 py-3 text-slate-700 text-xs outline-none focus:border-blue-400 transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. HEAD & FACE SCULPTING */}
            <div className="bg-gradient-to-br from-white/90 to-blue-50/50 backdrop-blur-md p-6 rounded-3xl border border-white shadow-sm">
                <div className="flex items-center gap-2 mb-6 text-slate-700">
                    <ScanFace size={18} className="text-blue-500" />
                    <h3 className="text-sm font-black uppercase tracking-widest">Facial Sculpting</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Head Shape</label>
                        <input 
                            type="text" 
                            value={headShape} 
                            onChange={(e) => setHeadShape(e.target.value)} 
                            placeholder="e.g. Oval"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 text-slate-700 text-xs outline-none focus:border-blue-400 transition-all"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Jawline</label>
                        <input 
                            type="text" 
                            value={jawline} 
                            onChange={(e) => setJawline(e.target.value)} 
                            placeholder="e.g. Sharp"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 text-slate-700 text-xs outline-none focus:border-blue-400 transition-all"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Skin</label>
                        <input 
                            type="text" 
                            value={skin} 
                            onChange={(e) => setSkin(e.target.value)} 
                            placeholder="e.g. Pale"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 text-slate-700 text-xs outline-none focus:border-blue-400 transition-all"
                        />
                    </div>
                </div>

                <InputField 
                    labelKey="forge.label.features" 
                    value={formData.appearance?.features || ''} 
                    onChange={(v) => setFormData({...formData, appearance: {...formData.appearance!, features: v}})} 
                    multiline 
                    placeholderKey="forge.ph.features" 
                    className="min-h-[100px]" 
                    tooltipKey="forge.tip.features" 
                />
            </div>
            
            {/* 4. STYLE */}
            <div className="bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-slate-700">
                    <Shirt size={18} className="text-blue-500" />
                    <h3 className="text-sm font-black uppercase tracking-widest">Fashion & Style</h3>
                </div>
                <InputField 
                    labelKey="forge.label.style" 
                    value={formData.appearance?.style || ''} 
                    onChange={(v) => setFormData({...formData, appearance: {...formData.appearance!, style: v}})} 
                    placeholderKey="forge.ph.style" 
                    tooltipKey="forge.tip.style"
                    suggestions={suggestions.style}
                />
            </div>
        </div>
    );
};
