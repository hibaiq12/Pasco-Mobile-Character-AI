
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
        // Limit storage to last 50 images to prevent localStorage overflow
        if (images.length >= 50) {
            images.pop(); // Remove oldest
        }
        images.unshift(image);
        localStorage.setItem(IMAGE_STORAGE_KEY, JSON.stringify(images));
    } catch (e) {
        console.error("Failed to save generated image", e);
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
