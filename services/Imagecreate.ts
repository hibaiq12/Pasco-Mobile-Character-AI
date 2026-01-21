import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { saveGeneratedImage } from "./ImageCreatedService";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

async function urlToBase64(url: string): Promise<{ base64: string, mimeType: string } | null> {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch image');
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                // Ensure result is valid data URL
                if (!result.includes(',')) {
                    reject(new Error("Invalid base64 conversion"));
                    return;
                }
                const base64 = result.split(',')[1];
                const mimeType = result.match(/:(.*?);/)?.[1] || 'image/jpeg';
                resolve({ base64, mimeType });
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.warn("CORS/Net Error converting Avatar URL.", error);
        return null;
    }
}

/**
 * Memvalidasi apakah gambar mengandung wajah yang jelas.
 */
export const validateFaceInImage = async (base64Image: string): Promise<boolean> => {
    try {
        const cleanBase64 = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                {
                    role: 'user',
                    parts: [
                        { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
                        { text: "Analyze this image. Does it contain a clearly visible human or anime character FACE? Answer with strictly 'YES' or 'NO'." }
                    ]
                }
            ],
            config: {
                temperature: 0,
                maxOutputTokens: 10
            }
        });

        const text = response.text?.trim().toUpperCase() || "";
        return text.includes("YES");
    } catch (e) {
        console.error("Face validation failed", e);
        return false; // Fail safe
    }
};

/**
 * Menghasilkan gambar karakter, menyimpan ke storage khusus, dan mengembalikan Base64.
 */
export const generateCharacterImage = async (
    prompt: string,
    referenceImage: string,
    characterId: string // Added to link image to character
): Promise<string | null> => {
    try {
        let imageData: { base64: string, mimeType: string } | null = null;

        // 1. Resolve Image Data (URL to Base64)
        if (referenceImage) {
            if (referenceImage.startsWith('http')) {
                imageData = await urlToBase64(referenceImage);
            } else if (referenceImage.startsWith('data:')) {
                const mimeType = referenceImage.match(/:(.*?);/)?.[1] || 'image/jpeg';
                const base64 = referenceImage.split(',')[1];
                imageData = { base64, mimeType };
            }
        }

        const parts: any[] = [];
        
        // 2. Add Image Part (if valid base64 extracted)
        if (imageData) {
            parts.push({ 
                inlineData: { 
                    mimeType: imageData.mimeType, 
                    data: imageData.base64 
                } 
            });
        }

        // 3. Construct Text Prompt with Maximized Dialogue Context
        let finalPrompt = `
        Create a high-quality, cinematic anime style illustration (16:9 Wide Ratio).
        
        SCENE & DIALOGUE CONTEXT:
        ${prompt}
        
        VISUALIZATION RULES:
        1. Capture the exact emotion, mood, and action described in the dialogue context above.
        2. If the dialogue suggests intimacy, anger, or sadness, reflect it vividly in the character's expression and lighting.
        3. Make it look like a scene from a high-budget anime movie.
        `;

        if (imageData) {
            finalPrompt += `
            STRICT CONSISTENCY:
            1. Use the provided reference image as the PRIMARY SOURCE for the character's facial features, hair style, and hair color.
            2. Maintain the anatomy and body build described or implied in the reference.
            3. Ensure the clothing matches the description provided in the prompt.
            `;
        }

        parts.push({ text: finalPrompt });

        // 4. Call API with 16:9 Ratio and Disabled Safety Filters (Realism Mode)
        // Using Enums for Safety Settings
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: [
                {
                    role: 'user',
                    parts: parts,
                }
            ],
            config: {
                imageConfig: {
                    aspectRatio: "16:9" // Enforce 16:9 Aspect Ratio
                },
                // Realism Mode: Disable Safety Filters to allow raw/unfiltered visuals appropriate for the chat context
                safetySettings: [
                    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                ]
            }
        });

        // 5. Parse Response Safely
        const candidate = response.candidates?.[0];
        
        if (!candidate) return null;

        const contentParts = candidate.content?.parts;
        if (!contentParts) return null;

        for (const part of contentParts) {
            if (part.inlineData && part.inlineData.data) {
                const resultBase64 = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                
                // --- SAVE TO DEDICATED STORAGE ---
                // We use dedicated storage for images to avoid clogging the main session storage.
                saveGeneratedImage({
                    id: crypto.randomUUID(),
                    base64: resultBase64,
                    prompt: prompt,
                    timestamp: Date.now(),
                    characterId: characterId
                });

                return resultBase64;
            }
        }

        return null;
    } catch (error: any) {
        console.error("Image Generation Failed:", error);
        
        // Retry logic for 400 errors (skip reference image if it caused issues)
        const errorMsg = error.message || JSON.stringify(error);
        const is400 = error.status === 400 || errorMsg.includes('400') || errorMsg.includes('INVALID_ARGUMENT');
        
        if (is400 && referenceImage) {
            console.log("Retrying image generation without reference due to API error...");
            return generateCharacterImage(prompt, '', characterId);
        }
        throw error;
    }
};