import React, { useRef } from 'react';
import { Smartphone as SmartphoneIcon, RotateCw, Send, Slash } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InputAreaProps {
    inputText: string;
    setInputText: (text: string) => void;
    onTypingStart?: () => void;
    onSend: () => void;
    onContinue?: () => void;
    isTyping: boolean;
    selectedImage: string | null;
    setSelectedImage: (img: string | null) => void;
    isWorking: boolean;
    charName: string;
    onShowPhone: () => void;
    onOpenImageGen: () => void;
    onOpenCheat: () => void;
}

export const InputArea: React.FC<InputAreaProps> = ({
    inputText, setInputText, onTypingStart, onSend, onContinue, isTyping, selectedImage, setSelectedImage,
    isWorking, charName, onShowPhone, onOpenCheat
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => setSelectedImage(reader.result as string);
          reader.readAsDataURL(file);
        }
    };

    return (
        <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 300, damping: 30 }}
            className="p-4 md:p-6 z-20 shrink-0 relative"
        >
            <div className="w-full relative bg-zinc-900/80 backdrop-blur-xl border border-white/10 hover:border-[#9600FF]/50 focus-within:border-[#9600FF] focus-within:shadow-[0_0_20px_rgba(150,0,255,0.15)] rounded-[1.5rem] p-2 pl-2 flex items-end shadow-2xl transition-all duration-500">
                
                <div className="flex gap-1 mb-1.5 ml-1 text-zinc-400 relative">
                     <motion.button 
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onOpenCheat}
                        className="p-2 rounded-full transition-colors hover:bg-zinc-800 hover:text-[#9600FF] group relative"
                        title="System Override"
                     >
                        <Slash size={20} className="transform rotate-12" />
                     </motion.button>
                     
                     <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onShowPhone} 
                        className="p-2 hover:bg-zinc-800 hover:text-[#9600FF] rounded-full transition-colors hidden sm:block"
                     >
                        <SmartphoneIcon size={20} />
                     </motion.button>
                     
                     <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>

                <textarea 
                    ref={textareaRef}
                    value={inputText} 
                    onChange={(e) => {
                        setInputText(e.target.value);
                        if (onTypingStart && e.target.value.length > 0) {
                            onTypingStart();
                        }
                    }} 
                    onKeyDown={(e) => { 
                        if (e.key === 'Enter' && e.ctrlKey) { 
                            e.preventDefault(); 
                            if(inputText.trim() || selectedImage) {
                                onSend(); 
                            }
                        } else if (e.key === 'Enter' && e.shiftKey) {
                            e.preventDefault();
                            if (onContinue) onContinue();
                        }
                    }} 
                    placeholder={isWorking ? "Sedang Bekerja..." : `Kirim pesan ke ${charName}... (Ctrl+Enter untuk kirim, Shift+Enter untuk AI Lanjut)`}
                    className="flex-1 bg-transparent text-white placeholder-zinc-500 text-[15px] max-h-32 min-h-[48px] py-3.5 px-3 outline-none resize-none custom-scrollbar leading-relaxed" 
                    rows={1}
                    autoFocus
                />

                <AnimatePresence mode="popLayout">
                    <div className="flex items-center">
                        {/* Only show AI continue button on small screens/mobile to match user request */}
                        <motion.button 
                            key="ai-turn"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onContinue} 
                            disabled={isTyping} 
                            className={`
                                sm:hidden m-1.5 p-3 rounded-[1rem] transition-colors duration-300 shadow-lg flex items-center justify-center
                                bg-zinc-800 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-700 active:bg-[#9600FF]/20
                                ${isTyping ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}
                            `}
                            title="AI Turn (Shift+Enter)"
                        >
                            <RotateCw size={18} />
                        </motion.button>

                        <motion.button 
                            key={isTyping ? "typing" : "ready"}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            whileHover={{ scale: (!inputText.trim() && !selectedImage) ? 1 : 1.05 }}
                            whileTap={{ scale: (!inputText.trim() && !selectedImage) ? 1 : 0.95 }}
                            onClick={onSend} 
                            disabled={(!inputText.trim() && !selectedImage) || isTyping} 
                            className={`
                                m-1.5 p-3 rounded-[1rem] transition-colors duration-300 shadow-lg flex items-center justify-center
                                ${(!inputText.trim() && !selectedImage) 
                                    ? 'bg-zinc-800/80 text-zinc-600 cursor-not-allowed border border-transparent' 
                                    : 'bg-[#9600FF] text-white hover:bg-[#b966ff] hover:shadow-[0_0_15px_rgba(150,0,255,0.4)] border border-[#b966ff]/50'
                                }
                            `}
                        >
                            {isTyping ? <RotateCw size={18} className="animate-spin text-white"/> : <Send size={18} className={inputText.trim() ? "translate-x-0.5" : ""} />}
                        </motion.button>
                    </div>
                </AnimatePresence>
            </div>
            
            <div className="text-center mt-3 relative z-10">
                <p className="text-[10px] text-zinc-600 font-mono tracking-widest uppercase">
                    Secured Connection • Memory Encrypted
                </p>
            </div>
        </motion.div>
    );
};
