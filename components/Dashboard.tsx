
import React, { memo, useState, useMemo, useEffect } from 'react';
import { Character, ChatSession } from '../types';
import { Plus, Search, Ghost, Settings, Flame, Zap, Clock, MoreHorizontal, Sparkles, ArrowRight, Brain } from 'lucide-react';
import { t } from '../services/translationService';
import { NewCharacterAvailable } from './NewCharacterAvailable';
import { CharacterBook } from './CharacterBook';

interface DashboardProps {
  characters: Character[];
  sessions: Record<string, ChatSession>;
  onCreateClick: () => void;
  onSelectCharacter: (id: string) => void;
  onEditCharacter: (id: string) => void;
  onScroll?: (metrics: { scrollTop: number; clientHeight: number; scrollHeight: number }) => void;
  onBookStateChange?: (isOpen: boolean) => void; // New Prop
}

interface CharacterCardProps {
  char: Character;
  featured?: boolean;
  session?: ChatSession;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
}

// Memoized Card for Performance
const CharacterCard: React.FC<CharacterCardProps> = memo(({ 
  char, 
  session,
  onSelect,
  onEdit
}) => {
   
   // --- LOGIC FOR NSFW / UNCENSORED DETECTION ---
   const nsfwKeywords = ['seductive', 'intimate', 'erotic', 'lust', 'nsfw', '18+', 'sexual', 'obsessive', 'yandere', 'dominant', 'submissive'];
   
   const checkTrait = (text?: string) => {
       if (!text) return false;
       return nsfwKeywords.some(k => text.toLowerCase().includes(k));
   };

   const isNsfw = checkTrait(char.systemInstruction) || 
                  checkTrait(char.description) ||
                  checkTrait(char.socialProfile?.interactionStyle) ||
                  checkTrait(char.duality?.core);

   // --- REALISM DETECTION (Hardcoded for Hiyori or future Realism folder logic) ---
   const isRealism = char.id === 'char-hiyori';

   // --- LOCALIZATION FOR BUILT-IN CHARACTERS ---
   const descKey = `char.${char.id.replace('char-', '')}.desc`;
   const translatedDesc = t(descKey);
   const displayDesc = translatedDesc !== descKey ? translatedDesc : char.description;

   return (
      <div 
          onClick={() => onSelect(char.id)}
          className="group relative overflow-hidden cursor-pointer rounded-2xl md:rounded-[2rem] bg-zinc-900 border border-white/5 shadow-md active:scale-[0.98] transition-all duration-300 hover:shadow-violet-500/20 hover:border-violet-500/30 aspect-[4/5] md:aspect-[3/4]"
      >
          {/* Optimized Image Loading */}
          <img 
              src={char.avatar} 
              alt={char.name} 
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100"
          />

          {/* Cinematic Gradient Overlay (Lighter computation than blur) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-80 md:opacity-60 md:group-hover:opacity-80 transition-opacity duration-300" />
          
          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-20">
              <div className="backdrop-blur-md bg-black/30 border border-white/10 px-2.5 py-1 rounded-full text-[9px] font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                  <span className={`w-1.5 h-1.5 rounded-full ${session ? 'bg-emerald-400 shadow-[0_0_5px_#34d399]' : 'bg-zinc-500'}`}></span>
                  {char.role.split(' ')[0]}
              </div>

              {/* Edit Button - Optimized Touch Target */}
              <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onEdit(char.id);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-zinc-300 hover:bg-violet-600 hover:text-white hover:border-violet-500 transition-colors"
              >
                  <Settings size={14} />
              </button>
          </div>

          {/* Content Overlay */}
          <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-end z-10">
              <div className="transform transition-transform duration-300 md:translate-y-2 md:group-hover:translate-y-0">
                  
                  {/* Meta Data Row (Tags) */}
                  <div className="flex items-center gap-2 mb-2 opacity-90 flex-wrap">
                      {isNsfw && (
                          <span className="flex items-center gap-1 text-[9px] font-bold text-red-400 bg-red-900/20 px-1.5 py-0.5 rounded border border-red-500/20">
                              <Flame size={8} fill="currentColor" /> 18+
                          </span>
                      )}
                      
                      {/* Realism Brain Tag - GOLDEN GLOW */}
                      {isRealism && (
                          <span className="flex items-center gap-1 text-[9px] font-bold text-yellow-400 bg-yellow-900/20 px-1.5 py-0.5 rounded border border-yellow-500/40 shadow-[0_0_8px_rgba(250,204,21,0.3)] backdrop-blur-sm">
                              <Brain size={10} className="text-yellow-400 fill-yellow-400/20 animate-pulse" /> Realism
                          </span>
                      )}
                  </div>

                  {/* Name */}
                  <h3 className="text-lg md:text-2xl font-black text-white mb-1 tracking-tight leading-none drop-shadow-md truncate pr-2">
                      {char.name}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-zinc-400 text-[10px] md:text-xs font-medium line-clamp-2 leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity">
                      {displayDesc}
                  </p>
                  
                  {/* Interactive Indicator (Desktop) */}
                  <div className="hidden md:block w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-violet-500 to-transparent mt-3 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-75"></div>
              </div>
          </div>
      </div>
   );
});

export const Dashboard: React.FC<DashboardProps> = ({ 
  characters, 
  sessions,
  onCreateClick, 
  onSelectCharacter,
  onEditCharacter,
  onScroll,
  onBookStateChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCharacterBook, setShowCharacterBook] = useState(false);

  // Sync state with parent to hide sidebar
  useEffect(() => {
      onBookStateChange?.(showCharacterBook);
  }, [showCharacterBook, onBookStateChange]);

  // --- DYNAMIC SEARCH & SORT ---
  const filteredChars = useMemo(() => {
      const query = searchQuery.toLowerCase();
      
      const matched = characters.filter(c => 
          c.name.toLowerCase().includes(query) || 
          c.role.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query)
      );

      // Sort by recent activity
      return matched.sort((a, b) => {
          const sessionA = sessions[a.id]?.lastUpdated || 0;
          const sessionB = sessions[b.id]?.lastUpdated || 0;
          return sessionB - sessionA;
      });
  }, [characters, sessions, searchQuery]);

  // --- FIND FEATURED CHARACTER (HIYORI) ---
  const featuredId = 'char-hiyori';
  const featuredChar = characters.find(c => c.id === featuredId);

  return (
    <div 
        onScroll={(e) => onScroll?.({
            scrollTop: e.currentTarget.scrollTop,
            clientHeight: e.currentTarget.clientHeight,
            scrollHeight: e.currentTarget.scrollHeight
        })}
        className="h-full w-full overflow-y-auto bg-zinc-950 relative custom-scrollbar selection:bg-violet-500/30"
    >
      
      {/* Optimized Background */}
      <div className="fixed inset-0 pointer-events-none bg-zinc-950">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-violet-900/10 via-zinc-950/0 to-zinc-950/0" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-900/10 via-zinc-950/0 to-zinc-950/0" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015] mix-blend-overlay"></div>
      </div>

      {/* --- CHARACTER BOOK MODAL --- */}
      {/* This renders full screen on mobile (bg-black), hiding the App Footer */}
      {showCharacterBook && featuredChar && (
          <CharacterBook 
              character={featuredChar} 
              onClose={() => setShowCharacterBook(false)}
              onStartChat={() => {
                  setShowCharacterBook(false);
                  onSelectCharacter(featuredChar.id);
              }}
          />
      )}

      <div className="relative z-10 max-w-[1600px] mx-auto pb-32 md:pb-10 min-h-full flex flex-col">
        
        {/* === HEADER SECTION === */}
        <header className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 px-4 py-3 md:px-10 md:py-6 md:static md:bg-transparent md:border-none md:backdrop-filter-none transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8">
                
                {/* Title Row */}
                <div className="flex items-center justify-between w-full md:w-auto">
                    <div>
                        <h1 className="text-2xl md:text-5xl font-black text-white tracking-tighter flex items-center gap-2">
                            Pasco
                            <span className="flex h-1.5 w-1.5 md:h-2 md:w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-violet-500"></span>
                            </span>
                        </h1>
                        <p className="text-[10px] md:text-sm text-zinc-500 font-medium tracking-[0.2em] uppercase hidden md:block mt-1">
                           Neural Synchronicity Hub
                        </p>
                    </div>
                    
                    {/* Mobile Create Button */}
                    <button 
                        onClick={onCreateClick}
                        className="md:hidden w-9 h-9 bg-violet-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-violet-500/20 active:scale-90 transition-transform"
                    >
                        <Plus size={18} />
                    </button>
                </div>
                
                {/* Search Bar (Functional) */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-72 group">
                        <div className="relative flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 md:py-3 transition-all group-focus-within:bg-zinc-900 group-focus-within:border-violet-500/50 group-focus-within:ring-1 group-focus-within:ring-violet-500/20">
                            <Search className="text-zinc-500 group-focus-within:text-violet-400 transition-colors mr-2.5" size={16} />
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('dash.search')}
                                className="w-full bg-transparent text-sm text-zinc-200 placeholder-zinc-600 outline-none font-medium"
                            />
                        </div>
                    </div>
                    
                    {/* Desktop Create Button */}
                    <button 
                        onClick={onCreateClick}
                        className="hidden md:flex h-[46px] w-[46px] bg-violet-600 hover:bg-violet-500 text-white rounded-xl items-center justify-center shadow-lg shadow-violet-500/20 hover:scale-105 active:scale-95 transition-all"
                        title="Forge New Soul"
                    >
                        <Plus size={24} />
                    </button>
                </div>
            </div>
        </header>

        {/* === CONTENT === */}
        <div className="px-4 md:px-10 mt-4 md:mt-2 animate-fade-in-up flex-1">
            {characters.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-[60vh] border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.02]">
                    <div className="h-16 w-16 bg-zinc-900 rounded-2xl rotate-3 flex items-center justify-center mb-6 text-zinc-700 shadow-xl border border-white/5">
                        <Ghost size={32} />
                    </div>
                    <h2 className="text-lg md:text-xl font-bold text-white mb-2">{t('dash.empty_title')}</h2>
                    <p className="text-xs text-zinc-500 mb-8 text-center max-w-[200px] leading-relaxed">Initialize your first entity in the Neural Forge.</p>
                    <button onClick={onCreateClick} className="px-8 py-3 bg-white text-black font-bold text-xs rounded-xl hover:bg-zinc-200 transition-colors uppercase tracking-widest shadow-lg">
                        {t('dash.begin')}
                    </button>
                 </div>
            ) : (
                <section>
                    {/* === HIYORI FEATURED BANNER === */}
                    {/* Only show if not searching, or if searching matches Hiyori */}
                    {featuredChar && !searchQuery && (
                        <NewCharacterAvailable 
                            character={featuredChar} 
                            onSelect={onSelectCharacter}
                            onShowDetails={() => setShowCharacterBook(true)} 
                        />
                    )}

                    <div className="flex items-center justify-between mb-4 md:mb-6 px-1">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-violet-500/10 rounded-lg">
                                <Zap size={14} className="text-violet-400 fill-violet-400/20" />
                            </div>
                            <h2 className="text-xs md:text-sm font-bold text-zinc-300 uppercase tracking-widest">
                                {searchQuery ? `Searching: "${searchQuery}"` : t('dash.resonating')}
                            </h2>
                        </div>
                        <div className="text-[10px] font-mono text-zinc-500 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            {filteredChars.length} / ∞
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
                         {filteredChars.map((char) => (
                            <CharacterCard 
                               key={char.id} 
                               char={char} 
                               session={sessions[char.id]}
                               onSelect={onSelectCharacter}
                               onEdit={onEditCharacter}
                            />
                         ))}
                    </div>
                    
                    {filteredChars.length === 0 && (
                        <div className="py-20 text-center">
                            <p className="text-zinc-500 text-sm">No neural signatures match your query.</p>
                        </div>
                    )}
                </section>
            )}
        </div>
      </div>
    </div>
  );
};
