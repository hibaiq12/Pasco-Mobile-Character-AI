
import { GoogleGenAI } from "@google/genai";
import { getSettings } from "../../../storageService";
import { getLanguageName, wait } from "./Constants";
import { generateOpenRouterResponse } from "../../../Openrouter";
import { generateOllamaResponse } from "../../../Ollama";
import { generateKoboldResponse } from "../../../Kobold";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateNPCResponse = async (
    npcName: string,
    userMessage: string,
    currentTime?: string,
    currentLocation?: string,
    activeCharacterName?: string, 
    npcDescription?: string
): Promise<string> => {
    const settings = getSettings();
    if (settings.enablePreviewMode) {
        await wait(1000);
        return "Preview Mode: NPC offline.";
    }
    const chatLangName = getLanguageName(settings.chatLanguage || 'id');
    const targetModel = settings.defaultModel || 'gemini-3.1-flash-lite-preview';
    
    const roleInstructions = (npcDescription && npcDescription.trim().length > 0) 
        ? `\n### MINI NEURAL FORGE: CONTACT PERSONA\n**IDENTITY:** "${npcName}"\n**CORE TRAITS & INSTRUCTIONS:**\n${npcDescription}\n**DIRECTIVE:** Adhere to the tone/style above. If 'Gen Z', use slang. If 'Formal', be formal.\n`
        : `**YOUR ROLE:**\nAnalyze your name ("${npcName}") and User's context to determine persona.`;

    const systemPrompt = `
SYSTEM: You are simulating a smartphone text reply from "${npcName}".
${roleInstructions}

**CONTEXT:**
- Time: ${currentTime || 'Unknown'}
- User Location: ${currentLocation || 'Unknown'}
- User Msg: "${userMessage}"

**OUTPUT RULES:**
1. **LANGUAGE:** STRICTLY ${chatLangName}.
2. **FORMAT:** Pure text message. NO Markdown actions. Emojis allowed if persona permits.
3. **LENGTH:** 1-3 sentences maximum.
`;

    // --- HANDLE DIFFERENT MODELS ---
    
    // 1. OPENROUTER
    if (targetModel === 'openrouter-api') {
        if (!settings.openRouterKey) return "API Key Missing.";
        try {
            return await generateOpenRouterResponse(
                settings.openRouterKey,
                settings.openRouterModel || "mistralai/mistral-7b-instruct:free",
                [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMessage }]
            );
        } catch (e) {
            console.error("OpenRouter NPC Error", e);
            return "Gangguan sinyal...";
        }
    }

    // 2. OLLAMA API
    if (targetModel === 'ollama-api') {
        if (!settings.ollamaUrl) return "Ollama URL Missing.";
        try {
            return await generateOllamaResponse(
                settings.ollamaModel || 'llama3.2',
                [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ]
            );
        } catch (e) {
            console.error("Ollama NPC Error", e);
            return "Offline...";
        }
    }

    // 3. KOBOLD AI API
    if (targetModel === 'kobold-api') {
        if (!settings.koboldUrl) return "Kobold URL Missing.";
        try {
            return await generateKoboldResponse(
                settings.koboldModel || 'koboldcpp',
                [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ]
            );
        } catch (e) {
            console.error("Kobold NPC Error", e);
            return "Connection Timed Out...";
        }
    }

    // 3. GEMINI MODELS
    try {
        const response = await ai.models.generateContent({
            model: targetModel, // Use global setting
            contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
            config: { temperature: 0.85, maxOutputTokens: 1500 }
        });
        const text = response.text;
        if (text && text.trim().length > 0) {
            return text.trim().replace(/^"|"$/g, '').replace(/^\[SMS\]:/, '');
        }
    } catch (e) {
        console.warn("NPC Generation warning:", e);
    }
    return "Lagi sibuk, nanti chat lagi.";
};
