
import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Image as ImageIcon, Loader2, Upload, ScanFace, CheckCircle, AlertCircle, Camera, User } from 'lucide-react';
import { validateFaceInImage } from '../../services/Imagecreate';

interface ImageGenModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (prompt: string, customReference?: string, perspective?: 'third_person' | 'selfie') => void;
    initialPrompt: string;
    isGenerating: boolean;
    defaultReference: string; // The character's current avatar
}

export const ImageGenModal: React.FC<ImageGenModalProps> = ({ 
    isOpen, onClose, onGenerate, initialPrompt, isGenerating, defaultReference
}) => {
    const [prompt, setPrompt] = useState(initialPrompt);
    const [referenceImage, setReferenceImage] = useState<string | null>(null);
    const [perspective, setPerspective] = useState<'third_person' | 'selfie'>('third_person');
    
    const [isValidating, setIsValidating] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [validationSuccess, setValidationSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setPrompt(initialPrompt);
        setReferenceImage(null);
        setValidationError(null);
        setValidationSuccess(false);
        setPerspective('third_person'); // Reset to default
    }, [initialPrompt, isOpen]);

    const handleFileProcess = async (file: File) => {
        if (!file.type.startsWith('image/')) return;
        
        setIsValidating(true);
        setValidationError(null);
        setValidationSuccess(false);
        setReferenceImage(null);

        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64 = e.target?.result as string;
            
            // VALIDATE FACE
            const hasFace = await validateFaceInImage(base64);
            
            if (hasFace) {
                setReferenceImage(base64);
                setValidationSuccess(true);
            } else {
                setValidationError("Tidak ada wajah terdeteksi. Sistem menolak gambar ini sebagai referensi.");
            }
            setIsValidating(false);
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) handleFileProcess(file);
    };

    if (!isOpen) return null;

    // Determine which image to show in preview (Custom or Default)
    const displayReference = referenceImage || defaultReference;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-lg bg-[#0d0d0f] border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <div className="flex items-center gap-2 text-white">
                        <Sparkles size={18} className="text-cyan-400" />
                        <h3 className="text-sm font-bold uppercase tracking-widest">Visualisasi Memori</h3>
                    </div>
                    <button onClick={onClose} disabled={isGenerating} className="text-zinc-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                    
                    {/* Reference Image Section */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            <ScanFace size={12} /> Referensi Wajah
                        </label>
                        
                        <div className="flex gap-4">
                            {/* Preview Box */}
                            <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-black">
                                <img src={displayReference} className="w-full h-full object-cover opacity-70" alt="Ref" />
                                {referenceImage && <div className="absolute inset-0 border-2 border-green-500 rounded-xl"></div>}
                            </div>

                            {/* Drop Zone */}
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                                className={`flex-1 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all gap-1 h-20
                                    ${validationError 
                                        ? 'border-red-500/50 bg-red-900/10' 
                                        : (validationSuccess ? 'border-green-500/50 bg-green-900/10' : 'border-zinc-700 hover:bg-white/5 hover:border-zinc-500')
                                    }
                                `}
                            >
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileProcess(e.target.files[0])} />
                                
                                {isValidating ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin text-cyan-400" />
                                        <span className="text-[9px] text-cyan-400 font-bold uppercase">Memindai Wajah...</span>
                                    </>
                                ) : validationError ? (
                                    <>
                                        <AlertCircle size={16} className="text-red-400" />
                                        <span className="text-[9px] text-red-400 font-bold uppercase text-center px-2">Wajah Tidak Valid</span>
                                    </>
                                ) : validationSuccess ? (
                                    <>
                                        <CheckCircle size={16} className="text-green-400" />
                                        <span className="text-[9px] text-green-400 font-bold uppercase">Wajah Terverifikasi</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={16} className="text-zinc-500" />
                                        <span className="text-[9px] text-zinc-500 font-bold uppercase">Upload / Drop Foto Wajah</span>
                                    </>
                                )}
                            </div>
                        </div>
                        {validationError && <p className="text-[9px] text-red-400 mt-1">{validationError}</p>}
                        <p className="text-[9px] text-zinc-600 italic">
                            *Gambar referensi hanya digunakan untuk mendeteksi fitur wajah.
                        </p>
                    </div>

                    {/* Camera Perspective Toggle */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            <Camera size={12} /> Perspektif Kamera
                        </label>
                        <div className="flex bg-zinc-900/50 p-1 rounded-xl border border-white/5">
                            <button 
                                onClick={() => setPerspective('third_person')}
                                className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg flex items-center justify-center gap-2 transition-all
                                    ${perspective === 'third_person' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}
                                `}
                            >
                                <User size={12} /> Normal View
                            </button>
                            <button 
                                onClick={() => setPerspective('selfie')}
                                className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg flex items-center justify-center gap-2 transition-all
                                    ${perspective === 'selfie' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}
                                `}
                            >
                                <Camera size={12} /> Selfie Mode
                            </button>
                        </div>
                    </div>

                    {/* Prompt Section */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Deskripsi Adegan</label>
                        <textarea 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full h-28 bg-black/40 border border-zinc-800 rounded-xl p-4 text-xs text-zinc-200 focus:border-cyan-500/50 outline-none resize-none leading-relaxed font-mono custom-scrollbar"
                            placeholder="Deskripsikan apa yang terjadi..."
                            disabled={isGenerating}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-white/5 bg-zinc-900/50 flex justify-end gap-3 shrink-0">
                    <button 
                        onClick={onClose}
                        disabled={isGenerating}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={() => onGenerate(prompt, referenceImage || undefined, perspective)}
                        disabled={isGenerating || !prompt.trim() || isValidating}
                        className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-cyan-900/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} fill="currentColor" />}
                        {isGenerating ? "Melukis..." : "Generate"}
                    </button>
                </div>

                {/* Loading Overlay */}
                {isGenerating && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                        <div className="w-16 h-16 relative mb-4">
                            <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-t-cyan-500 rounded-full animate-spin"></div>
                        </div>
                        <p className="text-xs font-bold text-cyan-400 animate-pulse uppercase tracking-widest">Memproses Visual...</p>
                    </div>
                )}
            </div>
        </div>
    );
};
