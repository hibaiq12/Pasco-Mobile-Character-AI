
import { useMemo } from 'react';
import { Character, Message, OutfitItem } from '../../../types';
import { analyzePsyche } from './Analysis/Psyche';
import { analyzeActiveEngrams } from './Analysis/Engram';
import { analyzeRelationship, RelationshipState } from './Analysis/Relationship';
import { getSettings } from '../../../services/storageService';

export interface NeuralProfile {
    visualState: string;
    psyche: {
        stability: number; // 0-100
        status: string; // 'Stable', 'Fragile', 'Critical'
        trend: 'rising' | 'falling' | 'stable';
        warning?: string;
        emotionalIntelligence: number;
        recoveryRate: number;
    };
    social: RelationshipState; // Updated Interface
    duality: {
        alignment: string;
        maskIntegrity: string; // 'Intact', 'Cracking', 'Fractured'
        integrityColor: string;
    };
    memory: {
        focus: string[]; // Keywords (Engrams)
    };
    isProcessing: boolean;
}

export const useProfileEngine = (
    character: Character, 
    messages: Message[], 
    outfits: OutfitItem[], 
    virtualTime: number
): NeuralProfile => {
    
    // Ambil setting sync untuk User Name
    const settings = getSettings();

    return useMemo(() => {
        // --- 1. VISUAL STATE ---
        // Priority: Character Outfit > Base Description
        const charOutfit = outfits.find(o => o.target === 'char');
        const visualState = charOutfit ? charOutfit.desc : (character.appearance.style || "Default Appearance");

        // --- 2. PSYCHE STABILITY ---
        const psycheAnalysis = analyzePsyche(character, messages, virtualTime);
        
        // Generate warning text from modifiers
        let stabWarning = undefined;
        if (psycheAnalysis.modifiers.length > 0) {
            stabWarning = psycheAnalysis.modifiers[0].toUpperCase();
            if (psycheAnalysis.modifiers.length > 1) stabWarning += " +";
        } else if (psycheAnalysis.score < 20) {
            stabWarning = "CRITICAL: MENTAL BREAKDOWN";
        }

        // --- 3. SOCIAL PROTOCOL (NEW: RELATIONSHIP ENGINE) ---
        // Menggunakan logika Relationship.ts yang baru
        const relationshipAnalysis = analyzeRelationship(character, messages, psycheAnalysis);

        // --- 4. DUALITY (MASK INTEGRITY) ---
        let maskIntegrity = "Intact";
        let integrityColor = "text-emerald-400";
        const currentStability = psycheAnalysis.score;

        if (currentStability < 60) { maskIntegrity = "Cracking"; integrityColor = "text-yellow-400"; }
        if (currentStability < 30) { maskIntegrity = "Fracturing"; integrityColor = "text-red-400"; }
        if (currentStability < 10) { maskIntegrity = "SHATTERED"; integrityColor = "text-red-600 animate-pulse"; }

        // --- 5. ACTIVE ENGRAMS (Context-Aware) ---
        // Context injection from Scenario
        const currentLoc = character.scenario?.currentLocation || "";
        const currentAct = character.scenario?.currentActivity || "";
        
        // Inject Identity Context
        const identityContext = {
            userName: settings.userName || 'User',
            charName: character.name,
            charRole: character.role
        };

        const activeEngrams = analyzeActiveEngrams(messages, currentLoc, currentAct, identityContext);

        return {
            visualState,
            psyche: {
                stability: psycheAnalysis.score,
                status: psycheAnalysis.status,
                trend: psycheAnalysis.trend,
                warning: stabWarning,
                emotionalIntelligence: psycheAnalysis.emotionalIntelligence,
                recoveryRate: psycheAnalysis.recoveryRate
            },
            social: relationshipAnalysis,
            duality: {
                alignment: character.moralProfile.alignment || "Neutral",
                maskIntegrity,
                integrityColor
            },
            memory: {
                focus: activeEngrams.length > 0 ? activeEngrams : ["Scanning Context..."]
            },
            isProcessing: messages.length > 0 && messages[messages.length - 1].role === 'user'
        };
    }, [character, messages, outfits, Math.floor(virtualTime / 60000)]); 
};
