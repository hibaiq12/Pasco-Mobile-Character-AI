
import React, { useState } from 'react';
import { SocialPost } from '../../../services/SmartphoneSocial';
import { Heart, MessageCircle, Share, Repeat2, MoreHorizontal, Smartphone, Mail, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PostCardProps {
    post: SocialPost;
    onLike: (id: string) => void;
    onCommentClick: (post: SocialPost) => void;
    currentUserId: string;
    virtualTime: number;
    onShowToCharacter?: (postContent: string) => void;
    onShareToChat?: (text: string) => void;
    onUserClick?: (authorId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onLike, onCommentClick, currentUserId, virtualTime, onShowToCharacter, onShareToChat, onUserClick }) => {
    const [showShareMenu, setShowShareMenu] = useState(false);
    
    const formatTime = (timestamp: number) => {
        const diff = virtualTime - timestamp;
        const seconds = Math.floor(diff / 1000);
        if (seconds < 60) return `${Math.max(1, seconds)}s`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d`;
        
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const handleAvatarClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onUserClick) onUserClick(post.authorId);
    };

    const isUser = post.authorId === 'user';

    return (
        <div 
            className="border-b border-[#2f3336] py-3 px-4 hover:bg-white/[0.03] transition-colors cursor-pointer bg-black active:bg-white/[0.05]"
            onClick={() => onCommentClick(post)}
        >
            <div className="flex gap-3">
                {/* Avatar */}
                <div className="shrink-0">
                    <img 
                        src={post.authorAvatar} 
                        onClick={handleAvatarClick}
                        className="w-10 h-10 rounded-full object-cover bg-zinc-900 cursor-pointer hover:brightness-90 transition-all" 
                    />
                </div>
                
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-1 min-w-0 overflow-hidden text-[15px]">
                            <span 
                                onClick={handleAvatarClick}
                                className="font-bold text-white cursor-pointer hover:underline truncate"
                            >
                                {post.authorName}
                            </span>
                            <span className="text-[#71767b] truncate">{post.authorHandle}</span>
                            <span className="text-[#71767b] shrink-0">·</span>
                            <span className="text-[#71767b] shrink-0 hover:underline cursor-pointer">{formatTime(post.timestamp)}</span>
                        </div>
                        <button className="text-[#71767b] hover:text-[#1d9bf0] p-1.5 -mr-2 rounded-full hover:bg-[#1d9bf0]/10 transition-all">
                            <MoreHorizontal size={16} />
                        </button>
                    </div>

                    {/* Content */}
                    <p className="text-[15px] text-[#e7e9ea] leading-normal whitespace-pre-wrap mt-0.5 break-words">
                        {post.content}
                    </p>

                    {/* Image */}
                    {post.image && (
                        <div className="mt-3 rounded-2xl overflow-hidden border border-[#2f3336] bg-zinc-900/50">
                            <img 
                                src={post.image} 
                                className="w-full h-auto object-cover max-h-[512px] hover:brightness-95 transition-all" 
                                loading="lazy"
                            />
                        </div>
                    )}

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                            {post.tags.map(tag => (
                                <span key={tag} className="text-[#1d9bf0] text-[14px] hover:underline cursor-pointer">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-between items-center mt-3 max-w-sm ml-[-8px]">
                        {/* Reply */}
                        <button 
                            className="group flex items-center gap-1 text-[#71767b] transition-colors"
                            onClick={(e) => { e.stopPropagation(); onCommentClick(post); }}
                        >
                            <div className="p-2 rounded-full group-hover:bg-[#1d9bf0]/10 group-hover:text-[#1d9bf0] transition-all">
                                <MessageCircle size={18} />
                            </div>
                            <span className="text-[13px] group-hover:text-[#1d9bf0]">
                                {post.comments.length > 0 ? post.comments.length : ''}
                            </span>
                        </button>

                        {/* Repost */}
                        <button className="group flex items-center gap-1 text-[#71767b] transition-colors" onClick={(e) => e.stopPropagation()}>
                            <div className="p-2 rounded-full group-hover:bg-[#00ba7c]/10 group-hover:text-[#00ba7c] transition-all">
                                <Repeat2 size={18} />
                            </div>
                            <span className="text-[13px] group-hover:text-[#00ba7c]"></span>
                        </button>

                        {/* Like */}
                        <button 
                            className={`group flex items-center gap-1 transition-colors ${post.isLiked ? 'text-[#f91880]' : 'text-[#71767b]'}`} 
                            onClick={(e) => { e.stopPropagation(); onLike(post.id); }}
                        >
                            <div className={`p-2 rounded-full transition-all ${post.isLiked ? '' : 'group-hover:bg-[#f91880]/10 group-hover:text-[#f91880]'}`}>
                                <motion.div animate={post.isLiked ? { scale: [1, 1.4, 1] } : {}}>
                                    <Heart size={18} className={post.isLiked ? "fill-[#f91880]" : ""} />
                                </motion.div>
                            </div>
                            <span className={`text-[13px] ${post.isLiked ? 'text-[#f91880]' : 'group-hover:text-[#f91880]'}`}>
                                {post.likes > 0 ? post.likes : ''}
                            </span>
                        </button>

                        {/* Analytics (Visual Only) */}
                        <button className="group flex items-center gap-1 text-[#71767b] transition-colors" onClick={(e) => e.stopPropagation()}>
                            <div className="p-2 rounded-full group-hover:bg-[#1d9bf0]/10 group-hover:text-[#1d9bf0] transition-all">
                                <BarChart2 size={18} />
                            </div>
                        </button>

                        {/* Share */}
                        <div className="relative">
                            <button 
                                className="group flex items-center gap-1 text-[#71767b] transition-colors"
                                onClick={(e) => { e.stopPropagation(); setShowShareMenu(!showShareMenu); }}
                            >
                                <div className="p-2 rounded-full group-hover:bg-[#1d9bf0]/10 group-hover:text-[#1d9bf0] transition-all">
                                    <Share size={18} />
                                </div>
                            </button>
                            
                            <AnimatePresence>
                                {showShareMenu && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowShareMenu(false); }}></div>
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                            className="absolute bottom-full right-0 mb-2 w-56 bg-black border border-[#2f3336] rounded-xl shadow-[0_8px_24px_rgba(255,255,255,0.1)] z-50 overflow-hidden py-1"
                                        >
                                            {onShowToCharacter && (
                                                <button 
                                                    className="w-full text-left px-4 py-3 text-[14px] text-white hover:bg-white/[0.03] flex items-center gap-3 transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onShowToCharacter(`Memperlihatkan tweet dari ${post.authorName}:\n"${post.content}"`);
                                                        setShowShareMenu(false);
                                                    }}
                                                >
                                                    <Smartphone size={18} className="text-[#1d9bf0]" />
                                                    Tunjukkan ke Karakter
                                                </button>
                                            )}
                                            {onShareToChat && (
                                                <button 
                                                    className="w-full text-left px-4 py-3 text-[14px] text-white hover:bg-white/[0.03] flex items-center gap-3 transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onShareToChat(`Lihat tweet dari ${post.authorName}:\n"${post.content}"\n\nLink: https://connected.app/p/${post.id}`);
                                                        setShowShareMenu(false);
                                                    }}
                                                >
                                                    <Mail size={18} className="text-[#1d9bf0]" />
                                                    Share via Direct Message
                                                </button>
                                            )}
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

