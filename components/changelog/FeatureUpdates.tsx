
import React from 'react';
import { Smartphone, Layout, CreditCard, CloudSun, Sparkles } from 'lucide-react';
import { t } from '../../services/translationService';

export const FeatureUpdates: React.FC = () => {
    return (
        <div className="bg-gradient-to-r from-zinc-900 to-black p-5 rounded-xl border border-white/5 relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 text-white/5">
                <Smartphone size={100} />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <Layout size={14} className="text-blue-400"/>
                {t('changelog.visual')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-violet-500/10 text-violet-400 rounded-lg shrink-0"><Smartphone size={16}/></div>
                    <div>
                        <h4 className="text-xs font-bold text-zinc-200">OS Animations</h4>
                        <p className="text-[10px] text-zinc-500">Animasi slide dan transisi aplikasi yang mulus dan responsif.</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0"><CreditCard size={16}/></div>
                    <div>
                        <h4 className="text-xs font-bold text-zinc-200">Functional Economy</h4>
                        <p className="text-[10px] text-zinc-500">Saldo wallet berkurang saat belanja. Gaji kerja otomatis masuk.</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg shrink-0"><CloudSun size={16}/></div>
                    <div>
                        <h4 className="text-xs font-bold text-zinc-200">Atmosphere System</h4>
                        <p className="text-[10px] text-zinc-500">Cuaca dan waktu dinamis yang terbaca oleh karakter AI.</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-pink-500/10 text-pink-400 rounded-lg shrink-0"><Sparkles size={16}/></div>
                    <div>
                        <h4 className="text-xs font-bold text-zinc-200">Glassmorphism UI</h4>
                        <p className="text-[10px] text-zinc-500">Tampilan modern dengan transparansi dan blur yang lebih dalam.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
