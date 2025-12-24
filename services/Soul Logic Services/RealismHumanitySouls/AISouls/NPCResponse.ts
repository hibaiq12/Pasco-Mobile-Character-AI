import { GoogleGenAI } from "@google/genai";
import { getSettings } from "../../../storageService";
import { getLanguageName, wait } from "./Constants";

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
    
    let roleInstructions = "";
    if (npcDescription && npcDescription.trim().length > 0) {
        roleInstructions = `
### MINI NEURAL FORGE: CONTACT PERSONA
**IDENTITY:** "${npcName}"
**CORE TRAITS & INSTRUCTIONS:**
${npcDescription}
**DIRECTIVE:** Adhere to the tone/style above. If 'Gen Z', use slang. If 'Formal', be formal.
`;
    } else {
        roleInstructions = `**YOUR ROLE:**\nAnalyze your name ("${npcName}") and User's context to determine persona.`;
    }

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

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
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