
import React, { useState } from 'react';
import { CharacterPhoneData } from '../../services/smartphoneStorage';
import { ChevronLeft, Heart, MessageCircle, Share2, Repeat, MoreHorizontal, Search, Bell, PlusSquare, Home, User } from 'lucide-react';

interface SocialAppProps {
    phoneData: CharacterPhoneData | null;
    onNavigate: (view: string) => void;
    virtualTime: number;
}

// Mock Data Generator for "Connected" Feed
const generateMockPosts = (time: number) => [
    {
        id: 'post_1',
        author: 'Hiyori Kanade',
        handle: '@hiyori_k',
        avatar: 'https://i.pinimg.com/736x/2c/f0/66/2cf0669f2ff4ae553abfa4140264afbf.jpg',
        content: 'Hari ini piket kelas sendirian lagi... tapi setidaknya cuacanya cerah 🌤️ #school #life',
        image: null,
        likes: 12,
        comments: 2,
        timestamp: time - 1000 * 60 * 30 // 30 mins ago
    },
    {
        id: 'post_2',
        author: 'Ibu Sayang 🌹',
        handle: '@super_mom',
        avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=Mom&backgroundColor=ffdfbf',
        content: 'RESEP SUP AYAM GINSENG ANTI MASUK ANGIN!! DIBACA YA!! 🍲🍲',
        image: 'https://images.unsplash.com/photo-1547592166-23acbe346499?q=80&w=500&auto=format&fit=crop',
        likes: 45,
        comments: 10,
        timestamp: time - 1000 * 60 * 120 // 2 hours ago
    },
    {
        id: 'post_3',
        author: 'Rina (Kelas 2-B)',
        handle: '@rina_cutie',
        avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=Rina&backgroundColor=fb7185',
        content: 'Outfit check! ✨ Siapa yang mau jalan bareng nanti sore?',
        image: null,
        likes: 89,
        comments: 15,
        timestamp: time - 1000 * 60 * 240 // 4 hours ago
    },
    {
        id: 'post_4',
        author: 'Dodi (Sobat)',
        handle: '@dodi_gaming',
        avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=Dodi&backgroundColor=facc15',
        content: 'Login login!! Mabar rank sekarang, butuh tank. 🎮🔥',
        image: null,
        likes: 5,
        comments: 20,
        timestamp: time - 1000 * 60 * 300 
    }
];

export const SocialApp: React.FC<SocialAppProps> = ({ phoneData, onNavigate, virtualTime }) => {
    const [posts, setPosts] = useState(generateMockPosts(virtualTime));
    const [activeTab, setActiveTab] = useState<'home' | 'search' | 'post' | 'notif' | 'profile'>('home');
    const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

    const toggleLike = (id: string) => {
        const newLiked = new Set(likedPosts);
        if (newLiked.has(id)) {
            newLiked.delete(id);
        } else {
            newLiked.add(id);
        }
        setLikedPosts(newLiked);
    };

    const formatTime = (timestamp: number) => {
        const diff = virtualTime - timestamp;
        const minutes = Math.floor(diff / 60000);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        return `${Math.floor(hours / 24)}d`;
    };

    return (
        <div className="h-full flex flex-col bg-[#050505] animate-fade-in relative z-10 font-sans text-white">
            
            {/* Header */}
            <div className="px-4 py-3 bg-zinc-900/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-20 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <button onClick={() => onNavigate('home')} className="p-1 -ml-1 text-zinc-400 hover:text-white transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <h2 className="text-lg font-black tracking-tighter bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">
                        Connected
                    </h2>
                </div>
                <div className="flex gap-4 text-zinc-400">
                    <Search size={20} />
                    <div className="relative">
                        <Bell size={20} />
                        <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-black"></div>
                    </div>
                </div>
            </div>

            {/* Stories (Horizontal Scroll) */}
            <div className="pt-3 pb-2 border-b border-white/5 bg-[#0a0a0a]">
                <div className="flex overflow-x-auto no-scrollbar px-4 gap-4">
                    {/* User Story Add */}
                    <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className="w-14 h-14 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center relative">
                            <PlusSquare size={20} className="text-zinc-500" />
                            <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-0.5 border border-black">
                                <PlusSquare size={10} className="text-white" fill="white"/>
                            </div>
                        </div>
                        <span className="text-[10px] text-zinc-500">Your Story</span>
                    </div>
                    {/* Friend Stories */}
                    {phoneData?.contacts.slice(0, 5).map(c => (
                        <div key={c.id} className="flex flex-col items-center gap-1 shrink-0">
                            <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500">
                                <img src={c.avatar} className="w-full h-full rounded-full object-cover border-2 border-black" />
                            </div>
                            <span className="text-[10px] text-zinc-300 w-14 truncate text-center">{c.name.split(' ')[0]}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Feed */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-20">
                {posts.map(post => (
                    <div key={post.id} className="border-b border-white/5 py-3 px-4 hover:bg-white/[0.02] transition-colors">
                        <div className="flex gap-3">
                            <img src={post.avatar} className="w-10 h-10 rounded-full object-cover shrink-0 bg-zinc-800" />
                            <div className="flex-1 min-w-0">
                                {/* Post Header */}
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-bold text-sm text-zinc-200">{post.author}</span>
                                            <span className="text-[10px] text-zinc-500">· {formatTime(post.timestamp)}</span>
                                        </div>
                                        <span className="text-xs text-zinc-500">{post.handle}</span>
                                    </div>
                                    <button className="text-zinc-500">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </div>

                                {/* Post Content */}
                                <p className="text-sm text-zinc-300 mt-1 leading-relaxed whitespace-pre-wrap">
                                    {post.content}
                                </p>

                                {/* Post Image (If Any) */}
                                {post.image && (
                                    <div className="mt-3 rounded-xl overflow-hidden border border-white/10 relative group">
                                        <img src={post.image} className="w-full h-auto object-cover max-h-60" />
                                        {/* Nano Banana Placeholder for future */}
                                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[8px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                            AI Generated
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex justify-between items-center mt-3 pr-4">
                                    <button className="group flex items-center gap-1.5 text-zinc-500 hover:text-pink-500 transition-colors" onClick={() => toggleLike(post.id)}>
                                        <Heart size={18} className={likedPosts.has(post.id) ? "fill-pink-500 text-pink-500" : "group-hover:scale-110 transition-transform"} />
                                        <span className={`text-xs ${likedPosts.has(post.id) ? "text-pink-500" : ""}`}>{post.likes + (likedPosts.has(post.id) ? 1 : 0)}</span>
                                    </button>

                                    <button className="group flex items-center gap-1.5 text-zinc-500 hover:text-blue-400 transition-colors">
                                        <MessageCircle size={18} className="group-hover:scale-110 transition-transform" />
                                        <span className="text-xs">{post.comments}</span>
                                    </button>

                                    <button className="group flex items-center gap-1.5 text-zinc-500 hover:text-green-400 transition-colors">
                                        <Repeat size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                                    </button>

                                    <button className="text-zinc-500 hover:text-cyan-400 transition-colors">
                                        <Share2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                
                {/* Loading Spinner at bottom */}
                <div className="py-6 flex justify-center">
                    <div className="w-5 h-5 border-2 border-zinc-800 border-t-cyan-500 rounded-full animate-spin"></div>
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-black border-t border-white/10 flex justify-around items-center px-2 z-30">
                <button onClick={() => setActiveTab('home')} className={`p-3 rounded-xl transition-all ${activeTab === 'home' ? 'text-white bg-white/10' : 'text-zinc-600 hover:text-zinc-400'}`}>
                    <Home size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
                </button>
                <button onClick={() => setActiveTab('search')} className={`p-3 rounded-xl transition-all ${activeTab === 'search' ? 'text-white bg-white/10' : 'text-zinc-600 hover:text-zinc-400'}`}>
                    <Search size={24} strokeWidth={activeTab === 'search' ? 2.5 : 2} />
                </button>
                
                {/* Create Post Button */}
                <button onClick={() => setActiveTab('post')} className="p-3 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-full text-white shadow-lg shadow-cyan-500/20 transform -translate-y-4 hover:scale-105 transition-transform">
                    <PlusSquare size={24} />
                </button>

                <button onClick={() => setActiveTab('notif')} className={`p-3 rounded-xl transition-all ${activeTab === 'notif' ? 'text-white bg-white/10' : 'text-zinc-600 hover:text-zinc-400'}`}>
                    <Heart size={24} strokeWidth={activeTab === 'notif' ? 2.5 : 2} />
                </button>
                <button onClick={() => setActiveTab('profile')} className={`p-3 rounded-xl transition-all ${activeTab === 'profile' ? 'text-white bg-white/10' : 'text-zinc-600 hover:text-zinc-400'}`}>
                    <User size={24} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
                </button>
            </div>
        </div>
    );
};
