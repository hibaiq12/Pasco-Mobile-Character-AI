
import { Character } from "../types";
import { 
    CharacterPhoneData, 
    Contact, 
    getSmartphoneData as getBaseData, 
    saveSmartphoneData as saveBaseData, 
    initSmartphoneData as initBaseData,
    InventoryItem,
    Job,
    JOBS_DATA
} from "./smartphoneStorage";

// Wrapper function to ensure we always target the bot's specific ID
const getBotId = (baseId: string) => baseId.endsWith('_bot') ? baseId : `${baseId}_bot`;

export const getChatbotData = (characterId: string): CharacterPhoneData | null => {
    return getBaseData(getBotId(characterId));
};

export const saveChatbotData = (characterId: string, data: CharacterPhoneData) => {
    saveBaseData(getBotId(characterId), data);
};

export const initChatbotData = (character: Character): CharacterPhoneData => {
    const botId = getBotId(character.id);
    
    // Custom initialization for Bot: They only have "User" as a contact initially
    const userContact: Contact = {
        id: 'user', // Special ID representing the real human user
        name: 'User',
        avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=User&backgroundColor=e2e8f0',
        lastMessage: 'Connected.',
        timestamp: Date.now(),
        unread: 0,
        isOnline: true,
        isSystem: true
    };

    const initialData: CharacterPhoneData = {
        contacts: [userContact],
        messages: {},
        wallet: {
            balance: 5000000, // Bots start with more money for gameplay balance
            transactions: [
                { name: "Initial Balance", date: "System", amount: 5000000, icon: "🏦", type: 'topup' }
            ]
        },
        activeJobs: [],
        lastPayDates: {},
        inventory: []
    };
    
    saveBaseData(botId, initialData);
    return initialData;
};

// --- WRAPPED HELPERS ---

export const botToggleJob = (characterId: string, jobId: string) => {
    const data = getChatbotData(characterId);
    if (!data) return;
    if (!data.activeJobs) data.activeJobs = [];
    
    const idx = data.activeJobs.indexOf(jobId);
    if (idx !== -1) {
        data.activeJobs.splice(idx, 1);
    } else {
        if (data.activeJobs.length >= 8) return;
        data.activeJobs.push(jobId);
    }
    saveChatbotData(characterId, data);
};

export const botUpdateInventory = (characterId: string, itemId: string, updates: Partial<InventoryItem>) => {
    const data = getChatbotData(characterId);
    if (!data || !data.inventory) return;
    const idx = data.inventory.findIndex(item => item.id === itemId);
    if (idx !== -1) {
        data.inventory[idx] = { ...data.inventory[idx], ...updates };
        saveChatbotData(characterId, data);
    }
};

export { JOBS_DATA };
