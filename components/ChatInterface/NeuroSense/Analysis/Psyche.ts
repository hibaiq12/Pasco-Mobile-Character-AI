
import { Character, Message } from "../../../../types";
import { analyzeInternalState } from "./PsycheExtra";

// --- KONSTANTA PEMICU ---

const TRIGGER_KEYWORDS = {
    AGGRESSION: ['bodoh', 'goblok', 'anjing', 'babi', 'tolong', 'diam', 'mati', 'benci', 'sampah', 'useless', 'idiot', 'shut up', 'fuck', 'hate', 'die', 'kill', 'jelek'],
    STALKING: ['ikut', 'belakang', 'rumah', 'kamar', 'lihat', 'mengawasi', 'jangan lari', 'behind you', 'watching', 'lock', 'outside'],
    PANIC: ['darah', 'sakit', 'tolong', 'bahaya', 'lari', 'awas', 'help', 'blood', 'pain', 'run', 'hantu', 'ghost'],
    COMFORT: ['maaf', 'tenang', 'sayang', 'cinta', 'aman', 'jaga', 'sorry', 'calm', 'love', 'safe', 'good', 'pintar', 'hebat', 'mengerti', 'paham']
};

const SCENARIO_KEYWORDS = {
    HIGH_STRESS: ['trapped', 'alone', 'lost', 'dark', 'scared', 'injured', 'danger', 'running', 'hiding', 'blood', 'tears', 'crying', 'nightmare', 'abandoned', 'haunted', 'hospital'],
    MODERATE_STRESS: ['waiting', 'crowd', 'noise', 'rain', 'storm', 'cold', 'exam', 'test', 'unknown', 'stranger', 'school', 'office', 'work'],
    COMFORT: ['home', 'bed', 'sleeping', 'relaxing', 'eating', 'cafe', 'park', 'sunny', 'friend', 'warm', 'safe', 'reading', 'music', 'vacation', 'beach']
};

export interface PsycheState {
    score: number; // 0 - 100
    status: 'Stable' | 'Anxious' | 'Frightened' | 'Panicked' | 'Broken';
    modifiers: string[]; // List of active effects e.g. "Verbal Abuse", "Feeling Watched"
    trend: 'rising' | 'falling' | 'stable';
    emotionalIntelligence: number; // 0 - 100 (New Metric)
    recoveryRate: number; // Poin pemulihan per interaksi
}

/**
 * Menghitung Emotional Intelligence (EQ) Karakter.
 * EQ mempengaruhi seberapa cepat karakter memaafkan (Recovery) dan memproses trauma.
 */
const calculateEQ = (char: Character): number => {
    const p = char.psychometrics;
    // EQ Komposit: Empathy (40%) + Agreeableness (30%) + Openness (20%) + Emotional Stability (10%)
    // Neuroticism dibalik (100 - N) untuk mendapatkan stabilitas.
    const stability = 100 - (p.neuroticism || 50);
    const eq = (p.empathy * 0.4) + (p.agreeableness * 0.3) + (p.openness * 0.2) + (stability * 0.1);
    return Math.min(100, Math.max(0, eq));
};

/**
 * Menghitung dampak Skenario Awal terhadap Psyche.
 * Menggunakan Pseudo-Random berdasarkan hash string skenario agar konsisten namun terasa "acak" per skenario berbeda.
 */
const calculateScenarioImpact = (char: Character): { impact: number, modifier?: string } => {
    if (!char.scenario) return { impact: 0 };

    let impact = 0;
    const text = `${char.scenario.currentLocation} ${char.scenario.currentActivity}`.toLowerCase();
    let detectedMod = "";

    // Calculate hash first
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = ((hash << 5) - hash) + text.charCodeAt(i);
        hash |= 0;
    }

    // 1. Keyword Analysis
    if (SCENARIO_KEYWORDS.HIGH_STRESS.some(w => text.includes(w))) {
        impact -= 15;
        const variants = [
            "Severe Environmental Panic",
            "Hostile Surroundings",
            "Critical Scenario Stress",
            "Traumatic Context",
            "Imminent Threat Detected"
        ];
        detectedMod = variants[Math.abs(hash) % variants.length];
    } else if (SCENARIO_KEYWORDS.MODERATE_STRESS.some(w => text.includes(w))) {
        impact -= 8;
        const variants = [
            "Mild Scenario Tension",
            "Uncomfortable Atmosphere",
            "Moderate Context Stress",
            "Uneasy Environment",
            "Ambient Pressure"
        ];
        detectedMod = variants[Math.abs(hash) % variants.length];
    } else if (SCENARIO_KEYWORDS.COMFORT.some(w => text.includes(w))) {
        impact += 10;
        const variants = [
            "Optimal Environment",
            "Soothing Scenario",
            "Safe Haven",
            "Comforting Surroundings"
        ];
        detectedMod = variants[Math.abs(hash) % variants.length];
    }

    // 2. Pseudo-Random Variance (Chaos Factor)
    // Mensimulasikan kondisi mood acak saat skenario dimulai
    const chaos = (hash % 10); // Range -9 to 9
    
    return { 
        impact: impact + chaos,
        modifier: detectedMod !== "" ? detectedMod : undefined
    };
};

/**
 * Menghitung dampak pesan terhadap kestabilan mental karakter.
 */
export const analyzePsyche = (
    character: Character,
    messages: Message[],
    virtualTime: number
): PsycheState => {
    
    // 1. BASELINE & INITIALIZATION
    const neuroticism = character.psychometrics.neuroticism || 50;
    const resilienceFactor = 1 - (neuroticism / 100); // 0 (Fragile) to 1 (Stoic)
    const eqScore = calculateEQ(character);
    
    // Base Stability default from NeuroCheat or Character Config
    let baseScore = 80; 
    
    if (character.emotionalProfile.stability.toLowerCase().includes('low') || 
        character.emotionalProfile.stability.toLowerCase().includes('fragile')) {
        baseScore = 60;
    } else if (character.emotionalProfile.stability.toLowerCase().includes('high') || 
               character.emotionalProfile.stability.toLowerCase().includes('stoic')) {
        baseScore = 90;
    }

    let currentScore = baseScore;
    const activeModifiers: Set<string> = new Set();
    
    // Hitung Base Recovery Rate
    const baseRecoveryRate = 2 + (eqScore / 20) + (resilienceFactor * 3);

    // --- APPLY SCENARIO IMPACT ---
    const scenarioAnalysis = calculateScenarioImpact(character);
    currentScore += scenarioAnalysis.impact;
    if (scenarioAnalysis.modifier) {
        activeModifiers.add(scenarioAnalysis.modifier);
    }

    // --- 2. PROCESS ENTIRE RECENT HISTORY STATEFULLY ---
    const recentMessages = messages.slice(-100);
    let trend: PsycheState['trend'] = 'stable';
    let lastStressful = true;

    recentMessages.forEach((msg, index) => {
        if (msg.role === 'model') {
            const internalState = analyzeInternalState([msg], character);
            currentScore += internalState.impact;
            if (index === recentMessages.length - 1 && internalState.modifier) {
                activeModifiers.add(internalState.modifier);
            }
        } else if (msg.role === 'user') {
            const text = msg.text.toLowerCase();
            let msgStress = 0;
            let msgComfort = 0;
            let isStressful = false;

            // A. DETEKSI BENTAKAN (CAPSLOCK & Tanda Seru)
            const isCaps = msg.text.length > 5 && msg.text === msg.text.toUpperCase() && /[A-Z]/.test(msg.text);
            const isYelling = (msg.text.match(/!/g) || []).length > 2;

            if (isCaps || isYelling) {
                msgStress += 15;
                isStressful = true;
                if (index === recentMessages.length - 1) activeModifiers.add("Verbal Aggression");
            }

            // B. DETEKSI KATA KASAR (Aggression)
            const hasInsult = TRIGGER_KEYWORDS.AGGRESSION.some(word => text.includes(word));
            if (hasInsult) {
                msgStress += 20;
                isStressful = true;
                if (index === recentMessages.length - 1) activeModifiers.add("Emotional Abuse");
            }

            // C. DETEKSI STALKING / ANCAMAN (Paranoia)
            const hasStalking = TRIGGER_KEYWORDS.STALKING.some(word => text.includes(word));
            if (hasStalking && (text.includes('kamu') || text.includes('u'))) {
                msgStress += 25;
                isStressful = true;
                if (index === recentMessages.length - 1) activeModifiers.add("Paranoia Trigger");
            }

            // D. DETEKSI PENENANG (Comfort / Apology)
            const hasComfort = TRIGGER_KEYWORDS.COMFORT.some(word => text.includes(word));
            if (hasComfort) {
                const forgivenessMultiplier = 1 + (eqScore / 100); 
                msgComfort += 10 * forgivenessMultiplier;
            }

            // APPLY DAMAGE
            const effectiveStress = msgStress * (1 - (resilienceFactor * 0.4));
            currentScore -= effectiveStress;
            currentScore += msgComfort;

            // NATURAL HEALING
            if (!isStressful && currentScore < 100) {
                // Diminishing returns on healing as it approaches 100
                const distanceToMax = 100 - currentScore;
                const healAmount = baseRecoveryRate * (distanceToMax / 100);
                currentScore += healAmount;
            }

            currentScore = Math.max(0, Math.min(100, currentScore));
            
            if (index === recentMessages.length - 1) {
                lastStressful = isStressful;
                if (msgComfort > effectiveStress + 1) trend = 'rising';
                else if (effectiveStress > 1) trend = 'falling';
                else trend = 'stable';
            }
        }
    });

    // 3. ANALISIS WAKTU (Circadian Rhythm)
    const hour = new Date(virtualTime).getHours();
    if (hour >= 0 && hour < 4) {
        currentScore -= 5;
        activeModifiers.add("Midnight Melancholy");
    }

    currentScore = Math.max(0, Math.min(100, currentScore));

    // 4. STATUS DETERMINATION
    let status: PsycheState['status'] = 'Stable';
    if (currentScore < 80) status = 'Anxious';
    if (currentScore < 50) status = 'Frightened';
    if (currentScore < 30) status = 'Panicked';
    if (currentScore < 10) status = 'Broken';

    return {
        score: Math.round(currentScore),
        status,
        modifiers: Array.from(activeModifiers),
        trend,
        emotionalIntelligence: Math.round(eqScore),
        recoveryRate: parseFloat(baseRecoveryRate.toFixed(1))
    };
};
