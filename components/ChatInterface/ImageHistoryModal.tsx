import React from 'react';
import { X, ArrowUpRight } from 'lucide-react';
import { Message } from '../../types';

interface ImageHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    messages: Message[];
    onScrollToMessage: (id: string) => void;
}

export const ImageHistoryModal: React.FC<ImageHistoryModalProps> = ({ isOpen, onClose, messages, onScrollToMessage }) => {
    if (!isOpen) return null;

    // Create a copy before reversing so we don't mutate the original array
    const imageMessages = [...messages].filter(m => m.image).reverse();

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-4xl h-[80vh] flex flex-col bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl mx-4 overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
                    <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                        Visual Memory Archive
                    </h2>
                    <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-zinc-400"><X size={18} /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                    {imageMessages.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-zinc-500 font-mono text-[10px] uppercase tracking-widest">
                            No visual memories generated yet
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {imageMessages.map(msg => (
                                <div key={msg.id} className="group relative rounded-xl border border-white/10 overflow-hidden bg-black aspect-square cursor-pointer" onClick={() => { onScrollToMessage(msg.id); onClose(); }}>
                                    <img src={msg.image} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                        <button className="flex items-center justify-center gap-1.5 w-full py-2 bg-[#9600FF] hover:bg-[#b966ff] text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors">
                                            Go to Message <ArrowUpRight size={12}/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
