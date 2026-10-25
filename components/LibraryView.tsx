import React, { useState, useRef } from 'react';
import { Track } from '../types/music';
import {
  Play,
  Pause,
  Heart,
  Trash2,
  Download,
  Upload,
  Search,
  HardDrive,
  Music,
  Sparkles,
  FileAudio,
} from 'lucide-react';
import { parseAudioFile } from '../utils/audioImporter';

interface LibraryViewProps {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
  onTogglePlay: () => void;
  onToggleFavorite: (id: string) => void;
  onDeleteTrack: (id: string) => void;
  onTracksImported: (newTracks: Track[]) => void;
  storageBytes: number;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  tracks,
  currentTrack,
  isPlaying,
  onPlayTrack,
  onTogglePlay,
  onToggleFavorite,
  onDeleteTrack,
  onTracksImported,
  storageBytes,
}) => {
  const [filter, setFilter] = useState<'all' | 'offline' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formatTime = (sec: number) => {
    if (!isFinite(sec) || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return '—';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${mb.toFixed(1)} MB`;
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsImporting(true);
    const imported: Track[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('audio/') || /\.(mp3|wav|ogg|flac|m4a|aac)$/i.test(file.name)) {
        try {
          const track = await parseAudioFile(file);
          imported.push(track);
        } catch (err) {
          console.error('Failed to import file:', file.name, err);
        }
      }
    }

    if (imported.length > 0) {
      onTracksImported(imported);
    }
    setIsImporting(false);
  };

  const handleDownload = (track: Track, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!track.audioBlob && !track.audioUrl) return;
    const url = track.audioBlob ? URL.createObjectURL(track.audioBlob) : track.audioUrl!;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${track.artist} - ${track.title}.${track.format.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const filteredTracks = tracks.filter((t) => {
    if (filter === 'favorites' && !t.favorite) return false;
    if (filter === 'offline' && !t.isOffline) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(query);
      const matchArtist = t.artist.toLowerCase().includes(query);
      const matchGenre = t.genre.toLowerCase().includes(query);
      return matchTitle || matchArtist || matchGenre;
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header & Storage status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Music Library</h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>{tracks.length} tracks total</span>
            <span aria-hidden="true">·</span>
            <span>{formatBytes(storageBytes)} cached locally</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400">IndexedDB offline ready</span>
          </div>
        </div>

        {/* Import Trigger */}
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="audio/*,.mp3,.wav,.ogg,.flac,.m4a"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>{isImporting ? 'Processing Audio...' : 'Import Audio Files'}</span>
          </button>
        </div>
      </div>

      {/* Drag & Drop Target Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-indigo-500 bg-indigo-950/20'
            : 'border-white/10 hover:border-white/20 bg-[#0e1320]/50'
        }`}
      >
        <div className="flex flex-col items-center gap-2">
          <FileAudio className="w-8 h-8 text-indigo-400" />
          <div className="text-sm font-semibold text-white">
            {isDragging ? 'Drop audio files now' : 'Drag & drop your local songs here'}
          </div>
          <div className="text-xs text-slate-400">
            Supports MP3, WAV, FLAC, OGG, M4A · Stored 100% offline in IndexedDB
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg border border-white/5 self-start sm:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              filter === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Tracks ({tracks.length})
          </button>
          <button
            onClick={() => setFilter('offline')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              filter === 'offline' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Offline Cached ({tracks.filter((t) => t.isOffline).length})
          </button>
          <button
            onClick={() => setFilter('favorites')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              filter === 'favorites' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Favorites ({tracks.filter((t) => t.favorite).length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search title, artist, genre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/5 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Track List Table */}
      <div className="bg-[#0e1320] border border-white/5 rounded-xl overflow-hidden">
        {filteredTracks.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Music className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <div className="text-base font-semibold text-slate-300">No tracks found</div>
            <div className="text-xs text-slate-500 mt-1">
              {searchQuery ? 'Try clearing your search query' : 'Import your audio files or re-synthesize default tracks'}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredTracks.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id;

              return (
                <div
                  key={track.id}
                  onClick={() => {
                    if (isCurrent) {
                      onTogglePlay();
                    } else {
                      onPlayTrack(track);
                    }
                  }}
                  className={`flex items-center justify-between p-3.5 sm:px-5 hover:bg-white/[0.03] transition-colors cursor-pointer group ${
                    isCurrent ? 'bg-indigo-950/20' : ''
                  }`}
                >
                  {/* Left: Index / Play Icon & Thumbnail & Info */}
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <span className="w-6 text-center text-xs font-mono text-slate-400 tabular-nums shrink-0">
                      {isCurrent && isPlaying ? (
                        <div className="flex items-center justify-center gap-0.5 h-3">
                          <span className="w-0.5 h-3 bg-indigo-400 animate-pulse" />
                          <span className="w-0.5 h-2 bg-indigo-400 animate-pulse delay-75" />
                          <span className="w-0.5 h-3 bg-indigo-400 animate-pulse delay-150" />
                        </div>
                      ) : (
                        <span className="group-hover:hidden">{idx + 1}</span>
                      )}
                      <Play className="w-3.5 h-3.5 text-white fill-current hidden group-hover:block mx-auto" />
                    </span>

                    {/* Cover Art */}
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-md object-cover border border-white/10 shrink-0"
                    />

                    {/* Title & Artist */}
                    <div className="min-w-0">
                      <div
                        className={`text-sm font-semibold truncate ${
                          isCurrent ? 'text-indigo-400' : 'text-white'
                        }`}
                      >
                        {track.title}
                      </div>
                      <div className="text-xs text-slate-400 truncate flex items-center gap-1.5">
                        <span>{track.artist}</span>
                        <span aria-hidden="true">·</span>
                        <span>{track.genre}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Meta & Actions */}
                  <div className="flex items-center gap-4 shrink-0 text-xs font-mono text-slate-400">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/5 uppercase hidden sm:inline">
                      {track.format}
                    </span>

                    <span className="text-slate-400 tabular-nums hidden sm:inline">
                      {formatBytes(track.sizeBytes)}
                    </span>

                    <span className="text-slate-300 tabular-nums">
                      {formatTime(track.duration)}
                    </span>

                    {/* Favorite Heart */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(track.id);
                      }}
                      aria-label={track.favorite ? 'Remove from favorites' : 'Add to favorites'}
                      className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          track.favorite ? 'text-rose-500 fill-rose-500' : ''
                        }`}
                      />
                    </button>

                    {/* Download */}
                    <button
                      onClick={(e) => handleDownload(track, e)}
                      title="Download audio file"
                      aria-label="Download audio file"
                      className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer hidden sm:block"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTrack(track.id);
                      }}
                      title="Delete from offline storage"
                      aria-label="Delete track"
                      className="p-1.5 text-slate-400 hover:text-red-400 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
