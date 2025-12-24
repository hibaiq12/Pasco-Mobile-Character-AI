
import React, { useState } from 'react';
import { SocialPost } from '../../../services/SmartphoneSocial';
import { X, Send } from 'lucide-react';

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
    };

    const formatTime = (timestamp: number) => {
        const diff = virtualTime - timestamp;
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'Just now';
        return `${minutes}m`;
    };

    return (
        <div className="absolute inset-0 z-50 bg-black flex flex-col animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-zinc-900">
                <button onClick={onClose} className="p-1 text-white"><X size={24}/></button>
                <h3 className="font-bold text-white text-sm">Comments</h3>
                <div className="w-6"></div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Original Post Snippet */}
                <div className="flex gap-3 mb-6 border-b border-white/5 pb-4">
                    <img src={post.authorAvatar} className="w-8 h-8 rounded-full" />
                    <div>
                        <span className="text-xs font-bold text-white block">{post.authorName}</span>
                        <p className="text-xs text-zinc-400 line-clamp-2">{post.content}</p>
                    </div>
                </div>

                {/* Comments List */}
                {post.comments.length === 0 && <p className="text-center text-zinc-600 text-xs">No comments yet.</p>}
                {post.comments.map(comment => (
                    <div key={comment.id} className="flex gap-3">
                         <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white shrink-0">
                             {comment.authorName[0]}
                         </div>
                         <div className="flex-1">
                             <div className="flex items-baseline gap-2">
                                 <span className="text-xs font-bold text-white">{comment.authorName}</span>
                                 <span className="text-[10px] text-zinc-500">{formatTime(comment.timestamp)}</span>
                             </div>
                             <p className="text-xs text-zinc-300 mt-0.5">{comment.content}</p>
                         </div>
                    </div>
                ))}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/10 bg-zinc-900 flex gap-2">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Reply..."
                    className="flex-1 bg-black border border-zinc-700 rounded-full px-4 py-2 text-sm text-white focus:border-cyan-500 outline-none"
                    autoFocus
                />
                <button onClick={handleSubmit} className="p-2 bg-cyan-600 text-white rounded-full">
                    <Send size={16} />
                </button>
            </div>
        </div>
    );
};
