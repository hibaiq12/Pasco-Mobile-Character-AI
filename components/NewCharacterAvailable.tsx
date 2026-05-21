
import React from 'react';
import { Sparkles, ArrowRight, Flame, BookOpen, Flower } from 'lucide-react';
import { Character } from '../types';
import { t } from '../services/translationService';

interface NewCharacterAvailableProps {
  character: Character;
  onSelect: (id: string) => void; // Starts Chat
  onShowDetails: (id: string) => void; // Opens Book
  className?: string; // Added for external styling
  style?: React.CSSProperties; // Added for transitions
}

export const NewCharacterAvailable: React.FC<NewCharacterAvailableProps> = ({ character, onSelect, onShowDetails, className = "", style }) => {
  const isHikaru = character.id === 'realism-hikaru';
  
  // Theme Configuration
  const theme = isHikaru ? {
      borderColor: 'border-yellow-500/30',
      shadow: 'shadow-[0_20px_50px_-10px_rgba(234,179,8,0.15)]',
      badgeText: 'text-yellow-300',
      badgeBorder: 'border-yellow-500/30',
      badgeBg: 'bg-yellow-950/30',
      icon: <Flower size={10} className="text-yellow-400 fill-yellow-400/20" />,
      btnGradient: 'from-white to-yellow-500 hover:to-yellow-400',
      btnText: 'text-yellow-950',
      bgHover: 'group-hover:border-yellow-500/50'
  } : {
      borderColor: 'border-cyan-900/30',
      shadow: 'shadow-[0_20px_50px_-10px_rgba(34,211,238,0.15)]',
      badgeText: 'text-cyan-300',
      badgeBorder: 'border-cyan-500/30',
      badgeBg: 'bg-cyan-950/30',
      icon: <Sparkles size={10} />,
      btnGradient: 'from-white to-blue-600 hover:to-blue-500',
      btnText: 'text-blue-950',
      bgHover: 'group-hover:border-cyan-500/50'
  };

  const handleChatClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent card click bubble
      onSelect(character.id);
  };

  return (
    <div 
        onClick={() => onShowDetails(character.id)}
        style={style}
        className={`relative w-full h-64 md:h-80 rounded-[2rem] overflow-hidden group cursor-pointer border select-none animate-fade-in transition-all duration-300 ${theme.borderColor} ${theme.shadow} ${theme.bgHover} ${className}`}
    >
        {/* Background Image */}
        <img 
            src={character.avatar} 
            className="absolute inset-0 w-full h-full object-cover object-[75%_20%] transition-transform duration-1000 group-hover:scale-105"
            alt={character.name}
            draggable={false}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-12 max-w-2xl z-10">
            <div className="flex items-center gap-3 mb-3 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                {/* Glowing White Text for New Arrival */}
                <span className="text-white text-[10px] font-black px-2 py-0.5 rounded border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.5)] drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] uppercase tracking-widest bg-white/10 backdrop-blur-md">
                    {t('banner.new_arrival')}
                </span>
                
                <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-md uppercase tracking-wider border ${theme.badgeText} ${theme.badgeBorder} ${theme.badgeBg}`}>
                    {theme.icon} {t('banner.realism')}
                </span>

                {/* 18+ Tag */}
                <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 border border-red-500/30 px-2 py-0.5 rounded bg-red-950/30 backdrop-blur-md uppercase tracking-wider shadow-[0_0_10px_rgba(248,113,113,0.2)]">
                    <Flame size={10} fill="currentColor" /> 18+
                </span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black text-white mb-3 tracking-tighter drop-shadow-xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                {character.name}
            </h2>
            
            <p className="text-zinc-300 text-sm md:text-base font-medium leading-relaxed max-w-md mb-8 line-clamp-2 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                "{character.description}"
            </p>
            
            <div className="flex gap-4 items-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                {/* Button: Dynamic Gradient */}
                <button 
                    onClick={handleChatClick}
                    className={`py-3 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 flex items-center gap-2 bg-gradient-to-r hover:from-zinc-100 ${theme.btnGradient}`}
                >
                    <span className={`font-black uppercase tracking-wide text-xs ${theme.btnText}`}>
                        {t('banner.chat_now')}
                    </span>
                    <ArrowRight size={16} className={theme.btnText} />
                </button>

                {/* Story Mode Tag */}
                <div className="relative group/tag cursor-help">
                    <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-yellow-500/50 bg-yellow-500/10 backdrop-blur-md shadow-[0_0_15px_rgba(234,179,8,0.4)] hover:shadow-[0_0_25px_rgba(234,179,8,0.6)] transition-all">
                        <BookOpen size={14} className="text-yellow-400" />
                        <span className="text-[10px] font-bold text-yellow-300 uppercase tracking-widest drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]">
                            {t('banner.story_mode')}
                        </span>
                    </div>
                    {/* NEW MODE Badge */}
                    <div className="absolute -top-3 -right-2 bg-gradient-to-r from-red-600 to-orange-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-lg border border-red-400 animate-pulse">
                        {t('banner.new_mode')}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
