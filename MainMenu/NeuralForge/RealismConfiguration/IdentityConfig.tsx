
import React from 'react';
import { Character } from '../../../../types';
import { InputField } from './SharedComponents';
import { Upload, ScanFace } from 'lucide-react';
import { t } from '../../../../services/translationService';

interface IdentityConfigProps {
    formData: Partial<Character>;
    setFormData: (data: Partial<Character>) => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isDragOver: boolean;
    handleDragOver: (e: React.DragEvent) => void;
    handleDragLeave: (e: React.DragEvent) => void;
    handleDrop: (e: React.DragEvent) => void;
    handleAutoAnalyze: () => void;
}

export const IdentityConfig: React.FC<IdentityConfigProps> = ({ 
    formData, setFormData, fileInputRef, handleImageUpload, 
    isDragOver, handleDragOver, handleDragLeave, handleDrop, handleAutoAnalyze 
}) => {
    
    const handleBirthdayChange = (val: string) => {
        let newAge = formData.age;
        const parts = val.split(':');
        if (parts.length === 3) {
            const d = parseInt(parts[0]);
            const m = parseInt(parts[1]);
            const y = parseInt(parts[2]);
            if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
                 const birthDate = new Date(y, m - 1, d);
                 const today = new Date();
                 let age = today.getFullYear() - birthDate.getFullYear();
                 const mDiff = today.getMonth() - birthDate.getMonth();
                 if (mDiff < 0 || (mDiff === 0 && today.getDate() < birthDate.getDate())) {
                     age--;
                 }
                 if (age >= 0) newAge = age.toString();
            }
        }
        setFormData({ ...formData, birthday: val, age: newAge });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 animate-fade-in">
            {/* AVATAR SECTION */}
            <div className="md:col-span-4 flex flex-col items-center gap-4">
                <div 
                    className={`
                        relative w-32 h-32 md:w-full md:h-auto md:aspect-square rounded-2xl overflow-hidden border-2 
                        ${isDragOver ? 'border-blue-500 border-dashed bg-blue-500/10' : 'border-zinc-800 bg-zinc-950'} 
                        cursor-pointer group shadow-lg transition-all hover:border-blue-500/50
                    `}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {formData.avatar ? (
                        <>
                            <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                        </>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 group-hover:text-blue-400 transition-colors">
                            <Upload size={24} className="mb-2" />
                            <span className="text-[9px] uppercase font-bold text-center px-4 font-sans tracking-widest">
                                {isDragOver ? t('forge.drop_active') : "UPLOAD PORTRAIT"}
                            </span>
                        </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none backdrop-blur-[1px]">
                         <span className="text-[10px] font-bold text-white uppercase tracking-widest px-3 py-1 rounded bg-black/40 font-sans">
                             {t('forge.change_avatar')}
                         </span>
                    </div>
                </div>
                
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                
                <button onClick={handleAutoAnalyze} className="w-full py-2.5 text-[9px] font-bold uppercase tracking-[0.2em] border border-zinc-800 rounded-xl hover:bg-zinc-900 hover:border-blue-500/30 hover:text-blue-400 text-zinc-500 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm font-sans">
                    <ScanFace size={14} />
                    {t('forge.analyze')}
                </button>
            </div>

            {/* FORM SECTION */}
            <div className="md:col-span-8 space-y-5">
                <div className="bg-zinc-900/30 p-5 border border-white/5 rounded-2xl shadow-inner relative overflow-hidden">
                    <div className="relative z-10 space-y-4">
                        <InputField labelKey="forge.label.name" value={formData.name || ''} onChange={(v) => setFormData({...formData, name: v})} placeholderKey="forge.ph.name" tooltipKey="forge.tip.name" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField labelKey="forge.label.role" value={formData.role || ''} onChange={(v) => setFormData({...formData, role: v})} tooltipKey="forge.tip.role" />
                            <InputField labelKey="forge.label.species" value={formData.species || ''} onChange={(v) => setFormData({...formData, species: v})} tooltipKey="forge.tip.species" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <InputField labelKey="forge.label.age" value={formData.age || ''} onChange={(v) => setFormData({...formData, age: v})} tooltipKey="forge.tip.age" className="col-span-1"/>
                    <InputField labelKey="forge.label.gender" value={formData.gender || ''} onChange={(v) => setFormData({...formData, gender: v})} tooltipKey="forge.tip.gender" className="col-span-1"/>
                    <InputField labelKey="forge.label.origin" value={formData.originWorld || ''} onChange={(v) => setFormData({...formData, originWorld: v})} tooltipKey="forge.tip.origin" className="col-span-2 md:col-span-1" />
                </div>
                <InputField labelKey="forge.label.birthday" value={formData.birthday || ''} onChange={handleBirthdayChange} placeholderKey="forge.ph.birthday" tooltipKey="forge.tip.birthday" />
            </div>
        </div>
    );
};
