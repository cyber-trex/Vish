import React, { useRef, useState } from 'react';
import { X, Upload, HardDrive, FileAudio, CheckCircle2, AlertCircle } from 'lucide-react';
import { Track } from '../types/music';
import { parseAudioFile } from '../utils/audioImporter';

interface AudioImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (newTracks: Track[]) => void;
}

export const AudioImportModal: React.FC<AudioImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    setErrorMessage(null);
    setImportedCount(null);

    const imported: Track[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const track = await parseAudioFile(file);
        imported.push(track);
      } catch (err) {
        console.error('Failed to parse:', file.name, err);
      }
    }

    setIsProcessing(false);

    if (imported.length > 0) {
      setImportedCount(imported.length);
      onImportComplete(imported);
      setTimeout(() => {
        onClose();
        setImportedCount(null);
      }, 1500);
    } else {
      setErrorMessage('No valid audio files could be processed. Please check the file format.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="audio-import-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
    >
      <div className="bg-[#101522] border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-slate-200">
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <Upload className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 id="audio-import-title" className="font-display text-lg font-bold text-white">
              Import Local Audio
            </h2>
            <p className="text-xs text-slate-400">Offline playback powered by Vish Developing</p>
          </div>
        </div>

        {/* Drop Box */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="audio/*,.mp3,.wav,.ogg,.flac,.m4a"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-white/10 hover:border-indigo-500/50 rounded-xl p-8 text-center bg-[#0b0f17] transition-all cursor-pointer mb-5"
        >
          <FileAudio className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
          <div className="text-sm font-semibold text-white">
            {isProcessing ? 'Processing Audio Files...' : 'Select or Drop Audio Files'}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Choose single tracks or multiple songs from your computer or phone
          </div>
        </div>

        {importedCount !== null && (
          <div className="flex items-center gap-2 p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs mb-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Successfully imported {importedCount} offline {importedCount === 1 ? 'track' : 'tracks'}!</span>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-center gap-2 p-3 bg-rose-950/40 border border-rose-500/30 text-rose-300 rounded-lg text-xs mb-4">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Info */}
        <div className="bg-[#0b0f17] border border-white/5 rounded-xl p-4 text-xs text-slate-400 space-y-2 mb-6">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
            <span>Private & 100% Offline</span>
          </div>
          <p>
            Your music is stored inside your browser's private IndexedDB cache. No files are uploaded to any external server or cloud, and playback works seamlessly even without an internet connection.
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-white/5 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            Browse Files
          </button>
        </div>
      </div>
    </div>
  );
};
