import { GoogleGenAI, Modality } from "@google/genai";
import { getSettings } from "../storageService";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper: Decode Base64 to ArrayBuffer
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export const playTextToSpeech = async (text: string, voiceName: string = 'Kore'): Promise<void> => {
    const settings = getSettings();
    if (settings.enablePreviewMode) {
        console.warn("TTS Skipped: Preview Mode Active");
        return;
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } } },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("No audio data returned");

        const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
        const outputNode = outputAudioContext.createGain();
        outputNode.connect(outputAudioContext.destination);

        const audioBytes = decodeBase64(base64Audio);
        const dataInt16 = new Int16Array(audioBytes.buffer);
        const buffer = outputAudioContext.createBuffer(1, dataInt16.length, 24000);
        const channelData = buffer.getChannelData(0);
        
        for (let i = 0; i < dataInt16.length; i++) {
            channelData[i] = dataInt16[i] / 32768.0;
        }

        const source = outputAudioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(outputNode);
        source.start();
    } catch (error) {
        console.error("TTS Generation failed:", error);
    }
};
