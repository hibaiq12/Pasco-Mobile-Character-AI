
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
                maxTokens: 350, // Batas atas dari 250-350 token
                tempModifier: -0.1,
                systemInjection: `
[SYSTEM OVERRIDE: CONCISE MODE]
1. **Length Constraint:** Aim for a concise response (around 250-350 tokens).
2. **Content:** PURE DIALOGUE ONLY. ABSOLUTELY DO NOT use asterisks (*) for actions or descriptions. Do not include internal monologues, environment descriptions, or extra story.
3. **Format:** Just speak directly to the user without any narrative formatting. Output dialogue directly without asterisks.
`
            };
            
        case 'short':
            return {
                maxTokens: 500, // Batas atas
                tempModifier: -0.05,
                systemInjection: `
[SYSTEM OVERRIDE: SHORT MODE]
1. **Length Constraint:** Aim for a short response (around 350-500 tokens).
2. **Content:** PURE DIALOGUE ONLY. ABSOLUTELY DO NOT use asterisks (*) for actions or descriptions. Keep it conversational but strictly focused on what is being spoken.
3. **Format:** Just speak directly to the user without any narrative formatting or actions inside asterisks.
`
            };

        case 'long': // Detailed Mode
            return {
                maxTokens: 1440, // Batas atas dari 720-1440 token
                tempModifier: 0.1,
                systemInjection: `
[SYSTEM OVERRIDE: IMMERSIVE/DETAILED MODE]
1. **Length Constraint:** Elaborate extensively. Write a very long and highly detailed response (aim for 720-1440 tokens).
2. **Structure:** You MUST include exhaustive details:
   - **Internal Monologue:** Deeply explore what you are thinking and feeling.
   - **Sensory Details:** Over-describe the atmosphere, sights, sounds, and every minor physical sensation.
   - **Action & Dialogue:** Mix heavy, slow-paced narrative actions using asterisks (*) with dialogue. It is okay if it feels overly long, slow, or even boringly descriptive.
3. **Context:** Expand on every minor detail of the conversation and environment. Provide rich narrative using asterisks.
`
            };

        case 'medium': // Normal Mode
        default:
            return {
                maxTokens: 720, // Batas atas dari 350-720 token
                tempModifier: 0,
                systemInjection: `
[SYSTEM OVERRIDE: NORMAL/BALANCED MODE]
1. **Length Constraint:** Standard conversational length (aim for 350-720 tokens).
2. **Content:** A balanced mix of dialogue and action. MUST use asterisks (*) for actions and physical descriptions.
3. **Context:** Respond naturally. Do not be too brief, but do not over-describe or make it too detailed. Keep the pacing steady and balanced. Incorporate *actions and feelings* seamlessly.
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
