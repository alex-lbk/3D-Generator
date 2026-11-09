import { CalculatedTelemetry, SafetyParameters, SpiralParameters, WheelParameters } from '../types/cad';
import { sampleSpiralFrames } from './spiralMath';

/**
 * Calculates telemetry and validates wall thicknesses and safety constraints.
 */
export function calculateTelemetryAndValidation(
  wheel: WheelParameters,
  spiral: SpiralParameters,
  safety: SafetyParameters
): CalculatedTelemetry {
  const errors: string[] = [];
  const warnings: string[] = [];

  const totalRadialTravel = spiral.endRadius - spiral.startRadius;
  const revolutions = spiral.revolutions;
  const totalAngleDeg = spiral.totalAngleDeg;

  // Fine tuning telemetry
  const radialPer360 = revolutions > 0 ? totalRadialTravel / revolutions : 0;
  const radialPer90 = radialPer360 / 4;
  const radialPerDeg = totalAngleDeg > 0 ? totalRadialTravel / totalAngleDeg : 0;
  const radialPerDegMicrons = radialPerDeg * 1000;

  const actualGrooveWidth = spiral.grooveWidth;
  const outerRadius = wheel.outerDiameter / 2;
  const innerRadius = wheel.steppedBore ? wheel.steppedBoreTopDiameter / 2 : wheel.innerDiameter / 2;
  const remainingFloorThickness = wheel.thickness - spiral.grooveDepth;

  // Basic geometric validity
  if (!wheel.steppedBore && wheel.innerDiameter >= wheel.outerDiameter) {
    errors.push('Grundkörper: Der Innendurchmesser muss kleiner als der Außendurchmesser sein.');
  }

  // Conical checks
  if (wheel.conicalOuter) {
    if (wheel.outerDiameterBottom > wheel.outerDiameter) {
      warnings.push('Konische Form: Der untere Durchmesser ist größer als der obere Durchmesser (Verjüngung nach oben statt unten).');
    }
    if (wheel.outerDiameterBottom <= 0) {
      errors.push('Konische Form: Der untere Durchmesser muss größer als 0 sein.');
    }
    const bottomBore = wheel.steppedBore ? wheel.steppedBoreBottomDiameter : wheel.innerDiameter;
    if (bottomBore >= wheel.outerDiameterBottom) {
      errors.push('Konische Form: Die zentrale Bohrung bricht an der Unterseite durch den Außenrand.');
    }
  }

  // Stepped bore checks
  if (wheel.steppedBore) {
    if (wheel.steppedBoreHeight >= wheel.thickness) {
      errors.push(`Zweistufige Bohrung: Die Stufenhöhe (${wheel.steppedBoreHeight.toFixed(2)} mm) darf die Gesamtdicke (${wheel.thickness.toFixed(2)} mm) nicht erreichen.`);
    }
    if (wheel.steppedBoreTopDiameter >= wheel.outerDiameter) {
      errors.push('Zweistufige Bohrung: Der obere Bohrungsdurchmesser ist größer als der Außendurchmesser.');
    }
    const effectiveOuterBottom = wheel.conicalOuter ? wheel.outerDiameterBottom : wheel.outerDiameter;
    if (wheel.steppedBoreBottomDiameter >= effectiveOuterBottom) {
      errors.push('Zweistufige Bohrung: Der untere Bohrungsdurchmesser ist größer als der Außendurchmesser an der Unterseite.');
    }
    // Check if bottom bore overlaps into groove floor
    const grooveBottomZ = wheel.thickness - spiral.grooveDepth;
    if (wheel.steppedBoreHeight > grooveBottomZ) {
      const rBotBore = wheel.steppedBoreBottomDiameter / 2;
      const rGrooveStartInner = spiral.startRadius - spiral.grooveWidth / 2;
      if (rBotBore >= rGrooveStartInner) {
        errors.push('Zweistufige Bohrung: Die untere Stufe schneidet vertikal in die Spiralnut ein (Bodendurchbruch).');
      }
    }
  }

  if (spiral.startRadius >= spiral.endRadius) {
    errors.push('Spirale: Der Start-Radius muss kleiner als der End-Radius sein.');
  }
  if (spiral.grooveDepth >= wheel.thickness) {
    errors.push(
      `Nuttiefe (${spiral.grooveDepth.toFixed(2)} mm) darf die Gesamtdicke (${wheel.thickness.toFixed(2)} mm) nicht erreichen oder überschreiten (Durchbruch).`
    );
  }

  // Sample dense frames for distance analysis
  const frames = sampleSpiralFrames(spiral, 400);

  // 1. Distance to central opening (inner bore at top surface where groove sits)
  let minDistanceToCenter = Infinity;
  for (const f of frames) {
    // Check distance of inner rail from origin
    const distIn = Math.hypot(f.pIn.x, f.pIn.y);
    if (distIn < minDistanceToCenter) minDistanceToCenter = distIn;
  }
  // Also account for start cap if round
  const startCapDist = Math.hypot(frames[0]?.center.x || 0, frames[0]?.center.y || 0) - spiral.grooveWidth / 2;
  minDistanceToCenter = Math.min(minDistanceToCenter, startCapDist);

  const wallToInnerHole = minDistanceToCenter - innerRadius;

  // 2. Distance to outer rim
  let maxDistanceToCenter = 0;
  for (const f of frames) {
    const distOut = Math.hypot(f.pOut.x, f.pOut.y);
    if (distOut > maxDistanceToCenter) maxDistanceToCenter = distOut;
  }
  const endCapDist = Math.hypot(frames[frames.length - 1]?.center.x || 0, frames[frames.length - 1]?.center.y || 0) + spiral.grooveWidth / 2;
  maxDistanceToCenter = Math.max(maxDistanceToCenter, endCapDist);

  // Effective outer rim accounting for knurl notches
  const effectiveOuterRadius = wheel.knurling ? outerRadius - wheel.knurlDepth : outerRadius;
  const wallToOuterRim = effectiveOuterRadius - maxDistanceToCenter;

  // 3. Wall thickness between adjacent spiral turns
  let minWallBetweenTurns: number | null = null;
  let hasIntersections = false;

  if (revolutions > 1.0) {
    // For spirals with more than 1 turn, compare turn i with turn i+1
    const totalAngleRad = (spiral.totalAngleDeg * Math.PI) / 180;
    const twoPi = Math.PI * 2;
    let minWall = Infinity;

    // Check each frame against the point 360 degrees later
    for (let i = 0; i < frames.length; i++) {
      const f1 = frames[i];
      const targetTheta = f1.theta + twoPi;
      if (targetTheta > totalAngleRad) break;

      // Find frame closest to targetTheta
      const tTarget = targetTheta / totalAngleRad;
      const j = Math.min(frames.length - 1, Math.round(tTarget * (frames.length - 1)));
      const f2 = frames[j];

      // Distance between outer edge of inner loop (f1.pOut) and inner edge of outer loop (f2.pIn)
      const dist = Math.hypot(f2.pIn.x - f1.pOut.x, f2.pIn.y - f1.pOut.y);

      // Check if self-intersecting: if the inner loop's outer rail has a radius greater than
      // outer loop's inner rail along that angle ray
      const r_f1_pOut = Math.hypot(f1.pOut.x, f1.pOut.y);
      const r_f2_pIn = Math.hypot(f2.pIn.x, f2.pIn.y);

      if (r_f1_pOut > r_f2_pIn) {
        hasIntersections = true;
        minWall = -Math.abs(r_f1_pOut - r_f2_pIn);
        break;
      }

      if (dist < minWall) {
        minWall = dist;
      }
    }

    minWallBetweenTurns = Number.isFinite(minWall) ? minWall : null;
  }

  // Safety checks & warnings/errors
  if (hasIntersections || (minWallBetweenTurns !== null && minWallBetweenTurns <= 0)) {
    errors.push('Kritisch: Spiralwindungen überschneiden sich! Die Nutbreite ist zu groß für den radialen Steigungsweg.');
  } else if (minWallBetweenTurns !== null && minWallBetweenTurns < safety.minWallThickness) {
    warnings.push(
      `Wandstärke zwischen Windungen (${minWallBetweenTurns.toFixed(2)} mm) unterschreitet Mindestwandstärke (${safety.minWallThickness.toFixed(2)} mm).`
    );
  }

  if (wallToInnerHole <= 0) {
    errors.push(`Kritisch: Nut bricht in die zentrale Achsbohrung ein (Überhang: ${Math.abs(wallToInnerHole).toFixed(2)} mm)!`);
  } else if (wallToInnerHole < safety.minWallThickness) {
    warnings.push(
      `Wandstärke zur Innenbohrung (${wallToInnerHole.toFixed(2)} mm) ist geringer als Mindestwandstärke (${safety.minWallThickness.toFixed(2)} mm).`
    );
  }

  if (wallToOuterRim <= 0) {
    errors.push(`Kritisch: Nut schneidet über den Außenrand hinaus (${Math.abs(wallToOuterRim).toFixed(2)} mm Überhang)!`);
  } else if (wallToOuterRim < safety.minWallThickness) {
    warnings.push(
      `Wandstärke zum Außenrand (${wallToOuterRim.toFixed(2)} mm) ist geringer als Mindestwandstärke (${safety.minWallThickness.toFixed(2)} mm).`
    );
  }

  if (remainingFloorThickness <= 0) {
    errors.push('Kritisch: Kein Restboden unter der Nut vorhanden (voller Durchbruch)!');
  } else if (remainingFloorThickness < safety.minWallThickness) {
    warnings.push(
      `Restbodendicke unter der Nut (${remainingFloorThickness.toFixed(2)} mm) ist geringer als Mindestwandstärke (${safety.minWallThickness.toFixed(2)} mm).`
    );
  }

  const isValid = errors.length === 0;
  const canExport = isValid && !hasIntersections;

  return {
    totalRadialTravel,
    radialPer360,
    radialPer90,
    radialPerDeg,
    radialPerDegMicrons,
    totalAngleDeg,
    revolutions,
    actualGrooveWidth,
    minWallBetweenTurns,
    wallToInnerHole,
    wallToOuterRim,
    remainingFloorThickness,
    hasIntersections,
    isValid,
    canExport,
    errors,
    warnings,
  };
}
