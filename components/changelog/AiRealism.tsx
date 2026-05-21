
import React from 'react';
import { Brain, Activity, Zap, Network } from 'lucide-react';
import { t } from '../../services/translationService';

export const AiRealism: React.FC = () => {
    return (
        <div className="bg-zinc-900/30 p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
            {/* Animated Data Stream Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(167,139,250,0.03),rgba(167,139,250,0.01),rgba(0,0,255,0.03))] z-0 bg-[length:100%_4px,20px_100%] animate-scan opacity-50 pointer-events-none"></div>

            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-5 flex items-center gap-2 relative z-10">
                <Brain size={16} className="text-purple-400 animate-pulse"/>
                {t('changelog.ai')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5 flex gap-4 hover:border-purple-500/30 transition-colors">
                    <Activity size={20} className="text-zinc-500 mt-1 shrink-0" />
                    <div>
                        <strong className="text-xs text-purple-200 block mb-1">Deep Context Retention</strong>
                        <p className="text-[10px] text-zinc-400 leading-relaxed">Karakter mengingat lokasi, cuaca, saldo, dan interaksi HP Anda dalam percakapan jangka panjang.</p>
                    </div>
                </div>
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5 flex gap-4 hover:border-purple-500/30 transition-colors">
                    <Zap size={20} className="text-zinc-500 mt-1 shrink-0" />
                    <div>
                        <strong className="text-xs text-purple-200 block mb-1">Physical Presence</strong>
                        <p className="text-[10px] text-zinc-400 leading-relaxed">AI menyadari batasan fisik (jarak). Mereka akan menggunakan SMS jika lokasi Anda berbeda.</p>
                    </div>
                </div>
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5 flex gap-4 hover:border-purple-500/30 transition-colors md:col-span-2">
                    <Network size={20} className="text-zinc-500 mt-1 shrink-0" />
                    <div>
                        <strong className="text-xs text-purple-200 block mb-1">Neural Chain Reaction</strong>
                        <p className="text-[10px] text-zinc-400 leading-relaxed">Keputusan moral Anda mempengaruhi tidak hanya satu karakter, tetapi seluruh ekosistem sosial mereka (teman, orang tua, musuh).</p>
                    </div>
                </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/5 text-center relative z-10">
                <p className="text-xs text-zinc-500 font-mono tracking-widest">{t('changelog.welcome')}</p>
            </div>
        </div>
    );
};
