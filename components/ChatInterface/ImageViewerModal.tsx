
import React from 'react';
import { X, Download, RefreshCw, Maximize2, ExternalLink } from 'lucide-react';

interface ImageViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    prompt: string;
    onRegenerate: (prompt: string) => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ 
    isOpen, onClose, imageUrl, prompt, onRegenerate 
}) => {
    if (!isOpen) return null;

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `pasco_generate_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-200">
            {/* Close Button */}
            <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-50 group"
            >
                <X size={24} className="group-hover:scale-110 transition-transform" />
            </button>

            <div className="w-full h-full flex flex-col relative">
                
                {/* Image Container */}
                <div className="flex-1 flex items-center justify-center p-4 md:p-10 overflow-hidden relative">
                    <img 
                        src={imageUrl} 
                        alt="Generated Content" 
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl shadow-black/50"
                    />
                </div>

                {/* Controls Bar */}
                <div className="p-6 pb-10 bg-gradient-to-t from-black via-black/90 to-transparent absolute bottom-0 left-0 right-0 flex flex-col items-center gap-4">
                    
                    {/* Prompt Text Display */}
                    <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md max-w-2xl text-center">
                        <p className="text-zinc-400 text-[10px] uppercase font-bold tracking-widest mb-1">Prompt Asli</p>
                        <p className="text-zinc-200 text-xs line-clamp-2 italic">"{prompt}"</p>
                    </div>

                    <div className="flex gap-4">
                        {/* Download Button (Max Res) */}
                        <button 
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95"
                        >
                            <Download size={16} />
                            Download HD
                        </button>

                        {/* Regenerate Button */}
                        <button 
                            onClick={() => onRegenerate(prompt)}
                            className="flex items-center gap-2 px-6 py-3 bg-zinc-800 text-white border border-zinc-700 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-zinc-700 hover:border-zinc-500 transition-all active:scale-95"
                        >
                            <RefreshCw size={16} />
                            Regenerate
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
