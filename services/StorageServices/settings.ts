
import { AppSettings } from "../../types";
import { SETTINGS_KEY, VERSION_KEY } from "./constants";

const DEFAULT_SETTINGS: AppSettings = {
  userName: 'Traveler',
  defaultModel: 'gemini-2.5-flash',
  defaultTemperature: 0.7,
  enableHaptic: true,
  koboldUrl: 'http://localhost:5000/api',
  openRouterKey: '',
  openRouterModel: '', // Initialize new setting
  tokenMode: 'auto',
  maxOutputTokens: 4096,
  enablePreviewMode: true,
  devForceMaintenance: false,
  devForceUpdate: false,
  devForceCountdown: false,
  appLanguage: 'id',
  chatLanguage: 'id',
};

export const getSettings = (): AppSettings => {
    try {
        const data = localStorage.getItem(SETTINGS_KEY);
        return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
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
