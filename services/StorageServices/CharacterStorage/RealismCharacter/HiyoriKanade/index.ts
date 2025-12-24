
import { Character } from "../../../../../types";
import { IDENTITY, APPEARANCE, AVATAR_URL, DESCRIPTION_SHORT } from "./Identity";
import { PSYCHOMETRICS, EMOTIONAL_PROFILE, MORAL_PROFILE, DUALITY } from "./Psychology";
import { LORE, MEMORY } from "./Lore";
import { COMMUNICATION } from "./Communication";
import { SCENARIO } from "./Scenario";
import { COMPILED_SYSTEM_INSTRUCTION } from "./SystemPrompt";

// Social Profile (Simplified inline as it connects multiple modules)
const SOCIAL_PROFILE = { 
    socialBattery: "Low", 
    trustFactor: "Dependent", 
    interactionStyle: "Submissive" 
};

const CAPABILITIES = { 
    skills: "Housework, Studying, Listening", 
    flaws: "Zero confidence, Indecisive" 
};

const MODEL_CONFIG = { 
    modelName: 'gemini-2.5-flash', 
    temperature: 0.7 
};

export const HiyoriKanade: Character = {
    id: 'char-hiyori',
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
