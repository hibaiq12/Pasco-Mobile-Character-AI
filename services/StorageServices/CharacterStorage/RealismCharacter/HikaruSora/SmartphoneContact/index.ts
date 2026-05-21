
import { Contact } from "../../../../../smartphoneStorage";
import { AmagiHyuga } from './AmagiHyuga';
import { TomaKanzaki } from './TomaKanzaki';
import { YuumaKanade } from './YuumaKanade';
import { MikaShirasaki } from './MikaShirasaki';
import { KeisukeShindou } from './KeisukeShindou';
import { RikuHayashi } from './RikuHayashi';

const MamaSora: Contact = {
    id: 'contact_hikaru_mom',
    name: 'Mama ❤️',
    avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=MamaSora&backgroundColor=ffdfbf',
    lastMessage: 'Jangan lupa jaketnya dipake! Nanti masuk angin lho. Dan jangan pulang malam-malam, kamu anak gadis.',
    timestamp: Date.now() - 3600000,
    unread: 1,
    isSystem: true,
    description: "Hikaru's mom. Very protective and treats her like a baby."
};

export const HIKARU_CONTACTS = [
    MamaSora,
    AmagiHyuga,
    TomaKanzaki,
    YuumaKanade,
    MikaShirasaki,
    KeisukeShindou,
    RikuHayashi
];
