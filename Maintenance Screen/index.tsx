
import React, { useState } from 'react';
import { MaintenanceUI } from './Maintenance/UI';
import { UpdateUI } from './Update/UI';

// --- CONFIG ---
// Ubah ini ke true jika ingin mensimulasikan screen update saat booting
const TRIGGER_UPDATE = false;

interface MaintenanceScreenProps {
    onUnlock: () => void;
}

const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({ onUnlock }) => {
    const [mode, setMode] = useState<'maintenance' | 'update'>(TRIGGER_UPDATE ? 'update' : 'maintenance');

    if (mode === 'update') {
        return <UpdateUI onComplete={() => setMode('maintenance')} />;
    }

    return <MaintenanceUI onUnlock={onUnlock} />;
};

export default MaintenanceScreen;
