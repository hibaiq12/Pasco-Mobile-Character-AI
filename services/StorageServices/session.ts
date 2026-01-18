
import { ChatSession } from "../../types";
import { SESSIONS_KEY } from "./constants";
import { getCharacters } from "./character";

export const getSession = (characterId: string): ChatSession => {
  try {
    const data = localStorage.getItem(SESSIONS_KEY);
    const sessions: Record<string, ChatSession> = data ? JSON.parse(data) : {};
    
    if (!sessions[characterId]) {
      let defaultTime = Date.now();
      try {
          const chars = getCharacters();
          const char = chars.find(c => c.id === characterId);
          if (char && char.scenario?.startTime) {
               const s = char.scenario.startTime;
               const pYear = parseInt(s.year);
               const pMonth = parseInt(s.month);
               const pDay = parseInt(s.day);
               const pHour = parseInt(s.hour);
               const pMinute = parseInt(s.minute);
               
               if (!isNaN(pYear) && !isNaN(pMonth) && !isNaN(pDay) && !isNaN(pHour) && !isNaN(pMinute)) {
                   defaultTime = new Date(pYear, pMonth - 1, pDay, pHour, pMinute).getTime();
               }
          }
      } catch (err) {}

      return {
        characterId,
        messages: [],
        lastUpdated: Date.now(),
        virtualTime: defaultTime
      };
    }
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
  try {
      const data = localStorage.getItem(SESSIONS_KEY);
      const sessions: Record<string, ChatSession> = data ? JSON.parse(data) : {};
      sessions[session.characterId] = session;
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (e) {
      console.error("Failed to save session (Quota Exceeded?):", e);
  }
};
