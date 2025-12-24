
import JSZip from 'jszip';
import { getCharacters } from "./character";
import { getSavedStories } from "./history";
import { getSettings } from "./settings";
import { CHARACTERS_KEY, SESSIONS_KEY, SETTINGS_KEY, HISTORY_KEY, VERSION_KEY, PHONE_STORAGE_KEY } from "./constants";
import { SOCIAL_STORAGE_KEY } from "../SmartphoneSocial";
import { getWeatherStateSnapshot, restoreWeatherState } from "../weatherService";
import { Character, ChatSession, Message } from "../../types";
import { getChatContext, restoreChatContexts, ChatContextData } from "../chatContextStorage";
import { saveSmartphoneData, CharacterPhoneData } from "../smartphoneStorage";
import { saveSocialData, SocialData } from "../SmartphoneSocial";
import { saveChatContext } from "../chatContextStorage";
import { getGeneratedImages, restoreGeneratedImages, GeneratedImage } from "../ImageCreatedService";

const DEFAULT_SETTINGS = getSettings(); 

export const clearAllData = () => {
    localStorage.clear();
};

// --- HELPER: IMAGE EXTRACTION & INJECTION ---

// Extracts Base64 images from messages to ZIP files to keep JSON light
const extractImagesFromMessages = (messages: Message[], zipFolder: JSZip, prefix: string): Message[] => {
    return messages.map(msg => {
        if (msg.image && msg.image.startsWith('data:image')) {
            try {
                // Generate safe filename
                const fileId = msg.id || crypto.randomUUID();
                const fileName = `${prefix}_${fileId}.png`;
                const cleanBase64 = msg.image.split(',')[1];
                
                // Add to ZIP
                zipFolder.file(fileName, cleanBase64, { base64: true });
                
                // Return message with placeholder reference
                return { ...msg, image: `FILE:chat_media/${fileName}` };
            } catch (e) {
                console.warn("Failed to extract image from message:", msg.id);
                return msg; // Fallback: keep original heavy base64
            }
        }
        return msg;
    });
};

// Rehydrates placeholders (FILE:...) with actual Base64 from ZIP
const rehydrateMessages = (messages: Message[], imageMap: Map<string, string>): Message[] => {
    if (!Array.isArray(messages)) return [];
    return messages.map(msg => {
        if (msg.image && msg.image.startsWith('FILE:')) {
            const fileName = msg.image.replace('FILE:', '');
            // Check mapping (handle potential path differences)
            const cleanName = fileName.split('/').pop(); 
            const base64Data = imageMap.get(fileName) || imageMap.get(cleanName || '');
            
            if (base64Data) {
                return { ...msg, image: `data:image/png;base64,${base64Data}` };
            }
        }
        return msg;
    });
};

// --- EXPORT FUNCTION (.psc) ---
export const exportData = async (exportName?: string) => {
  const zip = new JSZip();
  const chatMediaFolder = zip.folder("chat_media");

  // 1. Metadata
  const metadata = {
      version: "2.5", // Universal Format Update
      type: "PASCO_SAVE_CONTAINER",
      exportDate: new Date().toISOString(),
      appVersion: localStorage.getItem(VERSION_KEY) || "unknown"
  };
  zip.file("metadata.json", JSON.stringify(metadata, null, 2));

  // Load Raw Data
  const settings = getSettings();
  const rawHistory = getSavedStories();
  const rawSessions = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '{}');
  const characters = getCharacters();
  const phoneDataRaw = JSON.parse(localStorage.getItem(PHONE_STORAGE_KEY) || '{}');
  const socialDataRaw = JSON.parse(localStorage.getItem(SOCIAL_STORAGE_KEY) || '{}');
  const contextDataRaw = JSON.parse(localStorage.getItem('pasco_chat_context_v1') || '{}');

  // 2. Process Chat Sessions (Active) - Extract Images
  const processedSessions: Record<string, ChatSession> = {};
  Object.keys(rawSessions).forEach(key => {
      const session = rawSessions[key];
      if (session.messages) {
          processedSessions[key] = {
              ...session,
              messages: chatMediaFolder 
                  ? extractImagesFromMessages(session.messages, chatMediaFolder, `sess_${key}`)
                  : session.messages
          };
      }
  });

  // 3. Process History (Archives) - Extract Images
  const processedHistory = rawHistory.map(story => {
      if (story.sessionData && story.sessionData.messages) {
          return {
              ...story,
              sessionData: {
                  ...story.sessionData,
                  messages: chatMediaFolder
                      ? extractImagesFromMessages(story.sessionData.messages, chatMediaFolder, `hist_${story.id}`)
                      : story.sessionData.messages
              }
          };
      }
      return story;
  });

  // 4. Gamestate (Settings & Processed History)
  const gamestate = {
      settings: settings,
      history: processedHistory
  };
  zip.file("gamestate.json", JSON.stringify(gamestate, null, 2));

  // 5. Active Sessions
  // Save specific sessions file for easy restoration without scanning folders
  zip.file("sessions.json", JSON.stringify(processedSessions, null, 2));

  // 6. Weather
  zip.file("weather.json", JSON.stringify(getWeatherStateSnapshot(), null, 2));

  // 7. Generated Images (Gallery)
  const generatedImages = getGeneratedImages();
  const imagesFolder = zip.folder("generated_images");
  if (imagesFolder && generatedImages.length > 0) {
      const imageManifest: any[] = [];
      generatedImages.forEach(img => {
          const safeId = img.id.replace(/[^a-z0-9]/gi, '_');
          // Basic check to strip prefix if exists
          const cleanBase64 = img.base64.includes(',') ? img.base64.split(',')[1] : img.base64;
          
          imagesFolder.file(`${safeId}.png`, cleanBase64, {base64: true});
          imageManifest.push({
              id: img.id,
              prompt: img.prompt,
              timestamp: img.timestamp,
              characterId: img.characterId,
              fileName: `${safeId}.png`
          });
      });
      imagesFolder.file("manifest.json", JSON.stringify(imageManifest, null, 2));
  }

  // 8. Characters & Context (Organized Folders)
  const charFolder = zip.folder("characters");
  if (charFolder) {
      characters.forEach(char => {
          const safeName = (char.name || char.id).replace(/[^a-z0-9\s-]/gi, '_').trim();
          const charSpecificFolder = charFolder.folder(safeName);
          
          if (charSpecificFolder) {
              // We save the session inside char folder too for modularity, 
              // but we use the processed one (images extracted)
              const charData = {
                  character: char,
                  session: processedSessions[char.id] || null
              };
              charSpecificFolder.file(`character_data.json`, JSON.stringify(charData, null, 2));

              const contextFolder = charSpecificFolder.folder("ChatContext");
              if (contextFolder) {
                  const aggregatedContext = {
                      characterId: char.id, 
                      chatContext: contextDataRaw[char.id] || null,
                      smartphone: phoneDataRaw[char.id] || null,
                      social: socialDataRaw[char.id] || null
                  };
                  contextFolder.file(`${safeName}_context.json`, JSON.stringify(aggregatedContext, null, 2));
              }
          }
      });
  }

  // 9. Groups
  const groupSessions: Record<string, ChatSession> = {};
  Object.keys(processedSessions).forEach(key => {
      if (!characters.find(c => c.id === key)) {
          groupSessions[key] = processedSessions[key];
      }
  });
  if (Object.keys(groupSessions).length > 0) {
      zip.file("groups.json", JSON.stringify(groupSessions, null, 2));
  }

  // Generate ZIP
  const blob = await zip.generateAsync({
      type: "blob", 
      compression: "DEFLATE",
      compressionOptions: { level: 6 } 
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  let fileName = exportName ? exportName.trim() : `pasco_universal_${new Date().toISOString().slice(0,10)}`;
  if (!fileName.toLowerCase().endsWith('.psc')) {
      fileName += '.psc';
  }
  
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  return true;
};

// --- IMPORT FUNCTION (RESILIENT & UNIVERSAL) ---
export const importData = async (file: File): Promise<any | null> => {
    try {
        const finalData: any = {
            characters: [],
            sessions: {},
            history: [],
            settings: null,
            smartphone: {},
            social: {},
            chatContext: {}, 
            weather: null,
            generatedImages: []
        };

        // --- JSON FILE HANDLER ---
        if (file.name.toLowerCase().endsWith('.json')) {
            try {
                const text = await file.text();
                return JSON.parse(text);
            } catch (e) {
                console.error("Invalid JSON file:", e);
                return null;
            }
        } 
        
        // --- ZIP/PSC FILE HANDLER ---
        else if (file.name.toLowerCase().endsWith('.psc') || file.name.toLowerCase().endsWith('.zip')) {
            const zip = await JSZip.loadAsync(file);
            const filePaths = Object.keys(zip.files);

            // 1. PRE-LOAD MEDIA (Image Rehydration Map)
            const imageMap = new Map<string, string>();
            
            // Scan chat_media folder
            const chatMediaFolder = zip.folder("chat_media");
            if (chatMediaFolder) {
                const mediaFiles = Object.keys(chatMediaFolder.files);
                for (const mediaPath of mediaFiles) {
                    if (!chatMediaFolder.files[mediaPath].dir) {
                        try {
                            const base64 = await chatMediaFolder.files[mediaPath].async("base64");
                            const cleanName = mediaPath.split('/').pop(); // "msg_123.png"
                            if (cleanName) imageMap.set(cleanName, base64);
                            imageMap.set(mediaPath, base64); // Also store full path just in case
                        } catch (e) {
                            console.warn("Failed to load chat image:", mediaPath);
                        }
                    }
                }
            }

            // 2. PROCESS GENERATED IMAGES
            const genImagesFolder = zip.folder("generated_images");
            if (genImagesFolder) {
                const manifestFile = genImagesFolder.file("manifest.json");
                if (manifestFile) {
                    try {
                        const manifest: any[] = JSON.parse(await manifestFile.async("string"));
                        if (Array.isArray(manifest)) {
                            for (const meta of manifest) {
                                const imgFile = genImagesFolder.file(meta.fileName);
                                if (imgFile) {
                                    const base64 = await imgFile.async("base64");
                                    finalData.generatedImages.push({
                                        id: meta.id,
                                        base64: `data:image/png;base64,${base64}`,
                                        prompt: meta.prompt,
                                        timestamp: meta.timestamp,
                                        characterId: meta.characterId
                                    });
                                }
                            }
                        }
                    } catch(e) { console.warn("Corrupt image manifest, skipping generated images"); }
                }
            }

            // 3. UNIVERSAL FILE SCANNER (Resilient Loop)
            for (const path of filePaths) {
                // Skip non-JSON and directories
                if (!path.toLowerCase().endsWith('.json') || zip.files[path].dir) continue;

                // **PARTIAL RESCUE BLOCK**
                // We wrap EACH file processing in try-catch so one bad file doesn't kill the whole import
                try {
                    const content = await zip.files[path].async("string");
                    const json = JSON.parse(content);

                    if (!json) continue;

                    // --- DETECTION HEURISTICS ---

                    // A. Standard Character/Session Node
                    if (json.character && json.character.id) {
                        if (!finalData.characters.find((c: any) => c.id === json.character.id)) {
                            finalData.characters.push(json.character);
                        }
                        if (json.session && json.session.messages) {
                            // Rehydrate images in messages
                            const hydratedSession = {
                                ...json.session,
                                messages: rehydrateMessages(json.session.messages, imageMap)
                            };
                            finalData.sessions[json.character.id] = hydratedSession;
                        }
                    }

                    // B. Raw Character
                    else if (json.id && json.name && json.systemInstruction && !json.messages) {
                        if (!finalData.characters.find((c: any) => c.id === json.id)) {
                            finalData.characters.push(json);
                        }
                    }

                    // C. Raw Session / Groups / Sessions Dict
                    else if (typeof json === 'object') {
                        // Check if it's a dictionary of sessions
                        if (!json.characterId && Object.keys(json).some(k => json[k]?.messages)) {
                             Object.keys(json).forEach(key => {
                                 if (json[key].messages) {
                                     finalData.sessions[key] = {
                                         ...json[key],
                                         messages: rehydrateMessages(json[key].messages, imageMap)
                                     };
                                 }
                             });
                        }
                        // Check if it's a single session
                        else if (json.characterId && Array.isArray(json.messages)) {
                            finalData.sessions[json.characterId] = {
                                ...json,
                                messages: rehydrateMessages(json.messages, imageMap)
                            };
                        }
                    }

                    // D. Context Data (Smartphone, Social, etc.)
                    // Handles both wrapped format (characterId root) and raw dicts
                    if (json.smartphone) {
                        if (json.characterId && typeof json.smartphone === 'object') {
                            finalData.smartphone[json.characterId] = json.smartphone;
                        } else {
                            finalData.smartphone = { ...finalData.smartphone, ...json.smartphone };
                        }
                    }
                    if (json.social) {
                        if (json.characterId && typeof json.social === 'object') {
                            finalData.social[json.characterId] = json.social;
                        } else {
                            finalData.social = { ...finalData.social, ...json.social };
                        }
                    }
                    if (json.chatContext) {
                        if (json.characterId && typeof json.chatContext === 'object') {
                            finalData.chatContext[json.characterId] = json.chatContext;
                        } else {
                            finalData.chatContext = { ...finalData.chatContext, ...json.chatContext };
                        }
                    }

                    // E. History (Rehydrate Images here too)
                    if (json.history && Array.isArray(json.history)) {
                        const newHistory = json.history.map((h: any) => {
                            if (h.sessionData && h.sessionData.messages) {
                                return {
                                    ...h,
                                    sessionData: {
                                        ...h.sessionData,
                                        messages: rehydrateMessages(h.sessionData.messages, imageMap)
                                    }
                                };
                            }
                            return h;
                        });
                        
                        // Merge avoiding duplicates
                        const existingIds = new Set(finalData.history.map((h: any) => h.id));
                        newHistory.forEach((h: any) => {
                            if (!existingIds.has(h.id)) {
                                finalData.history.push(h);
                            }
                        });
                    }

                    // F. Settings & Weather
                    if (json.settings && json.settings.userName) {
                        finalData.settings = { ...DEFAULT_SETTINGS, ...json.settings };
                    }
                    if (json.season && json.currentTier !== undefined) {
                        finalData.weather = json;
                    }

                } catch (e) {
                    // RESILIENCE: Log corrupted file but DO NOT THROW.
                    // This allows the loop to proceed to other valid files.
                    console.warn(`[Partial Rescue] Skipping corrupted/invalid file inside PSC: ${path}`, e);
                }
            }

            return finalData;

        } else {
            throw new Error("Unsupported file format");
        }

    } catch (e) {
        console.error("Critical Import Failure:", e);
        return null;
    }
};

export const restoreSystemData = (data: any) => {
    // Robust checking for arrays and objects
    if (data.characters && Array.isArray(data.characters)) {
        const validCharacters = data.characters.filter((c: any) => c && typeof c === 'object' && typeof c.id === 'string');
        localStorage.setItem(CHARACTERS_KEY, JSON.stringify(validCharacters));
    }
    
    if (data.sessions && typeof data.sessions === 'object') {
         localStorage.setItem(SESSIONS_KEY, JSON.stringify(data.sessions));
    }
    
    if (data.history && Array.isArray(data.history)) {
         localStorage.setItem(HISTORY_KEY, JSON.stringify(data.history));
    }

    if (data.settings && typeof data.settings === 'object') {
         const mergedSettings = { ...DEFAULT_SETTINGS, ...data.settings };
         localStorage.setItem(SETTINGS_KEY, JSON.stringify(mergedSettings));
    }

    if (data.smartphone && Object.keys(data.smartphone).length > 0) {
        localStorage.setItem(PHONE_STORAGE_KEY, JSON.stringify(data.smartphone));
    }
    
    if (data.social && Object.keys(data.social).length > 0) {
        localStorage.setItem(SOCIAL_STORAGE_KEY, JSON.stringify(data.social));
    }
    
    if (data.chatContext && Object.keys(data.chatContext).length > 0) {
        localStorage.setItem('pasco_chat_context_v1', JSON.stringify(data.chatContext));
    }
    
    if (data.weather) restoreWeatherState(data.weather);
    if (data.generatedImages && Array.isArray(data.generatedImages)) restoreGeneratedImages(data.generatedImages);
};
