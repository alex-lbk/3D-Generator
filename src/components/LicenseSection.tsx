import React from 'react';
import { Shield, Check, X, ExternalLink, FileText, Lock, UserCheck, AlertTriangle } from 'lucide-react';

export const LicenseSection: React.FC = () => {
  const githubLicenseUrl = 'https://github.com/alexanderlabik/m4-hopup-generator/blob/main/LICENSE';

  return (
    <div className="w-full h-full overflow-y-auto bg-zinc-950 text-zinc-100 p-6 md:p-10 select-none">
      <div className="max-w-4xl mx-auto space-y-8 pb-16">
        {/* Header */}
        <div className="border-b border-zinc-800 pb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-mono font-bold uppercase tracking-wider text-zinc-100">
                  Lizenzbestimmungen & Nutzungsrechte
                </h2>
                <p className="text-xs font-mono text-zinc-400">
                  M4 Hop-Up Dial CAD Generator – Non-Commercial Software License
                </p>
              </div>
            </div>

            <a
              href={githubLicenseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <span>Vollständige LICENSE-Datei auf GitHub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <p className="text-sm text-zinc-300 leading-relaxed mt-4 font-sans">
            Die Nutzung dieser Software und der daraus generierten 3D-Modelle unterliegt den folgenden verbindlichen
            Bestimmungen. Diese Lizenz dient dem Schutz der mathematischen Berechnungen und der Sicherstellung, dass das
            Projekt für die Airsoft-Community frei für private Zwecke nutzbar bleibt.
          </p>
        </div>

        {/* Overview Badges: Erlaubt vs. Nicht erlaubt */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Erlaubt */}
          <div className="p-5 rounded-2xl border border-emerald-900/40 bg-emerald-950/20 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xs uppercase tracking-wider">
              <UserCheck className="w-4 h-4" /> Gestattete Nutzung (Personal Use)
            </div>
            <ul className="space-y-2 text-xs font-sans text-zinc-300">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Kostenlose Erstellung und Anpassung von 3D-Modellen für den privaten Eigengebrauch.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Unbegrenzter 3D-Druck (FDM / Resin / SLS) für die eigene Airsoft-Ausrüstung und Teamkollegen.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Nutzung zu Bildungs-, Forschungs- und experimentellen Zwecken.</span>
              </li>
            </ul>
          </div>

          {/* Nicht erlaubt */}
          <div className="p-5 rounded-2xl border border-red-900/40 bg-red-950/20 space-y-3">
            <div className="flex items-center gap-2 text-red-400 font-mono font-bold text-xs uppercase tracking-wider">
              <Lock className="w-4 h-4" /> Einschränkungen (Restrictions)
            </div>
            <ul className="space-y-2 text-xs font-sans text-zinc-300">
              <li className="flex items-start gap-2">
                <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span><strong>Keine kommerzielle Verwertung:</strong> Verkauf von generierten STL/3MF-Dateien oder gewerblicher Vertrieb gedruckter Teile ist untersagt.</span>
              </li>
              <li className="flex items-start gap-2">
                <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span><strong>Keine unerlaubte Weiterverbreitung:</strong> Das Hochladen der Software oder Dateisammlungen auf kostenpflichtige Plattformen ist nicht gestattet.</span>
              </li>
              <li className="flex items-start gap-2">
                <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span><strong>Kein Re-Branding:</strong> Entfernen von Urheberrechts- und Lizenzhinweisen ist unzulässig.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Vollständiger Lizenztext */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
            <FileText className="w-4 h-4 text-cyan-400" /> Lizenzvertragstext (Offizieller Wortlaut)
          </div>

          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 font-mono text-xs text-zinc-300 space-y-4 leading-relaxed overflow-x-auto">
            <p className="text-zinc-400">
              Copyright (c) 2026 Alexander Labik & M4 Hop-Up Dial Generator Contributors.<br />
              All rights reserved.
            </p>

            <div>
              <span className="text-cyan-300 font-bold block mb-1">1. Rechtseinräumung für persönliche Nutzung</span>
              <p className="text-zinc-400 text-[11px]">
                Dem Nutzer wird hiermit unentgeltlich das nicht-exklusive Recht eingeräumt, die Software zur Generierung,
                Visualisierung und zum Export von 3D-CAD-Modellen für den rein persönlichen, privaten und nicht-kommerziellen
                Gebrauch auszuführen und die erzeugten STL- und 3MF-Dateien auf privaten 3D-Druckern zu fertigen.
              </p>
            </div>

            <div>
              <span className="text-cyan-300 font-bold block mb-1">2. Ausschluss kommerzieller Nutzung</span>
              <p className="text-zinc-400 text-[11px]">
                Jegliche kommerzielle Verwertung, insbesondere der gewerbliche Verkauf oder die entgeltliche Veräußerung
                von mit dieser Software erzeugten physischen Bauteilen, digitalen Modelldateien oder Teilen davon, bedarf
                der ausdrücklichen vorherigen schriftlichen Zustimmung des Urhebers.
              </p>
            </div>

            <div>
              <span className="text-cyan-300 font-bold block mb-1">3. Weiterverbreitung und Modifikationen</span>
              <p className="text-zinc-400 text-[11px]">
                Die Weiterverbreitung des Quellcodes oder veränderter Fassungen ist nur unter Beibehaltung dieses vollständigen
                Urheberrechtshinweises und unter identischen Lizenzbedingungen gestattet. Ein proprietäres Relizenzieren ist
                ausgeschlossen.
              </p>
            </div>

            <div>
              <span className="text-cyan-300 font-bold block mb-1">4. Haftungsausschluss (Disclaimer)</span>
              <p className="text-zinc-400 text-[11px]">
                DIE SOFTWARE WIRD OHNE JEDE AUSDRÜCKLICHE ODER STILLSCHWEIGENDE GEWÄHRLEISTUNG BEREITGESTELLT. DIE AUTOREN
                HAFTEN IN KEINEM FALL FÜR SCHÄDEN AN AIRSOFT-GERÄTEN, 3D-DRUCKERN ODER FOLGESCHÄDEN, DIE AUS DER VERWENDUNG
                DIESER SOFTWARE ODER DER DAMIT HERGESTELLTEN TEILE ENTSTEHEN.
              </p>
            </div>
          </div>
        </div>

        {/* Hinweis */}
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono flex items-center justify-between text-zinc-400">
          <span>Stand: Version 2.0.0 (Release)</span>
          <span>Lizenztyp: Proprietary Non-Commercial Community License</span>
        </div>
      </div>
    </div>
  );
};
