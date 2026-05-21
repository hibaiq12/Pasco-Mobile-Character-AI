
import { Track, INITIAL_TRACKS } from '../components/Smartphone/Spootidy/tracks';

const SPOOTIDY_STORAGE_KEY = 'pasco_spootidy_tracks';
const GENERATED_IMAGES_KEY = 'pasco_generated_images';

export const getSpootidyTracks = (): Track[] => {
    try {
        const data = localStorage.getItem(SPOOTIDY_STORAGE_KEY);
        return data ? JSON.parse(data) : INITIAL_TRACKS;
    } catch (e) {
        console.error("Spootidy load error", e);
        return INITIAL_TRACKS;
    }
};

export const saveSpootidyTracks = (tracks: Track[]) => {
    try {
        localStorage.setItem(SPOOTIDY_STORAGE_KEY, JSON.stringify(tracks));
    } catch (e: any) {
        console.error("Spootidy save error", e);
        // Quota Handling Logic
        if (e.name === 'QuotaExceededError' || e.code === 22) {
             console.warn("Storage Full. Initiating cleanup protocol for Spootidy...");
             
             // Strategy 1: Clear generated images cache first (High impact, low loss)
             if (localStorage.getItem(GENERATED_IMAGES_KEY)) {
                 console.warn("Clearing generated images cache to free space.");
                 localStorage.removeItem(GENERATED_IMAGES_KEY);
                 try {
                     localStorage.setItem(SPOOTIDY_STORAGE_KEY, JSON.stringify(tracks));
                     return; // Success
                 } catch (retryE) {
                     // Still full, proceed to next strategy
                 }
             }

             // Strategy 2: Optimize Track Covers (Remove large Base64 strings)
             console.warn("Optimizing track covers to save space.");
             const optimizedTracks = tracks.map(t => {
                 // If cover is base64 and larger than 2KB, revert to default placeholder
                 if (t.cover && t.cover.startsWith('data:image') && t.cover.length > 2048) {
                     return { 
                         ...t, 
                         cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=300&auto=format&fit=crop' 
                     };
                 }
                 return t;
             });
             
             try {
                 localStorage.setItem(SPOOTIDY_STORAGE_KEY, JSON.stringify(optimizedTracks));
             } catch (finalE) {
                 console.error("Critical: Storage full. Could not save tracks even after optimization.");
                 alert("Storage full. Unable to save new music tracks.");
             }
        }
    }
};
