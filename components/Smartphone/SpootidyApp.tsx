
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Heart, MoreHorizontal, Disc, Volume2, Plus, X, Upload, Link, Music as MusicIcon, Search, Home, Library, Bell, Clock, Settings } from 'lucide-react';
import { Track, INITIAL_TRACKS } from './Spootidy/tracks';
import { getSpootidyTracks, saveSpootidyTracks } from '../../services/spootidyStorage';

interface SpootidyAppProps {
    onNavigate: (view: string) => void;
    // Props for hoisted audio state
    audioRef?: React.MutableRefObject<HTMLAudioElement | null>;
    isPlaying?: boolean;
    currentTrack?: Track | null;
    onPlay?: (track: Track) => void;
    onPause?: () => void;
    onResume?: () => void;
}

interface MiniPlayerProps {
    selectedTrack: Track;
    progress: number;
    isPlaying: boolean;
    handlePlayPause: () => void;
    setView: (view: 'list' | 'player') => void;
}

const MiniPlayer: React.FC<MiniPlayerProps> = ({ selectedTrack, progress, isPlaying, handlePlayPause, setView }) => (
    <div 
        onClick={() => setView('player')}
        className="absolute bottom-16 left-2 right-2 bg-[#3E2424] bg-opacity-95 backdrop-blur-md rounded-lg flex items-center justify-between p-2 shadow-xl cursor-pointer border border-white/5 z-30"
        style={{ backgroundColor: '#2d2d2d' }}
    >
        <div className="absolute top-0 left-2 right-2 h-[2px] bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="flex items-center gap-3 pt-1">
            <img src={selectedTrack.cover} className="w-10 h-10 rounded-md object-cover" />
            <div className="min-w-0">
                <h4 className="text-xs font-bold text-white truncate max-w-[140px]">{selectedTrack.title}</h4>
                <p className="text-[10px] text-zinc-400 truncate max-w-[140px]">{selectedTrack.artist}</p>
            </div>
        </div>
        <div className="flex items-center gap-3 pr-2 pt-1">
             <button className="text-zinc-300"><Heart size={20} /></button>
             <button 
                onClick={(e) => { e.stopPropagation(); handlePlayPause(); }}
                className="text-white"
            >
                {isPlaying ? <Pause size={20} fill="currentColor"/> : <Play size={20} fill="currentColor"/>}
            </button>
        </div>
    </div>
);

export const SpootidyApp: React.FC<SpootidyAppProps> = ({ 
    onNavigate, 
    audioRef, 
    isPlaying = false, 
    currentTrack: propCurrentTrack, 
    onPlay, 
    onPause, 
    onResume 
}) => {
    const [view, setView] = useState<'list' | 'player'>('list');
    
    // Track State with Persistence via Service
    const [tracks, setTracks] = useState<Track[]>(() => getSpootidyTracks());
    
    // Ensure local currentTrack is valid or synced with prop
    const [selectedTrack, setSelectedTrack] = useState<Track>(propCurrentTrack || tracks[0] || INITIAL_TRACKS[0]);

    // Update selected track if prop changes (background play syncing)
    useEffect(() => {
        if (propCurrentTrack) {
            const timer = setTimeout(() => {
                setSelectedTrack(propCurrentTrack);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [propCurrentTrack]);

    // Persist tracks when they change
    useEffect(() => {
        saveSpootidyTracks(tracks);
    }, [tracks]);

    // Player State
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    
    // Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTrackData, setNewTrackData] = useState({
        title: '',
        artist: '',
        url: '',
        cover: ''
    });
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const audioInputRef = useRef<HTMLInputElement>(null);

    const handleNext = useCallback(() => {
        const idx = tracks.findIndex(t => t.id === selectedTrack.id);
        const nextIdx = (idx + 1) % tracks.length;
        const nextTrack = tracks[nextIdx];
        setSelectedTrack(nextTrack);
        if (onPlay) onPlay(nextTrack);
    }, [tracks, selectedTrack.id, onPlay]);

    const handlePrev = useCallback(() => {
        const idx = tracks.findIndex(t => t.id === selectedTrack.id);
        const prevIdx = (idx - 1 + tracks.length) % tracks.length;
        const prevTrack = tracks[prevIdx];
        setSelectedTrack(prevTrack);
        if (onPlay) onPlay(prevTrack);
    }, [tracks, selectedTrack.id, onPlay]);

    // Sync progress bar with audioRef
    useEffect(() => {
        const currentAudio = audioRef?.current;
        if (!currentAudio) return;
        
        const updateProgress = () => {
            if (currentAudio) {
                setCurrentTime(currentAudio.currentTime);
                if (currentAudio.duration) {
                     setProgress((currentAudio.currentTime / currentAudio.duration) * 100);
                     setDuration(currentAudio.duration);
                }
            }
        };
        
        const handleLoadedMetadata = () => {
            if (currentAudio) {
                setDuration(currentAudio.duration);
            }
        };
        
        const handleEnded = () => {
            // Auto next handled by logic, but for now simple stop or loop
            // Ideally Smartphone component handles playlist logic, but let's keep it simple:
            // Just update UI to not playing
            if(onPause) onPause();
            // Or auto next
            handleNext();
        };

        currentAudio.addEventListener('timeupdate', updateProgress);
        currentAudio.addEventListener('ended', handleEnded);
        currentAudio.addEventListener('loadedmetadata', handleLoadedMetadata);
        
        // Initial sync
        updateProgress();

        return () => {
            if (currentAudio) {
                currentAudio.removeEventListener('timeupdate', updateProgress);
                currentAudio.removeEventListener('ended', handleEnded);
                currentAudio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            }
        };
    }, [audioRef, onPause, handleNext]);

    const handlePlayPause = () => {
        if (isPlaying) {
            if (onPause) onPause();
        } else {
            // If current track matches selected, resume, else play new
            if (propCurrentTrack?.id === selectedTrack.id) {
                if(onResume) onResume();
            } else {
                if(onPlay) onPlay(selectedTrack);
            }
        }
    };

    const formatTime = (seconds: number) => {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // --- ADD SONG HANDLERS (COMPRESSED) ---
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert("Please upload an image file.");
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    // Compress Image Logic (Client side)
                    const img = new Image();
                    img.src = event.target.result as string;
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const MAX_SIZE = 300;
                        let width = img.width;
                        let height = img.height;

                        if (width > height) {
                            if (width > MAX_SIZE) {
                                height *= MAX_SIZE / width;
                                width = MAX_SIZE;
                            }
                        } else {
                            if (height > MAX_SIZE) {
                                width *= MAX_SIZE / height;
                                height = MAX_SIZE;
                            }
                        }

                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                            ctx.drawImage(img, 0, 0, width, height);
                            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                            setNewTrackData(prev => ({ ...prev, cover: compressedBase64 }));
                        }
                    };
                }
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('audio/')) {
                alert("Please upload an audio file (MP3, WAV).");
                return;
            }
            
            // Auto fill title if empty
            if (!newTrackData.title) {
                const name = file.name.replace(/\.[^/.]+$/, "");
                setNewTrackData(prev => ({ ...prev, title: name }));
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setNewTrackData(prev => ({ ...prev, url: event.target?.result as string }));
                }
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const handleSaveTrack = () => {
        if (!newTrackData.title || !newTrackData.url) return;
        
        const newTrack: Track = {
            id: Date.now().toString(),
            title: newTrackData.title,
            artist: newTrackData.artist || 'Local Import',
            url: newTrackData.url,
            cover: newTrackData.cover || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=300&auto=format&fit=crop',
            duration: 180
        };

        setTracks(prev => [newTrack, ...prev]);
        setShowAddModal(false);
        setNewTrackData({ title: '', artist: '', url: '', cover: '' });
    };

    // --- LIST VIEW ---
    if (view === 'list') {
        const currentTimeOfDay = new Date().getHours();
        let greeting = "Good Evening";
        if (currentTimeOfDay < 12) greeting = "Good Morning";
        else if (currentTimeOfDay < 18) greeting = "Good Afternoon";

        return (
            <div className="h-full flex flex-col bg-[#121212] relative z-10 font-sans text-white overflow-hidden">
                {/* Background Gradient */}
                <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-emerald-900/60 to-[#121212] pointer-events-none" />

                {/* Header */}
                <div className="px-4 pt-6 pb-2 sticky top-0 z-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                         <button onClick={() => onNavigate('home')} className="p-1.5 bg-black/40 rounded-full hover:bg-black/60 transition-colors">
                            <ChevronLeft size={20} />
                         </button>
                    </div>
                    
                    <div className="flex gap-4">
                         <button className="text-white hover:opacity-80"><Bell size={20} /></button>
                         <button className="text-white hover:opacity-80"><Clock size={20} /></button>
                         <button className="text-white hover:opacity-80"><Settings size={20} /></button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 custom-scrollbar pb-32 relative z-10">
                    
                    <div className="mt-2 mb-6 flex gap-3">
                         <button className="px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-xs font-medium transition-colors">Music</button>
                         <button className="px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-xs font-medium transition-colors">Podcasts</button>
                    </div>

                    <div className="flex justify-between items-end mb-4">
                         <h2 className="text-xl font-bold tracking-tight">{greeting}</h2>
                         <button onClick={() => setShowAddModal(true)} className="p-1 hover:bg-white/10 rounded-full transition-colors" title="Add Custom Song">
                             <Plus size={20} />
                         </button>
                    </div>

                    {/* Grid Quick Picks */}
                    <div className="grid grid-cols-2 gap-2 mb-8">
                        {['Liked Songs', 'Daily Mix 1', 'Cyberpunk 2077', 'Sleep'].map((item, i) => (
                            <div key={i} className="bg-white/5 hover:bg-white/10 rounded-md flex items-center overflow-hidden transition-colors cursor-pointer group h-14">
                                <div className="h-full w-14 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                                    {i === 0 ? <Heart size={20} fill="white" /> : <Disc size={20} />}
                                </div>
                                <span className="text-[11px] font-bold px-2 line-clamp-2 leading-tight flex-1">{item}</span>
                            </div>
                        ))}
                    </div>

                    {/* Recently Played */}
                    <h3 className="text-lg font-bold mb-4 tracking-tight">Recently Played</h3>
                    <div className="space-y-0">
                         {tracks.map(track => {
                             const isCurrent = selectedTrack.id === track.id;
                             return (
                                 <div 
                                     key={track.id}
                                     onClick={() => { 
                                         setSelectedTrack(track); 
                                         if(onPlay) onPlay(track); 
                                     }}
                                     className={`flex items-center gap-3 p-2 rounded-md transition-colors cursor-pointer ${isCurrent ? 'bg-white/10' : 'hover:bg-white/5'}`}
                                 >
                                     <img src={track.cover} className="w-12 h-12 object-cover shadow-sm" />
                                     <div className="flex-1 min-w-0">
                                         <h4 className={`text-sm font-medium truncate ${isCurrent ? 'text-green-500' : 'text-white'}`}>{track.title}</h4>
                                         <p className="text-xs text-zinc-400 truncate">{track.artist}</p>
                                     </div>
                                     <MoreHorizontal size={16} className="text-zinc-500" />
                                 </div>
                             );
                         })}
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black via-black/95 to-transparent z-20 flex items-end justify-around pb-2 px-2">
                     <div className="flex flex-col items-center gap-1 opacity-100 text-white cursor-pointer">
                         <Home size={22} fill="currentColor" />
                         <span className="text-[10px]">Home</span>
                     </div>
                     <div className="flex flex-col items-center gap-1 text-zinc-500 cursor-pointer hover:text-white transition-colors">
                         <Search size={22} />
                         <span className="text-[10px]">Search</span>
                     </div>
                     <div className="flex flex-col items-center gap-1 text-zinc-500 cursor-pointer hover:text-white transition-colors">
                         <Library size={22} />
                         <span className="text-[10px]">Library</span>
                     </div>
                </div>

                <MiniPlayer 
                    selectedTrack={selectedTrack}
                    progress={progress}
                    isPlaying={isPlaying}
                    handlePlayPause={handlePlayPause}
                    setView={setView}
                />

                {/* ADD SONG MODAL */}
                {showAddModal && (
                    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
                        <div className="bg-[#242424] w-full max-w-sm rounded-xl p-6 shadow-2xl relative">
                            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white">
                                <X size={20} />
                            </button>
                            
                            <h2 className="text-lg font-bold text-white mb-6 text-center">Add Custom Song</h2>
                            
                            <div className="space-y-4">
                                {/* Cover Upload */}
                                <div className="flex justify-center mb-2">
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-32 h-32 bg-[#121212] rounded-md flex flex-col items-center justify-center border border-dashed border-zinc-600 cursor-pointer hover:border-white transition-colors relative overflow-hidden group"
                                    >
                                        {newTrackData.cover ? (
                                            <img src={newTrackData.cover} className="w-full h-full object-cover" />
                                        ) : (
                                            <>
                                                <MusicIcon size={32} className="text-zinc-500 mb-2 group-hover:text-white transition-colors" />
                                                <span className="text-[10px] text-zinc-500 font-bold group-hover:text-white">Upload Art</span>
                                            </>
                                        )}
                                    </div>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </div>

                                <input 
                                    value={newTrackData.title}
                                    onChange={e => setNewTrackData({...newTrackData, title: e.target.value})}
                                    className="w-full bg-[#121212] border border-transparent focus:border-white/20 rounded-md px-3 py-3 text-white text-sm outline-none font-bold placeholder-zinc-500"
                                    placeholder="Song Title"
                                />
                                
                                <input 
                                    value={newTrackData.artist}
                                    onChange={e => setNewTrackData({...newTrackData, artist: e.target.value})}
                                    className="w-full bg-[#121212] border border-transparent focus:border-white/20 rounded-md px-3 py-3 text-white text-sm outline-none font-medium placeholder-zinc-500"
                                    placeholder="Artist"
                                />

                                {/* AUDIO UPLOAD BUTTON */}
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => audioInputRef.current?.click()}
                                        className="flex-1 bg-[#121212] hover:bg-[#1a1a1a] border border-transparent focus:border-white/20 rounded-md px-3 py-3 text-white text-sm outline-none font-medium text-left flex items-center justify-between group transition-colors"
                                    >
                                        <span className={newTrackData.url ? 'text-green-500' : 'text-zinc-500'}>
                                            {newTrackData.url ? 'Audio Selected' : 'Upload MP3'}
                                        </span>
                                        <Upload size={16} className="text-zinc-500 group-hover:text-white" />
                                    </button>
                                    <input type="file" ref={audioInputRef} className="hidden" accept="audio/*" onChange={handleAudioUpload} />
                                </div>
                                
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-zinc-700"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs">
                                        <span className="px-2 bg-[#242424] text-zinc-500">OR URL</span>
                                    </div>
                                </div>

                                <div className="relative">
                                    <Link size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                    <input 
                                        value={newTrackData.url}
                                        onChange={e => setNewTrackData({...newTrackData, url: e.target.value})}
                                        className="w-full bg-[#121212] border border-transparent focus:border-white/20 rounded-md pl-9 pr-3 py-3 text-white text-sm outline-none placeholder-zinc-500"
                                        placeholder="Paste MP3 URL"
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={handleSaveTrack}
                                disabled={!newTrackData.title || !newTrackData.url}
                                className="w-full bg-[#1db954] hover:bg-[#1ed760] disabled:bg-[#1db954]/50 disabled:text-black/50 text-black font-bold py-3 rounded-full text-sm transition-all mt-6 active:scale-95"
                            >
                                Add to Library
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // --- PLAYER VIEW ---
    return (
        <div className="h-full flex flex-col bg-gradient-to-b from-[#4c4c4c] to-[#121212] animate-slide-up relative z-50 font-sans text-white">
            {/* Player Header */}
            <div className="p-6 flex items-center justify-between">
                <button onClick={() => setView('list')} className="text-white hover:opacity-80">
                    <ChevronLeft size={24} />
                </button>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">Now Playing</span>
                <button className="text-white hover:opacity-80">
                    <MoreHorizontal size={24} />
                </button>
            </div>

            {/* Album Art */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full aspect-square rounded-lg shadow-2xl overflow-hidden relative">
                    <img src={selectedTrack.cover} className="w-full h-full object-cover" />
                </div>
            </div>

            {/* Controls Area */}
            <div className="px-6 pb-10">
                <div className="flex justify-between items-end mb-6">
                    <div className="min-w-0 pr-4">
                        <h2 className="text-2xl font-bold tracking-tight leading-tight truncate">{selectedTrack.title}</h2>
                        <p className="text-base text-zinc-400 font-medium truncate">{selectedTrack.artist}</p>
                    </div>
                    <button className="text-green-500 shrink-0">
                        <Heart size={24} fill="currentColor" />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-2">
                    <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden group cursor-pointer relative">
                        <div 
                            className="h-full bg-white group-hover:bg-green-500 rounded-full relative" 
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-lg"></div>
                        </div>
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-400 font-medium mt-2">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Playback Controls */}
                <div className="flex items-center justify-between mt-4">
                    <button className="text-zinc-400 hover:text-white"><Shuffle size={20}/></button>
                    <button onClick={handlePrev} className="text-white hover:scale-110 transition-transform"><SkipBack size={28} fill="currentColor"/></button>
                    <button 
                        onClick={handlePlayPause}
                        className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-xl shadow-white/10"
                    >
                        {isPlaying ? <Pause size={28} fill="currentColor"/> : <Play size={28} fill="currentColor" className="ml-1"/>}
                    </button>
                    <button onClick={handleNext} className="text-white hover:scale-110 transition-transform"><SkipForward size={28} fill="currentColor"/></button>
                    <button className="text-zinc-400 hover:text-white"><Repeat size={20}/></button>
                </div>

                {/* Volume / Devices */}
                <div className="flex justify-between items-center mt-8 px-2">
                     <div className="text-zinc-400"><Volume2 size={20} /></div>
                     <div className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                         AirPods Pro
                     </div>
                     <div className="text-zinc-400"><MoreHorizontal size={20} /></div>
                </div>
            </div>
        </div>
    );
};
