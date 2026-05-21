import { getSettings } from "./StorageServices/settings";

/**
 * Generates a response using Kobold AI via our backend proxy to avoid CORS issues.
 */
export async function generateKoboldResponse(
    model: string,
    messages: { role: string, content: string }[]
): Promise<string> {
    const settings = getSettings();
    const koboldUrl = settings.koboldUrl || "";
    
    if (!koboldUrl) {
        throw new Error("Kobold URL is missing. Please check your settings.");
    }

    if (!koboldUrl.startsWith('https://')) {
        throw new Error("Invalid Kobold URL. Please make sure it starts with 'https://' (example: https://xxxxx.trycloudflare.com)");
    }

    // Clean URL
    const baseUrl = koboldUrl.replace(/\/$/, "");

    // Prepare prompt for native fallback
    const prompt = messages.map(m => `${m.role === 'user' ? '### Instruction:\n' : '### Response:\n'}${m.content}`).join('\n\n') + "\n\n### Response:\n";

    try {
        // Try OpenAI-compatible endpoint FIRST via proxy
        console.log("[Kobold] Attempting OpenAI-compatible endpoint via proxy...");
        const response = await fetch('/api/kobold-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: `${baseUrl}/v1/chat/completions`,
                data: {
                    model: model || "koboldcpp",
                    messages: messages,
                    max_tokens: settings.maxOutputTokens || 1024,
                    temperature: settings.defaultTemperature || 0.7
                }
            })
        });

        if (response.ok) {
            const data = await response.json();
            return data.choices?.[0]?.message?.content || "No response content.";
        }

        // FALLBACK: Try Native Kobold API via proxy
        console.warn("[Kobold] OpenAI endpoint failed/unavailable, falling back to Native API via proxy...");
        const nativeResponse = await fetch('/api/kobold-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: `${baseUrl}/api/v1/generate`,
                data: {
                    prompt: prompt,
                    max_context_length: 2048,
                    max_length: settings.maxOutputTokens || 1024,
                    temperature: settings.defaultTemperature || 0.7,
                    stop_sequence: ["### Instruction:", "### User:", "<|end|>"]
                }
            })
        });

        if (!nativeResponse.ok) {
            const errData = await nativeResponse.json();
            throw new Error(errData.error || `Kobold API Error: ${nativeResponse.status}`);
        }

        const nativeData = await nativeResponse.json();
        return nativeData.results?.[0]?.text || "No response received.";

    } catch (error: any) {
        console.error("Kobold AI Error:", error);
        throw error;
    }
}
