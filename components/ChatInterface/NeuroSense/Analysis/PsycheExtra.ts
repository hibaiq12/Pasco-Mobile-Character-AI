
import { Character, Message } from "../../../../types";

// --- EXTENDED CONFIGURATION ---

const VIOLENCE_CONFIG = {
    keywords: [
        'slap', 'tampar', 'punch', 'pukul', 'hit me', 'pukul aku', 'kick', 'tendang', 
        'choke', 'cekik', 'spit', 'ludah', 'bleed', 'berdarah', 'bruise', 'lebam', 
        'hurt me', 'sakiti aku', 'painful', 'menyakitkan', 'scream', 'jerit', 
        'begging', 'mohon', 'mercy', 'ampun', 'abuse', 'siksa'
    ],
    baseImpact: -25, // Trauma fisik langsung merusak mental secara signifikan
    label: "Physical Trauma"
};

const PLEASURE_CONFIG = {
    keywords: [
        'moan', 'desah', 'ahhh', 'nghh', 'melt', 'meleleh', 'bliss', 'nikmat', 
        'pleasure', 'senang', 'shiver in delight', 'gemetar nikmat', 'good boy', 'good girl',
        'praise', 'dipuji', 'kiss', 'ciuman', 'bite', 'gigit', 'ecstasy', 'hangat'
    ],
    baseImpact: 15, // Kenikmatan/Aftercare memulihkan mental dengan cepat
    label: "Euphoric State"
};

const COMFORT_CONFIG = {
    keywords: [
        'hug', 'peluk', 'cuddle', 'kelon', 'warm', 'hangat', 'safe', 'aman', 
        'happy', 'bahagia', 'smile', 'senyum', 'laugh', 'tertawa', 'glad', 'senang',
        'calm', 'tenang', 'relax', 'santai', 'peace', 'damai', 'nyaman'
    ],
    baseImpact: 8, // Perasaan aman meningkatkan stabilitas perlahan
    label: "Feeling Safe"
};

const HEALTH_CONFIG = {
    SEVERE: {
        keywords: [
            'vomit', 'muntah', 'blood', 'darah', 'collapse', 'pingsan', 'fever', 'demam tinggi', 
            'shiver', 'menggigil', 'blind', 'buta', 'can\'t breathe', 'sesak', 'luka parah', 'critical'
        ],
        baseImpact: -15,
        label: "Critical Condition"
    },
    MODERATE: {
        keywords: [
            'pain', 'sakit', 'hurt', 'luka', 'cough', 'batuk', 'dizzy', 'pusing', 'pale', 'pucat', 
            'weak', 'lemah', 'stomachache', 'sakit perut', 'headache', 'sakit kepala', 'hot', 'panas'
        ],
        baseImpact: -8,
        label: "Physical Illness"
    },
    RECOVERY: {
        keywords: [
            'medicine', 'obat', 'rest', 'istirahat', 'sleep', 'tidur', 'better', 'membaik', 
            'healed', 'sembuh', 'drink water', 'minum air'
        ],
        mitigation: 10 
    }
};

// Weather keywords to detect in chat context
const WEATHER_KEYWORDS = {
    RAIN: ['rain', 'hujan', 'wet', 'basah', 'pour', 'deras'],
    STORM: ['storm', 'badai', 'thunder', 'petir', 'kilat', 'lightning', 'gemuruh'],
    COLD: ['cold', 'dingin', 'freeze', 'beku', 'snow', 'salju', 'shiver', 'gigil'],
    HOT: ['hot', 'panas', 'sun', 'matahari', 'sweat', 'keringat', 'burn', 'bakar']
};

export interface ExtraStateResult {
    impact: number;
    modifier?: string;
}

/**
 * Menganalisis dampak cuaca berdasarkan SIFAT (Traits) karakter di Neural Forge.
 * Menggabungkan Flaws, Triggers, dan Backstory.
 */
const checkWeatherImpact = (text: string, char: Character): number => {
    let impact = 0;
    
    // Gabungkan semua sifat karakter untuk pengecekan
    const traits = [
        char.capabilities.flaws, 
        char.emotionalProfile.sadnessTriggers, 
        char.emotionalProfile.angerTriggers,
        char.lore.backstory,
        char.description
    ].join(' ').toLowerCase();

    // 1. Storm/Thunder Sensitivity
    if (WEATHER_KEYWORDS.STORM.some(w => text.includes(w))) {
        if (traits.includes('thunder') || traits.includes('storm') || traits.includes('loud') || traits.includes('petir') || traits.includes('kaget') || traits.includes('takut')) {
            impact -= 15; // Phobia trigger (Takut Petir)
        } else {
            impact -= 2; // General discomfort
        }
    }

    // 2. Cold/Rain Sensitivity
    if (WEATHER_KEYWORDS.RAIN.some(w => text.includes(w)) || WEATHER_KEYWORDS.COLD.some(w => text.includes(w))) {
        if (traits.includes('cold') || traits.includes('sick') || traits.includes('weak') || traits.includes('dingin') || traits.includes('lemah')) {
            impact -= 10; // Physically weak character gets depressed/sick in rain
        } else if (char.emotionalProfile.joyTriggers.toLowerCase().includes('rain') || char.emotionalProfile.joyTriggers.toLowerCase().includes('hujan')) {
            impact += 5; // Pluviophile (Suka hujan)
        }
    }

    return impact;
};

/**
 * Menganalisis kondisi internal (Kesehatan, Kekerasan, Emosi, Cuaca) Chatbot.
 */
export const analyzeInternalState = (recentBotMessages: Message[], character?: Character): ExtraStateResult => {
    if (!recentBotMessages || recentBotMessages.length === 0) {
        return { impact: 0 };
    }

    // Ambil pesan paling baru untuk analisis konteks instan
    const latestMsg = recentBotMessages[recentBotMessages.length - 1];
    const latestText = latestMsg.text.toLowerCase();

    // --- 1. VIOLENCE CHECK (PRIORITY: HIGHEST) ---
    // Jika karakter sedang disiksa/dipukul, ini menimpa status lain.
    if (VIOLENCE_CONFIG.keywords.some(w => latestText.includes(w))) {
        return { impact: VIOLENCE_CONFIG.baseImpact, modifier: VIOLENCE_CONFIG.label };
    }

    // --- 2. PLEASURE / EUPHORIA CHECK (PRIORITY: HIGH) ---
    // Jika karakter sedang menikmati sesuatu (Seksual atau Kebahagiaan ekstrem)
    if (PLEASURE_CONFIG.keywords.some(w => latestText.includes(w))) {
        return { impact: PLEASURE_CONFIG.baseImpact, modifier: PLEASURE_CONFIG.label };
    }

    // --- 3. HEALTH ALGORITHM (Cumulative) ---
    let healthImpact = 0;
    let healthLabel = "";
    let severityLevel = 0;
    let recoveryFactor = 0;

    const scanLimit = Math.min(recentBotMessages.length, 3);
    
    for (let i = 0; i < scanLimit; i++) {
        const msg = recentBotMessages[recentBotMessages.length - 1 - i];
        const text = msg.text.toLowerCase();
        
        if (HEALTH_CONFIG.RECOVERY.keywords.some(w => text.includes(w))) {
            recoveryFactor += HEALTH_CONFIG.RECOVERY.mitigation;
        }

        if (HEALTH_CONFIG.SEVERE.keywords.some(w => text.includes(w))) {
            healthImpact += HEALTH_CONFIG.SEVERE.baseImpact;
            if (i === 0) { healthLabel = HEALTH_CONFIG.SEVERE.label; severityLevel = 2; }
        } else if (HEALTH_CONFIG.MODERATE.keywords.some(w => text.includes(w))) {
            healthImpact += HEALTH_CONFIG.MODERATE.baseImpact;
            if (i === 0 && severityLevel < 2) { healthLabel = HEALTH_CONFIG.MODERATE.label; severityLevel = 1; }
        }
    }

    if (healthImpact < 0 && recoveryFactor > 0) {
        healthImpact = Math.min(0, healthImpact + recoveryFactor);
        if (healthImpact === 0) healthLabel = "Recovering";
    }

    if (healthImpact < -5) {
        return { impact: healthImpact, modifier: healthLabel };
    }

    // --- 4. COMFORT / JOY CHECK ---
    if (COMFORT_CONFIG.keywords.some(w => latestText.includes(w))) {
        return { impact: COMFORT_CONFIG.baseImpact, modifier: COMFORT_CONFIG.label };
    }

    // --- 5. WEATHER & TRAIT SENSITIVITY ---
    if (character) {
        const weatherImpact = checkWeatherImpact(latestText, character);
        if (weatherImpact !== 0) {
            return { 
                impact: weatherImpact, 
                modifier: weatherImpact < 0 ? "Weather Distress" : "Weather Comfort" 
            };
        }
    }

    return { impact: 0 };
};
