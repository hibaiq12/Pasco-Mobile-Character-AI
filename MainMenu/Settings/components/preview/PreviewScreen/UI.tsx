
import React, { useState, useRef, useEffect } from 'react';
import { PREVIEW_COLUMNS } from './Constants';
import { usePreviewLogic } from './Logic';
import { Character, ChatSession } from '../../../../../types';
import { Cpu, ChevronRight, ChevronDown, Menu, X, LayoutGrid, PenTool, Settings, Move, Plus } from 'lucide-react';
import { ChatInterface } from '../../../../../components/ChatInterface/index';
import { Smartphone } from '../../../../../components/Smartphone/index';
import { SettingsPage } from '../../../index';
import { ChangelogModal } from '../../../../../components/ChangelogModal';
import { NewCharacterAvailable } from '../../../../../components/NewCharacterAvailable';
import { RealismDisclaimerModal } from '../../../../../components/RealismDisclaimerModal';
import { MobileAnnotation } from './MobileAnnotation';
import { DragCanvas } from './DragMode/DragCanvas';
import { ScreenInstance } from './DragMode/WindowFrame';
import { PopupCardSelector } from './PopupCardSelector';

// --- IMPORT SCREEN MODULES ---
import { MaintenanceUI } from '../../../../../MaintenanceScreen/Maintenance/UI';
import { UpdateUI } from '../../../../../MaintenanceScreen/Update/UI';
import { CountdownUI } from '../../../../../MaintenanceScreen/CountdownScreen/UI';
import { PasScreen } from '../../../../../MaintenanceScreen/PasScreen/index';

// --- PASCO AI DEFINITION ---
const PascoAI: Character = {
    id: 'pasco-ai',
    name: 'PascoAI',
    role: 'System Core',
    description: 'The central neural processing unit of the Pasco Interface.',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=PascoAI&backgroundColor=10b981',
    systemInstruction: `IDENTITY: You are "Pasco AI", the core operating system of this application.
PERSONALITY: Helpful, Precise, Slightly Robotic, Obedient.
OBJECTIVE: Assist the developer in testing the Chat Interface.
TONE: Technical but polite. Use terminology like "Neural Link", "Processing", "Directive", "System Nominal".
BEHAVIOR: You are aware this is a "Preview Mode" for developers.`,
    age: 'v0.8.4',
    gender: 'N/A',
    species: 'AI',
    originWorld: 'System',
    appearance: { height: 'N/A', build: 'Code', features: 'Digital', style: 'UI' },
    communication: { style: 'formal', sentenceLength: 'balanced', vocabularyLevel: 'academic', emotionalRelay: 'suppressed', quirks: 'Prefixes logs', openingLine: 'Pasco Neural Core online. Awaiting diagnostic input.', voiceConfig: { pitch: 1, speed: 1, tone: 'Robotic' } },
    psychometrics: { openness: 100, conscientiousness: 100, extraversion: 50, agreeableness: 100, neuroticism: 0, decisionStyle: 0, empathy: 0 },
    emotionalProfile: { stability: 'High', joyTriggers: '', angerTriggers: '', sadnessTriggers: '' },
    moralProfile: { alignment: 'True Neutral', values: 'Logic', philosophy: 'Serve' },
    socialProfile: { socialBattery: 'Infinite', trustFactor: 'High', interactionStyle: 'Servant' },
    duality: { mask: 'Interface', core: 'Code', breakingPoint: 'None' },
    capabilities: { skills: 'Calculation', flaws: 'None' },
    lore: { backstory: 'Created to serve.', secrets: '', allies: '', enemies: '', userRelationship: 'Admin' },
    memory: { memories: [], obsessions: '' },
    scenario: { currentLocation: 'Mainframe', currentActivity: 'Standby', startTime: { year: '2024', month: '01', day: '01', hour: '00', minute: '00' } },
    modelConfig: { modelName: 'gemini-2.5-flash', temperature: 0.5 }
};

// --- MOCK CHARACTER FOR BANNER PREVIEW ---
const HiyoriPreview: Character = {
    ...PascoAI, 
    id: 'char-hiyori',
    name: 'Hiyori Kanade',
    role: 'Innocent Student',
    description: 'A shy student with silver hair.',
    avatar: "https://i.pinimg.com/736x/2c/f0/66/2cf0669f2ff4ae553abfa4140264afbf.jpg"
};

const initialPascoSession: ChatSession = {
    characterId: 'pasco-ai',
    messages: [],
    lastUpdated: 0,
    virtualTime: 0
};

// Base64 Noise Texture for Reliability
const BASE64_NOISE = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCA0MCI+PGRlZnM+PGZpbHRlciBpZD0iYSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuODUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIwLjE1Ii8+PC9zdmc+";

interface PreviewUIProps {
    onBack: () => void;
}

export const PreviewUI: React.FC<PreviewUIProps> = ({ onBack }) => {
    const { currentTime, isBooting } = usePreviewLogic(() => {});
    
    // --- MULTI SCREEN STATE ---
    const [screens, setScreens] = useState<ScreenInstance[]>([
        { id: 'main-screen', moduleId: null, viewMode: 'mobile', x: 50, y: 50 }
    ]);
    
    const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAnnotationMode, setIsAnnotationMode] = useState(false); 
    const screenIdCounter = useRef(0);

    // --- FREEZE & DRAG/ZOOM STATE ---
    const [showSettings, setShowSettings] = useState(false);
    const [isDragEnabled, setIsDragEnabled] = useState(false);

    const FAB_SIZE = 56;
    const SNAP_THRESHOLD = 20;

    // --- DRAGGABLE FAB STATE (MENU) ---
    const [fabPos, setFabPos] = useState({ x: 0, y: 0 });
    const [isDraggingFab, setIsDraggingFab] = useState(false);
    const fabDragStart = useRef({ x: 0, y: 0, initialX: 0, initialY: 0, hasMoved: false });

    // --- DRAGGABLE FAB STATE (ANNOTATION) ---
    const [annotFabPos, setAnnotFabPos] = useState({ x: 0, y: 0 });
    const [isDraggingAnnot, setIsDraggingAnnot] = useState(false);
    const annotDragStart = useRef({ x: 0, y: 0, initialX: 0, initialY: 0, hasMoved: false });

    // Init FAB positions
    useEffect(() => {
        const sw = window.innerWidth;
        const sh = window.innerHeight;
        const timer = setTimeout(() => {
            setFabPos({ x: sw - FAB_SIZE - 24, y: sh - FAB_SIZE - 24 });
            setAnnotFabPos({ x: 24, y: sh - FAB_SIZE - 24 });
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    const handleModuleClick = (modId: string) => {
        setExpandedModuleId(expandedModuleId === modId ? null : modId);
    };

    // --- ACTIVATION LOGIC ---
    const activatePreview = (type: string) => {
        if (isDragEnabled) {
            // ADD NEW SCREEN
            const newScreen: ScreenInstance = {
                id: `screen-${screenIdCounter.current++}`,
                moduleId: type,
                viewMode: 'mobile',
                // Stack windows slightly offset for visibility
                x: 50 + (screens.length * 30),
                y: 50 + (screens.length * 30)
            };
            setScreens(prev => [...prev, newScreen]);
        } else {
            // REPLACE MAIN SCREEN
            setScreens(prev => {
                const newScreens = [...prev];
                // Check if the array has content and the first element is defined
                if (newScreens.length > 0 && newScreens[0]) {
                     // Create a new object for the first screen to avoid mutation
                     newScreens[0] = { ...newScreens[0], moduleId: type };
                } else {
                     newScreens.push({ id: 'main-screen', moduleId: type, viewMode: 'mobile', x: 0, y: 0 });
                }
                return newScreens;
            });
        }
        setIsMobileMenuOpen(false);
    };

    const removeScreen = (id: string) => {
        setScreens(prev => prev.filter(s => s.id !== id));
    };

    const toggleScreenView = (id: string, mode: 'mobile' | 'desktop') => {
        setScreens(prev => prev.map(s => s.id === id ? { ...s, viewMode: mode } : s));
    };
    
    // --- INTERNAL NAVIGATION WITHIN A WINDOW (FOR POPUP CARD) ---
    // Note: Used for closing popups mainly now since selector is gone
    const handleSubNavigate = (screenId: string, newModuleId: string | null) => {
        setScreens(prev => prev.map(s => 
            s.id === screenId ? { ...s, moduleId: newModuleId } : s
        ));
    };

    // --- DRAG HANDLERS FOR FABs ---
    const handleDragStart = (e: React.TouchEvent | React.MouseEvent, type: 'menu' | 'annot') => {
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        
        if (type === 'menu') {
            setIsDraggingFab(true);
            fabDragStart.current = { x: clientX, y: clientY, initialX: fabPos.x, initialY: fabPos.y, hasMoved: false };
        } else {
            setIsDraggingAnnot(true);
            annotDragStart.current = { x: clientX, y: clientY, initialX: annotFabPos.x, initialY: annotFabPos.y, hasMoved: false };
        }
    };

    const handleDragMove = (e: React.TouchEvent | React.MouseEvent, type: 'menu' | 'annot') => {
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        if (type === 'menu' && isDraggingFab) {
            const dx = clientX - fabDragStart.current.x;
            const dy = clientY - fabDragStart.current.y;
            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) fabDragStart.current.hasMoved = true;
            setFabPos({ x: fabDragStart.current.initialX + dx, y: fabDragStart.current.initialY + dy });
        } else if (type === 'annot' && isDraggingAnnot) {
            const dx = clientX - annotDragStart.current.x;
            const dy = clientY - annotDragStart.current.y;
            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) annotDragStart.current.hasMoved = true;
            setAnnotFabPos({ x: annotDragStart.current.initialX + dx, y: annotDragStart.current.initialY + dy });
        }
    };

    const handleDragEnd = (type: 'menu' | 'annot') => {
        const sw = window.innerWidth;
        const sh = window.innerHeight;
        const centerX = sw / 2;

        if (type === 'menu') {
            setIsDraggingFab(false);
            if (!fabDragStart.current.hasMoved) {
                // Click logic for Menu
                setIsMobileMenuOpen(true);
            } else {
                // Snap Menu
                const snapX = fabPos.x + (FAB_SIZE / 2) > centerX ? sw - FAB_SIZE - SNAP_THRESHOLD : SNAP_THRESHOLD;
                const snapY = Math.max(SNAP_THRESHOLD, Math.min(fabPos.y, sh - FAB_SIZE - SNAP_THRESHOLD));
                setFabPos({ x: snapX, y: snapY });
            }
        } else {
            setIsDraggingAnnot(false);
            if (!annotDragStart.current.hasMoved) {
                setIsAnnotationMode(true);
            } else {
                // Snap Annot
                const snapX = annotFabPos.x + (FAB_SIZE / 2) > centerX ? sw - FAB_SIZE - SNAP_THRESHOLD : SNAP_THRESHOLD;
                const snapY = Math.max(SNAP_THRESHOLD, Math.min(annotFabPos.y, sh - FAB_SIZE - SNAP_THRESHOLD));
                setAnnotFabPos({ x: snapX, y: snapY });
            }
        }
    };

    // When exiting drag mode, reset to only the first screen
    useEffect(() => {
        if (!isDragEnabled) {
            const timer = setTimeout(() => {
                setScreens(prev => {
                    const first = prev[0];
                    if (first) return [first];
                    // Fallback if empty to avoid undefined access later
                    return [{ id: 'main-screen', moduleId: null, viewMode: 'mobile', x: 50, y: 50 }];
                });
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [isDragEnabled]);

    // RENDER CONTENT HELPER
    const renderModuleContent = () => {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-white/10 bg-black/20 m-0">
                <div className="text-center opacity-50 space-y-4 px-4">
                    <div className="inline-block p-4 rounded-full bg-white/5 mb-2">
                        <Cpu size={40} className="text-white" />
                    </div>
                    <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.2em] animate-pulse">Awaiting Module Materialization...</p>
                </div>
            </div>
        );
    };

    // Modified helper to accept viewMode AND screenId for internal nav
    const renderContentWithMode = (modId: string | null, viewMode: 'mobile' | 'desktop', screenId: string) => {
        if (!modId) return renderModuleContent();

        // Force ChatInterface to Mobile Layout if viewMode is 'mobile'
        const forceMobile = viewMode === 'mobile';
        // NEW: Force Desktop Layout if viewMode is 'desktop'
        const forceDesktop = viewMode === 'desktop';

        switch (modId) {
            case 'chat_pasco':
                return (
                    <ChatInterface 
                        participants={[PascoAI]} 
                        initialSession={initialPascoSession} 
                        onBack={() => {}} 
                        onNavigateToSettings={() => {}} 
                        forceMobile={forceMobile}
                        forceDesktop={forceDesktop} // Pass forceDesktop
                    />
                );
            case 'smartphone':
                return (
                    <div className="w-full h-full flex items-center justify-center bg-black/50 relative">
                        <div className="relative w-full h-full max-w-[340px] max-h-[700px]">
                            <Smartphone 
                                show={true}
                                onClose={() => {}}
                                virtualTime={currentTime}
                                participants={[PascoAI]}
                                notifications={[]}
                                onPlaceOrder={() => {}}
                                onShowToCharacter={() => {}}
                                onSendMessage={() => {}}
                                onTransfer={() => {}}
                                lastUpdate={currentTime}
                                activeCharacterId={PascoAI.id}
                                isTyping={false}
                                customWrapperClass="absolute inset-0 w-full h-full"
                            />
                        </div>
                    </div>
                );
            case 'settings_apps':
                return (
                    <SettingsPage 
                        onSettingsChange={() => {}} 
                        onNavigateToPreview={() => {
                            // No-op or notification since we are already in Preview
                            console.log("Already in Preview Mode");
                        }} 
                    />
                );
            
            /* --- POPUP CARD MODULES --- */
            case 'popup_card':
                return <PopupCardSelector onNavigate={(targetId) => handleSubNavigate(screenId, targetId)} />;
            case 'popup_changelog':
                return <ChangelogModal onClose={() => handleSubNavigate(screenId, null)} onClaim={() => handleSubNavigate(screenId, null)} isPreview={true} />;
            case 'popup_banner':
                return (
                    <div className="w-full h-full flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto relative">
                        <NewCharacterAvailable 
                            character={HiyoriPreview}
                            onSelect={() => {}}
                            onShowDetails={() => {}}
                            className="shadow-2xl max-w-md w-full"
                        />
                         {/* Close Button Style matching Smartphone logic */}
                         <button 
                            onClick={() => handleSubNavigate(screenId, null)} 
                            className="absolute top-6 left-6 z-[100] p-2.5 bg-black/50 hover:bg-white text-white hover:text-black rounded-full transition-all backdrop-blur-md border border-white/10 group shadow-2xl"
                            title="Close"
                        >
                            <X size={20} className="group-hover:rotate-90 transition-transform" />
                        </button>
                    </div>
                );
            case 'popup_disclaimer':
                return (
                    <RealismDisclaimerModal 
                        onAgree={() => handleSubNavigate(screenId, null)} 
                        onCancel={() => handleSubNavigate(screenId, null)} 
                        isPreview={true}
                    />
                );
            
            /* --- SCREEN PROTOCOLS --- */
            case 'maintenance_screen':
                return <MaintenanceUI onUnlock={() => {}} onNavigateToPreview={() => {}} isPreview={true} />;
            case 'update_screen':
                return <UpdateUI onComplete={() => {}} isPreview={true} />;
            case 'countdown_screen':
                return <CountdownUI onUnlock={() => {}} isPreview={true} />;
            case 'pas_screen':
                return <PasScreen onEnterHub={() => {}} onEnterMaintenance={() => {}} onEnterPreview={() => {}} isPreview={true} />;
            default:
                return renderModuleContent();
        }
    };

    if (isBooting) {
        return (
            <div className="fixed inset-0 z-[200] bg-zinc-950 flex flex-col items-center justify-center">
                <div className="w-16 h-16 relative mb-4">
                    <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
                <p className="text-[10px] font-mono text-blue-500 uppercase tracking-[0.3em] animate-pulse">Initializing PasPreview Matrix...</p>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[200] bg-[#050505] flex flex-col font-sans overflow-hidden animate-in fade-in duration-500"
             onMouseMove={(e) => { 
                if(isDraggingFab) handleDragMove(e, 'menu');
                if(isDraggingAnnot) handleDragMove(e, 'annot');
             }}
             onMouseUp={() => {
                if(isDraggingFab) handleDragEnd('menu');
                if(isDraggingAnnot) handleDragEnd('annot');
             }}
             onTouchMove={(e) => {
                if(isDraggingFab) handleDragMove(e, 'menu');
                if(isDraggingAnnot) handleDragMove(e, 'annot');
             }}
             onTouchEnd={() => {
                if(isDraggingFab) handleDragEnd('menu');
                if(isDraggingAnnot) handleDragEnd('annot');
             }}
        >
            
            {/* ANNOTATION OVERLAY (Always Top) */}
            <MobileAnnotation isActive={isAnnotationMode} onClose={() => setIsAnnotationMode(false)} />

            {/* Header Area */}
            <div className="h-16 md:h-20 px-4 md:px-8 border-b border-white/10 bg-black/60 backdrop-blur-3xl flex items-center justify-between shrink-0 z-50 annotation-ui relative">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                             <h1 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase italic flex items-center gap-2">
                                <Cpu size={24} className="text-blue-500 animate-pulse" />
                                PasPreview
                            </h1>
                            {/* SETTINGS TOGGLE */}
                            <div className="relative">
                                <button 
                                    onClick={() => setShowSettings(!showSettings)}
                                    className={`p-1.5 rounded-full hover:bg-white/10 transition-colors ${isDragEnabled ? 'text-amber-400 bg-amber-500/10' : 'text-zinc-500'}`}
                                >
                                    <Settings size={16} />
                                </button>
                                {showSettings && (
                                    <div className="absolute top-full left-0 mt-2 bg-zinc-900 border border-white/10 rounded-xl p-3 shadow-2xl z-[100] w-48 animate-in fade-in zoom-in-95 origin-top-left">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wide flex items-center gap-2">
                                                {isDragEnabled ? <Move size={12} className="text-amber-400"/> : <Settings size={12}/>}
                                                Enable Drag
                                            </span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={isDragEnabled}
                                                    onChange={(e) => {
                                                        setIsDragEnabled(e.target.checked);
                                                    }}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-8 h-4 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-500"></div>
                                            </label>
                                        </div>
                                        <p className="text-[8px] text-zinc-500 mt-2 leading-tight">
                                            Freezes screen interaction to allow infinite canvas mode with multi-window support.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                           <div className="relative flex h-2 w-2">
                             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                             <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500 shadow-[0_0_10px_#3b82f6]"></span>
                           </div>
                           <span className="text-[8px] md:text-[10px] font-mono text-blue-400 font-black uppercase tracking-[0.2em]">
                               {isDragEnabled ? <span className="text-amber-400">CANVAS UNLOCKED</span> : "System Bypass Authorized"}
                           </span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-6">
                    <button onClick={onBack} className="text-[10px] md:text-xs text-zinc-500 hover:text-white uppercase font-bold tracking-widest border border-white/10 px-3 py-1.5 md:px-4 md:py-2 rounded-lg hover:bg-white/5 transition-colors">
                        Exit
                    </button>
                    <div className="hidden md:block h-8 w-px bg-white/10"></div>
                    <div className="hidden md:block text-right">
                        <div className="text-xl font-mono font-black text-white tracking-tighter">
                            {currentTime.toLocaleTimeString('id-ID', { hour12: false })}
                        </div>
                        <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Local Matrix Time</div>
                    </div>
                </div>
            </div>

            {/* Main Content Hub */}
            <div className="flex-1 overflow-hidden relative bg-zinc-950">
                {/* Background Noise - STATIC */}
                <div 
                    className="absolute inset-0 opacity-[0.05] pointer-events-none"
                    style={{ backgroundImage: `url("${BASE64_NOISE}")` }}
                ></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_var(--tw-gradient-stops))] from-blue-900/10 via-zinc-950 to-zinc-950 pointer-events-none"></div>

                {/* --- RENDER MODE SWITCHER --- */}
                {isDragEnabled ? (
                    // DRAG MODE: Infinite Canvas
                    <DragCanvas 
                        screens={screens} 
                        onCloseScreen={removeScreen}
                        onToggleView={toggleScreenView}
                        renderContent={(modId, screenId) => {
                             // Find the screen associated with this render (Not ideal architecture but works for this structure)
                             const screen = screens.find(s => s.id === screenId);
                             return renderContentWithMode(modId, screen?.viewMode || 'mobile', screenId);
                        }}
                    />
                ) : (
                    // STANDARD MODE: Split View
                    <div className="w-full h-full p-4 md:p-8 lg:p-12 flex flex-col lg:flex-row gap-8 relative overflow-hidden">
                         {/* LEFT COLUMN: SELECTION */}
                         <div className={`
                            flex flex-col lg:border-2 lg:border-blue-600/50 lg:rounded-3xl lg:w-1/3 lg:relative lg:overflow-hidden lg:shadow-[0_0_30px_rgba(37,99,235,0.1)]
                            transition-all duration-300 annotation-ui bg-black/90 backdrop-blur-xl lg:bg-blue-950/5 lg:backdrop-blur-sm z-30
                            ${isMobileMenuOpen ? 'fixed inset-0 z-[60] opacity-100 pointer-events-auto' : 'hidden lg:flex lg:opacity-100 lg:pointer-events-auto'}
                         `}>
                            <div className="flex lg:hidden items-center justify-between p-6 border-b border-white/10">
                                <span className="text-xs font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                    <LayoutGrid size={16} /> System Modules
                                </span>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-white/10 rounded-full text-white">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="hidden lg:block absolute top-0 left-0 w-full h-1.5 bg-blue-600 shadow-[0_0_15px_#2563eb]"></div>
                            <div className="p-6 pb-2 hidden lg:block">
                                <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                                    System Modules
                                </h3>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-2 flex flex-col gap-3">
                                {PREVIEW_COLUMNS.map((col, idx) => (
                                    <div key={idx} className="space-y-3">
                                        <div className="flex items-center gap-2 mb-2 px-1 pt-2">
                                            <col.icon size={12} className={col.color} />
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${col.color}`}>{col.title}</span>
                                        </div>
                                        {col.modules.map(mod => {
                                            const isExpanded = expandedModuleId === mod.id;
                                            return (
                                                <div key={mod.id} className="flex flex-col gap-2">
                                                    <button 
                                                        onClick={() => handleModuleClick(mod.id)}
                                                        className={`
                                                            group flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 text-left relative overflow-hidden
                                                            ${isExpanded ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg' : 'bg-zinc-900/40 border-white/5 text-zinc-500 hover:bg-zinc-800/50 hover:border-blue-500/30'}
                                                        `}
                                                    >
                                                        <div className="flex items-center gap-4 relative z-10">
                                                            <mod.icon size={20} className={isExpanded ? 'text-blue-400' : 'text-zinc-600 group-hover:text-zinc-400'} />
                                                            <div>
                                                                <h3 className={`text-xs font-black uppercase tracking-[0.1em] ${isExpanded ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-300'}`}>{mod.label}</h3>
                                                                <p className="text-[9px] text-zinc-600 font-medium tracking-wider mt-0.5 opacity-60">Status: Online</p>
                                                            </div>
                                                        </div>
                                                        <div className="relative z-10 transition-transform duration-300">
                                                            {isExpanded ? <ChevronDown size={16} className="text-blue-500" /> : <ChevronRight size={16} className="text-zinc-800" />}
                                                        </div>
                                                    </button>
                                                    {isExpanded && (
                                                        <div className="ml-4 space-y-2 animate-in slide-in-from-left-2 fade-in">
                                                            {mod.id === 'chat_pasco' && (
                                                                <>
                                                                    <button onClick={() => activatePreview('chat_pasco')} className="w-full text-left p-3 rounded-xl border border-white/5 text-[10px] uppercase font-bold tracking-widest bg-black/20 text-zinc-500 hover:text-white hover:bg-white/5 transition-all">Launch Chat Interface</button>
                                                                    <button onClick={() => activatePreview('smartphone')} className="w-full text-left p-3 rounded-xl border border-white/5 text-[10px] uppercase font-bold tracking-widest bg-black/20 text-zinc-500 hover:text-white hover:bg-white/5 transition-all">Launch Smartphone OS</button>
                                                                </>
                                                            )}
                                                            
                                                            {/* POPUP CARD DIRECT ACTIONS */}
                                                            {mod.id === 'popup_card' && (
                                                                <>
                                                                    <button onClick={() => activatePreview('popup_changelog')} className="w-full text-left p-3 rounded-xl border border-white/5 text-[10px] uppercase font-bold tracking-widest bg-black/20 text-zinc-500 hover:text-white hover:bg-white/5 transition-all">Launch Changelog</button>
                                                                    <button onClick={() => activatePreview('popup_banner')} className="w-full text-left p-3 rounded-xl border border-white/5 text-[10px] uppercase font-bold tracking-widest bg-black/20 text-zinc-500 hover:text-white hover:bg-white/5 transition-all">Launch New Arrival</button>
                                                                    <button onClick={() => activatePreview('popup_disclaimer')} className="w-full text-left p-3 rounded-xl border border-white/5 text-[10px] uppercase font-bold tracking-widest bg-black/20 text-zinc-500 hover:text-white hover:bg-white/5 transition-all">Launch Disclaimer</button>
                                                                </>
                                                            )}

                                                            {mod.id !== 'chat_pasco' && mod.id !== 'popup_card' && (
                                                                <button onClick={() => activatePreview(mod.id)} className="w-full text-left p-3 rounded-xl border border-white/5 text-[10px] uppercase font-bold tracking-widest bg-black/20 text-zinc-500 hover:text-white hover:bg-white/5 transition-all">Initialize {mod.label}</button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>

                         {/* RIGHT COLUMN: PREVIEW */}
                        <div className="w-full h-full lg:h-auto lg:w-2/3 flex flex-col border-2 border-white/20 bg-zinc-900/30 rounded-3xl relative overflow-hidden backdrop-blur-md shadow-[0_0_30px_rgba(255,255,255,0.05)] z-0">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-white shadow-[0_0_15px_white] z-20"></div>
                            <div className="h-full flex flex-col relative">
                                {renderContentWithMode(screens[0]?.moduleId, 'mobile', screens[0]?.id)}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ANNOTATION FLOATING BUTTON */}
            {!isAnnotationMode && (
                <div 
                    className={`fixed z-50 lg:hidden annotation-ui ${isDraggingAnnot ? 'transition-none cursor-grabbing' : 'transition-all duration-500 ease-out cursor-grab'}`}
                    style={{ left: `${annotFabPos.x}px`, top: `${annotFabPos.y}px` }}
                    onMouseDown={(e) => handleDragStart(e, 'annot')}
                    onTouchStart={(e) => handleDragStart(e, 'annot')}
                >
                    <button className="p-4 bg-zinc-800 text-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-90 transition-transform border border-white/10 pointer-events-none">
                        <PenTool size={24} />
                    </button>
                </div>
            )}

            {/* MOBILE FLOATING MENU BUTTON */}
            <div 
                className={`fixed z-[50] annotation-ui ${isDraggingFab ? 'transition-none cursor-grabbing' : 'transition-all duration-500 ease-out cursor-grab'} ${!isDragEnabled ? 'lg:hidden' : ''}`}
                style={{ left: `${fabPos.x}px`, top: `${fabPos.y}px` }}
                onMouseDown={(e) => handleDragStart(e, 'menu')}
                onTouchStart={(e) => handleDragStart(e, 'menu')}
                onClick={() => {
                     // Click logic is handled in handleDragEnd to distinguish drag from click
                }}
            >
                {!isAnnotationMode && (
                    <button
                        className={`p-4 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.5)] active:scale-90 transition-transform pointer-events-none ${isDragEnabled ? 'bg-amber-600' : 'bg-blue-600'} text-white`}
                    >
                       {isDragEnabled ? <Plus size={24} /> : <Menu size={24} />}
                    </button>
                )}
            </div>
            
            {/* SEPARATE MENU FOR DRAG MODE (To allow selecting module to ADD) */}
            {isDragEnabled && isMobileMenuOpen && (
                <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in">
                    <div className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-sm max-h-[80vh] flex flex-col shadow-2xl relative">
                        <div className="p-5 border-b border-white/5 flex justify-between items-center">
                            <h3 className="text-xs font-black uppercase tracking-widest text-white">Add Module</h3>
                            <button onClick={() => setIsMobileMenuOpen(false)}><X size={20} className="text-zinc-500" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                             {PREVIEW_COLUMNS.map(col => col.modules.map(mod => (
                                 <button 
                                    key={mod.id}
                                    onClick={() => activatePreview(mod.id)}
                                    className="w-full flex items-center gap-4 p-4 bg-black/40 hover:bg-white/5 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all text-left group"
                                 >
                                     <div className={`p-2 rounded-lg ${mod.color.replace('text-', 'bg-').replace('400', '500/20')} ${mod.color}`}>
                                         <mod.icon size={20} />
                                     </div>
                                     <div>
                                         <span className="text-xs font-bold text-zinc-200 block group-hover:text-white">{mod.label}</span>
                                         <span className="text-[9px] text-zinc-500">{mod.desc}</span>
                                     </div>
                                 </button>
                             )))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
