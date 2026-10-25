import React, { useState, useEffect } from 'react';
import { X, Moon, Clock, Check, VolumeX } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';

interface SleepTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SleepTimerModal: React.FC<SleepTimerModalProps> = ({ isOpen, onClose }) => {
  const [remainingSec, setRemainingSec] = useState<number | null>(null);
  const [customMin, setCustomMin] = useState(30);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setRemainingSec(audioEngine.getRemainingSleepSeconds());
    }, 1000);

    setRemainingSec(audioEngine.getRemainingSleepSeconds());

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStart = (mins: number) => {
    audioEngine.startSleepTimer(mins, () => {
      setRemainingSec(null);
    });
    setRemainingSec(mins * 60);
  };

  const handleCancel = () => {
    audioEngine.clearSleepTimer();
    setRemainingSec(null);
  };

  const formatRemaining = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const presets = [15, 30, 45, 60];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sleep-timer-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
    >
      <div className="bg-[#101522] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-slate-200">
        <button
          onClick={onClose}
          aria-label="Close sleep timer"
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <Moon className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 id="sleep-timer-title" className="font-display text-lg font-bold text-white">
              Sleep Timer
            </h2>
            <p className="text-xs text-slate-400">Soft fade-out playback shutdown</p>
          </div>
        </div>

        {/* Active Timer Banner */}
        {remainingSec !== null && remainingSec > 0 ? (
          <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-4 mb-6 text-center">
            <div className="text-xs text-indigo-300 font-medium">Timer is running</div>
            <div className="font-mono text-3xl font-bold text-white my-1 tabular-nums">
              {formatRemaining(remainingSec)}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5 mt-2">
              <VolumeX className="w-3.5 h-3.5 text-indigo-400" />
              <span>Volume will smoothly fade over the last 30s</span>
            </div>

            <button
              onClick={handleCancel}
              className="mt-4 px-4 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-950/30 border border-rose-800/40 rounded-lg transition-colors cursor-pointer"
            >
              Cancel Sleep Timer
            </button>
          </div>
        ) : null}

        {/* Preset Buttons */}
        <div className="space-y-3 mb-6">
          <div className="text-xs font-semibold text-slate-400">Quick Duration</div>
          <div className="grid grid-cols-4 gap-2">
            {presets.map((min) => (
              <button
                key={min}
                onClick={() => handleStart(min)}
                className="py-2.5 px-3 bg-white/5 hover:bg-indigo-600 hover:text-white text-slate-300 rounded-lg text-xs font-medium transition-all border border-white/5 cursor-pointer"
              >
                {min} min
              </button>
            ))}
          </div>
        </div>

        {/* Custom duration */}
        <div className="bg-[#0b0f17] border border-white/5 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Custom Duration</span>
            <span className="font-mono text-white font-semibold">{customMin} minutes</span>
          </div>
          <input
            type="range"
            min="5"
            max="120"
            step="5"
            value={customMin}
            onChange={(e) => setCustomMin(parseInt(e.target.value, 10))}
            aria-label="Custom timer minutes"
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <button
            onClick={() => handleStart(customMin)}
            className="w-full mt-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Start {customMin}-Minute Timer
          </button>
        </div>

        <div className="text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-white/5 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
