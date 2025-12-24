
import React, { useRef, useEffect, useCallback } from 'react';
import { SocialPost } from '../../../services/SmartphoneSocial';
import { PostCard } from './PostCard';

interface FeedProps {
    posts: SocialPost[];
    onLike: (id: string) => void;
    onCommentClick: (post: SocialPost) => void;
    currentUserId: string;
    virtualTime: number;
    onLoadMore: () => void;
    isLoading: boolean;
}

export const Feed: React.FC<FeedProps> = ({ 
    posts, onLike, onCommentClick, currentUserId, virtualTime, onLoadMore, isLoading 
}) => {
    const feedRef = useRef<HTMLDivElement>(null);

    const handleScroll = useCallback(() => {
        if (!feedRef.current) return;
        
        const { scrollTop, scrollHeight, clientHeight } = feedRef.current;
        // Trigger when within 50px of bottom
        if (scrollTop + clientHeight >= scrollHeight - 50) {
            onLoadMore();
        }
    }, [onLoadMore]);

    useEffect(() => {
        const ref = feedRef.current;
        if (ref) {
            ref.addEventListener('scroll', handleScroll);
            return () => ref.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);

    return (
        <div ref={feedRef} className="flex-1 overflow-y-auto custom-scrollbar pb-20">
            {posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-zinc-500">
                    <p className="text-xs">No posts yet. Connect with people!</p>
                </div>
            ) : (
                posts.map(post => (
                    <PostCard 
                        key={post.id} 
                        post={post} 
                        onLike={onLike} 
                        onCommentClick={onCommentClick}
                        currentUserId={currentUserId}
                        virtualTime={virtualTime}
                    />
                ))
            )}
            
            {/* Loading Indicator for Infinite Scroll */}
            <div className="py-6 flex justify-center h-16">
                {isLoading && <div className="w-5 h-5 border-2 border-zinc-800 border-t-cyan-500 rounded-full animate-spin"></div>}
            </div>
        </div>
    );
};
