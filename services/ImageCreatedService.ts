
export interface GeneratedImage {
    id: string;
    base64: string;
    prompt: string;
    timestamp: number;
    characterId: string;
}

const IMAGE_STORAGE_KEY = 'pasco_generated_images';

export const getGeneratedImages = (): GeneratedImage[] => {
    try {
        const store = localStorage.getItem(IMAGE_STORAGE_KEY);
        return store ? JSON.parse(store) : [];
    } catch (e) {
        return [];
    }
};

export const saveGeneratedImage = (image: GeneratedImage) => {
    try {
        const images = getGeneratedImages();
        // Limit storage to last 20 images (reduced from 50) to prevent localStorage overflow
        if (images.length >= 20) {
            images.pop(); // Remove oldest
        }
        images.unshift(image);
        localStorage.setItem(IMAGE_STORAGE_KEY, JSON.stringify(images));
    } catch (e) {
        console.error("Failed to save generated image", e);
        // If quota exceeded here, we might want to clear more images
        if ((e as any).name === 'QuotaExceededError') {
             try {
                 // Aggressive clear: keep only last 5
                 const images = getGeneratedImages();
                 const reduced = images.slice(0, 5);
                 reduced.unshift(image);
                 localStorage.setItem(IMAGE_STORAGE_KEY, JSON.stringify(reduced));
             } catch (err) {
                 console.error("Critical: Cannot save image even after reduction.");
             }
        }
    }
};

export const getImageById = (id: string): GeneratedImage | undefined => {
    const images = getGeneratedImages();
    return images.find(img => img.id === id);
};

// For Migration: Bulk restore
export const restoreGeneratedImages = (images: GeneratedImage[]) => {
    localStorage.setItem(IMAGE_STORAGE_KEY, JSON.stringify(images));
};
