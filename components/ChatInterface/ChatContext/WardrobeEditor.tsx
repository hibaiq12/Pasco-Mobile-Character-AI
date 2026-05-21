import React, { useState, useRef } from 'react';
import { Plus, Trash2, ArrowLeft, Shirt, User, Sparkles, Wand2, Image as ImageIcon, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { OutfitItem } from '../../../types';
import { generateOutfitConfig } from '../../../services/geminiService';
import { t } from '../../../services/translationService';

interface WardrobeEditorProps {
    outfits: OutfitItem[];
    setOutfits: (items: OutfitItem[]) => void;
    characterName: string;
    onBack: () => void;
}

export const WardrobeEditor: React.FC<WardrobeEditorProps> = ({ 
    outfits, 
    setOutfits, 
    characterName, 
    onBack 
}) => {
    const [activeTab, setActiveTab] = useState<'user' | 'char'>('char');
    const [newItemPart, setNewItemPart] = useState('');
    const [newItemDesc, setNewItemDesc] = useState('');
    
    // AI Generation States
    const [magicPrompt, setMagicPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Expand State
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        setExpandedId(prev => prev === id ? null : id);
    };

    const handleAddOutfit = () => {
        if (!newItemPart.trim() || !newItemDesc.trim()) return;
        
        const newItem: OutfitItem = {
            id: crypto.randomUUID(),
            target: activeTab,
            part: newItemPart.trim(),
            desc: newItemDesc.trim()
        };
        
        setOutfits([...outfits, newItem]);
        setNewItemPart('');
        setNewItemDesc('');
    };

    const handleRemoveOutfit = (id: string) => {
        setOutfits(outfits.filter(o => o.id !== id));
    };

    const handleAiReplace = (newItems: { part: string, desc: string }[], mode: 'replace' | 'append') => {
        // Convert new AI items to OutfitItem
        const formattedItems: OutfitItem[] = newItems.map(item => ({
            id: crypto.randomUUID(),
            target: activeTab,
            part: item.part,
            desc: item.desc
        }));

        if (mode === 'replace') {
            const otherOutfits = outfits.filter(o => o.target !== activeTab);
            setOutfits([...otherOutfits, ...formattedItems]);
        } else {
            setOutfits([...outfits, ...formattedItems]);
        }
    };

    const handleMagicGenerate = async (mode: 'replace' | 'append') => {
        if (!magicPrompt.trim() || isGenerating) return;
        
        setIsGenerating(true);
        try {
            const items = await generateOutfitConfig(magicPrompt, 'text');
            if (items && items.length > 0) {
                handleAiReplace(items, mode);
                setMagicPrompt('');
            }
        } catch (error: unknown) {
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleImageProcess = async (file: File) => {
        if (!file.type.startsWith('image/')) return;
        
        setIsGenerating(true);
        try {
            const reader = new FileReader();
            reader.onload = async (event: ProgressEvent<FileReader>) => {
                const base64 = event.target?.result as string;
                const items = await generateOutfitConfig(base64, 'image');
                if (items && items.length > 0) {
                    handleAiReplace(items, 'replace'); // default
                }
                setIsGenerating(false);
            };
            reader.readAsDataURL(file);
        } catch (error: unknown) {
            console.error(error);
            setIsGenerating(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleImageProcess(file);
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const file = e.clipboardData.files?.[0];
        if (file) {
            handleImageProcess(file);
        }
    };

    // Filter displayed items based on active tab
    const displayedOutfits = outfits.filter(o => o.target === activeTab);

    return (
        <div 
            className="animate-fade-in flex flex-col h-full bg-zinc-950/50 backdrop-blur-xl rounded-xl relative"
            onPaste={handlePaste}
        >
            {/* Header / Tabs */}
            <div className="flex flex-col gap-4 mb-4">
                <div className="flex items-center justify-between text-zinc-400">
                    <button onClick={onBack} className="flex items-center gap-2 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
                        <ArrowLeft size={14} /> {t('ctx.back')}
                    </button>
                    <div className="flex items-center gap-1.5 text-violet-400">
                        <Shirt size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{t('wd.title')}</span>
                    </div>
                </div>

                {/* AI MAGIC AREA */}
                <div className="space-y-2">
                    {/* Text Prompt */}
                    <div className="flex flex-col gap-2">
                        <input 
                            type="text"
                            value={magicPrompt}
                            onChange={(e) => setMagicPrompt(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleMagicGenerate('replace')}
                            placeholder={t('wd.magic.prompt')}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white focus:border-violet-500 outline-none placeholder-zinc-500 shadow-inner"
                            disabled={isGenerating}
                        />
                        {magicPrompt.trim() && (
                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                <button 
                                    onClick={() => handleMagicGenerate('replace')}
                                    disabled={isGenerating}
                                    title="Ganti Keseluruhan Pakaian"
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-violet-600/20 hover:bg-violet-600 border border-violet-500 text-violet-100 rounded-xl transition-all disabled:opacity-50 text-xs font-medium"
                                >
                                    {isGenerating ? <Loader2 size={12} className="animate-spin"/> : <Wand2 size={12} />}
                                    Ganti Semua
                                </button>
                                <button 
                                    onClick={() => handleMagicGenerate('append')}
                                    disabled={isGenerating}
                                    title="Tambahkan ke Pakaian Saat Ini"
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-xl transition-all disabled:opacity-50 text-xs font-medium"
                                >
                                    <Plus size={12} />
                                    Tambahkan
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Drop Zone */}
                    <div 
                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                        onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`
                            h-16 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all gap-1
                            ${isDragOver 
                                ? 'border-violet-500 bg-violet-500/10' 
                                : 'border-zinc-800 bg-black/20 hover:border-zinc-600 hover:bg-black/40'}
                        `}
                    >
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageProcess(e.target.files[0])} />
                        <div className="flex items-center gap-2 text-zinc-500">
                            {isGenerating ? (
                                <>
                                    <Loader2 size={14} className="animate-spin text-violet-400" />
                                    <span className="text-[9px] font-medium text-violet-400 animate-pulse">{t('wd.magic.analyzing')}</span>
                                </>
                            ) : (
                                <>
                                    <ImageIcon size={14} className={isDragOver ? "text-violet-400" : ""} />
                                    <span className={`text-[9px] font-medium uppercase tracking-wide ${isDragOver ? "text-violet-300" : ""}`}>
                                        {isDragOver ? t('wd.drop') : t('wd.drop.idle')}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800 mt-2">
                    <button 
                        onClick={() => setActiveTab('char')}
                        className={`flex-1 py-2 text-[10px] uppercase font-bold rounded-md transition-all flex items-center justify-center gap-2 ${activeTab === 'char' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <Sparkles size={12} /> {characterName.split(' ')[0]}
                    </button>
                    <button 
                        onClick={() => setActiveTab('user')}
                        className={`flex-1 py-2 text-[10px] uppercase font-bold rounded-md transition-all flex items-center justify-center gap-2 ${activeTab === 'user' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <User size={12} /> User
                    </button>
                </div>
            </div>

            {/* List Area */}
            <div className="flex-1 overflow-y-auto space-y-2 mb-4 custom-scrollbar pr-1">
                {displayedOutfits.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-40 text-zinc-600 space-y-2 border-2 border-dashed border-zinc-800 rounded-xl bg-black/10">
                        <Shirt size={24} className="opacity-20" />
                        <p className="text-xs italic">{t('wd.empty')}</p>
                    </div>
                )}
                {displayedOutfits.map(item => (
                    <div 
                        key={item.id} 
                        onClick={() => toggleExpand(item.id)}
                        className={`
                            bg-zinc-900/80 border border-white/5 p-3 rounded-xl flex items-start gap-3 group transition-all cursor-pointer select-none
                            ${expandedId === item.id ? 'bg-zinc-900 border-violet-500/30' : 'hover:border-violet-500/20'}
                        `}
                    >
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <p className="text-[9px] text-violet-400 uppercase font-bold tracking-wider">{item.part}</p>
                                {expandedId === item.id ? <ChevronUp size={10} className="text-zinc-500" /> : <ChevronDown size={10} className="text-zinc-500" />}
                            </div>
                            <p 
                                className={`text-xs text-zinc-200 transition-all ${expandedId === item.id ? 'whitespace-pre-wrap leading-relaxed' : 'truncate'}`}
                            >
                                {item.desc}
                            </p>
                        </div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleRemoveOutfit(item.id); }}
                            className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Manual Input Area */}
            <div className="pt-4 border-t border-white/5 space-y-3 bg-zinc-900/30 p-3 rounded-xl">
                <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 font-bold uppercase ml-1">{t('wd.lbl.part')}</label>
                    <input 
                        value={newItemPart}
                        onChange={(e) => setNewItemPart(e.target.value)}
                        placeholder="e.g. Head, Torso, Legs"
                        className="w-full bg-black/50 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:border-violet-500 outline-none placeholder-zinc-700 transition-colors"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 font-bold uppercase ml-1">{t('wd.lbl.desc')}</label>
                    <input 
                        value={newItemDesc}
                        onChange={(e) => setNewItemDesc(e.target.value)}
                        placeholder="e.g. Red Cap, White Shirt"
                        className="w-full bg-black/50 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:border-violet-500 outline-none placeholder-zinc-700 transition-colors"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddOutfit()}
                    />
                </div>
                <button 
                    onClick={handleAddOutfit}
                    disabled={!newItemPart.trim() || !newItemDesc.trim()}
                    className="w-full bg-violet-600 disabled:bg-zinc-800 disabled:text-zinc-600 hover:bg-violet-500 text-white font-bold py-2.5 rounded-xl text-xs uppercase flex items-center justify-center gap-2 transition-all mt-2 active:scale-95"
                >
                    <Plus size={14} /> {t('wd.btn.add')}
                </button>
            </div>
        </div>
    );
};