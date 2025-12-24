
import React from 'react';
import { Message, Character } from '../../types';
import { Zap, Edit3, RefreshCw, Check, ImagePlus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

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
    onImageClick: (url: string, prompt: string) => void; // New Prop
}

export const ChatArea: React.FC<ChatAreaProps> = ({
    messages, activeChar, isGroup, isTyping,
    onRegenerate, onEditMessage, editingMessageId, setEditingMessageId,
    onNavigateToSettings, containerRef, onGenerateImage, onImageClick
}) => {

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
            em: ({node, ...props}: any) => (
                <span style={{ color: '#7288f7', fontStyle: 'italic' }} {...props} />
            ),
            strong: ({node, ...props}: any) => (
                <span style={{ color: '#7288f7', fontStyle: 'italic', fontWeight: 'bold' }} {...props} />
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

    // Helper to extract clean prompt from "[Visualisasi: ...]" text
    const extractPrompt = (text: string) => {
        const match = text.match(/\[Visualisasi:\s*(.*?)\]/i);
        return match ? match[1] : text;
    };

    return (
        <div ref={containerRef} className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar scroll-smooth relative">
            <div className="max-w-3xl mx-auto w-full pb-4 space-y-6">
                 {messages.map((msg, idx) => {
                     const isUser = msg.role === 'user';
                     const msgTime = new Date(msg.timestamp).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit', hour12: false}).replace(/\./g, ':');
                     const showDate = idx === 0 || new Date(messages[idx-1].timestamp).getDate() !== new Date(msg.timestamp).getDate();
                     
                     return (
                         <React.Fragment key={msg.id}>
                             {showDate && (
                                 <div className="flex justify-center my-6">
                                     <span className="bg-zinc-900/80 border border-white/5 text-zinc-500 text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-widest shadow-lg backdrop-blur">
                                         {new Date(msg.timestamp).toLocaleDateString('id-ID', {weekday:'long', day:'numeric', month:'long', year:'numeric'}).toUpperCase()}
                                     </span>
                                 </div>
                             )}
                             
                             {msg.isSystemEvent ? (
                                 <div className="flex justify-center my-6 animate-fade-in w-full px-4">
                                     <div className="bg-zinc-900/60 backdrop-blur-md border border-violet-500/10 rounded-full py-1.5 px-4 flex items-center gap-2 shadow-sm">
                                         <Zap size={10} className="text-violet-400" />
                                         <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                                             {msg.text.replace(/\[SYSTEM:|\]|\*/g, '').trim()}
                                         </span>
                                     </div>
                                 </div>
                             ) : (
                                 <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group items-end gap-3 animate-fade-in`}>
                                     {!isUser && (
                                        <div className="flex-shrink-0 flex flex-col items-center gap-1">
                                            <img src={msg.speakerAvatar || activeChar.avatar} className="w-8 h-8 rounded-full border border-zinc-700 object-cover shadow-lg" />
                                        </div>
                                     )}
                                     
                                     <div className={`
                                        relative max-w-[85%] md:max-w-[75%] px-5 py-3.5 text-sm shadow-md transition-all duration-200 backdrop-blur-sm
                                        ${isUser 
                                            ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-[1.2rem] rounded-br-none shadow-violet-900/20' 
                                            : 'bg-zinc-900/80 text-zinc-200 border border-white/5 rounded-[1.2rem] rounded-bl-none shadow-black/20'
                                        }
                                     `}>
                                         <div className={`absolute -top-3 ${isUser ? 'left-0 -translate-x-2' : 'right-0 translate-x-2'} opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10`}>
                                             {isUser ? (
                                                 <button onClick={() => setEditingMessageId(msg.id)} className="p-1.5 bg-blue-600 text-white rounded-lg shadow hover:scale-110 transition-transform"><Edit3 size={12} /></button>
                                             ) : (
                                                 <>
                                                     {/* Generate Image Button */}
                                                     <button 
                                                        onClick={() => onGenerateImage(msg.text)} 
                                                        className="p-1.5 bg-cyan-600 text-white rounded-lg shadow hover:scale-110 transition-transform"
                                                        title="Visualize this moment"
                                                     >
                                                         <ImagePlus size={12} />
                                                     </button>
                                                     <button onClick={onRegenerate} className="p-1.5 bg-white text-black rounded-lg shadow hover:scale-110 transition-transform"><RefreshCw size={12} /></button>
                                                 </>
                                             )}
                                         </div>

                                         {msg.speakerName && isGroup && !isUser && (
                                             <div className="text-[10px] font-bold text-violet-400 mb-1 uppercase tracking-wide">{msg.speakerName}</div>
                                         )}

                                         {msg.image && (
                                             <div 
                                                className="mb-3 rounded-xl border border-white/10 w-full overflow-hidden bg-black/50 cursor-pointer relative group/img"
                                                onClick={() => onImageClick(msg.image!, extractPrompt(msg.text))}
                                             >
                                                 <img src={msg.image} className="w-full h-auto max-h-80 object-contain transition-transform duration-500 group-hover/img:scale-105" />
                                                 {/* Zoom Hint Overlay */}
                                                 <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                     <div className="bg-black/60 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest border border-white/20">
                                                         Tap to Expand
                                                     </div>
                                                 </div>
                                             </div>
                                         )}
                                         
                                         {editingMessageId === msg.id ? (
                                             <div className="min-w-[200px]">
                                                 <textarea defaultValue={msg.text} className="w-full bg-black/20 text-white p-2 rounded text-sm mb-2 outline-none border border-white/10" onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onEditMessage(msg.id, e.currentTarget.value); }}} />
                                                 <div className="text-[10px] text-zinc-400">Press Enter to Save</div>
                                             </div>
                                         ) : (
                                             renderMessageContent(msg.text, isUser)
                                         )}
                                         
                                         <div className={`flex items-center justify-end gap-1.5 mt-1.5 ${isUser ? 'opacity-70' : 'opacity-50'}`}>
                                             <span className="text-[9px] font-mono tracking-widest">{msgTime}</span>
                                             {isUser && <Check size={10} strokeWidth={3} />}
                                         </div>
                                     </div>
                                 </div>
                             )}
                         </React.Fragment>
                     );
                 })}
                 
                 {isTyping && (
                     <div className="flex justify-start items-end gap-3 animate-fade-in">
                         <img src={activeChar.avatar} className="w-8 h-8 rounded-full border border-zinc-700 object-cover grayscale opacity-70" />
                         <div className="bg-zinc-900/50 border border-white/5 px-4 py-3 rounded-[1.2rem] rounded-bl-none flex gap-1 items-center backdrop-blur-sm">
                             <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                             <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                             <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></div>
                         </div>
                     </div>
                 )}
            </div>
        </div>
    );
};
