
import { saveCharacter } from '../character';
import { Sparkle } from './Sparkle';
import { Hanabi } from './Hanabi';
import { HuTao } from './HuTao';
import { Shia } from './Shia';
import { Shikimori } from './Shikimori';
import { Firefly } from './Firefly';
import { Vespera } from './Vespera';
import { Selene } from './Selene';
import { Raven } from './Raven';
import { DelPiero } from './DelPiero';
import { HiyoriKanade } from './RealismCharacter/HiyoriKanade';
import { HikaruSora } from './RealismCharacter/HikaruSora'; // Import Hikaru

export const seedNewCharacters = () => {
    const newCharacters = [
        Sparkle, 
        Hanabi, 
        HuTao, 
        Shia, 
        Shikimori, 
        Firefly, 
        Vespera, 
        Selene, 
        Raven, 
        DelPiero, 
        HiyoriKanade,
        HikaruSora // Register Hikaru
    ];
    
    newCharacters.forEach(char => saveCharacter(char));
};
