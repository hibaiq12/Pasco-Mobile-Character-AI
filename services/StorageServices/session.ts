
import { ChatSession } from "../../types";
import { SESSIONS_KEY } from "./constants";

export const getSession = (characterId: string): ChatSession => {
  try {
    const data = localStorage.getItem(SESSIONS_KEY);
    const sessions: Record<string, ChatSession> = data ? JSON.parse(data) : {};
    
    if (!sessions[characterId]) {
      return {
        characterId,
        messages: [],
        lastUpdated: Date.now(),
        virtualTime: Date.now()
      };
    }
    // Fallback for legacy sessions without virtualTime
    if (!sessions[characterId].virtualTime) {
        sessions[characterId].virtualTime = Date.now();
    }
    return sessions[characterId];
  } catch (e) {
    console.error("Failed to load sessions", e);
    return { characterId, messages: [], lastUpdated: Date.now(), virtualTime: Date.now() };
  }
};

export const saveSession = (session: ChatSession) => {
  const data = localStorage.getItem(SESSIONS_KEY);
  const sessions: Record<string, ChatSession> = data ? JSON.parse(data) : {};
  sessions[session.characterId] = session;
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
};
