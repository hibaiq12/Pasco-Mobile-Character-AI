
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
    if (!character || !messages) {
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
    
    let currentScore = startParams.score;
    let isRomanticContext = startParams.isRomantic;
    
    // Apply Trust Factor Override (if changed by NeuroCheat)
    const trustFactorStr = (character.socialProfile?.trustFactor || "").toLowerCase();
    if (trustFactorStr.includes('broken')) currentScore -= 30;
    else if (trustFactorStr.includes('blind')) currentScore += 20;
    else if (trustFactorStr.includes('high')) currentScore += 10;
    else if (trustFactorStr.includes('low')) currentScore -= 10;
    
    const pScore = psyche?.score || 50;
    const volatilityMultiplier = pScore < 40 ? 1.5 : (pScore > 80 ? 0.8 : 1.0);
    const trustGainDampener = pScore < 40 ? 0.5 : 1.0; 

    // PROCESS ENTIRE HISTORY STATEFULLY (Max 100 docs to prevent lag)
    const recentMsgs = messages.slice(-100);
    
    let trend: RelationshipState['trend'] = 'stagnant';
    let contextLabel = isRomanticContext ? "Romantic Interest" : (currentScore < 0 ? "Tension" : "Platonic Bond");

    recentMsgs.forEach((msg, index) => {
        if (msg.role === 'user' && msg.text) {
            const text = msg.text.toLowerCase();
            const isRomanceTrigger = ROMANCE_KEYWORDS.some(w => text.includes(w));
            const isHostileTrigger = HOSTILE_KEYWORDS.some(w => text.includes(w));
            
            let shift = 0;
            let impactMultiplier = 1.0;
            if (Math.abs(currentScore) > 80) impactMultiplier = 0.5;

            // MAINTENANCE BOOST (Drift towards positive if not hostile)
            if (currentScore > -20 && !isHostileTrigger && !isRomanceTrigger) {
                shift += 0.1 * impactMultiplier * trustGainDampener; // Reduced from 0.2
            }

            // THE BETRAYAL MECHANIC
            if (isHostileTrigger) {
                if (currentScore > 60) {
                    if (isRomanticContext) {
                        shift -= 60 * volatilityMultiplier; 
                        contextLabel = "Heartbroken / Betrayed";
                        trend = 'volatile';
                        isRomanticContext = false; 
                    } else {
                        shift -= 45 * volatilityMultiplier;
                        contextLabel = "Deeply Hurt";
                        trend = 'deteriorating';
                    }
                } else {
                    shift -= 10 * volatilityMultiplier; // Increased penalty map
                    trend = 'deteriorating';
                }
            } 
            // THE FRIENDZONE FRICTION (High Platonic -> Romance)
            else if (isRomanceTrigger) {
                if (isRomanticContext) {
                    shift += 1.5 * trustGainDampener * impactMultiplier; // Reduced gain
                    trend = 'improving';
                } else {
                    if (currentScore > 80) {
                        shift -= 5; // Rejection friction
                        contextLabel = "Awkward Tension";
                        trend = 'stagnant';
                    } else if (currentScore > 40) { // Increased threshold for romance
                        shift += 1.5 * trustGainDampener;
                        isRomanticContext = true;
                        trend = 'improving';
                    } else {
                        shift -= 3; // Creeped out factor
                        contextLabel = "Uncomfortable (Too Fast)";
                    }
                }
            } else if (!isHostileTrigger) {
                // Good normal responses
                shift += 0.5 * trustGainDampener * impactMultiplier;
            }

            currentScore += shift;
            currentScore = Math.max(-100, Math.min(100, currentScore));
        }
    });

    // DETERMINE FINAL TIER
    const tierList = COMPLEX_TIERS || [];
    
    const applicableTiers = tierList.filter(t => {
        if (t.type === 'Hostile' || t.type === 'Neutral') return true;
        if (isRomanticContext) return t.type === 'Romantic';
        return t.type === 'Platonic';
    });

    let matchedTier = applicableTiers.find(t => 
        currentScore >= t.minScore && currentScore <= t.maxScore
    );

    if (!matchedTier && applicableTiers.length > 0) {
        matchedTier = applicableTiers.sort((a, b) => 
            Math.abs(currentScore - ((a.minScore + a.maxScore)/2)) - Math.abs(currentScore - ((b.minScore + b.maxScore)/2))
        )[0];
    }
    
    if (!matchedTier) matchedTier = FALLBACK_TIER;

    // FINAL CONTEXT LABEL REFINEMENT
    if (currentScore < -80) contextLabel = "Nemesis";
    else if (currentScore < -40) contextLabel = "Hostile";
    else if (currentScore < 0) contextLabel = "Cold";
    else if (isRomanticContext) contextLabel = "Romantic Interest";
    else contextLabel = "Platonic Bond";

    if (pScore < 30) contextLabel += " (Unstable)";
    if (trustFactorStr.includes('broken')) contextLabel += " [Broken Trust]";

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
