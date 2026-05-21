import { OpenRouter } from "@openrouter/sdk";
async function test() {
    const openrouter = new OpenRouter({ apiKey: process.env.OPENROUTER_API_KEY || "sk-or-v1-test" });
    try {
        await openrouter.chat.send({
            chatRequest: {
                model: "mistralai/devstral-2512:free",
                messages: [{ role: "user", content: "hello" }],
                stream: true
            }
        });
        console.log("Success");
    } catch(e) {
        console.error(JSON.stringify(e, Object.getOwnPropertyNames(e), 2));
    }
}
test();
