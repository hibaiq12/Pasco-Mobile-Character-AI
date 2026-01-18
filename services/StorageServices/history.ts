
import { SavedStory, Character, ChatSession } from "../../types";
import { HISTORY_KEY } from "./constants";

export const getSavedStories = (): SavedStory[] => {
    try {
        const data = localStorage.getItem(HISTORY_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
};

export const saveStorySnapshot = (character: Character, session: ChatSession, name: string, type: 'manual' | 'auto' = 'manual') => {
    let stories = getSavedStories();
    
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
    
    // Initial Safety Limit
    if (stories.length > 20) {
        stories = stories.slice(0, 20);
    }

    // --- ROBUST QUOTA HANDLING ---
    const saveWithTrim = (data: SavedStory[]) => {
        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(data));
        } catch (e: any) {
             if (e.name === 'QuotaExceededError' || e.code === 22) {
                 console.warn("Storage Full. Trimming history to save new snapshot...");
                 if (data.length > 5) {
                     // Remove oldest story if we have more than 5
                     // Prioritize removing MANUAL saves from the END, or oldest AUTO
                     data.pop(); 
                     saveWithTrim(data); // Retry recursively
                 } else {
                     console.error("Critical: Storage full even with minimal history. Snapshot failed.");
                 }
             } else {
                 console.error("Unknown storage error", e);
             }
        }
    };

    saveWithTrim(stories);
};

export const updateSavedStory = (updatedStory: SavedStory) => {
    try {
        const stories = getSavedStories();
        const index = stories.findIndex(s => s.id === updatedStory.id);
        if (index !== -1) {
            stories[index] = updatedStory;
            localStorage.setItem(HISTORY_KEY, JSON.stringify(stories));
        }
    } catch (e) {
        console.error("Failed to update story:", e);
    }
};

export const deleteSavedStory = (id: string) => {
    try {
        const stories = getSavedStories().filter(s => s.id !== id);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(stories));
    } catch (e) {
        console.error("Failed to delete story:", e);
    }
};
