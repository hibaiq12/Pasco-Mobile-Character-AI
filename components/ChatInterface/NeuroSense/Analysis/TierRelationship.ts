
import { Heart, Skull, User, UserCheck, Users, Network, Sparkles, Gem, Sword, ShieldAlert, Zap, Fingerprint, Ghost, Flame, Crown, Anchor, Star, Link, Smile, Frown, ThumbsDown, Slash, AlertOctagon, EyeOff, Lock, Unlock, Sun, Moon, MessageSquare, Shield, Home, Calendar } from 'lucide-react';

export type RelationType = 'Hostile' | 'Neutral' | 'Platonic' | 'Romantic';

export interface RelationshipTier {
    id: string;
    label: string;
    minScore: number;
    maxScore: number;
    color: string; // Tailwind text class
    barColor: string; // Tailwind bg class
    glowColor: string; // Hex for shadow
    icon: any; // Lucide Icon Component
    type: RelationType;
    description: string;
}

// --- 45 TIERS TOTAL ---
// 10 Hostile | 5 Neutral | 15 Platonic | 15 Romantic

export const COMPLEX_TIERS: RelationshipTier[] = [
    // === NEGATIVE PATH (HOSTILE: -100 to -1) ===
    { 
        id: 'h1', label: "Abyssal Hatred", minScore: -100, maxScore: -91, 
        color: "text-red-950", barColor: "bg-red-950", glowColor: "#450a0a", icon: Skull, type: 'Hostile',
        description: "Pure, unadulterated loathing. You are their sworn enemy."
    },
    { 
        id: 'h2', label: "Nemesis", minScore: -90, maxScore: -81, 
        color: "text-red-800", barColor: "bg-red-900", glowColor: "#7f1d1d", icon: Sword, type: 'Hostile',
        description: "They actively plot your downfall."
    },
    { 
        id: 'h3', label: "Vindictive", minScore: -80, maxScore: -71, 
        color: "text-red-700", barColor: "bg-red-800", glowColor: "#991b1b", icon: Flame, type: 'Hostile',
        description: "Full of vengeance and spite."
    },
    { 
        id: 'h4', label: "Hostile", minScore: -70, maxScore: -61, 
        color: "text-red-600", barColor: "bg-red-700", glowColor: "#dc2626", icon: AlertOctagon, type: 'Hostile',
        description: "Openly aggressive and unfriendly."
    },
    { 
        id: 'h5', label: "Enemy", minScore: -60, maxScore: -51, 
        color: "text-orange-700", barColor: "bg-orange-800", glowColor: "#c2410c", icon: Slash, type: 'Hostile',
        description: "Considers you a threat."
    },
    { 
        id: 'h6', label: "Resentful", minScore: -50, maxScore: -41, 
        color: "text-orange-600", barColor: "bg-orange-700", glowColor: "#ea580c", icon: Frown, type: 'Hostile',
        description: "Holds a deep grudge against you."
    },
    { 
        id: 'h7', label: "Disgusted", minScore: -40, maxScore: -31, 
        color: "text-orange-500", barColor: "bg-orange-600", glowColor: "#f97316", icon: ThumbsDown, type: 'Hostile',
        description: "Physically repulsed by your presence."
    },
    { 
        id: 'h8', label: "Distrustful", minScore: -30, maxScore: -21, 
        color: "text-amber-600", barColor: "bg-amber-700", glowColor: "#d97706", icon: ShieldAlert, type: 'Hostile',
        description: "Suspicious of your every move."
    },
    { 
        id: 'h9', label: "Cold", minScore: -20, maxScore: -11, 
        color: "text-amber-500", barColor: "bg-amber-600", glowColor: "#f59e0b", icon: EyeOff, type: 'Hostile',
        description: "Icy demeanor, short responses."
    },
    { 
        id: 'h10', label: "Unfriendly", minScore: -10, maxScore: -1, 
        color: "text-yellow-600", barColor: "bg-yellow-700", glowColor: "#ca8a04", icon: Lock, type: 'Hostile',
        description: "Not interested in talking."
    },

    // === NEUTRAL PATH (0 to 29) ===
    { 
        id: 'n1', label: "Stranger", minScore: 0, maxScore: 5, 
        color: "text-zinc-500", barColor: "bg-zinc-600", glowColor: "#71717a", icon: User, type: 'Neutral',
        description: "No history, no emotional connection."
    },
    { 
        id: 'n2', label: "Passerby", minScore: 6, maxScore: 11, 
        color: "text-zinc-400", barColor: "bg-zinc-500", glowColor: "#a1a1aa", icon: Ghost, type: 'Neutral',
        description: "Just another face in the crowd."
    },
    { 
        id: 'n3', label: "Acquaintance", minScore: 12, maxScore: 17, 
        color: "text-teal-600", barColor: "bg-teal-700", glowColor: "#0d9488", icon: UserCheck, type: 'Neutral',
        description: "Knows your name, polite but distant."
    },
    { 
        id: 'n4', label: "Casual Contact", minScore: 18, maxScore: 23, 
        color: "text-teal-500", barColor: "bg-teal-600", glowColor: "#14b8a6", icon: MessageSquare, type: 'Neutral',
        description: "Chats occasionally about surface topics."
    },
    { 
        id: 'n5', label: "Friendly Face", minScore: 24, maxScore: 29, 
        color: "text-teal-400", barColor: "bg-teal-500", glowColor: "#2dd4bf", icon: Smile, type: 'Neutral',
        description: "Happy to see you, but no deep bond."
    },

    // === PLATONIC PATH (30 to 100) ===
    { 
        id: 'p1', label: "Buddy", minScore: 30, maxScore: 34, 
        color: "text-emerald-300", barColor: "bg-emerald-400", glowColor: "#6ee7b7", icon: Users, type: 'Platonic',
        description: "Good for hanging out."
    },
    { 
        id: 'p2', label: "Friend", minScore: 35, maxScore: 39, 
        color: "text-emerald-400", barColor: "bg-emerald-500", glowColor: "#34d399", icon: Users, type: 'Platonic',
        description: "A solid friendship foundation."
    },
    { 
        id: 'p3', label: "Good Friend", minScore: 40, maxScore: 44, 
        color: "text-emerald-500", barColor: "bg-emerald-600", glowColor: "#10b981", icon: Users, type: 'Platonic',
        description: "Reliable and fun to be around."
    },
    { 
        id: 'p4', label: "Trusted Ally", minScore: 45, maxScore: 49, 
        color: "text-emerald-600", barColor: "bg-emerald-700", glowColor: "#059669", icon: Shield, type: 'Platonic',
        description: "Has your back in a pinch."
    },
    { 
        id: 'p5', label: "Companion", minScore: 50, maxScore: 54, 
        color: "text-cyan-400", barColor: "bg-cyan-500", glowColor: "#22d3ee", icon: Anchor, type: 'Platonic',
        description: "Comfortable silence is possible."
    },
    { 
        id: 'p6', label: "Close Friend", minScore: 55, maxScore: 59, 
        color: "text-cyan-500", barColor: "bg-cyan-600", glowColor: "#06b6d4", icon: Link, type: 'Platonic',
        description: "Shares personal stories."
    },
    { 
        id: 'p7', label: "Confidant", minScore: 60, maxScore: 64, 
        color: "text-cyan-600", barColor: "bg-cyan-700", glowColor: "#0891b2", icon: Lock, type: 'Platonic',
        description: "Trusts you with secrets."
    },
    { 
        id: 'p8', label: "Best Friend", minScore: 65, maxScore: 69, 
        color: "text-blue-400", barColor: "bg-blue-500", glowColor: "#60a5fa", icon: Star, type: 'Platonic',
        description: "Top priority in their social circle."
    },
    { 
        id: 'p9', label: "Partner in Crime", minScore: 70, maxScore: 74, 
        color: "text-blue-500", barColor: "bg-blue-600", glowColor: "#3b82f6", icon: Zap, type: 'Platonic',
        description: "Inseparable dynamic duo."
    },
    { 
        id: 'p10', label: "Sworn Sibling", minScore: 75, maxScore: 79, 
        color: "text-blue-600", barColor: "bg-blue-700", glowColor: "#2563eb", icon: Fingerprint, type: 'Platonic',
        description: "Family in all but blood."
    },
    { 
        id: 'p11', label: "Family", minScore: 80, maxScore: 84, 
        color: "text-indigo-400", barColor: "bg-indigo-500", glowColor: "#818cf8", icon: Home, type: 'Platonic',
        description: "Unconditional acceptance."
    },
    { 
        id: 'p12', label: "Soul Sibling", minScore: 85, maxScore: 89, 
        color: "text-indigo-500", barColor: "bg-indigo-600", glowColor: "#6366f1", icon: Sun, type: 'Platonic',
        description: "Spiritual resonance."
    },
    { 
        id: 'p13', label: "Kindred Spirit", minScore: 90, maxScore: 94, 
        color: "text-indigo-600", barColor: "bg-indigo-700", glowColor: "#4f46e5", icon: Network, type: 'Platonic',
        description: "Two minds thinking as one."
    },
    { 
        id: 'p14', label: "Platonic Soulmate", minScore: 95, maxScore: 97, 
        color: "text-violet-500", barColor: "bg-violet-600", glowColor: "#8b5cf6", icon: Gem, type: 'Platonic',
        description: "The highest form of friendship."
    },
    { 
        id: 'p15', label: "Unbreakable Bond", minScore: 98, maxScore: 100, 
        color: "text-violet-400", barColor: "bg-violet-500", glowColor: "#a78bfa", icon: Crown, type: 'Platonic',
        description: "A legendary connection transcending time."
    },

    // === ROMANTIC PATH (30 to 100) ===
    { 
        id: 'r1', label: "Interested", minScore: 30, maxScore: 34, 
        color: "text-pink-300", barColor: "bg-pink-400", glowColor: "#f9a8d4", icon: Sparkles, type: 'Romantic',
        description: "Curious about you romantically."
    },
    { 
        id: 'r2', label: "Crush", minScore: 35, maxScore: 39, 
        color: "text-pink-400", barColor: "bg-pink-500", glowColor: "#f472b6", icon: Heart, type: 'Romantic',
        description: "Butterflies in the stomach."
    },
    { 
        id: 'r3', label: "Flirt", minScore: 40, maxScore: 44, 
        color: "text-pink-500", barColor: "bg-pink-600", glowColor: "#ec4899", icon: Zap, type: 'Romantic',
        description: "Playful tension and hints."
    },
    { 
        id: 'r4', label: "Date", minScore: 45, maxScore: 49, 
        color: "text-pink-600", barColor: "bg-pink-700", glowColor: "#db2777", icon: Calendar, type: 'Romantic',
        description: "Testing the waters of romance."
    },
    { 
        id: 'r5', label: "Sweetheart", minScore: 50, maxScore: 54, 
        color: "text-rose-400", barColor: "bg-rose-500", glowColor: "#fb7185", icon: Heart, type: 'Romantic',
        description: "Early relationship warmth."
    },
    { 
        id: 'r6', label: "Partner", minScore: 55, maxScore: 59, 
        color: "text-rose-500", barColor: "bg-rose-600", glowColor: "#f43f5e", icon: UserCheck, type: 'Romantic',
        description: "Committed and steady."
    },
    { 
        id: 'r7', label: "Lover", minScore: 60, maxScore: 64, 
        color: "text-rose-600", barColor: "bg-rose-700", glowColor: "#e11d48", icon: Flame, type: 'Romantic',
        description: "Deep passion and intimacy."
    },
    { 
        id: 'r8', label: "Intimate", minScore: 65, maxScore: 69, 
        color: "text-red-500", barColor: "bg-red-600", glowColor: "#ef4444", icon: Unlock, type: 'Romantic',
        description: "Sharing deepest vulnerabilities."
    },
    { 
        id: 'r9', label: "Devoted", minScore: 70, maxScore: 74, 
        color: "text-red-600", barColor: "bg-red-700", glowColor: "#dc2626", icon: Shield, type: 'Romantic',
        description: "Loyalty above all else."
    },
    { 
        id: 'r10', label: "Deeply In Love", minScore: 75, maxScore: 79, 
        color: "text-fuchsia-400", barColor: "bg-fuchsia-500", glowColor: "#e879f9", icon: Heart, type: 'Romantic',
        description: "Consumed by affection."
    },
    { 
        id: 'r11', label: "Life Partner", minScore: 80, maxScore: 84, 
        color: "text-fuchsia-500", barColor: "bg-fuchsia-600", glowColor: "#d946ef", icon: Home, type: 'Romantic',
        description: "Building a future together."
    },
    { 
        id: 'r12', label: "Soulmate", minScore: 85, maxScore: 89, 
        color: "text-fuchsia-600", barColor: "bg-fuchsia-700", glowColor: "#c026d3", icon: Network, type: 'Romantic',
        description: "Destined connection."
    },
    { 
        id: 'r13', label: "True Love", minScore: 90, maxScore: 94, 
        color: "text-purple-500", barColor: "bg-purple-600", glowColor: "#a855f7", icon: Star, type: 'Romantic',
        description: "Pure, unwavering love."
    },
    { 
        id: 'r14', label: "Eternal Vow", minScore: 95, maxScore: 97, 
        color: "text-purple-600", barColor: "bg-purple-700", glowColor: "#9333ea", icon: Gem, type: 'Romantic',
        description: "A bond beyond lifetimes."
    },
    { 
        id: 'r15', label: "Twin Flames", minScore: 98, maxScore: 100, 
        color: "text-violet-500", barColor: "bg-violet-600", glowColor: "#8b5cf6", icon: Moon, type: 'Romantic',
        description: "Two halves of the same soul."
    }
];
