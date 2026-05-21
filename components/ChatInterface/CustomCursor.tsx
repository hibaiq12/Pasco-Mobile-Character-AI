import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, useSpring, useMotionValue } from 'motion/react';
import { AppSettings } from '../../types';
import { getSettings } from '../../services/StorageServices/settings';

interface CustomCursorProps {
    settings?: AppSettings;
    previewState?: 'idle' | 'hovering' | 'clicking' | 'selecting' | null;
    isStaticPreview?: boolean;
}

export const CustomCursor: React.FC<CustomCursorProps> = ({ settings: propSettings, previewState, isStaticPreview }) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const localSettings = propSettings || getSettings();

    const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    const [isHovering, setIsHovering] = useState(false);
    const [isClicking, setIsClicking] = useState(false);
    const [isSelecting, setIsSelecting] = useState(false);
    const [isIdle, setIsIdle] = useState(false);
    const [mounted, setMounted] = useState(false);
    
    // Mobile detection
    const [isMobile, setIsMobile] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (isStaticPreview) {
            setMounted(true);
            return;
        }
        
        const checkMobile = () => {
            return typeof window !== 'undefined' && 
                (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.matchMedia("(pointer: coarse)").matches);
        };
        const mobileStatus = checkMobile();
        const timeout = setTimeout(() => {
            setIsMobile(mobileStatus);
            setMounted(true);
        }, 0);
        
        let idleTimeout: NodeJS.Timeout;
        const selectCheckInterval = setInterval(() => {
            const selection = window.getSelection();
            if (selection && selection.toString().length > 0) {
                setIsSelecting(true);
            } else {
                setIsSelecting(false);
            }
        }, 150);

        const updateMousePosition = (e: MouseEvent) => {
            if (mobileStatus) return;
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
            setIsIdle(false);
            clearTimeout(idleTimeout);
            idleTimeout = setTimeout(() => setIsIdle(true), 15000);
        };

        const updateHoverState = (e: MouseEvent) => {
            if (mobileStatus) return;
            const target = e.target as HTMLElement | null;
            if (!target) return;
            const isClickable = target.tagName.toLowerCase() === 'button' || 
                                target.tagName.toLowerCase() === 'a' || 
                                target.closest('button') || 
                                target.closest('a') ||
                                window.getComputedStyle(target).cursor === 'pointer' ||
                                window.getComputedStyle(target).cursor === 'text';
            
            const isTextPointer = window.getComputedStyle(target).cursor === 'text' || 
                                 target.tagName.toLowerCase() === 'textarea' || 
                                 target.tagName.toLowerCase() === 'input';
            
            setIsHovering(!!isClickable && !isTextPointer);
        };

        const handleMouseDown = () => setIsClicking(true);
        const handleMouseUp = () => setIsClicking(false);

        // Prevent Right Click (Context Menu) on Mobile
        const blockContextMenu = (ev: MouseEvent) => {
            if (mobileStatus) {
                ev.preventDefault();
            }
        };

        document.addEventListener('contextmenu', blockContextMenu);

        if (!mobileStatus) {
            document.addEventListener('mousemove', updateMousePosition);
            document.addEventListener('mouseover', updateHoverState);
            document.addEventListener('mousedown', handleMouseDown);
            document.addEventListener('mouseup', handleMouseUp);
            idleTimeout = setTimeout(() => setIsIdle(true), 15000);
        }

        return () => {
            clearTimeout(timeout);
            document.removeEventListener('contextmenu', blockContextMenu);
            document.removeEventListener('mousemove', updateMousePosition);
            document.removeEventListener('mouseover', updateHoverState);
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mouseup', handleMouseUp);
            clearTimeout(idleTimeout);
            clearInterval(selectCheckInterval);
        };
    }, [mouseX, mouseY, isStaticPreview]);

    // Canvas rendering for mobile gestures
    useEffect(() => {
        if (!isMobile || !canvasRef.current || !mounted || localSettings.enableMobileGesture === false || isStaticPreview) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const hexColor = localSettings.cursorColor || '#8400FF';
        let r = 132, g = 0, b = 255;
        if (hexColor.match(/^#([a-fA-F0-9]{6})$/)) {
            r = parseInt(hexColor.slice(1,3), 16);
            g = parseInt(hexColor.slice(3,5), 16);
            b = parseInt(hexColor.slice(5,7), 16);
        }

        let reqId: number;
        // Group points by touch ID
        const multiTrailRef = { current: {} as Record<number, { x: number, y: number, time: number }[]> };

        const resizeCanvas = () => {
            if (typeof window === 'undefined') return;
            const ratio = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * ratio;
            canvas.height = window.innerHeight * ratio;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            ctx.scale(ratio, ratio);
        };
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const handleTouchAction = (e: TouchEvent) => {
            const touches = Array.from(e.touches).slice(0, 6);
            touches.forEach(touch => {
                const id = touch.identifier;
                if (!multiTrailRef.current[id]) multiTrailRef.current[id] = [];
                multiTrailRef.current[id].push({ x: touch.clientX, y: touch.clientY, time: Date.now() });
                if (multiTrailRef.current[id].length > 40) multiTrailRef.current[id].shift();
            });
        };

        document.addEventListener('touchmove', handleTouchAction, { passive: true });
        document.addEventListener('touchstart', handleTouchAction, { passive: true });

        const drawTrail = () => {
            ctx.clearRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
            const now = Date.now();
            const lifespan = 800; // ms

            Object.keys(multiTrailRef.current).forEach(key => {
                const id = parseInt(key);
                let trail = multiTrailRef.current[id];
                trail = trail.filter(p => now - p.time <= lifespan);
                multiTrailRef.current[id] = trail;

                if (trail.length === 0) {
                    delete multiTrailRef.current[id];
                    return;
                }

                trail.forEach((p, i) => {
                    const age = now - p.time;
                    const progress = 1 - (age / lifespan);
                    ctx.beginPath();
                    const radius = i === trail.length - 1 ? 6 : 4 * progress;
                    
                    if (i === trail.length - 1) {
                        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.3 * progress})`;
                        ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
                        ctx.fill();
                    }

                    ctx.beginPath();
                    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.8 * progress})`;
                    ctx.shadowBlur = 10 * progress;
                    ctx.shadowColor = hexColor;
                    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                });

                if (trail.length > 1) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.15)`;
                    ctx.lineWidth = 2;
                    ctx.lineCap = 'round';
                    ctx.moveTo(trail[0].x, trail[0].y);
                    for (let i = 1; i < trail.length; i++) {
                        ctx.lineTo(trail[i].x, trail[i].y);
                    }
                    ctx.stroke();
                }
            });
            reqId = requestAnimationFrame(drawTrail);
        };

        reqId = requestAnimationFrame(drawTrail);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            document.removeEventListener('touchmove', handleTouchAction);
            document.removeEventListener('touchstart', handleTouchAction);
            cancelAnimationFrame(reqId);
        };
    }, [isMobile, mounted, localSettings.enableMobileGesture, localSettings.cursorColor, isStaticPreview]);

    if (!mounted) return null;

    if (isMobile && !isStaticPreview) {
        if (localSettings.enableMobileGesture === false) return null;
        return createPortal(
            <div id="pasco-gesture-trail-container" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 2147483647 }}>
                <canvas ref={canvasRef} style={{ width: '100%', height: '100%', pointerEvents: 'none' }} />
            </div>,
            document.body
        );
    }

    let variant = previewState || "default";
    if (!previewState) {
        if (isSelecting) variant = "selecting";
        else if (isClicking) variant = "clicking";
        else if (isHovering) variant = "hovering";
        else if (isIdle) variant = "idle";
    }

    const cColor = localSettings.cursorColor || "#8400FF";
    
    // Convert hex to rgb for rgba
    let rgbStr = "132, 0, 255";
    if (cColor.match(/^#([a-fA-F0-9]{6})$/)) {
        const r = parseInt(cColor.slice(1,3), 16);
        const g = parseInt(cColor.slice(3,5), 16);
        const b = parseInt(cColor.slice(5,7), 16);
        rgbStr = `${r}, ${g}, ${b}`;
    }

    // Default Type Variants
    const coreVariantsDefault = {
        default: { scale: 1, backgroundColor: cColor, opacity: 1, borderRadius: "50%", height: "8px", width: "8px" },
        clicking: { scale: 0.5, backgroundColor: cColor, opacity: 1, borderRadius: "50%", height: "8px", width: "8px" },
        hovering: { scale: 1.2, backgroundColor: cColor, opacity: 1, borderRadius: "50%", height: "8px", width: "8px" },
        selecting: { scale: 1, backgroundColor: cColor, opacity: 0.9, borderRadius: "2px", height: "20px", width: "2px" },
        idle: { scale: 1.5, opacity: 0.5, backgroundColor: cColor, borderRadius: "50%", height: "8px", width: "8px" }
    };

    const ringVariantsDefault = {
        default: { 
            scale: 1, borderColor: `rgba(${rgbStr}, 0.4)`, backgroundColor: "transparent",
            width: "32px", height: "32px", borderRadius: "50%", opacity: 1, rotate: 0
        },
        clicking: { 
            scale: 0.8, borderColor: cColor, backgroundColor: `rgba(${rgbStr}, 0.2)`,
            borderRadius: "50%", width: "32px", height: "32px", opacity: 1, rotate: 0
        },
        hovering: { 
            scale: 1.3, borderColor: cColor, backgroundColor: `rgba(${rgbStr}, 0.1)`,
            borderRadius: "50%", width: "32px", height: "32px", opacity: 1, rotate: 0
        },
        selecting: { 
            scale: 1.2, borderColor: `rgba(${rgbStr}, 0.6)`, backgroundColor: `rgba(${rgbStr}, 0.15)`,
            borderRadius: "6px", width: "16px", height: "30px", opacity: 0.7, rotate: 0
        },
        idle: { 
            scale: 1.1, borderColor: `rgba(${rgbStr}, 0.2)`, backgroundColor: "transparent",
            borderRadius: "50%", width: "32px", height: "32px", opacity: 1, rotate: 0
        }
    };

    // Tactical Type Variants
    const coreVariantsTactical = {
        default: { scale: 1, backgroundColor: cColor, opacity: 1, borderRadius: "50%", height: "8px", width: "8px" },
        clicking: { scale: 0.4, backgroundColor: cColor, opacity: 1, borderRadius: "50%", height: "8px", width: "8px", transition: { type: "spring", stiffness: 600, damping: 15 } },
        hovering: { scale: 2.5, backgroundColor: `rgba(${rgbStr}, 0.15)`, opacity: 1, borderRadius: "0%", height: "8px", width: "8px" },
        selecting: { scale: 1, backgroundColor: cColor, opacity: 0.9, borderRadius: "0px", height: "18px", width: "2px" },
        idle: { scale: 1, opacity: 0.5, backgroundColor: cColor, borderRadius: "50%", height: "8px", width: "8px" }
    };

    const ringVariantsTactical = {
        default: { 
            scale: 1, borderColor: `rgba(${rgbStr}, 0.6)`, backgroundColor: "transparent",
            width: "24px", height: "24px", borderRadius: "0%", opacity: 1, rotate: 45
        },
        clicking: { 
            scale: 1.4, borderColor: cColor, backgroundColor: `rgba(${rgbStr}, 0.4)`,
            borderRadius: "0%", width: "24px", height: "24px", opacity: 0.8, rotate: 135,
            transition: { type: "spring", stiffness: 500, damping: 20 }
        },
        hovering: { 
            scale: 1.2, borderColor: "transparent", backgroundColor: "transparent",
            borderRadius: "0%", width: "32px", height: "32px", opacity: 1, rotate: 0
        },
        selecting: { 
            scale: 1, borderColor: "transparent", backgroundColor: "transparent",
            borderRadius: "0px", width: "16px", height: "30px", opacity: 1, rotate: 0
        },
        idle: { 
            scale: 1.2, borderColor: `rgba(${rgbStr}, 0.3)`, backgroundColor: "transparent",
            borderRadius: "0%", width: "24px", height: "24px", opacity: 1, rotate: 45
        }
    };

    const type = localSettings.cursorType || 'default';
    const coreVars = type === 'tactical' ? coreVariantsTactical : coreVariantsDefault;
    const ringVars = type === 'tactical' ? ringVariantsTactical : ringVariantsDefault;

    const crosshairCorners = type === 'tactical' && variant === 'hovering' && (
        <>
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2" style={{ borderColor: cColor }}></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2" style={{ borderColor: cColor }}></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2" style={{ borderColor: cColor }}></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2" style={{ borderColor: cColor }}></div>
        </>
    );

    const cursorContainer = (
        <div id={isStaticPreview ? undefined : "pasco-custom-cursor-container"} style={{ position: isStaticPreview ? 'absolute' : 'fixed', inset: 0, pointerEvents: 'none', zIndex: 2147483647, overflow: 'hidden' }}>
            {!isStaticPreview && (
                <style>{`
                    * { cursor: none !important; }
                    ::selection { background: rgba(${rgbStr}, 0.4) !important; color: inherit; }
                    #pasco-custom-cursor-container * {
                        will-change: transform, opacity;
                        backface-visibility: hidden;
                        transform: translateZ(0);
                    }
                `}</style>
            )}
            
            {/* Core Dot / I-Beam */}
            <motion.div 
                className="pointer-events-none origin-center mix-blend-screen"
                style={{ 
                    position: isStaticPreview ? 'absolute' : 'fixed',
                    ...(isStaticPreview ? { top: '50%', left: '50%' } : { x: springX, y: springY, top: 0, left: 0 }),
                    translateX: "-50%",
                    translateY: "-50%",
                    translateZ: 0,
                    boxShadow: `0 0 15px ${cColor}, 0 0 5px #ffffff`,
                    zIndex: 2147483647
                }}
                variants={coreVars}
                animate={variant}
                transition={isStaticPreview ? { duration: 0.2 } : { type: "spring", stiffness: 350, damping: 25 }}
            />
            
            {/* Outer Ring / Block */}
            <motion.div 
                className="pointer-events-none origin-center mix-blend-screen"
                style={{ 
                    position: isStaticPreview ? 'absolute' : 'fixed',
                    ...(isStaticPreview ? { top: '50%', left: '50%' } : { x: springX, y: springY, top: 0, left: 0 }),
                    translateX: "-50%",
                    translateY: "-50%",
                    translateZ: 0,
                    borderWidth: type === 'tactical' && variant === 'hovering' ? '0px' : '1.5px',
                    borderStyle: 'solid',
                    zIndex: 2147483646
                }}
                variants={ringVars}
                animate={variant}
                transition={isStaticPreview ? { duration: 0.2 } : { type: "spring", stiffness: 250, damping: 25 }}
            >
                {type === 'default' && (
                    <>
                        <motion.div 
                            className="absolute top-1/2 left-0 w-full h-[1px] transform -translate-y-1/2 translate-z-0"
                            style={{ backgroundColor: `rgba(${rgbStr}, 0.5)` }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: (isHovering && !isClicking && !isSelecting) ? 1 : 0 }}
                        />
                        <motion.div 
                            className="absolute top-0 left-1/2 w-[1px] h-full transform -translate-x-1/2 translate-z-0"
                            style={{ backgroundColor: `rgba(${rgbStr}, 0.5)` }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: (isHovering && !isClicking && !isSelecting) ? 1 : 0 }}
                        />
                    </>
                )}
                {crosshairCorners}
            </motion.div>
            
            {/* Idle Breathing Effect */}
            {variant === 'idle' && type === 'default' && (
                <motion.div 
                    className="pointer-events-none rounded-full border origin-center"
                    style={{ 
                        position: isStaticPreview ? 'absolute' : 'fixed',
                        ...(isStaticPreview ? { top: '50%', left: '50%' } : { x: springX, y: springY, top: 0, left: 0 }),
                        translateX: "-50%",
                        translateY: "-50%",
                        translateZ: 0,
                        width: '50px',
                        height: '50px',
                        borderColor: cColor,
                        backgroundColor: `rgba(${rgbStr}, 0.05)`,
                        zIndex: 2147483645
                    }}
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                />
            )}
            
            {/* Idle Breathing Effect for Tactical */}
            {variant === 'idle' && type === 'tactical' && (
                <motion.div 
                    className="pointer-events-none border origin-center"
                    style={{ 
                        position: isStaticPreview ? 'absolute' : 'fixed',
                        ...(isStaticPreview ? { top: '50%', left: '50%' } : { x: springX, y: springY, top: 0, left: 0 }),
                        translateX: "-50%",
                        translateY: "-50%",
                        translateZ: 0,
                        width: '36px',
                        height: '36px',
                        rotate: 45,
                        borderColor: cColor,
                        backgroundColor: `rgba(${rgbStr}, 0.05)`,
                        zIndex: 2147483645
                    }}
                    animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.05, 0.2] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                />
            )}
        </div>
    );

    return isStaticPreview ? cursorContainer : createPortal(cursorContainer, document.body);
};
