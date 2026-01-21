
import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../../../types';
import { X, Sparkles, CheckCircle, Save, MessageSquare, Check, ArrowDown, Search, ChevronUp, ChevronDown } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface MemoryCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    messages: Message[];
    onSave: (memoryData: { title: string; description: string; contextIds: string[] }) => void;
}

const HighlightedText = ({ text, highlight, isCurrent }: { text: string, highlight: string, isCurrent: boolean }) => {
    if (!highlight.trim()) return <>{text}</>;
    
    const parts = text.split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
        <span>
            {parts.map((part, i) => 
                part.toLowerCase() === highlight.toLowerCase() ? 
                    <span 
                        key={i} 
                        className={`${isCurrent ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-yellow-500/40 text-white'} rounded px-0.5 transition-all duration-300 font-bold`}
                    >
                        {part}
                    </span> : 
                    part
            )}
        </span>
    );
};

export const MemoryCreationModal: React.FC<MemoryCreationModalProps> = ({ isOpen, onClose, messages, onSave }) => {
    const [selectedMsgIds, setSelectedMsgIds] = useState<string[]>([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [showScrollButton, setShowScrollButton] = useState(false);
    
    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [matchingIds, setMatchingIds] = useState<string[]>([]);
    const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);

    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Limit to last 45 messages as requested to keep context focused
    const displayMessages = messages.slice(-45); 

    // Search Logic
    useEffect(() => {
        if (!searchQuery.trim()) {
            setMatchingIds([]);
            setCurrentMatchIndex(-1);
            return;
        }

        const query = searchQuery.toLowerCase();
        // Find matching message IDs (Ordered oldest to newest as per displayMessages)
        const matches = displayMessages
            .filter(m => m.text.toLowerCase().includes(query))
            .map(m => m.id);
        
        setMatchingIds(matches);
        
        // If matches found, jump to the latest one (bottom most usually relevant in chat)
        if (matches.length > 0) {
            setCurrentMatchIndex(matches.length - 1);
        } else {
            setCurrentMatchIndex(-1);
        }
    }, [searchQuery, isOpen]); // Rerun when query changes or modal opens

    // Auto-scroll to current match
    useEffect(() => {
        if (currentMatchIndex >= 0 && matchingIds.length > 0) {
            const targetId = matchingIds[currentMatchIndex];
            const element = document.getElementById(`msg-${targetId}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [currentMatchIndex, matchingIds]);

    // Navigation Handlers
    const nextMatch = () => {
        if (matchingIds.length === 0) return;
        setCurrentMatchIndex(prev => (prev + 1) % matchingIds.length); // Loop to start
    };

    const prevMatch = () => {
        if (matchingIds.length === 0) return;
        setCurrentMatchIndex(prev => (prev - 1 + matchingIds.length) % matchingIds.length); // Loop to end
    };

    // Auto-scroll to bottom on open (only if no search active)
    useEffect(() => {
        if (isOpen && chatContainerRef.current && !searchQuery) {
            setTimeout(() => {
                if (chatContainerRef.current) {
                    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
                }
            }, 100); 
        }
    }, [isOpen]);

    // Scroll listener for floating button visibility
    useEffect(() => {
        const container = chatContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            // Show button if user scrolled up more than 150px from bottom
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
            setShowScrollButton(!isNearBottom);
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [isOpen]);

    const scrollToBottom = () => {
        chatContainerRef.current?.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: 'smooth'
        });
    };

    if (!isOpen) return null;

    const toggleMessage = (id: string) => {
        setSelectedMsgIds(prev => 
            prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
        );
    };

    const handleAutoGenerate = async () => {
        if (selectedMsgIds.length === 0) return;
        setIsGenerating(true);

        try {
            // Get selected text content
            const selectedTexts = messages
                .filter(m => selectedMsgIds.includes(m.id))
                .map(m => `${m.role === 'user' ? 'User' : 'Character'}: ${m.text}`)
                .join('\n');

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [
                    { 
                        role: 'user', 
                        parts: [{ 
                            text: `Analyze this conversation snippet and extract a specific "Shared Memory".
                            
                            Conversation:
                            ${selectedTexts}
                            
                            Output JSON format only:
                            {
                                "title": "Short poetic title (3-5 words)",
                                "description": "A descriptive summary of this memory and why it is meaningful for the bond (max 2 sentences)."
                            }` 
                        }] 
                    }
                ],
                config: { responseMimeType: "application/json" }
            });

            const result = JSON.parse(response.text || "{}");
            if (result.title) setTitle(result.title);
            if (result.description) setDescription(result.description);

        } catch (error) {
            console.error("Memory Generation Failed", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = () => {
        if (!title || !description) return;
        onSave({ title, description, contextIds: selectedMsgIds });
        // Reset
        setTitle('');
        setDescription('');
        setSelectedMsgIds([]);
        setSearchQuery('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-[#09090b] border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col h-[85vh] overflow-hidden">
                
                {/* Header with Search */}
                <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-cyan-950/10 shrink-0 gap-4 sm:gap-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400 border border-cyan-500/20">
                            <BrainCircuitIcon />
                        </div>
                        <div className="hidden sm:block">
                            <h3 className="text-lg font-bold text-white tracking-wide">EXTRACT ENGRAM</h3>
                            <p className="text-[10px] text-cyan-400/70 font-mono uppercase tracking-widest">Select Bubbles</p>
                        </div>
                    </div>

                    {/* Search Controls */}
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex items-center flex-1 sm:w-64 bg-black/40 border border-white/10 rounded-lg focus-within:border-cyan-500/50 transition-colors">
                            <Search size={14} className="text-zinc-500 ml-3 shrink-0" />
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search conversation..."
                                className="bg-transparent border-none outline-none text-xs text-zinc-200 placeholder-zinc-600 px-3 py-2 w-full"
                            />
                            
                            {matchingIds.length > 0 && (
                                <div className="flex items-center border-l border-white/10 pr-1">
                                    <span className="text-[9px] text-zinc-500 font-mono px-2">
                                        {currentMatchIndex + 1}/{matchingIds.length}
                                    </span>
                                    <button onClick={prevMatch} className="p-1 text-zinc-400 hover:text-white hover:bg-white/10 rounded">
                                        <ChevronUp size={14} />
                                    </button>
                                    <button onClick={nextMatch} className="p-1 text-zinc-400 hover:text-white hover:bg-white/10 rounded">
                                        <ChevronDown size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-2 bg-white/5 rounded-lg hover:bg-white/10">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Main Content Area - Layout Fix: Ensure flex parents allow expansion */}
                <div className="flex-1 flex flex-col min-h-0 relative">
                    
                    {/* Chat Bubble Selection Area */}
                    <div className="flex-1 relative">
                        <div 
                            ref={chatContainerRef}
                            className="absolute inset-0 overflow-y-auto p-4 space-y-4 bg-black/40 custom-scrollbar scroll-smooth"
                        >
                            {/* Instructional Placeholder if empty selection */}
                            {selectedMsgIds.length === 0 && !searchQuery && (
                                <div className="sticky top-0 left-0 right-0 flex justify-center z-10 pointer-events-none mb-4">
                                    <div className="bg-black/60 text-zinc-400 text-[10px] px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md shadow-lg">
                                        Last 45 Messages • Tap to select
                                    </div>
                                </div>
                            )}

                            {displayMessages.map(msg => {
                                const isUser = msg.role === 'user';
                                const isSelected = selectedMsgIds.includes(msg.id);
                                const isMatch = matchingIds.includes(msg.id);
                                const isCurrentMatch = matchingIds[currentMatchIndex] === msg.id;
                                
                                return (
                                    <div 
                                        key={msg.id}
                                        id={`msg-${msg.id}`}
                                        onClick={() => toggleMessage(msg.id)}
                                        className={`flex ${isUser ? 'justify-end' : 'justify-start'} group cursor-pointer transition-opacity ${searchQuery && !isMatch ? 'opacity-30' : 'opacity-100'}`}
                                    >
                                        <div 
                                            className={`
                                                relative max-w-[85%] px-4 py-3 text-sm rounded-2xl border transition-all duration-200 select-none
                                                ${isUser 
                                                    ? 'bg-blue-900/30 border-blue-500/30 text-blue-100 rounded-tr-none hover:bg-blue-900/50' 
                                                    : 'bg-zinc-800/50 border-white/5 text-zinc-300 rounded-tl-none hover:bg-zinc-800'}
                                                ${isSelected 
                                                    ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-black shadow-[0_0_15px_rgba(34,211,238,0.3)] !border-cyan-500/50 !bg-cyan-950/30' 
                                                    : ''}
                                                ${isCurrentMatch ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-black shadow-[0_0_20px_rgba(245,158,11,0.4)]' : ''}
                                            `}
                                        >
                                            {/* Selection Indicator */}
                                            <div className={`absolute -top-2 ${isUser ? '-left-2' : '-right-2'} z-10 transition-all duration-300 ${isSelected ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                                                <div className="bg-cyan-500 text-black rounded-full p-0.5 shadow-lg">
                                                    <Check size={12} strokeWidth={4} />
                                                </div>
                                            </div>

                                            <p className="leading-relaxed whitespace-pre-wrap">
                                                {searchQuery ? (
                                                    <HighlightedText text={msg.text} highlight={searchQuery} isCurrent={isCurrentMatch} />
                                                ) : (
                                                    msg.text
                                                )}
                                            </p>
                                            
                                            <div className={`text-[9px] mt-1 opacity-50 ${isUser ? 'text-right' : 'text-left'}`}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Scroll to Bottom Button */}
                        {showScrollButton && (
                            <button
                                onClick={scrollToBottom}
                                className="absolute bottom-4 right-4 p-2.5 bg-zinc-800/90 hover:bg-cyan-600 border border-white/10 text-zinc-400 hover:text-white rounded-full shadow-xl transition-all z-20 animate-in fade-in zoom-in duration-200 active:scale-90"
                                title="Scroll to bottom"
                            >
                                <ArrowDown size={20} />
                            </button>
                        )}
                    </div>

                    {/* Bottom Area: Configuration */}
                    <div className="shrink-0 bg-zinc-900/95 backdrop-blur-xl border-t border-white/10 max-h-[45vh] overflow-y-auto custom-scrollbar shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20">
                        <div className="p-5 space-y-5">
                            
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                    <MessageSquare size={12}/> {selectedMsgIds.length} Messages Selected
                                </span>
                                <button 
                                    onClick={handleAutoGenerate}
                                    disabled={selectedMsgIds.length === 0 || isGenerating}
                                    className={`
                                        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border
                                        ${isGenerating 
                                            ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-200 cursor-wait'
                                            : selectedMsgIds.length > 0
                                                ? 'bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border-cyan-500/30 text-cyan-300 hover:text-white hover:border-cyan-400'
                                                : 'bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed'}
                                    `}
                                >
                                    <Sparkles size={12} className={isGenerating ? "animate-spin" : ""} />
                                    {isGenerating ? "Analyzing..." : "Auto-Generate"}
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Memory Label</label>
                                    <input 
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g. The Rainy Day Promise"
                                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-cyan-100 focus:border-cyan-500/50 outline-none transition-colors placeholder-zinc-700"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Description</label>
                                    <textarea 
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Describe why this memory is significant..."
                                        className="w-full h-24 bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-zinc-300 focus:border-cyan-500/50 outline-none transition-colors resize-none leading-relaxed placeholder-zinc-700"
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={handleSave}
                                disabled={!title || !description}
                                className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 text-white rounded-xl font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                            >
                                <Save size={14} /> Implant Memory
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BrainCircuitIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M9 13a4.5 4.5 0 0 0 3-4"/><path d="M6.003 5.125A3 3 0 0 1 19.5 8"/><path d="M12 18a4 4 0 0 0 4-3.464 6.506 6.506 0 0 0 .993-8.325"/><path d="M12 10h1"/><path d="M12 6V3"/><path d="M12 21v-3"/><path d="M3 9h3"/><path d="M18 9h3"/></svg>
);
