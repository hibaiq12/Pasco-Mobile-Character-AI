import { GoogleGenAI, Part } from "@google/genai";
import { getSettings } from "../storageService";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to map codes to full language names
const getLanguageName = (code: string): string => {
    switch (code) {
        case 'id': return 'Bahasa Indonesia';
        case 'jp': return 'Japanese (日本語)';
        case 'es': return 'Spanish (Español)';
        case 'fr': return 'French (Français)';
        case 'de': return 'German (Deutsch)';
        case 'en': default: return 'English';
    }
};

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const analyzeAvatar = async (base64Image: string): Promise<string> => {
    const settings = getSettings();
    const appLangName = getLanguageName(settings.appLanguage || 'en');
    
    // Cleanup base64 header if present
    const cleanBase64 = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;

    if (settings.enablePreviewMode) {
        await wait(1000);
        return "Preview Mode: Avatar analysis unavailable. (AI Offline)";
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
                    { text: `Analyze this character avatar. Describe their physical appearance and suggest a possible personality archetype in 2-3 sentences. Output language: ${appLangName}.` }
                ]
            }
        });
        return response.text || "A mysterious figure.";
    } catch (e) {
        console.error("Avatar analysis failed", e);
        return "Analysis unavailable.";
    }
};

export const generateOutfitConfig = async (input: string, mode: 'text' | 'image'): Promise<{ part: string, desc: string }[]> => {
    try {
        const parts: Part[] = [];
        
        if (mode === 'image') {
            const cleanBase64 = input.includes(',') ? input.split(',')[1] : input;
            parts.push({ inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } });
            parts.push({ text: "Analyze the clothing in this image. Break it down into a list of items (Head, Torso, Legs, Feet, Accessories). Return ONLY a JSON array." });
        } else {
            parts.push({ text: `Analyze this clothing description: "${input}". Break it down into a list of items (Head, Torso, Legs, Feet, Accessories). Return ONLY a JSON array.` });
        }

        const systemPrompt = `
        You are a fashion analyzer AI.
        Your task is to extract outfit details and return a strictly formatted JSON array.
        Output Format:
        [
          { "part": "Category (e.g. Head, Upper Body, Lower Body, Feet)", "desc": "Detailed description of the item" }
        ]
        Rules:
        1. "part" must be short (e.g. Head, Torso, Legs, Feet).
        2. "desc" must be descriptive (e.g. "Red baseball cap", "White silk blouse").
        3. Do NOT wrap in markdown code blocks. Just raw JSON.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: 'user', parts: parts }],
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                temperature: 0.5
            }
        });

        const jsonStr = response.text || "[]";
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("Outfit generation failed", e);
        return [];
    }
};