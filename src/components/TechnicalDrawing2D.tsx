import React, { useMemo, useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Crosshair } from 'lucide-react';
import { CalculatedTelemetry, SpiralParameters, WheelParameters } from '../types/cad';
import { getGroovePolygon2D, sampleSpiralFrames } from '../utils/spiralMath';

interface TechnicalDrawing2DProps {
  wheel: WheelParameters;
  spiral: SpiralParameters;
  telemetry: CalculatedTelemetry;
}

export const TechnicalDrawing2D: React.FC<TechnicalDrawing2DProps> = ({
  wheel,
  spiral,
  telemetry,
}) => {
  const [zoom, setZoom] = useState(1);
  const [showDimensions, setShowDimensions] = useState(true);

  const outerR = wheel.outerDiameter / 2;
  const innerR = wheel.innerDiameter / 2;

  // ViewBox bounds (scaled to mm with padding)
  const padding = 8;
  const viewExtent = outerR + padding;
  const viewBoxSize = viewExtent * 2;
  const viewBox = `-${viewExtent} -${viewExtent} ${viewBoxSize} ${viewBoxSize}`;

  // Groove outline points
  const groovePoints = useMemo(() => {
    return getGroovePolygon2D(spiral, 240);
  }, [spiral]);

  const groovePathD = useMemo(() => {
    if (groovePoints.length === 0) return '';
    return (
      `M ${groovePoints[0].x.toFixed(3)} ${groovePoints[0].y.toFixed(3)} ` +
      groovePoints
        .slice(1)
        .map((p) => `L ${p.x.toFixed(3)} ${p.y.toFixed(3)}`)
        .join(' ') +
      ' Z'
    );
  }, [groovePoints]);

  // Centerline path
  const frames = useMemo(() => sampleSpiralFrames(spiral, 120), [spiral]);
  const centerlinePathD = useMemo(() => {
    if (frames.length === 0) return '';
    return (
      `M ${frames[0].center.x.toFixed(3)} ${frames[0].center.y.toFixed(3)} ` +
      frames
        .slice(1)
        .map((f) => `L ${f.center.x.toFixed(3)} ${f.center.y.toFixed(3)}`)
        .join(' ')
    );
  }, [frames]);

  // Knurled outer polygon or circle
  const knurlOutlinePathD = useMemo(() => {
    if (!wheel.knurling || wheel.knurlCount < 8) return '';
    const points: string[] = [];
    const count = Math.max(128, wheel.knurlCount * 4);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const wave = Math.pow(Math.cos((angle * wheel.knurlCount * 0.5)), 2);
      const r = outerR - wave * wheel.knurlDepth;
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle);
      points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(3)} ${y.toFixed(3)}`);
    }
    return points.join(' ') + ' Z';
  }, [wheel, outerR]);

  const startPt = frames[0]?.center;
  const endPt = frames[frames.length - 1]?.center;

  return (
    <div className="relative w-full h-full flex flex-col bg-zinc-950 text-zinc-100 select-none overflow-hidden">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/60 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-medium tracking-wide text-zinc-300">
            2D-DRAUFSICHT (TECHNISCHE ZEICHNUNG 1:1)
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
            Ø {wheel.outerDiameter.toFixed(1)} mm
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-zinc-400 cursor-pointer hover:text-zinc-200">
            <input
              type="checkbox"
              checked={showDimensions}
              onChange={(e) => setShowDimensions(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-800 text-cyan-500 focus:ring-0 w-3.5 h-3.5"
            />
            <span>Bemaßung anzeigen</span>
          </label>

          <div className="h-4 w-px bg-zinc-800 mx-1" />

          <button
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
            title="Vergrößern"
            className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
            title="Verkleinern"
            className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(1)}
            title="Ansicht zurücksetzen"
            className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div
          className="w-full h-full max-w-3xl max-h-[750px] transition-transform duration-200 ease-out flex items-center justify-center"
          style={{ transform: `scale(${zoom})` }}
        >
          <svg
            viewBox={viewBox}
            className="w-full h-full overflow-visible drop-shadow-2xl"
            style={{ maxHeight: '100%' }}
          >
            <defs>
              {/* Millimeter Grid Pattern */}
              <pattern id="grid-pattern-mm" width="5" height="5" patternUnits="userSpaceOnUse">
                <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#27272a" strokeWidth="0.15" />
              </pattern>
              <pattern id="grid-pattern-major" width="25" height="25" patternUnits="userSpaceOnUse">
                <rect width="25" height="25" fill="none" />
                <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#3f3f46" strokeWidth="0.3" />
              </pattern>
            </defs>

            {/* Background Grids */}
            <rect
              x={-viewExtent}
              y={-viewExtent}
              width={viewBoxSize}
              height={viewBoxSize}
              fill="url(#grid-pattern-mm)"
            />
            <rect
              x={-viewExtent}
              y={-viewExtent}
              width={viewBoxSize}
              height={viewBoxSize}
              fill="url(#grid-pattern-major)"
            />

            {/* Axis Center Crosshairs */}
            <line
              x1={-viewExtent + 2}
              y1="0"
              x2={viewExtent - 2}
              y2="0"
              stroke="#52525b"
              strokeWidth="0.2"
              strokeDasharray="1,1"
            />
            <line
              x1="0"
              y1={-viewExtent + 2}
              x2="0"
              y2={viewExtent - 2}
              stroke="#52525b"
              strokeWidth="0.2"
              strokeDasharray="1,1"
            />

            {/* Outer disk base silhouette (Top surface) */}
            <circle
              cx="0"
              cy="0"
              r={outerR}
              fill="#18181b"
              stroke="#71717a"
              strokeWidth="0.5"
            />

            {/* Conical bottom silhouette (if conical) */}
            {wheel.conicalOuter && (
              <circle
                cx="0"
                cy="0"
                r={wheel.outerDiameterBottom / 2}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="0.35"
                strokeDasharray="1.2,0.8"
              />
            )}

            {/* Knurled profile overlay if enabled */}
            {wheel.knurling && knurlOutlinePathD && (
              <path
                d={knurlOutlinePathD}
                fill="#27272a"
                stroke="#a1a1aa"
                strokeWidth="0.4"
              />
            )}

            {/* Central Bore Hole(s) */}
            {wheel.steppedBore ? (
              <>
                {/* Section 1 (Bottom bore, hidden underneath) */}
                <circle
                  cx="0"
                  cy="0"
                  r={wheel.steppedBoreBottomDiameter / 2}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="0.4"
                  strokeDasharray="1.2,0.8"
                />
                {/* Section 2 (Top bore, visible on top) */}
                <circle
                  cx="0"
                  cy="0"
                  r={wheel.steppedBoreTopDiameter / 2}
                  fill="#09090b"
                  stroke="#38bdf8"
                  strokeWidth="0.6"
                />
              </>
            ) : (
              <circle
                cx="0"
                cy="0"
                r={innerR}
                fill="#09090b"
                stroke="#38bdf8"
                strokeWidth="0.6"
              />
            )}
            <circle cx="0" cy="0" r="0.4" fill="#38bdf8" />

            {/* Spiral Groove Footprint (Filled & Outlined) */}
            <path
              d={groovePathD}
              fill="rgba(56, 189, 248, 0.22)"
              stroke="#0284c7"
              strokeWidth="0.5"
              className="transition-all"
            />

            {/* Spiral Centerline (Archimedes Path) */}
            <path
              d={centerlinePathD}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="0.3"
              strokeDasharray="0.8,0.5"
            />

            {/* Start point marker (Blue) */}
            {startPt && (
              <g transform={`translate(${startPt.x}, ${startPt.y})`}>
                <circle r={spiral.grooveWidth / 2} fill="none" stroke="#2563eb" strokeWidth="0.25" strokeDasharray="0.4,0.4" />
                <circle r="0.8" fill="#3b82f6" stroke="#ffffff" strokeWidth="0.3" />
              </g>
            )}

            {/* End point marker (Red) */}
            {endPt && (
              <g transform={`translate(${endPt.x}, ${endPt.y})`}>
                <circle r={spiral.grooveWidth / 2} fill="none" stroke="#dc2626" strokeWidth="0.25" strokeDasharray="0.4,0.4" />
                <circle r="0.8" fill="#ef4444" stroke="#ffffff" strokeWidth="0.3" />
              </g>
            )}

            {/* Dimension Overlays */}
            {showDimensions && (
              <g className="text-[1.8px] font-mono fill-zinc-300">
                {/* Outer diameter annotation */}
                <line
                  x1={-outerR}
                  y1={viewExtent - 2}
                  x2={outerR}
                  y2={viewExtent - 2}
                  stroke="#a1a1aa"
                  strokeWidth="0.25"
                />
                <line
                  x1={-outerR}
                  y1={0}
                  x2={-outerR}
                  y2={viewExtent - 1}
                  stroke="#71717a"
                  strokeWidth="0.2"
                  strokeDasharray="0.6,0.6"
                />
                <line
                  x1={outerR}
                  y1={0}
                  x2={outerR}
                  y2={viewExtent - 1}
                  stroke="#71717a"
                  strokeWidth="0.2"
                  strokeDasharray="0.6,0.6"
                />
                <text
                  x="0"
                  y={viewExtent - 2.8}
                  textAnchor="middle"
                  fill="#f4f4f5"
                  className="font-bold text-[2px]"
                >
                  Ø {wheel.outerDiameter.toFixed(1)} mm
                </text>

                {/* Inner hole diameter annotation */}
                <line
                  x1={-innerR}
                  y1={-innerR - 1.5}
                  x2={innerR}
                  y2={-innerR - 1.5}
                  stroke="#38bdf8"
                  strokeWidth="0.2"
                />
                <text
                  x="0"
                  y={-innerR - 2}
                  textAnchor="middle"
                  fill="#38bdf8"
                  className="text-[1.8px]"
                >
                  Ø {wheel.innerDiameter.toFixed(1)} mm
                </text>

                {/* Start Marker Label */}
                {startPt && (
                  <text
                    x={startPt.x + 1.8}
                    y={startPt.y}
                    fill="#60a5fa"
                    className="text-[1.7px] font-bold"
                  >
                    START (r={spiral.startRadius.toFixed(1)})
                  </text>
                )}

                {/* End Marker Label */}
                {endPt && (
                  <text
                    x={endPt.x + 1.8}
                    y={endPt.y}
                    fill="#f87171"
                    className="text-[1.7px] font-bold"
                  >
                    ENDE (r={spiral.endRadius.toFixed(1)})
                  </text>
                )}

                {/* Nutbreite callout */}
                {frames[10] && (
                  <g transform={`translate(${frames[10].center.x}, ${frames[10].center.y})`}>
                    <line
                      x1={frames[10].normal.x * (spiral.grooveWidth / 2)}
                      y1={frames[10].normal.y * (spiral.grooveWidth / 2)}
                      x2={-frames[10].normal.x * (spiral.grooveWidth / 2)}
                      y2={-frames[10].normal.y * (spiral.grooveWidth / 2)}
                      stroke="#f59e0b"
                      strokeWidth="0.3"
                    />
                  </g>
                )}
              </g>
            )}

            {/* Technical Title Block in lower right */}
            <g transform={`translate(${viewExtent - 24}, ${viewExtent - 10})`}>
              <rect width="22" height="8" fill="#18181b" stroke="#3f3f46" strokeWidth="0.3" rx="0.5" />
              <text x="1.5" y="2.5" fill="#a1a1aa" className="text-[1.3px] font-mono">CAD: M4 Hop-Up Dial</text>
              <text x="1.5" y="4.5" fill="#e4e4e7" className="text-[1.5px] font-mono font-bold">
                {spiral.revolutions.toFixed(2)} Umdr. ({spiral.totalAngleDeg.toFixed(0)}°)
              </text>
              <text x="1.5" y="6.5" fill="#38bdf8" className="text-[1.3px] font-mono">
                Nut: {spiral.grooveWidth.toFixed(1)} x {spiral.grooveDepth.toFixed(1)} mm
              </text>
            </g>
          </svg>
        </div>
      </div>

      {/* Bottom Status bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-800 bg-zinc-900/80 text-[11px] font-mono text-zinc-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
            Startpunkt: r={spiral.startRadius.toFixed(2)} mm ({spiral.startAngleDeg.toFixed(0)}°)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            Endpunkt: r={spiral.endRadius.toFixed(2)} mm ({(spiral.startAngleDeg + spiral.totalAngleDeg).toFixed(0)}°)
          </span>
        </div>
        <div>
          Nutbreite: <strong className="text-zinc-200">{spiral.grooveWidth.toFixed(2)} mm</strong> | Stegbreite: <strong className={telemetry.minWallBetweenTurns !== null && telemetry.minWallBetweenTurns < 0.8 ? 'text-amber-400' : 'text-emerald-400'}>
            {telemetry.minWallBetweenTurns !== null ? `${telemetry.minWallBetweenTurns.toFixed(2)} mm` : '1-Gang (n/a)'}
          </strong>
        </div>
      </div>
    </div>
  );
};
