
import React, { useState } from 'react';
import { Character, Message, OutfitItem } from '../../../types';
import { X, Cpu } from 'lucide-react';
import { useProfileEngine } from './ProfileEngine';
import { NeuralHeader } from './NeuralHeader';
import { 
    VisualState, 
    PsycheStability, 
    SocialProtocol, 
    DeepLayerDrift, 
    ActiveMemory, 
    SharedMemoriesModule
} from './NeuralModules';
import { MemoryCreationModal } from './MemoryCreationModal';

interface NeuroSenseProps {
    activeChar: Character;
    messages: Message[];
    outfits?: OutfitItem[];
    virtualTime: number;
    isMobile?: boolean;
    onClose?: () => void;
    onUpdateCharacter?: (updatedChar: Character) => void;
}

export const NeuroSense: React.FC<NeuroSenseProps> = ({ 
    activeChar, messages, outfits = [], virtualTime, isMobile, onClose, onUpdateCharacter 
}) => {
    
    // Initialize Realtime Engine
    const profile = useProfileEngine(activeChar, messages, outfits, virtualTime);
    const [showMemoryModal, setShowMemoryModal] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

    const handleSaveMemory = (memoryData: { title: string; description: string; contextIds: string[] }) => {
        if (!onUpdateCharacter) return;

        const memoryString = JSON.stringify({
            title: memoryData.title,
            description: memoryData.description,
            timestamp: virtualTime
        });

        // Deep clone character to update memory
        const updatedChar = { ...activeChar };
        
        // Ensure memory object exists and is cloned
        updatedChar.memory = updatedChar.memory ? { ...updatedChar.memory } : { memories: [], obsessions: '' };
        updatedChar.memory.memories = updatedChar.memory.memories ? [...updatedChar.memory.memories] : [];

        // Add new memory
        updatedChar.memory.memories.push(memoryString);

        onUpdateCharacter(updatedChar);
    };

    const handleConfirmDelete = () => {
        if (deleteIndex === null || !onUpdateCharacter) return;
        
        // Deep clone to ensure React detects the change
        const updatedChar = { ...activeChar };
        
        if (updatedChar.memory) {
            // Clone the memory object and the memories array
            const newMemoryData = { ...updatedChar.memory };
            const newMemories = newMemoryData.memories ? [...newMemoryData.memories] : [];
            
            if (deleteIndex >= 0 && deleteIndex < newMemories.length) {
                newMemories.splice(deleteIndex, 1);
                newMemoryData.memories = newMemories;
                updatedChar.memory = newMemoryData;
                
                onUpdateCharacter(updatedChar);
            }
        }
        setDeleteIndex(null);
    };

    return (
        <>
            <div className={`
                flex-col font-sans overflow-hidden transition-all duration-500 ease-in-out
                ${isMobile 
                    ? 'flex fixed inset-0 z-[60] w-full h-full bg-[#050505]/95 backdrop-blur-xl animate-in slide-in-from-left duration-500' 
                    : 'hidden lg:flex w-80 border-r border-white/5 bg-[#050505] z-10 relative shadow-[10px_0_30px_rgba(0,0,0,0.5)] h-full'
                }
            `}>
                
                {/* --- TECH BACKGROUND LAYERS --- */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>
                
                <div 
                    className="absolute top-[-10%] left-0 right-0 h-[500px] opacity-15 pointer-events-none transition-colors duration-[2000ms]"
                    style={{ 
                        background: `radial-gradient(circle at 50% 0%, ${profile.psyche.stability < 30 ? '#ef4444' : profile.psyche.stability < 60 ? '#eab308' : '#8b5cf6'}, transparent 70%)` 
                    }}
                />

                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

                {/* Mobile Header / Close */}
                {isMobile && (
                    <div className="flex justify-between items-center p-6 pb-4 relative z-50 bg-gradient-to-b from-[#050505] to-transparent">
                        <div className="flex items-center gap-3">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-cyan-500/20 rounded-lg blur-sm group-hover:bg-cyan-500/40 transition-all duration-500"></div>
                                <div className="relative w-10 h-10 rounded-lg bg-zinc-900/80 border border-cyan-500/30 flex items-center justify-center overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent"></div>
                                    <Cpu size={18} className="text-cyan-400 relative z-10" />
                                </div>
                            </div>
                            <div className="flex flex-col justify-center">
                                <h1 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-400 uppercase tracking-widest leading-none drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                                    NeuroSense
                                </h1>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_5px_#06b6d4]"></span>
                                    <span className="text-[9px] font-mono text-cyan-500/70 tracking-[0.2em]">VERSION 1.0</span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white border border-white/5 transition-all active:scale-95 group"
                        >
                            <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>
                )}

                {/* --- SCROLLABLE CONTENT --- */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 px-6 py-6 space-y-8">
                    
                    {/* Header Module */}
                    <NeuralHeader character={activeChar} profile={profile} />

                    {/* Modules Stacking */}
                    <div className="space-y-6 pb-12">
                        <div className="relative">
                            <div className="absolute -left-3 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
                            <VisualState state={profile.visualState} />
                        </div>

                        <PsycheStability psyche={profile.psyche} />
                        <SocialProtocol social={profile.social} />
                        
                        <div className="p-4 bg-zinc-900/30 rounded-2xl border border-white/5 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50 pointer-events-none"></div>
                            <DeepLayerDrift duality={profile.duality} />
                        </div>

                        <ActiveMemory memory={profile.memory} />
                        
                        {/* New Shared Memories Module */}
                        <SharedMemoriesModule 
                            memories={activeChar.memory?.memories || []} 
                            onAdd={() => setShowMemoryModal(true)} 
                            onDelete={(idx) => setDeleteIndex(idx)}
                        />
                    </div>
                </div>

                {/* Footer Decoration */}
                <div className="p-4 border-t border-white/5 bg-black/40 backdrop-blur-sm text-center relative z-20">
                    <p className="text-[9px] text-zinc-600 font-mono uppercase tracking-[0.3em]">
                        System Nominal // Monitored
                    </p>
                </div>
            </div>

            {/* Memory Creation Modal */}
            <MemoryCreationModal 
                isOpen={showMemoryModal} 
                onClose={() => setShowMemoryModal(false)}
                messages={messages}
                onSave={handleSaveMemory}
            />

            {/* Delete Confirmation Popup */}
            {deleteIndex !== null && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-zinc-900 border border-white/10 p-6 rounded-2xl max-w-sm w-full shadow-2xl space-y-4 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
                        <h3 className="text-lg font-bold text-white">Delete Memory?</h3>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                            Are you sure you want to remove this memory engram? This action will permanently erase it from the character's neural context.
                        </p>
                        <div className="flex gap-3 pt-2">
                            <button 
                                onClick={() => setDeleteIndex(null)} 
                                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-bold text-zinc-300 uppercase tracking-wider transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleConfirmDelete} 
                                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-red-900/20"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
