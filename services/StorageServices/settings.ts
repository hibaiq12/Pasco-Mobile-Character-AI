
import { AppSettings } from "../../types";
import { SETTINGS_KEY, VERSION_KEY } from "./constants";

const DEFAULT_SETTINGS: AppSettings = {
  userName: 'Traveler',
  defaultModel: 'gemini-3.1-flash-lite-preview',
  defaultTemperature: 0.7,
  enableHaptic: true,
  ollamaUrl: 'http://localhost:11434',
  ollamaApiKey: '',
  koboldUrl: '',
  koboldModel: 'koboldcpp',
  openRouterKey: '',
  openRouterModel: 'mistralai/devstral-2512:free',
  tokenMode: 'auto',
  maxOutputTokens: 4096,
  enablePreviewMode: false,
  disableDisclaimerCountdown: false, 
  disableChangelog: false, 
  disableChangelogTimer: false, // Default OFF
  devForceMaintenance: true, // Default ON
  devForceUpdate: false,
  devForceCountdown: false,
  appLanguage: 'id',
  chatLanguage: 'id',
  showFps: false,
  fpsPosition: 'top-right',
  fpsSize: 0,
  cursorType: 'default',
  cursorColor: '#9600FF',
  enableMobileGesture: true,
  disableNeuroAnimations: false,
  fastAnimations: false,
  disableBlur: false,
  fullscreenTaps: 2,
  fullscreenTime: 500,
};

export const getSettings = (): AppSettings => {
    try {
        const data = localStorage.getItem(SETTINGS_KEY);
        if (data) {
            const parsed = JSON.parse(data);
            const merged = { ...DEFAULT_SETTINGS, ...parsed };
            
            // Clean up known invalid key if present (legacy cleanup)
            const INVALID_KEY = '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';
            if (merged.openRouterKey === INVALID_KEY) {
                merged.openRouterKey = '';
            }

            // Ensure critical fields are populated
            if (!merged.defaultModel) merged.defaultModel = DEFAULT_SETTINGS.defaultModel;
            
            return merged;
        }
        return DEFAULT_SETTINGS;
    } catch (e) {
        return DEFAULT_SETTINGS;
    }
};

export const saveSettings = (settings: AppSettings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const checkVersion = (): string | null => {
    return localStorage.getItem(VERSION_KEY);
};

export const updateVersion = (version: string) => {
    localStorage.setItem(VERSION_KEY, version);
};
