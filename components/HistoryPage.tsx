
import React, { useState, useMemo } from 'react';
import { SavedStory, Character, ChatSession } from '../types';
import { getSavedStories, deleteSavedStory, updateSavedStory } from '../services/storageService';
import { Search, Clock, Trash2, Play, X, Calendar, Edit2, Palette, AlertTriangle, Check, Hash, Users, Zap, ArrowRight, Network, Layers, BookOpen, Star } from 'lucide-react';
import { t } from '../services/translationService';

interface HistoryPageProps {
  onLoadStory: (characterId: string, session: ChatSession, charState?: { name: string, avatar: string }) => void;
  sessions: Record<string, ChatSession>;
  characters: Character[];
  onSelectGroup: (sessionId: string) => void;
}

const PRESET_COLORS = [
    { hex: '#7c3aed', name: 'Violet' },
    { hex: '#2563eb', name: 'Blue' },
    { hex: '#06b6d4', name: 'Cyan' },
    { hex: '#10b981', name: 'Emerald' },
    { hex: '#f59e0b', name: 'Amber' },
    { hex: '#ef4444', name: 'Red' },
    { hex: '#ec4899', name: 'Pink' },
    { hex: '#71717a', name: 'Zinc' },
];

export const HistoryPage: React.FC<HistoryPageProps> = ({ onLoadStory, sessions, characters, onSelectGroup }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  
  // Modal States
  const [storyToDelete, setStoryToDelete] = useState<string | null>(null);
  const [editingStory, setEditingStory] = useState<SavedStory | null>(null);

  // Edit Form States
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  // Load stories directly
  const allStories = useMemo(() => getSavedStories(), [storyToDelete, editingStory]);
  
  // --- SEPARATION LOGIC ---
  
  // 1. Story Mode Stories (Specific Characters like Hiyori)
  const storyModeStories = useMemo(() => 
      allStories.filter(s => s.characterId === 'char-hiyori' && !s.sessionData?.isGroup), 
  [allStories]);

  // 2. Single Stories (Exclude Story Mode chars)
  const singleStories = useMemo(() => 
      allStories.filter(s => !s.sessionData?.isGroup && s.characterId !== 'char-hiyori'), 
  [allStories]);

  // 3. Group Stories
  const groupStories = useMemo(() => allStories.filter(s => s.sessionData?.isGroup), [allStories]);

  // Get Recent Neural Links (Auto-Saves) - Mix of both, purely chronological
  // MODIFIED: Exclude Story Mode characters from this general list
  const recentNeuralLinks = useMemo(() => {
    return allStories
        .filter(s => s.type === 'auto' && s.characterId !== 'char-hiyori') // Exclude Hiyori
        .sort((a, b) => b.savedAt - a.savedAt)
        .slice(0, 4);
  }, [allStories]);
  
  // Group SINGLE stories by Character ID for the horizontal list
  const charactersWithHistory = useMemo(() => {
    const map = new Map<string, { name: string; avatar: string; count: number; stories: SavedStory[] }>();
    
    singleStories.forEach(story => {
      if (!map.has(story.characterId)) {
        map.set(story.characterId, {
          name: story.characterName,
          avatar: story.avatar,
          count: 0,
          stories: []
        });
      }
      const char = map.get(story.characterId)!;
      char.count += 1;
      char.stories.push(story);
    });

    return Array.from(map.entries()).map(([id, data]) => ({ id, ...data }));
  }, [singleStories]);

  // Group STORY MODE stories
  const storyModeWithHistory = useMemo(() => {
      const map = new Map<string, { name: string; avatar: string; count: number; stories: SavedStory[] }>();
      
      storyModeStories.forEach(story => {
        if (!map.has(story.characterId)) {
          map.set(story.characterId, {
            name: story.characterName,
            avatar: story.avatar,
            count: 0,
            stories: []
          });
        }
        const char = map.get(story.characterId)!;
        char.count += 1;
        char.stories.push(story);
      });
  
      return Array.from(map.entries()).map(([id, data]) => ({ id, ...data }));
  }, [storyModeStories]);

  // Group GROUP stories by Session ID (Group ID)
  const groupsWithHistory = useMemo(() => {
      const map = new Map<string, { name: string; participants: string[]; count: number; stories: SavedStory[] }>();
      
      groupStories.forEach(story => {
          if (!map.has(story.characterId)) {
              map.set(story.characterId, {
                  name: "Group Simulation",
                  participants: story.sessionData.participants || [],
                  count: 0,
                  stories: []
              });
          }
          const group = map.get(story.characterId)!;
          group.count += 1;
          group.stories.push(story);
      });

      return Array.from(map.entries()).map(([id, data]) => ({ id, ...data }));
  }, [groupStories]);

  // Filter based on search
  const filteredChars = charactersWithHistory.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStoryMode = storyModeWithHistory.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGroups = groupsWithHistory.filter(g => 
      // Search by "Group" or specifically if we had named groups
      searchTerm ? "group simulation".includes(searchTerm.toLowerCase()) : true
  );

  // Helper to get participant avatars
  const getParticipantAvatars = (participantIds: string[]) => {
      return participantIds.map(id => characters.find(c => c.id === id)?.avatar).filter(Boolean) as string[];
  };

  // Determine what to show in the modal (Single Character OR Group OR Story Mode)
  const selectedData = selectedCharId 
      ? (charactersWithHistory.find(c => c.id === selectedCharId) || groupsWithHistory.find(g => g.id === selectedCharId) || storyModeWithHistory.find(s => s.id === selectedCharId))
      : null;

  // Prepare sorted stories for the selected item
  const sortedStories = useMemo(() => {
      if (!selectedData) return [];
      return [...selectedData.stories].sort((a,b) => {
          if (a.type === 'auto' && b.type !== 'auto') return -1;
          if (a.type !== 'auto' && b.type === 'auto') return 1;
          return b.savedAt - a.savedAt;
      });
  }, [selectedData]);

  const handleDeleteClick = (e: React.MouseEvent, storyId: string) => {
      e.stopPropagation();
      setStoryToDelete(storyId);
  };

  const confirmDelete = () => {
      if (storyToDelete) {
          deleteSavedStory(storyToDelete);
          setStoryToDelete(null);
          // If it was the last story, close modal
          if (selectedData && selectedData.stories.length <= 1) {
              setSelectedCharId(null);
          }
      }
  };

  const handleEditClick = (e: React.MouseEvent, story: SavedStory) => {
      e.stopPropagation();
      setEditingStory(story);
      setEditName(story.saveName);
      setEditColor(story.color || '#7c3aed');
  };

  const saveEdit = () => {
      if (editingStory) {
          const updated: SavedStory = {
              ...editingStory,
              saveName: editName.trim() || editingStory.saveName,
              color: editColor
          };
          updateSavedStory(updated);
          setEditingStory(null);
      }
  };

  return (
    <div className="h-full w-full bg-zinc-950 relative overflow-hidden flex flex-col">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-violet-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* --- HEADER & SEARCH --- */}
      <div className="p-6 md:p-8 pt-8 z-10 flex-shrink-0">
         <h1 className="text-3xl font-bold text-white mb-6 tracking-tight">{t('hist.title')}</h1>
         
         <div className="relative group max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-violet-400 transition-colors" size={18} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('hist.search')} 
              className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-transparent transition-all shadow-xl backdrop-blur-sm"
            />
         </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 md:px-8 pb-10 custom-scrollbar">
        
        {/* --- 1. STORY MODE ARCHIVES (GOLDEN) --- */}
        {filteredStoryMode.length > 0 && (
            <div className="mb-8 animate-fade-in-up">
                <div className="flex items-center gap-2 mb-4">
                    <BookOpen size={14} className="text-yellow-500 fill-yellow-500/20" />
                    <h2 className="text-xs font-bold text-yellow-500 uppercase tracking-widest">Story Mode Archives</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredStoryMode.map(char => (
                        <div 
                            key={char.id}
                            onClick={() => setSelectedCharId(char.id)}
                            className="group bg-gradient-to-br from-yellow-900/10 to-zinc-900/40 hover:bg-zinc-900 border border-yellow-500/30 hover:border-yellow-500/60 p-5 rounded-2xl cursor-pointer transition-all relative overflow-hidden shadow-[0_4px_20px_rgba(234,179,8,0.1)]"
                        >
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <img src={char.avatar} className="w-10 h-10 rounded-full border-2 border-yellow-500/50 object-cover shadow-lg" />
                                        <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded-full shadow border border-yellow-300">
                                            STORY
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white group-hover:text-yellow-400 transition-colors">
                                            {char.name}
                                        </h3>
                                        <p className="text-[10px] text-yellow-500/70 font-mono flex items-center gap-1">
                                            <Star size={8} fill="currentColor"/> Realism Protocol
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-1 rounded text-[10px] font-bold uppercase">
                                    {char.count} Chapters
                                </div>
                            </div>
                            
                            {/* Background Shine */}
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* --- 2. INDIVIDUAL ARCHIVES (SINGLE CHARACTERS) --- */}
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">{t('hist.individual')}</h2>
        
        {filteredChars.length === 0 && filteredGroups.length === 0 && filteredStoryMode.length === 0 ? (
            <div className="p-8 border border-dashed border-zinc-800 rounded-2xl text-center text-zinc-600">
                <Clock className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t('hist.no_saves')}</p>
            </div>
        ) : (
            <div className="flex overflow-x-auto gap-4 pb-8 pt-2 px-1 -mx-1 snap-x no-scrollbar">
                {filteredChars.map((char) => (
                    <button 
                        key={char.id}
                        onClick={() => setSelectedCharId(char.id)}
                        className="snap-start flex-shrink-0 relative group"
                    >
                        {/* Avatar Container */}
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full p-1 border-2 border-zinc-800 group-hover:border-violet-500/50 transition-all duration-300 relative">
                            <img 
                                src={char.avatar} 
                                alt={char.name} 
                                className="w-full h-full rounded-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500"
                            />
                            {/* Counter Badge */}
                            <div className="absolute -top-1 -right-1 bg-zinc-900 border border-zinc-700 text-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg group-hover:bg-violet-600 group-hover:text-white group-hover:border-violet-500 transition-colors">
                                {char.count}
                            </div>
                        </div>
                        
                        {/* Name Label */}
                        <div className="mt-3 text-center w-20 md:w-24">
                            <p className="text-xs font-bold text-zinc-300 truncate group-hover:text-violet-300 transition-colors">{char.name}</p>
                        </div>
                    </button>
                ))}
                
                {/* Spacer */}
                <div className="w-4 flex-shrink-0" />
            </div>
        )}

        {/* --- 3. COLLECTIVE ARCHIVES (GROUP CHATS) --- */}
        {filteredGroups.length > 0 && (
             <div className="mt-2 mb-8 animate-fade-in-up">
                 <div className="flex items-center gap-2 mb-4">
                     <Layers size={14} className="text-blue-500" />
                     <h2 className="text-xs font-bold text-blue-500 uppercase tracking-widest">{t('hist.collective')}</h2>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {filteredGroups.map(group => {
                         const avatars = getParticipantAvatars(group.participants);
                         return (
                             <div 
                                 key={group.id}
                                 onClick={() => setSelectedCharId(group.id)} // Open Modal with Group ID
                                 className="group bg-zinc-900/40 hover:bg-zinc-900 border border-blue-500/10 hover:border-blue-500/40 p-5 rounded-2xl cursor-pointer transition-all relative overflow-hidden shadow-lg"
                             >
                                 <div className="flex items-center justify-between mb-4 relative z-10">
                                     <div className="flex -space-x-3">
                                         {avatars.slice(0, 4).map((src, i) => (
                                             <img key={i} src={src} className="w-8 h-8 rounded-full border-2 border-zinc-900 object-cover" />
                                         ))}
                                         {avatars.length > 4 && (
                                             <div className="w-8 h-8 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center text-[9px] font-bold text-zinc-400">
                                                 +{avatars.length - 4}
                                             </div>
                                         )}
                                     </div>
                                     <div className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded text-[10px] font-bold uppercase">
                                         {group.count} Saves
                                     </div>
                                 </div>
                                 
                                 <div className="relative z-10">
                                     <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors mb-1">
                                         Group Simulation
                                     </h3>
                                     <p className="text-[10px] text-zinc-500">
                                         {group.participants.length} Active Minds • Last activity recently
                                     </p>
                                 </div>

                                 {/* Background Effects */}
                                 <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                 <Network className="absolute -right-4 -bottom-4 w-24 h-24 text-blue-500/5 group-hover:text-blue-500/10 transition-colors" />
                             </div>
                         );
                     })}
                 </div>
             </div>
        )}

        {/* --- 4. NEURAL LINKS (ACTIVE AUTO-SAVES) --- */}
        {!searchTerm && recentNeuralLinks.length > 0 && (
            <div className="mt-8 mb-8 animate-fade-in-up delay-75">
                 <div className="flex items-center gap-2 mb-4">
                     <Zap size={14} className="text-emerald-500 fill-emerald-500/20 animate-pulse"/>
                     <h2 className="text-xs font-bold text-emerald-500 uppercase tracking-widest">{t('hist.neural')}</h2>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {recentNeuralLinks.map(story => {
                         const isGroup = story.sessionData.isGroup;
                         return (
                            <div 
                                key={story.id}
                                onClick={() => onLoadStory(story.characterId, story.sessionData, { name: story.characterName, avatar: story.avatar })}
                                className="group bg-zinc-900/40 hover:bg-zinc-900 border border-emerald-500/20 hover:border-emerald-500/50 p-4 rounded-xl cursor-pointer transition-all relative overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_20px_rgba(16,185,129,0.1)]"
                            >
                                <div className="flex items-center gap-3 mb-3 relative z-10">
                                    <div className="relative">
                                        {isGroup ? (
                                            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                                                <Users size={16} />
                                            </div>
                                        ) : (
                                            <img src={story.avatar} className="w-10 h-10 rounded-full object-cover border border-emerald-500/30" />
                                        )}
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-zinc-950 rounded-full flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                                            {isGroup ? 'Group Simulation' : story.characterName}
                                        </h3>
                                        <span className="text-[10px] text-emerald-500/70 font-mono flex items-center gap-1">
                                            <Clock size={10} />
                                            {new Date(story.savedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="relative z-10">
                                    <p className="text-xs text-zinc-400 italic line-clamp-2 mb-3 pl-2 border-l-2 border-emerald-500/20 group-hover:border-emerald-500 transition-colors min-h-[2.5em]">
                                        "{story.sessionData.messages.slice(-1)[0]?.text || 'System ready.'}"
                                    </p>

                                    <div className="flex items-center justify-between pt-2 border-t border-emerald-500/10">
                                        <span className="text-[9px] font-bold uppercase text-zinc-500 group-hover:text-emerald-500/80 transition-colors">
                                            Auto-Resume
                                        </span>
                                        <div className="w-6 h-6 rounded-full bg-zinc-800 group-hover:bg-emerald-500/20 flex items-center justify-center transition-colors">
                                            <ArrowRight size={12} className="text-zinc-500 group-hover:text-emerald-400" />
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Background Effects */}
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            </div>
                         );
                     })}
                 </div>
            </div>
        )}
      </div>

      {/* --- POPUP MODAL (HISTORY DETAILS) --- */}
      {selectedCharId && selectedData && (
          <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
              <div 
                className="bg-zinc-950 w-full max-w-lg md:w-[600px] rounded-3xl border border-white/10 shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
              >
                  {/* Modal Header */}
                  <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/50 backdrop-blur-xl">
                      <div className="flex items-center gap-4">
                          {'participants' in selectedData ? (
                              <div className="flex -space-x-3">
                                  {getParticipantAvatars(selectedData.participants).slice(0,3).map((src,i) => (
                                      <img key={i} src={src} className="w-10 h-10 rounded-full border border-zinc-900" />
                                  ))}
                              </div>
                          ) : (
                              <img src={selectedData.avatar} className="w-12 h-12 rounded-full border border-white/10" />
                          )}
                          
                          <div>
                              <h3 className="text-lg font-bold text-white">{selectedData.name}</h3>
                              <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                                  <Clock size={12} />
                                  <span>{selectedData.count} Archived Points</span>
                              </p>
                          </div>
                      </div>
                      <button 
                        onClick={() => setSelectedCharId(null)}
                        className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors border border-white/5"
                      >
                          <X size={20} />
                      </button>
                  </div>

                  {/* Modal List */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black/20 custom-scrollbar">
                      {sortedStories.map((story, index) => {
                          const badgeColor = story.color || '#7c3aed';
                          const isAuto = story.type === 'auto';
                          
                          // Header Logic
                          const showNeuralHeader = isAuto && index === 0;
                          const showManualHeader = !isAuto && (index > 0 && sortedStories[index - 1].type === 'auto');

                          return (
                            <React.Fragment key={story.id}>
                                {/* Neural Links Header inside Modal */}
                                {showNeuralHeader && (
                                     <div className="flex items-center gap-2 mb-1 px-1 pt-1 animate-fade-in">
                                         <Zap size={12} className="text-emerald-500 fill-current animate-pulse"/>
                                         <span className="text-[10px] font-bold text-emerald-500/90 uppercase tracking-widest">{t('hist.neural')}</span>
                                     </div>
                                )}
                                
                                {/* Manual Checkpoints Header inside Modal */}
                                {showManualHeader && (
                                     <div className="flex items-center gap-2 mt-8 mb-2 px-1 animate-fade-in">
                                         <div className="w-1.5 h-1.5 rounded-full bg-zinc-700"></div>
                                         <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t('hist.manual')}</span>
                                     </div>
                                )}

                                <div 
                                    className={`
                                        group bg-zinc-900/40 hover:bg-zinc-900 border 
                                        ${isAuto ? 'border-emerald-500/30' : 'border-white/5'} 
                                        hover:border-violet-500/30 rounded-xl p-4 transition-all duration-300 relative overflow-hidden
                                    `}
                                >
                                    <div className="flex justify-between items-start mb-3 relative z-10">
                                        <div className="flex items-center gap-3 w-full mr-2">
                                            {/* Styled Card Badge for Name */}
                                            <div 
                                                className="px-3 py-1.5 rounded-lg border border-white/10 shadow-lg flex items-center gap-2"
                                                style={{ backgroundColor: `${badgeColor}33`, borderColor: `${badgeColor}55` }}
                                            >
                                                {isAuto && <Zap size={10} className="text-emerald-400 fill-current animate-pulse"/>}
                                                <span 
                                                    className="font-bold text-sm truncate"
                                                    style={{ color: '#fff', textShadow: `0 0 10px ${badgeColor}` }}
                                                >
                                                    {story.saveName}
                                                </span>
                                            </div>
                                            
                                            {/* Edit Controls */}
                                            {!isAuto && (
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950/50 rounded-lg p-1 border border-white/10 backdrop-blur">
                                                    <button 
                                                        onClick={(e) => handleEditClick(e, story)}
                                                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                                                        title="Rename Card"
                                                    >
                                                        <Edit2 size={12} />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => handleEditClick(e, story)}
                                                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                                                        title="Change Color"
                                                    >
                                                        <Palette size={12} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="mb-2 pl-1">
                                        <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-mono">
                                            <span className="flex items-center gap-1"><Calendar size={10}/> {new Date(story.savedAt).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1"><Clock size={10}/> {new Date(story.savedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                    </div>

                                    <div className="bg-black/30 rounded-lg p-3 mb-4 border border-white/5 relative">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg" style={{ backgroundColor: badgeColor }}></div>
                                        <p className="text-xs text-zinc-400 italic line-clamp-2 pl-2">
                                            "{story.sessionData.messages.slice(-1)[0]?.text || 'No preview available...'}"
                                        </p>
                                    </div>

                                    <div className="flex gap-3 relative z-10">
                                        <button 
                                            onClick={() => onLoadStory(story.characterId, story.sessionData, { name: story.characterName, avatar: story.avatar })}
                                            className="flex-1 bg-violet-600 hover:bg-violet-500 text-white py-2 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-violet-900/20"
                                        >
                                            <Play size={12} fill="currentColor" /> {t('hist.load')}
                                        </button>
                                        {!isAuto && (
                                            <button 
                                                onClick={(e) => handleDeleteClick(e, story.id)}
                                                className="px-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg border border-red-500/20 hover:border-red-500 transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                                                title="Delete Permanently"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Hover Glow */}
                                    <div 
                                        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" 
                                        style={{ background: `linear-gradient(45deg, ${badgeColor}, transparent)` }}
                                    />
                                </div>
                            </React.Fragment>
                          );
                      })}
                  </div>
              </div>
          </div>
      )}

      {/* --- CONFIRM DELETE MODAL --- */}
      {storyToDelete && (
          <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-zinc-950 border border-red-500/30 p-6 rounded-2xl w-80 shadow-[0_0_50px_rgba(220,38,38,0.2)] relative scale-100">
                  <div className="flex flex-col items-center text-center mb-4">
                      <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mb-3 border border-red-500/20 animate-pulse">
                          <AlertTriangle size={28} className="text-red-500" />
                      </div>
                      <h3 className="text-lg font-bold text-white">Delete Memory?</h3>
                  </div>
                  <p className="text-xs text-zinc-400 text-center mb-6 leading-relaxed">
                      Are you sure you want to delete this archived timeline? This action creates a permanent data void and cannot be undone.
                  </p>
                  <div className="flex gap-3">
                      <button onClick={() => setStoryToDelete(null)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-3 rounded-xl text-xs transition-colors">
                          CANCEL
                      </button>
                      <button onClick={confirmDelete} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-900/30 text-xs transition-colors">
                          DELETE
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* --- EDIT / COLOR MODAL --- */}
      {editingStory && (
           <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
               <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl w-[360px] shadow-2xl relative">
                   <button onClick={() => setEditingStory(null)} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
                       <X size={18} />
                   </button>
                   
                   <div className="mb-6">
                       <h3 className="text-lg font-bold text-white flex items-center gap-2">
                           <Edit2 size={18} className="text-violet-400" />
                           Edit Archive Note
                       </h3>
                       <p className="text-xs text-zinc-500 mt-1">Customize the memory card appearance.</p>
                   </div>

                   {/* Name Input */}
                   <div className="mb-6 space-y-2">
                       <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Card Label</label>
                       <input 
                           type="text" 
                           value={editName}
                           onChange={(e) => setEditName(e.target.value)}
                           className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:border-violet-500/50 outline-none transition-colors"
                           placeholder="Enter story name..."
                       />
                   </div>

                   {/* Professional Color Picker Grid */}
                   <div className="mb-8 space-y-3">
                        <div className="flex justify-between items-baseline">
                             <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Accent Color</label>
                             <span className="text-[10px] font-mono text-zinc-600">{editColor}</span>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-3">
                            {PRESET_COLORS.map(c => (
                                <button
                                    key={c.hex}
                                    onClick={() => setEditColor(c.hex)}
                                    className={`
                                        h-10 rounded-lg border transition-all duration-300 relative group overflow-hidden
                                        ${editColor === c.hex ? 'border-white scale-105 shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'border-transparent hover:scale-105'}
                                    `}
                                    style={{ backgroundColor: c.hex }}
                                >
                                    {editColor === c.hex && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Check size={16} className="text-white drop-shadow-md" strokeWidth={3} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none"></div>
                                </button>
                            ))}
                        </div>

                        {/* Custom Hex Input */}
                        <div className="flex items-center gap-2 bg-black/30 p-2 rounded-xl border border-zinc-800 mt-2">
                             <div className="p-2 bg-zinc-900 rounded-lg text-zinc-500">
                                 <Hash size={14} />
                             </div>
                             <input 
                                 type="text" 
                                 value={editColor}
                                 onChange={(e) => setEditColor(e.target.value)}
                                 className="bg-transparent border-none outline-none text-xs text-zinc-300 w-full font-mono uppercase"
                                 placeholder="#000000"
                                 maxLength={7}
                             />
                             <div className="w-8 h-8 rounded-lg border border-white/10" style={{ backgroundColor: editColor }}></div>
                        </div>
                   </div>

                   <button 
                        onClick={saveEdit}
                        className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wide"
                   >
                        <Check size={16} /> Save Changes
                   </button>

               </div>
           </div>
      )}

    </div>
  );
};
