import React from 'react';
import { Upload } from 'lucide-react';

interface TopBarProps {
  activeTab: 'player' | 'library' | 'equalizer' | 'visualizer';
  setActiveTab: (tab: 'player' | 'library' | 'equalizer' | 'visualizer') => void;
  onOpenImport: () => void;
  onOpenVishInfo: () => void;
  offlineCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  onOpenImport,
  onOpenVishInfo,
  offlineCount,
}) => {
  return (
    <header className="w-full bg-[#0b0f17]/90 backdrop-blur-md border-b border-white/5 sticky top-0 z-30 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand title, single line text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('player')}
            className="text-left group flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
          >
            <span className="font-display text-xl font-bold tracking-tight text-white group-hover:text-indigo-400 transition-colors whitespace-nowrap">
              Vish Player
            </span>
          </button>
          <span className="text-xs text-slate-400 hidden sm:inline flex items-center gap-1.5 font-mono">
            <span aria-hidden="true" className="text-slate-600">/</span>
            <span className="text-slate-400">{offlineCount} offline {offlineCount === 1 ? 'track' : 'tracks'}</span>
          </span>
        </div>

        {/* Zone 2: 4-5 single-line nav links */}
        <nav className="flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('player')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'player'
                ? 'text-white border-b-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Player
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'library'
                ? 'text-white border-b-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Library
          </button>
          <button
            onClick={() => setActiveTab('equalizer')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'equalizer'
                ? 'text-white border-b-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Equalizer
          </button>
          <button
            onClick={() => setActiveTab('visualizer')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'visualizer'
                ? 'text-white border-b-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Visualizer
          </button>
          <button
            onClick={onOpenVishInfo}
            className="whitespace-nowrap shrink-0 text-indigo-400 hover:text-indigo-300 transition-colors py-1 font-medium"
          >
            Vish Developing
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenImport}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] rounded-lg transition-all shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Audio</span>
          </button>
        </div>
      </div>
    </header>
  );
};
