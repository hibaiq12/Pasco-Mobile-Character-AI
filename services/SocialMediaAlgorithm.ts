
import { GoogleGenAI } from "@google/genai";
import { getSettings } from "./storageService";
import { SocialPost } from "./SmartphoneSocial";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- CONFIGURATION ---
const MAX_POSTS_PER_BATCH = 3;
const MAX_TOTAL_POSTS_PER_SESSION = 50; 
const GENERATION_MODEL = "gemini-3.1-flash-lite-preview"; 

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
 * Targeted AI post generation for a specific character.
 */
export const generateCharacterPostAI = async (
    candidate: SocialCandidate,
    context: SocialGenContext,
    attachment: 'none' | '16:9' | '9:16' | 'selfie'
): Promise<Partial<SocialPost>> => {
    
    const settings = getSettings();
    if (settings.enablePreviewMode) {
        return {
            content: "Preview Mode: AI Post Generation is disabled.",
            likes: 0
        };
    }

    let imageInstruction = "";
    if (attachment === 'selfie') {
        imageInstruction = `
        **IMAGE RULE (SELFIE):**
        The character IS taking a selfie.
        Describe: Body pose, face expression, clothes, time of day, weather, and background.
        Example format: "[Image: Selfie of Me wearing a school uniform, smiling brightly with cherry blossoms behind me] Good morning!"
        `;
    } else if (attachment !== 'none') {
        imageInstruction = `
        **IMAGE RULE (RESOLUTION ${attachment}):**
        The character took a photo of their surroundings or something interesting.
        Describe the scene vividly.
        Example format: "[Image: A view of the city skyline at night with neon lights] The city never sleeps."
        `;
    }

    const prompt = `
    SYSTEM: Generate a single realistic social media post (Twitter style) for the character.
    
    **CURRENT LIVE CONTEXT:**
    - Time: ${context.time}
    - Weather: ${context.weather}
    - Location: ${context.userLocation}
    
    **CHARACTER:**
    Name: ${candidate.name}
    Persona: ${candidate.description.slice(0, 500)}
    
    ${imageInstruction}
    
    **INSTRUCTION:**
    1. The post must reflect what the character is doing right now.
    2. Keep it human, casual, and in-character.
    
    **OUTPUT JSON:**
    { "content": "Text...", "tags": ["tag"], "likes": 5 }
    `;

    try {
        const response = await ai.models.generateContent({
            model: GENERATION_MODEL,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { 
                responseMimeType: "application/json", 
                temperature: 1.0, 
                maxOutputTokens: 1000 
            }
        });

        const result = JSON.parse(response.text || "{}");
        
        return {
            id: crypto.randomUUID(), 
            authorName: candidate.name,
            content: result.content || "...",
            likes: result.likes || 0,
            tags: result.tags || []
        };
    } catch (e) {
        console.error("Individual Post Gen Error", e);
        return { content: "...", likes: 0 };
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
