import { OutfitItem } from "../types";

export interface ChatContextData {
    userLocation: string;
    botLocation: string;
    outfits: OutfitItem[];
    responseLength: 'concise' | 'short' | 'medium' | 'long';
    timeSkip: { d: string, h: string, m: string, s: string };
}

const CONTEXT_STORAGE_KEY = 'pasco_chat_context_v1';

export const getChatContext = (characterId: string): ChatContextData => {
    try {
        const store = localStorage.getItem(CONTEXT_STORAGE_KEY);
        const parsed = store ? JSON.parse(store) : {};
        return parsed[characterId] || {
            userLocation: '',
            botLocation: '',
            outfits: [],
            responseLength: 'concise',
            timeSkip: { d: '0', h: '0', m: '0', s: '0' }
        };
    } catch (e) {
        console.error("Context storage read error", e);
        return {
            userLocation: '',
            botLocation: '',
            outfits: [],
            responseLength: 'concise',
            timeSkip: { d: '0', h: '0', m: '0', s: '0' }
        };
    }
};

export const saveChatContext = (characterId: string, data: ChatContextData) => {
    try {
        const store = localStorage.getItem(CONTEXT_STORAGE_KEY);
        const parsed = store ? JSON.parse(store) : {};
        parsed[characterId] = data;
        localStorage.setItem(CONTEXT_STORAGE_KEY, JSON.stringify(parsed));
    } catch (e) {
        console.error("Context storage write error", e);
    }
};

// For Migration
export const getAllChatContexts = () => {
    try {
        const store = localStorage.getItem(CONTEXT_STORAGE_KEY);
        return store ? JSON.parse(store) : {};
    } catch (e) {
        return {};
    }
};

export const restoreChatContexts = (allData: Record<string, ChatContextData>) => {
    localStorage.setItem(CONTEXT_STORAGE_KEY, JSON.stringify(allData));
};