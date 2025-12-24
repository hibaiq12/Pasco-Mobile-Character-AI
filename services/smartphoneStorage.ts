
import { Character } from "../types";
import { HIYORI_CONTACTS } from "./StorageServices/CharacterStorage/RealismCharacter/HiyoriKanade/SmartphoneContact/index";

// --- TYPES ---
export interface Contact {
    id: string;
    name: string;
    avatar?: string;
    lastMessage: string;
    timestamp: number;
    unread: number;
    isOnline?: boolean;
    isBlocked?: boolean;
    isSystem?: boolean; // True for Mom, Dad, or the Character itself
    description?: string; // NEW: Personality description for the NPC
}

export interface PhoneMessage {
    id: string;
    senderId: string;
    text: string;
    timestamp: number;
    isMe: boolean;
}

export interface Transaction {
    name: string;
    date: string;
    amount: number;
    icon: string;
    type?: 'transfer' | 'payment' | 'topup' | 'salary' | 'cheat';
}

export interface Job {
    id: string;
    title: string;
    company: string;
    level: 'Entry' | 'Mid' | 'Senior' | 'Executive';
    type: 'Full-time' | 'Part-time' | 'Freelance' | 'Contract';
    salaryDaily: number;
    startHour: number; // 0-23
    endHour: number; // 0-23
    icon: string;
    color: string;
}

export interface InventoryItem {
    id: string;
    name: string;
    quantity: number;
    addedAt: number;
    source: 'shop' | 'gift' | 'found' | 'cheat';
    description?: string;
    category?: string;
}

export interface CharacterPhoneData {
    contacts: Contact[];
    messages: Record<string, PhoneMessage[]>; // Map contactId -> Array of messages
    wallet: {
        balance: number;
        transactions: Transaction[];
    };
    activeJobs: string[]; 
    lastPayDates?: Record<string, number>; 
    inventory: InventoryItem[]; 
    // socialPosts removed -> Moved to SmartphoneSocial.ts
}

const PHONE_STORAGE_KEY = 'pasco_phone_storage_v2';

// --- JOB DATABASE (EXPANDED) ---
export const JOBS_DATA: Job[] = [
    { id: 'job_barista', title: 'Barista', company: 'Starbucks', level: 'Entry', type: 'Part-time', salaryDaily: 150000, startHour: 7, endHour: 13, icon: '☕', color: 'bg-green-600' },
    { id: 'job_teacher', title: 'Guru SD', company: 'SDN 01 Pagi', level: 'Mid', type: 'Full-time', salaryDaily: 250000, startHour: 7, endHour: 14, icon: '📚', color: 'bg-yellow-600' },
    { id: 'job_admin', title: 'Admin Staff', company: 'Shopee', level: 'Entry', type: 'Full-time', salaryDaily: 200000, startHour: 8, endHour: 17, icon: '💻', color: 'bg-orange-500' },
    { id: 'job_bank', title: 'Teller Bank', company: 'BCA', level: 'Entry', type: 'Full-time', salaryDaily: 300000, startHour: 8, endHour: 16, icon: '🏦', color: 'bg-blue-600' },
    { id: 'job_nurse', title: 'Perawat', company: 'RS Siloam', level: 'Mid', type: 'Full-time', salaryDaily: 350000, startHour: 7, endHour: 15, icon: '🏥', color: 'bg-red-500' },
    { id: 'job_driver', title: 'Supir Pribadi', company: 'Family', level: 'Entry', type: 'Full-time', salaryDaily: 180000, startHour: 6, endHour: 18, icon: '🚗', color: 'bg-zinc-600' },
    { id: 'job_chef', title: 'Head Chef', company: 'Grand Hotel', level: 'Senior', type: 'Full-time', salaryDaily: 800000, startHour: 10, endHour: 22, icon: '👨‍🍳', color: 'bg-amber-700' },
    { id: 'job_waiter', title: 'Pelayan', company: 'Sederhana', level: 'Entry', type: 'Part-time', salaryDaily: 120000, startHour: 10, endHour: 18, icon: '🍽️', color: 'bg-red-700' },
    { id: 'job_reception', title: 'Resepsionis', company: 'Marriott', level: 'Entry', type: 'Full-time', salaryDaily: 220000, startHour: 8, endHour: 16, icon: '🛎️', color: 'bg-rose-500' },
    { id: 'job_hr', title: 'HR Manager', company: 'Tokopedia', level: 'Senior', type: 'Full-time', salaryDaily: 750000, startHour: 9, endHour: 17, icon: '👥', color: 'bg-green-500' },
    { id: 'job_dev_jr', title: 'Jr. Developer', company: 'Gojek', level: 'Entry', type: 'Full-time', salaryDaily: 400000, startHour: 9, endHour: 18, icon: '👨‍💻', color: 'bg-green-600' },
    { id: 'job_dev_sr', title: 'Sr. Backend', company: 'Traveloka', level: 'Senior', type: 'Full-time', salaryDaily: 900000, startHour: 10, endHour: 18, icon: '🚀', color: 'bg-blue-500' },
    { id: 'job_uiux', title: 'UI/UX Designer', company: 'Tiket.com', level: 'Mid', type: 'Full-time', salaryDaily: 550000, startHour: 10, endHour: 17, icon: '🎨', color: 'bg-purple-500' },
    { id: 'job_pm', title: 'Product Mgr', company: 'Bukalapak', level: 'Senior', type: 'Full-time', salaryDaily: 850000, startHour: 9, endHour: 18, icon: '📊', color: 'bg-red-600' },
    { id: 'job_ceo', title: 'CEO', company: 'Startup', level: 'Executive', type: 'Full-time', salaryDaily: 2500000, startHour: 8, endHour: 20, icon: '👔', color: 'bg-zinc-800' },
    { id: 'job_marketing', title: 'Marketing', company: 'Wardah', level: 'Mid', type: 'Full-time', salaryDaily: 300000, startHour: 9, endHour: 17, icon: '📢', color: 'bg-pink-500' },
    { id: 'job_accountant', title: 'Akuntan', company: 'Deloitte', level: 'Senior', type: 'Full-time', salaryDaily: 600000, startHour: 8, endHour: 18, icon: '🧮', color: 'bg-emerald-600' },
    { id: 'job_lawyer', title: 'Pengacara', company: 'Hotman Paris', level: 'Senior', type: 'Full-time', salaryDaily: 1500000, startHour: 8, endHour: 17, icon: '⚖️', color: 'bg-amber-600' },
    { id: 'job_architect', title: 'Arsitek', company: 'Wika', level: 'Senior', type: 'Full-time', salaryDaily: 700000, startHour: 9, endHour: 18, icon: '📐', color: 'bg-blue-700' },
    { id: 'job_security', title: 'Satpam', company: 'BCA', level: 'Entry', type: 'Full-time', salaryDaily: 200000, startHour: 22, endHour: 6, icon: '👮', color: 'bg-blue-800' },
    { id: 'job_dj', title: 'Club DJ', company: 'Hollywings', level: 'Mid', type: 'Freelance', salaryDaily: 1000000, startHour: 22, endHour: 4, icon: '🎧', color: 'bg-purple-600' },
    { id: 'job_bartender', title: 'Bartender', company: 'Skye Bar', level: 'Mid', type: 'Part-time', salaryDaily: 400000, startHour: 18, endHour: 2, icon: '🍸', color: 'bg-rose-600' },
    { id: 'job_gamer', title: 'Pro Player', company: 'RRQ', level: 'Senior', type: 'Full-time', salaryDaily: 500000, startHour: 14, endHour: 22, icon: '🎮', color: 'bg-orange-600' },
    { id: 'job_streamer', title: 'Streamer', company: 'YouTube', level: 'Mid', type: 'Freelance', salaryDaily: 300000, startHour: 19, endHour: 23, icon: '📹', color: 'bg-red-600' },
    { id: 'job_writer', title: 'Novelis', company: 'Gramedia', level: 'Mid', type: 'Freelance', salaryDaily: 150000, startHour: 20, endHour: 2, icon: '✍️', color: 'bg-yellow-700' },
    { id: 'job_ojol', title: 'Ojol', company: 'Gojek', level: 'Entry', type: 'Freelance', salaryDaily: 150000, startHour: 6, endHour: 18, icon: '🛵', color: 'bg-green-500' },
    { id: 'job_kurir', title: 'Kurir', company: 'JNE', level: 'Entry', type: 'Full-time', salaryDaily: 180000, startHour: 8, endHour: 17, icon: '📦', color: 'bg-blue-600' },
    { id: 'job_fitness', title: 'Personal Trainer', company: 'Celebrity Fitness', level: 'Mid', type: 'Part-time', salaryDaily: 300000, startHour: 16, endHour: 21, icon: '💪', color: 'bg-red-500' },
    { id: 'job_farmer', title: 'Petani Modern', company: 'Self', level: 'Mid', type: 'Full-time', salaryDaily: 250000, startHour: 5, endHour: 12, icon: '🌾', color: 'bg-green-700' },
    { id: 'job_mechanic', title: 'Mekanik', company: 'Honda', level: 'Mid', type: 'Full-time', salaryDaily: 250000, startHour: 8, endHour: 17, icon: '🔧', color: 'bg-zinc-500' },
    { id: 'job_detective', title: 'Detektif', company: 'Private', level: 'Senior', type: 'Freelance', salaryDaily: 1000000, startHour: 20, endHour: 4, icon: '🕵️', color: 'bg-zinc-900' },
    { id: 'job_psychic', title: 'Peramal', company: 'Online', level: 'Mid', type: 'Freelance', salaryDaily: 500000, startHour: 18, endHour: 22, icon: '🔮', color: 'bg-purple-800' },
    { id: 'job_model', title: 'Model', company: 'Vogue Indo', level: 'Mid', type: 'Part-time', salaryDaily: 2000000, startHour: 9, endHour: 15, icon: '💃', color: 'bg-pink-600' },
    { id: 'job_photographer', title: 'Fotografer', company: 'Freelance', level: 'Mid', type: 'Freelance', salaryDaily: 800000, startHour: 10, endHour: 16, icon: '📸', color: 'bg-zinc-700' },
    { id: 'job_musician', title: 'Musisi Kafe', company: 'Freelance', level: 'Entry', type: 'Part-time', salaryDaily: 300000, startHour: 19, endHour: 23, icon: '🎸', color: 'bg-amber-800' },
    { id: 'job_illustrator', title: 'Illustrator', company: 'Freelance', level: 'Mid', type: 'Freelance', salaryDaily: 450000, startHour: 10, endHour: 18, icon: '🎨', color: 'bg-pink-400' },
    { id: 'job_video_editor', title: 'Video Editor', company: 'Nusantara TV', level: 'Mid', type: 'Full-time', salaryDaily: 350000, startHour: 9, endHour: 18, icon: '🎬', color: 'bg-indigo-500' },
    { id: 'job_copywriter', title: 'Copywriter', company: 'Agency X', level: 'Entry', type: 'Full-time', salaryDaily: 250000, startHour: 9, endHour: 17, icon: '📝', color: 'bg-teal-600' },
    { id: 'job_sound_eng', title: 'Sound Eng.', company: 'Studio 45', level: 'Senior', type: 'Contract', salaryDaily: 600000, startHour: 14, endHour: 22, icon: '🎚️', color: 'bg-zinc-500' },
    { id: 'job_journalist', title: 'Jurnalis', company: 'Detik', level: 'Mid', type: 'Full-time', salaryDaily: 280000, startHour: 8, endHour: 18, icon: '📰', color: 'bg-red-700' },
    { id: 'job_data_analyst', title: 'Data Analyst', company: 'Telkom', level: 'Mid', type: 'Full-time', salaryDaily: 500000, startHour: 9, endHour: 17, icon: '📈', color: 'bg-cyan-600' },
    { id: 'job_cybersec', title: 'Cyber Sec', company: 'Private Gov', level: 'Senior', type: 'Contract', salaryDaily: 1200000, startHour: 20, endHour: 4, icon: '🛡️', color: 'bg-slate-700' },
    { id: 'job_lab_tech', title: 'Lab Tech', company: 'BioFarma', level: 'Entry', type: 'Full-time', salaryDaily: 320000, startHour: 8, endHour: 16, icon: '🧪', color: 'bg-emerald-500' },
    { id: 'job_pharmacist', title: 'Apoteker', company: 'K-24', level: 'Mid', type: 'Full-time', salaryDaily: 350000, startHour: 14, endHour: 22, icon: '💊', color: 'bg-green-400' },
    { id: 'job_baker', title: 'Baker', company: 'BreadTalk', level: 'Entry', type: 'Full-time', salaryDaily: 180000, startHour: 4, endHour: 12, icon: '🥐', color: 'bg-amber-500' },
    { id: 'job_cleaner', title: 'Housekeeping', company: 'GoClean', level: 'Entry', type: 'Freelance', salaryDaily: 120000, startHour: 8, endHour: 16, icon: '🧹', color: 'bg-sky-400' },
    { id: 'job_nanny', title: 'Nanny', company: 'Agency', level: 'Mid', type: 'Contract', salaryDaily: 250000, startHour: 7, endHour: 19, icon: '👶', color: 'bg-rose-300' },
    { id: 'job_florist', title: 'Florist', company: 'Bouquet', level: 'Entry', type: 'Part-time', salaryDaily: 150000, startHour: 9, endHour: 15, icon: '💐', color: 'bg-pink-300' },
    { id: 'job_librarian', title: 'Pustakawan', company: 'Perpusda', level: 'Entry', type: 'Full-time', salaryDaily: 180000, startHour: 8, endHour: 16, icon: '📖', color: 'bg-brown-600' },
    { id: 'job_plumber', title: 'Tukang Pipa', company: 'Freelance', level: 'Mid', type: 'Freelance', salaryDaily: 300000, startHour: 8, endHour: 17, icon: '🚰', color: 'bg-blue-800' },
    { id: 'job_electrician', title: 'Teknisi Listrik', company: 'PLN Partner', level: 'Mid', type: 'Contract', salaryDaily: 350000, startHour: 9, endHour: 17, icon: '⚡', color: 'bg-yellow-500' },
    { id: 'job_carpenter', title: 'Tukang Kayu', company: 'Jepara', level: 'Senior', type: 'Freelance', salaryDaily: 400000, startHour: 7, endHour: 16, icon: '🪚', color: 'bg-orange-800' },
    { id: 'job_truck_driver', title: 'Supir Truk', company: 'Logistik', level: 'Mid', type: 'Full-time', salaryDaily: 250000, startHour: 18, endHour: 6, icon: '🚛', color: 'bg-slate-600' },
    { id: 'job_fisherman', title: 'Nelayan', company: 'Self', level: 'Entry', type: 'Freelance', salaryDaily: 200000, startHour: 3, endHour: 10, icon: '🐟', color: 'bg-cyan-700' },
    { id: 'job_informant', title: 'Informan', company: '???', level: 'Mid', type: 'Freelance', salaryDaily: 500000, startHour: 22, endHour: 2, icon: '👁️', color: 'bg-black' },
    { id: 'job_bouncer', title: 'Bouncer', company: 'Dragonfly', level: 'Mid', type: 'Part-time', salaryDaily: 350000, startHour: 21, endHour: 3, icon: '🦍', color: 'bg-zinc-900' },
    { id: 'job_smuggler', title: 'Kurir Khusus', company: 'Underground', level: 'Senior', type: 'Contract', salaryDaily: 2000000, startHour: 0, endHour: 4, icon: '🕶️', color: 'bg-gray-800' },
    { id: 'job_hacker', title: 'White Hat', company: 'Bounty', level: 'Senior', type: 'Freelance', salaryDaily: 1500000, startHour: 18, endHour: 6, icon: '💻', color: 'bg-green-900' },
    { id: 'job_street_racer', title: 'Joki Balap', company: 'Street', level: 'Senior', type: 'Freelance', salaryDaily: 3000000, startHour: 23, endHour: 3, icon: '🏁', color: 'bg-red-800' },
    { id: 'job_pilot', title: 'Pilot Private', company: 'Charter', level: 'Executive', type: 'Contract', salaryDaily: 5000000, startHour: 6, endHour: 18, icon: '✈️', color: 'bg-sky-800' },
    { id: 'job_sommelier', title: 'Sommelier', company: 'Fine Dining', level: 'Senior', type: 'Full-time', salaryDaily: 900000, startHour: 16, endHour: 23, icon: '🍷', color: 'bg-purple-900' },
    { id: 'job_jewelry', title: 'Gemologist', company: 'Tiffany', level: 'Senior', type: 'Full-time', salaryDaily: 1200000, startHour: 10, endHour: 18, icon: '💎', color: 'bg-teal-400' },
    { id: 'job_art_dealer', title: 'Art Dealer', company: 'Gallery', level: 'Executive', type: 'Freelance', salaryDaily: 2000000, startHour: 11, endHour: 17, icon: '🖼️', color: 'bg-amber-400' },
    { id: 'job_yoga', title: 'Yoga Inst.', company: 'Studio', level: 'Mid', type: 'Part-time', salaryDaily: 250000, startHour: 6, endHour: 10, icon: '🧘', color: 'bg-rose-400' },
    { id: 'job_tattoo', title: 'Tattoo Artist', company: 'Ink Studio', level: 'Senior', type: 'Freelance', salaryDaily: 800000, startHour: 13, endHour: 21, icon: '✒️', color: 'bg-slate-800' },
    { id: 'job_vet', title: 'Veterinarian', company: 'Vet Clinic', level: 'Senior', type: 'Full-time', salaryDaily: 700000, startHour: 8, endHour: 17, icon: '🐾', color: 'bg-emerald-700' },
    { id: 'job_clown', title: 'Badut Pesta', company: 'Freelance', level: 'Entry', type: 'Freelance', salaryDaily: 300000, startHour: 10, endHour: 14, icon: '🤡', color: 'bg-red-400' },
    { id: 'job_ghostwriter', title: 'Ghostwriter', company: 'Publisher', level: 'Senior', type: 'Freelance', salaryDaily: 600000, startHour: 20, endHour: 2, icon: '👻', color: 'bg-gray-400' },
    { id: 'job_archeologist', title: 'Arkeolog', company: 'Museum', level: 'Senior', type: 'Contract', salaryDaily: 550000, startHour: 7, endHour: 16, icon: '🏺', color: 'bg-yellow-800' },
    { id: 'job_translator', title: 'Penerjemah', company: 'Embassy', level: 'Mid', type: 'Freelance', salaryDaily: 400000, startHour: 9, endHour: 17, icon: '🗣️', color: 'bg-indigo-400' },
    { id: 'job_guide', title: 'Tour Guide', company: 'Bali Tour', level: 'Entry', type: 'Freelance', salaryDaily: 250000, startHour: 8, endHour: 18, icon: '🚩', color: 'bg-orange-400' },
    { id: 'job_paramedic', title: 'Paramedis', company: 'Ambulance', level: 'Mid', type: 'Full-time', salaryDaily: 380000, startHour: 18, endHour: 6, icon: '🚑', color: 'bg-red-600' },
    { id: 'job_firefighter', title: 'Pemadam', company: 'Damkar', level: 'Mid', type: 'Full-time', salaryDaily: 400000, startHour: 0, endHour: 23, icon: '🔥', color: 'bg-orange-700' },
];

// --- PUBLIC API ---

export const getSmartphoneData = (characterId: string): CharacterPhoneData | null => {
    try {
        const store = localStorage.getItem(PHONE_STORAGE_KEY);
        if (!store) return null;
        const parsed = JSON.parse(store);
        return parsed[characterId] || null;
    } catch (e) {
        console.error("Phone storage read error", e);
        return null;
    }
};

export const saveSmartphoneData = (characterId: string, data: CharacterPhoneData) => {
    try {
        const store = localStorage.getItem(PHONE_STORAGE_KEY);
        const parsed = store ? JSON.parse(store) : {};
        parsed[characterId] = data;
        localStorage.setItem(PHONE_STORAGE_KEY, JSON.stringify(parsed));
    } catch (e) {
        console.error("Phone storage write error", e);
    }
};

export const initSmartphoneData = (character: Character): CharacterPhoneData => {
    
    // START MOD: Hiyori Custom Contacts Logic
    let customContacts: Contact[] = [];
    if (character.id === 'char-hiyori') {
        customContacts = HIYORI_CONTACTS; // Imported from index.ts
    } else {
        // Default "Mom" contact (Universal NPC)
        customContacts = [{
            id: 'mom',
            name: 'Ibu',
            avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=Mom&backgroundColor=db2777',
            lastMessage: 'Jangan lupa makan ya nak.',
            timestamp: Date.now() - 86400000,
            unread: 1,
            isOnline: false,
            isSystem: true,
            description: "Your mother. Caring, sometimes fussy, worries about your health and eating habits."
        }];
    }
    // END MOD

    // The Character Contact (The entity you are talking to) - THIS IS THE CHATBOT HERSELF IN USER PHONE
    const charContact: Contact = {
        id: character.id,
        name: character.name,
        avatar: character.avatar,
        lastMessage: 'Connected.',
        timestamp: Date.now(),
        unread: 0,
        isOnline: true,
        isSystem: true
    };

    // Combine Character + Custom Contacts
    const allContacts = [charContact, ...customContacts];

    // Initialize messages based on contacts
    const initialMessages: Record<string, PhoneMessage[]> = {};
    customContacts.forEach(c => {
        if (c.lastMessage) {
            initialMessages[c.id] = [{ 
                id: `msg-${c.id}-init`, 
                senderId: c.id, 
                text: c.lastMessage, 
                timestamp: c.timestamp, 
                isMe: false 
            }];
        }
    });

    const initialData: CharacterPhoneData = {
        contacts: allContacts,
        messages: initialMessages,
        wallet: {
            balance: 1500000, 
            transactions: [
                { name: "Uang Saku", date: "Kemarin", amount: 1500000, icon: "💵", type: 'topup' }
            ]
        },
        activeJobs: [], 
        lastPayDates: {}, 
        inventory: []
    };
    
    saveSmartphoneData(character.id, initialData);
    return initialData;
};

// HELPER FUNCTIONS (unchanged)
export const addPhoneMessage = (characterId: string, contactId: string, message: PhoneMessage) => {
    let data = getSmartphoneData(characterId);
    if (!data) return; 

    if (!data.messages[contactId]) {
        data.messages[contactId] = [];
    }
    
    const exists = data.messages[contactId].some(m => m.id === message.id);
    if (!exists) {
        data.messages[contactId].push(message);
        const contactIdx = data.contacts.findIndex(c => c.id === contactId);
        if (contactIdx !== -1) {
            data.contacts[contactIdx] = {
                ...data.contacts[contactIdx],
                lastMessage: message.text,
                timestamp: message.timestamp,
                unread: !message.isMe ? (data.contacts[contactIdx].unread + 1) : 0
            };
        }
        saveSmartphoneData(characterId, data);
    }
};

export const addPhoneContact = (characterId: string, newContact: Contact) => {
    const data = getSmartphoneData(characterId);
    if (!data) return;
    const exists = data.contacts.find(c => c.id === newContact.id || c.name === newContact.name);
    if (!exists) {
        data.contacts.push(newContact);
        saveSmartphoneData(characterId, data);
    }
};

export const updateWalletBalance = (characterId: string, amount: number, description: string, type: 'transfer' | 'payment' | 'topup' | 'salary' | 'cheat') => {
    const data = getSmartphoneData(characterId);
    if (!data) return false;
    if (data.wallet.balance + amount < 0) return false; 
    data.wallet.balance += amount;
    data.wallet.transactions.unshift({
        name: description,
        date: "Hari Ini",
        amount: amount,
        icon: type === 'transfer' ? '↗️' : (type === 'payment' ? '🛍️' : (type === 'salary' ? '💼' : (type === 'cheat' ? '👾' : '💵'))),
        type: type
    });
    saveSmartphoneData(characterId, data);
    return true;
};

export const setWalletBalance = (characterId: string, amount: number) => {
    const data = getSmartphoneData(characterId);
    if (!data) return false;
    data.wallet.balance = amount;
    data.wallet.transactions.unshift({
        name: "Set Money Cheat",
        date: "Hari Ini",
        amount: amount,
        icon: "👾",
        type: 'cheat'
    });
    saveSmartphoneData(characterId, data);
    return true;
};

export const addItemToInventory = (characterId: string, itemName: string, source: 'shop' | 'gift' | 'found' | 'cheat' = 'shop', category: string = 'General', description: string = 'No description') => {
    const data = getSmartphoneData(characterId);
    if (!data) return;
    if (!data.inventory) data.inventory = [];
    const existingItemIndex = data.inventory.findIndex(item => item.name.toLowerCase() === itemName.toLowerCase());
    if (existingItemIndex !== -1) {
        data.inventory[existingItemIndex].quantity += 1;
    } else {
        const newItem: InventoryItem = {
            id: crypto.randomUUID(),
            name: itemName,
            quantity: 1,
            addedAt: Date.now(),
            source: source,
            category: category,
            description: description
        };
        data.inventory.unshift(newItem); 
    }
    saveSmartphoneData(characterId, data);
};

export const updateInventoryItem = (characterId: string, itemId: string, updates: Partial<InventoryItem>) => {
    const data = getSmartphoneData(characterId);
    if (!data || !data.inventory) return;
    const idx = data.inventory.findIndex(item => item.id === itemId);
    if (idx !== -1) {
        data.inventory[idx] = { ...data.inventory[idx], ...updates };
        saveSmartphoneData(characterId, data);
    }
};

export const removeItemFromInventory = (characterId: string, itemId: string): InventoryItem | null => {
    const data = getSmartphoneData(characterId);
    if (!data || !data.inventory) return null;
    const idx = data.inventory.findIndex(item => item.id === itemId);
    if (idx === -1) return null;
    const item = data.inventory[idx];
    if (item.quantity > 1) {
        item.quantity -= 1;
    } else {
        data.inventory.splice(idx, 1);
    }
    saveSmartphoneData(characterId, data);
    return item;
};

export const claimJobSalary = (characterId: string, jobId: string, currentVirtualTime: number): boolean => {
    const data = getSmartphoneData(characterId);
    if (!data) return false;
    if (!data.lastPayDates) data.lastPayDates = {};
    const lastPayTimestamp = data.lastPayDates[jobId] || 0;
    const lastDate = new Date(lastPayTimestamp).toLocaleDateString();
    const currentDate = new Date(currentVirtualTime).toLocaleDateString();
    if (lastDate !== currentDate) {
        data.lastPayDates[jobId] = currentVirtualTime;
        saveSmartphoneData(characterId, data);
        return true;
    }
    return false; 
};

export const toggleJobApplication = (characterId: string, jobId: string): boolean => {
    const data = getSmartphoneData(characterId);
    if (!data) return false;
    if (!data.activeJobs) data.activeJobs = [];
    const idx = data.activeJobs.indexOf(jobId);
    if (idx !== -1) {
        data.activeJobs.splice(idx, 1);
    } else {
        if (data.activeJobs.length >= 8) return false;
        data.activeJobs.push(jobId);
    }
    saveSmartphoneData(characterId, data);
    return true;
};
