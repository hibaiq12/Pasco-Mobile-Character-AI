
import React from 'react';
import { SocialPost } from '../../../services/SmartphoneSocial';
import { Heart, MessageCircle, Share2, Repeat, MoreHorizontal } from 'lucide-react';

interface PostCardProps {
    post: SocialPost;
    onLike: (id: string) => void;
    onCommentClick: (post: SocialPost) => void;
    currentUserId: string;
    virtualTime: number;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onLike, onCommentClick, currentUserId, virtualTime }) => {
    
    const formatTime = (timestamp: number) => {
        const diff = virtualTime - timestamp;
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        return `${Math.floor(hours / 24)}d`;
    };

    return (
        <div className="border-b border-white/5 py-3 px-4 hover:bg-white/[0.02] transition-colors">
            <div className="flex gap-3">
                <img src={post.authorAvatar} className="w-10 h-10 rounded-full object-cover shrink-0 bg-zinc-800 border border-zinc-700" />
                <div className="flex-1 min-w-0">
                    {/* Post Header */}
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                                <span className="font-bold text-sm text-zinc-200">{post.authorName}</span>
                                <span className="text-[10px] text-zinc-500">· {formatTime(post.timestamp)}</span>
                            </div>
                            <span className="text-xs text-zinc-500">{post.authorHandle}</span>
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
                            {/* AI Generated Tag */}
                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[8px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                AI Generated
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center mt-3 pr-4">
                        <button 
                            className={`group flex items-center gap-1.5 transition-colors ${post.isLiked ? 'text-pink-500' : 'text-zinc-500 hover:text-pink-500'}`} 
                            onClick={() => onLike(post.id)}
                        >
                            <Heart size={18} className={post.isLiked ? "fill-pink-500" : "group-hover:scale-110 transition-transform"} />
                            <span className="text-xs">{post.likes}</span>
                        </button>

                        <button 
                            className="group flex items-center gap-1.5 text-zinc-500 hover:text-blue-400 transition-colors"
                            onClick={() => onCommentClick(post)}
                        >
                            <MessageCircle size={18} className="group-hover:scale-110 transition-transform" />
                            <span className="text-xs">{post.comments.length}</span>
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
    );
};
