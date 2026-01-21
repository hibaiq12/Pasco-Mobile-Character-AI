
import React from 'react';
import { AppSettings } from '../../../types';
import { t } from '../../../services/translationService';

interface ProfileSettingsProps {
    settings: AppSettings;
    setSettings: (s: AppSettings) => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ settings, setSettings }) => {
    return (
        <div className="animate-fade-in">
            {/* Main Profile Card Wrapper */}
            <div className="bg-zinc-900/80 border border-white/5 rounded-3xl p-8 shadow-xl backdrop-blur-sm relative overflow-hidden">
                
                {/* Subtle Glow Effect */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-500/10 rounded-full blur-[60px] pointer-events-none"></div>

                <div className="relative z-10">
                    <h2 className="text-2xl font-bold text-white mb-2">{t('set.user.title')}</h2>
                    <p className="text-zinc-500 text-sm mb-8 font-medium">{t('set.user.desc')}</p>

                    <div className="space-y-8">
                        {/* Designation Input */}
                        <div className="group">
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-violet-400 transition-colors">
                                {t('set.user.name')}
                            </label>
                            <input 
                                type="text" 
                                value={settings.userName}
                                onChange={(e) => setSettings({...settings, userName: e.target.value})}
                                className="w-full bg-black/40 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:ring-1 focus:ring-violet-500/30 focus:border-violet-500/50 outline-none transition-all text-lg font-bold placeholder-zinc-700 shadow-inner"
                                placeholder="Traveler"
                            />
                        </div>

                        {/* Haptic Toggle */}
                        <div className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors -mx-4">
                            <div>
                                <h3 className="font-bold text-zinc-200 text-sm">{t('set.user.haptic')}</h3>
                                <p className="text-xs text-zinc-500 mt-0.5">Vibrate device on interaction (Mobile)</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={settings.enableHaptic}
                                    onChange={(e) => setSettings({...settings, enableHaptic: e.target.checked})}
                                    className="sr-only peer"
                                />
                                <div className="w-14 h-8 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-violet-600 shadow-inner transition-colors duration-300"></div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
