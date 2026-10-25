import React, { useState, useEffect } from 'react';
import { X, Code2, Cpu, HardDrive, Sparkles, Check, Download, RefreshCw, Layers } from 'lucide-react';
import { dbService } from '../services/db';
import { audioEngine } from '../services/audioEngine';
import { AudioEngineStats } from '../types/music';

interface VishDevelopingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetDefaults: () => Promise<void>;
  offlineCount: number;
}

export const VishDevelopingModal: React.FC<VishDevelopingModalProps> = ({
  isOpen,
  onClose,
  onResetDefaults,
  offlineCount,
}) => {
  const [stats, setStats] = useState<AudioEngineStats | null>(null);
  const [storageInfo, setStorageInfo] = useState<{ usedBytes: number; quotaBytes: number; count: number }>({
    usedBytes: 0,
    quotaBytes: 0,
    count: 0,
  });
  const [copied, setCopied] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStats(audioEngine.getStats());
      dbService.getStorageEstimate().then(setStorageInfo);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleCopyManifest = () => {
    const manifest = {
      project: 'Vish Player',
      developer: 'Vish',
      studio: 'Vish Developing',
      version: '2.4.0-offline',
      engine: 'Web Audio API 32-bit Float Pipeline',
      offlinePersistence: 'IndexedDB (VishPlayerDB)',
      stats: stats,
      storageUsed: formatBytes(storageInfo.usedBytes),
    };
    navigator.clipboard.writeText(JSON.stringify(manifest, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await onResetDefaults();
      const info = await dbService.getStorageEstimate();
      setStorageInfo(info);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="vish-developing-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
    >
      <div className="bg-[#101522] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative text-slate-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <Code2 className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 id="vish-developing-title" className="font-display text-2xl font-bold text-white">
                Vish Developing
              </h2>
              <span className="text-xs font-mono text-indigo-400 bg-indigo-950/60 border border-indigo-800/40 px-2 py-0.5 rounded">
                v2.4 Audio Core
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Engineering specifications & developer profile for Vish Player
            </p>
          </div>
        </div>

        {/* Lead Engineer & Mission */}
        <div className="bg-[#0b0f17] border border-white/5 rounded-xl p-5 mb-6">
          <div className="text-xs text-slate-400 mb-1">Developer & Lead Architect</div>
          <div className="text-base font-semibold text-white">Vish</div>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Vish Developing builds uncompromising, zero-cloud audio software designed for true offline resilience.
            Vish Player operates entirely within your browser sandbox: all audio decoding, 10-band equalization,
            procedural synthesis, and library files stay stored locally on your device in IndexedDB.
          </p>
        </div>

        {/* Technical Architecture Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-[#0b0f17] border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-semibold text-white">DSP Audio Pipeline</span>
            </div>
            <ul className="text-xs text-slate-400 space-y-1.5">
              <li>• 10-Band BiquadFilter Graphic EQ (-12dB to +12dB)</li>
              <li>• Dynamics Compressor mastering limiter</li>
              <li>• Stereo Panner & Preamp gain staging</li>
              <li>• 2048 FFT AnalyserNode (60fps canvas renderer)</li>
            </ul>
          </div>

          <div className="bg-[#0b0f17] border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <HardDrive className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-semibold text-white">Offline Storage Engine</span>
            </div>
            <ul className="text-xs text-slate-400 space-y-1.5">
              <li>• Zero cloud requirement, 100% offline playback</li>
              <li>• Local IndexedDB Blob persistence (VishPlayerDB)</li>
              <li>• ID3 frame parser & custom procedural artwork</li>
              <li>• Drag & drop importer for MP3, WAV, FLAC, OGG</li>
            </ul>
          </div>
        </div>

        {/* Live Audio Graph Telemetry */}
        <div className="bg-[#0b0f17] border border-white/5 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Audio Graph & Storage Telemetry
            </span>
            <span className="text-xs font-mono text-emerald-400">Offline Active</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-[#121826] p-2.5 rounded-lg border border-white/5">
              <span className="text-slate-400 block text-[11px]">Sample Rate</span>
              <span className="font-mono text-slate-200 font-semibold">{stats?.sampleRate || 44100} Hz</span>
            </div>
            <div className="bg-[#121826] p-2.5 rounded-lg border border-white/5">
              <span className="text-slate-400 block text-[11px]">Audio State</span>
              <span className="font-mono text-slate-200 capitalize font-semibold">{stats?.state || 'Ready'}</span>
            </div>
            <div className="bg-[#121826] p-2.5 rounded-lg border border-white/5">
              <span className="text-slate-400 block text-[11px]">Cached Tracks</span>
              <span className="font-mono text-slate-200 font-semibold">{storageInfo.count || offlineCount}</span>
            </div>
            <div className="bg-[#121826] p-2.5 rounded-lg border border-white/5">
              <span className="text-slate-400 block text-[11px]">Local Disk Used</span>
              <span className="font-mono text-slate-200 font-semibold">{formatBytes(storageInfo.usedBytes)}</span>
            </div>
          </div>
        </div>

        {/* Developer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
          <button
            onClick={handleReset}
            disabled={isResetting}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'Synthesizing...' : 'Re-synthesize Default Library'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyManifest}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-950/50 hover:bg-indigo-900/50 border border-indigo-800/40 rounded-lg transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Info' : 'Copy Dev Specs'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
