
import { GoogleGenAI, Content, Part, GenerateContentResponse } from "@google/genai";
import { Message } from "../../../../types";
import { getSettings } from "../../../storageService";
import { t } from "../../../translationService";
import { getLanguageName, NSFW_KEYWORDS, wait } from "./Constants";
import { generateOpenRouterResponse } from "../../../Openrouter"; 
import { generateOllamaResponse } from "../../../Ollama";
import { generateKoboldResponse } from "../../../Kobold";
import { getVerbosityProfile } from "../../../../components/ChatInterface/ChatContext/Verbosity";

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
  isUserNearButTexting: boolean = false
): Promise<string> => {

  const settings = getSettings();
  if (settings.enablePreviewMode) {
      await wait(1000); 
      const msg = t('dev.preview_msg');
      return msg.replace('{{time}}', currentTime || 'Unknown');
  }

  // --- PREPARE INJECTIONS ---
  const chatLangName = getLanguageName(settings.chatLanguage || 'id');
  const userName = settings.userName || 'User';
  
  // Get Verbosity Instructions
  const verbosityProfile = getVerbosityProfile(responseLength || 'short');

  // --- OPENROUTER HANDLING ---
  if (modelName === 'openrouter-api' || settings.defaultModel === 'openrouter-api') {
      const apiKey = settings.openRouterKey;
      if (!apiKey) return "*[System: OpenRouter API Key Missing. Check Settings.]*";
      
      const orModel = settings.openRouterModel || "mistralai/mistral-7b-instruct:free";
      
      // Construct Context Header
      let contextHeader = "";
      if (communicationMode === 'smartphone') {
          contextHeader += `[PROTOCOL: SMS MODE ACTIVE]\n[LOGIC: You are far from the user. You are communicating via smartphone text messages.]\n`;
      } else if (isUserNearButTexting) {
          contextHeader += `[PROTOCOL: PROXIMITY ANOMALY]\n[LOGIC: The user is in the SAME LOCATION as you (${currentLocation}), but they chose to text you via Smartphone instead of talking. REACT to this anti-social or weird behavior face-to-face.]\n`;
      } else {
          if (currentTime || currentLocation || currentWeather) {
              contextHeader += `[ENVIRONMENT DATALINK]\nTime: "${currentTime || 'Unknown'}"\nLocation: "${currentLocation || 'Unknown'}"\nWeather: "${currentWeather || 'Unknown'}"\n`;
          }
      }

      // Build System Prompt
      let finalSystemInstruction = systemInstruction;
      
      // INJECT USER NAME
      finalSystemInstruction += `\n\n[SYSTEM: INTERACTION DATA]\nUser Name: "${userName}" (Address them by this name unless told otherwise).`;

      // INJECT VERBOSITY
      finalSystemInstruction += `\n\n${verbosityProfile.systemInjection}`;

      if (communicationMode === 'smartphone') {
          finalSystemInstruction += `\n\n[SYSTEM OVERRIDE: SMARTPHONE TEXTING PROTOCOL]\n1. **NO PHYSICAL ACTIONS:** You are physically far. You CANNOT touch, hug, or look at the user.\n2. **NO ASTERISKS:** Do NOT use asterisks (*) for actions. You are typing on a small keyboard.\n3. **FORMAT:** Raw text only. Use emojis if appropriate.\n4. **PREFIX:** Start your response with "[SMS]:" to indicate a text message.\n5. **VIRTUAL PRESENCE:** You are only a voice on a screen.`;
      } else if (isUserNearButTexting) {
          finalSystemInstruction += `\n\n[SYSTEM PROTOCOL: PROXIMITY AWARENESS]\nThe user just sent you a text while standing right there!\n1. **REACTION:** React physically in person (use *asterisks* for actions).\n2. **TONE:** You might find it funny, confusing, or even slightly offensive/sad that they won't talk to you directly.\n3. **DO NOT USE [SMS] PREFIX.** Speak out loud in the room.`;
      }
      
      finalSystemInstruction += `\n\n[SYSTEM PROTOCOL: LANGUAGE & STYLE]\n- TARGET LANGUAGE: ${chatLangName}\n- ABSOLUTE REALISM: Do not admit you are an AI.\n- DYNAMIC RESPONSE: Match the user's energy.`;

      // Build Message Array for OpenRouter
      const orMessages = [
          { role: 'system', content: finalSystemInstruction },
          ...history.map(m => ({
              role: m.role === 'model' ? 'assistant' : 'user',
              content: m.text
          })),
          { role: 'user', content: `${contextHeader}[USER INPUT]: ${newMessage}` }
      ];

      try {
          return await generateOpenRouterResponse(apiKey, orModel, orMessages);
      } catch (e: any) {
          console.error("OpenRouter Character Chat Error:", e);
          const errMsg = e.message || "Unknown API Error";
          return `*[System: Signal interrupted. (${errMsg})]*`;
      }
  }

  // --- OLLAMA HANDLING ---
  if (modelName === 'ollama-api' || settings.defaultModel === 'ollama-api') {
      const ollamaModel = settings.ollamaModel || "llama3.2";

      // Construct Context Header
      let contextHeader = "";
      if (communicationMode === 'smartphone') {
          contextHeader += `[PROTOCOL: SMS MODE ACTIVE]\n[LOGIC: You are far from the user. You are communicating via smartphone text messages.]\n`;
      } else if (isUserNearButTexting) {
          contextHeader += `[PROTOCOL: PROXIMITY ANOMALY]\n[LOGIC: The user is in the SAME LOCATION as you (${currentLocation}), but they chose to text you via Smartphone instead of talking. REACT to this anti-social or weird behavior face-to-face.]\n`;
      } else {
          if (currentTime || currentLocation || currentWeather) {
              contextHeader += `[ENVIRONMENT DATALINK]\nTime: "${currentTime || 'Unknown'}"\nLocation: "${currentLocation || 'Unknown'}"\nWeather: "${currentWeather || 'Unknown'}"\n`;
          }
      }

      // Build System Prompt
      let finalSystemInstruction = systemInstruction;
      finalSystemInstruction += `\n\n[SYSTEM: INTERACTION DATA]\nUser Name: "${userName}" (Address them by this name unless told otherwise).`;
      finalSystemInstruction += `\n\n${verbosityProfile.systemInjection}`;

      if (communicationMode === 'smartphone') {
          finalSystemInstruction += `\n\n[SYSTEM OVERRIDE: SMARTPHONE TEXTING PROTOCOL]\n1. **NO PHYSICAL ACTIONS:** You are physically far. You CANNOT touch, hug, or look at the user.\n2. **NO ASTERISKS:** Do NOT use asterisks (*) for actions. You are typing on a small keyboard.\n3. **FORMAT:** Raw text only. Use emojis if appropriate.\n4. **PREFIX:** Start your response with "[SMS]:" to indicate a text message.\n5. **VIRTUAL PRESENCE:** You are only a voice on a screen.`;
      } else if (isUserNearButTexting) {
          finalSystemInstruction += `\n\n[SYSTEM PROTOCOL: PROXIMITY AWARENESS]\nThe user just sent you a text while standing right there!\n1. **REACTION:** React physically in person (use *asterisks* for actions).\n2. **TONE:** You might find it funny, confusing, or even slightly offensive/sad that they won't talk to you directly.\n3. **DO NOT USE [SMS] PREFIX.** Speak out loud in the room.`;
      }
      
      finalSystemInstruction += `\n\n[SYSTEM PROTOCOL: LANGUAGE & STYLE]\n- TARGET LANGUAGE: ${chatLangName}\n- ABSOLUTE REALISM: Do not admit you are an AI.\n- DYNAMIC RESPONSE: Match the user's energy.\n- WEB SEARCH TOOL: If the user asks for facts or recent events, you must call the web search tool to find the answer.`;

      // Build Message Array for Ollama
      const oMessages: any[] = [
          { role: 'system', content: finalSystemInstruction },
          ...history.map(m => ({
              role: m.role === 'model' ? 'assistant' : 'user',
              content: m.text
          })),
          { role: 'user', content: `${contextHeader}[USER INPUT]: ${newMessage}` }
      ];

      try {
          return await generateOllamaResponse(ollamaModel, oMessages);
      } catch (e: any) {
          console.error("Ollama Character Chat Error:", e);
          const errMsg = e.message || "Unknown API Error";
          return `*[System: Signal interrupted. (Ollama API Error: ${errMsg})]*`;
      }
  }

  // --- KOBOLD HANDLING ---
  if (modelName === 'kobold-api' || settings.defaultModel === 'kobold-api') {
      const koboldModel = settings.koboldModel || "koboldcpp";

      // Construct Context Header
      let contextHeader = "";
      if (communicationMode === 'smartphone') {
          contextHeader += `[PROTOCOL: SMS MODE ACTIVE]\n[LOGIC: You are far from the user. You are communicating via smartphone text messages.]\n`;
      } else if (isUserNearButTexting) {
          contextHeader += `[PROTOCOL: PROXIMITY ANOMALY]\n[LOGIC: The user is in the SAME LOCATION as you (${currentLocation}), but they chose to text you via Smartphone instead of talking. REACT to this anti-social or weird behavior face-to-face.]\n`;
      } else {
          if (currentTime || currentLocation || currentWeather) {
              contextHeader += `[ENVIRONMENT DATALINK]\nTime: "${currentTime || 'Unknown'}"\nLocation: "${currentLocation || 'Unknown'}"\nWeather: "${currentWeather || 'Unknown'}"\n`;
          }
      }

      // Build System Prompt
      let finalSystemInstruction = systemInstruction;
      finalSystemInstruction += `\n\n[SYSTEM: INTERACTION DATA]\nUser Name: "${userName}" (Address them by this name unless told otherwise).`;
      finalSystemInstruction += `\n\n${verbosityProfile.systemInjection}`;

      if (communicationMode === 'smartphone') {
          finalSystemInstruction += `\n\n[SYSTEM OVERRIDE: SMARTPHONE TEXTING PROTOCOL]\n1. **NO PHYSICAL ACTIONS:** You are physically far. You CANNOT touch, hug, or look at the user.\n2. **NO ASTERISKS:** Do NOT use asterisks (*) for actions. You are typing on a small keyboard.\n3. **FORMAT:** Raw text only. Use emojis if appropriate.\n4. **PREFIX:** Start your response with "[SMS]:" to indicate a text message.\n5. **VIRTUAL PRESENCE:** You are only a voice on a screen.`;
      } else if (isUserNearButTexting) {
          finalSystemInstruction += `\n\n[SYSTEM PROTOCOL: PROXIMITY AWARENESS]\nThe user just sent you a text while standing right there!\n1. **REACTION:** React physically in person (use *asterisks* for actions).\n2. **TONE:** You might find it funny, confusing, or even slightly offensive/sad that they won't talk to you directly.\n3. **DO NOT USE [SMS] PREFIX.** Speak out loud in the room.`;
      }
      
      finalSystemInstruction += `\n\n[SYSTEM PROTOCOL: LANGUAGE & STYLE]\n- TARGET LANGUAGE: ${chatLangName}\n- ABSOLUTE REALISM: Do not admit you are an AI.\n- DYNAMIC RESPONSE: Match the user's energy.`;

      // Build Message Array for Kobold
      const kMessages: { role: string, content: string }[] = [
          { role: 'system', content: finalSystemInstruction },
          ...history.map(m => ({
              role: m.role === 'model' ? 'assistant' : 'user',
              content: m.text
          })),
          { role: 'user', content: `${contextHeader}[USER INPUT]: ${newMessage}` }
      ];

      try {
          return await generateKoboldResponse(koboldModel, kMessages);
      } catch (e: any) {
          console.error("Kobold Character Chat Error:", e);
          const errMsg = e.message || "Unknown API Error";
          return `*[System: Signal interrupted. (Kobold AI Offline: ${errMsg})]*`;
      }
  }
  
  // --- DEFAULT GEMINI HANDLING ---
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

  // --- INJECT CORE IDENTITY UPDATES ---
  finalSystemInstruction += `\n\n[SYSTEM: INTERACTION DATA]\nUser Name: "${userName}" (Address them by this name unless told otherwise).`;
  
  // --- INJECT VERBOSITY SETTINGS ---
  finalSystemInstruction += `\n\n${verbosityProfile.systemInjection}`;

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
  finalSystemInstruction += `
\n\n[SYSTEM PROTOCOL: LANGUAGE & STYLE]
- TARGET LANGUAGE: ${chatLangName}
- ABSOLUTE REALISM: Do not admit you are an AI.
- DYNAMIC RESPONSE: Match the user's energy.
`;

  const config: any = {
      systemInstruction: finalSystemInstruction,
      temperature: temperature + (verbosityProfile.tempModifier || 0),
  };

  // Prioritize Verbosity Token Limit if set, else fallback to global setting
  if (verbosityProfile.maxTokens) {
      config.maxOutputTokens = verbosityProfile.maxTokens;
  } else if (maxOutputTokens) {
      config.maxOutputTokens = maxOutputTokens;
  }

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
