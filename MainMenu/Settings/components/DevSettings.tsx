
import React from 'react';
import { AppSettings } from '../../../types';
import { t } from '../../../services/translationService';
import { Terminal } from 'lucide-react';

interface DevSettingsProps {
    settings: AppSettings;
    setSettings: (s: AppSettings) => void;
}

export const DevSettings: React.FC<DevSettingsProps> = ({ settings, setSettings }) => {
    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h2 className="text-2xl font-semibold text-white mb-2">{t('set.dev.title')}</h2>
                <p className="text-zinc-500 text-sm">{t('set.dev.desc')}</p>
            </div>

            <div className="p-6 bg-zinc-950/30 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
                <div className="max-w-[70%]">
                    <h3 className="font-medium text-zinc-200 mb-1 flex items-center gap-2">
                        <Terminal size={16} className="text-amber-500" />
                        {t('set.dev.preview')}
                    </h3>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                        Disables the AI Neural Engine connection. Chat responses will be generated algorithmically to save tokens and debug the UI.
                    </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={settings.enablePreviewMode}
                        onChange={(e) => setSettings({...settings, enablePreviewMode: e.target.checked})}
                        className="sr-only peer"
                    />
                    <div className="w-14 h-8 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-amber-600 shadow-inner"></div>
                </label>
            </div>
        </div>
    );
};
