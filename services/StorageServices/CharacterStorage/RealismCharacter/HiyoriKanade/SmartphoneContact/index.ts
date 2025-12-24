
import { UserMom } from './UserMom';
import { UserDad } from './UserDad';
import { UserSis } from './UserSis';
import { HiyoriMom } from './HiyoriMom';
import { HiyoriDad } from './HiyoriDad';
import { RinaBully } from './RinaBully';
import { KenjiRep } from './KenjiRep';
import { DodiBestie } from './DodiBestie';
import { SariEx } from './SariEx';
import { MsYumi } from './MsYumi';
import { Courier } from './Courier';
import { MysteryStalker } from './MysteryStalker';
import { Senpai } from './Senpai';
import { DrAmara } from './DrAmara';
import { AdminSlot } from './AdminSlot';

// Complete Roster of Mini Chatbots for Hiyori Kanade
export const HIYORI_CONTACTS = [
    // 1. User's Family
    UserMom, 
    UserDad, 
    UserSis,

    // 2. Hiyori's Family
    HiyoriMom, 
    HiyoriDad,

    // 3. School Environment
    RinaBully, 
    KenjiRep, 
    MsYumi,
    DrAmara,

    // 4. User's Circle
    DodiBestie, 
    SariEx, 
    Senpai,

    // 5. Random/Events
    Courier, 
    MysteryStalker, 
    AdminSlot
];
