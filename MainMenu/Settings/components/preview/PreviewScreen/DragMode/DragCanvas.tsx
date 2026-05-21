
import React, { useRef, useState } from 'react';
import { ScreenInstance, WindowFrame } from './WindowFrame';

interface DragCanvasProps {
    screens: ScreenInstance[];
    onCloseScreen: (id: string) => void;
    onToggleView: (id: string, mode: 'mobile' | 'desktop') => void;
    // UPDATED SIGNATURE: Passes screenId to allow parent to target updates
    renderContent: (moduleId: string | null, screenId: string) => React.ReactNode;
}

export const DragCanvas: React.FC<DragCanvasProps> = ({ screens, onCloseScreen, onToggleView, renderContent }) => {
    const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
    const [isPinching, setIsPinching] = useState(false);
    
    const gestureRef = useRef({
        startX: 0,
        startY: 0,
        initialDistance: 0,
        initialScale: 1,
        lastX: 0,
        lastY: 0
    });

    // --- GESTURE LOGIC (ZOOM & PAN) ---
    const getDistance = (touches: React.TouchList) => {
        return Math.hypot(
            touches[0].clientX - touches[1].clientX,
            touches[0].clientY - touches[1].clientY
        );
    };

    const handleGestureStart = (e: React.TouchEvent | React.MouseEvent) => {
        // Only trigger on the background layer
        if ((e.target as HTMLElement).closest('.group\\/window')) return;

        if ('touches' in e) {
            if (e.touches.length === 1) {
                setIsPinching(false);
                gestureRef.current.startX = e.touches[0].clientX - transform.x;
                gestureRef.current.startY = e.touches[0].clientY - transform.y;
            } else if (e.touches.length === 2) {
                setIsPinching(true);
                gestureRef.current.initialDistance = getDistance(e.touches);
                gestureRef.current.initialScale = transform.scale;
            }
        } else {
             // Mouse Panning
             setIsPinching(false);
             gestureRef.current.startX = e.clientX - transform.x;
             gestureRef.current.startY = e.clientY - transform.y;
        }
    };

    const handleGestureMove = (e: React.TouchEvent | React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.group\\/window')) return;
        
        // Check for active drag (for mouse)
        if (!('touches' in e) && e.buttons !== 1) return;

        if ('touches' in e) {
             if (e.touches.length === 1 && !isPinching) {
                const newX = e.touches[0].clientX - gestureRef.current.startX;
                const newY = e.touches[0].clientY - gestureRef.current.startY;
                setTransform(prev => ({ ...prev, x: newX, y: newY }));
            } else if (e.touches.length === 2) {
                const currentDistance = getDistance(e.touches);
                const scaleFactor = currentDistance / gestureRef.current.initialDistance;
                const newScale = Math.min(Math.max(0.2, gestureRef.current.initialScale * scaleFactor), 5); 
                setTransform(prev => ({ ...prev, scale: newScale }));
            }
        } else {
            // Mouse Move
            const newX = e.clientX - gestureRef.current.startX;
            const newY = e.clientY - gestureRef.current.startY;
            setTransform(prev => ({ ...prev, x: newX, y: newY }));
        }
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey) {
            // Zoom
            e.preventDefault(); // Stop browser zoom
            const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
            const newScale = Math.min(Math.max(0.2, transform.scale * scaleFactor), 5);
            setTransform(prev => ({ ...prev, scale: newScale }));
        }
    };

    const contentStyle: React.CSSProperties = {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`,
        transition: isPinching ? 'none' : 'transform 0.1s linear', 
        transformOrigin: '0 0',
        willChange: 'transform',
        backfaceVisibility: 'hidden',
    };

    return (
        <div 
            className="absolute inset-0 z-0 overflow-hidden cursor-grab active:cursor-grabbing bg-zinc-950/50"
            onTouchStart={handleGestureStart}
            onTouchMove={handleGestureMove}
            onMouseDown={handleGestureStart}
            onMouseMove={handleGestureMove}
            onWheel={handleWheel}
        >
             {/* Background Grid for visual reference */}
             <div className="absolute inset-0 pointer-events-none opacity-20" 
                  style={{ 
                      backgroundSize: `${50 * transform.scale}px ${50 * transform.scale}px`,
                      backgroundPosition: `${transform.x}px ${transform.y}px`,
                      backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)'
                  }}
             ></div>

             <div className="w-full h-full origin-top-left" style={contentStyle}>
                 {/* Infinite Canvas Container */}
                 <div className="relative w-[5000px] h-[5000px]">
                    {screens.map(screen => (
                        <WindowFrame 
                            key={screen.id} 
                            instance={screen} 
                            onClose={onCloseScreen} 
                            onToggleView={onToggleView}
                        >
                            {renderContent(screen.moduleId, screen.id)}
                        </WindowFrame>
                    ))}
                 </div>
             </div>
        </div>
    );
};
