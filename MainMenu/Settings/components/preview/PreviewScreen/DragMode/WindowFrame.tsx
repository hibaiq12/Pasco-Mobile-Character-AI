
import React, { useState } from 'react';
import { X, Settings, Smartphone, Monitor } from 'lucide-react';

export interface ScreenInstance {
    id: string;
    moduleId: string | null;
    viewMode: 'mobile' | 'desktop';
    x: number;
    y: number;
}

interface WindowFrameProps {
    children: React.ReactNode;
    instance: ScreenInstance;
    onClose: (id: string) => void;
    onToggleView: (id: string, mode: 'mobile' | 'desktop') => void;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({ children, instance, onClose, onToggleView }) => {
    const [showMenu, setShowMenu] = useState(false);
    
    // Dimension Logic
    // Desktop: 1024px Width (standard LG breakpoint) ensures desktop UI features (sidebars) trigger correctly.
    // Height 640px is a reasonable 16:10 aspect ratio for a windowed view.
    const width = instance.viewMode === 'mobile' ? '375px' : '1024px';
    const height = instance.viewMode === 'mobile' ? '667px' : '640px';
    const isMobile = instance.viewMode === 'mobile';

    return (
        <div 
            className="absolute transition-all duration-300 ease-out shadow-2xl flex flex-col group/window"
            style={{ 
                left: instance.x, 
                top: instance.y,
                width: width,
                height: height,
                touchAction: 'none' // Prevent dragging the canvas when interacting with window
            }}
        >
            {/* --- CONTROLS LAYER (FLOATING OUTSIDE) --- */}
            
            {/* Top Left: Close Button */}
            <button 
                onClick={(e) => { e.stopPropagation(); onClose(instance.id); }}
                className="absolute -top-4 -left-4 p-2 bg-red-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform z-[150] hover:bg-red-500 border-2 border-[#121212] flex items-center justify-center cursor-pointer pointer-events-auto"
                title="Close Screen"
            >
                <X size={16} strokeWidth={3} />
            </button>

            {/* Top Right: Settings / View Mode */}
            <div className="absolute -top-4 -right-12 z-[150] flex flex-col items-center gap-2 pointer-events-auto">
                <button 
                    onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                    className={`p-2 rounded-full shadow-lg transition-all border-2 border-[#121212] ${showMenu ? 'bg-white text-black rotate-90' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
                    title="Layout Settings"
                >
                    <Settings size={18} />
                </button>

                {showMenu && (
                    <div className="flex flex-col gap-2 animate-in slide-in-from-top-2 fade-in bg-zinc-900/90 p-1.5 rounded-full border border-white/10 backdrop-blur-md shadow-xl">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onToggleView(instance.id, 'mobile'); setShowMenu(false); }}
                            className={`p-2 rounded-full shadow-sm transition-all ${isMobile ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
                            title="Mobile View"
                        >
                            <Smartphone size={16} />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onToggleView(instance.id, 'desktop'); setShowMenu(false); }}
                            className={`p-2 rounded-full shadow-sm transition-all ${!isMobile ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
                            title="Desktop View (lg)"
                        >
                            <Monitor size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* --- WINDOW CONTENT --- */}
            <div className={`w-full h-full overflow-hidden relative border-2 border-white/20 bg-[#0a0a0a] shadow-2xl ${isMobile ? 'rounded-[2.5rem]' : 'rounded-xl'}`}>
                {/* Content Container - Ensures absolute positioned children of modules are contained */}
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                    {children}
                </div>
            </div>
        </div>
    );
};
