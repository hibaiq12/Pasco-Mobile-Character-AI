
import React, { useState, useRef, useEffect } from 'react';
import { X, Copy, Check, Download, Type, Undo2, Redo2, MousePointer2, Square, ArrowUpRight, Eraser, Palette, Minimize2, Maximize2, Move, StickyNote } from 'lucide-react';
import html2canvas from 'html2canvas';

interface MobileAnnotationProps {
    isActive: boolean;
    onClose: () => void;
}

type ToolType = 'free' | 'rect' | 'arrow' | 'eraser';

export const MobileAnnotation: React.FC<MobileAnnotationProps> = ({ isActive, onClose }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#ef4444');
    const [lineWidth] = useState(3);
    const [tool, setTool] = useState<ToolType>('free');
    
    // Notes & System
    const [notes, setNotes] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');

    // History & Shape Preview States
    const [history, setHistory] = useState<ImageData[]>([]);
    const [historyStep, setHistoryStep] = useState(-1);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [snapshot, setSnapshot] = useState<ImageData | null>(null);

    // -- DRAGGABLE TOOLBAR STATE --
    const [isMinimized, setIsMinimized] = useState(false);
    const [toolbarPos, setToolbarPos] = useState({ x: 20, y: 20 });
    const isDragging = useRef(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    // -- DRAGGABLE BOTTOM PANEL STATE --
    const [isNotesMinimized, setIsNotesMinimized] = useState(false);
    const [panelPos, setPanelPos] = useState({ x: 20, y: 0 }); // Y will be set in useEffect
    const isDraggingPanel = useRef(false);
    const dragPanelOffset = useRef({ x: 0, y: 0 });

    // Initialize Canvas
    useEffect(() => {
        if (isActive && canvasRef.current) {
            const canvas = canvasRef.current;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                // Save initial blank state
                const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
                setHistory([data]);
                setHistoryStep(0);
                
                // Center toolbar initially
                setToolbarPos({ x: window.innerWidth / 2 - 160, y: 40 });
                // Center bottom panel initially
                setPanelPos({ x: window.innerWidth / 2 - 160, y: window.innerHeight - 200 });
            }
        }
    }, [isActive]);

    // Update Context Style
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx) {
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.lineWidth = tool === 'eraser' ? 20 : lineWidth;
            ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
        }
    }, [color, lineWidth, tool]);

    // --- DRAG LOGIC (Generic) ---
    const handleDragStart = (e: React.TouchEvent | React.MouseEvent, type: 'toolbar' | 'panel') => {
        e.stopPropagation(); // Prevent drawing on canvas
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        if (type === 'toolbar') {
            isDragging.current = true;
            dragOffset.current = { x: clientX - toolbarPos.x, y: clientY - toolbarPos.y };
        } else {
            isDraggingPanel.current = true;
            dragPanelOffset.current = { x: clientX - panelPos.x, y: clientY - panelPos.y };
        }
    };

    const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        if (isDragging.current) {
            e.preventDefault();
            setToolbarPos({
                x: clientX - dragOffset.current.x,
                y: clientY - dragOffset.current.y
            });
        }
        if (isDraggingPanel.current) {
            e.preventDefault();
            setPanelPos({
                x: clientX - dragPanelOffset.current.x,
                y: clientY - dragPanelOffset.current.y
            });
        }
    };

    const handleDragEnd = () => {
        isDragging.current = false;
        isDraggingPanel.current = false;
    };

    // --- HISTORY MANAGER ---
    const saveHistory = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const newHistory = history.slice(0, historyStep + 1);
            newHistory.push(data);
            setHistory(newHistory);
            setHistoryStep(newHistory.length - 1);
        }
    };

    const handleUndo = () => {
        if (historyStep > 0) {
            const newStep = historyStep - 1;
            restoreHistory(newStep);
            setHistoryStep(newStep);
        }
    };

    const handleRedo = () => {
        if (historyStep < history.length - 1) {
            const newStep = historyStep + 1;
            restoreHistory(newStep);
            setHistoryStep(newStep);
        }
    };

    const restoreHistory = (index: number) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx && history[index]) {
            ctx.putImageData(history[index], 0, 0);
        }
    };

    // --- SHAPE DRAWING HELPERS ---
    const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number) => {
        const headlen = 15; // length of head in pixels
        const dx = toX - fromX;
        const dy = toY - fromY;
        const angle = Math.atan2(dy, dx);

        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();

        // Arrow Head
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
        ctx.lineTo(toX, toY);
        ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
        ctx.fill(); // Filled arrowhead
    };

    const drawRect = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number) => {
        ctx.beginPath();
        ctx.rect(fromX, fromY, toX - fromX, toY - fromY);
        ctx.stroke();
    };

    // --- INPUT HANDLERS ---
    const startDrawing = (e: React.TouchEvent | React.MouseEvent) => {
        // Ignore if clicking on UI
        if ((e.target as HTMLElement).closest('.annotation-ui')) return;

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        setIsDrawing(true);
        setStartPos({ x: clientX, y: clientY });

        if (tool === 'rect' || tool === 'arrow') {
            setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));
        } else {
            ctx.beginPath();
            ctx.moveTo(clientX, clientY);
        }
    };

    const draw = (e: React.TouchEvent | React.MouseEvent) => {
        // Also handle global drag moves for UI here if needed, but separate listeners on window are safer
        // Integrating UI drag here just in case mouse leaves element
        if (isDragging.current || isDraggingPanel.current) {
            handleDragMove(e);
            return;
        }

        if (!isDrawing || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        if (tool === 'free' || tool === 'eraser') {
            ctx.lineTo(clientX, clientY);
            ctx.stroke();
        } else if (snapshot) {
            ctx.putImageData(snapshot, 0, 0);
            if (tool === 'rect') {
                drawRect(ctx, startPos.x, startPos.y, clientX, clientY);
            } else if (tool === 'arrow') {
                drawArrow(ctx, startPos.x, startPos.y, clientX, clientY);
            }
        }
    };

    const stopDrawing = () => {
        // Stop UI dragging
        if (isDragging.current || isDraggingPanel.current) {
            handleDragEnd();
            return;
        }

        if (!isDrawing) return;
        setIsDrawing(false);
        setSnapshot(null);
        const ctx = canvasRef.current?.getContext('2d');
        ctx?.closePath();
        saveHistory();
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const handleCopyImage = async () => {
        setIsProcessing(true);
        setStatusMsg('Menyalin...');
        try {
            const canvas = await html2canvas(document.body, {
                useCORS: true,
                allowTaint: true,
                backgroundColor: null,
                ignoreElements: (element) => {
                    return element.classList.contains('annotation-ui');
                }
            });

            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));

            if (blob) {
                try {
                    // Try to regain focus before writing (Critical for Clipboard API)
                    window.focus();
                    const item = new ClipboardItem({ 'image/png': blob });
                    await navigator.clipboard.write([item]);
                    setStatusMsg('Gambar Disalin!');
                } catch (err) {
                    console.warn("Clipboard Write Failed:", err);
                    setStatusMsg('Gagal Menyalin (Izin Ditolak)');
                }
            } else {
                setStatusMsg('Gagal render gambar');
            }

        } catch (e) {
            console.error(e);
            setStatusMsg('Capture Error');
        } finally {
            setTimeout(() => {
                setIsProcessing(false);
                setStatusMsg('');
            }, 2500);
        }
    };

    const handleCopyText = async () => {
        if (!notes.trim()) return;
        try {
            await navigator.clipboard.writeText(notes);
            setStatusMsg('Catatan Disalin!');
        } catch {
            setStatusMsg('Gagal Menyalin Teks');
        }
        setTimeout(() => setStatusMsg(''), 2000);
    };

    if (!isActive) return null;

    return (
        <div 
            className="fixed inset-0 z-[999] pointer-events-auto touch-none select-none"
            onTouchMove={draw}
            onMouseMove={draw}
            onTouchEnd={stopDrawing}
            onMouseUp={stopDrawing}
        >
            {/* 1. Canvas Layer */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 z-10 cursor-crosshair"
                onTouchStart={startDrawing}
                onMouseDown={startDrawing}
            />

            {/* 2. Draggable Toolbar */}
            <div 
                className="fixed z-50 annotation-ui transition-all duration-300 ease-out"
                style={{ 
                    left: `${toolbarPos.x}px`, 
                    top: `${toolbarPos.y}px`,
                    width: isMinimized ? 'auto' : '320px',
                    touchAction: 'none' // Prevent scroll
                }}
            >
                <div className={`
                    bg-black/90 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden
                    ${isMinimized ? 'rounded-full p-2' : 'rounded-3xl p-3 flex flex-col gap-3'}
                `}>
                    {/* Drag Handle & Header */}
                    <div 
                        className={`flex items-center justify-between ${isMinimized ? '' : 'mb-1 border-b border-white/10 pb-2'}`}
                        onMouseDown={(e) => handleDragStart(e, 'toolbar')}
                        onTouchStart={(e) => handleDragStart(e, 'toolbar')}
                    >
                        {/* Drag Handle */}
                        <div className="cursor-move p-1 text-zinc-500 hover:text-white">
                             <Move size={16} />
                        </div>

                        {!isMinimized && <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Tools</span>}

                        {/* Minimize/Maximize Toggle */}
                        <button 
                            onClick={() => setIsMinimized(!isMinimized)}
                            className="p-1 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                        >
                            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                        </button>
                    </div>

                    {!isMinimized && (
                        <>
                            {/* Tools Row */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                    <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white/20 mr-2 group">
                                        <input 
                                            type="color" 
                                            value={color}
                                            onChange={(e) => { setColor(e.target.value); setTool('free'); }} 
                                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 border-0 cursor-pointer"
                                        />
                                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                            <Palette size={14} className="text-white mix-blend-difference opacity-50" />
                                        </div>
                                    </div>
                                    <div className="h-6 w-px bg-white/10 mx-1"></div>
                                    <button onClick={() => setTool('free')} className={`p-2 rounded-lg ${tool === 'free' ? 'bg-blue-600 text-white' : 'text-zinc-400'}`}><MousePointer2 size={16} /></button>
                                    <button onClick={() => setTool('rect')} className={`p-2 rounded-lg ${tool === 'rect' ? 'bg-blue-600 text-white' : 'text-zinc-400'}`}><Square size={16} /></button>
                                    <button onClick={() => setTool('arrow')} className={`p-2 rounded-lg ${tool === 'arrow' ? 'bg-blue-600 text-white' : 'text-zinc-400'}`}><ArrowUpRight size={16} /></button>
                                    <button onClick={() => setTool('eraser')} className={`p-2 rounded-lg ${tool === 'eraser' ? 'bg-red-500/20 text-red-400' : 'text-zinc-400'}`}><Eraser size={16} /></button>
                                </div>
                            </div>

                            {/* Actions Row */}
                            <div className="flex items-center justify-between pt-2 border-t border-white/10">
                                <div className="flex gap-1">
                                    <button onClick={handleUndo} disabled={historyStep <= 0} className="p-2 text-zinc-400 hover:text-white disabled:opacity-30"><Undo2 size={16} /></button>
                                    <button onClick={handleRedo} disabled={historyStep >= history.length - 1} className="p-2 text-zinc-400 hover:text-white disabled:opacity-30"><Redo2 size={16} /></button>
                                </div>
                                <div className="flex gap-2">
                                     <button onClick={clearCanvas} className="px-2 py-1 text-[9px] bg-red-900/30 text-red-400 rounded hover:bg-red-900/50">Clear</button>
                                     <button onClick={onClose} className="p-1.5 bg-zinc-800 text-white rounded-full hover:bg-zinc-700"><X size={14} /></button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* 3. Status Toast */}
            {statusMsg && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] bg-black/90 text-white text-xs px-4 py-2 rounded-full border border-green-500/30 flex items-center gap-2 animate-in fade-in zoom-in annotation-ui shadow-2xl pointer-events-none">
                    <Check size={12} className="text-green-500" /> {statusMsg}
                </div>
            )}

            {/* 4. Draggable Bottom Panel (Notes) */}
            <div 
                className="fixed z-40 annotation-ui transition-all duration-300 ease-out"
                style={{ 
                    left: `${panelPos.x}px`, 
                    top: `${panelPos.y}px`,
                    width: isNotesMinimized ? 'auto' : '320px',
                    touchAction: 'none'
                }}
            >
                <div className={`
                    bg-black/90 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col
                    ${isNotesMinimized ? 'rounded-full p-2' : 'rounded-3xl p-4 gap-3'}
                `}>
                    {/* Panel Header (Drag & Minimize) */}
                    <div 
                        className={`flex items-center justify-between ${isNotesMinimized ? '' : 'mb-1 border-b border-white/10 pb-2'}`}
                        onMouseDown={(e) => handleDragStart(e, 'panel')}
                        onTouchStart={(e) => handleDragStart(e, 'panel')}
                    >
                         {/* Drag Handle */}
                        <div className="cursor-move p-1 text-zinc-500 hover:text-white">
                             <Move size={16} />
                        </div>

                         {!isNotesMinimized && <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Notes</span>}

                        {/* Minimize/Maximize Toggle */}
                        <button 
                            onClick={() => setIsNotesMinimized(!isNotesMinimized)}
                            className="p-1 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                        >
                            {isNotesMinimized ? <StickyNote size={16} /> : <Minimize2 size={16} />}
                        </button>
                    </div>

                    {!isNotesMinimized && (
                        <>
                            <div className="relative">
                                <Type size={14} className="absolute left-3 top-3 text-zinc-500" />
                                <textarea 
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Tulis catatan QA disini..."
                                    className="w-full bg-zinc-900/50 border border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-blue-500/50 h-16 resize-none font-mono"
                                />
                            </div>
                            
                            <div className="flex gap-2">
                                <button 
                                    onClick={handleCopyText}
                                    disabled={!notes}
                                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95"
                                >
                                    <Copy size={14} /> Teks
                                </button>
                                <button 
                                    onClick={handleCopyImage}
                                    disabled={isProcessing}
                                    className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95 transition-transform"
                                >
                                    {isProcessing ? <Download size={14} className="animate-spin" /> : <Copy size={14} />}
                                    {isProcessing ? '...' : 'Salin Gbr'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
