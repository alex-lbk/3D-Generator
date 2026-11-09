import React from 'react';
import {
  Gauge,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Ruler,
  Compass,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { CalculatedTelemetry, SafetyParameters, SpiralParameters, WheelParameters } from '../types/cad';

interface TelemetryCardProps {
  wheel: WheelParameters;
  spiral: SpiralParameters;
  safety: SafetyParameters;
  telemetry: CalculatedTelemetry;
  onUpdateSafety: (safety: Partial<SafetyParameters>) => void;
}

export const TelemetryCard: React.FC<TelemetryCardProps> = ({
  wheel,
  spiral,
  safety,
  telemetry,
  onUpdateSafety,
}) => {
  return (
    <div className="space-y-4">
      {/* Safety & Wall Thickness Section */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3.5 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
              Sicherheits- & Wandstärkenprüfung
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-zinc-400">Min:</span>
            <input
              type="number"
              step="0.1"
              min="0.3"
              max="2.5"
              value={safety.minWallThickness}
              onChange={(e) =>
                onUpdateSafety({ minWallThickness: Math.max(0.2, parseFloat(e.target.value) || 0.8) })
              }
              className="w-16 px-1.5 py-0.5 text-xs font-mono bg-zinc-800 border border-zinc-700 rounded text-right text-zinc-100 focus:outline-none focus:border-cyan-500"
            />
            <span className="text-[11px] font-mono text-zinc-400">mm</span>
          </div>
        </div>

        {/* Status Traffic Light Badge */}
        <div
          className={`px-3 py-2 rounded-lg border text-xs font-mono flex items-start gap-2.5 transition-all ${
            !telemetry.canExport
              ? 'bg-red-950/40 border-red-500/50 text-red-300'
              : telemetry.warnings.length > 0
              ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
              : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
          }`}
        >
          {!telemetry.canExport ? (
            <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          ) : telemetry.warnings.length > 0 ? (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          )}

          <div className="flex-1 space-y-1">
            <div className="font-bold">
              {!telemetry.canExport
                ? 'Geometrie ungültig (Export gesperrt)'
                : telemetry.warnings.length > 0
                ? 'Geometrie mit Warnungen (Überprüfen)'
                : 'Geometrie 100% druckbar (Optimal)'}
            </div>

            {telemetry.errors.map((err, i) => (
              <div key={i} className="text-[11px] text-red-300/90 leading-tight">
                • {err}
              </div>
            ))}

            {telemetry.warnings.map((warn, i) => (
              <div key={i} className="text-[11px] text-amber-300/90 leading-tight">
                • {warn}
              </div>
            ))}
          </div>
        </div>

        {/* Calculated Wall Thickness Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          {/* Steg zwischen Windungen */}
          <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800">
            <div className="text-[10px] text-zinc-400">Wand zw. Windungen</div>
            <div
              className={`text-sm font-bold mt-0.5 ${
                telemetry.minWallBetweenTurns === null
                  ? 'text-zinc-500'
                  : telemetry.minWallBetweenTurns <= 0
                  ? 'text-red-400'
                  : telemetry.minWallBetweenTurns < safety.minWallThickness
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {telemetry.minWallBetweenTurns !== null
                ? `${telemetry.minWallBetweenTurns.toFixed(2)} mm`
                : '1-Gang (Keine)'}
            </div>
          </div>

          {/* Restboden unter Nut */}
          <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800">
            <div className="text-[10px] text-zinc-400">Restbodendicke</div>
            <div
              className={`text-sm font-bold mt-0.5 ${
                telemetry.remainingFloorThickness <= 0
                  ? 'text-red-400'
                  : telemetry.remainingFloorThickness < safety.minWallThickness
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {telemetry.remainingFloorThickness.toFixed(2)} mm
            </div>
          </div>

          {/* Wand zur Innenbohrung */}
          <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800">
            <div className="text-[10px] text-zinc-400">Abstand z. Achsloch</div>
            <div
              className={`text-sm font-bold mt-0.5 ${
                telemetry.wallToInnerHole <= 0
                  ? 'text-red-400'
                  : telemetry.wallToInnerHole < safety.minWallThickness
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {telemetry.wallToInnerHole.toFixed(2)} mm
            </div>
          </div>

          {/* Wand zum Außenrand */}
          <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800">
            <div className="text-[10px] text-zinc-400">Abstand z. Außenrand</div>
            <div
              className={`text-sm font-bold mt-0.5 ${
                telemetry.wallToOuterRim <= 0
                  ? 'text-red-400'
                  : telemetry.wallToOuterRim < safety.minWallThickness
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {telemetry.wallToOuterRim.toFixed(2)} mm
            </div>
          </div>
        </div>
      </div>

      {/* Fine-Tuning & Hop-Up Adjustment Telemetry */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3.5 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
            Feineinstellung & Einstellauflösung
          </h3>
        </div>

        <p className="text-[11px] text-zinc-400 leading-normal">
          Je mehr Umdrehungen bei gleichem Verstellweg gewählt werden, desto feiner ist die radiale
          Höhenverstellung des Hop-Up Tensioners / Nubs pro Drehwinkel.
        </p>

        <div className="space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between p-2 rounded bg-zinc-950/60 border border-zinc-800/80">
            <span className="text-zinc-400">Radialer Gesamtverstellweg (Δr):</span>
            <span className="font-bold text-cyan-300">
              {telemetry.totalRadialTravel.toFixed(2)} mm
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-zinc-950/60 border border-zinc-800/80">
            <span className="text-zinc-400">Verstellung pro 360° (1 Umdrehung):</span>
            <span className="font-bold text-zinc-200">
              {telemetry.radialPer360.toFixed(3)} mm / 360°
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-zinc-950/60 border border-zinc-800/80">
            <span className="text-zinc-400">Verstellung pro 90° (Vierteldrehung):</span>
            <span className="font-bold text-zinc-200">
              {telemetry.radialPer90.toFixed(3)} mm / 90°
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-cyan-950/30 border border-cyan-800/50">
            <span className="text-cyan-300">Einstellauflösung pro 1°:</span>
            <span className="font-bold text-cyan-200">
              {telemetry.radialPerDegMicrons.toFixed(1)} µm / Grad
              <span className="text-[10px] text-cyan-400 ml-1 font-normal">
                ({telemetry.radialPerDeg.toFixed(4)} mm)
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
