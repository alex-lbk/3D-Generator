import React from 'react';
import {
  Download,
  FileDown,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { CalculatedTelemetry, SpiralParameters, WheelParameters } from '../types/cad';

interface BottomActionBarProps {
  wheel: WheelParameters;
  spiral: SpiralParameters;
  telemetry: CalculatedTelemetry;
  onExportSTL: () => void;
  onExport3MF: () => void;
  onReset: () => void;
  isExporting: boolean;
}

export const BottomActionBar: React.FC<BottomActionBarProps> = ({
  wheel,
  spiral,
  telemetry,
  onExportSTL,
  onExport3MF,
  onReset,
  isExporting,
}) => {
  return (
    <footer className="h-18 md:h-16 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-md px-4 md:px-6 flex items-center justify-between select-none z-30 shrink-0 shadow-2xl">
      {/* Left: Real-time quick telemetry status */}
      <div className="flex items-center gap-3 text-xs font-mono">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
            !telemetry.canExport
              ? 'bg-red-950/40 border-red-500/50 text-red-300'
              : telemetry.warnings.length > 0
              ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
              : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
          }`}
        >
          {!telemetry.canExport ? (
            <XCircle className="w-4 h-4 text-red-400 shrink-0" />
          ) : telemetry.warnings.length > 0 ? (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          )}

          <div className="flex items-center gap-2">
            <span className="font-bold">
              {!telemetry.canExport ? 'Export gesperrt' : 'Druckbereit (Manifold)'}
            </span>
            <span className="text-zinc-500 hidden lg:inline">|</span>
            <span className="text-zinc-400 hidden lg:inline">
              Ø {wheel.outerDiameter.toFixed(1)} mm
            </span>
            <span className="text-zinc-500 hidden lg:inline">•</span>
            <span className="text-zinc-400 hidden lg:inline">
              {spiral.revolutions.toFixed(2)} Umdr. ({spiral.totalAngleDeg.toFixed(0)}°)
            </span>
            <span className="text-zinc-500 hidden lg:inline">•</span>
            <span className="text-zinc-400 hidden lg:inline">
              Auflösung: {telemetry.radialPerDegMicrons.toFixed(1)} µm/°
            </span>
          </div>
        </div>
      </div>

      {/* Right: The 3 requested action buttons: STL exportieren, 3MF exportieren, Parameter zurücksetzen */}
      <div className="flex items-center gap-2.5">
        {/* Parameter zurücksetzen */}
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 border border-zinc-800 text-xs font-mono transition-colors active:scale-95"
          title="Alle Parameter auf Standard zurücksetzen"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Parameter zurücksetzen</span>
          <span className="sm:hidden">Reset</span>
        </button>

        {/* 3MF exportieren */}
        <button
          onClick={onExport3MF}
          disabled={!telemetry.canExport || isExporting}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-amber-300 hover:text-amber-200 border border-zinc-700/80 font-mono text-xs font-medium transition-all active:scale-95"
          title="3MF-Datei für Bambu Studio / PrusaSlicer exportieren"
        >
          <FileDown className="w-4 h-4 text-amber-400" />
          <span>3MF exportieren</span>
        </button>

        {/* STL exportieren (Primary Action) */}
        <button
          onClick={onExportSTL}
          disabled={!telemetry.canExport || isExporting}
          className="flex items-center gap-2.5 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-40 text-white font-mono text-xs font-bold shadow-lg shadow-cyan-950/60 border border-cyan-400/40 transition-all active:scale-95"
          title={
            telemetry.canExport
              ? 'Druckfertiges 3D-Modell als binäre STL-Datei herunterladen'
              : 'Export gesperrt: Bitte Geometriewarnungen korrigieren'
          }
        >
          <Download className="w-4 h-4" />
          <span>STL exportieren</span>
        </button>
      </div>
    </footer>
  );
};
