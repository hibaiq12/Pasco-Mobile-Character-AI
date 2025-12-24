
import { useMemo } from 'react';
import { Character, Message } from '../../types';
import { OutfitItem } from './index';

export interface NeuralProfile {
    visualState: string;
    psyche: {
        stability: number; // 0-100
        status: string; // 'Stable', 'Fragile', 'Critical'
        trend: 'rising' | 'falling' | 'stable';
        warning?: string;
    };
    social: {
        level: number;
        trust: number; // Current progress in level
        maxTrust: number; // Cap for current level
        label: string;
        percent: number;
    };
    duality: {
        alignment: string;
        maskIntegrity: string; // 'Intact', 'Cracking', 'Fractured'
        integrityColor: string;
    };
    memory: {
        focus: string[]; // Keywords
    };
    isProcessing: boolean;
}

// Helper to extract keywords
const extractKeywords = (text: string): string[] => {
    if (!text) return [];
    const words = text.toLowerCase().replace(/[^\w\s]/gi, '').split(/\s+/);
    // Filter common stop words and short words
    const stopWords = ['the', 'and', 'that', 'this', 'with', 'from', 'what', 'your', 'have', 'aku', 'kamu', 'dan', 'yang', 'ini', 'itu', 'dari', 'bisa', 'tidak'];
    return words.filter(w => w.length > 3 && !stopWords.includes(w)).slice(-3); // Last 3 unique meaningful words
};

export const useProfileEngine = (
    character: Character, 
    messages: Message[], 
    outfits: OutfitItem[], 
    virtualTime: number
): NeuralProfile => {
    
    return useMemo(() => {
        const msgCount = messages.length;
        const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.text || "";
        
        // --- 1. VISUAL STATE ---
        // Priority: Character Outfit > Base Description
        const charOutfit = outfits.find(o => o.target === 'char');
        const visualState = charOutfit ? charOutfit.desc : (character.appearance.style || "Default Appearance");

        // --- 2. PSYCHE STABILITY ---
        // Base stability derived from profile
        let baseStability = 50;
        const stabDesc = character.emotionalProfile.stability.toLowerCase();
        if (stabDesc.includes('high') || stabDesc.includes('stoic')) baseStability = 80;
        if (stabDesc.includes('low') || stabDesc.includes('fragile')) baseStability = 30;

        // Dynamic Modifiers
        let stress = 0;
        let comfort = 0;

        // Time modifier: Late night (00:00 - 05:00) reduces stability (tired/vulnerable)
        const hour = new Date(virtualTime).getHours();
        if (hour >= 0 && hour < 5) stress += 15;

        // Recent Interaction Analysis (Last 5 messages)
        const recentMsgs = messages.slice(-5);
        recentMsgs.forEach(m => {
            if (m.role === 'user') {
                // Stressors
                if (m.text.includes('!')) stress += 5;
                if (m.text === m.text.toUpperCase() && m.text.length > 5) stress += 10; // Caps lock
                
                // Comforts
                if (m.text.length > 50) comfort += 5; // Long thoughtful messages
                if (['maaf', 'sorry', 'love', 'sayang', 'safe', 'tenang'].some(w => m.text.toLowerCase().includes(w))) comfort += 8;
            }
        });

        // Calculate final stability
        let currentStability = Math.max(0, Math.min(100, baseStability - stress + comfort));
        
        // Determine Status Label
        let stabStatus = "Stable";
        let stabWarning = undefined;
        if (currentStability < 40) {
            stabStatus = "Fragile";
            stabWarning = "WARNING: Instability Detected";
        }
        if (currentStability < 20) {
            stabStatus = "Critical";
            stabWarning = "CRITICAL: Neural Meltdown Imminent";
        }

        // --- 3. SOCIAL PROTOCOL (LEVELING) ---
        // XP System based on interaction count
        const xp = msgCount * 10; 
        let level = 1;
        let maxTrust = 100;
        let label = "Stranger";

        if (xp > 100) { level = 2; maxTrust = 300; label = "Acquaintance"; }
        if (xp > 500) { level = 3; maxTrust = 800; label = "Friend"; }
        if (xp > 1500) { level = 4; maxTrust = 2000; label = "Confidant"; }
        if (xp > 5000) { level = 5; maxTrust = 5000; label = "Bonded"; }

        // Trust Score within current level
        const trust = Math.min(maxTrust, xp);
        const trustPercent = (trust / maxTrust) * 100;

        // --- 4. DUALITY (MASK INTEGRITY) ---
        // Mask integrity correlates with Stability. Lower stability = Mask cracks.
        let maskIntegrity = "Intact";
        let integrityColor = "text-emerald-400";
        
        if (currentStability < 60) { maskIntegrity = "Cracking"; integrityColor = "text-yellow-400"; }
        if (currentStability < 30) { maskIntegrity = "Fracturing"; integrityColor = "text-red-400"; }

        // --- 5. MEMORY ENGRAM ---
        const focusKeywords = extractKeywords(lastUserMsg);

        return {
            visualState,
            psyche: {
                stability: Math.round(currentStability),
                status: stabStatus,
                trend: comfort > stress ? 'rising' : (stress > comfort ? 'falling' : 'stable'),
                warning: stabWarning
            },
            social: {
                level,
                trust,
                maxTrust,
                label,
                percent: trustPercent
            },
            duality: {
                alignment: character.moralProfile.alignment || "Neutral",
                maskIntegrity,
                integrityColor
            },
            memory: {
                focus: focusKeywords.length > 0 ? focusKeywords : ["Waiting for input..."]
            },
            isProcessing: messages.length > 0 && messages[messages.length - 1].role === 'user'
        };
    }, [character, messages, outfits, Math.floor(virtualTime / 60000)]); // Update every game-minute
};
