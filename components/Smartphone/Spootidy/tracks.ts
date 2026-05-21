
export interface Track {
    id: string;
    title: string;
    artist: string;
    url: string;
    cover: string;
    duration: number; // in seconds
}

export const INITIAL_TRACKS: Track[] = [
    {
        id: '1',
        title: 'Cyberpunk City',
        artist: 'Synthwave Boy',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Placeholder
        cover: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?q=80&w=300&auto=format&fit=crop',
        duration: 372
    },
    {
        id: '2',
        title: 'Midnight Rain',
        artist: 'LoFi Study',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', // Placeholder
        cover: 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=300&auto=format&fit=crop',
        duration: 240
    },
    {
        id: '3',
        title: 'Neon Drift',
        artist: 'Future Funk',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', // Placeholder
        cover: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?q=80&w=300&auto=format&fit=crop',
        duration: 310
    }
];
