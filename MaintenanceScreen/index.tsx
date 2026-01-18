import React, { useState } from 'react';
import { MaintenanceUI } from './Maintenance/UI';
import { UpdateUI } from './Update/UI';
import { CountdownUI } from './CountdownScreen/UI';
import { getSettings } from '../services/storageService';

interface MaintenanceScreenProps {
    onUnlock: () => void;
}

const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({ onUnlock }) => {
    const settings = getSettings();
    
    // Determine mode based on priority: Update > Countdown > Maintenance
    const [mode] = useState<'maintenance' | 'update' | 'countdown'>(() => {
        if (settings.devForceUpdate) return 'update';
        if (settings.devForceCountdown) return 'countdown';
        return 'maintenance';
    });

    if (mode === 'update') {
        return <UpdateUI onComplete={onUnlock} />;
    }

    if (mode === 'countdown') {
        return <CountdownUI onUnlock={onUnlock} />;
    }

    return <MaintenanceUI onUnlock={onUnlock} />;
};

export default MaintenanceScreen;