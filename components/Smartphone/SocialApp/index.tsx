
import React, { useState, useEffect, useRef } from 'react';
import { CharacterPhoneData } from '../../../services/smartphoneStorage';
import { 
    SocialPost, 
    getSocialData, 
    socialToggleLike, 
    socialAddComment,
    socialAppendPosts,
    socialCheckReset,
    socialProcessReplies
} from '../../../services/SmartphoneSocial';
import { 
    generateSocialFeedBatchAI, 
    generateCommentReplyAI, 
    generateCharacterPostAI,
    SocialCandidate 
} from '../../../services/SocialMediaAlgorithm';
import { generateCharacterImage } from '../../../services/Imagecreate';
import { 
    ChevronLeft, Search, Bell, PlusSquare, Home, User, X, 
    Image as ImageIcon, Camera, Settings, Plus, Mail, Sparkles 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Feed } from './Feed';
import { CommentModal } from './CommentModal';
import { Character } from '../../../types';

interface SocialAppProps {
    phoneData: CharacterPhoneData | null;
    onNavigate: (view: string) => void;
    virtualTime: number;
    activeCharacterId?: string | null;
    activeCharacter?: Character | null; 
    onShowToCharacter?: (content: string) => void;
    onSendMessage?: (text: string, contactId: string) => void;
}

export const SocialApp: React.FC<SocialAppProps> = ({ phoneData, onNavigate, virtualTime, activeCharacterId, activeCharacter, onShowToCharacter, onSendMessage }) => {
    const [posts, setPosts] = useState<SocialPost[]>([]);
    const [viewingProfile, setViewingProfile] = useState<string | null>(null);
    const [showCompose, setShowCompose] = useState(false);
    const [composeText, setComposeText] = useState('');
    const [composeAttachment, setComposeAttachment] = useState<'none' | '16:9' | '9:16' | 'selfie'>('none');
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState<'For You' | 'Following'>('For You');

    const activeId = activeCharacterId || 'char-hiyori';

    useEffect(() => {
        const didReset = socialCheckReset(activeId);
        const socialData = getSocialData(activeId);
        setPosts(socialData.posts);
        
        if (didReset || socialData.posts.length <= 1) {
            handleLoadMore(true); 
        }
    }, [activeId]);

    const handleLoadMore = async (forceRefresh = false) => {
        if (isLoading) return;
        setIsLoading(true);

        try {
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

            if (candidates.length === 0) {
                 setIsLoading(false);
                 return;
            }

            const context = {
                time: new Date(virtualTime).toLocaleTimeString(),
                weather: "Clear",
                userLocation: activeCharacter?.scenario?.currentLocation || "Tokyo", 
                recentEvents: "Casual browsing"
            };

            const generated = await generateSocialFeedBatchAI(candidates, context, posts.length);

            const newPosts: SocialPost[] = await Promise.all(generated.map(async gen => {
                const matchContact = contacts.find(c => c.name === gen.authorName);
                const isMainChar = activeCharacter && activeCharacter.name === gen.authorName;
                
                let avatar = 'https://api.dicebear.com/7.x/identicon/svg?seed=' + gen.authorName;
                let authorId = 'npc';
                let handle = `@${(gen.authorName || 'user').replace(/\s+/g, '').toLowerCase().slice(0, 10)}`;

                if (matchContact) {
                    avatar = matchContact.avatar || avatar;
                    authorId = matchContact.id;
                } else if (isMainChar) {
                    avatar = activeCharacter.avatar;
                    authorId = activeCharacter.id;
                    handle = `@${activeCharacter.name.split(' ')[0].toLowerCase()}`;
                }

                // AI Image Handling if present in content
                let finalContent = gen.content || '...';
                let imgUrl = undefined;
                const imgMatch = finalContent.match(/\[Image:\s*(.*?)\]/);
                if (imgMatch) {
                    const desc = imgMatch[1];
                    imgUrl = await generateCharacterImage(desc, avatar, authorId, "16:9");
                    finalContent = finalContent.replace(/\[Image:.*?\]/, '').trim();
                }

                return {
                    id: gen.id || crypto.randomUUID(),
                    authorId: authorId,
                    authorName: gen.authorName || 'Unknown',
                    authorHandle: handle,
                    authorAvatar: avatar,
                    content: finalContent,
                    likes: gen.likes || 0,
                    isLiked: false,
                    timestamp: virtualTime - Math.floor(Math.random() * 3600000),
                    comments: [],
                    tags: gen.tags,
                    image: imgUrl
                };
            }));

            if (newPosts.length > 0) {
                const updatedData = socialAppendPosts(activeId, newPosts);
                setPosts(updatedData.posts);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreatePost = async () => {
        if (!composeText.trim() && composeAttachment === 'none') return;
        setIsGenerating(true);

        try {
            const newPost: SocialPost = {
                id: crypto.randomUUID(),
                authorId: 'user',
                authorName: 'Me',
                authorHandle: '@me',
                authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',
                content: composeText,
                likes: 0,
                isLiked: false,
                timestamp: virtualTime,
                comments: [],
                tags: []
            };

            if (composeAttachment !== 'none') {
                const desc = `User taking a photo: ${composeText}`;
                newPost.image = await generateCharacterImage(desc, 'https://api.dicebear.com/7.x/avataaars/svg?seed=User', 'user', composeAttachment === 'selfie' ? '9:16' : composeAttachment);
            }

            const updatedData = socialAppendPosts(activeId, [newPost]);
            setPosts(updatedData.posts);
            setShowCompose(false);
            setComposeText('');
            setComposeAttachment('none');
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAIRespond = async () => {
        if (!activeCharacter || isGenerating) return;
        setIsGenerating(true);
        try {
            const context = {
                time: new Date(virtualTime).toLocaleTimeString(),
                weather: "Clear",
                userLocation: activeCharacter.scenario?.currentLocation || "Tokyo",
                recentEvents: "Posting update"
            };

            const genData = await generateCharacterPostAI(
                { id: activeCharacter.id, name: activeCharacter.name, description: activeCharacter.systemInstruction.slice(0, 500) },
                context,
                composeAttachment
            );

            let content = genData.content || "...";
            let imgUrl = undefined;

            const imgMatch = content.match(/\[Image:\s*(.*?)\]/);
            if (imgMatch) {
                const desc = imgMatch[1];
                const ratio = composeAttachment === 'selfie' ? '9:16' : (composeAttachment === 'none' ? '16:9' : composeAttachment);
                imgUrl = await generateCharacterImage(desc, activeCharacter.avatar, activeCharacter.id, ratio as any);
                content = content.replace(/\[Image:.*?\]/, '').trim();
            }

            const newPost: SocialPost = {
                id: genData.id || crypto.randomUUID(),
                authorId: activeCharacter.id,
                authorName: activeCharacter.name,
                authorHandle: `@${activeCharacter.name.toLowerCase().replace(/\s/g, '')}`,
                authorAvatar: activeCharacter.avatar,
                content: content,
                likes: 0,
                isLiked: false,
                timestamp: virtualTime,
                comments: [],
                tags: genData.tags || [],
                image: imgUrl
            };

            const updatedData = socialAppendPosts(activeId, [newPost]);
            setPosts(updatedData.posts);
            setShowCompose(false);
            setComposeAttachment('none');
            setComposeText('');
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleLike = (id: string) => {
        const updatedData = socialToggleLike(activeId, id);
        setPosts(updatedData.posts);
    };

    const renderProfile = () => {
        const profileId = viewingProfile === 'user' ? 'user' : viewingProfile || activeId;
        const profilePosts = posts.filter(p => p.authorId === profileId);
        const firstPost = profilePosts[0] || posts.find(p => p.authorId === profileId);
        const name = profileId === 'user' ? 'Me' : (firstPost?.authorName || activeCharacter?.name || 'User');
        const handle = profileId === 'user' ? '@me' : (firstPost?.authorHandle || '@char');
        const avatar = profileId === 'user' ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=User' : (firstPost?.authorAvatar || activeCharacter?.avatar || '');

        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 bg-black overflow-y-auto">
                <div className="sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-[#2f3336] px-4 h-14 flex items-center gap-6">
                    <button onClick={() => setViewingProfile(null)} className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h2 className="font-bold text-[17px] leading-tight">{name}</h2>
                        <p className="text-[#71767b] text-[13px]">{profilePosts.length} posts</p>
                    </div>
                </div>

                <div className="h-32 bg-[#333639] w-full"></div>
                <div className="px-4 -mt-12 relative pb-4">
                    <img src={avatar} className="w-24 h-24 rounded-full border-4 border-black object-cover bg-black" />
                    <div className="flex justify-end mt-4">
                        <button className="px-4 py-1.5 rounded-full border border-[#536471] font-bold text-[14px]">Edit profile</button>
                    </div>
                    <div className="mt-4">
                        <h1 className="font-extrabold text-xl leading-tight">{name}</h1>
                        <p className="text-[#71767b]">{handle}</p>
                    </div>
                    <div className="mt-4 flex gap-4 text-[14px]">
                        <span className="text-[#71767b]"><b className="text-white">128</b> Following</span>
                        <span className="text-[#71767b]"><b className="text-white">5,102</b> Followers</span>
                    </div>
                </div>

                <div className="flex border-b border-[#2f3336]">
                    {['Posts', 'Replies', 'Media', 'Likes'].map(t => (
                        <button key={t} className="flex-1 h-14 font-bold text-sm text-[#71767b] relative">
                            {t}
                            {t === 'Posts' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-[#1d9bf0] rounded-full"></div>}
                        </button>
                    ))}
                </div>

                <Feed 
                    posts={profilePosts} 
                    onLike={handleLike} 
                    onCommentClick={() => {}} 
                    currentUserId="user" 
                    virtualTime={virtualTime} 
                    onLoadMore={() => {}}
                    isLoading={false}
                    onUserClick={setViewingProfile}
                />
            </motion.div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-black text-white relative font-sans">
            {!viewingProfile ? (
                <>
                    <header className="sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-[#2f3336] h-14 flex items-center px-4">
                        <div className="flex-1 flex items-center gap-4">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=User" className="w-8 h-8 rounded-full" onClick={() => setViewingProfile('user')} />
                            <h1 className="text-lg font-bold">Connected</h1>
                        </div>
                        <Settings size={20} className="text-white" />
                    </header>

                    <div className="flex border-b border-[#2f3336]">
                        {['For You', 'Following'].map(tab => (
                            <button 
                                key={tab} 
                                onClick={() => setActiveTab(tab as any)}
                                className={`flex-1 h-12 font-bold text-[15px] relative ${activeTab === tab ? 'text-white' : 'text-[#71767b]'}`}
                            >
                                {tab}
                                {activeTab === tab && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-[#1d9bf0] rounded-full"></div>}
                            </button>
                        ))}
                    </div>

                    <Feed 
                        posts={posts} 
                        onLike={handleLike} 
                        onCommentClick={() => {}} 
                        currentUserId="user" 
                        virtualTime={virtualTime}
                        onLoadMore={() => handleLoadMore()}
                        isLoading={isLoading}
                        onShowToCharacter={onShowToCharacter}
                        onShareToChat={(txt) => {
                            if (activeCharacterId && onSendMessage) {
                                onSendMessage(txt, activeCharacterId);
                                alert("Sent to character.");
                            }
                        }}
                        onUserClick={setViewingProfile}
                    />

                    <button 
                        onClick={() => setShowCompose(true)}
                        className="absolute bottom-20 right-4 w-14 h-14 rounded-full bg-[#1d9bf0] flex items-center justify-center shadow-xl hover:brightness-110 active:scale-95 transition-all"
                    >
                        <Plus size={24} className="text-white" strokeWidth={3} />
                    </button>

                    <nav className="h-14 border-t border-[#2f3336] flex items-center justify-around bg-black bg-opacity-95">
                        <Home size={24} className="text-white" fill="currentColor" />
                        <Search size={24} className="text-[#e7e9ea]" />
                        <Bell size={24} className="text-[#e7e9ea]" />
                        <Mail size={24} className="text-[#e7e9ea]" />
                    </nav>
                </>
            ) : (
                renderProfile()
            )}

            <AnimatePresence>
                {showCompose && (
                    <motion.div 
                        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                        className="absolute inset-0 bg-black z-50 flex flex-col pt-safe"
                    >
                        <div className="flex justify-between items-center p-4 border-b border-[#2f3336]">
                            <button onClick={() => setShowCompose(false)}><X size={24} /></button>
                            <div className="flex bg-[#202327] rounded-full p-1 scale-90">
                                <button className="px-4 py-1 rounded-full text-xs font-bold bg-[#1d9bf0]">User</button>
                                <button onClick={() => handleAIRespond()} className="px-4 py-1 rounded-full text-xs font-bold text-[#71767b] flex gap-1 items-center">
                                    <Sparkles size={12} className="text-[#1d9bf0]" /> AI Post
                                </button>
                            </div>
                            <button 
                                onClick={handleCreatePost} 
                                disabled={!composeText.trim() && composeAttachment === 'none'}
                                className="px-4 py-1.5 bg-[#1d9bf0] text-white rounded-full font-bold text-sm disabled:opacity-50"
                            >
                                {isGenerating ? '...' : 'Post'}
                            </button>
                        </div>
                        <div className="flex-1 p-4 flex gap-3 overflow-y-auto">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=User" className="w-10 h-10 rounded-full" />
                            <div className="flex-1">
                                <textarea 
                                    autoFocus value={composeText} onChange={e => setComposeText(e.target.value)}
                                    placeholder="What's happening?"
                                    className="w-full bg-transparent text-xl outline-none resize-none min-h-[150px]"
                                />
                                {composeAttachment !== 'none' && (
                                    <div className="mt-2 p-3 bg-[#1d9bf0]/10 border border-[#1d9bf0]/20 rounded-xl flex justify-between items-center">
                                        <span className="text-[13px] text-[#1d9bf0] font-bold italic">✨ AI Visualization Enabled: {composeAttachment}</span>
                                        <button onClick={() => setComposeAttachment('none')}><X size={14} /></button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-3 border-t border-[#2f3336] flex flex-col gap-4">
                            <div className="text-[10px] tracking-widest uppercase font-bold text-[#71767b] ml-1">Visualization (AI Gen)</div>
                            <div className="flex gap-2">
                                {(['16:9', '9:16', 'selfie'] as const).map(opt => (
                                    <button 
                                        key={opt} onClick={() => setComposeAttachment(opt)}
                                        className={`px-4 py-1.5 rounded-full border text-xs font-bold transition-all ${composeAttachment === opt ? 'bg-[#1d9bf0] border-[#1d9bf0] text-white' : 'border-[#2f3336] text-[#1d9bf0]'}`}
                                    >
                                        {opt.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

