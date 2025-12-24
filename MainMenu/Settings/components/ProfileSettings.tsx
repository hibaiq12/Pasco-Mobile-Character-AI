
import React from 'react';
import { AppSettings } from '../../../types';
import { t } from '../../../services/translationService';

interface ProfileSettingsProps {
    settings: AppSettings;
    setSettings: (s: AppSettings) => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ settings, setSettings }) => {
    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h2 className="text-2xl font-semibold text-white mb-2">{t('set.user.title')}</h2>
                <p className="text-zinc-500 text-sm">{t('set.user.desc')}</p>
            </div>

            <div className="space-y-6">
                <div className="group">
                    <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2 group-focus-within:text-violet-400 transition-colors">{t('set.user.name')}</label>
                    <input 
                        type="text" 
                        value={settings.userName}
                        onChange={(e) => setSettings({...settings, userName: e.target.value})}
                        className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-5 py-4 text-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 outline-none transition-all text-lg placeholder-zinc-700"
                        placeholder="Enter your name..."
                    />
                </div>

                <div className="p-6 bg-zinc-950/30 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
                    <div>
                        <h3 className="font-medium text-zinc-200 mb-1">{t('set.user.haptic')}</h3>
                        <p className="text-xs text-zinc-500">Vibrate device on interaction (Mobile)</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={settings.enableHaptic}
                            onChange={(e) => setSettings({...settings, enableHaptic: e.target.checked})}
                            className="sr-only peer"
                        />
                        <div className="w-14 h-8 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-violet-600 shadow-inner"></div>
                    </label>
                </div>
            </div>
        </div>
    );
};
