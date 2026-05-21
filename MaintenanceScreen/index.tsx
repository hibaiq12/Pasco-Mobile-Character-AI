
import React, { useState, Suspense, lazy } from 'react';
import { getSettings } from '../services/storageService';
import { Loader2 } from 'lucide-react';

// --- LAZY LOAD SUB-SCREENS ---
// Menggunakan lazy load untuk memastikan hanya kode untuk mode yang aktif yang didownload browser.
// Menggunakan .then() untuk menangani Named Exports.

const MaintenanceUI = lazy(() => import('./Maintenance/UI').then(module => ({ default: module.MaintenanceUI })));
const UpdateUI = lazy(() => import('./Update/UI').then(module => ({ default: module.UpdateUI })));
const CountdownUI = lazy(() => import('./CountdownScreen/UI').then(module => ({ default: module.CountdownUI })));

interface MaintenanceScreenProps {
    onUnlock: () => void;
    onNavigateToPreview: () => void;
}

// Loading State khusus untuk transisi antar modul lock screen
const LoadingFallback = () => (
    <div className="h-screen w-full bg-zinc-950 flex flex-col items-center justify-center gap-4 select-none">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest animate-pulse">
            INITIALIZING SECURE MODULE...
        </span>
    </div>
);

const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({ onUnlock, onNavigateToPreview }) => {
    const settings = getSettings();
    
    // Determine mode based on priority: Update > Countdown > Maintenance
    const [mode] = useState<'maintenance' | 'update' | 'countdown'>(() => {
        if (settings.devForceUpdate) return 'update';
        if (settings.devForceCountdown) return 'countdown';
        return 'maintenance';
    });

    return (
        <Suspense fallback={<LoadingFallback />}>
            {mode === 'update' && <UpdateUI onComplete={onUnlock} />}
            {mode === 'countdown' && <CountdownUI onUnlock={onUnlock} />}
            {mode === 'maintenance' && <MaintenanceUI onUnlock={onUnlock} onNavigateToPreview={onNavigateToPreview} />}
        </Suspense>
    );
};

export default MaintenanceScreen;
