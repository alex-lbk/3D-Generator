import React from 'react';
import { Layers, ArrowDownUp, ShieldCheck, AlertTriangle } from 'lucide-react';
import { CalculatedTelemetry, SpiralParameters, WheelParameters } from '../types/cad';

interface CrossSectionViewProps {
  wheel: WheelParameters;
  spiral: SpiralParameters;
  telemetry: CalculatedTelemetry;
}

export const CrossSectionView: React.FC<CrossSectionViewProps> = ({
  wheel,
  spiral,
  telemetry,
}) => {
  const outerRTop = wheel.outerDiameter / 2;
  const outerRBot = wheel.conicalOuter ? Math.min(wheel.outerDiameter, wheel.outerDiameterBottom) / 2 : outerRTop;
  const innerRTop = wheel.steppedBore ? wheel.steppedBoreTopDiameter / 2 : wheel.innerDiameter / 2;
  const innerRBot = wheel.steppedBore ? wheel.steppedBoreBottomDiameter / 2 : wheel.innerDiameter / 2;
  const stepHeight = wheel.steppedBoreHeight;
  const stepY = wheel.thickness - stepHeight; // Y in SVG where step occurs (measured from top)

  const thickness = wheel.thickness;
  const depth = spiral.grooveDepth;
  const floor = thickness - depth;
  const width = spiral.grooveWidth;

  // Sample the groove locations along a radial cut ray (angle = 0)
  const totalAngleRad = (spiral.totalAngleDeg * Math.PI) / 180;
  const grooveRadii: number[] = [];

  const startAngleRad = (spiral.startAngleDeg * Math.PI) / 180;
  for (let k = -2; k <= 10; k++) {
    const angleTarget = k * Math.PI * 2;
    const theta = angleTarget - startAngleRad;
    if (theta >= -0.01 && theta <= totalAngleRad + 0.01) {
      const clampedTheta = Math.max(0, Math.min(totalAngleRad, theta));
      const t = clampedTheta / totalAngleRad;
      const r = spiral.startRadius + (spiral.endRadius - spiral.startRadius) * t;
      grooveRadii.push(r);
    }
  }

  if (grooveRadii.length === 0) {
    const revs = Math.max(1, Math.round(spiral.revolutions));
    for (let i = 0; i < revs; i++) {
      grooveRadii.push(spiral.startRadius + (i / revs) * (spiral.endRadius - spiral.startRadius));
    }
  }

  // ViewBox layout (in mm coordinates)
  const maxOuterR = Math.max(outerRTop, outerRBot);
  const padX = 7;
  const padY = 6;
  const minX = -(maxOuterR + padX);
  const widthX = (maxOuterR + padX) * 2;
  const minY = -padY;
  const heightY = thickness + padY * 2;

  return (
    <div className="relative w-full h-full flex flex-col bg-zinc-950 text-zinc-100 select-none overflow-hidden">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/60 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-mono font-medium tracking-wide text-zinc-300">
            SCHNITTANSICHT A-A (RADIALER QUERSCHNITT)
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
            Dicke {thickness.toFixed(2)} mm / Nuttiefe {depth.toFixed(2)} mm
          </span>
          {wheel.conicalOuter && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-300">
              Konisch (Ø{wheel.outerDiameter.toFixed(1)} → Ø{wheel.outerDiameterBottom.toFixed(1)})
            </span>
          )}
          {wheel.steppedBore && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800/60 text-amber-300">
              90°-Stufe (h={stepHeight.toFixed(1)}mm)
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-zinc-400">
            <ArrowDownUp className="w-3.5 h-3.5 text-cyan-400" />
            Restboden:
            <strong className={floor < 0.8 ? 'text-amber-400' : 'text-emerald-400'}>
              {floor.toFixed(2)} mm
            </strong>
          </span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-hidden">
        <div className="w-full h-full max-w-4xl max-h-[500px] flex items-center justify-center">
          <svg
            viewBox={`${minX} ${minY} ${widthX} ${heightY}`}
            className="w-full h-full overflow-visible drop-shadow-2xl"
          >
            <defs>
              <pattern
                id="cross-hatch"
                width="1.8"
                height="1.8"
                patternTransform="rotate(45 0 0)"
                patternUnits="userSpaceOnUse"
              >
                <line x1="0" y1="0" x2="0" y2="1.8" stroke="#38bdf8" strokeWidth="0.25" opacity="0.4" />
              </pattern>
            </defs>

            {/* Symmetry centerline (Z-axis) */}
            <line
              x1="0"
              y1={minY + 1}
              x2="0"
              y2={thickness + padY - 1}
              stroke="#52525b"
              strokeWidth="0.2"
              strokeDasharray="1.5,0.5,0.3,0.5"
            />

            {/* Solid Disk Cross-section Polygons with Groove Notches */}
            {[-1, 1].map((side) => {
              const rTopOut = outerRTop * side;
              const rBotOut = outerRBot * side;
              const rTopIn = innerRTop * side;
              const rBotIn = innerRBot * side;

              // Top segments interrupted by groove cuts
              const topSegments: { x: number; y: number }[] = [];
              topSegments.push({ x: rTopIn, y: 0 });

              const cuts = [...grooveRadii].sort((a, b) => a - b);
              for (const r of cuts) {
                const gStart = (r - width / 2) * side;
                const gEnd = (r + width / 2) * side;
                const leftCut = Math.min(gStart, gEnd);
                const rightCut = Math.max(gStart, gEnd);

                const minMat = Math.min(rTopIn, rTopOut);
                const maxMat = Math.max(rTopIn, rTopOut);

                if (rightCut > minMat && leftCut < maxMat) {
                  const cutLeftClamped = Math.max(minMat, leftCut);
                  const cutRightClamped = Math.min(maxMat, rightCut);

                  if (side > 0) {
                    topSegments.push({ x: cutLeftClamped, y: 0 });
                    topSegments.push({ x: cutLeftClamped, y: depth });
                    topSegments.push({ x: cutRightClamped, y: depth });
                    topSegments.push({ x: cutRightClamped, y: 0 });
                  } else {
                    topSegments.push({ x: cutRightClamped, y: 0 });
                    topSegments.push({ x: cutRightClamped, y: depth });
                    topSegments.push({ x: cutLeftClamped, y: depth });
                    topSegments.push({ x: cutLeftClamped, y: 0 });
                  }
                }
              }

              topSegments.push({ x: rTopOut, y: 0 });

              // Build polygon path
              let d = `M ${topSegments[0].x.toFixed(3)} ${topSegments[0].y.toFixed(3)} `;
              for (let i = 1; i < topSegments.length; i++) {
                d += `L ${topSegments[i].x.toFixed(3)} ${topSegments[i].y.toFixed(3)} `;
              }

              // Outer edge (slanted if conical, vertical if cylindrical)
              d += `L ${rBotOut.toFixed(3)} ${thickness.toFixed(3)} `;

              // Bottom edge towards inner bore
              d += `L ${rBotIn.toFixed(3)} ${thickness.toFixed(3)} `;

              if (wheel.steppedBore) {
                // Stepped inner bore: up to stepY, horizontal 90° shoulder to rTopIn, then up to top
                d += `L ${rBotIn.toFixed(3)} ${stepY.toFixed(3)} `;
                d += `L ${rTopIn.toFixed(3)} ${stepY.toFixed(3)} `;
                d += `L ${rTopIn.toFixed(3)} 0 `;
              } else {
                // Single continuous vertical bore wall
                d += `L ${rTopIn.toFixed(3)} 0 `;
              }

              d += 'Z';

              return (
                <g key={side}>
                  <path d={d} fill="#18181b" />
                  <path d={d} fill="url(#cross-hatch)" />
                  <path d={d} fill="none" stroke="#e4e4e7" strokeWidth="0.35" />
                </g>
              );
            })}

            {/* Dimension Lines */}
            {/* Total Thickness T (Right side) */}
            <g transform={`translate(${maxOuterR + 2.5}, 0)`}>
              <line x1="0" y1="0" x2="0" y2={thickness} stroke="#a1a1aa" strokeWidth="0.25" />
              <line x1="-1.5" y1="0" x2="1" y2="0" stroke="#71717a" strokeWidth="0.2" />
              <line x1="-1.5" y1={thickness} x2="1" y2={thickness} stroke="#71717a" strokeWidth="0.2" />
              <text x="1.5" y={thickness / 2 + 0.4} fill="#f4f4f5" className="text-[1.4px] font-mono font-bold">
                T = {thickness.toFixed(2)} mm
              </text>
            </g>

            {/* Groove Depth d & Floor (Left side) */}
            <g transform={`translate(${-(maxOuterR + 2.5)}, 0)`}>
              <line x1="0" y1="0" x2="0" y2={depth} stroke="#38bdf8" strokeWidth="0.25" />
              <line x1="-1" y1="0" x2="1.5" y2="0" stroke="#71717a" strokeWidth="0.2" />
              <line x1="-1" y1={depth} x2="1.5" y2={depth} stroke="#71717a" strokeWidth="0.2" />
              <text x="-1.5" y={depth / 2 + 0.4} textAnchor="end" fill="#38bdf8" className="text-[1.3px] font-mono font-bold">
                Tiefe: {depth.toFixed(2)} mm
              </text>

              <line x1="0" y1={depth} x2="0" y2={thickness} stroke="#10b981" strokeWidth="0.25" />
              <line x1="-1" y1={thickness} x2="1.5" y2={thickness} stroke="#71717a" strokeWidth="0.2" />
              <text x="-1.5" y={depth + floor / 2 + 0.4} textAnchor="end" fill="#10b981" className="text-[1.3px] font-mono font-bold">
                Boden: {floor.toFixed(2)} mm
              </text>
            </g>

            {/* Top Outer Diameter */}
            <g transform={`translate(0, -2.5)`}>
              <line x1={-outerRTop} y1="0" x2={outerRTop} y2="0" stroke="#a1a1aa" strokeWidth="0.25" />
              <line x1={-outerRTop} y1="-0.8" x2={-outerRTop} y2="1.5" stroke="#71717a" strokeWidth="0.2" />
              <line x1={outerRTop} y1="-0.8" x2={outerRTop} y2="1.5" stroke="#71717a" strokeWidth="0.2" />
              <text x="0" y="-1.2" textAnchor="middle" fill="#f4f4f5" className="text-[1.5px] font-mono font-bold">
                Ø Top = {wheel.outerDiameter.toFixed(1)} mm
              </text>
            </g>

            {/* Bottom Outer Diameter (if conical) */}
            {wheel.conicalOuter && (
              <g transform={`translate(0, ${thickness + 4.5})`}>
                <line x1={-outerRBot} y1="0" x2={outerRBot} y2="0" stroke="#f59e0b" strokeWidth="0.25" />
                <line x1={-outerRBot} y1="-1.5" x2={-outerRBot} y2="0.8" stroke="#f59e0b" strokeWidth="0.2" />
                <line x1={outerRBot} y1="-1.5" x2={outerRBot} y2="0.8" stroke="#f59e0b" strokeWidth="0.2" />
                <text x="0" y="2.0" textAnchor="middle" fill="#f59e0b" className="text-[1.4px] font-mono font-bold">
                  Ø Bottom = {wheel.outerDiameterBottom.toFixed(1)} mm (Konisch)
                </text>
              </g>
            )}

            {/* Stepped Bore Shoulder Annotation */}
            {wheel.steppedBore ? (
              <g transform={`translate(0, ${stepY})`}>
                {/* Horizontal shoulder 90 deg marker */}
                <line x1={-innerRBot} y1="0" x2={-innerRTop} y2="0" stroke="#fbbf24" strokeWidth="0.35" />
                <line x1={innerRTop} y1="0" x2={innerRBot} y2="0" stroke="#fbbf24" strokeWidth="0.35" />
                <text x="0" y="-0.8" textAnchor="middle" fill="#fbbf24" className="text-[1.2px] font-mono font-bold">
                  90°-Stufe (h={stepHeight.toFixed(1)}mm)
                </text>

                {/* Bottom bore diameter */}
                <text x="0" y={stepHeight / 2 + 0.4} textAnchor="middle" fill="#amber-400" className="text-[1.3px] font-mono">
                  Bohrung 1: Ø {wheel.steppedBoreBottomDiameter.toFixed(1)} mm
                </text>

                {/* Top bore diameter */}
                <text x="0" y={-stepY / 2} textAnchor="middle" fill="#38bdf8" className="text-[1.3px] font-mono">
                  Bohrung 2: Ø {wheel.steppedBoreTopDiameter.toFixed(1)} mm
                </text>
              </g>
            ) : (
              /* Single Bore Annotation */
              <g transform={`translate(0, ${thickness + 2.5})`}>
                <line x1={-innerRTop} y1="0" x2={innerRTop} y2="0" stroke="#38bdf8" strokeWidth="0.25" />
                <line x1={-innerRTop} y1="-1.5" x2={-innerRTop} y2="0.8" stroke="#71717a" strokeWidth="0.2" />
                <line x1={innerRTop} y1="-1.5" x2={innerRTop} y2="0.8" stroke="#71717a" strokeWidth="0.2" />
                <text x="0" y="1.8" textAnchor="middle" fill="#38bdf8" className="text-[1.4px] font-mono">
                  Bohrung Ø {wheel.innerDiameter.toFixed(1)} mm
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Technical Data Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-3xl mt-4">
          <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
            <span className="text-[11px] font-mono text-zinc-400 block">Gesamtdicke (T)</span>
            <span className="text-sm font-mono font-bold text-zinc-100">{thickness.toFixed(2)} mm</span>
          </div>

          <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
            <span className="text-[11px] font-mono text-cyan-400 block">Nuttiefe (d)</span>
            <span className="text-sm font-mono font-bold text-cyan-300">{depth.toFixed(2)} mm</span>
          </div>

          <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
            <span className="text-[11px] font-mono text-amber-400 block">Außenform</span>
            <span className="text-sm font-mono font-bold text-amber-300">
              {wheel.conicalOuter ? `Konisch (Ø${wheel.outerDiameter.toFixed(0)}/Ø${wheel.outerDiameterBottom.toFixed(0)})` : 'Zylindrisch'}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
            <span className="text-[11px] font-mono text-emerald-400 block">Innenbohrung</span>
            <span className="text-sm font-mono font-bold text-emerald-300">
              {wheel.steppedBore ? `Zweistufig (h=${stepHeight.toFixed(1)}mm)` : `Ø ${wheel.innerDiameter.toFixed(1)} mm`}
            </span>
          </div>
        </div>
      </div>

      {/* Safety info bar */}
      <div className="px-4 py-2 border-t border-zinc-800 bg-zinc-900/80 text-[11px] font-mono flex items-center justify-between">
        <div className="flex items-center gap-2">
          {floor >= 0.8 ? (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span className="text-zinc-300">
            {floor >= 0.8
              ? 'Ausreichende Restbodenstärke für stabilen FDM-3D-Druck (mind. 0,8 mm).'
              : 'Warnung: Restbodenstärke ist gering. Kann beim Drucken oder unter Federlast brechen!'}
          </span>
        </div>
        <span className="text-zinc-500">Konstante Nuttiefe über 100% des Verlaufs</span>
      </div>
    </div>
  );
};
