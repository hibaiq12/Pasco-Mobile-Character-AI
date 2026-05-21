import { get, set } from 'idb-keyval';
import { SavedStory, Character, ChatSession } from "../../types";
import { HISTORY_KEY } from "./constants";

// In-memory cache
let historyCache: SavedStory[] = [];
let isHistoryLoaded = false;

export const loadHistoryFromDB = async () => {
    try {
        const stored = await get<SavedStory[]>(HISTORY_KEY);
        if (stored) {
            historyCache = stored;
        } else {
            const data = localStorage.getItem(HISTORY_KEY);
            if (data) {
                historyCache = JSON.parse(data);
                await set(HISTORY_KEY, historyCache);
                localStorage.removeItem(HISTORY_KEY);
            }
        }
        isHistoryLoaded = true;
    } catch(e) {
        console.error("Failed to load history from DB", e);
    }
}

export const getSavedStories = (): SavedStory[] => {
    return historyCache;
};

export const saveStorySnapshotAsync = async (character: Character, session: ChatSession, name: string, type: 'manual' | 'auto' = 'manual') => {
    let stories = [...historyCache];
    
    if (type === 'auto') {
        const existingAutoIndex = stories.findIndex(s => s.characterId === character.id && s.type === 'auto');
        if (existingAutoIndex !== -1) {
            stories[existingAutoIndex] = {
                ...stories[existingAutoIndex],
                sessionData: session,
                savedAt: Date.now(),
                saveName: "Auto-Save",
                avatar: character.avatar
            };
            if (existingAutoIndex > 0) {
                 const updatedStory = stories.splice(existingAutoIndex, 1)[0];
                 stories.unshift(updatedStory);
            }
        } else {
            const newStory: SavedStory = {
                id: crypto.randomUUID(),
                characterId: character.id,
                characterName: character.name,
                avatar: character.avatar,
                saveName: "Auto-Save",
                color: '#10b981', 
                savedAt: Date.now(),
                sessionData: session,
                type: 'auto'
            };
            stories.unshift(newStory);
        }
    } else {
        const newStory: SavedStory = {
            id: crypto.randomUUID(),
            characterId: character.id,
            characterName: character.name,
            avatar: character.avatar,
            saveName: name,
            color: '#7c3aed', 
            savedAt: Date.now(),
            sessionData: session,
            type: 'manual'
        };
        stories.unshift(newStory);
    }
    
    if (stories.length > 50) {
        stories = stories.slice(0, 50);
    }

    historyCache = stories;
    
    try {
        await set(HISTORY_KEY, stories);
    } catch (e: any) {
        console.error("Storage Full. IDB failed?", e);
    }
};

export const saveStorySnapshot = (character: Character, session: ChatSession, name: string, type: 'manual' | 'auto' = 'manual') => {
    saveStorySnapshotAsync(character, session, name, type);
};

export const updateSavedStory = async (id: string, newName: string) => {
    historyCache = historyCache.map(s => s.id === id ? { ...s, saveName: newName } : s);
    await set(HISTORY_KEY, historyCache);
};

export const deleteSavedStory = async (id: string) => {
    historyCache = historyCache.filter(s => s.id !== id);
    await set(HISTORY_KEY, historyCache);
};

export const clearAllHistory = async () => {
    historyCache = [];
    await set(HISTORY_KEY, []);
};
