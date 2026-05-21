
import { NeuralProfile } from "../components/ChatInterface/NeuroSense/ProfileEngine";

export interface NeuroSnapshot {
    timestamp: number;
    profile: NeuralProfile;
    characterId: string;
}

const NEURO_STORAGE_KEY = 'pasco_neuro_snapshots';

export const saveNeuroSnapshot = (characterId: string, profile: NeuralProfile) => {
    try {
        const store = localStorage.getItem(NEURO_STORAGE_KEY);
        const data: Record<string, NeuroSnapshot[]> = store ? JSON.parse(store) : {};
        
        if (!data[characterId]) data[characterId] = [];
        
        // Keep last 10 snapshots to avoid bloat
        if (data[characterId].length >= 10) data[characterId].shift();
        
        data[characterId].push({
            timestamp: Date.now(),
            profile,
            characterId
        });
        
        localStorage.setItem(NEURO_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error("NeuroSense save error", e);
    }
};

export const getNeuroHistory = (characterId: string): NeuroSnapshot[] => {
    try {
        const store = localStorage.getItem(NEURO_STORAGE_KEY);
        const data = store ? JSON.parse(store) : {};
        return data[characterId] || [];
    } catch (e) {
        return [];
    }
};
