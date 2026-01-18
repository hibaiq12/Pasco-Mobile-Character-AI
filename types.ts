export interface Character {
  id: string;
  name: string;
  description: string; // Short description for cards
  avatar: string; // Base64 string
  systemInstruction: string; // The final compiled prompt used by the AI
  
  // --- NEURAL FORGE V1.5 DATA STRUCTURE (12 MODULES) ---
  
  // 1. Identity Core
  age: string;
  birthday?: string; // DD:MM:YYYY
  gender: string;
  species: string; 
  originWorld: string; 
  role: string;
  
  // 2. Visuals & Shell (Appearance)
  appearance: {
    height: string;
    build: string;
    features: string; // Face, eyes, hair
    style: string; // Clothing style
  };

  // 3. Voice & Speech (Communication)
  communication: {
    style: 'formal' | 'casual' | 'slang' | 'poetic' | 'cryptic' | 'military' | 'intimate';
    sentenceLength: 'short' | 'balanced' | 'verbose'; 
    vocabularyLevel: 'simple' | 'average' | 'academic';
    emotionalRelay: 'suppressed' | 'balanced' | 'amplified';
    quirks: string;
    openingLine: string;
    voiceConfig: {
        pitch: number;
        speed: number;
        tone: string;
    };
  };

  // 4. Psychometrics (The Big 5)
  psychometrics: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
    decisionStyle: number; // Logic vs Emotion
    empathy: number; // Cold vs Warm
  };

  // 5. Emotional Spectrum (Triggers & Stability)
  emotionalProfile: {
    stability: string; // e.g. Volatile, Stoic
    joyTriggers: string;
    angerTriggers: string;
    sadnessTriggers: string;
  };

  // 6. Moral Compass (Ethics)
  moralProfile: {
    alignment: string; // D&D Alignment
    values: string; // What they believe in
    philosophy: string; // Nihilism, Utilitarianism, etc.
  };

  // 7. Social Dynamics (Interaction Style)
  socialProfile: {
    socialBattery: string; // Introvert/Extrovert energy
    trustFactor: string; // How easily they trust
    interactionStyle: string; // Manipulative, Supportive, Distant
  };

  // 8. Dual Nature (Conflict)
  duality: {
    mask: string;      
    core: string;      
    breakingPoint: string;
  };

  // 9. Capabilities (Skills & Flaws)
  capabilities: {
    skills: string; // Expertises
    flaws: string; // Physical or mental weaknesses
  };

  // 10. Deep Lore (History)
  lore: {
    backstory: string;
    secrets: string;
    allies: string; 
    enemies: string; 
    userRelationship: string;
  };

  // 11. Memory Cortex (Anchors)
  memory: {
    memories: string[]; // Key life events
    obsessions: string; // Current fixations
  };

  // 12. Scenario Setup (Current Context)
  scenario: {
    currentLocation: string;
    currentActivity: string; // What are they doing right now?
    startTime: {
        year: string;
        month: string;
        day: string;
        hour: string;
        minute: string;
    };
  };
  
  // Technical Config
  modelConfig: {
    modelName: string;
    temperature: number;
  };
  
  lastMessage?: string;
  lastUpdated?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number; // The Virtual Time when this message was sent
  image?: string;
  isSystemEvent?: boolean;
  speakerName?: string; // For Group Chat: Which character is speaking
  speakerAvatar?: string; // For Group Chat
}

export interface ChatSession {
  characterId: string; // Primary ID or Group ID
  isGroup?: boolean; // New flag for group chats
  participants?: string[]; // IDs of characters in the group
  messages: Message[];
  lastUpdated: number; // Real-world timestamp
  virtualTime: number; // The current time inside the chat world
}

export interface SavedStory {
  id: string;
  characterId: string;
  characterName: string;
  avatar: string;
  saveName: string;
  color?: string; // Custom badge color for the save name
  savedAt: number; // Real world time
  sessionData: ChatSession;
  type?: 'manual' | 'auto'; // NEW: Track save type
}

export interface AppSettings {
  userName: string;
  defaultModel: string;
  defaultTemperature: number;
  enableHaptic: boolean;
  koboldUrl: string;
  openRouterKey: string;
  tokenMode: 'auto' | 'manual';
  maxOutputTokens: number;
  enablePreviewMode: boolean; // Developer setting to disable AI
  
  // NEW: Maintenance Mode Developer Flags
  devForceMaintenance?: boolean;
  devForceUpdate?: boolean;
  devForceCountdown?: boolean;
  
  // NEW: Language Settings
  appLanguage: string; // Controls UI text generation and system messages (e.g. 'en', 'id')
  chatLanguage: string; // Controls the character's speaking language
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  FORGE = 'FORGE',
  CHAT = 'CHAT',
  SETTINGS = 'SETTINGS',
  HISTORY = 'HISTORY',
}

export interface ModelOption {
  id: string;
  name: string;
  desc: string;
}

export interface StoryConfiguration {
    userName: string;
    userAge: string;
    userBirthday: string;
    userGender: string;
    genres: string[];
}

// Visual Wardrobe
export interface OutfitItem {
    id: string;
    target: 'user' | 'char';
    part: string;
    desc: string;
}