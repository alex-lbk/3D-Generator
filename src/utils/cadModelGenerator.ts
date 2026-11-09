import * as THREE from 'three';
import { Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg';
import { SpiralParameters, WheelParameters } from '../types/cad';
import { sampleSpiralFrames } from './spiralMath';

export interface GeneratedCADModel {
  meshGeometry: THREE.BufferGeometry;
  gradientRibbonGeometry: THREE.BufferGeometry;
  centerlinePoints: THREE.Vector3[];
  startPoint: THREE.Vector3;
  endPoint: THREE.Vector3;
}

/**
 * Creates the outer solid body of the wheel.
 * Supports:
 * 1. Standard cylindrical disk (outerDiameterTop == outerDiameterBottom)
 * 2. Conical truncated cone (Kegelstumpf) with linear taper across entire thickness
 * 3. Finger grip knurling notches (Rändelung) scaled to the perimeter on both cylindrical and conical bodies.
 */
export function createOuterSolidGeometry(wheel: WheelParameters): THREE.BufferGeometry {
  const rTop = wheel.outerDiameter / 2;
  // If conicalOuter is enabled, use outerDiameterBottom, else cylindrical (rTop == rBottom)
  const rBottom = wheel.conicalOuter
    ? Math.min(wheel.outerDiameter, wheel.outerDiameterBottom) / 2
    : rTop;
  const thickness = wheel.thickness;

  const numSegments =
    wheel.knurling && wheel.knurlCount >= 8
      ? Math.max(128, wheel.knurlCount * 6)
      : 96;

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  // Ring 0: Bottom contour at z = 0
  for (let i = 0; i < numSegments; i++) {
    const angle = (i / numSegments) * Math.PI * 2;
    const wave = wheel.knurling ? Math.pow(Math.cos(angle * wheel.knurlCount * 0.5), 2) : 0;
    const r = Math.max(0.5, rBottom - wave * wheel.knurlDepth);
    positions.push(r * Math.cos(angle), r * Math.sin(angle), 0);
    uvs.push(i / numSegments, 0);
  }

  // Ring 1: Top contour at z = thickness
  for (let i = 0; i < numSegments; i++) {
    const angle = (i / numSegments) * Math.PI * 2;
    const wave = wheel.knurling ? Math.pow(Math.cos(angle * wheel.knurlCount * 0.5), 2) : 0;
    const r = Math.max(0.5, rTop - wave * wheel.knurlDepth);
    positions.push(r * Math.cos(angle), r * Math.sin(angle), thickness);
    uvs.push(i / numSegments, 1);
  }

  // Side quads: connect Ring 0 to Ring 1 with outward-facing normals
  for (let i = 0; i < numSegments; i++) {
    const next = (i + 1) % numSegments;
    const b0 = i;
    const b1 = next;
    const t0 = numSegments + i;
    const t1 = numSegments + next;

    indices.push(b0, b1, t1);
    indices.push(b0, t1, t0);
  }

  // Bottom face center (z = 0)
  const botCenterIdx = positions.length / 3;
  positions.push(0, 0, 0);
  uvs.push(0.5, 0.5);

  // Bottom face fan (-Z normal)
  for (let i = 0; i < numSegments; i++) {
    const next = (i + 1) % numSegments;
    indices.push(botCenterIdx, next, i);
  }

  // Top face center (z = thickness)
  const topCenterIdx = positions.length / 3;
  positions.push(0, 0, thickness);
  uvs.push(0.5, 0.5);

  // Top face fan (+Z normal)
  for (let i = 0; i < numSegments; i++) {
    const next = (i + 1) % numSegments;
    const t0 = numSegments + i;
    const t1 = numSegments + next;
    indices.push(topCenterIdx, t0, t1);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Builds the bore cutter geometries to be subtracted from the outer solid.
 * Supports:
 * 1. Standard continuous cylindrical bore
 * 2. Stepped 2-diameter bore with a sharp 90-degree internal shoulder (keine Fase / Verrundung)
 */
export function createBoreCutterGeometries(wheel: WheelParameters): THREE.BufferGeometry[] {
  const delta = 0.4;
  const thickness = wheel.thickness;

  if (!wheel.steppedBore) {
    // Standard continuous cylindrical hole
    const r = wheel.innerDiameter / 2;
    const h = thickness + delta * 2;
    const geo = new THREE.CylinderGeometry(r, r, h, 64);
    geo.rotateX(Math.PI / 2);
    geo.translate(0, 0, thickness / 2);
    return [geo];
  }

  // Stepped bore: 2 cylindrical sections with a sharp, right-angle 90° step
  const rBottom = wheel.steppedBoreBottomDiameter / 2;
  const rTop = wheel.steppedBoreTopDiameter / 2;
  // Step height measured from underside
  const stepH = Math.min(thickness - 0.3, Math.max(0.3, wheel.steppedBoreHeight));

  // Section 1: Bottom section (from z = -delta to z = stepH)
  const hBot = stepH + delta;
  const geoBot = new THREE.CylinderGeometry(rBottom, rBottom, hBot, 64);
  geoBot.rotateX(Math.PI / 2);
  geoBot.translate(0, 0, -delta + hBot / 2);

  // Section 2: Top section (from z = stepH to z = thickness + delta)
  const hTop = thickness - stepH + delta;
  const geoTop = new THREE.CylinderGeometry(rTop, rTop, hTop, 64);
  geoTop.rotateX(Math.PI / 2);
  geoTop.translate(0, 0, stepH + hTop / 2);

  return [geoBot, geoTop];
}

/**
 * Builds the 3D spiral groove cutter body that will be subtracted from the top face of the wheel.
 */
export function createSpiralCutterGeometry(
  spiral: SpiralParameters,
  thickness: number
): THREE.BufferGeometry {
  const totalAngleRad = (spiral.totalAngleDeg * Math.PI) / 180;
  const numSteps = Math.max(80, Math.round(totalAngleRad * 35));
  const frames = sampleSpiralFrames(spiral, numSteps);

  const zBottom = thickness - spiral.grooveDepth;
  const zRoof = thickness + 0.4;

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i < frames.length; i++) {
    const f = frames[i];
    positions.push(f.pOut.x, f.pOut.y, zRoof);
    positions.push(f.pOut.x, f.pOut.y, zBottom);
    positions.push(f.pIn.x, f.pIn.y, zBottom);
    positions.push(f.pIn.x, f.pIn.y, zRoof);

    const u = f.t;
    uvs.push(u, 1, u, 0, u, 0, u, 1);
  }

  for (let i = 0; i < frames.length - 1; i++) {
    const rowA = i * 4;
    const rowB = (i + 1) * 4;

    indices.push(rowA + 0, rowB + 0, rowB + 1);
    indices.push(rowA + 0, rowB + 1, rowA + 1);

    indices.push(rowA + 1, rowB + 1, rowB + 2);
    indices.push(rowA + 1, rowB + 2, rowA + 2);

    indices.push(rowA + 2, rowB + 2, rowB + 3);
    indices.push(rowA + 2, rowB + 3, rowA + 3);

    indices.push(rowA + 3, rowB + 3, rowB + 0);
    indices.push(rowA + 3, rowB + 0, rowA + 0);
  }

  const halfW = spiral.grooveWidth / 2;

  // Start Cap (at i=0)
  if (spiral.capStyle === 'round') {
    const f0 = frames[0];
    const capSegments = 12;
    const centerBotIdx = positions.length / 3;
    positions.push(f0.center.x, f0.center.y, zBottom);
    uvs.push(0, 0.5);

    const centerTopIdx = positions.length / 3;
    positions.push(f0.center.x, f0.center.y, zRoof);
    uvs.push(0, 0.5);

    const capStartIdx = positions.length / 3;
    for (let k = 0; k <= capSegments; k++) {
      const alpha = (k / capSegments) * Math.PI;
      const cosA = Math.cos(alpha);
      const sinA = Math.sin(alpha);
      const ox = -cosA * f0.normal.x - sinA * f0.tangent.x;
      const oy = -cosA * f0.normal.y - sinA * f0.tangent.y;
      const x = f0.center.x + halfW * ox;
      const y = f0.center.y + halfW * oy;

      positions.push(x, y, zBottom);
      uvs.push(0, k / capSegments);
      positions.push(x, y, zRoof);
      uvs.push(0, k / capSegments);
    }

    for (let k = 0; k < capSegments; k++) {
      const pBotA = capStartIdx + k * 2;
      const pTopA = capStartIdx + k * 2 + 1;
      const pBotB = capStartIdx + (k + 1) * 2;
      const pTopB = capStartIdx + (k + 1) * 2 + 1;

      indices.push(centerBotIdx, pBotA, pBotB);
      indices.push(centerTopIdx, pTopB, pTopA);
      indices.push(pBotA, pTopA, pTopB);
      indices.push(pBotA, pTopB, pBotB);
    }
  } else {
    indices.push(0, 2, 1);
    indices.push(0, 3, 2);
  }

  // End Cap (at i = frames.length - 1)
  const lastI = frames.length - 1;
  const lastRow = lastI * 4;

  if (spiral.capStyle === 'round') {
    const fEnd = frames[lastI];
    const capSegments = 12;

    const centerBotIdx = positions.length / 3;
    positions.push(fEnd.center.x, fEnd.center.y, zBottom);
    uvs.push(1, 0.5);

    const centerTopIdx = positions.length / 3;
    positions.push(fEnd.center.x, fEnd.center.y, zRoof);
    uvs.push(1, 0.5);

    const capEndIdx = positions.length / 3;
    for (let k = 0; k <= capSegments; k++) {
      const alpha = (k / capSegments) * Math.PI;
      const cosA = Math.cos(alpha);
      const sinA = Math.sin(alpha);
      const ox = cosA * fEnd.normal.x + sinA * fEnd.tangent.x;
      const oy = cosA * fEnd.normal.y + sinA * fEnd.tangent.y;
      const x = fEnd.center.x + halfW * ox;
      const y = fEnd.center.y + halfW * oy;

      positions.push(x, y, zBottom);
      uvs.push(1, k / capSegments);
      positions.push(x, y, zRoof);
      uvs.push(1, k / capSegments);
    }

    for (let k = 0; k < capSegments; k++) {
      const pBotA = capEndIdx + k * 2;
      const pTopA = capEndIdx + k * 2 + 1;
      const pBotB = capEndIdx + (k + 1) * 2;
      const pTopB = capEndIdx + (k + 1) * 2 + 1;

      indices.push(centerBotIdx, pBotB, pBotA);
      indices.push(centerTopIdx, pTopA, pTopB);
      indices.push(pBotA, pTopB, pTopA);
      indices.push(pBotA, pBotB, pTopB);
    }
  } else {
    indices.push(lastRow + 0, lastRow + 1, lastRow + 2);
    indices.push(lastRow + 0, lastRow + 2, lastRow + 3);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

/**
 * Creates a colored ribbon geometry representing the spiral track
 * with a continuous Blue -> Magenta -> Red color gradient.
 */
export function createSpiralGradientRibbon(
  spiral: SpiralParameters,
  thickness: number
): THREE.BufferGeometry {
  const numSteps = 120;
  const frames = sampleSpiralFrames(spiral, numSteps);
  const z = thickness - spiral.grooveDepth + 0.05;

  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  const startColor = new THREE.Color(0x0284c7);
  const endColor = new THREE.Color(0xef4444);
  const tmpColor = new THREE.Color();

  for (let i = 0; i < frames.length; i++) {
    const f = frames[i];
    const t = f.t;
    tmpColor.copy(startColor).lerp(endColor, t);

    positions.push(f.pIn.x, f.pIn.y, z);
    colors.push(tmpColor.r, tmpColor.g, tmpColor.b);

    positions.push(f.pOut.x, f.pOut.y, z);
    colors.push(tmpColor.r, tmpColor.g, tmpColor.b);
  }

  for (let i = 0; i < frames.length - 1; i++) {
    const a = i * 2;
    const b = (i + 1) * 2;
    indices.push(a, b, b + 1);
    indices.push(a, b + 1, a + 1);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

// Global evaluator instance
const csgEvaluator = new Evaluator();

/**
 * Executes the full boolean CSG subtraction to carve the central bore
 * and the actual spiral groove out of the base Hop-Up wheel.
 */
export function generateHopUpDialCADModel(
  wheel: WheelParameters,
  spiral: SpiralParameters
): GeneratedCADModel {
  // 1. Create outer solid (conical or cylindrical, with or without knurling)
  const outerGeo = createOuterSolidGeometry(wheel);
  let currentBrush = new Brush(outerGeo);
  currentBrush.updateMatrixWorld();

  // 2. Subtract central bore cutter(s) (single through-hole or stepped 2-diameter 90° shoulder)
  const boreCutters = createBoreCutterGeometries(wheel);
  for (const boreGeo of boreCutters) {
    const boreBrush = new Brush(boreGeo);
    boreBrush.updateMatrixWorld();
    currentBrush = csgEvaluator.evaluate(currentBrush, boreBrush, SUBTRACTION);
    boreGeo.dispose();
  }

  // 3. Subtract Archimedean spiral cutter
  const cutterGeo = createSpiralCutterGeometry(spiral, wheel.thickness);
  const cutterBrush = new Brush(cutterGeo);
  cutterBrush.updateMatrixWorld();

  const finalResult = csgEvaluator.evaluate(currentBrush, cutterBrush, SUBTRACTION);

  const meshGeometry = finalResult.geometry.clone();
  meshGeometry.computeVertexNormals();
  meshGeometry.computeBoundingBox();
  meshGeometry.computeBoundingSphere();

  // Gradient visualization ribbon
  const gradientRibbonGeometry = createSpiralGradientRibbon(spiral, wheel.thickness);

  // Centerline guide points
  const centerlineFrames = sampleSpiralFrames(spiral, 100);
  const zSurface = wheel.thickness + 0.1;
  const centerlinePoints = centerlineFrames.map(
    (f) => new THREE.Vector3(f.center.x, f.center.y, zSurface)
  );

  const startPoint = new THREE.Vector3(
    centerlineFrames[0]?.center.x || 0,
    centerlineFrames[0]?.center.y || 0,
    zSurface
  );

  const endPoint = new THREE.Vector3(
    centerlineFrames[centerlineFrames.length - 1]?.center.x || 0,
    centerlineFrames[centerlineFrames.length - 1]?.center.y || 0,
    zSurface
  );

  outerGeo.dispose();
  cutterGeo.dispose();

  return {
    meshGeometry,
    gradientRibbonGeometry,
    centerlinePoints,
    startPoint,
    endPoint,
  };
}
