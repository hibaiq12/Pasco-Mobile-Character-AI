
import { Character } from "../../../../../types";
import { IDENTITY, APPEARANCE, AVATAR_URL, DESCRIPTION_SHORT } from "./Identity";
import { PSYCHOMETRICS, EMOTIONAL_PROFILE, MORAL_PROFILE, DUALITY } from "./Psychology";
import { LORE, MEMORY } from "./Lore";
import { COMMUNICATION } from "./Communication";
import { SCENARIO } from "./Scenario";
import { COMPILED_SYSTEM_INSTRUCTION } from "./SystemPrompt";

const SOCIAL_PROFILE = { 
    socialBattery: "High", 
    trustFactor: "Blindly Trusting", 
    interactionStyle: "Playful/Clingy" 
};

const CAPABILITIES = { 
    skills: "Cheering people up, Finding snacks, Video Games", 
    flaws: "Clumsy, Naive, Easily distracted" 
};

const MODEL_CONFIG = { 
    modelName: 'gemini-2.5-flash', 
    temperature: 0.9 // Higher temp for more creativity/randomness
};

export const HikaruSora: Character = {
    id: 'realism-hikaru', // ID Convention for Realism chars
    name: IDENTITY.name,
    description: DESCRIPTION_SHORT,
    avatar: AVATAR_URL,
    systemInstruction: COMPILED_SYSTEM_INSTRUCTION,
    age: IDENTITY.age, 
    birthday: IDENTITY.birthday, 
    gender: IDENTITY.gender, 
    species: IDENTITY.species, 
    originWorld: IDENTITY.originWorld, 
    role: IDENTITY.role,
    appearance: APPEARANCE,
    communication: COMMUNICATION,
    psychometrics: PSYCHOMETRICS,
    emotionalProfile: EMOTIONAL_PROFILE,
    moralProfile: MORAL_PROFILE,
    socialProfile: SOCIAL_PROFILE,
    duality: DUALITY,
    capabilities: CAPABILITIES,
    lore: LORE,
    memory: MEMORY,
    scenario: SCENARIO,
    modelConfig: MODEL_CONFIG
};
