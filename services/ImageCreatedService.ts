
import { get, set } from 'idb-keyval';

export interface GeneratedImage {
    id: string;
    base64: string;
    prompt: string;
    timestamp: number;
    characterId: string;
}

const IMAGE_STORAGE_KEY = 'pasco_generated_images';

// In-memory cache for synchronous reads
let imageCache: GeneratedImage[] = [];
let isCacheLoaded = false;

// Call this on app initialization to load
export const loadImagesFromDB = async () => {
    try {
        const stored = await get<GeneratedImage[]>(IMAGE_STORAGE_KEY);
        if (stored) {
            imageCache = stored;
        } else {
            // Check fallback from localstorage (migration)
            const oldStore = localStorage.getItem(IMAGE_STORAGE_KEY);
            if (oldStore) {
                imageCache = JSON.parse(oldStore);
                await set(IMAGE_STORAGE_KEY, imageCache);
                localStorage.removeItem(IMAGE_STORAGE_KEY); // Clean up
            }
        }
        isCacheLoaded = true;
    } catch (e) {
        console.error("Failed to load images from DB", e);
    }
};

export const getGeneratedImages = (): GeneratedImage[] => {
    return imageCache;
};

export const saveGeneratedImage = async (image: GeneratedImage) => {
    try {
        // We do not strictly limit size anymore because IDB can hold a lot, 
        // but let's keep it to say, 100 images to prevent unbounded growth.
        if (imageCache.length >= 100) {
            imageCache.pop();
        }
        imageCache.unshift(image);
        await set(IMAGE_STORAGE_KEY, imageCache);
    } catch (e) {
        console.error("Failed to save generated image to DB", e);
    }
};

export const getImageById = (id: string): GeneratedImage | undefined => {
    return imageCache.find(img => img.id === id);
};

// For Migration: Bulk restore
export const restoreGeneratedImages = async (images: GeneratedImage[]) => {
    imageCache = images;
    await set(IMAGE_STORAGE_KEY, images);
};
