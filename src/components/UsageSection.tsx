import React from 'react';
import {
  BookOpen,
  Printer,
  Sliders,
  Disc,
  Spline,
  Eye,
  Download,
  AlertCircle,
  CheckCircle2,
  Shield,
  Layers,
  HelpCircle,
} from 'lucide-react';

export const UsageSection: React.FC = () => {
  return (
    <div className="w-full h-full overflow-y-auto bg-zinc-950 text-zinc-100 p-6 md:p-10 select-none">
      <div className="max-w-4xl mx-auto space-y-8 pb-16">
        {/* Header */}
        <div className="border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-mono font-bold uppercase tracking-wider text-zinc-100">
                Bedienungsanleitung & Dokumentation
              </h2>
              <p className="text-xs font-mono text-zinc-400">
                M4 Hop-Up Einstellrad CAD-Generator – Version 2.0.0
              </p>
            </div>
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed mt-3">
            Diese CAD-Webanwendung dient der millimetergenauen Erstellung und dem fertigungsgerechten
            3D-Druck-Export von individuellen Hop-Up-Einstellrädern für M4/AR-15 Airsoft-Units. Anhand
            eingegebener Maße wird in Echtzeit ein exaktes, geschlossenes Manifold-Volumen mit einer echten
            Archimedes-Spiralnut erzeugt.
          </p>
        </div>

        {/* Section 1: Schnellstart */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Sliders className="w-4 h-4" /> 1. Schnellstart & Arbeitsablauf
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-2">
              <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold">
                1
              </div>
              <div className="font-bold text-zinc-200">Maße anpassen</div>
              <p className="text-zinc-400 leading-relaxed font-sans">
                Wählen Sie ein Standard-Preset oder justieren Sie Durchmesser, Dicke und Spiralnut im linken
                Bedienfeld.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-2">
              <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold">
                2
              </div>
              <div className="font-bold text-zinc-200">Wandstärken prüfen</div>
              <p className="text-zinc-400 leading-relaxed font-sans">
                Achten Sie auf das automatische Ampelsystem: Stegbreiten und Restbodendicke müssen im grünen
                Bereich liegen.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-2">
              <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold">
                3
              </div>
              <div className="font-bold text-zinc-200">Exportieren & Drucken</div>
              <p className="text-zinc-400 leading-relaxed font-sans">
                Klicken Sie auf <strong>STL exportieren</strong> oder <strong>3MF exportieren</strong> für Ihren
                Slicer (Bambu Studio, Cura, PrusaSlicer).
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Parametererklärung */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Disc className="w-4 h-4" /> 2. Erklärung aller einstellbaren Parameter
          </h3>

          <div className="space-y-4 text-xs font-mono">
            {/* Grundkörper */}
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-2">
              <span className="text-cyan-300 font-bold text-sm block">Grundkörper & Geometrie</span>
              <ul className="space-y-2 text-zinc-300 font-sans list-disc list-inside">
                <li>
                  <strong>Außendurchmesser:</strong> Der äußere Durchmesser der Radoberseite in mm (typisch 24,0 bis 26,0 mm).
                </li>
                <li>
                  <strong>Innendurchmesser:</strong> Die zentrale zylindrische Achsbohrung, durch die die Laufhülse der Hop-Up Unit verläuft (typisch 9,5 bis 10,2 mm).
                </li>
                <li>
                  <strong>Gesamtdicke:</strong> Die Materialstärke des Rades in mm (typisch 3,5 bis 4,5 mm).
                </li>
                <li>
                  <strong>Konische Außenform (Kegelstumpf):</strong> Verjüngt die Außenwand gleichmäßig von der Oberseite zur Unterseite. Erlaubt separate Definition von oberem und unterem Durchmesser.
                </li>
                <li>
                  <strong>Zweistufige Innenbohrung:</strong> Ermöglicht zwei unterschiedliche Bohrungsabschnitte mit einer scharfen, rechtwinkligen 90°-Schulter für spezielle Hop-Up-Achsen mit Absatz.
                </li>
                <li>
                  <strong>Außenrändelung (Grifffräsung):</strong> Umlaufende Fingerrillen auf dem Umfang für rutschfestes Einstellen im Auswurffenster.
                </li>
              </ul>
            </div>

            {/* Spirale */}
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-2">
              <span className="text-cyan-300 font-bold text-sm block">Spiralgeometrie & Nut</span>
              <ul className="space-y-2 text-zinc-300 font-sans list-disc list-inside">
                <li>
                  <strong>Gekoppelte Umdrehungen / Drehwinkel:</strong> Bestimmt, wie weit die Spirale windet. 360° entsprechen 1 vollen Umdrehung, 540° = 1,5x, 720° = 2,0x, 1080° = 3,0x.
                </li>
                <li>
                  <strong>Start- & End-Radius:</strong> Innerster und äußerster radialer Bahnpunkt des Hop-Up-Hebels bzw. Nubs.
                </li>
                <li>
                  <strong>Start- & Endwinkel:</strong> Absolute Winkelpositionen auf der Scheibe, direkt veränderbar.
                </li>
                <li>
                  <strong>Nutbreite (w):</strong> Exakt senkrecht zur Kurventangente gemessene Breite. Wird nach außen hin weder breiter noch schmaler.
                </li>
                <li>
                  <strong>Nuttiefe (d):</strong> Gleichbleibende Tiefe der Vertiefung über die gesamte Spirallänge.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 3: 3D-Druck Empfehlungen */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <Printer className="w-4 h-4" /> 3. Druckvorbereitung & Slicer-Empfehlungen
          </h3>

          <div className="space-y-3 text-xs text-zinc-300 leading-relaxed font-sans">
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-2">
              <span className="font-mono font-bold text-amber-300 block">Optimale Druckeinstellungen</span>
              <ul className="space-y-1.5 list-disc list-inside text-zinc-300 font-mono text-[11px]">
                <li><strong>Schichthöhe (Layer Height):</strong> 0,12 mm oder 0,16 mm (feine Stufenauflösung).</li>
                <li><strong>Druckorientierung:</strong> Flach mit der Spiralnut nach oben auf dem Druckbett (keine Stützstrukturen in der Nut erforderlich!).</li>
                <li><strong>Wandlinien (Perimeters):</strong> Mindestens 4 bis 5 Wandlinien oder 100% Infill für maximale Scherstabilität gegen den Federdruck des Hop-Up Arms.</li>
                <li><strong>Düsendurchmesser (Nozzle):</strong> 0,4 mm Standard oder 0,2 mm für maximale Kantenschärfe der Nuten.</li>
                <li><strong>Empfohlene Filamente:</strong> PETG, ABS, ASA, POM/Delrin oder zähes Resin (Tough Resin). Für reine Indoor-Spiele genügt hochwertiges PLA+.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-2 font-mono text-xs">
              <span className="text-zinc-200 font-bold block">Maßtoleranzen & Passgenauigkeit</span>
              <p className="text-zinc-400 text-[11px] font-sans leading-relaxed">
                Jede Airsoft Hop-Up Unit (z. B. Krytac, Maxx, Retro Arms, Prowin) besitzt geringe
                Fertigungstoleranzen (&plusmn; 0,1 mm). Messen Sie vor dem Druck den Achsdurchmesser
                Ihrer Hop-Up Kammer mit einem Messschieber aus und geben Sie bei Bedarf 0,15 mm
                zusätzliches Spiel auf den Innendurchmesser ein, damit das Rad leichtgängig und spielfrei läuft.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: 3D-, 2D- und Querschnittsansicht */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Eye className="w-4 h-4" /> 4. Interpretation der Ansichtsmodi
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-1.5">
              <span className="text-cyan-300 font-bold block">3D-Vorschau</span>
              <p className="text-zinc-400 font-sans text-[11px] leading-relaxed">
                Echtes 3D-CAD-Modell mit freier Drehung, Zoom und PBR-Materialien. Ermöglicht Farbverlauf-Visualisierung
                von Blau (Start) bis Rot (Ende).
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-1.5">
              <span className="text-cyan-300 font-bold block">2D-Draufsicht</span>
              <p className="text-zinc-400 font-sans text-[11px] leading-relaxed">
                Technische Vektorzeichnung mit exakten Maßketten, Radien, Stegbreiten und Start-/End-Pins zur
                Überprüfung der Geometrie.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-1.5">
              <span className="text-cyan-300 font-bold block">Querschnitt A-A</span>
              <p className="text-zinc-400 font-sans text-[11px] leading-relaxed">
                Schnittansicht mit DIN-Schraffur. Visualisiert die Nuttiefe, Restbodendicke, Kegelneigung und die 90°-Schulter
                der Innenbohrung.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
