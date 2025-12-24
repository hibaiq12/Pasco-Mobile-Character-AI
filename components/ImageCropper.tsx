import React, { useState, useRef } from 'react';
import { Check, ZoomIn, ZoomOut, RotateCcw, RotateCw, Undo2, SlidersHorizontal, Move } from 'lucide-react';

interface ImageCropperProps {
  imageSrc: string;
  onCancel: () => void;
  onCrop: (croppedBase64: string) => void;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onCancel, onCrop }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const imageRef = useRef<HTMLImageElement>(null);

  // Constants
  const CROP_SIZE = 280; // Size of the visual crop box in px

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setDragStart({ x: clientX - offset.x, y: clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault(); 
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    setOffset({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
  };

  const handleCrop = () => {
    if (!imageRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high resolution output
    const outputSize = 500;
    canvas.width = outputSize;
    canvas.height = outputSize;

    const image = imageRef.current;
    
    // 1. Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, outputSize, outputSize);

    // 2. Transform Logic
    // We move to center of canvas
    ctx.translate(outputSize / 2, outputSize / 2);
    
    // Apply Offset (Scaled)
    const scaleFactor = outputSize / CROP_SIZE;
    ctx.translate(offset.x * scaleFactor, offset.y * scaleFactor);

    // Apply Zoom
    ctx.scale(zoom, zoom);

    // Apply Rotation (Convert degrees to radians)
    ctx.rotate((rotation * Math.PI) / 180);
    
    // Draw image centered
    const aspectRatio = image.naturalWidth / image.naturalHeight;
    let drawWidth, drawHeight;
    
    if (aspectRatio > 1) {
        drawHeight = outputSize;
        drawWidth = outputSize * aspectRatio;
    } else {
        drawWidth = outputSize;
        drawHeight = outputSize / aspectRatio;
    }

    ctx.drawImage(
        image, 
        -drawWidth / 2, 
        -drawHeight / 2, 
        drawWidth, 
        drawHeight
    );

    onCrop(canvas.toDataURL('image/jpeg', 0.9));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-fade-in select-none">
      
       {/* Visual Area */}
       <div className="flex-1 w-full flex flex-col items-center justify-center relative min-h-[300px]">
            <div 
                className="relative overflow-hidden rounded-full shadow-[0_0_0_9999px_rgba(0,0,0,0.85)] z-20 cursor-move border-2 border-white/20"
                style={{ width: CROP_SIZE, height: CROP_SIZE }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleMouseDown}
                onTouchMove={handleMouseMove}
                onTouchEnd={handleMouseUp}
            >
                {/* Rule of Thirds Grid */}
                <div className="absolute inset-0 z-30 pointer-events-none opacity-20">
                     <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                         <div className="border-r border-b border-white"></div>
                         <div className="border-r border-b border-white"></div>
                         <div className="border-b border-white"></div>
                         <div className="border-r border-b border-white"></div>
                         <div className="border-r border-b border-white"></div>
                         <div className="border-b border-white"></div>
                         <div className="border-r border-white"></div>
                         <div className="border-r border-white"></div>
                         <div></div>
                     </div>
                </div>

                <div 
                    className="w-full h-full flex items-center justify-center pointer-events-none"
                    style={{ 
                        transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                        transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                    }}
                >
                     <img 
                        ref={imageRef}
                        src={imageSrc} 
                        alt="Crop target" 
                        className="max-w-none max-h-none"
                        style={{ height: '100%', width: 'auto', objectFit: 'cover' }}
                        draggable={false}
                     />
                </div>
            </div>
            
            <div className="absolute bottom-4 text-zinc-500 text-xs font-medium flex items-center gap-2 z-30 animate-pulse">
                <Move size={12} /> Drag to Reposition
            </div>
       </div>

       {/* Floating Control Panel */}
       <div className="w-full max-w-sm bg-zinc-900/90 border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-2xl relative z-40 mb-4 sm:mb-8">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center gap-2 text-white font-bold text-sm tracking-wide">
                     <SlidersHorizontal size={16} className="text-violet-400"/>
                     ADJUST AVATAR
                 </div>
                 <button 
                    onClick={handleReset}
                    className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1.5 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full transition-all active:scale-95"
                 >
                     <Undo2 size={12} /> Reset
                 </button>
            </div>

            <div className="space-y-6">
                {/* Zoom Slider */}
                <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                        <span>Scale</span>
                        <span className="text-zinc-300">{(zoom * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <ZoomOut size={16} className="text-zinc-600" />
                        <input 
                            type="range" min="1" max="3" step="0.05" value={zoom}
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            className="flex-1 h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-violet-600 hover:accent-violet-500"
                        />
                        <ZoomIn size={16} className="text-zinc-600" />
                    </div>
                </div>

                {/* Rotation Slider */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                        <span>Rotation</span>
                        {/* Larger Font for Readability */}
                        <span className="text-zinc-200 font-mono text-xs bg-zinc-800 px-2 py-1 rounded-md border border-white/5 min-w-[3rem] text-center">
                            {rotation}°
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <RotateCcw size={16} className="text-zinc-600" />
                        <input 
                            type="range" min="-180" max="180" step="10" value={rotation}
                            onChange={(e) => setRotation(parseInt(e.target.value))}
                            className="flex-1 h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-violet-600 hover:accent-violet-500"
                        />
                        <RotateCw size={16} className="text-zinc-600" />
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-8">
                <button 
                    onClick={onCancel}
                    className="flex-1 py-3.5 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-300 font-bold text-xs rounded-xl transition-all uppercase tracking-wider"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleCrop}
                    className="flex-1 py-3.5 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all flex items-center justify-center gap-2 uppercase tracking-wider transform hover:-translate-y-0.5 active:translate-y-0"
                >
                    <Check size={16} /> Confirm
                </button>
            </div>
       </div>
    </div>
  );
};