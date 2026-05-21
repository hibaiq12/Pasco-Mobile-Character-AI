
import React, { useState, useRef } from 'react';
import { Header } from './Header';
import { NewArrivals } from './NewArrivals';
import { RosterExpansion } from './RosterExpansion';
import { FeatureUpdates } from './FeatureUpdates';
import { AiRealism } from './AiRealism';
import { ActionFooter } from './ActionFooter';

interface ChangelogModalProps {
  onClose: () => void;
  onClaim: () => void;
  isPreview?: boolean; // Added support for Preview Mode
}

export const ChangelogModal: React.FC<ChangelogModalProps> = ({ onClose, onClaim, isPreview = false }) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
      if (contentRef.current) {
          const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
          // Deteksi jika user sudah scroll mendekati bawah (toleransi 20px)
          if (scrollTop + clientHeight >= scrollHeight - 20) {
              setHasScrolledToBottom(true);
          }
      }
  };

  return (
    <div className={`${isPreview ? 'absolute inset-0 z-10' : 'fixed inset-0 z-[100]'} bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in`}>
      {/* 
         MODIFIKASI: 
         - Ubah max-h-[85vh] menjadi h-[92vh] agar lebih panjang mengisi layar.
         - Tambahkan flex flex-col agar footer tetap di bawah tapi konten fill space.
      */}
      <div className={`bg-zinc-950 border border-violet-500/30 w-full rounded-3xl shadow-[0_0_50px_rgba(124,58,237,0.15)] relative overflow-hidden flex flex-col ${isPreview ? 'h-full border-none rounded-none' : 'max-w-2xl h-[92vh]'}`}>
        
        {/* Header Background */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-900/40 to-transparent pointer-events-none" />

        {/* Content Area dengan Scroll Listener */}
        <div 
            ref={contentRef}
            onScroll={handleScroll}
            className="p-8 relative z-10 flex-1 overflow-y-auto custom-scrollbar"
        >
          <Header />

          <div className="space-y-8">
            <NewArrivals />
            <RosterExpansion />
            <FeatureUpdates />
            <AiRealism />
          </div>
        </div>

        {/* Footer dengan prop forceUnlock */}
        <ActionFooter onClaim={onClaim} forceUnlock={hasScrolledToBottom || isPreview} />

      </div>
    </div>
  );
};

export default ChangelogModal;
