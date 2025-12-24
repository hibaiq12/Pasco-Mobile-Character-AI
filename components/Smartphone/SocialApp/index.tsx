
import React, { useState, useEffect, useRef } from 'react';
import { CharacterPhoneData, Contact, getSmartphoneData } from '../../../services/smartphoneStorage';
import { 
    SocialPost, 
    getSocialData, 
    socialToggleLike, 
    socialAddComment, 
    socialCreatePost,
    socialAppendPosts,
    socialCheckReset,
    socialProcessReplies
} from '../../../services/SmartphoneSocial';
import { generateSocialFeedBatchAI, generateCommentReplyAI, SocialCandidate } from '../../../services/SocialMediaAlgorithm';
import { ChevronLeft, Search, Bell, PlusSquare, Home, User } from 'lucide-react';
import { Feed } from './Feed';
import { CommentModal } from './CommentModal';
import { Character } from '../../../types';

interface SocialAppProps {
    phoneData: CharacterPhoneData | null;
    onNavigate: (view: string) => void;
    virtualTime: number;
    activeCharacterId?: string | null;
    activeCharacter?: Character | null; 
}

export const SocialApp: React.FC<SocialAppProps> = ({ phoneData, onNavigate, virtualTime, activeCharacterId, activeCharacter }) => {
    const [activeTab, setActiveTab] = useState<'home' | 'search' | 'post' | 'notif' | 'profile'>('home');
    const [viewingPost, setViewingPost] = useState<SocialPost | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [posts, setPosts] = useState<SocialPost[]>([]);

    const activeId = activeCharacterId || 'char-hiyori';
    
    // Track previous time to detect Time Skips
    const prevTimeRef = useRef(virtualTime);
    const processingRepliesRef = useRef(false);

    // --- 1. INITIAL LOAD & REAL-TIME RESET CHECK ---
    useEffect(() => {
        // Check 2-hour reset rule
        const didReset = socialCheckReset(activeId);
        const socialData = getSocialData(activeId);
        setPosts(socialData.posts);
        
        // TRIGGER AI: If reset happened OR posts are very few (only admin post), auto load
        if (didReset || socialData.posts.length <= 1) {
            handleLoadMore(true); 
        }
    }, [activeId]);

    // --- 2. TIME SKIP DETECTION & REFRESH ---
    useEffect(() => {
        const timeDiff = virtualTime - prevTimeRef.current;
        const THIRTY_MINS_MS = 30 * 60 * 1000;

        if (timeDiff >= THIRTY_MINS_MS) {
            console.log("Time Skip Detected in Social App > 30 mins. Refreshing Feed.");
            handleLoadMore(true); // Force refresh/new batch
        }
        
        // --- 3. REPLY PROCESSING QUEUE ---
        // Check pending replies every time virtualTime updates
        processPendingReplies();

        prevTimeRef.current = virtualTime;
    }, [virtualTime]);

    const processPendingReplies = async () => {
        if (processingRepliesRef.current) return;
        
        const socialData = getSocialData(activeId);
        const dueReplies = socialData.pendingReplies.filter(r => r.targetTime <= virtualTime);
        
        if (dueReplies.length === 0) return;

        processingRepliesRef.current = true;
        
        // Process one by one to avoid race conditions
        for (const reply of dueReplies) {
            // Find NPC Description if available
            let npcDesc = "Friendly user";
            if (activeCharacter && reply.authorName === activeCharacter.name) {
                npcDesc = activeCharacter.systemInstruction.slice(0, 300);
            } else {
                const contact = phoneData?.contacts.find(c => c.name === reply.authorName);
                if (contact) npcDesc = contact.description || npcDesc;
            }

            const responseText = await generateCommentReplyAI(reply.postContent, reply.userComment, reply.authorName, npcDesc);
            const updatedData = socialProcessReplies(activeId, responseText, reply.id);
            setPosts(updatedData.posts);
            
            // If user is currently viewing this post, update the modal view too
            if (viewingPost && viewingPost.id === reply.postId) {
                const updatedPost = updatedData.posts.find(p => p.id === reply.postId);
                if (updatedPost) setViewingPost(updatedPost);
            }
        }
        
        processingRepliesRef.current = false;
    };

    // --- 4. INFINITE SCROLL GENERATOR ---
    const handleLoadMore = async (forceRefresh = false) => {
        if (isLoading) return;
        
        // Limit total posts to ~50 for infinite scroll feel but ensuring performance
        if (!forceRefresh && posts.length >= 50) {
            return; 
        }

        setIsLoading(true);

        try {
            // Gather Candidates (Strictly from Contacts + Chatbot)
            const contacts = phoneData?.contacts.filter(c => !c.isSystem || c.id === 'mom' || c.id === 'dad') || []; 
            
            const candidates: SocialCandidate[] = contacts.map(c => ({
                id: c.id,
                name: c.name,
                description: c.description || "Friend",
                role: "Friend"
            }));

            if (activeCharacter) {
                candidates.push({
                    id: activeCharacter.id,
                    name: activeCharacter.name,
                    description: activeCharacter.systemInstruction.slice(0, 300),
                    role: activeCharacter.role
                });
            }

            // Fallback if no contacts yet (prevent empty loop)
            if (candidates.length === 0) {
                 setIsLoading(false);
                 return;
            }

            const timeStr = new Date(virtualTime).toLocaleTimeString();
            
            const context = {
                time: timeStr,
                weather: "Clear", // Idealnya ambil dari weatherService
                userLocation: activeCharacter?.scenario?.currentLocation || "Unknown", 
                recentEvents: "Browsing social media"
            };

            // Generate
            const generated = await generateSocialFeedBatchAI(candidates, context, posts.length);

            // Map back to SocialPost objects
            const newPosts: SocialPost[] = generated.map(gen => {
                // Try to find matching candidate for Avatar/ID
                const matchContact = contacts.find(c => c.name === gen.authorName);
                const isMainChar = activeCharacter && activeCharacter.name === gen.authorName;
                
                let avatar = 'https://api.dicebear.com/7.x/identicon/svg?seed=' + gen.authorName;
                let authorId = 'unknown_npc';
                let handle = `@${(gen.authorName || 'user').replace(/\s+/g, '').toLowerCase().slice(0, 10)}`;

                if (matchContact) {
                    avatar = matchContact.avatar || avatar;
                    authorId = matchContact.id;
                } else if (isMainChar) {
                    avatar = activeCharacter.avatar;
                    authorId = activeCharacter.id;
                    handle = `@${activeCharacter.name.split(' ')[0].toLowerCase()}`;
                }

                return {
                    id: gen.id || crypto.randomUUID(),
                    authorId: authorId,
                    authorName: gen.authorName || 'Unknown',
                    authorHandle: handle,
                    authorAvatar: avatar,
                    content: gen.content || '...',
                    likes: gen.likes || 0,
                    isLiked: false,
                    timestamp: virtualTime - Math.floor(Math.random() * 3600000), // Randomly slightly in past
                    comments: [],
                    tags: gen.tags
                };
            });

            if (newPosts.length > 0) {
                const updatedData = socialAppendPosts(activeId, newPosts);
                setPosts(updatedData.posts);
            }
        } catch (e) {
            console.error("Feed Gen Error", e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLike = (postId: string) => {
        const updatedData = socialToggleLike(activeId, postId);
        setPosts(updatedData.posts);
        if (viewingPost && viewingPost.id === postId) {
            const p = updatedData.posts.find(x => x.id === postId);
            if(p) setViewingPost(p);
        }
    };

    const handleAddComment = async (postId: string, text: string) => {
        // Add User Comment + Schedule Reply
        const updatedData = socialAddComment(activeId, postId, text, 'You', virtualTime);
        setPosts(updatedData.posts);
        
        // Update Modal View
        const p = updatedData.posts.find(x => x.id === postId);
        if(p) setViewingPost(p);
    };

    const handleCreatePost = () => {
        const text = prompt("What's on your mind?");
        if (text) {
            const updatedData = socialCreatePost(activeId, text);
            setPosts(updatedData.posts);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#050505] animate-fade-in relative z-10 font-sans text-white">
            
            {/* Header */}
            <div className="px-4 py-3 bg-zinc-900/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-20 flex justify-between items-center shrink-0">
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
                    </div>
                </div>
            </div>

            {/* Stories Area */}
            <div className="pt-3 pb-2 border-b border-white/5 bg-[#0a0a0a] shrink-0">
                <div className="flex overflow-x-auto no-scrollbar px-4 gap-4">
                    <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className="w-14 h-14 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center relative">
                            <PlusSquare size={20} className="text-zinc-500" />
                            <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-0.5 border border-black">
                                <PlusSquare size={10} className="text-white" fill="white"/>
                            </div>
                        </div>
                        <span className="text-[10px] text-zinc-500">Your Story</span>
                    </div>
                    {/* Render Chatbot Story Circle if Active */}
                    {activeCharacter && (
                         <div className="flex flex-col items-center gap-1 shrink-0">
                            <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 to-blue-600">
                                <img src={activeCharacter.avatar} className="w-full h-full rounded-full object-cover border-2 border-black" />
                            </div>
                            <span className="text-[10px] text-zinc-300 w-14 truncate text-center">{activeCharacter.name.split(' ')[0]}</span>
                        </div>
                    )}
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
            {activeTab === 'home' && (
                <Feed 
                    posts={posts} 
                    onLike={handleLike} 
                    onCommentClick={setViewingPost}
                    currentUserId="user"
                    virtualTime={virtualTime}
                    onLoadMore={() => handleLoadMore(false)}
                    isLoading={isLoading}
                />
            )}

            {activeTab === 'profile' && (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
                    <User size={48} className="mb-2" />
                    <p>User Profile</p>
                </div>
            )}

            {/* Bottom Navigation */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-black border-t border-white/10 flex justify-around items-center px-2 z-30">
                <button onClick={() => setActiveTab('home')} className={`p-3 rounded-xl transition-all ${activeTab === 'home' ? 'text-white bg-white/10' : 'text-zinc-600 hover:text-zinc-400'}`}>
                    <Home size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
                </button>
                <button onClick={() => setActiveTab('search')} className={`p-3 rounded-xl transition-all ${activeTab === 'search' ? 'text-white bg-white/10' : 'text-zinc-600 hover:text-zinc-400'}`}>
                    <Search size={24} strokeWidth={activeTab === 'search' ? 2.5 : 2} />
                </button>
                
                <button onClick={handleCreatePost} className="p-3 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-full text-white shadow-lg shadow-cyan-500/20 transform -translate-y-4 hover:scale-105 transition-transform">
                    <PlusSquare size={24} />
                </button>

                <button onClick={() => setActiveTab('notif')} className={`p-3 rounded-xl transition-all ${activeTab === 'notif' ? 'text-white bg-white/10' : 'text-zinc-600 hover:text-zinc-400'}`}>
                    <Bell size={24} strokeWidth={activeTab === 'notif' ? 2.5 : 2} />
                </button>
                <button onClick={() => setActiveTab('profile')} className={`p-3 rounded-xl transition-all ${activeTab === 'profile' ? 'text-white bg-white/10' : 'text-zinc-600 hover:text-zinc-400'}`}>
                    <User size={24} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
                </button>
            </div>

            {/* Overlays */}
            {viewingPost && (
                <CommentModal 
                    post={viewingPost} 
                    onClose={() => setViewingPost(null)} 
                    onAddComment={handleAddComment}
                    virtualTime={virtualTime}
                />
            )}
        </div>
    );
};
