
export const generateOpenRouterResponse = async (
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[]
): Promise<string> => {
  try {
    const cleanKey = apiKey ? apiKey.trim() : "";
    // Changed default to Gemini 2.0 Flash Lite Free as it has better availability than Mistral 7B Free
    const cleanModel = model ? model.trim() : "google/gemini-2.0-flash-lite-preview-02-05:free";

    if (!cleanKey) {
        throw new Error("API Key is missing or empty");
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${cleanKey}`,
        "HTTP-Referer": typeof window !== 'undefined' ? window.location.origin : "http://localhost",
        "X-Title": "Pasco Neural Interface",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": cleanModel,
        "messages": messages,
        // Optional: Some providers might behave better with this, but it's not standard for policy 404s
        // "provider": { "allow_fallbacks": true } 
      })
    });

    if (!response.ok) {
        let errorText = await response.text();
        try {
            // Try to parse JSON error message from OpenRouter if available
            const errJson = JSON.parse(errorText);
            if (errJson.error && errJson.error.message) {
                errorText = errJson.error.message;
            }
        } catch (e) {
            // Ignore JSON parse error, use raw text
        }
        
        // Truncate very long HTML error pages
        const displayError = errorText.length > 150 ? errorText.substring(0, 150) + "..." : errorText;
        throw new Error(`OpenRouter ${response.status}: ${displayError}`);
    }

    const data = await response.json();
    
    // Safety check for response structure
    if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
         throw new Error("OpenRouter: Empty response received");
    }
    
    return data.choices[0].message.content || "";
  } catch (error: any) {
    console.error("OpenRouter Fetch Error:", error);
    throw error; // Re-throw to be caught by UI
  }
};
