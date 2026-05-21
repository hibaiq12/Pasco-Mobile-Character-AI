
export interface Character {
  id: string;
  name: string;
  description: string;
  avatar: string;
  systemInstruction: string;
  age: string;
  birthday?: string;
  gender: string;
  species: string; 
  originWorld: string; 
  role: string;
  appearance: {
    height: string;
    build: string;
    features: string;
    style: string;
  };
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
  psychometrics: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
    decisionStyle: number;
    empathy: number;
  };
  emotionalProfile: {
    stability: string;
    joyTriggers: string;
    angerTriggers: string;
    sadnessTriggers: string;
  };
  moralProfile: {
    alignment: string;
    values: string;
    philosophy: string;
  };
  socialProfile: {
    socialBattery: string;
    trustFactor: string;
    interactionStyle: string;
  };
  duality: {
    mask: string;      
    core: string;      
    breakingPoint: string;
  };
  capabilities: {
    skills: string;
    flaws: string;
  };
  lore: {
    backstory: string;
    secrets: string;
    allies: string; 
    enemies: string; 
    userRelationship: string;
  };
  memory: {
    memories: string[];
    obsessions: string;
  };
  scenario: {
    currentLocation: string;
    currentActivity: string;
    startTime: {
        year: string;
        month: string;
        day: string;
        hour: string;
        minute: string;
    };
  };
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
  timestamp: number;
  image?: string;
  isSystemEvent?: boolean;
  speakerName?: string;
  speakerAvatar?: string;
}

export interface ChatSession {
  characterId: string;
  isGroup?: boolean;
  participants?: string[];
  messages: Message[];
  lastUpdated: number;
  virtualTime: number;
}

export interface SavedStory {
  id: string;
  characterId: string;
  characterName: string;
  avatar: string;
  saveName: string;
  color?: string;
  savedAt: number;
  sessionData: ChatSession;
  type?: 'manual' | 'auto';
}

export interface AppSettings {
  userName: string;
  defaultModel: string;
  defaultTemperature: number;
  enableHaptic: boolean;
  ollamaUrl: string;
  ollamaModel?: string;
  ollamaApiKey?: string;
  koboldUrl?: string;
  koboldModel?: string;
  openRouterKey: string;
  openRouterModel: string;
  tokenMode: 'auto' | 'manual';
  maxOutputTokens: number;
  enablePreviewMode: boolean;
  disableDisclaimerCountdown?: boolean; 
  disableChangelog?: boolean; 
  disableChangelogTimer?: boolean; // New Setting for Changelog Timer
  devForceMaintenance?: boolean;
  devForceUpdate?: boolean;
  devForceCountdown?: boolean;
  appLanguage: string;
  chatLanguage: string;
  showFps?: boolean;
  fpsPosition?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'discord';
  fpsSize?: number; // 0, 1, 2, 3 corresponding to 10%, 25%, 50%, 100%
  cursorType?: 'default' | 'tactical';
  cursorColor?: string;
  enableMobileGesture?: boolean;
  disableNeuroAnimations?: boolean;
  fastAnimations?: boolean;
  disableBlur?: boolean;
  fullscreenTaps?: number;
  fullscreenTime?: number;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  FORGE = 'FORGE',
  CHAT = 'CHAT',
  SETTINGS = 'SETTINGS',
  HISTORY = 'HISTORY',
  PREVIEW = 'PREVIEW'
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

export interface OutfitItem {
    id: string;
    target: 'user' | 'char';
    part: string;
    desc: string;
}
