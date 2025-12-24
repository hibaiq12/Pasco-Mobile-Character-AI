
import React from 'react';
import { Briefcase, Smartphone as SmartphoneIcon, Clock, FastForward } from 'lucide-react';

interface WorkingOverlayProps {
    formattedTime: string;
    onOpenPhone: () => void;
    onOpenContext: () => void;
    onSkipWork: () => void;
}

export const WorkingOverlay: React.FC<WorkingOverlayProps> = ({
    formattedTime, onOpenPhone, onOpenContext, onSkipWork
}) => {
    return (
        <div className="absolute top-16 left-0 right-0 bottom-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-center animate-fade-in p-6 border-t border-white/5">
            <Briefcase size={48} className="text-blue-500 mb-4 animate-bounce" />
            <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-1">Sedang Bekerja</h2>
            <div className="text-4xl font-mono text-blue-400 mb-6">{formattedTime}</div>
            
            <p className="text-sm text-zinc-400 max-w-md mb-8">
                Anda sedang dalam jam kerja. Chat interface dinonaktifkan sementara. Anda dapat menggunakan smartphone atau melewati waktu.
            </p>

            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                <button onClick={onOpenPhone} className="p-4 bg-zinc-900 border border-white/10 rounded-xl hover:bg-zinc-800 transition-colors flex flex-col items-center gap-2">
                    <SmartphoneIcon size={24} className="text-zinc-400"/>
                    <span className="text-xs font-bold text-white uppercase">Buka HP</span>
                </button>
                <button onClick={onOpenContext} className="p-4 bg-zinc-900 border border-white/10 rounded-xl hover:bg-zinc-800 transition-colors flex flex-col items-center gap-2">
                    <Clock size={24} className="text-zinc-400"/>
                    <span className="text-xs font-bold text-white uppercase">Context</span>
                </button>
            </div>

            <button 
                onClick={onSkipWork}
                className="mt-8 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold uppercase tracking-widest shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all active:scale-95"
            >
                <FastForward size={18} fill="currentColor" /> Selesaikan Shift (Skip)
            </button>
        </div>
    );
};
