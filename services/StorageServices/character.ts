
import { Character } from "../../types";
import { CHARACTERS_KEY, SESSIONS_KEY, PHONE_STORAGE_KEY } from "./constants";

export const getCharacters = (): Character[] => {
  try {
    const data = localStorage.getItem(CHARACTERS_KEY);
    const parsed = data ? JSON.parse(data) : [];
    
    // Validate it is an array
    if (!Array.isArray(parsed)) return [];

    // Filter out nulls or invalid objects that might cause crashes
    return parsed.filter((c: any) => c && typeof c === 'object' && typeof c.id === 'string');
  } catch (e) {
    console.error("Failed to load characters", e);
    return [];
  }
};

export const saveCharacter = (character: Character) => {
  const chars = getCharacters();
  const index = chars.findIndex(c => c.id === character.id);
  if (index >= 0) {
    chars[index] = character;
  } else {
    chars.push(character);
  }
  localStorage.setItem(CHARACTERS_KEY, JSON.stringify(chars));
};

export const deleteCharacter = (id: string) => {
    const chars = getCharacters().filter(c => c.id !== id);
    localStorage.setItem(CHARACTERS_KEY, JSON.stringify(chars));
    
    // Also cleanup session
    const sessionData = localStorage.getItem(SESSIONS_KEY);
    if (sessionData) {
        const sessions = JSON.parse(sessionData);
        delete sessions[id];
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    }
    
    // Cleanup Phone Data
    const phoneStore = localStorage.getItem(PHONE_STORAGE_KEY);
    if (phoneStore) {
        const phoneData = JSON.parse(phoneStore);
        if (phoneData[id]) {
            delete phoneData[id];
            localStorage.setItem(PHONE_STORAGE_KEY, JSON.stringify(phoneData));
        }
    }
};
