
import { Character, Message } from "../../../../types";
import { PsycheState } from "./Psyche";
import { COMPLEX_TIERS, RelationshipTier } from "./TierRelationship";
import { User } from "lucide-react";

export interface RelationshipState {
    score: number; // -100 to 100
    tier: RelationshipTier;
    progress: number; // 0-100 within current tier
    trend: 'improving' | 'deteriorating' | 'stagnant' | 'volatile';
    context: string; // e.g. "Feeling Loved", "Feeling Betrayed"
}

// Keyword Detection
const ROMANCE_KEYWORDS = ['cinta', 'sayang', 'love', 'suka kamu', 'cantik', 'ganteng', 'kiss', 'peluk', 'date', 'pacar', 'marry', 'nikah', 'mine', 'milikku', 'honey', 'darling', 'beautiful', 'handsome', 'sexy', 'hot', 'jadian', 'couple'];
const HOSTILE_KEYWORDS = ['benci', 'hate', 'mati', 'die', 'pergi', 'go away', 'sampah', 'trash', 'bodoh', 'stupid', 'jelek', 'ugly', 'kill', 'bunuh', 'useless', 'muak', 'jijik', 'loser'];

/**
 * Default fallback tier if analysis fails
 */
const FALLBACK_TIER: RelationshipTier = {
    id: 'fallback',
    label: 'Unknown',
    minScore: 0,
    maxScore: 0,
    color: 'text-zinc-500',
    barColor: 'bg-zinc-600',
    glowColor: '#71717a',
    icon: User,
    type: 'Neutral',
    description: 'Relationship status unavailable.'
};

/**
 * Menentukan skor awal berdasarkan setup "Relation to User" di Neural Forge.
 */
const getStartingParams = (relationStr: string): { score: number, isRomantic: boolean } => {
    const lower = (relationStr || "").toLowerCase();
    
    // Default
    let score = 0;
    let isRomantic = false;

    // Positive
    if (lower.includes('friend') || lower.includes('teman')) score = 30;
    if (lower.includes('best friend') || lower.includes('sahabat')) score = 60;
    if (lower.includes('ally') || lower.includes('sekutu')) score = 25;
    if (lower.includes('family') || lower.includes('keluarga') || lower.includes('sister') || lower.includes('brother')) score = 70;
    if (lower.includes('childhood') || lower.includes('kecil')) score = 50;

    // Romantic
    if (lower.includes('girlfriend') || lower.includes('boyfriend') || lower.includes('pacar') || lower.includes('wife') || lower.includes('husband') || lower.includes('istri') || lower.includes('suami') || lower.includes('lover')) {
        score = 75;
        isRomantic = true;
    }
    if (lower.includes('ex') || lower.includes('mantan')) {
        score = -10; // Complicated start
        isRomantic = true; // Still flagged as romantic context usually
    }
    if (lower.includes('crush') || lower.includes('gebetan')) {
        score = 45;
        isRomantic = true;
    }

    // Negative
    if (lower.includes('enemy') || lower.includes('musuh')) score = -50;
    if (lower.includes('rival')) score = -20;
    if (lower.includes('hater') || lower.includes('pembenci')) score = -80;
    if (lower.includes('stranger') || lower.includes('asing')) score = 0;

    return { score, isRomantic };
};

/**
 * Menganalisis hubungan sosial secara mendalam dengan logika transisi realistis.
 */
export const analyzeRelationship = (
    character: Character,
    messages: Message[],
    psyche: PsycheState
): RelationshipState => {
    
    // 1. Safety Checks
    if (!character || !messages || !Array.isArray(messages)) {
        return {
            score: 0,
            tier: COMPLEX_TIERS?.[0] || FALLBACK_TIER,
            progress: 0,
            trend: 'stagnant',
            context: 'Initializing...'
        };
    }

    const relationInfo = character.lore?.userRelationship || "Stranger";
    const startParams = getStartingParams(relationInfo);
    
    // --- 1. BASELINE CALCULATION (HISTORY) ---
    const recentMsgs = messages.slice(-50);
    // Jika ada pesan baru dari user, kita pisahkan untuk analisis dampak instan
    const lastMsg = recentMsgs.length > 0 && recentMsgs[recentMsgs.length - 1].role === 'user' 
        ? recentMsgs[recentMsgs.length - 1] 
        : null;
    
    const historyMsgs = lastMsg ? recentMsgs.slice(0, -1) : recentMsgs;

    let currentScore = startParams.score;
    let isRomanticContext = startParams.isRomantic;
    
    // Faktor Mental (Psyche) - Safe Access
    const pScore = psyche?.score || 50;
    const volatilityMultiplier = pScore < 40 ? 1.5 : (pScore > 80 ? 0.8 : 1.0);
    const trustGainDampener = pScore < 40 ? 0.5 : 1.0; 

    // Kalkulasi History (Established Bond)
    historyMsgs.forEach(msg => {
        if (msg && msg.role === 'user' && msg.text) {
            const text = msg.text.toLowerCase();
            let shift = 0;

            if (currentScore > -20) shift += 0.1 * trustGainDampener; // Maintenance boost

            if (ROMANCE_KEYWORDS.some(w => text.includes(w))) {
                shift += 1.0 * trustGainDampener;
                if (currentScore > 30) isRomanticContext = true;
            }
            if (HOSTILE_KEYWORDS.some(w => text.includes(w))) {
                shift -= 3.0 * volatilityMultiplier;
            }
            currentScore += shift;
        }
    });

    // Clamp Baseline Score
    currentScore = Math.max(-100, Math.min(100, currentScore));
    
    // --- 2. INSTANT IMPACT ANALYSIS (REALISM LOGIC) ---
    
    let shift = 0;
    let trend: RelationshipState['trend'] = 'stagnant';
    
    // Default context label
    let contextLabel = isRomanticContext ? "Romantic Interest" : (currentScore < 0 ? "Tension" : "Platonic Bond");

    if (lastMsg && lastMsg.text) {
        const text = lastMsg.text.toLowerCase();
        const isRomanceTrigger = ROMANCE_KEYWORDS.some(w => text.includes(w));
        const isHostileTrigger = HOSTILE_KEYWORDS.some(w => text.includes(w));
        
        let impactMultiplier = 1.0;
        if (Math.abs(currentScore) > 80) impactMultiplier = 0.5; // Inertia

        // --- LOGIKA 2: THE BETRAYAL MECHANIC (High Tier Drop) ---
        if (isHostileTrigger) {
            if (currentScore > 60) {
                // PENGKHIANATAN
                if (isRomanticContext) {
                    shift = -50 * volatilityMultiplier; 
                    contextLabel = "Heartbroken / Betrayed";
                    trend = 'volatile';
                    isRomanticContext = false; 
                } else {
                    shift = -35 * volatilityMultiplier;
                    contextLabel = "Deeply Hurt";
                    trend = 'deteriorating';
                }
            } else {
                shift = -5 * volatilityMultiplier;
                trend = 'deteriorating';
            }
        } 
        
        // --- LOGIKA 3: THE FRIENDZONE FRICTION (High Platonic -> Romance) ---
        else if (isRomanceTrigger) {
            if (isRomanticContext) {
                shift = 2 * trustGainDampener * impactMultiplier;
                trend = 'improving';
            } else {
                if (currentScore > 75) {
                    shift = -5; 
                    contextLabel = "Awkward Tension";
                    trend = 'stagnant';
                } else if (currentScore > 30) {
                    shift = 2 * trustGainDampener;
                    isRomanticContext = true;
                    trend = 'improving';
                } else {
                    shift = -2;
                    contextLabel = "Uncomfortable";
                }
            }
        } 
        
        // --- LOGIKA 4: STANDARD INTERACTION ---
        else {
            if (currentScore > -20) {
                shift = 0.2 * impactMultiplier;
            }
        }
    }

    // Apply Final Shift
    currentScore += shift;
    
    // Safety Clamp Final
    currentScore = Math.max(-100, Math.min(100, currentScore));

    // --- 3. DETERMINE FINAL TIER ---
    const tierList = COMPLEX_TIERS || [];
    
    const applicableTiers = tierList.filter(t => {
        if (t.type === 'Hostile' || t.type === 'Neutral') return true;
        if (isRomanticContext) return t.type === 'Romantic';
        return t.type === 'Platonic';
    });

    // Find specific tier
    let matchedTier = applicableTiers.find(t => 
        currentScore >= t.minScore && currentScore <= t.maxScore
    );

    // Fallback logic
    if (!matchedTier && applicableTiers.length > 0) {
        matchedTier = applicableTiers.sort((a, b) => 
            Math.abs(currentScore - ((a.minScore + a.maxScore)/2)) - Math.abs(currentScore - ((b.minScore + b.maxScore)/2))
        )[0];
    }
    
    // Ultimate fallback
    if (!matchedTier) {
        matchedTier = FALLBACK_TIER;
    }

    // --- 4. FINAL CONTEXT LABEL REFINEMENT ---
    if (currentScore < -80) contextLabel = "Nemesis";
    else if (currentScore < -40) contextLabel = "Hostile";
    else if (currentScore < 0) contextLabel = "Cold";
    else if (isRomanticContext) contextLabel = "Romantic Interest";
    else contextLabel = "Platonic Bond";

    if (pScore < 30) contextLabel += " (Unstable)";

    // Calculate Progress within Tier
    const range = (matchedTier.maxScore || 0) - (matchedTier.minScore || 0);
    const progress = range === 0 ? 100 : ((currentScore - matchedTier.minScore) / range) * 100;

    return {
        score: Math.round(currentScore),
        tier: matchedTier,
        progress: Math.min(100, Math.max(0, progress)),
        trend,
        context: contextLabel
    };
};
