import React, { useState } from 'react';
import {
  Info,
  Cpu,
  Layers,
  Sparkles,
  Download,
  Github,
  CheckCircle2,
  Calendar,
  Code2,
  Package,
  Wrench,
  ShieldCheck,
  FileCode,
} from 'lucide-react';
import JSZip from 'jszip';

export const AboutSection: React.FC = () => {
  const [isExportingZip, setIsExportingZip] = useState(false);

  const handleDownloadProjectZip = async () => {
    setIsExportingZip(true);
    try {
      const zip = new JSZip();

      // Readme & Project manifest
      zip.file(
        'README.md',
        `# M4 Hop-Up Dial CAD Generator v2.0.0

A parametric CAD web application for generating custom, 3D-printable M4/AR-15 Airsoft Hop-Up adjustment dials with true Archimedean spiral grooves and watertight CSG booleans.

## Features
- Watertight CAD Mesh generation via three-bvh-csg
- True Archimedean Spiral groove with constant normal-width offset
- Conical outer body option
- Stepped inner bore with flat 90° shoulder
- Real-time wall thickness and geometry safety verification
- High-precision binary STL and 3MF production export
- Multiple viewport inspection modes (3D orbit, 2D technical drawing, axial cross-section)

## Version
2.0.0 (Release 2026)
`
      );

      zip.file(
        'project-info.json',
        JSON.stringify(
          {
            name: 'm4-hopup-dial-generator',
            version: '2.0.0',
            license: 'Non-Commercial / Personal Use Only',
            techStack: [
              'React 19',
              'TypeScript',
              'Tailwind CSS v4',
              'Three.js',
              'three-bvh-csg',
              'JSZip',
            ],
            exportFormats: ['STL (Binary Little-Endian)', '3MF (Production Extension)'],
          },
          null,
          2
        )
      );

      zip.file(
        'DEFAULT_PRESETS.json',
        JSON.stringify(
          [
            {
              id: 'm4_standard',
              name: 'Standard M4 Rotary (1.25 Umdr.)',
              outerDiameter: 22.0,
              innerDiameter: 8.0,
              totalThickness: 4.0,
              spiralRotations: 1.25,
              spiralTotalAngle: 450,
              spiralStartRadius: 5.5,
              spiralEndRadius: 9.5,
              grooveWidth: 1.6,
              grooveDepth: 1.2,
            },
            {
              id: 'm4_fine',
              name: 'CNC Feineinstellung (1.5 Umdr.)',
              outerDiameter: 23.0,
              innerDiameter: 8.0,
              totalThickness: 4.2,
              spiralRotations: 1.5,
              spiralTotalAngle: 540,
              spiralStartRadius: 5.2,
              spiralEndRadius: 9.8,
              grooveWidth: 1.5,
              grooveDepth: 1.3,
            },
            {
              id: 'm4_compact',
              name: 'Kompakt / Flachprofil (1.0 Umdr.)',
              outerDiameter: 20.0,
              innerDiameter: 7.5,
              totalThickness: 3.2,
              spiralRotations: 1.0,
              spiralTotalAngle: 360,
              spiralStartRadius: 5.0,
              spiralEndRadius: 8.5,
              grooveWidth: 1.4,
              grooveDepth: 1.0,
            },
          ],
          null,
          2
        )
      );

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `M4_HopUp_Generator_v2.0.0_Package.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate project zip:', err);
    } finally {
      setIsExportingZip(false);
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-zinc-950 text-zinc-100 p-6 md:p-10 select-none">
      <div className="max-w-4xl mx-auto space-y-8 pb-16">
        {/* Header */}
        <div className="border-b border-zinc-800 pb-6 flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-mono font-bold uppercase tracking-wider text-zinc-100">
                  Über das Projekt
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 border border-cyan-700/60 text-cyan-300">
                  v2.0.0
                </span>
              </div>
              <p className="text-xs font-mono text-zinc-400">
                Parametrischer 3D CAD-Generator für Airsoft M4 Hop-Up Einstellräder
              </p>
            </div>
          </div>

          <button
            onClick={handleDownloadProjectZip}
            disabled={isExportingZip}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold shadow-lg shadow-cyan-950/40 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingZip ? 'Erstelle ZIP...' : 'Projekt-Paket (.ZIP) herunterladen'}</span>
          </button>
        </div>

        {/* Project Description */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Zweck & Vision
          </h3>
          <p className="text-sm text-zinc-300 leading-relaxed font-sans">
            Das Hop-Up-Einstellrad ist das zentrale Bedienelement moderner Rotary Hop-Up-Chambers in
            M4/AR-15 Airsoft-Markierern. Handelsübliche Rädchen haben oft zu grobe Übersetzungen, Spiel
            in der Passung oder passen nach Umbau auf CNC-Gehäuse nicht optimal.
          </p>
          <p className="text-sm text-zinc-300 leading-relaxed font-sans">
            Dieser parametrische CAD-Generator ermöglicht es Spielern, Technikern und Werkstätten, in
            Sekundenschnelle ein maßgeschneidertes, absolut spielfreies Einstellrad nach eigenen
            Präzisionsanforderungen zu berechnen und ohne Umwege in Standardformaten (STL, 3MF) für den
            3D-Druck zu exportieren.
          </p>
        </div>

        {/* Key Features & Changes in V2.0 */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Neuerungen in Version 2.0.0
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-start gap-2 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold font-mono text-zinc-200">Konische Außenform</span>
                <p className="text-zinc-400 mt-1 font-sans">
                  Gleichmäßige Verjüngung des Radkörpers von der Ober- zur Unterseite für enge
                  Waffengehäuse.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold font-mono text-zinc-200">Zweistufige 90°-Innenbohrung</span>
                <p className="text-zinc-400 mt-1 font-sans">
                  Präziser zylindrischer Absatz mit flacher 90°-Schulter für Wellen mit Seegerring oder
                  Stützbund.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold font-mono text-zinc-200">Umfangs-Rändelung</span>
                <p className="text-zinc-400 mt-1 font-sans">
                  Parametrisch berechnete Rippen am Außenumfang für optimalen Grip auch mit
                  Einsatzhandschuhen.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold font-mono text-zinc-200">3MF & STL Direktexport</span>
                <p className="text-zinc-400 mt-1 font-sans">
                  Watertight Manifold Geometrie im Little-Endian Binär-STL-Format und als 3MF-Archiv.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Architecture */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Cpu className="w-4 h-4" /> Technische Spezifikationen & Algorithmen
          </h3>
          <div className="space-y-3 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 flex items-start gap-3">
              <Code2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-zinc-200 font-bold">Archimedes-Normalen-Offset:</span>
                <p className="text-zinc-400 font-sans mt-0.5">
                  Die Nutkontur wird durch Normalenverschiebung{' '}
                  <code className="text-cyan-300 font-mono">N = (-T_y, T_x)</code> entlang des
                  parametrischen Tangentialvektors berechnet. Dadurch bleibt die Nutbreite über den
                  gesamten Kurvenverlauf mathematisch exakt konstant (kein Ausdünnen oder Aufweiten).
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 flex items-start gap-3">
              <Layers className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-zinc-200 font-bold">Watertight CSG Boolean Engine:</span>
                <p className="text-zinc-400 font-sans mt-0.5">
                  Verwendet <code className="text-cyan-300 font-mono">three-bvh-csg</code> für echte
                  Volumensubtraktion. Das Ergebnis ist ein mathematisch geschlossener (manifold)
                  Dreiecksnetz-Körper ohne invertierte Normalen oder offene Kanten.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 flex items-start gap-3">
              <Wrench className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-zinc-200 font-bold">Echtzeit-Wandstärken-Sicherheitsprüfung:</span>
                <p className="text-zinc-400 font-sans mt-0.5">
                  Berechnet min. Wandstärke zur Zentralbohrung, min. Wandung zum Außenrand und min.
                  Restboden unter dem Nutgrund. Warnungen werden ab &lt; 0.8 mm (Gefahr) und &lt; 1.2 mm
                  (Achtung) im Telemetriepanel signalisiert.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stack & Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/30 space-y-3">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Package className="w-4 h-4 text-cyan-400" /> Verwendete Technologien
            </div>
            <ul className="text-xs font-mono text-zinc-400 space-y-1.5">
              <li>• React 19 + TypeScript 5</li>
              <li>• Vite 8 High-Speed Build Engine</li>
              <li>• Three.js r187 + three-bvh-csg</li>
              <li>• Tailwind CSS v4 + Lucide Icons</li>
              <li>• JSZip 3.10</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/30 space-y-3">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" /> Lizenz & Status
            </div>
            <div className="text-xs text-zinc-400 space-y-1.5 font-mono">
              <p>• Lizenz: Non-Commercial Personal Use</p>
              <p>• Autor: Airsoft Engineering Community</p>
              <p>• Kompatibel: M4/M16 Rotary Hop-Up Units</p>
              <p>• Build: Production Ready v2.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
