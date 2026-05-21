
import React, { useState } from 'react';
import { SocialPost } from '../../../services/SmartphoneSocial';
import { X, Send, ImageIcon, Smile, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CommentModalProps {
    post: SocialPost;
    onClose: () => void;
    onAddComment: (postId: string, text: string) => void;
    virtualTime: number;
}

export const CommentModal: React.FC<CommentModalProps> = ({ post, onClose, onAddComment, virtualTime }) => {
    const [input, setInput] = useState('');

    const handleSubmit = () => {
        if (!input.trim()) return;
        onAddComment(post.id, input);
        setInput('');
        onClose(); // In X, usually closes or stays, let's close for simplicity or stay
    };

    const formatTime = (timestamp: number) => {
        const diff = virtualTime - timestamp;
        const seconds = Math.floor(diff / 1000);
        if (seconds < 60) return `${Math.max(1, seconds)}s`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        return `${Math.floor(hours / 24)}d`;
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] bg-black flex flex-col font-sans"
        >
            {/* Header */}
            <div className="h-14 flex items-center justify-between px-4 sticky top-0 bg-black/80 backdrop-blur-md border-b border-[#2f3336]">
                <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
                    <X size={20} />
                </button>
                <button 
                    onClick={handleSubmit}
                    disabled={!input.trim()}
                    className="px-4 py-1.5 bg-[#1d9bf0] text-white rounded-full font-bold text-sm disabled:opacity-50 transition-all"
                >
                    Reply
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                {/* Original Post context */}
                <div className="flex gap-3 mb-6 relative">
                    <div className="flex flex-col items-center shrink-0">
                        <img src={post.authorAvatar} className="w-10 h-10 rounded-full object-cover bg-zinc-900" />
                        <div className="w-0.5 flex-1 bg-[#333639] my-1"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 text-[15px]">
                            <span className="font-bold text-white">{post.authorName}</span>
                            <span className="text-[#71767b]">{post.authorHandle}</span>
                            <span className="text-[#71767b]">·</span>
                            <span className="text-[#71767b]">{formatTime(post.timestamp)}</span>
                        </div>
                        <p className="text-[15px] text-[#e7e9ea] mt-0.5 leading-normal">{post.content}</p>
                        <div className="mt-4 text-[#71767b] text-[14px]">
                            Replying to <span className="text-[#1d9bf0] hover:underline cursor-pointer">{post.authorHandle}</span>
                        </div>
                    </div>
                </div>

                {/* Your Reply Area */}
                <div className="flex gap-3">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=User" className="w-10 h-10 rounded-full shrink-0 object-cover" />
                    <div className="flex-1">
                        <textarea 
                            autoFocus
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Post your reply"
                            className="w-full bg-transparent text-xl text-white placeholder-[#71767b] border-none outline-none resize-none min-h-[150px]"
                        />
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="p-3 border-t border-[#2f3336] flex items-center justify-between">
                <div className="flex gap-1">
                    <button className="p-2 text-[#1d9bf0] rounded-full hover:bg-[#1d9bf0]/10 tracking-tight transition-all">
                        <ImageIcon size={20} />
                    </button>
                    <button className="p-2 text-[#1d9bf0] rounded-full hover:bg-[#1d9bf0]/10 transition-all">
                        <Smile size={20} />
                    </button>
                    <button className="p-2 text-[#1d9bf0] rounded-full hover:bg-[#1d9bf0]/10 transition-all">
                        <BarChart2 size={20} />
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[14px] text-[#71767b]">{input.length}/280</span>
                </div>
            </div>

            {/* Comments Sub-list (Replies to this post) */}
            <div className="border-t border-[#2f3336] mt-4">
                <div className="p-4 font-bold text-lg">Replies</div>
                {post.comments.length === 0 ? (
                    <div className="px-4 py-8 text-center text-[#71767b] text-[15px]">Be the first to reply!</div>
                ) : (
                    post.comments.map(comment => (
                        <div key={comment.id} className="border-b border-[#2f3336] p-4 flex gap-3 hover:bg-white/[0.03] transition-colors">
                            <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${comment.authorName}`} className="w-10 h-10 rounded-full shrink-0 bg-zinc-900" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                    <span className="font-bold text-white text-[15px]">{comment.authorName}</span>
                                    <span className="text-[#71767b] text-[14px]">·</span>
                                    <span className="text-[#71767b] text-[14px]">{formatTime(comment.timestamp)}</span>
                                </div>
                                <p className="text-[15px] text-[#e7e9ea] mt-0.5">{comment.content}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </motion.div>
    );
};

