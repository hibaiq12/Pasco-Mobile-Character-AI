
import JSZip from 'jszip';
import { getCharacters } from "./character";
import { getSavedStories } from "./history";
import { getSettings } from "./settings";
import { CHARACTERS_KEY, SESSIONS_KEY, SETTINGS_KEY, HISTORY_KEY, VERSION_KEY, PHONE_STORAGE_KEY } from "./constants";
import { SOCIAL_STORAGE_KEY } from "../SmartphoneSocial";
import { getWeatherStateSnapshot, restoreWeatherState } from "../weatherService";
import { Character, ChatSession } from "../../types";
import { getChatContext, restoreChatContexts, ChatContextData } from "../chatContextStorage";
import { saveSmartphoneData, CharacterPhoneData } from "../smartphoneStorage";
import { saveSocialData, SocialData } from "../SmartphoneSocial";
import { saveChatContext } from "../chatContextStorage";
import { getGeneratedImages, restoreGeneratedImages, GeneratedImage } from "../ImageCreatedService";

const DEFAULT_SETTINGS = getSettings(); 

export const clearAllData = () => {
    localStorage.clear();
};

// --- EXPORT FUNCTION (.psc) ---
export const exportData = async (exportName?: string) => {
  const zip = new JSZip();

  // 1. Metadata
  const metadata = {
      version: "2.4", // Version bump
      type: "PASCO_SAVE_CONTAINER",
      exportDate: new Date().toISOString(),
      appVersion: localStorage.getItem(VERSION_KEY) || "unknown"
  };
  zip.file("metadata.json", JSON.stringify(metadata, null, 2));

  // 2. Gamestate (Settings & History)
  const gamestate = {
      settings: getSettings(),
      history: getSavedStories()
  };
  zip.file("gamestate.json", JSON.stringify(gamestate, null, 2));

  // 3. Weather
  zip.file("weather.json", JSON.stringify(getWeatherStateSnapshot(), null, 2));

  // 4. Generated Images (New Folder Structure)
  const generatedImages = getGeneratedImages();
  const imagesFolder = zip.folder("generated_images");
  if (imagesFolder && generatedImages.length > 0) {
      const imageManifest: any[] = [];
      
      generatedImages.forEach(img => {
          // Store actual image data as file
          const safeId = img.id.replace(/[^a-z0-9]/gi, '_');
          // Validation: Ensure valid base64
          if (img.base64 && img.base64.includes(',')) {
              const cleanBase64 = img.base64.split(',')[1]; 
              imagesFolder.file(`${safeId}.png`, cleanBase64, {base64: true});
              
              imageManifest.push({
                  id: img.id,
                  prompt: img.prompt,
                  timestamp: img.timestamp,
                  characterId: img.characterId,
                  fileName: `${safeId}.png` 
              });
          }
      });
      
      imagesFolder.file("manifest.json", JSON.stringify(imageManifest, null, 2));
  }

  // Load Raw Data for lookup
  const phoneDataRaw = JSON.parse(localStorage.getItem(PHONE_STORAGE_KEY) || '{}');
  const socialDataRaw = JSON.parse(localStorage.getItem(SOCIAL_STORAGE_KEY) || '{}');
  const contextDataRaw = getChatContext ? JSON.parse(localStorage.getItem('pasco_chat_context_v1') || '{}') : {};

  // 5. Characters & Detailed Context Structure
  const characters = getCharacters();
  const sessions = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '{}');
  
  const charFolder = zip.folder("characters");
  
  if (charFolder) {
      characters.forEach(char => {
          const safeName = (char.name || char.id).replace(/[^a-z0-9\s-]/gi, '_').trim();
          const charSpecificFolder = charFolder.folder(safeName);
          
          if (charSpecificFolder) {
              const charData = {
                  character: char,
                  session: sessions[char.id] || null
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
                  contextFolder.file(`${safeName}.json`, JSON.stringify(aggregatedContext, null, 2));
              }
          }
      });
      
      const groupSessions: Record<string, ChatSession> = {};
      Object.keys(sessions).forEach(key => {
          if (!characters.find(c => c.id === key)) {
              groupSessions[key] = sessions[key];
          }
      });
      
      if (Object.keys(groupSessions).length > 0) {
          zip.file("groups.json", JSON.stringify(groupSessions, null, 2));
      }
  }

  // Legacy Fallback Files (for safety)
  // zip.file("smartphone.json", JSON.stringify(phoneDataRaw));
  // zip.file("social.json", JSON.stringify(socialDataRaw));

  const blob = await zip.generateAsync({
      type: "blob", 
      compression: "DEFLATE",
      compressionOptions: { level: 6 } 
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  let fileName = exportName ? exportName.trim() : `pasco_save_${new Date().toISOString().slice(0,10)}`;
  if (!fileName.toLowerCase().endsWith('.psc')) {
      fileName += '.psc';
  }
  
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  return true;
};

// --- IMPORT FUNCTION ---
export const importData = async (file: File): Promise<any | null> => {
    try {
        let finalData: any = {
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

        if (file.name.toLowerCase().endsWith('.json')) {
            const text = await file.text();
            return JSON.parse(text);
        } 
        
        else if (file.name.toLowerCase().endsWith('.psc') || file.name.toLowerCase().endsWith('.zip')) {
            const zip = await JSZip.loadAsync(file);
            
            // 1. Gamestate
            try {
                const gamestateFile = zip.file("gamestate.json");
                if (gamestateFile) {
                    const gs = JSON.parse(await gamestateFile.async("string"));
                    finalData.settings = gs.settings;
                    finalData.history = gs.history;
                }
            } catch (e) { console.warn("Error reading gamestate.json", e); }

            // 2. Weather
            try {
                const weatherFile = zip.file("weather.json");
                if (weatherFile) finalData.weather = JSON.parse(await weatherFile.async("string"));
            } catch (e) { console.warn("Error reading weather", e); }

            // 3. Generated Images Restoration
            const imagesFolder = zip.folder("generated_images");
            if (imagesFolder) {
                try {
                    const manifestFile = imagesFolder.file("manifest.json");
                    if (manifestFile) {
                        const manifest: any[] = JSON.parse(await manifestFile.async("string"));
                        const restoredImages: GeneratedImage[] = [];

                        for (const meta of manifest) {
                            try {
                                const imgFile = imagesFolder.file(meta.fileName);
                                if (imgFile) {
                                    // Convert binary back to Base64 data URL
                                    const base64 = await imgFile.async("base64");
                                    restoredImages.push({
                                        id: meta.id,
                                        base64: `data:image/png;base64,${base64}`,
                                        prompt: meta.prompt,
                                        timestamp: meta.timestamp,
                                        characterId: meta.characterId
                                    });
                                }
                            } catch (innerE) { console.warn("Skipping corrupt image:", meta.id); }
                        }
                        // Directly restore to local storage service immediately to save memory
                        if (restoredImages.length > 0) {
                            restoreGeneratedImages(restoredImages);
                        }
                    }
                } catch (e) { console.warn("Error restoring images", e); }
            }

            // 4. Characters & Advanced Data
            const charFolder = zip.folder("characters");
            if (charFolder) {
                // Pre-map folder names to IDs if possible, but mainly rely on file content
                const folderToIdMap: Record<string, string> = {}; 
                
                // Use built-in forEach to safely iterate files
                const entries: { path: string, file: JSZip.JSZipObject }[] = [];
                charFolder.forEach((relativePath, file) => {
                    entries.push({ path: relativePath, file });
                });

                // First Pass: Character Data
                for (const entry of entries) {
                    if (entry.path.endsWith('character_data.json') && !entry.file.dir) {
                        try {
                            const content = await entry.file.async("string");
                            const json = JSON.parse(content);
                            
                            if (json.character) {
                                finalData.characters.push(json.character);
                                const folderName = entry.path.split('/')[0];
                                folderToIdMap[folderName] = json.character.id;
                            }
                            
                            if (json.session && json.character?.id) {
                                finalData.sessions[json.character.id] = json.session;
                            }
                        } catch (e) {
                            console.warn(`Skipping corrupt character file: ${entry.path}`, e);
                        }
                    }
                }

                // Second Pass: Context Data (Smartphone, Social, etc)
                for (const entry of entries) {
                    if (entry.path.includes('/ChatContext/') && entry.path.endsWith('.json') && !entry.file.dir) {
                        try {
                            const content = await entry.file.async("string");
                            const json = JSON.parse(content);
                            
                            let targetId = json.characterId; 

                            // Fallback if ID missing in JSON: infer from folder map
                            if (!targetId) {
                                 const folderName = entry.path.split('/')[0];
                                 targetId = folderToIdMap[folderName];
                            }

                            if (targetId) {
                                if (json.smartphone) finalData.smartphone[targetId] = json.smartphone;
                                if (json.social) finalData.social[targetId] = json.social;
                                if (json.chatContext) finalData.chatContext[targetId] = json.chatContext;
                            }
                        } catch (e) {
                             console.warn(`Skipping corrupt context file: ${entry.path}`, e);
                        }
                    }
                }
            }
            
            // Legacy/Root files Support (Backward Compatibility)
            try {
                const phoneFile = zip.file("smartphone.json");
                if (phoneFile) finalData.smartphone = JSON.parse(await phoneFile.async("string"));
            } catch(e) {}

            try {
                const socialFile = zip.file("social.json");
                if (socialFile) finalData.social = JSON.parse(await socialFile.async("string"));
            } catch(e) {}

            try {
                const groupsFile = zip.file("groups.json");
                if (groupsFile) {
                    const groups = JSON.parse(await groupsFile.async("string"));
                    finalData.sessions = { ...finalData.sessions, ...groups };
                }
            } catch(e) {}

            return finalData;

        } else {
            throw new Error("Unsupported file format. Please use .psc or .json");
        }

    } catch (e) {
        console.error("Import failed:", e);
        return null;
    }
};

export const restoreSystemData = (data: any) => {
    if (!data) return;

    if (data.characters) {
        const validCharacters = data.characters.filter((c: any) => c && typeof c === 'object' && typeof c.id === 'string');
        localStorage.setItem(CHARACTERS_KEY, JSON.stringify(validCharacters));
    }
    if (data.sessions) localStorage.setItem(SESSIONS_KEY, JSON.stringify(data.sessions));
    if (data.history) localStorage.setItem(HISTORY_KEY, JSON.stringify(data.history));
    if (data.settings) {
         const mergedSettings = { ...DEFAULT_SETTINGS, ...data.settings };
         localStorage.setItem(SETTINGS_KEY, JSON.stringify(mergedSettings));
    }
    
    // Restore maps
    if (data.smartphone) localStorage.setItem(PHONE_STORAGE_KEY, JSON.stringify(data.smartphone));
    if (data.social) localStorage.setItem(SOCIAL_STORAGE_KEY, JSON.stringify(data.social));
    if (data.chatContext) localStorage.setItem('pasco_chat_context_v1', JSON.stringify(data.chatContext));
    
    if (data.weather) restoreWeatherState(data.weather);
};
