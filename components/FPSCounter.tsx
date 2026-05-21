
import React, { useState, useEffect, useRef } from 'react';

interface FPSCounterProps {
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'discord';
    sizeIndex?: number;
}

export const FPSCounter: React.FC<FPSCounterProps> = ({ position = 'top-right', sizeIndex = 0 }) => {
    const [fps, setFps] = useState(0);
    const frameCount = useRef(0);
    const lastTime = useRef<number>(0);
    const requestRef = useRef<number>();

    useEffect(() => {
        lastTime.current = performance.now();
        
        const animate = (time: number) => {
            frameCount.current++;
            if (time - lastTime.current >= 1000) {
                setFps(Math.round((frameCount.current * 1000) / (time - lastTime.current)));
                frameCount.current = 0;
                lastTime.current = time;
            }
            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    const getPositionStyles = () => {
        switch (position) {
            case 'top-left':
                return 'top-4 left-4';
            case 'top-center':
                return 'top-4 left-1/2 -translate-x-1/2';
            case 'top-right':
                return 'top-4 right-4';
            case 'bottom-left':
                return 'bottom-4 left-4';
            case 'bottom-center':
                return 'bottom-4 left-1/2 -translate-x-1/2';
            case 'bottom-right':
                return 'bottom-4 right-4';
            case 'discord':
                return 'top-[115px] left-[16px] md:left-[22px]';
            default:
                return 'top-4 right-4';
        }
    };

    const getScale = () => {
        switch (sizeIndex) {
            case 1: return 1.25;
            case 2: return 1.5625;
            case 3: return 1.953;
            default: return 1.0;
        }
    };

    const isDiscord = position === 'discord';

    return (
        <div 
            className={`fixed ${getPositionStyles()} z-[9999] transition-all duration-300 ${isDiscord ? 'opacity-35 hover:opacity-100 cursor-default pointer-events-auto' : 'pointer-events-none'}`}
            style={{ transform: `scale(${getScale()})`, transformOrigin: position.includes('left') ? 'left center' : position.includes('right') ? 'right center' : 'center center' }}
        >
            <div className="bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-2xl">
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${fps >= 55 ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : fps >= 30 ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`}></div>
                <span className="text-[10px] font-black text-white font-mono tracking-widest">
                    {fps} <span className="text-zinc-500">FPS</span>
                </span>
            </div>
        </div>
    );
};
