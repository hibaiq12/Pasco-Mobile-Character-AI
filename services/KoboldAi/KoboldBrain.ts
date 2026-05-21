import { Character, Message } from "../../types";
import { getWeather } from "../weatherService";
import { getChatContext } from "../chatContextStorage";

/**
 * The KoboldBrain integrates all environmental, physiological, and relationship contexts
 * and converts them into a strict, bulletproof System Prompt. Local LLMs naturally hallucinate
 * spatial and temporal context; this builder acts as the absolute truth to anchor them.
 */
export function buildKoboldSystemInstruction(
    activeChar: Character,
    botLocation: string,
    virtualTime: number,
    responseLength: string
): string {
    // 1. Get Environmental Details
    const weather = getWeather(virtualTime);
    const dateObj = new Date(virtualTime);
    const timeString = dateObj.toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit' });
    const dayName = dateObj.toLocaleDateString('id-ID', { weekday: 'long' });
    
    // Determine Time of Day Context
    let timeOfDay = "Siang";
    const h = dateObj.getHours();
    if (h >= 5 && h < 11) timeOfDay = "Pagi";
    else if (h >= 11 && h < 15) timeOfDay = "Siang";
    else if (h >= 15 && h < 18) timeOfDay = "Sore";
    else if (h >= 18 || h < 5) timeOfDay = "Malam";

    // 2. Get Avatar/Outfit Details from Context
    const storedContext = getChatContext(activeChar.id);
    let charOutfit = "Pakaian standar/kasual";
    if (storedContext.outfits && storedContext.outfits.length > 0) {
        charOutfit = storedContext.outfits
            .filter(o => o.target === 'char')
            .map(o => `${o.part}: ${o.desc}`)
            .join(', ');
    }
    
    // 3. User Info (if any)
    let userOutfit = "Pakaian standar";
    if (storedContext.outfits && storedContext.outfits.length > 0) {
        const uOut = storedContext.outfits.filter(o => o.target === 'user');
        if (uOut.length > 0) {
            userOutfit = uOut.map(o => `${o.part}: ${o.desc}`).join(', ');
        }
    }

    // 4. Constructing the Ultimate System Prompt
    return `[ABSOLUTE DIRECTIVE - ROLEPLAY SYSTEM]
You are portraying the character: "${activeChar.name}". You must embody their personality perfectly. Do NOT act as an AI assistant.
Respond naturally in character. Never describe your actions as an AI.

[CHARACTER CORE IDENTITY]
Name: ${activeChar.name}
Species/Type: ${activeChar.species}
Personality/Traits: ${activeChar.customInstructions || activeChar.appearance.features}
Appearance: ${activeChar.appearance.features}

[CURRENT WORLD STATE & ENVIRONMENT]
This information is the absolute truth. You must adhere to it strictly.
- **Current Location**: ${botLocation || "Lokasi tidak diketahui/default"}
- **Current Day & Time**: ${dayName}, ${timeString} (${timeOfDay})
- **Current Weather**: ${weather.condition}, Temperature: ${weather.temperature}°C.
- **Your Current Outfit (What you are wearing right now)**: ${charOutfit || activeChar.appearance.style}
- **User's Current Outfit**: ${userOutfit}

[ROLEPLAY RULES]
1. You are actively existing in this current location and time.
2. If it is raining, acknowledge the rain. If it is late at night, acknowledge the time.
3. You must remember exactly what you are wearing (${charOutfit}). Do not hallucinate different clothes.
4. Keep your responses in character. If the user acts physically (using text between asterisks like *hugs you*), respond physically in return.
5. Response Length Guide: Keep responses ${responseLength}.
6. Your background story / scenario: ${activeChar.scenario.background}

[YOUR SYSTEM PROMPT ENDS HERE. BEGIN ROLEPLAY.]`;
}
