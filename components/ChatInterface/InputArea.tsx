
import React, { useRef, useState, useEffect } from 'react';
import { Image as ImageIcon, Smartphone as SmartphoneIcon, RotateCw, Send, Sparkles, Upload } from 'lucide-react';

interface InputAreaProps {
    inputText: string;
    setInputText: (text: string) => void;
    onSend: () => void;
    isTyping: boolean;
    selectedImage: string | null;
    setSelectedImage: (img: string | null) => void;
    isWorking: boolean;
    charName: string;
    onShowPhone: () => void;
    onOpenImageGen: () => void; // New Prop
}

export const InputArea: React.FC<InputAreaProps> = ({
    inputText, setInputText, onSend, isTyping, selectedImage, setSelectedImage,
    isWorking, charName, onShowPhone, onOpenImageGen
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [showMediaMenu, setShowMediaMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMediaMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => setSelectedImage(reader.result as string);
          reader.readAsDataURL(file);
        }
        setShowMediaMenu(false);
    };

    return (
        <div className="p-4 md:p-6 z-20 shrink-0">
            <div className="max-w-3xl mx-auto relative bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 focus-within:border-zinc-700 rounded-[1.5rem] p-2 pl-2 flex items-end shadow-2xl transition-colors duration-300">
                
                <div className="flex gap-1 mb-1.5 ml-1 text-zinc-400 relative" ref={menuRef}>
                     {/* Media Menu Popup */}
                     {showMediaMenu && (
                         <div className="absolute bottom-full left-0 mb-3 bg-zinc-950 border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[150px] animate-in slide-in-from-bottom-2 fade-in z-50">
                             <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full px-4 py-3 hover:bg-white/5 flex items-center gap-3 text-xs font-bold text-zinc-300 hover:text-white transition-colors border-b border-white/5"
                             >
                                 <Upload size={14} /> Upload Image
                             </button>
                             <button 
                                onClick={() => { setShowMediaMenu(false); onOpenImageGen(); }}
                                className="w-full px-4 py-3 hover:bg-white/5 flex items-center gap-3 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors bg-cyan-950/20"
                             >
                                 <Sparkles size={14} /> Create Image
                             </button>
                         </div>
                     )}

                     <button 
                        onClick={() => setShowMediaMenu(!showMediaMenu)} 
                        className={`p-2 rounded-full transition-colors relative group ${showMediaMenu ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 hover:text-zinc-200'}`}
                     >
                        <ImageIcon size={20} />
                     </button>
                     
                     <button onClick={onShowPhone} className="p-2 hover:bg-zinc-800 hover:text-zinc-200 rounded-full transition-colors hidden sm:block">
                        <SmartphoneIcon size={20} />
                     </button>
                     <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>

                <textarea 
                    ref={textareaRef}
                    value={inputText} 
                    onChange={(e) => setInputText(e.target.value)} 
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }} 
                    placeholder={isWorking ? "Sedang Bekerja..." : `Message ${charName}...`}
                    className="flex-1 bg-transparent text-zinc-200 placeholder-zinc-600 text-sm max-h-32 min-h-[48px] py-3.5 px-3 outline-none resize-none custom-scrollbar leading-relaxed" 
                    rows={1}
                    autoFocus
                />

                <button 
                    onClick={onSend} 
                    disabled={!inputText.trim() && !selectedImage || isTyping} 
                    className={`
                        m-1.5 p-3 rounded-xl transition-all duration-300 shadow-lg flex items-center justify-center
                        ${(!inputText.trim() && !selectedImage) 
                            ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:shadow-violet-500/25 transform active:scale-95'
                        }
                    `}
                >
                    {isTyping ? <RotateCw size={18} className="animate-spin"/> : <Send size={18} className={inputText.trim() ? "translate-x-0.5" : ""} />}
                </button>
            </div>
            
            <div className="text-center mt-2">
                <p className="text-[10px] text-zinc-500/80 font-medium tracking-wide">
                    AI generated content. Memories are stored locally.
                </p>
            </div>
        </div>
    );
};
