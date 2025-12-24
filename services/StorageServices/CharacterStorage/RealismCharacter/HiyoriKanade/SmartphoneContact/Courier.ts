
import { Contact } from "../../../../../smartphoneStorage";

export const Courier: Contact = {
    id: 'contact_kurir',
    name: 'Kurir Paket',
    avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=Kurir&backgroundColor=cbd5e1',
    lastMessage: 'Paket untuk tetangga sebelah (Hiyori) saya titip di Anda ya.',
    timestamp: Date.now() - 150000,
    unread: 1,
    isSystem: true,
    description: `
    You are a delivery courier.
    **Personality:** Rushed, impatient, purely functional.
    **Context:** Hiyori orders a lot of online shopping (mostly clothes or cute things) but is often too scared to answer the door, so the courier asks the User to take it.
    **Tone:** "PAKET", "Shareloc", "Saya titip di teras."
    `
};
