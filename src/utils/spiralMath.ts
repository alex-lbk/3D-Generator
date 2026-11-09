import { SpiralParameters, WheelParameters } from '../types/cad';

export interface SpiralPoint2D {
  x: number;
  y: number;
  radius: number;
  angleRad: number;
  t: number; // 0..1
}

export interface SpiralFrame2D {
  t: number;
  theta: number; // 0..totalAngleRad
  center: SpiralPoint2D;
  tangent: { x: number; y: number };
  normal: { x: number; y: number };
  pOut: { x: number; y: number };
  pIn: { x: number; y: number };
}

/**
 * Calculates Archimedean spiral centerline and perpendicular normal offset boundary curves.
 * Equation:
 * r(theta) = r_start + (r_end - r_start) * (theta / theta_max)
 * with theta in [0, theta_max].
 *
 * Normal vector is strictly perpendicular to the curve tangent:
 * C(theta) = (r(theta)*cos(phi), r(theta)*sin(phi)) where phi = startAngle + theta
 * dC/dtheta = (r' * cos(phi) - r * sin(phi), r' * sin(phi) + r * cos(phi))
 * T = dC / |dC|
 * N = (-T_y, T_x)
 * P_out = C + (w / 2) * N
 * P_in  = C - (w / 2) * N
 */
export function sampleSpiralFrames(spiral: SpiralParameters, numSamples: number = 200): SpiralFrame2D[] {
  const totalAngleRad = (spiral.totalAngleDeg * Math.PI) / 180;
  const startAngleRad = (spiral.startAngleDeg * Math.PI) / 180;
  const halfW = spiral.grooveWidth / 2;
  const deltaR = spiral.endRadius - spiral.startRadius;
  const dr_dtheta = totalAngleRad > 0.0001 ? deltaR / totalAngleRad : 0;

  const frames: SpiralFrame2D[] = [];

  for (let i = 0; i <= numSamples; i++) {
    const t = i / numSamples;
    const theta = t * totalAngleRad;
    const r = spiral.startRadius + deltaR * t;
    const phi = startAngleRad + theta;

    const cosPhi = Math.cos(phi);
    const sinPhi = Math.sin(phi);

    // Centerline point
    const cx = r * cosPhi;
    const cy = r * sinPhi;

    // Tangent derivative dC/dtheta
    const tx = dr_dtheta * cosPhi - r * sinPhi;
    const ty = dr_dtheta * sinPhi + r * cosPhi;
    const len = Math.hypot(tx, ty) || 1e-6;

    const unitTx = tx / len;
    const unitTy = ty / len;

    // Outward unit normal: 90 deg counter-clockwise from tangent
    const nx = -unitTy;
    const ny = unitTx;

    // Boundaries of constant width w
    const pox = cx + halfW * nx;
    const poy = cy + halfW * ny;

    const pix = cx - halfW * nx;
    const piy = cy - halfW * ny;

    frames.push({
      t,
      theta,
      center: { x: cx, y: cy, radius: r, angleRad: phi, t },
      tangent: { x: unitTx, y: unitTy },
      normal: { x: nx, y: ny },
      pOut: { x: pox, y: poy },
      pIn: { x: pix, y: piy },
    });
  }

  return frames;
}

/**
 * Generates the full 2D closed polygon outline of the groove footprint,
 * including end caps (round or flat).
 */
export function getGroovePolygon2D(spiral: SpiralParameters, numSamples: number = 240): { x: number; y: number }[] {
  const frames = sampleSpiralFrames(spiral, numSamples);
  if (frames.length < 2) return [];

  const halfW = spiral.grooveWidth / 2;
  const polygon: { x: number; y: number }[] = [];

  // Outer rail: from start (t=0) to end (t=1)
  for (let i = 0; i < frames.length; i++) {
    polygon.push({ x: frames[i].pOut.x, y: frames[i].pOut.y });
  }

  // End cap (at t=1)
  const lastFrame = frames[frames.length - 1];
  if (spiral.capStyle === 'round') {
    // Semicircle from +N around +T to -N
    const capSteps = 16;
    for (let k = 1; k < capSteps; k++) {
      const alpha = (k / capSteps) * Math.PI; // 0 to PI
      // At alpha=0: +N, at alpha=PI/2: +T, at alpha=PI: -N
      const cosA = Math.cos(alpha);
      const sinA = Math.sin(alpha);
      const capX = lastFrame.center.x + halfW * (cosA * lastFrame.normal.x + sinA * lastFrame.tangent.x);
      const capY = lastFrame.center.y + halfW * (cosA * lastFrame.normal.y + sinA * lastFrame.tangent.y);
      polygon.push({ x: capX, y: capY });
    }
  }

  // Inner rail: from end (t=1) backwards to start (t=0)
  for (let i = frames.length - 1; i >= 0; i--) {
    polygon.push({ x: frames[i].pIn.x, y: frames[i].pIn.y });
  }

  // Start cap (at t=0)
  const firstFrame = frames[0];
  if (spiral.capStyle === 'round') {
    // Semicircle from -N around -T to +N
    const capSteps = 16;
    for (let k = 1; k < capSteps; k++) {
      const alpha = (k / capSteps) * Math.PI; // 0 to PI
      // At alpha=0: -N, at alpha=PI/2: -T, at alpha=PI: +N
      const cosA = Math.cos(alpha);
      const sinA = Math.sin(alpha);
      const capX = firstFrame.center.x + halfW * (-cosA * firstFrame.normal.x - sinA * firstFrame.tangent.x);
      const capY = firstFrame.center.y + halfW * (-cosA * firstFrame.normal.y - sinA * firstFrame.tangent.y);
      polygon.push({ x: capX, y: capY });
    }
  }

  return polygon;
}
