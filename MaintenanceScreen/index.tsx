
import React, { useState, useEffect } from 'react';
import { MaintenanceUI } from './Maintenance/UI';
import { UpdateUI } from './Update/UI';
import { CountdownUI } from './CountdownScreen/UI';

// --- CONFIG ---
// Ubah ke true untuk melihat layar System Update baru
const TRIGGER_UPDATE = false;
// Ubah ke true untuk mengaktifkan Realtime Countdown (06:00 - 10:35)
const TRIGGER_COUNTDOWN = false; 

interface MaintenanceScreenProps {
    onUnlock: () => void;
}

const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({ onUnlock }) => {
    // Determine initial mode based on priority: Update > Countdown > Maintenance
    const [mode, setMode] = useState<'maintenance' | 'update' | 'countdown'>(() => {
        if (TRIGGER_UPDATE) return 'update';
        if (TRIGGER_COUNTDOWN) return 'countdown';
        return 'maintenance';
    });

    /**
     * Layar Update sekarang memiliki PIN sendiri di dalamnya (sesuai instruksi),
     * jadi kita memanggil onUnlock langsung jika verifikasi di UpdateUI berhasil.
     */
    if (mode === 'update') {
        return <UpdateUI onComplete={onUnlock} />;
    }

    if (mode === 'countdown') {
        return <CountdownUI onUnlock={onUnlock} />;
    }

    return <MaintenanceUI onUnlock={onUnlock} />;
};

export default MaintenanceScreen;
