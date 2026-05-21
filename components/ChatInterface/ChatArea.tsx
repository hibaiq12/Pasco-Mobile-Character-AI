import React, { useState, useEffect } from 'react';
import { Message, Character } from '../../types';
import { Zap, Edit3, RefreshCw, Check, ImagePlus, Trash2, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';

interface ChatAreaProps {
    messages: Message[];
    activeChar: Character;
    isGroup: boolean;
    isTyping: boolean;
    onRegenerate: () => void;
    onEditMessage: (id: string, newText: string) => void;
    editingMessageId: string | null;
    setEditingMessageId: (id: string | null) => void;
    onNavigateToSettings: () => void;
    containerRef: React.RefObject<HTMLDivElement>;
    onGenerateImage: (text: string) => void;
    onImageClick: (url: string, prompt: string) => void;
    onDeleteMessage: (id: string) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
    messages, activeChar, isGroup, isTyping,
    onRegenerate, onEditMessage, editingMessageId, setEditingMessageId,
    onNavigateToSettings, containerRef, onGenerateImage, onImageClick, onDeleteMessage
}) => {
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const [deleteCountdown, setDeleteCountdown] = useState<number>(0);

    useEffect(() => {
        if (pendingDeleteId && deleteCountdown > 0) {
            const timer = setTimeout(() => {
                setDeleteCountdown(prev => prev - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [pendingDeleteId, deleteCountdown]);

    useEffect(() => {
        if (pendingDeleteId && deleteCountdown === 0) {
            // Use a slight timeout to push the state update to the next tick
            // and avoid "setState synchronously within an effect" warning
            const timer = setTimeout(() => {
                setPendingDeleteId(null);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [pendingDeleteId, deleteCountdown]);

    const initiateDelete = (id: string) => {
        setPendingDeleteId(id);
        setDeleteCountdown(15);
    };

    const confirmDelete = () => {
        if (pendingDeleteId) {
            onDeleteMessage(pendingDeleteId);
            setPendingDeleteId(null);
        }
    };

    const renderMessageContent = (text: string, isUser: boolean) => {
        if (text.includes('||SETTINGS||')) {
            const parts = text.split('||SETTINGS||');
            return (
                <span className={`leading-relaxed ${isUser ? 'text-violet-50' : 'text-zinc-300'}`}>
                    {parts[0]}
                    <span 
                        className="text-blue-400 hover:text-blue-300 hover:underline cursor-pointer font-bold mx-1"
                        onClick={onNavigateToSettings}
                    >
                        &lt;Settings&gt;
                    </span>
                    {parts[1]}
                </span>
            );
        }

        const markdownComponents = !isUser ? {
            em: ({ ...props }: any) => (
                <span style={{ color: '#9600FF', fontStyle: 'italic', opacity: 0.9 }} {...props} />
            ),
            strong: ({ ...props }: any) => (
                <span style={{ color: '#b966ff', fontStyle: 'italic', fontWeight: 'bold' }} {...props} />
            )
        } : undefined;

        let processedText = text;
        if (!isUser) {
            processedText = text.replace(/(\([^)]+\))/g, '*$1*');
        }

        return (
            <div className={`markdown-content leading-relaxed ${isUser ? 'text-violet-50' : 'text-zinc-300'}`}>
               <ReactMarkdown components={markdownComponents}>
                   {processedText}
               </ReactMarkdown>
            </div>
        );
    };

    const extractPrompt = (text: string) => {
        const match = text.match(/\[Visualisasi:\s*(.*?)\]/i);
        return match ? match[1] : text;
    };

    const [visibleCount, setVisibleCount] = useState(15);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight } = e.currentTarget;
        
        // Load older messages when scrolling near top
        if (scrollTop < scrollHeight * 0.2) {
            setVisibleCount(prev => Math.min(messages.length, prev + 10));
        }
    };

    // Ensure we see latest message when a new one is added
    useEffect(() => {
        setVisibleCount(prev => Math.min(messages.length, prev + 1));
    }, [messages.length]);

    const [forceLoading, setForceLoading] = useState(false);

    // Handle Force Scroll from Image History
    useEffect(() => {
        const handleForceScroll = (e: CustomEvent) => {
            const id = e.detail?.id;
            if (!id) return;
            
            const index = messages.findIndex(m => m.id === id);
            if (index === -1) return;

            setForceLoading(true);

            // How many messages from the end is it?
            const fromEnd = messages.length - index;
            // Pad it a bit
            const neededCount = fromEnd + 5;
            
            if (visibleCount < neededCount) {
                setVisibleCount(Math.min(messages.length, neededCount));
            }

            // Retry until it's rendered
            let attempts = 0;
            const tryScroll = () => {
                const msgEl = document.getElementById(`msg-${id}`);
                if (msgEl) {
                    setForceLoading(false);
                    msgEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    msgEl.classList.add('ring-2', 'ring-cyan-500', 'transition-all', 'duration-500');
                    setTimeout(() => msgEl.classList.remove('ring-2', 'ring-cyan-500'), 2000);
                } else if (attempts < 20) {
                    attempts++;
                    setTimeout(tryScroll, 50);
                } else {
                    setForceLoading(false);
                }
            };
            tryScroll();
        };

        window.addEventListener('forceScrollToMessage', handleForceScroll as EventListener);
        return () => window.removeEventListener('forceScrollToMessage', handleForceScroll as EventListener);
    }, [messages, visibleCount]);

    const visibleMessages = messages.slice(Math.max(0, messages.length - visibleCount));

    return (
        <div 
            ref={containerRef} 
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto w-full p-4 md:p-6 custom-scrollbar scroll-smooth relative gpu-accelerated"
        >
            {forceLoading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <RefreshCw size={20} className="animate-spin text-cyan-400" />
                        <span className="text-xs font-bold text-cyan-400 tracking-widest uppercase">Loading Context...</span>
                    </div>
                </div>
            )}
            
            <div className="w-full pb-8 space-y-6">
                <AnimatePresence initial={false}>
                    {visibleMessages.map((msg, idx) => {
                        const isUser = msg.role === 'user';
                        const msgTime = new Date(msg.timestamp).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit', hour12: false}).replace(/\./g, ':');
                        const showDate = idx === 0 || new Date(visibleMessages[idx-1].timestamp).getDate() !== new Date(msg.timestamp).getDate();
                        const isLatest = idx === visibleMessages.length - 1;
                        
                        return (
                            <React.Fragment key={msg.id}>
                                <div id={`msg-${msg.id}`}>
                                {showDate && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, ease: "easeOut" }}
                                        className="flex justify-center my-6"
                                    >
                                        <span className="bg-zinc-900/80 border border-white/5 text-[#9600FF]/80 text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg backdrop-blur">
                                            {new Date(msg.timestamp).toLocaleDateString('id-ID', {weekday:'long', day:'numeric', month:'long', year:'numeric'}).toUpperCase()}
                                        </span>
                                    </motion.div>
                                )}
                                
                                {msg.isSystemEvent ? (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.4 }}
                                        className="flex justify-center my-6 w-full px-4"
                                    >
                                        <div className="bg-zinc-900/60 backdrop-blur-md border border-[#9600FF]/20 rounded-full py-1.5 px-4 flex items-center gap-2 shadow-[0_0_15px_rgba(150,0,255,0.1)]">
                                            <Zap size={10} className="text-[#9600FF]" />
                                            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                                                {msg.text.replace(/\[SYSTEM:|\]|\*/g, '').trim()}
                                            </span>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20, x: isUser ? 20 : -20 }}
                                        animate={{ opacity: 1, y: 0, x: 0 }}
                                        transition={{ type: "spring", stiffness: 250, damping: 25 }}
                                        className={`flex ${isUser ? 'justify-end' : 'justify-start'} group items-end gap-3`}
                                    >
                                        {!isUser && (
                                            <div className="flex-shrink-0 flex flex-col items-center gap-1 cursor-pointer group/avatar" onClick={() => (window as any)._openImageHistory && (window as any)._openImageHistory()}>
                                                <img src={msg.speakerAvatar || activeChar.avatar} className="w-8 h-8 rounded-full border border-zinc-700/50 object-cover shadow-lg group-hover/avatar:border-cyan-500/50 group-hover/avatar:shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all" />
                                                <div className="text-[8px] font-bold text-cyan-500 opacity-0 group-hover/avatar:opacity-100 transition-opacity">MEMORIES</div>
                                            </div>
                                        )}
                                        
                                        <div className={`
                                            relative max-w-[85%] md:max-w-[75%] px-5 py-3.5 text-sm shadow-md transition-all duration-300 backdrop-blur-md
                                            ${isUser 
                                                ? 'bg-gradient-to-br from-[#8400FF] to-[#6000c0] text-white rounded-[1.2rem] rounded-br-none shadow-[#8400FF]/20 hover:shadow-[#8400FF]/30' 
                                                : 'bg-zinc-900/90 text-zinc-200 border border-white/5 rounded-[1.2rem] rounded-bl-none shadow-black/30 hover:border-[#9600FF]/30'
                                            }
                                        `}>
                                            {/* ACTION BUTTONS (Elevated Z-Index) */}
                                            <div className={`absolute -top-3 ${isUser ? 'left-0 -translate-x-2' : 'right-0 translate-x-2'} opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-50 pointer-events-auto`}>
                                                {isUser ? (
                                                    <button onClick={() => setEditingMessageId(msg.id)} className="p-1.5 bg-[#9600FF] text-white rounded-lg shadow hover:scale-110 hover:bg-[#b966ff] transition-all cursor-pointer"><Edit3 size={12} /></button>
                                                ) : (
                                                    <>
                                                        <button 
                                                            onClick={() => initiateDelete(msg.id)} 
                                                            className="p-1.5 bg-red-600 text-white rounded-lg shadow hover:scale-110 hover:bg-red-500 transition-all cursor-pointer"
                                                            title="Delete message"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                        <button 
                                                            onClick={() => onGenerateImage(msg.text)} 
                                                            className="p-1.5 bg-cyan-600 text-white rounded-lg shadow hover:scale-110 hover:bg-cyan-500 transition-all cursor-pointer"
                                                            title="Visualize this moment"
                                                        >
                                                            <ImagePlus size={12} />
                                                        </button>
                                                        {isLatest && (
                                                            <button 
                                                                onClick={onRegenerate} 
                                                                className="p-1.5 bg-white text-black rounded-lg shadow hover:scale-110 hover:bg-zinc-200 transition-all cursor-pointer"
                                                            >
                                                                <RefreshCw size={12} />
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>

                                            {msg.speakerName && isGroup && !isUser && (
                                                <div className="text-[10px] font-bold text-[#b966ff] mb-1.5 uppercase tracking-wide">{msg.speakerName}</div>
                                            )}

                                            {msg.image && (
                                                <div 
                                                    className="mb-3 rounded-xl border border-white/10 w-full overflow-hidden bg-black/50 cursor-pointer relative group/img shadow-md hover:shadow-[0_0_15px_rgba(150,0,255,0.3)] transition-all"
                                                    onClick={() => onImageClick(msg.image!, extractPrompt(msg.text))}
                                                >
                                                    <img src={msg.image} className="w-full h-auto max-h-80 object-contain transition-transform duration-700 group-hover/img:scale-[1.03]" />
                                                    {/* Zoom Hint Overlay */}
                                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                        <div className="bg-black/70 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-bold text-white uppercase tracking-widest border border-white/20">
                                                            View Memory
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {editingMessageId === msg.id ? (
                                                <div className="min-w-[200px]">
                                                    <textarea defaultValue={msg.text} className="w-full bg-black/30 text-white p-2.5 rounded-lg text-sm mb-2 outline-none border border-white/20 focus:border-[#9600FF] transition-colors resize-none custom-scrollbar" rows={3} onKeyDown={(e) => { if(e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); onEditMessage(msg.id, e.currentTarget.value); }}} />
                                                    <div className="text-[10px] text-[#b966ff] font-mono">Press Ctrl + Enter to commit</div>
                                                </div>
                                            ) : (
                                                renderMessageContent(msg.text, isUser)
                                            )}
                                            
                                            {pendingDeleteId === msg.id && (
                                                <div className="absolute inset-0 bg-red-950/90 backdrop-blur-md rounded-[1.2rem] flex flex-col items-center justify-center p-4 z-[60] border border-red-500/50">
                                                    <p className="text-white text-sm font-bold mb-3 text-center">Hapus pesan ini?</p>
                                                    <div className="flex items-center gap-3">
                                                        <button 
                                                            onClick={() => setPendingDeleteId(null)} 
                                                            className="px-3 py-1.5 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                                                        >
                                                            <X size={14} /> Cancel
                                                        </button>
                                                        <button 
                                                            onClick={confirmDelete} 
                                                            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-red-900/50 transition-colors flex items-center gap-1"
                                                        >
                                                            <Trash2 size={14} /> Hapus ({deleteCountdown}s)
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div className={`flex items-center justify-end gap-1.5 mt-2 ${isUser ? 'opacity-80' : 'opacity-40'}`}>
                                                <span className="text-[9px] font-mono tracking-widest">{msgTime}</span>
                                                {isUser && <Check size={10} strokeWidth={3} />}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                                </div>
                            </React.Fragment>
                        );
                    })}
                </AnimatePresence>
                
                <AnimatePresence>
                    {isTyping && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, originY: 1 }}
                            className="flex justify-start items-end gap-3"
                        >
                            <img src={activeChar.avatar} className="w-8 h-8 rounded-full border border-zinc-700/50 object-cover grayscale opacity-60 pointer-events-none" />
                            <div className="bg-zinc-900/60 border border-white/5 py-4 px-5 rounded-[1.2rem] rounded-bl-none flex gap-1.5 items-center backdrop-blur-md shadow-lg shadow-black/10">
                                <motion.div 
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0 }}
                                    className="w-1.5 h-1.5 bg-[#9600FF] rounded-full" 
                                />
                                <motion.div 
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.15 }}
                                    className="w-1.5 h-1.5 bg-[#b966ff] rounded-full" 
                                />
                                <motion.div 
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.3 }}
                                    className="w-1.5 h-1.5 bg-violet-300 rounded-full" 
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
