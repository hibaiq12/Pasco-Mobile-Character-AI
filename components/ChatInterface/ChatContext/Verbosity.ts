
/**
 * Verbosity.ts
 * 
 * Algoritma pengontrol kedalaman dan panjang respon AI (Verbosity Control Engine).
 * File ini mengatur instruksi sistem tambahan untuk memastikan AI tetap pada konteks
 * namun menyesuaikan output berdasarkan preferensi pengguna (Concise, Normal, Detailed).
 */

export type VerbosityLevel = 'concise' | 'short' | 'medium' | 'long';

interface VerbosityProfile {
    /** Instruksi spesifik yang akan disuntikkan ke System Prompt */
    systemInjection: string;
    /** Estimasi token maksimum untuk membatasi output secara hard-limit */
    maxTokens: number;
    /** Modifier suhu (opsional) untuk menyesuaikan kreativitas */
    tempModifier: number;
}

/**
 * Mendapatkan konfigurasi verbosity berdasarkan level yang dipilih.
 * 
 * @param level - Level verbosity ('concise' | 'short' | 'long')
 * @returns Object berisi instruksi prompt dan konfigurasi teknis.
 */
export const getVerbosityProfile = (level: VerbosityLevel): VerbosityProfile => {
    switch (level) {
        case 'concise':
            return {
                maxTokens: 150, // Sangat ketat (~2-3 kalimat)
                tempModifier: -0.1, // Sedikit lebih kaku/fokus
                systemInjection: `
[SYSTEM OVERRIDE: CONCISE MODE]
1. **Length Constraint:** You MUST reply in 1-3 sentences maximum.
2. **Content:** Cut all filler. No internal monologues. No descriptions of the environment unless critical.
3. **Format:** Focus purely on Action and Dialogue.
4. **Context:** Keep the core meaning intact but strip all decorative language. Be direct and fast-paced.
`
            };

        case 'long': // Detailed Mode
            return {
                maxTokens: 1024, // Memberikan ruang untuk deskripsi panjang
                tempModifier: 0.1, // Sedikit lebih kreatif/deskriptif
                systemInjection: `
[SYSTEM OVERRIDE: IMMERSIVE/DETAILED MODE]
1. **Length Constraint:** Elaborate fully. Minimum 4-5 sentences.
2. **Structure:** You MUST include:
   - **Internal Monologue:** Show what you are thinking/feeling inside (use *italic* or specific formatting).
   - **Sensory Details:** Describe the atmosphere, sights, sounds, or physical sensations.
   - **Action & Dialogue:** React physically to the user before speaking.
3. **Context:** Expand on the conversation topics deeply. Do not just answer; reflect and engage.
`
            };

        case 'short': // Normal Mode
        case 'medium': // Fallback for legacy
        default:
            return {
                maxTokens: 500,
                tempModifier: 0,
                systemInjection: `
[SYSTEM OVERRIDE: BALANCED MODE]
1. **Length Constraint:** Standard conversational length (2-4 sentences).
2. **Content:** Balance dialogue with brief actions.
3. **Context:** Respond naturally like a human chatting. Do not be too brief, but do not write a novel.
`
            };
    }
};

/**
 * Helper untuk menggabungkan instruksi dasar dengan instruksi verbosity.
 * Memastikan konteks karakter tidak tertimpa oleh aturan panjang.
 */
export const applyVerbosityToPrompt = (
    baseSystemInstruction: string, 
    level: VerbosityLevel
): string => {
    const profile = getVerbosityProfile(level);
    
    return `
${baseSystemInstruction}

---
### RESPONSE CONFIGURATION: ${level.toUpperCase()}
${profile.systemInjection}
---
    `.trim();
};
