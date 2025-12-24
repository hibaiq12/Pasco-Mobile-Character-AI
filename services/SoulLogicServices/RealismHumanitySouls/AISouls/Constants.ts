
export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const NSFW_KEYWORDS = ['seductive', 'intimate', 'erotic', 'lust', 'nsfw', '18+', 'sexual', 'obsessive', 'yandere', 'dominant', 'submissive', 'fetish', 'desire', 'pleasure', 'harem'];

export const getLanguageName = (code: string): string => {
    switch (code) {
        case 'id': return 'Bahasa Indonesia (Gaul/Casual)';
        case 'jp': return 'Japanese (日本語)';
        case 'es': return 'Spanish (Español)';
        case 'fr': return 'French (Français)';
        case 'de': return 'German (Deutsch)';
        case 'en': default: return 'English (Casual/Slang)';
    }
};
