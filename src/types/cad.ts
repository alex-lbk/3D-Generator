export interface WheelParameters {
  outerDiameter: number; // mm (top diameter where spiral groove sits, e.g. 25.0)
  innerDiameter: number; // mm (standard continuous bore diameter, e.g. 10.0)
  thickness: number; // mm (e.g. 4.0)
  knurling: boolean; // outer rim finger grip notches
  knurlCount: number; // number of grip notches
  knurlDepth: number; // depth of notches in mm

  // 1. Konische Außenform (Kegelstumpf)
  conicalOuter: boolean; // toggle conical outer shape
  outerDiameterBottom: number; // mm (bottom diameter, smaller than top diameter)

  // 2. Zweistufige zentrale Innenbohrung
  steppedBore: boolean; // toggle stepped 2-diameter bore with 90° shoulder
  steppedBoreBottomDiameter: number; // mm (section 1 diameter from underside)
  steppedBoreTopDiameter: number; // mm (section 2 diameter towards top)
  steppedBoreHeight: number; // mm (height of section 1 measured from underside)
}

export interface SpiralParameters {
  revolutions: number; // e.g. 1.25
  totalAngleDeg: number; // e.g. 450 (coupled to revolutions * 360)
  startRadius: number; // mm (inner start)
  endRadius: number; // mm (outer end)
  startAngleDeg: number; // degrees (angle offset)
  grooveWidth: number; // mm (constant width perpendicular to path)
  grooveDepth: number; // mm (constant depth)
  capStyle: 'round' | 'flat'; // round (CNC endmill style) or flat
}

export interface SafetyParameters {
  minWallThickness: number; // mm (e.g. 0.8 mm)
}

export interface CalculatedTelemetry {
  totalRadialTravel: number; // delta r (mm)
  radialPer360: number; // mm per 360 deg
  radialPer90: number; // mm per 90 deg
  radialPerDeg: number; // mm per deg
  radialPerDegMicrons: number; // micrometers per degree
  totalAngleDeg: number;
  revolutions: number;
  actualGrooveWidth: number;
  minWallBetweenTurns: number | null; // null if <= 1 turn
  wallToInnerHole: number;
  wallToOuterRim: number;
  remainingFloorThickness: number;
  hasIntersections: boolean;
  isValid: boolean;
  canExport: boolean;
  errors: string[];
  warnings: string[];
}

export type ViewTab = '3d' | '2d' | 'crossSection';

export type MaterialPreset = 'delrin_black' | 'gunmetal' | 'anodized_red' | 'brass_gold' | 'neon_cad';

export interface ViewSettings {
  activeTab: ViewTab;
  materialPreset: MaterialPreset;
  showGradient: boolean; // blue -> red spiral gradient
  wireframe: boolean;
  showCenterlines: boolean;
  autoRotate: boolean;
  cameraPreset: 'iso' | 'top' | 'bottom' | 'side';
}

export interface HopUpPreset {
  id: string;
  name: string;
  description: string;
  wheel: WheelParameters;
  spiral: SpiralParameters;
  safety: SafetyParameters;
}
