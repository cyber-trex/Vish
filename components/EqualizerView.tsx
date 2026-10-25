import React, { useState } from 'react';
import { Sliders, RotateCcw, Volume2, Sparkles } from 'lucide-react';
import { audioEngine, EQ_FREQUENCIES, EQ_PRESETS } from '../services/audioEngine';
import { EQPreset } from '../types/music';

interface EqualizerViewProps {
  onPresetSelect?: (preset: EQPreset) => void;
}

export const EqualizerView: React.FC<EqualizerViewProps> = () => {
  const [gains, setGains] = useState<number[]>(() => audioEngine.getEQGains());
  const [preamp, setPreamp] = useState<number>(() => audioEngine.getPreampGain());
  const [pan, setPan] = useState<number>(() => audioEngine.getPan());
  const [activePresetName, setActivePresetName] = useState<string>('Vish Signature');

  const handleBandChange = (index: number, value: number) => {
    const updated = [...gains];
    updated[index] = value;
    setGains(updated);
    audioEngine.setEQBand(index, value);
    setActivePresetName('Custom');
  };

  const handlePresetClick = (preset: EQPreset) => {
    setActivePresetName(preset.name);
    setGains([...preset.gains]);
    audioEngine.setEQPreset(preset);
  };

  const handlePreampChange = (val: number) => {
    setPreamp(val);
    audioEngine.setPreampGain(val);
  };

  const handlePanChange = (val: number) => {
    setPan(val);
    audioEngine.setPan(val);
  };

  const handleReset = () => {
    const flat = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    setGains(flat);
    setPreamp(0);
    setPan(0);
    audioEngine.setEQPreset(EQ_PRESETS[1]); // Flat
    audioEngine.setPreampGain(0);
    audioEngine.setPan(0);
    setActivePresetName('Flat');
  };

  // Build SVG path points for the dynamic frequency curve
  const svgWidth = 600;
  const svgHeight = 120;
  const points = gains.map((g, idx) => {
    const x = (idx / (gains.length - 1)) * (svgWidth - 40) + 20;
    // -12dB is bottom, +12dB is top
    const y = ((12 - g) / 24) * (svgHeight - 30) + 15;
    return `${x},${y}`;
  });

  const curvePath = `M ${points.join(' L ')}`;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h2 className="font-display text-2xl font-bold text-white">10-Band Graphic Equalizer</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Web Audio BiquadFilter DSP tuning tuned for Vish Player audio engine
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Flat</span>
        </button>
      </div>

      {/* Preset Buttons */}
      <div>
        <div className="text-xs font-semibold text-slate-400 mb-2.5">Studio & Tuning Presets</div>
        <div className="flex flex-wrap gap-2">
          {EQ_PRESETS.map((p) => {
            const isActive = activePresetName === p.name;
            return (
              <button
                key={p.name}
                onClick={() => handlePresetClick(p)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {p.name === 'Vish Signature' && <Sparkles className="w-3 h-3 inline mr-1 text-indigo-200" />}
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Response Curve */}
      <div className="bg-[#0e1320] border border-white/5 rounded-xl p-4">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-2">
          <span>Response Curve (dB / Hz)</span>
          <span className="text-indigo-400 font-semibold">{activePresetName}</span>
        </div>
        <div className="w-full h-24 relative overflow-hidden flex items-center justify-center">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full">
            {/* Grid lines */}
            <line x1="20" y1={svgHeight / 2} x2={svgWidth - 20} y2={svgHeight / 2} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
            <line x1="20" y1="15" x2={svgWidth - 20} y2="15" stroke="rgba(255,255,255,0.05)" />
            <line x1="20" y1={svgHeight - 15} x2={svgWidth - 20} y2={svgHeight - 15} stroke="rgba(255,255,255,0.05)" />

            {/* Response fill & curve */}
            <path
              d={`${curvePath} L ${svgWidth - 20},${svgHeight / 2} L 20,${svgHeight / 2} Z`}
              fill="rgba(99, 102, 241, 0.12)"
            />
            <path
              d={curvePath}
              fill="none"
              stroke="#6366f1"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Dots */}
            {points.map((pt, i) => {
              const [px, py] = pt.split(',');
              return (
                <circle
                  key={i}
                  cx={px}
                  cy={py}
                  r="3.5"
                  fill="#ffffff"
                  stroke="#4f46e5"
                  strokeWidth="2"
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* 10 Sliders */}
      <div className="bg-[#0e1320] border border-white/5 rounded-xl p-6">
        <div className="grid grid-cols-10 gap-2 sm:gap-4 items-end">
          {EQ_FREQUENCIES.map((freq, idx) => {
            const gain = gains[idx] || 0;
            const label = freq >= 1000 ? `${freq / 1000}k` : `${freq}`;

            return (
              <div key={freq} className="flex flex-col items-center gap-3">
                <span className="text-[11px] font-mono tabular-nums text-slate-300">
                  {gain > 0 ? `+${gain.toFixed(0)}` : gain.toFixed(0)}
                </span>

                <div className="relative h-44 flex items-center justify-center">
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="0.5"
                    value={gain}
                    onChange={(e) => handleBandChange(idx, parseFloat(e.target.value))}
                    aria-label={`Equalizer band ${label}Hz`}
                    className="slider-vertical cursor-pointer"
                    style={{
                      writingMode: 'vertical-lr',
                      direction: 'rtl',
                      width: '6px',
                      height: '160px',
                      accentColor: '#6366f1',
                    }}
                  />
                </div>

                <div className="text-center">
                  <span className="text-[11px] font-mono text-slate-400 font-semibold">{label}</span>
                  <span className="block text-[9px] text-slate-400">Hz</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Preamp & Stereo Balance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Preamp Gain */}
        <div className="bg-[#0e1320] border border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-white flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-indigo-400" />
              Preamp Gain
            </span>
            <span className="text-xs font-mono tabular-nums text-indigo-400 font-semibold">
              {preamp > 0 ? `+${preamp.toFixed(1)} dB` : `${preamp.toFixed(1)} dB`}
            </span>
          </div>
          <input
            type="range"
            min="-12"
            max="12"
            step="0.5"
            value={preamp}
            onChange={(e) => handlePreampChange(parseFloat(e.target.value))}
            aria-label="Preamp Gain"
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1.5">
            <span>-12 dB</span>
            <span>0 dB (Unity)</span>
            <span>+12 dB</span>
          </div>
        </div>

        {/* Stereo Balance (Pan) */}
        <div className="bg-[#0e1320] border border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-white">Stereo Balance</span>
            <span className="text-xs font-mono tabular-nums text-indigo-400 font-semibold">
              {pan === 0 ? 'Center' : pan < 0 ? `L ${(Math.abs(pan) * 100).toFixed(0)}%` : `R ${(pan * 100).toFixed(0)}%`}
            </span>
          </div>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.05"
            value={pan}
            onChange={(e) => handlePanChange(parseFloat(e.target.value))}
            aria-label="Stereo Balance"
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1.5">
            <span>100% Left</span>
            <span>Center</span>
            <span>100% Right</span>
          </div>
        </div>
      </div>
    </div>
  );
};
