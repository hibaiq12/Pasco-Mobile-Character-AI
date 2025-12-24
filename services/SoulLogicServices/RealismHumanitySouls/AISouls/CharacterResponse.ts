
import { GoogleGenAI, Content, Part, GenerateContentResponse } from "@google/genai";
import { Message } from "../../../../types";
import { getSettings } from "../../../storageService";
import { t } from "../../../translationService";
import { getLanguageName, NSFW_KEYWORDS, wait } from "./Constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCharacterResponse = async (
  modelName: string,
  systemInstruction: string,
  history: Message[],
  newMessage: string,
  image?: string, // Base64
  temperature: number = 0.7,
  maxOutputTokens?: number,
  currentTime?: string,
  currentLocation?: string,
  responseLength: 'concise' | 'short' | 'medium' | 'long' = 'concise',
  vocabularyLevel?: 'simple' | 'average' | 'academic',
  communicationMode: 'normal' | 'smartphone' = 'normal',
  currentWeather?: string,
  isUserNearButTexting: boolean = false // NEW: Proximity flag
): Promise<string> => {

  const settings = getSettings();
  if (settings.enablePreviewMode) {
      await wait(1000); 
      const msg = t('dev.preview_msg');
      return msg.replace('{{time}}', currentTime || 'Unknown');
  }
  
  const contents: Content[] = history.map(msg => {
    const parts: Part[] = [];
    if (msg.image) {
       const base64Data = msg.image.includes(',') ? msg.image.split(',')[1] : msg.image;
       parts.push({
         inlineData: { mimeType: 'image/jpeg', data: base64Data }
       });
    }
    parts.push({ text: msg.text });
    return { role: msg.role, parts: parts };
  });

  const newParts: Part[] = [];
  let contextualMessage = newMessage;
  
  if (communicationMode === 'smartphone') {
      contextualMessage = `[PROTOCOL: SMS MODE ACTIVE]\n[LOGIC: You are far from the user. You are communicating via smartphone text messages.]\n[USER SMS]: ${newMessage}`;
  } else if (isUserNearButTexting) {
      contextualMessage = `[PROTOCOL: PROXIMITY ANOMALY]\n[LOGIC: The user is in the SAME LOCATION as you (${currentLocation}), but they chose to text you via Smartphone instead of talking. REACT to this anti-social or weird behavior face-to-face.]\n[USER SMS RECEIVED]: ${newMessage}`;
  } else {
      if (currentTime || currentLocation || currentWeather) {
          contextualMessage = `[ENVIRONMENT DATALINK]\nTime: "${currentTime || 'Unknown'}"\nLocation: "${currentLocation || 'Unknown'}"\nWeather: "${currentWeather || 'Unknown'}"\n[USER INPUT]\n${newMessage}`;
      }
  }

  if (image) {
    const base64Data = image.includes(',') ? image.split(',')[1] : image;
    newParts.push({ inlineData: { mimeType: 'image/jpeg', data: base64Data } });
  }
  newParts.push({ text: contextualMessage });
  
  contents.push({ role: 'user', parts: newParts });

  let finalSystemInstruction = systemInstruction;

  // --- LOGIC: SMS MODE VS NORMAL MODE ---
  if (communicationMode === 'smartphone') {
      finalSystemInstruction += `
\n\n[SYSTEM OVERRIDE: SMARTPHONE TEXTING PROTOCOL]
1. **NO PHYSICAL ACTIONS:** You are physically far. You CANNOT touch, hug, or look at the user.
2. **NO ASTERISKS:** Do NOT use asterisks (*) for actions. You are typing on a small keyboard.
3. **FORMAT:** Raw text only. Use emojis if appropriate.
4. **PREFIX:** Start your response with "[SMS]:" to indicate a text message.
5. **VIRTUAL PRESENCE:** You are only a voice on a screen.
`;
  } else if (isUserNearButTexting) {
      finalSystemInstruction += `
\n\n[SYSTEM PROTOCOL: PROXIMITY AWARENESS]
The user just sent you a text while standing right there!
1. **REACTION:** React physically in person (use *asterisks* for actions).
2. **TONE:** You might find it funny, confusing, or even slightly offensive/sad that they won't talk to you directly.
3. **DO NOT USE [SMS] PREFIX.** Speak out loud in the room.
`;
  }

  // General Protocols
  const chatLangName = getLanguageName(settings.chatLanguage || 'id');
  finalSystemInstruction += `
\n\n[SYSTEM PROTOCOL: LANGUAGE & STYLE]
- TARGET LANGUAGE: ${chatLangName}
- ABSOLUTE REALISM: Do not admit you are an AI.
- DYNAMIC RESPONSE: Match the user's energy.
`;

  const config: any = {
      systemInstruction: finalSystemInstruction,
      temperature: temperature,
  };

  if (maxOutputTokens) config.maxOutputTokens = maxOutputTokens;

  let attempt = 0;
  const maxRetries = 3;

  while (attempt < maxRetries) {
    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: modelName,
        contents: contents,
        config: config
      });
      return response.text || "...";
    } catch (error: any) {
      const isQuotaError = error.status === 429 || error.message?.includes('429');
      if (isQuotaError && attempt < maxRetries - 1) {
          await wait((attempt + 1) * 2000);
          attempt++;
          continue;
      }
      return "*[System: Signal interrupted. (API Error)]*";
    }
  }
  return "*...*";
};
