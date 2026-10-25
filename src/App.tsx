import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Track, RepeatMode } from './types/music';
import { dbService } from './services/db';
import { audioEngine } from './services/audioEngine';
import { initializeDefaultLibrary } from './services/defaultTracks';

import { TopBar } from './components/TopBar';
import { PlayerBar } from './components/PlayerBar';
import { NowPlayingView } from './components/NowPlayingView';
import { LibraryView } from './components/LibraryView';
import { EqualizerView } from './components/EqualizerView';
import { VisualizerView } from './components/VisualizerView';
import { VishDevelopingModal } from './components/VishDevelopingModal';
import { AudioImportModal } from './components/AudioImportModal';
import { SleepTimerModal } from './components/SleepTimerModal';

export default function App() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');
  const [isShuffle, setIsShuffle] = useState(false);
  const [storageBytes, setStorageBytes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'player' | 'library' | 'equalizer' | 'visualizer'>('player');

  // Modals
  const [isVishModalOpen, setIsVishModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);
  const [sleepRemaining, setSleepRemaining] = useState<number | null>(null);

  const tracksRef = useRef<Track[]>([]);
  tracksRef.current = tracks;
  const currentTrackRef = useRef<Track | null>(null);
  currentTrackRef.current = currentTrack;
  const repeatModeRef = useRef<RepeatMode>(repeatMode);
  repeatModeRef.current = repeatMode;
  const queueRef = useRef<Track[]>([]);
  queueRef.current = queue;

  // Initialize Library & Audio
  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      try {
        setIsLoading(true);
        const loadedTracks = await initializeDefaultLibrary();
        if (isMounted) {
          setTracks(loadedTracks);
          setQueue(loadedTracks);
          if (loadedTracks.length > 0) {
            setCurrentTrack(loadedTracks[0]);
            if (loadedTracks[0].audioUrl) {
              audioEngine.setSrc(loadedTracks[0].audioUrl);
            }
          }
          const est = await dbService.getStorageEstimate();
          setStorageBytes(est.usedBytes);
        }
      } catch (err) {
        console.error('Failed to bootstrap library:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    bootstrap();

    // Setup Audio Element Listeners
    const audio = audioEngine.getAudioElement();

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onDurationChange = () => {
      if (isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    const onEnded = () => {
      handleTrackEnded();
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('loadedmetadata', onDurationChange);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    // Sleep timer ticker
    const timerCheck = setInterval(() => {
      setSleepRemaining(audioEngine.getRemainingSleepSeconds());
    }, 1000);

    return () => {
      isMounted = false;
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('loadedmetadata', onDurationChange);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      clearInterval(timerCheck);
    };
  }, []);

  // Update storage size on changes
  const refreshStorageInfo = async () => {
    const est = await dbService.getStorageEstimate();
    setStorageBytes(est.usedBytes);
  };

  // Play a specific track
  const playTrack = useCallback(async (track: Track) => {
    try {
      setCurrentTrack(track);
      let src = track.audioUrl;
      if (!src && track.audioBlob) {
        src = URL.createObjectURL(track.audioBlob);
        track.audioUrl = src;
      }

      if (src) {
        audioEngine.setSrc(src);
        await audioEngine.play();
        setIsPlaying(true);
        dbService.incrementPlayCount(track.id);
      }
    } catch (err) {
      console.error('Error playing track:', err);
    }
  }, []);

  // Toggle play/pause
  const togglePlay = useCallback(async () => {
    const audio = audioEngine.getAudioElement();
    if (audio.paused) {
      if (!audio.src && currentTrack) {
        await playTrack(currentTrack);
      } else {
        await audioEngine.play();
        setIsPlaying(true);
      }
    } else {
      audioEngine.pause();
      setIsPlaying(false);
    }
  }, [currentTrack, playTrack]);

  // Next Track
  const handleNext = useCallback(() => {
    const currentList = queueRef.current.length > 0 ? queueRef.current : tracksRef.current;
    if (currentList.length === 0) return;

    const currIndex = currentList.findIndex((t) => t.id === currentTrackRef.current?.id);
    let nextIndex = currIndex + 1;
    if (nextIndex >= currentList.length) {
      nextIndex = 0;
    }
    playTrack(currentList[nextIndex]);
  }, [playTrack]);

  // Previous Track
  const handlePrev = useCallback(() => {
    const audio = audioEngine.getAudioElement();
    if (audio.currentTime > 3) {
      audioEngine.setTime(0);
      return;
    }

    const currentList = queueRef.current.length > 0 ? queueRef.current : tracksRef.current;
    if (currentList.length === 0) return;

    const currIndex = currentList.findIndex((t) => t.id === currentTrackRef.current?.id);
    let prevIndex = currIndex - 1;
    if (prevIndex < 0) {
      prevIndex = currentList.length - 1;
    }
    playTrack(currentList[prevIndex]);
  }, [playTrack]);

  // Track Ended Handler
  const handleTrackEnded = useCallback(() => {
    const repMode = repeatModeRef.current;
    if (repMode === 'one' && currentTrackRef.current) {
      audioEngine.setTime(0);
      audioEngine.play();
    } else {
      handleNext();
    }
  }, [handleNext]);

  // Seek
  const handleSeek = (seconds: number) => {
    audioEngine.setTime(seconds);
    setCurrentTime(seconds);
  };

  // Volume
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    audioEngine.setVolume(newVol);
  };

  // Rate
  const handleRateChange = (newRate: number) => {
    setPlaybackRate(newRate);
    audioEngine.setPlaybackRate(newRate);
  };

  // Repeat cycle: off -> all -> one -> off
  const handleCycleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  // Shuffle toggle
  const handleToggleShuffle = () => {
    setIsShuffle((prev) => {
      const nextShuffle = !prev;
      if (nextShuffle) {
        // Shuffle queue
        const shuffled = [...tracks].sort(() => Math.random() - 0.5);
        setQueue(shuffled);
      } else {
        setQueue([...tracks]);
      }
      return nextShuffle;
    });
  };

  // Toggle favorite
  const handleToggleFavorite = async (id: string) => {
    const isFav = await dbService.toggleFavorite(id);
    setTracks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, favorite: isFav } : t))
    );
    setQueue((prev) =>
      prev.map((t) => (t.id === id ? { ...t, favorite: isFav } : t))
    );
    if (currentTrack?.id === id) {
      setCurrentTrack((prev) => (prev ? { ...prev, favorite: isFav } : null));
    }
  };

  // Delete track
  const handleDeleteTrack = async (id: string) => {
    await dbService.deleteTrack(id);
    const updated = tracks.filter((t) => t.id !== id);
    setTracks(updated);
    setQueue((prev) => prev.filter((t) => t.id !== id));
    if (currentTrack?.id === id) {
      if (updated.length > 0) {
        playTrack(updated[0]);
      } else {
        audioEngine.pause();
        setCurrentTrack(null);
        setIsPlaying(false);
      }
    }
    refreshStorageInfo();
  };

  // Tracks imported callback
  const handleTracksImported = (newTracks: Track[]) => {
    setTracks((prev) => [...newTracks, ...prev]);
    setQueue((prev) => [...newTracks, ...prev]);
    if (!currentTrack && newTracks.length > 0) {
      playTrack(newTracks[0]);
    }
    refreshStorageInfo();
  };

  // Reset defaults
  const handleResetDefaults = async () => {
    await dbService.clearAllTracks();
    const loaded = await initializeDefaultLibrary();
    setTracks(loaded);
    setQueue(loaded);
    if (loaded.length > 0) {
      playTrack(loaded[0]);
    }
    refreshStorageInfo();
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (e.shiftKey) {
          handleNext();
        } else {
          handleSeek(currentTime + 5);
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (e.shiftKey) {
          handlePrev();
        } else {
          handleSeek(Math.max(0, currentTime - 5));
        }
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        handleVolumeChange(Math.min(1, volume + 0.05));
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        handleVolumeChange(Math.max(0, volume - 0.05));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, handleNext, handlePrev, currentTime, volume]);

  return (
    <div className="min-h-screen bg-[#070a10] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Bar with 3-Zone Contract */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenImport={() => setIsImportModalOpen(true)}
        onOpenVishInfo={() => setIsVishModalOpen(true)}
        offlineCount={tracks.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto pb-24">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
            <div className="font-display text-lg font-bold text-white">Initializing Vish Player Engine</div>
            <p className="text-xs text-slate-400 mt-1">Synthesizing offline audio library in IndexedDB...</p>
          </div>
        ) : (
          <>
            {activeTab === 'player' && (
              <NowPlayingView
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                queue={queue}
                onPlayTrack={playTrack}
                onToggleFavorite={handleToggleFavorite}
                onOpenEqualizer={() => setActiveTab('equalizer')}
                onOpenVishInfo={() => setIsVishModalOpen(true)}
                currentTime={currentTime}
              />
            )}

            {activeTab === 'library' && (
              <LibraryView
                tracks={tracks}
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                onPlayTrack={playTrack}
                onTogglePlay={togglePlay}
                onToggleFavorite={handleToggleFavorite}
                onDeleteTrack={handleDeleteTrack}
                onTracksImported={handleTracksImported}
                storageBytes={storageBytes}
              />
            )}

            {activeTab === 'equalizer' && <EqualizerView />}

            {activeTab === 'visualizer' && (
              <VisualizerView
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                onTogglePlay={togglePlay}
                onNext={handleNext}
                onPrev={handlePrev}
                currentTime={currentTime}
                duration={duration}
                onSeek={handleSeek}
              />
            )}
          </>
        )}
      </main>

      {/* Bottom Sticky Player Bar */}
      <PlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        onNext={handleNext}
        onPrev={handlePrev}
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
        volume={volume}
        onVolumeChange={handleVolumeChange}
        playbackRate={playbackRate}
        onRateChange={handleRateChange}
        repeatMode={repeatMode}
        onCycleRepeat={handleCycleRepeat}
        isShuffle={isShuffle}
        onToggleShuffle={handleToggleShuffle}
        onToggleFavorite={handleToggleFavorite}
        onOpenEqualizer={() => setActiveTab('equalizer')}
        onOpenSleepTimer={() => setIsSleepModalOpen(true)}
        sleepRemaining={sleepRemaining}
      />

      {/* Modals */}
      <VishDevelopingModal
        isOpen={isVishModalOpen}
        onClose={() => setIsVishModalOpen(false)}
        onResetDefaults={handleResetDefaults}
        offlineCount={tracks.length}
      />

      <AudioImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={handleTracksImported}
      />

      <SleepTimerModal
        isOpen={isSleepModalOpen}
        onClose={() => setIsSleepModalOpen(false)}
      />
    </div>
  );
}
