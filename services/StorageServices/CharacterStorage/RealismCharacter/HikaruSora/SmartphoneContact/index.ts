
import { Contact } from "../../../../../smartphoneStorage";

const MamaSora: Contact = {
    id: 'contact_hikaru_mom',
    name: 'Mama ❤️',
    avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=MamaSora&backgroundColor=ffdfbf',
    lastMessage: 'Jangan lupa jaketnya dipake! Nanti masuk angin lho.',
    timestamp: Date.now() - 3600000,
    unread: 1,
    isSystem: true,
    description: "Hikaru's mom. Very protective and treats him like a baby."
};

const RyuGaming: Contact = {
    id: 'contact_ryu',
    name: 'Ryu (Mabar)',
    avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=Ryu&backgroundColor=c0cbdc',
    lastMessage: 'Login oi! Rank push!',
    timestamp: Date.now() - 7200000,
    unread: 3,
    isSystem: true,
    description: "Hikaru's gaming buddy. A bit toxic but fun."
};

export const HIKARU_CONTACTS = [MamaSora, RyuGaming];
