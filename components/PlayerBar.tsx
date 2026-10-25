import React, { useState } from 'react';
import { Track, RepeatMode } from '../types/music';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Volume1,
  Heart,
  Sliders,
  Moon,
  Gauge,
} from 'lucide-react';

interface PlayerBarProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  playbackRate: number;
  onRateChange: (rate: number) => void;
  repeatMode: RepeatMode;
  onCycleRepeat: () => void;
  isShuffle: boolean;
  onToggleShuffle: () => void;
  onToggleFavorite: (id: string) => void;
  onOpenEqualizer: () => void;
  onOpenSleepTimer: () => void;
  sleepRemaining: number | null;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({
  currentTrack,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrev,
  currentTime,
  duration,
  onSeek,
  volume,
  onVolumeChange,
  playbackRate,
  onRateChange,
  repeatMode,
  onCycleRepeat,
  isShuffle,
  onToggleShuffle,
  onToggleFavorite,
  onOpenEqualizer,
  onOpenSleepTimer,
  sleepRemaining,
}) => {
  const [prevVolume, setPrevVolume] = useState(0.8);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const formatTime = (sec: number) => {
    if (!isFinite(sec) || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleMuteToggle = () => {
    if (volume > 0) {
      setPrevVolume(volume);
      onVolumeChange(0);
    } else {
      onVolumeChange(prevVolume || 0.8);
    }
  };

  const speedOptions = [0.75, 1.0, 1.25, 1.5, 2.0];

  return (
    <footer className="w-full bg-[#0b0f17]/95 backdrop-blur-xl border-t border-white/5 sticky bottom-0 z-30 px-4 sm:px-6 py-2.5">
      {/* Top Scrubber Slider Bar */}
      <div className="max-w-7xl mx-auto flex items-center gap-3 text-xs font-mono text-slate-400 mb-2">
        <span className="tabular-nums w-10 text-right shrink-0">{formatTime(currentTime)}</span>
        <div className="relative flex-1 flex items-center group">
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.5"
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            aria-label="Seek progress"
            className="w-full h-1 group-hover:h-2 bg-white/10 rounded appearance-none cursor-pointer accent-indigo-500 transition-all"
          />
        </div>
        <span className="tabular-nums w-10 text-left shrink-0">{formatTime(duration)}</span>
      </div>

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Track Information */}
        <div className="flex items-center gap-3 min-w-0 w-1/4">
          {currentTrack ? (
            <>
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                referrerPolicy="no-referrer"
                className="w-11 h-11 rounded-lg object-cover border border-white/10 shrink-0"
              />
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-semibold text-white truncate">
                  {currentTrack.title}
                </div>
                <div className="text-[11px] text-slate-400 truncate">{currentTrack.artist}</div>
              </div>
              <button
                onClick={() => onToggleFavorite(currentTrack.id)}
                aria-label={currentTrack.favorite ? 'Remove from favorites' : 'Add to favorites'}
                className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer shrink-0 ml-1"
              >
                <Heart
                  className={`w-4 h-4 ${
                    currentTrack.favorite ? 'text-rose-500 fill-rose-500' : ''
                  }`}
                />
              </button>
            </>
          ) : (
            <div className="text-xs text-slate-500 italic">No audio loaded</div>
          )}
        </div>

        {/* Center: Playback Controls */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Shuffle */}
          <button
            onClick={onToggleShuffle}
            title={isShuffle ? 'Shuffle on' : 'Shuffle off'}
            aria-label={isShuffle ? 'Shuffle enabled' : 'Shuffle disabled'}
            className={`p-2 transition-colors cursor-pointer hidden sm:block ${
              isShuffle ? 'text-indigo-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          {/* 10s Skip Back */}
          <button
            onClick={() => onSeek(Math.max(0, currentTime - 10))}
            title="Rewind 10s"
            aria-label="Rewind 10 seconds"
            className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Previous */}
          <button
            onClick={onPrev}
            title="Previous track"
            aria-label="Previous track"
            className="p-2 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          {/* Main Play / Pause Button */}
          <button
            onClick={onTogglePlay}
            disabled={!currentTrack}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="p-3 bg-white text-slate-950 rounded-full hover:bg-slate-200 active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-40"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={onNext}
            title="Next track"
            aria-label="Next track"
            className="p-2 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          {/* 10s Skip Forward */}
          <button
            onClick={() => onSeek(Math.min(duration, currentTime + 10))}
            title="Fast forward 10s"
            aria-label="Fast forward 10 seconds"
            className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Repeat */}
          <button
            onClick={onCycleRepeat}
            title={`Repeat mode: ${repeatMode}`}
            aria-label={`Repeat mode: ${repeatMode}`}
            className={`p-2 transition-colors cursor-pointer hidden sm:block ${
              repeatMode !== 'off' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </button>
        </div>

        {/* Right: Sound, EQ, Speed & Volume */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 w-1/4 shrink-0">
          {/* Speed Selector */}
          <div className="relative">
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              title="Playback speed"
              className="px-2 py-1 text-[11px] font-mono text-slate-300 bg-white/5 hover:bg-white/10 rounded border border-white/5 transition-colors cursor-pointer hidden md:flex items-center gap-1"
            >
              <Gauge className="w-3 h-3 text-indigo-400" />
              <span>{playbackRate}x</span>
            </button>

            {showSpeedMenu && (
              <div className="absolute bottom-full mb-2 right-0 bg-[#101522] border border-white/10 rounded-lg p-1.5 shadow-xl space-y-1 z-50">
                {speedOptions.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      onRateChange(s);
                      setShowSpeedMenu(false);
                    }}
                    className={`block w-full text-left px-3 py-1 text-xs font-mono rounded ${
                      playbackRate === s ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Equalizer */}
          <button
            onClick={onOpenEqualizer}
            title="Open Equalizer"
            aria-label="Equalizer"
            className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer hidden sm:block"
          >
            <Sliders className="w-4 h-4 text-indigo-400" />
          </button>

          {/* Sleep Timer */}
          <button
            onClick={onOpenSleepTimer}
            title={sleepRemaining ? `Sleep timer: ${Math.round(sleepRemaining / 60)}m` : 'Sleep timer'}
            aria-label="Sleep timer"
            className={`p-2 transition-colors cursor-pointer relative ${
              sleepRemaining ? 'text-indigo-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Moon className="w-4 h-4" />
            {sleepRemaining ? (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-indigo-500" />
            ) : null}
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-1.5 hidden lg:flex">
            <button
              onClick={handleMuteToggle}
              aria-label={volume === 0 ? 'Unmute' : 'Mute'}
              className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : volume < 0.5 ? (
                <Volume1 className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              aria-label="Volume level"
              className="w-16 h-1 bg-white/10 rounded appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};
