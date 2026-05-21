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
            model: 'gemini-3.1-flash-lite-preview',
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
        const settings = getSettings();
        const activeModel = settings.defaultModel;
        
        const systemPrompt = `
        You are a detailed fashion designer AI.
        Your task is to extract or design outfit details and return a strictly formatted JSON array.
        Output Format:
        [
          { "part": "Top", "desc": "Specific details for just the top" }
        ]
        Rules:
        1. "part" must be categorical (Headwear, Top, Bottom, Footwear, Accessories).
        2. "desc" MUST be evocative, aesthetic, and descriptive enough to visualize the item's texture, color, cut, and fit (e.g., "Faded vintage denim jacket with frayed collar").
        3. DO NOT just copy the user's general text. Interpret the text and create a cohesive, detailed wardrobe design out of it.
        4. "desc" MUST NOT describe the ENTIRE ensemble as a whole or use words like "overall appearance". Each item must strictly describe ONLY that specific component.
        5. Provide a balance: Keep it richly descriptive to enhance visual grounding, but tightly focused on the actual garment elements so it serves as a robust image generation prompt modifier.
        6. DO NOT wrap in markdown code blocks. Return ONLY a valid JSON array of objects.
        `;

        let jsonStr = "[]";
        // Convert Base64 if needed
        const cleanBase64 = input.includes(',') ? input.split(',')[1] : input;

        // --- 1. OLLAMA API ---
        if (activeModel === 'ollama-api') {
            const endpoint = settings.ollamaUrl || "http://localhost:11434";
            // LLaVA is a vision model for Ollama, llama3.2 is text only (though llama3.2-vision exists)
            const ollModel = mode === 'image' ? 'llava' : (settings.ollamaModel || 'llama3.2');
            
            const messages: { role: string, content: string | any[], images?: string[] }[] = [
                { role: 'system', content: systemPrompt }
            ];

            if (mode === 'image') {
                messages.push({
                    role: 'user',
                    content: "Analyze the clothing in this image. Break it down into a list of items (Head, Torso, Legs, Feet). Return ONLY a JSON array.",
                    images: [cleanBase64]
                });
            } else {
                messages.push({
                    role: 'user',
                    content: `Analyze this clothing description or concept: "${input}". Break it down into a detailed list of items. Return ONLY a JSON array.`
                });
            }

            const response = await fetch(`${endpoint}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: ollModel,
                    messages: messages,
                    stream: false,
                    options: { temperature: 0.5 }
                })
            });
            if (!response.ok) throw new Error("Ollama generation failed");
            const data = await response.json();
            jsonStr = data.message?.content || "[]";
        } 
        
        // --- 2. OPENROUTER API ---
        else if (activeModel === 'openrouter-api') {
            if (!settings.openRouterKey) throw new Error("Missing OpenRouter Key");
            
            const messages: { role: string, content: string | any[] }[] = [
                { role: 'system', content: systemPrompt }
            ];

            if (mode === 'image') {
                messages.push({
                    role: 'user',
                    content: [
                        { type: "text", text: "Analyze the clothing in this image. Break it down into a list of items (Head, Torso, Legs, Feet). Return ONLY a JSON array." },
                        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${cleanBase64}` } }
                    ]
                });
            } else {
                messages.push({
                    role: 'user',
                    content: `Analyze this clothing description or concept: "${input}". Break it down into a detailed list of items. Return ONLY a JSON array.`
                });
            }

            // Force a reliable fast vision model for OpenRouter if using image mode, otherwise use user's selected text model
            const targetModel = mode === 'image' ? "google/gemini-2.0-flash-lite-preview-02-05:free" : (settings.openRouterModel || "google/gemini-2.0-flash-lite-preview-02-05:free");

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${settings.openRouterKey}`,
                    'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
                },
                body: JSON.stringify({
                    model: targetModel,
                    messages: messages,
                    temperature: 0.5
                })
            });
            
            if (!response.ok) {
                const errText = await response.text();
                console.error("OpenRouter Error Info:", errText);
                throw new Error(`OpenRouter generation failed: ${response.status} - ${errText}`);
            }
            
            const data = await response.json();
            jsonStr = data.choices?.[0]?.message?.content || "[]";
        }
        
        // --- 3. GEMINI API (DEFAULT) ---
        else {
            const parts: Part[] = [];
            if (mode === 'image') {
                parts.push({ inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } });
                parts.push({ text: "Analyze the clothing in this image. Break it down into a list of items (Head, Torso, Legs, Feet, Accessories). Return ONLY a JSON array." });
            } else {
                parts.push({ text: `Analyze this clothing description: "${input}". Break it down into a list of items (Head, Torso, Legs, Feet, Accessories). Return ONLY a JSON array.` });
            }

            const response = await ai.models.generateContent({
                model: "gemini-3.1-flash-lite-preview",
                contents: [{ role: 'user', parts: parts }],
                config: {
                    systemInstruction: systemPrompt,
                    responseMimeType: "application/json",
                    temperature: 0.5
                }
            });
            jsonStr = response.text || "[]";
        }

        // Clean up jsonStr in case models returned markdown ticks anyway
        jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("Outfit generation failed", e);
        return [];
    }
};