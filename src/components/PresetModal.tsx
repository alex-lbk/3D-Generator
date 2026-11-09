import React, { useState } from 'react';
import { X, BookmarkPlus, Check, Sliders, Trash2 } from 'lucide-react';
import { DEFAULT_PRESETS } from '../data/presets';
import { HopUpPreset, SafetyParameters, SpiralParameters, WheelParameters } from '../types/cad';

interface PresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWheel: WheelParameters;
  currentSpiral: SpiralParameters;
  currentSafety: SafetyParameters;
  onApplyPreset: (preset: HopUpPreset) => void;
}

export const PresetModal: React.FC<PresetModalProps> = ({
  isOpen,
  onClose,
  currentWheel,
  currentSpiral,
  currentSafety,
  onApplyPreset,
}) => {
  const [customPresets, setCustomPresets] = useState<HopUpPreset[]>(() => {
    try {
      const saved = localStorage.getItem('m4_hopup_custom_presets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [newPresetName, setNewPresetName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveCurrentAsPreset = () => {
    if (!newPresetName.trim()) return;
    const newPreset: HopUpPreset = {
      id: `custom_${Date.now()}`,
      name: newPresetName.trim(),
      description: `Eigenes Setup: Ø${currentWheel.outerDiameter.toFixed(1)}mm, ${currentSpiral.revolutions.toFixed(2)} Umdr.`,
      wheel: { ...currentWheel },
      spiral: { ...currentSpiral },
      safety: { ...currentSafety },
    };

    const updated = [newPreset, ...customPresets];
    setCustomPresets(updated);
    try {
      localStorage.setItem('m4_hopup_custom_presets', JSON.stringify(updated));
    } catch {}
    setNewPresetName('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleDeleteCustom = (id: string) => {
    const updated = customPresets.filter((p) => p.id !== id);
    setCustomPresets(updated);
    try {
      localStorage.setItem('m4_hopup_custom_presets', JSON.stringify(updated));
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div>
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              M4 Hop-Up Einstellrad Presets
            </h2>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Wähle eine Standard-Geometrie oder speichere dein individuelles Maß ab.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Default Presets */}
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-3">
              Standard-Modelle & Hersteller-Referenzen
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DEFAULT_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/40 hover:border-cyan-500/50 hover:bg-zinc-800/40 transition-all flex flex-col justify-between group cursor-pointer"
                  onClick={() => {
                    onApplyPreset(preset);
                    onClose();
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-sm font-bold text-zinc-100 group-hover:text-cyan-300 transition-colors">
                        {preset.name}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
                      {preset.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span>
                      Ø {preset.wheel.outerDiameter.toFixed(1)} mm | {preset.spiral.revolutions.toFixed(2)} Umdr.
                    </span>
                    <span className="text-cyan-400 font-bold group-hover:underline">Laden →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Presets */}
          {customPresets.length > 0 && (
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-3">
                Gespeicherte eigene Konfigurationen
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {customPresets.map((preset) => (
                  <div
                    key={preset.id}
                    className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/40 hover:border-cyan-500/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-sm font-bold text-zinc-100">
                          {preset.name}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCustom(preset.id);
                          }}
                          className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                          title="Löschen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-zinc-400 mb-3">{preset.description}</p>
                    </div>

                    <button
                      onClick={() => {
                        onApplyPreset(preset);
                        onClose();
                      }}
                      className="w-full py-1.5 px-3 rounded bg-zinc-800 hover:bg-cyan-600/30 text-xs font-mono text-cyan-300 border border-zinc-700/80 hover:border-cyan-500/50 transition-all text-center"
                    >
                      Konfiguration anwenden
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save Current Configuration */}
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <BookmarkPlus className="w-4 h-4 text-cyan-400" />
              Aktuelle Parameter als neues Preset sichern
            </h3>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="z.B. Mein VFC Custom Nub 1.35x"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                className="flex-1 px-3 py-2 text-xs font-mono bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleSaveCurrentAsPreset}
                disabled={!newPresetName.trim()}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-mono text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Gespeichert!
                  </>
                ) : (
                  'Speichern'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
