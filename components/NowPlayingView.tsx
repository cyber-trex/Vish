import React, { useState } from 'react';
import { Track } from '../types/music';
import { AudioVisualizer } from './AudioVisualizer';
import {
  Heart,
  Sliders,
  ListMusic,
  Download,
  Share2,
  FileText,
  Volume2,
  Sparkles,
  HardDrive,
  Check,
  Disc3,
} from 'lucide-react';

interface NowPlayingViewProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  onPlayTrack: (track: Track) => void;
  onToggleFavorite: (id: string) => void;
  onOpenEqualizer: () => void;
  onOpenVishInfo: () => void;
  currentTime: number;
}

export const NowPlayingView: React.FC<NowPlayingViewProps> = ({
  currentTrack,
  isPlaying,
  queue,
  onPlayTrack,
  onToggleFavorite,
  onOpenEqualizer,
  onOpenVishInfo,
  currentTime,
}) => {
  const [showLyrics, setShowLyrics] = useState(false);

  if (!currentTrack) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center text-slate-400">
        <Disc3 className="w-16 h-16 text-slate-600 mx-auto mb-4 animate-spin-slow" />
        <h2 className="text-xl font-bold text-white font-display">No Track Selected</h2>
        <p className="text-xs text-slate-500 mt-1">Select a track from the library to begin playback</p>
      </div>
    );
  }

  const formatTime = (sec: number) => {
    if (!isFinite(sec) || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleDownload = () => {
    if (!currentTrack.audioBlob && !currentTrack.audioUrl) return;
    const url = currentTrack.audioBlob ? URL.createObjectURL(currentTrack.audioBlob) : currentTrack.audioUrl!;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTrack.artist} - ${currentTrack.title}.${currentTrack.format.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* 2-Column Split: Centerpiece Vinyl/Stage on Left, Queue & Lyrics on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Big Album Art & Live Spectrum */}
        <div className="lg:col-span-7 flex flex-col items-center text-center space-y-6">
          {/* Album Artwork Frame with Glow */}
          <div className="relative group w-72 h-72 sm:w-96 sm:h-96 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#0e1320]">
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover transition-transform duration-700 ${
                isPlaying ? 'scale-105' : 'scale-100'
              }`}
            />
            {/* Dark gradient scrim at base */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

            <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-emerald-400">
              <HardDrive className="w-3.5 h-3.5" />
              <span>Offline Ready</span>
            </div>

            {/* Format in corner */}
            <div className="absolute top-4 right-4 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-slate-300 uppercase">
              {currentTrack.format} Lossless
            </div>

            {/* Bottom info on image */}
            <div className="absolute bottom-4 left-4 right-4 text-left">
              <span className="text-xs text-indigo-400 font-mono block mb-0.5">{currentTrack.genre}</span>
              <h3 className="text-xl font-bold text-white font-display truncate">{currentTrack.title}</h3>
              <p className="text-sm text-slate-300 truncate">{currentTrack.artist}</p>
            </div>
          </div>

          {/* Real-time Spectrum Bar Strip */}
          <div className="w-full max-w-md h-16 bg-[#0e1320] border border-white/5 rounded-xl p-2 overflow-hidden shadow-inner">
            <AudioVisualizer mode="bars" isPlaying={isPlaying} accentColor="#6366f1" />
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onToggleFavorite(currentTrack.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                currentTrack.favorite
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  : 'bg-white/5 border-white/5 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${currentTrack.favorite ? 'fill-current' : ''}`} />
              <span>{currentTrack.favorite ? 'Favorited' : 'Favorite'}</span>
            </button>

            <button
              onClick={onOpenEqualizer}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-white/5 border border-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>EQ Tuner</span>
            </button>

            <button
              onClick={() => setShowLyrics(!showLyrics)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                showLyrics
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-white/5 border-white/5 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Lyrics</span>
            </button>

            <button
              onClick={handleDownload}
              title="Save audio file to disk"
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-white/5 border border-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Right Column: Queue & Lyrics Drawer */}
        <div className="lg:col-span-5 space-y-6">
          {/* Vish Developing Card Banner */}
          <div className="bg-gradient-to-br from-indigo-950/40 via-[#0e1320] to-[#0b0f17] border border-indigo-500/20 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono text-indigo-400 block mb-1">
                  ENGINEERED BY VISH DEVELOPING
                </span>
                <h4 className="text-sm font-semibold text-white">Pure Offline Web Audio Architecture</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Zero cloud dependency. Tracks, graphic EQ presets, and metadata persist directly on your device.
                </p>
              </div>
              <button
                onClick={onOpenVishInfo}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline shrink-0 ml-2 cursor-pointer"
              >
                View Specs →
              </button>
            </div>
          </div>

          {/* Lyrics View or Up Next Queue */}
          {showLyrics && currentTrack.lyrics && currentTrack.lyrics.length > 0 ? (
            <div className="bg-[#0e1320] border border-white/5 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                <span className="text-xs font-semibold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  Synchronized Lyrics & Notes
                </span>
                <button
                  onClick={() => setShowLyrics(false)}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Close
                </button>
              </div>
              <div className="space-y-3 font-mono text-xs max-h-80 overflow-y-auto pr-2">
                {currentTrack.lyrics.map((line, i) => (
                  <p key={i} className="text-slate-300 leading-relaxed hover:text-indigo-400 transition-colors">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-[#0e1320] border border-white/5 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                <span className="text-xs font-semibold text-white flex items-center gap-2">
                  <ListMusic className="w-4 h-4 text-indigo-400" />
                  Up Next in Queue ({queue.length})
                </span>
                <span className="text-xs font-mono text-slate-400">Offline Playlist</span>
              </div>

              <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                {queue.map((track, i) => {
                  const isCurrent = currentTrack.id === track.id;
                  return (
                    <div
                      key={track.id}
                      onClick={() => onPlayTrack(track)}
                      className={`flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer group ${
                        isCurrent
                          ? 'bg-indigo-600/20 border border-indigo-500/30'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xs font-mono text-slate-400 w-4 text-center shrink-0">
                          {i + 1}
                        </span>
                        <img
                          src={track.coverUrl}
                          alt={track.title}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded object-cover border border-white/10 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className={`text-xs font-semibold truncate ${isCurrent ? 'text-indigo-400' : 'text-slate-200'}`}>
                            {track.title}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">{track.artist}</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 tabular-nums shrink-0 ml-2">
                        {formatTime(track.duration)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
