
import { Character } from '../../types';

// --- NEURAL THINKING ENGINE V2.1 ---
// Algoritma ini menilai "Kemanusiaan" (Humanity) dari karakter AI.
// Fokus pada: Ketidaksempurnaan, Konflik Batin, dan Kedalaman Psikologis.

export interface AnalysisBreakdown {
    identity: number; // Max 20
    psyche: number;   // Max 25
    duality: number;  // Max 20
    lore: number;     // Max 20
    complexity: number; // Max 15
}

export interface AnalysisResult {
    score: number;
    label: string;
    details: string[];
    breakdown: AnalysisBreakdown;
}

export const analyzeNeuralCoherence = (char: Partial<Character>): AnalysisResult => {
    let rawScore = 0;
    const details: string[] = [];
    
    // Breakdown tracking
    let scoreIdentity = 0;
    let scorePsyche = 0;
    let scoreDuality = 0;
    let scoreLore = 0;
    let scoreComplexity = 0;

    // 1. IDENTITY & BASICS (Max 20)
    if (char.name?.trim().length > 2) scoreIdentity += 5;
    if (char.role?.trim()) scoreIdentity += 5;
    if (char.avatar) scoreIdentity += 5;
    if (char.appearance?.features && char.appearance.features.length > 10) scoreIdentity += 5;

    // 2. PSYCHOMETRIC DEVIATION (Max 25)
    const p = char.psychometrics;
    if (p) {
        const traits = [p.openness, p.conscientiousness, p.extraversion, p.agreeableness, p.neuroticism];
        const mean = traits.reduce((a, b) => a + b, 0) / traits.length;
        const variance = traits.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / traits.length;
        const deviation = Math.sqrt(variance);

        if (deviation > 5) scorePsyche += 5;
        if (deviation > 15) scorePsyche += 10;
        if (deviation > 20) {
            scorePsyche += 5; 
            details.push("Complex Personality Deviation Detected");
        }
        
        // Decision Style Bias
        const bias = Math.abs(p.decisionStyle - 50);
        if (bias > 10) scorePsyche += 5;
    }

    // 3. DUALITY TENSION (Max 20)
    if (char.duality) {
        const hasMask = char.duality.mask && char.duality.mask.length > 5;
        const hasCore = char.duality.core && char.duality.core.length > 5;
        const hasBreak = char.duality.breakingPoint && char.duality.breakingPoint.length > 5;

        if (hasMask) scoreDuality += 5;
        if (hasCore) scoreDuality += 5;
        if (hasMask && hasCore && char.duality.mask !== char.duality.core) scoreDuality += 5;
        if (hasBreak) {
            scoreDuality += 5;
            details.push("Psychological Breaking Point Defined");
        }
    }

    // 4. SEMANTIC DEPTH (Lore & Memory) (Max 20)
    if (char.lore?.backstory && char.lore.backstory.length > 50) scoreLore += 10;
    if (char.lore?.secrets && char.lore.secrets.length > 10) scoreLore += 5;
    if (char.memory?.memories && char.memory.memories.length >= 2) {
        scoreLore += 5;
        details.push("Core Memories Anchored");
    }

    // 5. COMPLEXITY & FLAWS (Max 15)
    if (char.capabilities?.flaws && char.capabilities.flaws.length > 5) {
        scoreComplexity += 5;
        details.push("Character Flaws Identified");
    }
    if (char.communication?.quirks) scoreComplexity += 5;
    if (char.emotionalProfile?.stability) scoreComplexity += 5;

    // Sum Total
    rawScore = scoreIdentity + scorePsyche + scoreDuality + scoreLore + scoreComplexity;

    // --- NORMALISASI SKOR ---
    const finalScore = Math.min(100, Math.max(0, rawScore));

    // --- KLASIFIKASI LABEL ---
    let label = "Artificial Construct";
    if (finalScore > 40) label = "Basic Archetype";
    if (finalScore > 70) label = "Simulated Persona";
    if (finalScore > 90) label = "Sentient Simulation";

    return {
        score: finalScore,
        label,
        details,
        breakdown: {
            identity: (scoreIdentity / 20) * 100,
            psyche: (scorePsyche / 25) * 100,
            duality: (scoreDuality / 20) * 100,
            lore: (scoreLore / 20) * 100,
            complexity: (scoreComplexity / 15) * 100
        }
    };
};
