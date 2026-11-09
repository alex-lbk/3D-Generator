import React from 'react';
import {
  Box,
  Layers,
  Crosshair,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { DEFAULT_PRESETS } from '../data/presets';
import { CalculatedTelemetry, HopUpPreset, ViewTab } from '../types/cad';

interface HeaderBarProps {
  activeTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  telemetry: CalculatedTelemetry;
  onOpenPresets: () => void;
  onApplyPreset: (preset: HopUpPreset) => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  activeTab,
  onSelectTab,
  telemetry,
  onOpenPresets,
  onApplyPreset,
}) => {
  return (
    <header className="h-16 border-b border-zinc-800 bg-zinc-950 px-4 md:px-6 flex items-center justify-between select-none z-30 shrink-0">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-950/50 border border-cyan-400/30">
          <Box className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-mono font-bold tracking-wider text-zinc-100 uppercase">
              M4 HOP-UP EINSTELLRAD
            </h1>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 font-bold">
              CAD v2.0
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 font-mono hidden sm:block">
            Parametrischer 3D-Generator mit Archimedes-Spiralnut
          </p>
        </div>
      </div>

      {/* Center: Viewport Mode Switcher Tabs (3D-Viewer / 2D / Querschnitt) */}
      <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 shadow-inner">
        <button
          onClick={() => onSelectTab('3d')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
            activeTab === '3d'
              ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 shadow'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span>3D-Vorschau</span>
        </button>

        <button
          onClick={() => onSelectTab('2d')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
            activeTab === '2d'
              ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 shadow'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span>2D-Draufsicht</span>
        </button>

        <button
          onClick={() => onSelectTab('crossSection')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
            activeTab === 'crossSection'
              ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 shadow'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Querschnitt</span>
        </button>
      </div>

      {/* Right: Quick Presets */}
      <div className="flex items-center gap-2">
        <div className="hidden xl:flex items-center gap-1.5 pr-2 border-r border-zinc-800 text-[11px] font-mono text-zinc-400">
          <span className="text-zinc-500 mr-1">Presets:</span>
          {DEFAULT_PRESETS.slice(0, 2).map((p) => (
            <button
              key={p.id}
              onClick={() => onApplyPreset(p)}
              className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-cyan-300 transition-colors"
            >
              {p.id === 'm4_standard' ? 'Standard 1.25x' : 'CNC 1.5x'}
            </button>
          ))}
        </div>

        <button
          onClick={onOpenPresets}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 border border-zinc-800 text-xs font-mono transition-colors"
        >
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>Presets...</span>
        </button>
      </div>
    </header>
  );
};
