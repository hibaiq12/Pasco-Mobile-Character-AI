
import { GoogleGenAI } from "@google/genai";
import { getSettings } from "../../../storageService";
import { getLanguageName, wait } from "./Constants";
import { SocialPost } from "../../../SmartphoneSocial";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Generate a social media comment or post (Legacy Wrapper)
// Note: Newer implementations should use SocialMediaAlgorithm.ts
export const generateSocialResponse = async (
    personaName: string,
    personaDescription: string,
    postContent: string,
    authorName: string,
    responseType: 'comment' | 'post'
): Promise<string> => {
    const settings = getSettings();
    if (settings.enablePreviewMode) {
        await wait(500);
        return "Nice post! (Preview Mode)";
    }
    
    const chatLangName = getLanguageName(settings.chatLanguage || 'id');
    
    let systemPrompt = "";

    if (responseType === 'comment') {
        systemPrompt = `
        SYSTEM: You are simulating a social media comment from "${personaName}".
        
        **IDENTITY:**
        ${personaDescription}
        
        **CONTEXT:**
        User "${authorName}" posted: "${postContent}"
        
        **TASK:** Write a realistic, short comment reacting to the post.
        **RULES:**
        1. Language: ${chatLangName} (Slang/Casual allowed if persona fits).
        2. Length: Very short (1 sentence or a few words + emoji).
        3. Tone: Match the persona description perfectly.
        `;
    } else {
        systemPrompt = `
        SYSTEM: You are simulating a new social media post from "${personaName}".
        
        **IDENTITY:**
        ${personaDescription}
        
        **TASK:** Write a status update / tweet.
        **RULES:**
        1. Language: ${chatLangName}.
        2. Content: Something relevant to their personality or daily life.
        3. Length: Short tweet style.
        `;
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
            config: { temperature: 0.9, maxOutputTokens: 200 }
        });
        
        let text = response.text || "";
        text = text.replace(/^"|"$/g, '').trim();
        return text;
    } catch (e) {
        console.warn("Social AI Error:", e);
        return responseType === 'comment' ? "Wow!" : "Hello world.";
    }
};

// DEPRECATED: Use generateSocialFeedBatchAI in SocialMediaAlgorithm.ts instead
export const generateSocialFeedBatch = async (
    candidates: any[],
    context?: any
): Promise<Partial<SocialPost>[]> => {
    console.warn("Using deprecated generateSocialFeedBatch. Please switch to SocialMediaAlgorithm.");
    return [];
};
