
import { Message } from "../../../../types";

// Kata-kata yang diabaikan agar AI fokus pada TOPIK, bukan kata sambung.
const STOP_WORDS = new Set([
    // ID
    'aku', 'kamu', 'dia', 'mereka', 'kita', 'dan', 'yang', 'di', 'ke', 'dari', 'ini', 'itu', 
    'ada', 'adalah', 'dengan', 'untuk', 'bisa', 'tidak', 'ya', 'gak', 'nggak', 'tapi', 'karena', 
    'kalau', 'jika', 'bukan', 'saja', 'lagi', 'sudah', 'belum', 'mau', 'akan', 'kok', 'sih', 
    'dong', 'deh', 'lah', 'kan', 'apa', 'kenapa', 'siapa', 'gimana', 'bagaimana', 'saya', 'anda',
    // EN
    'i', 'you', 'he', 'she', 'they', 'we', 'and', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 
    'from', 'this', 'that', 'is', 'are', 'was', 'were', 'be', 'have', 'has', 'do', 'does', 
    'did', 'can', 'could', 'will', 'would', 'should', 'not', 'no', 'yes', 'but', 'because', 
    'if', 'or', 'as', 'of', 'by', 'for', 'with', 'about', 'what', 'who', 'where', 'when', 'why', 'how',
    'me', 'my', 'your', 'his', 'her', 'their', 'our', 'us'
]);

export interface EngramContext {
    userName?: string;
    charName?: string;
    charRole?: string;
}

interface EngramScore {
    word: string;
    score: number;
}

/**
 * Menganalisis pesan untuk mengekstrak "Active Engrams" (Fokus Pikiran AI saat ini).
 * Menggunakan algoritma pembobotan berdasarkan kebaruan (Recency) dan frekuensi.
 * Sekarang mendukung injeksi konteks identitas.
 */
export const analyzeActiveEngrams = (
    messages: Message[],
    currentLocation: string,
    currentActivity: string,
    context?: EngramContext
): string[] => {
    // 1. Ambil maksimal 5 pesan terakhir untuk konteks jangka pendek (Short-term memory window)
    const recentMessages = messages.slice(-5);
    const wordScores: Record<string, number> = {};

    // 2. Analisis Pesan (Weighted)
    recentMessages.forEach((msg, index) => {
        // Bersihkan teks: lowercase, hapus tanda baca selain huruf/angka
        const cleanText = msg.text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
        const words = cleanText.split(/\s+/);

        // Bobot: Pesan terbaru (index besar) memiliki bobot lebih tinggi.
        // Pesan terakhir bobotnya 1.0, pesan sebelumnya 0.8, dst.
        const recencyWeight = 0.5 + ((index + 1) / recentMessages.length); 

        words.forEach(word => {
            if (word.length > 2 && !STOP_WORDS.has(word)) {
                // Boost skor jika kata muncul
                wordScores[word] = (wordScores[word] || 0) + (1 * recencyWeight);
            }
        });
    });

    // 3. Inject Environmental Context (Lokasi & Aktivitas)
    if (currentLocation && currentLocation !== 'Unknown') {
        const locWords = currentLocation.toLowerCase().split(' ');
        locWords.forEach(w => {
            if (!STOP_WORDS.has(w)) wordScores[w] = (wordScores[w] || 0) + 1.2; // Medium priority
        });
    }

    if (currentActivity) {
        const actWords = currentActivity.toLowerCase().split(' ');
        actWords.forEach(w => {
            if (!STOP_WORDS.has(w)) wordScores[w] = (wordScores[w] || 0) + 1.0;
        });
    }

    // 4. Inject Identity Context (User & Chatbot) - "Relationship Anchors"
    // Ini memastikan AI selalu sadar "siapa" yang ada dalam konteks, tapi tidak mendominasi topik
    if (context) {
        if (context.userName) {
            const words = context.userName.toLowerCase().split(/\s+/);
            words.forEach(w => { if (!STOP_WORDS.has(w)) wordScores[w] = (wordScores[w] || 0) + 0.5; });
        }
        if (context.charName) {
            const words = context.charName.toLowerCase().split(/\s+/);
            words.forEach(w => { if (!STOP_WORDS.has(w)) wordScores[w] = (wordScores[w] || 0) + 0.5; });
        }
        // Role kadang penting untuk konteks (misal: "Guru", "Dokter")
        if (context.charRole) {
            const words = context.charRole.toLowerCase().split(/\s+/);
            words.forEach(w => { if (!STOP_WORDS.has(w)) wordScores[w] = (wordScores[w] || 0) + 0.6; });
        }
    }

    // 5. Sorting & Filtering
    const sortedEngrams: EngramScore[] = Object.entries(wordScores)
        .map(([word, score]) => ({ word, score }))
        .sort((a, b) => b.score - a.score); // Urutkan dari skor tertinggi

    // 6. Formatting: Capitalize first letter
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    // Ambil top 5 engram terkuat (ditingkatkan dari 4 agar konteks identitas bisa masuk jika relevan)
    return sortedEngrams.slice(0, 5).map(e => capitalize(e.word));
};
