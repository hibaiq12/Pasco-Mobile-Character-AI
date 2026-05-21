import { getSettings } from "./StorageServices/settings";

export async function generateOllamaResponse(
    model: string,
    messages: { role: string, content: string }[]
): Promise<string> {
    const settings = getSettings();
    const ollamaUrl = settings.ollamaUrl || "http://localhost:11434";
    const ollamaApiKey = settings.ollamaApiKey;

    const requestBody: Record<string, unknown> = {
        model: model,
        messages: messages,
        stream: false,
        options: { temperature: 0.7 }
    };

    // Add web search tool
    requestBody.tools = [
        {
            type: "function",
            function: {
                name: "search_web",
                description: "Perform a web search to find current information, news, or factual answers from the internet.",
                parameters: {
                    type: "object",
                    properties: {
                        query: { type: "string", description: "The search query to look up" },
                    },
                    required: ["query"]
                }
            }
        }
    ];

    try {
        const response = await fetch(`${ollamaUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Ollama API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const message = data.message;

        // Check if the model wants to call a tool
        if (message && message.tool_calls && message.tool_calls.length > 0) {
            messages.push(message as { role: string, content: string }); // Add the assistant's tool call message

            for (const toolCall of message.tool_calls) {
                if (toolCall.function.name === 'search_web') {
                    // Try to execute web search
                    let searchResultStr = "";
                    try {
                        const args = toolCall.function.arguments;
                        const query = args.query || args.q || "";

                        if (ollamaApiKey) {
                            // Use official Ollama Web Search API
                            const searchRes = await fetch("https://ollama.com/api/web_search", {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${ollamaApiKey}`,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ query: query })
                            });
                            
                            if (searchRes.ok) {
                                const searchData = await searchRes.json();
                                searchResultStr = JSON.stringify(searchData.results);
                            } else {
                                searchResultStr = "Web search failed: " + searchRes.statusText;
                            }
                        } else {
                            searchResultStr = "System Error: Cannot perform web search because Ollama Cloud API Key is missing in settings.";
                        }
                    } catch (err: unknown) {
                        searchResultStr = `Search execution failed: ${err instanceof Error ? err.message : String(err)}`;
                    }

                    messages.push({
                        role: "tool",
                        content: searchResultStr,
                        /* name: toolCall.function.name */ // name is not standard in simplified role object, using format
                    });
                }
            }

            // Call Ollama API again with the tool result
            const secondResponse = await fetch(`${ollamaUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: model,
                    messages: messages,
                    stream: false,
                    options: { temperature: 0.7 }
                })
            });

            if (!secondResponse.ok) {
                 throw new Error(`Ollama API Error after tool call: ${secondResponse.status} ${secondResponse.statusText}`);
            }

            const secondData = await secondResponse.json();
            return secondData.message?.content || "";
        }

        return message?.content || "";

    } catch (e: unknown) {
        console.error("Ollama generate response error:", e);
        throw e;
    }
}
