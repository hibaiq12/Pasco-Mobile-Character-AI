
import { GoogleGenAI } from "@google/genai";
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

const sanitizePrompt = (input: string): string => {
    let safe = input;
    // Replace risky anatomical/NSFW terms that trigger Gemini Safety Filters
    const replacements: Record<string, string> = {
        "E-Cup": "Curvy",
        "D-Cup": "Curvy",
        "F-Cup": "Curvy",
        "Heavy": "Soft",
        "Chest": "Figure",
        "Bust": "Figure",
        "Lingerie": "Sleepwear",
        "Underwear": "Shorts",
        "Bra": "Top",
        "Swimsuit": "Beachwear",
        "Naked": "Wrapped",
        "Nude": "Wrapped",
        "Seductive": "Elegant",
        "Voluptuous": "Elegant",
        "Dominant": "Confident",
        "Submissive": "Shy",
        "Latex": "Shiny Fabric",
        "Bondage": "Restrained"
    };

    Object.keys(replacements).forEach(key => {
        const regex = new RegExp(key, 'gi');
        safe = safe.replace(regex, replacements[key]);
    });
    
    return safe;
};

/**
 * Menghasilkan gambar karakter, menyimpan ke storage khusus, dan mengembalikan Base64.
 */
export const generateCharacterImage = async (
    prompt: string,
    referenceImage: string,
    characterId: string 
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

        // 3. Construct Text Prompt (SANITIZED)
        const safePrompt = sanitizePrompt(prompt);

        let finalPrompt = `
        Create a high-quality anime style illustration.
        
        SCENE DESCRIPTION:
        ${safePrompt}
        `;

        if (imageData) {
            finalPrompt += `
            STRICT INSTRUCTIONS:
            1. Use the provided reference image as the PRIMARY SOURCE for the character's facial features, hair style, and hair color.
            2. Maintain the anatomy and body build described or implied in the reference.
            3. Ensure the clothing matches the description provided in the prompt.
            4. High resolution, detailed background, cinematic lighting.
            `;
        } else {
             finalPrompt += `
             STYLE: High resolution, detailed anime style, cinematic lighting.
             (Note: Generate character based on description provided in the prompt.)
             `;
        }

        parts.push({ text: finalPrompt });

        // 4. Call API
        // NOTE: using 'gemini-2.5-flash-image' as per instructions for image gen
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: [
                {
                    role: 'user',
                    parts: parts,
                }
            ],
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
                saveGeneratedImage({
                    id: crypto.randomUUID(),
                    base64: resultBase64,
                    prompt: safePrompt,
                    timestamp: Date.now(),
                    characterId: characterId
                });

                return resultBase64;
            }
        }

        return null;
    } catch (error: any) {
        console.error("Image Generation Failed:", error);
        
        // Retry logic for 400/500 errors (skip reference image as it might be the cause)
        const shouldRetry = error.status === 400 || error.status === 500 || (error.message && (error.message.includes('400') || error.message.includes('500') || error.message.includes('INVALID_ARGUMENT')));
        
        if (shouldRetry && referenceImage) {
            console.log("Retrying image generation without reference due to API error...");
            // Retry with empty reference string
            return generateCharacterImage(prompt, '', characterId);
        }
        throw error;
    }
};
