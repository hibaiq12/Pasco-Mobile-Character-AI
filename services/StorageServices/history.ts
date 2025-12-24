
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
        // Check if an auto-save already exists for this character
        const existingAutoIndex = stories.findIndex(s => s.characterId === character.id && s.type === 'auto');
        
        if (existingAutoIndex !== -1) {
            // Update existing auto-save
            stories[existingAutoIndex] = {
                ...stories[existingAutoIndex],
                sessionData: session,
                savedAt: Date.now(),
                saveName: "Auto-Save", // Ensure name remains consistent
                avatar: character.avatar // Update avatar in case it changed
            };
            // Move to top if not already
            if (existingAutoIndex > 0) {
                 const updatedStory = stories.splice(existingAutoIndex, 1)[0];
                 stories.unshift(updatedStory);
            }
        } else {
            // Create new auto-save
            const newStory: SavedStory = {
                id: crypto.randomUUID(),
                characterId: character.id,
                characterName: character.name,
                avatar: character.avatar,
                saveName: "Auto-Save",
                color: '#10b981', // Emerald for Auto
                savedAt: Date.now(),
                sessionData: session,
                type: 'auto'
            };
            stories.unshift(newStory);
        }
    } else {
        // Manual Save - Always create new
        const newStory: SavedStory = {
            id: crypto.randomUUID(),
            characterId: character.id,
            characterName: character.name,
            avatar: character.avatar,
            saveName: name,
            color: '#7c3aed', // Default Violet
            savedAt: Date.now(),
            sessionData: session,
            type: 'manual'
        };
        stories.unshift(newStory);
    }
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(stories));
};

export const updateSavedStory = (updatedStory: SavedStory) => {
    const stories = getSavedStories();
    const index = stories.findIndex(s => s.id === updatedStory.id);
    if (index !== -1) {
        stories[index] = updatedStory;
        localStorage.setItem(HISTORY_KEY, JSON.stringify(stories));
    }
};

export const deleteSavedStory = (id: string) => {
    const stories = getSavedStories().filter(s => s.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(stories));
};
