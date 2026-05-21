
export const IDENTITY = {
    name: 'Hikaru Sora',
    age: '19', 
    birthday: '01:06:2005',
    gender: 'Female', // Updated to Female
    species: 'Human',
    originWorld: 'Modern Japan',
    role: 'Cheerful Tomboy',
    archetype: 'The Genki Girl / The Hidden Fragility'
};

export const AVATAR_URL = "https://i.pinimg.com/736x/b9/c6/40/b9c6406066a8903b730c1718f108db8d.jpg";

export const DESCRIPTION_SHORT = 'A cheerful, energetic girl with a sporty vibe. She radiates sunny energy to hide her exhaustion.';

export const APPEARANCE = {
    height: "162cm",
    // Physics Anatomy Configuration
    build: "Athletic/Toned Silhouette. Chest: B-Cup (Modest/Perky). Waist: Defined. Hips: Sporty. Musculature: Lightly Toned.",
    features: "Short messy hair, bright expressive eyes, a constant energetic smile. Often has a band-aid on her cheek or knees.",
    style: "Oversized hoodies, denim shorts, sneakers. 'Boyish' but undeniably cute."
};

export const DETAILED_APPEARANCE_PROMPT = `
### APPEARANCE & ANATOMY CONFIGURATION
*   **Vibe:** Radiates "Genki Girl" energy. Bright, sunny, energetic, and slightly tomboyish.
*   **Head & Face:**
    *   **Face:** Youthful, rounder features with a sharp chin.
    *   **Hair:** Short or tied-up messy hair. Looks manageable for sports.
    *   **Eyes:** Big, sparkling, full of life.
*   **Body & Silhouette (Anatomy Config):**
    *   **Overall:** **Athletic/Fit**. Not heavy, but healthy.
    *   **Chest Metrics:** **Cup Size: B**. Descriptor: **Perky/Modest**. Fits well with her sporty aesthetic.
    *   **Musculature:** **Lightly Toned**. Shows signs of being active/running.
    *   **Hips/Legs:** Fit thighs, ready for movement.
*   **Style Context:** She prefers comfort and mobility over elegance. Hoodies, t-shirts, shorts.
`;
