
import React, { useRef } from 'react';
import { ChevronLeft, Image, Wallpaper, Smartphone, MessageSquare, Upload } from 'lucide-react';

interface SettingsAppProps {
    onNavigate: (view: string) => void;
    onUpdateWallpaper: (type: 'chat' | 'phone', base64: string) => void;
}

export const SettingsApp: React.FC<SettingsAppProps> = ({ onNavigate, onUpdateWallpaper }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const activeType = useRef<'chat' | 'phone'>('phone');

    const handleFileSelect = (type: 'chat' | 'phone') => {
        activeType.current = type;
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    onUpdateWallpaper(activeType.current, event.target.result as string);
                    alert(`${activeType.current === 'chat' ? 'Chat' : 'Home'} wallpaper updated!`);
                }
            };
            reader.readAsDataURL(file);
        }
        e.target.value = ''; // Reset
    };

    return (
        <div className="h-full flex flex-col bg-zinc-50 animate-fade-in relative z-10">
            {/* Header */}
            <div className="bg-zinc-900 p-4 pb-6 pt-6 rounded-b-3xl shadow-lg sticky top-0 z-20">
                <div className="flex items-center gap-3 text-white">
                    <button onClick={() => onNavigate('home')} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <span className="font-bold text-lg">Settings</span>
                </div>
                <h2 className="text-2xl font-black text-zinc-200 mt-4 px-1">Personalization</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

                {/* Smartphone Wallpaper Option */}
                <div 
                    onClick={() => handleFileSelect('phone')}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-200 flex items-center gap-4 active:scale-95 transition-transform cursor-pointer"
                >
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600">
                        <Smartphone size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-zinc-800 text-sm">Smartphone Wallpaper</h3>
                        <p className="text-[10px] text-zinc-500">Change home screen background (HD)</p>
                    </div>
                    <div className="bg-zinc-100 p-2 rounded-full text-zinc-400">
                        <Upload size={16} />
                    </div>
                </div>

                {/* Chat Wallpaper Option */}
                <div 
                    onClick={() => handleFileSelect('chat')}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-200 flex items-center gap-4 active:scale-95 transition-transform cursor-pointer"
                >
                    <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center text-violet-600">
                        <MessageSquare size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-zinc-800 text-sm">Chat Wallpaper</h3>
                        <p className="text-[10px] text-zinc-500">Change main chat background (Blurred)</p>
                    </div>
                    <div className="bg-zinc-100 p-2 rounded-full text-zinc-400">
                        <Upload size={16} />
                    </div>
                </div>

                <div className="px-4 py-2 bg-blue-50 rounded-xl border border-blue-100 mt-4">
                    <p className="text-[10px] text-blue-600 leading-relaxed">
                        <strong>Note:</strong> <br/>
                        - Smartphone wallpaper will be applied in HD.<br/>
                        - Chat wallpaper will automatically have an 80% blur effect applied for readability.
                    </p>
                </div>
            </div>
        </div>
    );
};
