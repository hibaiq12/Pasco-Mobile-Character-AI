
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

    // 1. Keyword Analysis
    if (SCENARIO_KEYWORDS.HIGH_STRESS.some(w => text.includes(w))) {
        impact -= 15;
        detectedMod = "Scenario Stress (High)";
    } else if (SCENARIO_KEYWORDS.MODERATE_STRESS.some(w => text.includes(w))) {
        impact -= 8;
        detectedMod = "Scenario Stress (Mod)";
    } else if (SCENARIO_KEYWORDS.COMFORT.some(w => text.includes(w))) {
        impact += 10;
        // Comfort scenario usually doesn't show as a negative modifier, maybe a positive boost implicit
    }

    // 2. Pseudo-Random Variance (Chaos Factor)
    // Mensimulasikan kondisi mood acak saat skenario dimulai
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = ((hash << 5) - hash) + text.charCodeAt(i);
        hash |= 0;
    }
    const chaos = (hash % 10); // Range -9 to 9
    
    return { 
        impact: impact + chaos,
        modifier: impact < 0 ? detectedMod : undefined
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
    
    // Base Stability default
    let currentScore = 80; 
    
    // Karakter dengan trait khusus memulai dengan baseline berbeda
    if (character.emotionalProfile.stability.toLowerCase().includes('low') || 
        character.emotionalProfile.stability.toLowerCase().includes('fragile')) {
        currentScore = 60;
    } else if (character.emotionalProfile.stability.toLowerCase().includes('high') || 
               character.emotionalProfile.stability.toLowerCase().includes('stoic')) {
        currentScore = 90;
    }

    const activeModifiers: string[] = [];
    let cumulativeStress = 0;
    let recoveryBoost = 0;

    // --- APPLY SCENARIO IMPACT ---
    const scenarioAnalysis = calculateScenarioImpact(character);
    currentScore += scenarioAnalysis.impact;
    if (scenarioAnalysis.modifier) {
        activeModifiers.push(scenarioAnalysis.modifier);
    }

    // --- APPLY INTERNAL STATE (Updated for Health, Violence, Pleasure, Weather) ---
    // Kita kirim 5 pesan terakhir dari MODEL (AI) untuk dianalisis pola kesehatannya
    // PsycheExtra akan menangani persistensi dan trait check
    const botMessages = messages.filter(m => m.role === 'model').slice(-5);
    
    if (botMessages.length > 0) {
        // PASSING CHARACTER OBJECT HERE for Trait-based Weather Analysis
        const internalState = analyzeInternalState(botMessages, character);
        currentScore += internalState.impact;
        if (internalState.modifier) {
            activeModifiers.push(internalState.modifier);
        }
    }

    // 2. ANALISIS WAKTU (Circadian Rhythm)
    const hour = new Date(virtualTime).getHours();
    if (hour >= 0 && hour < 4) {
        // Malam hari mengurangi resilience sebesar 20%
        cumulativeStress += 5;
        activeModifiers.push("Midnight Melancholy");
    }

    // 3. ANALISIS ENGRAM (Histori Pesan USER) dengan RECOVERY RATE
    // Kita melihat 10 pesan terakhir untuk konteks emosional yang lebih dalam
    const recentMessages = messages.slice(-10);

    // Hitung Base Recovery Rate
    // EQ tinggi & Resilience tinggi = Recovery Cepat
    let baseRecoveryRate = 2 + (eqScore / 20) + (resilienceFactor * 3); 

    recentMessages.forEach((msg, index) => {
        // Distance factor: 0 (terlama) sampai 1 (terbaru)
        // Pesan lama memiliki dampak yang lebih kecil (Decay)
        // Decay rate dipengaruhi oleh EQ. EQ tinggi = Cepat melupakan hal buruk.
        const msgAge = recentMessages.length - 1 - index; // 0 is latest
        const decayFactor = Math.max(0.1, 1 - (msgAge * (0.15 + (eqScore / 500)))); 

        if (msg.role === 'user') {
            const text = msg.text;
            const textLower = text.toLowerCase();
            let msgStress = 0;
            let msgComfort = 0;

            // A. DETEKSI BENTAKAN (CAPSLOCK & Tanda Seru)
            const isCaps = text.length > 5 && text === text.toUpperCase() && /[A-Z]/.test(text);
            const isYelling = (text.match(/!/g) || []).length > 2;

            if (isCaps || isYelling) {
                msgStress += 15;
                if (index === recentMessages.length - 1) activeModifiers.push("Verbal Aggression");
            }

            // B. DETEKSI KATA KASAR (Aggression)
            const hasInsult = TRIGGER_KEYWORDS.AGGRESSION.some(word => textLower.includes(word));
            if (hasInsult) {
                msgStress += 20;
                if (index === recentMessages.length - 1) activeModifiers.push("Emotional Abuse");
            }

            // C. DETEKSI STALKING / ANCAMAN (Paranoia)
            const hasStalking = TRIGGER_KEYWORDS.STALKING.some(word => textLower.includes(word));
            if (hasStalking && (textLower.includes('kamu') || textLower.includes('u'))) {
                msgStress += 25;
                if (index === recentMessages.length - 1) activeModifiers.push("Paranoia Trigger");
            }

            // D. DETEKSI PENENANG (Comfort / Apology)
            // EQ Karakter menentukan seberapa efektif permintaan maaf user.
            const hasComfort = TRIGGER_KEYWORDS.COMFORT.some(word => textLower.includes(word));
            if (hasComfort) {
                // High EQ characters accept apologies easier
                const forgivenessMultiplier = 1 + (eqScore / 100); 
                msgComfort += 10 * forgivenessMultiplier;
                
                // Jika pesan terbaru adalah comfort, boost recovery rate global
                if (index === recentMessages.length - 1) {
                    recoveryBoost += 5 * forgivenessMultiplier;
                }
            }

            // Apply Decay Logic (Trauma Fading)
            // Stress masa lalu memudar berdasarkan EQ dan Waktu
            cumulativeStress += (msgStress * decayFactor);
            
            // Comfort masa lalu juga memudar (Efek pujian tidak selamanya)
            currentScore += (msgComfort * decayFactor);
        }
    });

    // 4. KALKULASI AKHIR: STRESS VS RESILIENCE
    
    // Karakter dengan Resilience tinggi memblokir sebagian damage stress
    const effectiveStress = cumulativeStress * (1 - (resilienceFactor * 0.4)); 
    
    currentScore = currentScore - effectiveStress;

    // 5. PENERAPAN RECOVERY RATE (Natural Healing)
    // Jika tidak ada stress aktif di pesan terakhir, karakter pulih perlahan
    const lastMsg = recentMessages[recentMessages.length - 1];
    const isLastMsgStressful = activeModifiers.includes("Verbal Aggression") || activeModifiers.includes("Emotional Abuse");
    
    if (!isLastMsgStressful) {
        currentScore += baseRecoveryRate + recoveryBoost;
    }

    // Clamp score
    currentScore = Math.max(0, Math.min(100, currentScore));

    // 6. STATUS DETERMINATION
    let status: PsycheState['status'] = 'Stable';
    if (currentScore < 80) status = 'Anxious';
    if (currentScore < 50) status = 'Frightened';
    if (currentScore < 30) status = 'Panicked';
    if (currentScore < 10) status = 'Broken';

    // 7. TREND DETERMINATION
    let trend: PsycheState['trend'] = 'stable';
    // Bandingkan dengan skor teoretis tanpa healing untuk melihat arah
    if (effectiveStress > (baseRecoveryRate + recoveryBoost) + 2) trend = 'falling';
    if ((baseRecoveryRate + recoveryBoost) > effectiveStress + 2) trend = 'rising';

    return {
        score: Math.round(currentScore),
        status,
        modifiers: [...new Set(activeModifiers)],
        trend,
        emotionalIntelligence: Math.round(eqScore),
        recoveryRate: parseFloat((baseRecoveryRate + recoveryBoost).toFixed(1))
    };
};
