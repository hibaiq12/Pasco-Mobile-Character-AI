
import { OpenRouter } from "@openrouter/sdk";

export const generateOpenRouterResponse = async (
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[]
): Promise<string> => {
  try {
    const cleanKey = apiKey ? apiKey.trim() : "";
    const cleanModel = model ? model.trim() : "mistralai/devstral-2512:free";

    if (!cleanKey) {
        throw new Error("API Key is missing. Please set your OpenRouter API Key in Settings.");
    }

    const openrouter = new OpenRouter({
      apiKey: cleanKey
    });

    try {
        // We stream the response to get reasoning tokens in usage as optimally suggested
        const stream = await openrouter.chat.send({
          httpReferer: typeof window !== 'undefined' ? window.location.origin : "http://localhost",
          appTitle: "Pasco Neural Interface",
          chatRequest: {
            model: cleanModel,
            messages: messages as unknown as { role: 'user' | 'assistant' | 'system'; content: string }[],
            stream: true
          }
        });

        let fullResponse = "";
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            fullResponse += content;
          }

          // Usage information comes in the final chunk
          if (chunk.usage) {
            console.log("\nReasoning tokens (OpenRouter):", chunk.usage.reasoningTokens);
          }
        }

        // Safety check for response structure
        if (!fullResponse) {
             throw new Error("OpenRouter: Empty response received from provider.");
        }
        
        return fullResponse;
    } catch (e: unknown) {
        const errorObj = e as Record<string, any>;
        // Fallback for "Provider returned error" (Often related to streaming unsupported on some upstream providers)
        // Ensure we don't fallback if the status code is 429 (Rate Limit) because it will just hit the rate limit again immediately.
        if (errorObj?.statusCode !== 429 && (errorObj?.message?.includes("Provider returned error") || errorObj?.data$?.error?.message?.includes("Provider returned error"))) {
             console.warn("OpenRouter stream failed with Provider error. Falling back to non-stream request...");
             const fallbackRes = await openrouter.chat.send({
                 httpReferer: typeof window !== 'undefined' ? window.location.origin : "http://localhost",
                 appTitle: "Pasco Neural Interface",
                 chatRequest: {
                     model: cleanModel,
                     messages: messages as unknown as { role: 'user' | 'assistant' | 'system'; content: string }[],
                     stream: false
                 }
             });
             // For non-streaming, openrouter SDK returns the full result, not an EventStream
             return fallbackRes.choices[0]?.message?.content || "";
        }
        throw new Error(`OpenRouter stream failed: ${e instanceof Error ? e.message : 'Unknown'}`, { cause: e });
    }
  } catch (error: unknown) {
    const errorObj = error as Record<string, any>;
    let errMsg = errorObj.message || "Unknown error";
    
    // Attempt to extract a more descriptive message from OpenRouter's metadata if available
    if (errorObj?.body) {
        try {
            const parsed = JSON.parse(errorObj.body as string);
            if (parsed.error?.metadata?.raw) {
                errMsg = parsed.error.metadata.raw; // This often contains rate limit details or upstream provider specifics
            } else if (parsed.error?.message && parsed.error.message !== "Provider returned error") {
                errMsg = parsed.error.message;
            }
        } catch (_) { 
            // ignore
        }
    } else if (errorObj?.data$?.error?.message && errorObj.data$.error.message !== "Provider returned error") {
        errMsg = errorObj.data$.error.message;
    }
    
    // Add status code info if available
    if (errorObj?.statusCode) {
        errMsg = `(HTTP ${errorObj.statusCode}) ${errMsg}`;
    }

    console.error("OpenRouter Fetch Error Full Object:", JSON.stringify(error, Object.getOwnPropertyNames(errorObj), 2));
    throw new Error(`OpenRouter API Error: ${errMsg}`, { cause: error }); // Re-throw to be caught by UI
  }
};
