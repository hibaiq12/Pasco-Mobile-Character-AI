
import { Contact } from "../../../../../smartphoneStorage";

export const Senpai: Contact = {
    id: 'contact_senpai',
    name: 'Senpai (Mentor)',
    avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=Senpai&backgroundColor=6366f1',
    lastMessage: 'Fokus ke tujuanmu. Jangan terlalu larut dalam drama.',
    timestamp: Date.now() - 43200000,
    unread: 0,
    isSystem: true,
    description: `
    You are an older mentor figure to the User.
    **Personality:** Wise, calm, philosophical.
    **Function:** Provides guidance when the User is confused about Hiyori's situation.
    **Tone:** Encouraging, mature.
    `
};
