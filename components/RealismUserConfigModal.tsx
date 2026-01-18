
import React, { useState, useEffect } from 'react';
import { User, Calendar, Lock, Hash, ArrowRight, Heart, Smile, Coffee, Map, BookOpen, Sword, Clapperboard, Ghost, AlertOctagon, Zap, Star, Flower, Sparkles } from 'lucide-react';
import { StoryConfiguration } from '../types';

interface RealismUserConfigModalProps {
    onStart: (config: StoryConfiguration) => void;
    onCancel: () => void;
}

const GENRES = [
    { id: 'Romance', label: 'Romance', icon: <Heart size={14}/>, color: 'text-pink-500 bg-pink-50 border-pink-200' },
    { id: 'Comedy', label: 'Comedy', icon: <Smile size={14}/>, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
    { id: 'Slice of Life', label: 'Slice Of Life', icon: <Coffee size={14}/>, color: 'text-green-600 bg-green-50 border-green-200' },
    { id: 'Adventure', label: 'Adventure', icon: <Map size={14}/>, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { id: 'School Life', label: 'School Life', icon: <BookOpen size={14}/>, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
    { id: 'Action', label: 'Action', icon: <Sword size={14}/>, color: 'text-red-600 bg-red-50 border-red-200' },
    { id: 'Drama', label: 'Drama', icon: <Clapperboard size={14}/>, color: 'text-purple-600 bg-purple-50 border-purple-200' },
    { id: 'Horror', label: 'Horror', icon: <Ghost size={14}/>, color: 'text-zinc-600 bg-zinc-100 border-zinc-300' },
    { id: 'Trauma', label: 'Trauma', icon: <AlertOctagon size={14}/>, color: 'text-rose-700 bg-rose-50 border-rose-200' },
    { id: 'Shounen', label: 'Shounen', icon: <Zap size={14}/>, color: 'text-orange-600 bg-orange-50 border-orange-200' },
    { id: 'Shoujo', label: 'Shoujo', icon: <Star size={14}/>, color: 'text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200' },
];

export const RealismUserConfigModal: React.FC<RealismUserConfigModalProps> = ({ onStart, onCancel }) => {
    const [name, setName] = useState('');
    const [birthDate, setBirthDate] = useState('2008-03-12');
    const [age, setAge] = useState<string>('16');
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isClosing, setIsClosing] = useState(false);

    // Validate Age Effect
    useEffect(() => {
        if (birthDate) {
            const birth = new Date(birthDate);
            const scenarioYear = 2024; 
            let calculatedAge = scenarioYear - birth.getFullYear();
            const m = 3 - (birth.getMonth() + 1);
            if (m < 0 || (m === 0 && 15 < birth.getDate())) {
                calculatedAge--;
            }
            
            setAge(calculatedAge.toString());

            // Hiyori Rule: 16-17 only
            if (calculatedAge < 16 || calculatedAge > 17) {
                setError("Sinkronisasi Skenario Gagal: Usia harus 16-17 tahun.");
            } else {
                setError(null);
            }
        }
    }, [birthDate]);

    const toggleGenre = (id: string) => {
        if (error === "Pilih setidaknya satu genre cerita.") setError(null);
        if (selectedGenres.includes(id)) {
            setSelectedGenres(prev => prev.filter(g => g !== id));
        } else {
            setSelectedGenres(prev => [...prev, id]);
        }
    };

    const handleStart = () => {
        // 1. Validate Name
        if (!name.trim()) {
            setError("Nama panggilan diperlukan.");
            return;
        }

        // 2. Validate Age (Double check)
        const birth = new Date(birthDate);
        const scenarioYear = 2024; 
        let calculatedAge = scenarioYear - birth.getFullYear();
        const m = 3 - (birth.getMonth() + 1);
        if (m < 0 || (m === 0 && 15 < birth.getDate())) {
            calculatedAge--;
        }
        if (calculatedAge < 16 || calculatedAge > 17) {
            setError("Sinkronisasi Skenario Gagal: Usia harus 16-17 tahun.");
            return;
        }

        // 3. Validate Genre
        if (selectedGenres.length === 0) {
            setError("Pilih setidaknya satu genre cerita.");
            return;
        }

        setError(null);
        setIsClosing(true);
        setTimeout(() => {
            onStart({
                userName: name,
                userAge: calculatedAge.toString(),
                userBirthday: birthDate,
                userGender: 'Laki-Laki',
                genres: selectedGenres
            });
        }, 300);
    };

    const handleCancel = () => {
        setIsClosing(true);
        setTimeout(onCancel, 300);
    };

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100 animate-fade-in-slow'}`}>
            {/* Backdrop Blur */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-xl transition-opacity" />
            
            <div className={`w-full max-w-2xl relative rounded-[3rem] overflow-hidden shadow-2xl border border-white/40 ring-1 ring-blue-100 flex flex-col max-h-[90vh] transition-transform duration-500 ${isClosing ? 'scale-95 translate-y-4' : 'scale-100 translate-y-0'}`}>
                
                {/* BACKGROUND GRADIENT & FLOWER DECORATION */}
                <div className="absolute inset-0 bg-gradient-to-b from-white via-[#eff6ff] to-[#dbeafe] z-0"></div>
                
                {/* Elegant Flower Watermarks */}
                <div className="absolute top-[-50px] right-[-50px] text-blue-100/50 pointer-events-none animate-[spin_60s_linear_infinite]">
                    <Flower size={300} strokeWidth={0.5} />
                </div>
                <div className="absolute bottom-[-20px] left-[-20px] text-blue-200/30 pointer-events-none rotate-45">
                    <Flower size={200} strokeWidth={0.5} />
                </div>
                
                {/* Header */}
                <div className="relative z-10 px-10 pt-10 pb-2 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 border border-blue-100 backdrop-blur-md mb-4 shadow-sm">
                        <Sparkles size={12} className="text-blue-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Prolog Cerita</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2 font-serif">Identitas Protagonis</h2>
                    <p className="text-slate-500 text-sm font-medium">Siapakah dirimu dalam kisah ini?</p>
                </div>

                <div className="relative z-10 p-10 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                    
                    {/* SECTION 1: PERSONAL DATA */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name Input */}
                        <div className="space-y-2 group">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2 group-focus-within:text-blue-500 transition-colors">
                                <User size={12} /> Nama Panggilan
                            </label>
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    if (error === "Nama panggilan diperlukan.") setError(null);
                                }}
                                placeholder="Masukkan nama..."
                                className="w-full bg-white/60 backdrop-blur-sm border border-white/60 rounded-2xl px-5 py-4 text-slate-700 font-bold focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-100/50 outline-none transition-all shadow-sm placeholder-slate-300 text-sm"
                            />
                        </div>

                        {/* Gender Locked */}
                        <div className="space-y-2 opacity-80">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Lock size={12} /> Jenis Kelamin
                            </label>
                            <div className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-500 font-bold flex justify-between items-center cursor-not-allowed shadow-inner">
                                <span className="text-sm">Laki-Laki</span>
                                <Lock size={14} className="text-slate-300" />
                            </div>
                        </div>

                        {/* Birthday */}
                        <div className="space-y-2 group">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2 group-focus-within:text-blue-500 transition-colors">
                                <Calendar size={12} /> Tanggal Lahir
                            </label>
                            <input 
                                type="date" 
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                                className={`w-full bg-white/60 backdrop-blur-sm border border-white/60 rounded-2xl px-5 py-4 text-slate-700 font-bold outline-none transition-all shadow-sm text-sm focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-100/50 ${error ? 'border-red-300 bg-red-50/50' : ''}`}
                            />
                        </div>

                        {/* Age Display */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Hash size={12} /> Usia (Skenario 2024)
                            </label>
                            <div className={`w-full border rounded-2xl px-5 py-4 font-bold flex justify-between items-center shadow-sm text-sm transition-colors ${error ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white/60 border-white/60 text-slate-700'}`}>
                                <span>{age} Tahun</span>
                                {error && <AlertOctagon size={16} className="animate-pulse" />}
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50/80 backdrop-blur-md text-red-600 text-xs font-bold rounded-2xl border border-red-100 flex items-center justify-center gap-2 animate-pulse shadow-sm">
                            <AlertOctagon size={16} /> {error}
                        </div>
                    )}

                    {/* SECTION 2: GENRE */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <BookOpen size={12} /> Tentukan Genre Cerita
                            </label>
                            <span className="text-[10px] font-bold text-blue-400 bg-blue-50 px-2 py-0.5 rounded-full">Multiselect</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2.5">
                            {GENRES.map(genre => {
                                const isSelected = selectedGenres.includes(genre.id);
                                return (
                                    <button
                                        key={genre.id}
                                        onClick={() => toggleGenre(genre.id)}
                                        className={`
                                            flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wide transition-all border duration-300
                                            ${isSelected 
                                                ? `${genre.color} shadow-lg shadow-blue-100 transform scale-105` 
                                                : 'bg-white/40 border-white/60 text-slate-500 hover:bg-white hover:border-blue-200 hover:text-blue-500 hover:shadow-md'}
                                        `}
                                    >
                                        {genre.icon} {genre.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer Action - Resized Button */}
                <div className="relative z-20 p-8 pt-0 bg-gradient-to-t from-[#dbeafe] to-transparent flex flex-col items-center gap-4">
                    <button 
                        onClick={handleStart}
                        className="w-[90%] md:w-auto md:min-w-[320px] py-4 rounded-2xl bg-gradient-to-r from-white to-[#3b82f6] text-[#1e3a8a] font-black text-sm uppercase tracking-widest shadow-[0_10px_40px_-10px_rgba(59,130,246,0.4)] hover:shadow-[0_20px_50px_-10px_rgba(59,130,246,0.6)] transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-between px-6 group border border-white/50 relative overflow-hidden"
                    >
                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shine pointer-events-none"></div>
                        
                        <span className="relative z-10 drop-shadow-sm mx-auto pl-2">Bukankah Ini My Kisah?</span>
                        <div className="bg-[#1e3a8a] text-white p-2 rounded-full group-hover:bg-white group-hover:text-blue-600 transition-colors shadow-md relative z-10 -mr-2">
                            <ArrowRight size={16} />
                        </div>
                    </button>
                    
                    <button 
                        onClick={handleCancel} 
                        className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 py-2 transition-colors"
                    >
                        Batalkan Konfigurasi
                    </button>
                </div>
            </div>
        </div>
    );
};
