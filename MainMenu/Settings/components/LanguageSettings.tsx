
import React from 'react';
import { AppSettings } from '../../../types';
import { t } from '../../../services/translationService';
import { Globe, MessageCircle, CheckCircle } from 'lucide-react';

interface LanguageSettingsProps {
    settings: AppSettings;
    setSettings: (s: AppSettings) => void;
}

const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'id', name: 'Bahasa Indonesia' },
    { code: 'jp', name: '日本語 (Japanese)' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
];

export const LanguageSettings: React.FC<LanguageSettingsProps> = ({ settings, setSettings }) => {
    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h2 className="text-2xl font-semibold text-white mb-2">{t('set.lang.title')}</h2>
                <p className="text-zinc-500 text-sm">{t('set.lang.desc')}</p>
            </div>

            <div className="bg-zinc-950/30 rounded-2xl border border-white/5 p-8 relative overflow-hidden group">
                 <div className="absolute top-0 left-0 w-1 h-full bg-white/20"></div>
                 <div className="flex items-start gap-4 mb-6">
                     <div className="p-3 bg-zinc-900/50 rounded-xl text-zinc-300">
                         <Globe size={20} />
                     </div>
                     <div>
                         <h3 className="font-bold text-zinc-200">{t('set.lang.app')}</h3>
                         <p className="text-xs text-zinc-500 max-w-sm mt-1">
                             {t('set.lang.app_desc')}
                         </p>
                     </div>
                 </div>
                 
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {LANGUAGES.map(lang => (
                        <button
                            key={`app-${lang.code}`}
                            onClick={() => setSettings({...settings, appLanguage: lang.code})}
                            className={`
                                px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left flex items-center justify-between
                                ${settings.appLanguage === lang.code 
                                    ? 'bg-white text-black border-white shadow-lg shadow-white/10' 
                                    : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'}
                            `}
                        >
                            {lang.name}
                            {settings.appLanguage === lang.code && <CheckCircle size={14} className="text-black" />}
                        </button>
                    ))}
                 </div>
            </div>

            <div className="bg-zinc-950/30 rounded-2xl border border-red-500/20 p-8 relative overflow-hidden group">
                 <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                 <div className="flex items-start gap-4 mb-6">
                     <div className="p-3 bg-zinc-900/50 rounded-xl text-red-400">
                         <MessageCircle size={20} />
                     </div>
                     <div>
                         <h3 className="font-bold text-red-100">{t('set.lang.chat')}</h3>
                         <p className="text-xs text-zinc-500 max-w-sm mt-1">
                             {t('set.lang.chat_desc')}
                         </p>
                     </div>
                 </div>
                 
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {LANGUAGES.map(lang => (
                        <button
                            key={`chat-${lang.code}`}
                            onClick={() => setSettings({...settings, chatLanguage: lang.code})}
                            className={`
                                px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left flex items-center justify-between
                                ${settings.chatLanguage === lang.code 
                                    ? 'bg-red-500/20 text-red-200 border-red-500 shadow-lg shadow-red-900/20' 
                                    : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:border-red-500/50 hover:text-white'}
                            `}
                        >
                            {lang.name}
                            {settings.chatLanguage === lang.code && <CheckCircle size={14} className="text-red-400" />}
                        </button>
                    ))}
                 </div>
            </div>
        </div>
    );
};
