import React from 'react';
import { AppSettings } from '../../../../types';
import { t } from '../../../../services/translationService';
import { PerformanceSettings } from './PerformanceSettings';
import { CursorSettings } from './CursorSettings';
import { FullscreenSettings } from './FullscreenSettings';

interface AppearanceSettingsProps {
    settings: AppSettings;
    setSettings: (s: AppSettings) => void;
    onNavigateToPreview?: () => void;
}

export const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({ settings, setSettings, onNavigateToPreview }) => {
    return (
        <div className="space-y-8 animate-fade-in relative pb-10">
            <div>
                <h2 className="text-2xl font-black text-white mb-2 tracking-tight">{t('set.nav.appearance') || 'Tampilan'}</h2>
                <p className="text-zinc-500 text-sm font-medium">Customize UI elements, cursors, and performance options.</p>
            </div>
            
            <CursorSettings settings={settings} setSettings={setSettings} />
            <FullscreenSettings settings={settings} setSettings={setSettings} />
            <PerformanceSettings settings={settings} setSettings={setSettings} onNavigateToPreview={onNavigateToPreview} />
        </div>
    );
};
