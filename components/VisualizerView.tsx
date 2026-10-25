import React, { useState } from 'react';
import { AudioVisualizer } from './AudioVisualizer';
import { VisualizerMode, Track } from '../types/music';
import { Play, Pause, SkipForward, SkipBack, Maximize2, Minimize2, Radio } from 'lucide-react';

interface VisualizerViewProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
}

export const VisualizerView: React.FC<VisualizerViewProps> = ({
  currentTrack,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrev,
  currentTime,
  duration,
  onSeek,
}) => {
  const [mode, setMode] = useState<VisualizerMode>('bars');
  const [accent, setAccent] = useState<string>('#6366f1');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const colors = [
    { label: 'Indigo', value: '#6366f1' },
    { label: 'Cyan', value: '#06b6d4' },
    { label: 'Emerald', value: '#10b981' },
    { label: 'Magenta', value: '#d946ef' },
    { label: 'Amber', value: '#f59e0b' },
  ];

  const formatTime = (sec: number) => {
    if (!isFinite(sec) || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div className={`relative w-full h-[calc(100vh-170px)] flex flex-col justify-between overflow-hidden bg-[#070a10] rounded-2xl border border-white/5`}>
      {/* Top Controls Toolbar */}
      <div className="z-10 p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-b from-[#0b0f17]/80 to-transparent backdrop-blur-sm">
        {/* Modes */}
        <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-xl border border-white/5">
          {(['bars', 'wave', 'circle', 'mandala'] as VisualizerMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors cursor-pointer ${
                mode === m ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Accent Colors & Fullscreen */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white/5 p-1.5 rounded-xl border border-white/5">
            {colors.map((c) => (
              <button
                key={c.value}
                onClick={() => setAccent(c.value)}
                title={c.label}
                aria-label={`Visualizer accent color ${c.label}`}
                className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${
                  accent === c.value ? 'scale-125 ring-2 ring-white/50' : 'opacity-60 hover:opacity-100'
                }`}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>

          <button
            onClick={toggleFullscreen}
            aria-label="Toggle Fullscreen"
            className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-xl border border-white/5 transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Visualizer Canvas */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <AudioVisualizer mode={mode} isPlaying={isPlaying} accentColor={accent} />
      </div>

      {/* Bottom Track Controls Overlay */}
      <div className="z-10 p-6 bg-gradient-to-t from-[#070a10]/90 via-[#070a10]/50 to-transparent backdrop-blur-sm">
        {currentTrack && (
          <div className="max-w-xl mx-auto flex flex-col items-center text-center space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-lg object-cover border border-white/10 shadow-lg"
              />
              <div className="text-left">
                <div className="font-semibold text-white text-sm truncate max-w-xs">{currentTrack.title}</div>
                <div className="text-xs text-slate-400 truncate">{currentTrack.artist}</div>
              </div>
            </div>

            {/* Scrubber */}
            <div className="w-full flex items-center gap-3 text-xs font-mono text-slate-400">
              <span className="tabular-nums">{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={(e) => onSeek(parseFloat(e.target.value))}
                aria-label="Seek timeline"
                className="flex-1 h-1 bg-white/10 rounded appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="tabular-nums">{formatTime(duration)}</span>
            </div>

            {/* Playback buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={onPrev}
                aria-label="Previous track"
                className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                onClick={onTogglePlay}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>
              <button
                onClick={onNext}
                aria-label="Next track"
                className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
