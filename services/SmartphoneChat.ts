
/**
 * SmartphoneChat.ts
 * Logika khusus untuk menentukan mode komunikasi (Langsung vs SMS)
 * berdasarkan lokasi dan konteks.
 */

// Helper untuk normalisasi string lokasi agar tidak case-sensitive
const normalize = (str: string) => str.trim().toLowerCase().replace(/\s+/g, ' ');

/**
 * Menentukan apakah dua lokasi dianggap "Jauh" (sehingga harus pakai SMS).
 */
export const isLocationFar = (userLoc: string, charLoc: string): boolean => {
    const u = normalize(userLoc);
    const c = normalize(charLoc);

    if (u === c) return false;
    
    // Exception: Jika salah satu "Unknown", anggap dekat untuk fallback
    if (u === 'unknown' || c === 'unknown' || u === '' || c === '') return false;

    return true; 
};

/**
 * Memformat pesan agar sesuai tampilan log SMS di chat utama.
 */
export const formatSMSLog = (senderName: string, text: string): string => {
    // Pastikan tidak double prefix
    const cleanText = text.replace(/^\[SMS.*\]:\s*/i, '').trim();
    return `[SMS from ${senderName}]: ${cleanText}`;
};

/**
 * Memformat log pengiriman SMS dari User
 */
export const formatUserSMSLog = (receiverName: string, text: string): string => {
    return `[SMS to ${receiverName}]: ${text}`;
};

/**
 * Mendeteksi apakah pesan memiliki prefix SMS (Format: [SMS...]: pesan)
 * Menangani variasi: [SMS]:, [SMS From Hiyori]:, [SMS to Mom]:
 */
export const hasSMSPrefix = (text: string): boolean => {
    return /^\[SMS.*\]:/i.test(text.trim());
};

/**
 * Membersihkan text dari prefix SMS apapun (isi dalam kurung siku)
 */
export const stripSMSPrefix = (text: string): string => {
    return text.replace(/^\[SMS.*\]:\s*/i, '').trim();
};
