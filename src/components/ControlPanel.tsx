import React, { useState } from 'react';
import {
  Disc,
  Spline,
  Scissors,
  ChevronDown,
  ChevronUp,
  Link,
  Settings2,
  Gauge,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Ruler,
  Compass,
} from 'lucide-react';
import { CalculatedTelemetry, SafetyParameters, SpiralParameters, WheelParameters } from '../types/cad';

interface ControlPanelProps {
  wheel: WheelParameters;
  spiral: SpiralParameters;
  safety: SafetyParameters;
  telemetry: CalculatedTelemetry;
  onUpdateWheel: (wheel: Partial<WheelParameters>) => void;
  onUpdateSpiral: (spiral: Partial<SpiralParameters>) => void;
  onUpdateSafety: (safety: Partial<SafetyParameters>) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  wheel,
  spiral,
  safety,
  telemetry,
  onUpdateWheel,
  onUpdateSpiral,
  onUpdateSafety,
}) => {
  // Collapsible section states matching the user's requested layout:
  // 1. Grundmaße
  // 2. Spiralparameter
  // 3. Nutbreite und Nuttiefe
  // 4. Einstellbereich
  // 5. Mindestwandstärke
  // 6. Geometrieprüfung
  const [openSections, setOpenSections] = useState({
    base: true,
    spiral: true,
    groove: true,
    tuning: true,
    safetyWall: true,
    inspection: true,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Coupled changes: Revolutions <-> Total Angle
  const handleRevolutionsChange = (revs: number) => {
    const clampedRevs = Math.max(0.25, Math.min(4.0, revs));
    const angle = Math.round(clampedRevs * 360 * 10) / 10;
    onUpdateSpiral({
      revolutions: clampedRevs,
      totalAngleDeg: angle,
    });
  };

  const handleTotalAngleChange = (deg: number) => {
    const clampedDeg = Math.max(90, Math.min(1440, deg));
    const revs = Math.round((clampedDeg / 360) * 100) / 100;
    onUpdateSpiral({
      totalAngleDeg: clampedDeg,
      revolutions: revs,
    });
  };

  // Handle direct change of Start Angle
  const handleStartAngleChange = (startDeg: number) => {
    const clampedStart = ((startDeg % 360) + 360) % 360;
    onUpdateSpiral({ startAngleDeg: clampedStart });
  };

  // Handle direct change of End Angle (calculating resulting totalAngle & revolutions)
  const handleEndAngleChange = (endDeg: number) => {
    const targetEnd = Math.max(spiral.startAngleDeg + 90, endDeg);
    const newTotalAngle = targetEnd - spiral.startAngleDeg;
    const newRevs = Math.round((newTotalAngle / 360) * 100) / 100;
    onUpdateSpiral({
      totalAngleDeg: newTotalAngle,
      revolutions: newRevs,
    });
  };

  const currentEndAngle = spiral.startAngleDeg + spiral.totalAngleDeg;

  return (
    <div className="w-full h-full flex flex-col bg-zinc-900 border-r border-zinc-800 text-zinc-100 select-none overflow-y-auto">
      {/* Panel Header */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-950/70 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-2 text-cyan-400">
          <Settings2 className="w-4 h-4" />
          <h2 className="text-xs font-mono font-bold tracking-wider uppercase">
            CAD-Parameter (M4 Hop-Up Dial)
          </h2>
        </div>
        <p className="text-[11px] text-zinc-400 mt-1 font-mono">
          Echtzeit-Berechnung des parametrischen Einstellrades
        </p>
      </div>

      <div className="p-4 space-y-3.5 pb-20">
        {/* ================= 1. GRUNDMASSE ================= */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 overflow-hidden">
          <button
            onClick={() => toggleSection('base')}
            className="w-full flex items-center justify-between p-3 bg-zinc-900/60 hover:bg-zinc-800/60 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <Disc className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
                1. Grundmaße
              </span>
            </div>
            {openSections.base ? (
              <ChevronUp className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            )}
          </button>

          {openSections.base && (
            <div className="p-3.5 space-y-3.5 border-t border-zinc-800/80">
              {/* Außendurchmesser */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-zinc-300">Außendurchmesser (Ø Out):</span>
                  <span className="font-bold text-cyan-300">{wheel.outerDiameter.toFixed(1)} mm</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="18.0"
                    max="34.0"
                    step="0.1"
                    value={wheel.outerDiameter}
                    onChange={(e) => onUpdateWheel({ outerDiameter: parseFloat(e.target.value) })}
                    className="flex-1 accent-cyan-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                  <input
                    type="number"
                    min="16.0"
                    max="45.0"
                    step="0.1"
                    value={wheel.outerDiameter}
                    onChange={(e) => onUpdateWheel({ outerDiameter: parseFloat(e.target.value) || 25 })}
                    className="w-16 px-1.5 py-0.5 text-xs font-mono bg-zinc-800 border border-zinc-700 rounded text-right text-zinc-100"
                  />
                </div>
              </div>

              {/* Innendurchmesser (Achsbohrung) */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-zinc-300">Innendurchmesser (Ø Bohrung):</span>
                  <span className="font-bold text-cyan-300">{wheel.innerDiameter.toFixed(1)} mm</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="6.0"
                    max="18.0"
                    step="0.1"
                    value={wheel.innerDiameter}
                    onChange={(e) => onUpdateWheel({ innerDiameter: parseFloat(e.target.value) })}
                    className="flex-1 accent-cyan-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                  <input
                    type="number"
                    min="4.0"
                    max="22.0"
                    step="0.1"
                    value={wheel.innerDiameter}
                    onChange={(e) => onUpdateWheel({ innerDiameter: parseFloat(e.target.value) || 10 })}
                    className="w-16 px-1.5 py-0.5 text-xs font-mono bg-zinc-800 border border-zinc-700 rounded text-right text-zinc-100"
                  />
                </div>
              </div>

              {/* Gesamtdicke */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-zinc-300">Gesamtdicke (T):</span>
                  <span className="font-bold text-cyan-300">{wheel.thickness.toFixed(1)} mm</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="2.5"
                    max="8.0"
                    step="0.1"
                    value={wheel.thickness}
                    onChange={(e) => onUpdateWheel({ thickness: parseFloat(e.target.value) })}
                    className="flex-1 accent-cyan-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                  <input
                    type="number"
                    min="2.0"
                    max="12.0"
                    step="0.1"
                    value={wheel.thickness}
                    onChange={(e) => onUpdateWheel({ thickness: parseFloat(e.target.value) || 4 })}
                    className="w-16 px-1.5 py-0.5 text-xs font-mono bg-zinc-800 border border-zinc-700 rounded text-right text-zinc-100"
                  />
                </div>
              </div>

              {/* Rändelung / Griffrillen Toggle */}
              <div className="pt-2 border-t border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-mono text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wheel.knurling}
                      onChange={(e) => onUpdateWheel({ knurling: e.target.checked })}
                      className="rounded border-zinc-700 bg-zinc-800 text-cyan-500 focus:ring-0 w-3.5 h-3.5"
                    />
                    <span>Außenrändelung (Grifffräsung)</span>
                  </label>
                  {wheel.knurling && (
                    <span className="text-[10px] font-mono text-cyan-400">
                      {wheel.knurlCount} Nuten
                    </span>
                  )}
                </div>

                {wheel.knurling && (
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
                    <div>
                      <span className="text-zinc-400 block mb-0.5">Zahnanzahl:</span>
                      <input
                        type="number"
                        min="12"
                        max="60"
                        step="2"
                        value={wheel.knurlCount}
                        onChange={(e) => onUpdateWheel({ knurlCount: parseInt(e.target.value) || 24 })}
                        className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-zinc-100 text-right"
                      />
                    </div>
                    <div>
                      <span className="text-zinc-400 block mb-0.5">Zahntiefe (mm):</span>
                      <input
                        type="number"
                        min="0.2"
                        max="1.2"
                        step="0.05"
                        value={wheel.knurlDepth}
                        onChange={(e) => onUpdateWheel({ knurlDepth: parseFloat(e.target.value) || 0.4 })}
                        className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-zinc-100 text-right"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 1. KONISCHE AUSSENFORM (KEGELSTUMPF) */}
              <div className="pt-3 border-t border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-mono text-zinc-200 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={wheel.conicalOuter}
                      onChange={(e) => onUpdateWheel({ conicalOuter: e.target.checked })}
                      className="rounded border-zinc-700 bg-zinc-800 text-cyan-500 focus:ring-0 w-3.5 h-3.5"
                    />
                    <span>Konische Außenform (Kegelstumpf)</span>
                  </label>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${wheel.conicalOuter ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/50' : 'bg-zinc-800 text-zinc-500'}`}>
                    {wheel.conicalOuter ? 'Aktiv' : 'Zylindrisch'}
                  </span>
                </div>

                {wheel.conicalOuter && (
                  <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-cyan-900/40 space-y-2.5 animate-in fade-in duration-150">
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-zinc-300">Oberer Durchmesser (Ø Top / Nutseite):</span>
                        <span className="font-bold text-cyan-300">{wheel.outerDiameter.toFixed(1)} mm</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="18.0"
                          max="34.0"
                          step="0.1"
                          value={wheel.outerDiameter}
                          onChange={(e) => onUpdateWheel({ outerDiameter: parseFloat(e.target.value) })}
                          className="flex-1 accent-cyan-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                        />
                        <input
                          type="number"
                          min="16.0"
                          max="40.0"
                          step="0.1"
                          value={wheel.outerDiameter}
                          onChange={(e) => onUpdateWheel({ outerDiameter: parseFloat(e.target.value) || 25 })}
                          className="w-16 px-1.5 py-0.5 text-xs font-mono bg-zinc-800 border border-zinc-700 rounded text-right text-zinc-100"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-zinc-300">Unterer Durchmesser (Ø Bottom / Unterseite):</span>
                        <span className="font-bold text-amber-300">{wheel.outerDiameterBottom.toFixed(1)} mm</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="12.0"
                          max={wheel.outerDiameter}
                          step="0.1"
                          value={wheel.outerDiameterBottom}
                          onChange={(e) => onUpdateWheel({ outerDiameterBottom: parseFloat(e.target.value) })}
                          className="flex-1 accent-amber-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                        />
                        <input
                          type="number"
                          min="10.0"
                          max={wheel.outerDiameter}
                          step="0.1"
                          value={wheel.outerDiameterBottom}
                          onChange={(e) => onUpdateWheel({ outerDiameterBottom: parseFloat(e.target.value) || 20 })}
                          className="w-16 px-1.5 py-0.5 text-xs font-mono bg-zinc-800 border border-zinc-700 rounded text-right text-zinc-100"
                        />
                      </div>
                    </div>

                    <p className="text-[10px] text-zinc-400 font-mono leading-tight">
                      Gleichmäßige Verjüngung über die gesamte Dicke von Ø {wheel.outerDiameter.toFixed(1)} mm oben auf Ø {wheel.outerDiameterBottom.toFixed(1)} mm unten.
                    </p>
                  </div>
                )}
              </div>

              {/* 2. ZWEISTUFIGE ZENTRALE INNENBOHRUNG */}
              <div className="pt-3 border-t border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-mono text-zinc-200 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={wheel.steppedBore}
                      onChange={(e) => onUpdateWheel({ steppedBore: e.target.checked })}
                      className="rounded border-zinc-700 bg-zinc-800 text-cyan-500 focus:ring-0 w-3.5 h-3.5"
                    />
                    <span>Zweistufige Innenbohrung (90°-Schulter)</span>
                  </label>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${wheel.steppedBore ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/50' : 'bg-zinc-800 text-zinc-500'}`}>
                    {wheel.steppedBore ? 'Stufe aktiv' : 'Durchgehend'}
                  </span>
                </div>

                {wheel.steppedBore && (
                  <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-cyan-900/40 space-y-2.5 animate-in fade-in duration-150">
                    {/* Abschnitt 1: Unterer Durchmesser */}
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-zinc-300">1. Bohrung Ø (Unterseite):</span>
                        <span className="font-bold text-amber-300">{wheel.steppedBoreBottomDiameter.toFixed(1)} mm</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="6.0"
                          max="18.0"
                          step="0.1"
                          value={wheel.steppedBoreBottomDiameter}
                          onChange={(e) => onUpdateWheel({ steppedBoreBottomDiameter: parseFloat(e.target.value) })}
                          className="flex-1 accent-amber-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                        />
                        <input
                          type="number"
                          min="4.0"
                          max="20.0"
                          step="0.1"
                          value={wheel.steppedBoreBottomDiameter}
                          onChange={(e) => onUpdateWheel({ steppedBoreBottomDiameter: parseFloat(e.target.value) || 11 })}
                          className="w-16 px-1.5 py-0.5 text-xs font-mono bg-zinc-800 border border-zinc-700 rounded text-right text-zinc-100"
                        />
                      </div>
                    </div>

                    {/* Abschnitt 2: Oberer Durchmesser */}
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-zinc-300">2. Bohrung Ø (Oberseite / Nut):</span>
                        <span className="font-bold text-cyan-300">{wheel.steppedBoreTopDiameter.toFixed(1)} mm</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="4.0"
                          max="16.0"
                          step="0.1"
                          value={wheel.steppedBoreTopDiameter}
                          onChange={(e) => onUpdateWheel({ steppedBoreTopDiameter: parseFloat(e.target.value) })}
                          className="flex-1 accent-cyan-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                        />
                        <input
                          type="number"
                          min="3.0"
                          max="18.0"
                          step="0.1"
                          value={wheel.steppedBoreTopDiameter}
                          onChange={(e) => onUpdateWheel({ steppedBoreTopDiameter: parseFloat(e.target.value) || 9.5 })}
                          className="w-16 px-1.5 py-0.5 text-xs font-mono bg-zinc-800 border border-zinc-700 rounded text-right text-zinc-100"
                        />
                      </div>
                    </div>

                    {/* Stufenhöhe gemessen von Unterseite */}
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-zinc-300">Stufenhöhe 1. Bohrung (von Unterseite):</span>
                        <span className="font-bold text-zinc-100">{wheel.steppedBoreHeight.toFixed(1)} mm</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0.5"
                          max={Math.max(1.0, wheel.thickness - 0.5)}
                          step="0.1"
                          value={wheel.steppedBoreHeight}
                          onChange={(e) => onUpdateWheel({ steppedBoreHeight: parseFloat(e.target.value) })}
                          className="flex-1 accent-zinc-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                        />
                        <input
                          type="number"
                          min="0.4"
                          max={wheel.thickness - 0.4}
                          step="0.1"
                          value={wheel.steppedBoreHeight}
                          onChange={(e) => onUpdateWheel({ steppedBoreHeight: parseFloat(e.target.value) || 2 })}
                          className="w-16 px-1.5 py-0.5 text-xs font-mono bg-zinc-800 border border-zinc-700 rounded text-right text-zinc-100"
                        />
                      </div>
                    </div>

                    <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800 text-[10px] font-mono space-y-1">
                      <div className="flex justify-between text-zinc-400">
                        <span>Resthöhe 2. Bohrung (automatisch):</span>
                        <span className="font-bold text-zinc-200">{(wheel.thickness - wheel.steppedBoreHeight).toFixed(2)} mm</span>
                      </div>
                      <div className="text-zinc-500">
                        Rechtwinklige, scharfe 90°-Stufe ohne Fase oder Rundung.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ================= 2. SPIRALPARAMETER ================= */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 overflow-hidden">
          <button
            onClick={() => toggleSection('spiral')}
            className="w-full flex items-center justify-between p-3 bg-zinc-900/60 hover:bg-zinc-800/60 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <Spline className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
                2. Spiralparameter
              </span>
            </div>
            {openSections.spiral ? (
              <ChevronUp className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            )}
          </button>

          {openSections.spiral && (
            <div className="p-3.5 space-y-3.5 border-t border-zinc-800/80">
              {/* Coupled Revolutions & Total Angle */}
              <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-cyan-900/40 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Link className="w-3.5 h-3.5" /> Gekoppelte Umdrehungen / Winkel
                  </span>
                  <span>360° = 1.0x</span>
                </div>

                {/* Umdrehungen Slider */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-zinc-300">Anzahl Spiralumdrehungen:</span>
                    <span className="font-bold text-cyan-300">
                      {spiral.revolutions.toFixed(2)} Umdr.
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.05"
                    value={spiral.revolutions}
                    onChange={(e) => handleRevolutionsChange(parseFloat(e.target.value))}
                    className="w-full accent-cyan-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Drehwinkel in Grad */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-zinc-300">Gesamter Drehwinkel:</span>
                    <span className="font-bold text-cyan-300">
                      {spiral.totalAngleDeg.toFixed(0)}°
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="180"
                      max="1080"
                      step="15"
                      value={spiral.totalAngleDeg}
                      onChange={(e) => handleTotalAngleChange(parseFloat(e.target.value))}
                      className="flex-1 accent-cyan-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                    <input
                      type="number"
                      min="90"
                      max="1440"
                      step="10"
                      value={spiral.totalAngleDeg}
                      onChange={(e) => handleTotalAngleChange(parseFloat(e.target.value) || 360)}
                      className="w-16 px-1.5 py-0.5 text-xs font-mono bg-zinc-800 border border-zinc-700 rounded text-right text-zinc-100"
                    />
                  </div>
                </div>

                {/* Quick Turn Presets */}
                <div className="flex items-center gap-1.5 pt-1">
                  {[
                    { label: '360° (1x)', rev: 1.0 },
                    { label: '450° (1.25x)', rev: 1.25 },
                    { label: '540° (1.5x)', rev: 1.5 },
                    { label: '720° (2x)', rev: 2.0 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      onClick={() => handleRevolutionsChange(p.rev)}
                      className={`flex-1 py-1 rounded text-[10px] font-mono border transition-all ${
                        Math.abs(spiral.revolutions - p.rev) < 0.04
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-bold'
                          : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Start-Radius und End-Radius */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-blue-400">Innerer Start-Radius:</span>
                    <span className="font-bold text-blue-300">{spiral.startRadius.toFixed(1)} mm</span>
                  </div>
                  <input
                    type="range"
                    min="3.0"
                    max="14.0"
                    step="0.1"
                    value={spiral.startRadius}
                    onChange={(e) => onUpdateSpiral({ startRadius: parseFloat(e.target.value) })}
                    className="w-full accent-blue-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-red-400">Äußerer End-Radius:</span>
                    <span className="font-bold text-red-300">{spiral.endRadius.toFixed(1)} mm</span>
                  </div>
                  <input
                    type="range"
                    min="6.0"
                    max="20.0"
                    step="0.1"
                    value={spiral.endRadius}
                    onChange={(e) => onUpdateSpiral({ endRadius: parseFloat(e.target.value) })}
                    className="w-full accent-red-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Einstellbare Winkelpositionen: Startpunkt UND Endpunkt */}
              <div className="space-y-2.5 pt-1">
                {/* Winkelposition des Startpunktes */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-zinc-300">Winkelposition Startpunkt (φ_start):</span>
                    <span className="font-bold text-zinc-100">{spiral.startAngleDeg.toFixed(0)}°</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="5"
                      value={spiral.startAngleDeg}
                      onChange={(e) => handleStartAngleChange(parseFloat(e.target.value))}
                      className="flex-1 accent-zinc-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                    <input
                      type="number"
                      min="0"
                      max="360"
                      step="1"
                      value={spiral.startAngleDeg}
                      onChange={(e) => handleStartAngleChange(parseFloat(e.target.value) || 0)}
                      className="w-16 px-1.5 py-0.5 text-xs font-mono bg-zinc-800 border border-zinc-700 rounded text-right text-zinc-100"
                    />
                  </div>
                </div>

                {/* Winkelposition des Endpunktes */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-zinc-300">Winkelposition Endpunkt (φ_end):</span>
                    <span className="font-bold text-cyan-300">{currentEndAngle.toFixed(0)}°</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={spiral.startAngleDeg + 90}
                      max={spiral.startAngleDeg + 1440}
                      step="15"
                      value={currentEndAngle}
                      onChange={(e) => handleEndAngleChange(parseFloat(e.target.value))}
                      className="flex-1 accent-cyan-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                    <input
                      type="number"
                      min={spiral.startAngleDeg + 90}
                      max={spiral.startAngleDeg + 1440}
                      step="5"
                      value={Math.round(currentEndAngle)}
                      onChange={(e) => handleEndAngleChange(parseFloat(e.target.value) || currentEndAngle)}
                      className="w-16 px-1.5 py-0.5 text-xs font-mono bg-zinc-800 border border-zinc-700 rounded text-right text-zinc-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= 3. NUTBREITE UND NUTTIEFE ================= */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 overflow-hidden">
          <button
            onClick={() => toggleSection('groove')}
            className="w-full flex items-center justify-between p-3 bg-zinc-900/60 hover:bg-zinc-800/60 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
                3. Nutbreite & Nuttiefe (Konstant)
              </span>
            </div>
            {openSections.groove ? (
              <ChevronUp className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            )}
          </button>

          {openSections.groove && (
            <div className="p-3.5 space-y-3.5 border-t border-zinc-800/80">
              {/* Nutbreite */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-zinc-300">Nutbreite (w):</span>
                  <span className="font-bold text-amber-300">{spiral.grooveWidth.toFixed(2)} mm</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1.0"
                    max="3.5"
                    step="0.05"
                    value={spiral.grooveWidth}
                    onChange={(e) => onUpdateSpiral({ grooveWidth: parseFloat(e.target.value) })}
                    className="flex-1 accent-amber-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0.8"
                    max="5.0"
                    step="0.1"
                    value={spiral.grooveWidth}
                    onChange={(e) => onUpdateSpiral({ grooveWidth: parseFloat(e.target.value) || 2 })}
                    className="w-16 px-1.5 py-0.5 text-xs font-mono bg-zinc-800 border border-zinc-700 rounded text-right text-zinc-100"
                  />
                </div>
                <p className="text-[10px] text-zinc-400 font-mono mt-1">
                  Bleibt über den gesamten Verlauf konstant (senkrecht zur Bahn erzeugt).
                </p>
              </div>

              {/* Nuttiefe */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-zinc-300">Nuttiefe (d):</span>
                  <span className="font-bold text-cyan-300">{spiral.grooveDepth.toFixed(2)} mm</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0.6"
                    max={Math.max(1.0, wheel.thickness - 0.4)}
                    step="0.05"
                    value={spiral.grooveDepth}
                    onChange={(e) => onUpdateSpiral({ grooveDepth: parseFloat(e.target.value) })}
                    className="flex-1 accent-cyan-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0.4"
                    max="6.0"
                    step="0.1"
                    value={spiral.grooveDepth}
                    onChange={(e) => onUpdateSpiral({ grooveDepth: parseFloat(e.target.value) || 1.5 })}
                    className="w-16 px-1.5 py-0.5 text-xs font-mono bg-zinc-800 border border-zinc-700 rounded text-right text-zinc-100"
                  />
                </div>
                <p className="text-[10px] text-zinc-400 font-mono mt-1">
                  Bleibt über den gesamten Verlauf konstant tief (echter CSG-Abzug).
                </p>
              </div>

              {/* Nutenden Form (Cap style) */}
              <div className="pt-2 border-t border-zinc-800/80">
                <span className="text-xs font-mono text-zinc-400 block mb-1.5">Nutenden (Fräserabschluss):</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onUpdateSpiral({ capStyle: 'round' })}
                    className={`py-1.5 px-2 rounded text-xs font-mono border transition-all ${
                      spiral.capStyle === 'round'
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-bold'
                        : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Rund (Schaftfräser)
                  </button>
                  <button
                    onClick={() => onUpdateSpiral({ capStyle: 'flat' })}
                    className={`py-1.5 px-2 rounded text-xs font-mono border transition-all ${
                      spiral.capStyle === 'flat'
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-bold'
                        : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Gerade (Flach)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= 4. EINSTELLBEREICH & FEINEINSTELLUNG ================= */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 overflow-hidden">
          <button
            onClick={() => toggleSection('tuning')}
            className="w-full flex items-center justify-between p-3 bg-zinc-900/60 hover:bg-zinc-800/60 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
                4. Einstellbereich (Feineinstellung)
              </span>
            </div>
            {openSections.tuning ? (
              <ChevronUp className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            )}
          </button>

          {openSections.tuning && (
            <div className="p-3.5 space-y-2.5 border-t border-zinc-800/80 text-xs font-mono">
              <p className="text-[11px] text-zinc-400 leading-normal mb-2">
                Mehr Umdrehungen bedeuten eine feinere radiale Veränderung pro Drehwinkel:
              </p>

              <div className="flex items-center justify-between p-2 rounded bg-zinc-900/70 border border-zinc-800">
                <span className="text-zinc-400">Radialer Gesamtverstellweg:</span>
                <span className="font-bold text-cyan-300">
                  {telemetry.totalRadialTravel.toFixed(2)} mm
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-zinc-900/70 border border-zinc-800">
                <span className="text-zinc-400">Radiale Veränderung pro 360°:</span>
                <span className="font-bold text-zinc-200">
                  {telemetry.radialPer360.toFixed(3)} mm
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-zinc-900/70 border border-zinc-800">
                <span className="text-zinc-400">Radiale Veränderung pro 90°:</span>
                <span className="font-bold text-zinc-200">
                  {telemetry.radialPer90.toFixed(3)} mm
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-cyan-950/40 border border-cyan-800/60">
                <span className="text-cyan-300 font-medium">Radiale Veränderung pro Grad:</span>
                <span className="font-bold text-cyan-200">
                  {telemetry.radialPerDegMicrons.toFixed(1)} µm / °
                  <span className="text-[10px] text-cyan-400 ml-1 font-normal">
                    ({telemetry.radialPerDeg.toFixed(4)} mm/°)
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800">
                  <span className="text-zinc-400 block">Gesamter Drehwinkel:</span>
                  <span className="font-bold text-zinc-100">{telemetry.totalAngleDeg.toFixed(0)}°</span>
                </div>
                <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800">
                  <span className="text-zinc-400 block">Anzahl Umdrehungen:</span>
                  <span className="font-bold text-zinc-100">{telemetry.revolutions.toFixed(2)}x</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= 5. MINDESTWANDSTÄRKE ================= */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 overflow-hidden">
          <button
            onClick={() => toggleSection('safetyWall')}
            className="w-full flex items-center justify-between p-3 bg-zinc-900/60 hover:bg-zinc-800/60 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
                5. Mindestwandstärke
              </span>
            </div>
            {openSections.safetyWall ? (
              <ChevronUp className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            )}
          </button>

          {openSections.safetyWall && (
            <div className="p-3.5 space-y-3 border-t border-zinc-800/80">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-zinc-300">Geforderte Mindestwandstärke:</span>
                  <span className="font-bold text-emerald-300">
                    {safety.minWallThickness.toFixed(2)} mm
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0.3"
                    max="2.0"
                    step="0.05"
                    value={safety.minWallThickness}
                    onChange={(e) =>
                      onUpdateSafety({ minWallThickness: parseFloat(e.target.value) })
                    }
                    className="flex-1 accent-emerald-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                  <input
                    type="number"
                    step="0.1"
                    min="0.2"
                    max="3.0"
                    value={safety.minWallThickness}
                    onChange={(e) =>
                      onUpdateSafety({
                        minWallThickness: Math.max(0.2, parseFloat(e.target.value) || 0.8),
                      })
                    }
                    className="w-16 px-1.5 py-0.5 text-xs font-mono bg-zinc-800 border border-zinc-700 rounded text-right text-zinc-100"
                  />
                </div>
                <p className="text-[10px] text-zinc-400 font-mono mt-1">
                  Referenzwert für FDM-Drucker (z.B. 2 Nozzle-Linien à 0.4mm = 0.8mm).
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ================= 6. GEOMETRIEPRÜFUNG ================= */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 overflow-hidden">
          <button
            onClick={() => toggleSection('inspection')}
            className="w-full flex items-center justify-between p-3 bg-zinc-900/60 hover:bg-zinc-800/60 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              {telemetry.canExport ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400" />
              )}
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
                6. Geometrieprüfung & Status
              </span>
            </div>
            {openSections.inspection ? (
              <ChevronUp className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            )}
          </button>

          {openSections.inspection && (
            <div className="p-3.5 space-y-3.5 border-t border-zinc-800/80">
              {/* Traffic Light Status */}
              <div
                className={`px-3 py-2.5 rounded-lg border text-xs font-mono flex items-start gap-2.5 ${
                  !telemetry.canExport
                    ? 'bg-red-950/50 border-red-500/60 text-red-300'
                    : telemetry.warnings.length > 0
                    ? 'bg-amber-950/50 border-amber-500/60 text-amber-300'
                    : 'bg-emerald-950/50 border-emerald-500/60 text-emerald-300'
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
                      ? 'Warnungen vorhanden (Überprüfen)'
                      : 'Geometrie 100% valide & druckbar'}
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

              {/* Exact Metrics List as specified in Section 6 */}
              <div className="space-y-2 text-xs font-mono">
                {/* Tatsächliche Nutbreite */}
                <div className="flex items-center justify-between p-2 rounded bg-zinc-900/60 border border-zinc-800">
                  <span className="text-zinc-400">Tatsächliche Nutbreite:</span>
                  <span className="font-bold text-zinc-100">
                    {telemetry.actualGrooveWidth.toFixed(2)} mm
                  </span>
                </div>

                {/* Kleinster Abstand zw. benachbarten Spiralabschnitten */}
                <div className="flex items-center justify-between p-2 rounded bg-zinc-900/60 border border-zinc-800">
                  <span className="text-zinc-400">Kleinster Windungsabstand:</span>
                  <span
                    className={`font-bold ${
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
                      : '1-Gang (Keine Überschneidung)'}
                  </span>
                </div>

                {/* Verbleibende Materialwand */}
                <div className="flex items-center justify-between p-2 rounded bg-zinc-900/60 border border-zinc-800">
                  <span className="text-zinc-400">Verbleibende Materialwand:</span>
                  <span
                    className={`font-bold ${
                      telemetry.minWallBetweenTurns !== null &&
                      telemetry.minWallBetweenTurns < safety.minWallThickness
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {telemetry.minWallBetweenTurns !== null
                      ? `${telemetry.minWallBetweenTurns.toFixed(2)} mm`
                      : 'Ausreichend (1-Gang)'}
                  </span>
                </div>

                {/* Abstand zur zentralen Öffnung */}
                <div className="flex items-center justify-between p-2 rounded bg-zinc-900/60 border border-zinc-800">
                  <span className="text-zinc-400">Abstand z. zentralen Öffnung:</span>
                  <span
                    className={`font-bold ${
                      telemetry.wallToInnerHole <= 0
                        ? 'text-red-400'
                        : telemetry.wallToInnerHole < safety.minWallThickness
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {telemetry.wallToInnerHole.toFixed(2)} mm
                  </span>
                </div>

                {/* Abstand zur Außenkante */}
                <div className="flex items-center justify-between p-2 rounded bg-zinc-900/60 border border-zinc-800">
                  <span className="text-zinc-400">Abstand zur Außenkante:</span>
                  <span
                    className={`font-bold ${
                      telemetry.wallToOuterRim <= 0
                        ? 'text-red-400'
                        : telemetry.wallToOuterRim < safety.minWallThickness
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {telemetry.wallToOuterRim.toFixed(2)} mm
                  </span>
                </div>

                {/* Verbleibende Materialstärke unterhalb der Nut */}
                <div className="flex items-center justify-between p-2 rounded bg-zinc-900/60 border border-zinc-800">
                  <span className="text-zinc-400">Restbodenstärke unter Nut:</span>
                  <span
                    className={`font-bold ${
                      telemetry.remainingFloorThickness <= 0
                        ? 'text-red-400'
                        : telemetry.remainingFloorThickness < safety.minWallThickness
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {telemetry.remainingFloorThickness.toFixed(2)} mm
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
