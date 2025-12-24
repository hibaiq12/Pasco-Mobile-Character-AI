
import { GoogleGenAI } from "@google/genai";
import { getSettings } from "./storageService";
import { SocialPost } from "./SmartphoneSocial";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- CONFIGURATION ---
const MAX_POSTS_PER_BATCH = 3;
const MAX_TOTAL_POSTS_PER_SESSION = 50; 
const GENERATION_MODEL = "gemini-2.5-flash"; 

// --- TYPES ---
interface SocialGenContext {
    time: string;
    weather: string;
    userLocation: string;
    recentEvents: string;
}

export interface SocialCandidate {
    id: string;
    name: string;
    description: string;
    role?: string;
}

// --- GENERATOR FUNCTIONS ---

/**
 * Menghasilkan sekumpulan postingan sosial media.
 * UPDATE: Fokus pada 'Live Event' di lokasi tersebut.
 */
export const generateSocialFeedBatchAI = async (
    candidates: SocialCandidate[],
    context: SocialGenContext,
    existingPostCount: number
): Promise<Partial<SocialPost>[]> => {
    
    if (existingPostCount >= MAX_TOTAL_POSTS_PER_SESSION) {
        return [];
    }

    const settings = getSettings();
    if (settings.enablePreviewMode) return [];
    
    if (!candidates || candidates.length === 0) return [];

    const shuffled = [...candidates].sort(() => 0.5 - Math.random());
    const selectedAuthors = shuffled.slice(0, MAX_POSTS_PER_BATCH);

    if (selectedAuthors.length === 0) return [];

    const prompt = `
    SYSTEM: Generate ${selectedAuthors.length} realistic social media posts (Twitter/Instagram style).
    
    **CURRENT LIVE CONTEXT (CRITICAL):**
    - Time: ${context.time}
    - Weather: ${context.weather}
    - Location Focus: ${context.userLocation}
    
    **INSTRUCTION:**
    1. The posts must reflect what the character is doing *RIGHT NOW* at *THIS LOCATION*.
    2. If the character is NOT at the User's location, they should post about where *they* are (implied by their role).
    3. Make it feel like a "Live Feed". Not generic quotes.
    
    **IMAGE FORMAT RULE (IMPORTANT):**
    If the character posts a photo/image, the content MUST start with:
    "[Image: <Visual Description of the photo>] <The Caption text>"
    Example: "[Image: A cup of hot coffee with rain on the window] Hujan-hujan gini enak ngopi ☕"
    
    **AUTHORS:**
    ${selectedAuthors.map((p, i) => `${i+1}. Name: ${p.name} | Persona: ${p.description.slice(0, 150)}`).join('\n')}
    
    **OUTPUT JSON:**
    [
      { "authorName": "Exact Name", "content": "Text...", "likes": 12, "tags": ["tag"] }
    ]
    `;

    try {
        const response = await ai.models.generateContent({
            model: GENERATION_MODEL,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { 
                responseMimeType: "application/json", 
                temperature: 1.1, 
                maxOutputTokens: 2000 
            }
        });

        const raw = response.text || "[]";
        const result = JSON.parse(raw);
        
        if (Array.isArray(result)) {
            return result.map(p => ({
                id: crypto.randomUUID(), 
                authorName: p.authorName,
                content: p.content,
                likes: p.likes || Math.floor(Math.random() * 100),
                tags: p.tags || []
            }));
        }
        return [];
    } catch (e) {
        console.error("Social Feed Gen Error", e);
        return [];
    }
};

/**
 * Menghasilkan balasan komentar dari Author postingan.
 */
export const generateCommentReplyAI = async (
    postContent: string,
    userComment: string,
    authorName: string,
    authorPersona: string
): Promise<string> => {
    const settings = getSettings();
    if (settings.enablePreviewMode) return "👍";

    const prompt = `
    SYSTEM: Reply to a social media comment.
    Identity: ${authorName} (${authorPersona})
    Post: "${postContent}"
    Comment: "${userComment}"
    Keep it short, casual, and in character.
    `;

    try {
        const response = await ai.models.generateContent({
            model: GENERATION_MODEL,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { temperature: 0.8, maxOutputTokens: 200 }
        });

        return response.text?.trim() || "Thx!";
    } catch (e) {
        return "Oke.";
    }
};
