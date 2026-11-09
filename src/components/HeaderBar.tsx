import React from 'react';
import {
  Box,
  Layers,
  Crosshair,
  Sliders,
  BookOpen,
  Shield,
  Info,
  MessageSquare,
  Lock,
} from 'lucide-react';
import { DEFAULT_PRESETS } from '../data/presets';
import { CalculatedTelemetry, HopUpPreset, ViewTab } from '../types/cad';
import { AppSection } from '../types/navigation';

interface HeaderBarProps {
  currentSection: AppSection;
  onSelectSection: (section: AppSection) => void;
  activeTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  telemetry: CalculatedTelemetry;
  onOpenPresets: () => void;
  onApplyPreset: (preset: HopUpPreset) => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentSection,
  onSelectSection,
  activeTab,
  onSelectTab,
  telemetry,
  onOpenPresets,
  onApplyPreset,
}) => {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950 px-4 md:px-6 select-none z-30 shrink-0">
      {/* Top Bar: Brand, Navigation Tabs, and Quick Presets */}
      <div className="h-16 flex items-center justify-between gap-4">
        {/* Brand & Title */}
        <div
          className="flex items-center gap-3 cursor-pointer shrink-0"
          onClick={() => onSelectSection('generator')}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-950/50 border border-cyan-400/30">
            <Box className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-mono font-bold tracking-wider text-zinc-100 uppercase">
                M4 HOP-UP GENERATOR
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 font-bold">
                v2.0.0
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono hidden sm:block">
              Parametrisches Einstellrad mit Archimedes-Spiralnut
            </p>
          </div>
        </div>

        {/* Primary Navigation System */}
        <nav className="flex items-center gap-1 bg-zinc-900/80 border border-zinc-800 rounded-xl p-1 overflow-x-auto max-w-xl">
          <button
            onClick={() => onSelectSection('generator')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
              currentSection === 'generator'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Generator</span>
          </button>

          <button
            onClick={() => onSelectSection('usage')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
              currentSection === 'usage'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Anleitung</span>
          </button>

          <button
            onClick={() => onSelectSection('license')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
              currentSection === 'license'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Lizenz</span>
          </button>

          <button
            onClick={() => onSelectSection('about')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
              currentSection === 'about'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Über</span>
          </button>

          <button
            onClick={() => onSelectSection('feedback')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
              currentSection === 'feedback'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Feedback</span>
          </button>

          <button
            onClick={() => onSelectSection('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
              currentSection === 'admin'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </nav>

        {/* Right: Presets & Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {currentSection === 'generator' && (
            <>
              <div className="hidden xl:flex items-center gap-1.5 pr-2 border-r border-zinc-800 text-[11px] font-mono text-zinc-400">
                <span className="text-zinc-500 mr-1">Presets:</span>
                {DEFAULT_PRESETS.slice(0, 2).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onApplyPreset(p)}
                    className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    {p.id === 'm4_standard' ? 'Standard 1.25x' : 'CNC 1.5x'}
                  </button>
                ))}
              </div>

              <button
                onClick={onOpenPresets}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 border border-zinc-800 text-xs font-mono transition-colors cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Presets...</span>
              </button>
            </>
          )}

          {currentSection !== 'generator' && (
            <button
              onClick={() => onSelectSection('generator')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-colors cursor-pointer shadow"
            >
              <Box className="w-3.5 h-3.5" />
              <span>Zum Generator</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-bar for Generator Mode: View Mode Switches (3D, 2D, Cross-section) */}
      {currentSection === 'generator' && (
        <div className="h-10 border-t border-zinc-900/80 flex items-center justify-between text-xs font-mono text-zinc-400">
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-zinc-500 mr-2 uppercase tracking-wider font-bold">
              Ansicht:
            </span>
            <button
              onClick={() => onSelectTab('3d')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] transition-all cursor-pointer ${
                activeTab === '3d'
                  ? 'bg-zinc-800 text-cyan-300 font-bold border border-zinc-700'
                  : 'hover:text-zinc-200'
              }`}
            >
              <Box className="w-3 h-3" />
              <span>3D-Orbit</span>
            </button>

            <button
              onClick={() => onSelectTab('2d')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] transition-all cursor-pointer ${
                activeTab === '2d'
                  ? 'bg-zinc-800 text-cyan-300 font-bold border border-zinc-700'
                  : 'hover:text-zinc-200'
              }`}
            >
              <Crosshair className="w-3 h-3" />
              <span>2D-Plan</span>
            </button>

            <button
              onClick={() => onSelectTab('crossSection')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] transition-all cursor-pointer ${
                activeTab === 'crossSection'
                  ? 'bg-zinc-800 text-cyan-300 font-bold border border-zinc-700'
                  : 'hover:text-zinc-200'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Querschnitt (Z-Achse)</span>
            </button>
          </div>

          {(() => {
            const minWall = Math.min(
              telemetry.wallToInnerHole,
              telemetry.wallToOuterRim,
              telemetry.minWallBetweenTurns !== null ? telemetry.minWallBetweenTurns : Infinity
            );
            return (
              <div className="hidden sm:flex items-center gap-3 text-[11px] text-zinc-500 font-mono">
                <span>
                  Wandstärke min:{' '}
                  <strong
                    className={
                      minWall < 0.8
                        ? 'text-rose-400'
                        : minWall < 1.2
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }
                  >
                    {minWall.toFixed(2)} mm
                  </strong>
                </span>
                <span>
                  Restboden:{' '}
                  <strong
                    className={
                      telemetry.remainingFloorThickness < 0.8
                        ? 'text-rose-400'
                        : telemetry.remainingFloorThickness < 1.2
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }
                  >
                    {telemetry.remainingFloorThickness.toFixed(2)} mm
                  </strong>
                </span>
              </div>
            );
          })()}
        </div>
      )}
    </header>
  );
};
