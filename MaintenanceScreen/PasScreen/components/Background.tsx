
import React from 'react';
import { LayoutGrid, Zap } from 'lucide-react';

interface BackgroundProps {
    hovered: 'hub' | 'maintenance' | null;
}

export const Background: React.FC<BackgroundProps> = ({ hovered }) => {
    return (
        <>
            {/* --- CORE ATMOSPHERE --- */}
            
            {/* Deep Violet Glow (Top Center) */}
            <div className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] bg-violet-900/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
            
            {/* Secondary Cyan Glow (Bottom Right) */}
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Interactive Hover Glow */}
            <div 
                className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                    hovered === 'hub' ? 'bg-[radial-gradient(circle_at_30%_50%,_rgba(139,92,246,0.15),transparent_60%)]' :
                    hovered === 'maintenance' ? 'bg-[radial-gradient(circle_at_70%_50%,_rgba(245,158,11,0.1),transparent_60%)]' :
                    'bg-transparent'
                }`} 
            />
            
            {/* Base Dark Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0c] via-[#050505] to-black opacity-95" />
            
            {/* Animated Neural Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8b5cf61a_1px,transparent_1px),linear-gradient(to_bottom,#8b5cf61a_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_60%,transparent_100%)] pointer-events-none opacity-20"></div>
            
            {/* Noise Texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay pointer-events-none"></div>

            {/* Floating Decorations (Desktop Only) */}
            <div className="hidden md:block absolute top-20 left-20 text-violet-500/10 pointer-events-none animate-float">
                <LayoutGrid size={200} />
            </div>
            <div className="hidden md:block absolute bottom-10 right-10 text-blue-500/5 pointer-events-none translate-y-1/4 translate-x-1/4">
                <Zap size={300} strokeWidth={0.5} />
            </div>
        </>
    );
};
