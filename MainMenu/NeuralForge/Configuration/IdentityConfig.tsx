
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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
            <div className="md:col-span-4 flex flex-col items-center gap-3">
                <div 
                    className={`
                        relative w-32 h-32 md:w-full md:h-auto md:aspect-square rounded-full md:rounded-xl overflow-hidden border-2 
                        ${isDragOver ? 'border-violet-500 border-dashed bg-violet-500/10' : 'border-zinc-700 bg-black'} 
                        cursor-pointer group shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all
                    `}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {formData.avatar ? (
                        <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700 group-hover:text-zinc-500 transition-colors">
                            <Upload size={24} className="mb-1" />
                            <span className="text-[9px] uppercase font-bold text-center px-4">
                                {isDragOver ? t('forge.drop_active') : t('forge.drop_idle')}
                            </span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3 pointer-events-none">
                         <span className="text-[10px] font-bold text-white">{t('forge.change_avatar')}</span>
                    </div>
                </div>
                
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                
                <button onClick={handleAutoAnalyze} className="w-full py-2 text-[9px] font-bold uppercase tracking-widest border border-zinc-700 rounded-lg hover:bg-zinc-800 hover:border-zinc-600 hover:text-white text-zinc-400 transition-all flex items-center justify-center gap-1.5 active:scale-95">
                    <ScanFace size={12} />
                    {t('forge.analyze')}
                </button>
            </div>

            <div className="md:col-span-8 space-y-4">
                <InputField labelKey="forge.label.name" value={formData.name || ''} onChange={(v) => setFormData({...formData, name: v})} placeholderKey="forge.ph.name" tooltipKey="forge.tip.name" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField labelKey="forge.label.role" value={formData.role || ''} onChange={(v) => setFormData({...formData, role: v})} tooltipKey="forge.tip.role" />
                    <InputField labelKey="forge.label.species" value={formData.species || ''} onChange={(v) => setFormData({...formData, species: v})} tooltipKey="forge.tip.species" />
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
