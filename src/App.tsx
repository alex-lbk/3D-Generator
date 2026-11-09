/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import { DEFAULT_PRESETS } from './data/presets';
import {
  HopUpPreset,
  SafetyParameters,
  SpiralParameters,
  ViewSettings,
  WheelParameters,
} from './types/cad';
import { calculateTelemetryAndValidation } from './utils/geometryValidation';
import { generateHopUpDialCADModel } from './utils/cadModelGenerator';
import { exportGeometryToBinarySTL } from './utils/exportStl';
import { exportGeometryTo3MF } from './utils/export3mf';
import { HeaderBar } from './components/HeaderBar';
import { ControlPanel } from './components/ControlPanel';
import { ThreeViewport } from './components/ThreeViewport';
import { TechnicalDrawing2D } from './components/TechnicalDrawing2D';
import { CrossSectionView } from './components/CrossSectionView';
import { BottomActionBar } from './components/BottomActionBar';
import { PresetModal } from './components/PresetModal';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  // Initial parameters based on M4 Rotary Standard
  const initialPreset = DEFAULT_PRESETS[0];

  const [wheel, setWheel] = useState<WheelParameters>({ ...initialPreset.wheel });
  const [spiral, setSpiral] = useState<SpiralParameters>({ ...initialPreset.spiral });
  const [safety, setSafety] = useState<SafetyParameters>({ ...initialPreset.safety });

  const [viewSettings, setViewSettings] = useState<ViewSettings>({
    activeTab: '3d',
    materialPreset: 'delrin_black',
    showGradient: false,
    wireframe: false,
    showCenterlines: true,
    autoRotate: false,
    cameraPreset: 'iso',
  });

  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Compute validation and telemetry whenever parameters change
  const telemetry = useMemo(() => {
    return calculateTelemetryAndValidation(wheel, spiral, safety);
  }, [wheel, spiral, safety]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Export handlers
  const handleExportSTL = () => {
    if (!telemetry.canExport) {
      showToast('Export blockiert: Bitte Geometriefehler korrigieren!', 'error');
      return;
    }

    try {
      setIsExporting(true);
      const model = generateHopUpDialCADModel(wheel, spiral);
      const filename = `m4_hopup_dial_${wheel.outerDiameter.toFixed(1)}mm_${spiral.revolutions.toFixed(2)}x.stl`;
      exportGeometryToBinarySTL(model.meshGeometry, filename);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });

      showToast(`STL-Datei erfolgreich exportiert (${filename})`, 'success');
      model.meshGeometry.dispose();
    } catch (err) {
      console.error('Export error:', err);
      showToast('Fehler beim STL-Export: ' + String(err), 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport3MF = async () => {
    if (!telemetry.canExport) {
      showToast('Export blockiert: Bitte Geometriefehler korrigieren!', 'error');
      return;
    }

    try {
      setIsExporting(true);
      const model = generateHopUpDialCADModel(wheel, spiral);
      const filename = `m4_hopup_dial_${wheel.outerDiameter.toFixed(1)}mm_${spiral.revolutions.toFixed(2)}x.3mf`;
      await exportGeometryTo3MF(model.meshGeometry, filename);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });

      showToast(`3MF-Datei erfolgreich exportiert (${filename})`, 'success');
      model.meshGeometry.dispose();
    } catch (err) {
      console.error('3MF export error:', err);
      showToast('Fehler beim 3MF-Export: ' + String(err), 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Reset to initial preset
  const handleReset = () => {
    setWheel({ ...initialPreset.wheel });
    setSpiral({ ...initialPreset.spiral });
    setSafety({ ...initialPreset.safety });
    showToast('Parameter auf Standardwerte zurückgesetzt.', 'success');
  };

  // Apply a selected preset
  const handleApplyPreset = (preset: HopUpPreset) => {
    setWheel({ ...preset.wheel });
    setSpiral({ ...preset.spiral });
    setSafety({ ...preset.safety });
    showToast(`Preset "${preset.name}" angewendet.`, 'success');
  };

  return (
    <div className="flex flex-col w-screen h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Top Header */}
      <HeaderBar
        activeTab={viewSettings.activeTab}
        onSelectTab={(tab) => setViewSettings((prev) => ({ ...prev, activeTab: tab }))}
        telemetry={telemetry}
        onOpenPresets={() => setIsPresetModalOpen(true)}
        onApplyPreset={handleApplyPreset}
      />

      {/* Main Workspace: Left Parameters (LINKS) & Right Viewer (RECHTS) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Parameters & Controls */}
        <aside className="w-full md:w-[420px] lg:w-[460px] h-full shrink-0 flex flex-col z-20">
          <ControlPanel
            wheel={wheel}
            spiral={spiral}
            safety={safety}
            telemetry={telemetry}
            onUpdateWheel={(update) => setWheel((prev) => ({ ...prev, ...update }))}
            onUpdateSpiral={(update) => setSpiral((prev) => ({ ...prev, ...update }))}
            onUpdateSafety={(update) => setSafety((prev) => ({ ...prev, ...update }))}
          />
        </aside>

        {/* Right Side: Large Viewer Switcher (3D / 2D / Querschnitt) */}
        <main className="flex-1 h-full relative overflow-hidden bg-zinc-950">
          {viewSettings.activeTab === '3d' && (
            <ThreeViewport
              wheel={wheel}
              spiral={spiral}
              viewSettings={viewSettings}
              onUpdateViewSettings={(settings) =>
                setViewSettings((prev) => ({ ...prev, ...settings }))
              }
              onExportSTL={handleExportSTL}
            />
          )}

          {viewSettings.activeTab === '2d' && (
            <TechnicalDrawing2D wheel={wheel} spiral={spiral} telemetry={telemetry} />
          )}

          {viewSettings.activeTab === 'crossSection' && (
            <CrossSectionView wheel={wheel} spiral={spiral} telemetry={telemetry} />
          )}
        </main>
      </div>

      {/* Dedicated Bottom Action Bar (UNTEN: STL exportieren, 3MF exportieren, Parameter zurücksetzen) */}
      <BottomActionBar
        wheel={wheel}
        spiral={spiral}
        telemetry={telemetry}
        onExportSTL={handleExportSTL}
        onExport3MF={handleExport3MF}
        onReset={handleReset}
        isExporting={isExporting}
      />

      {/* Preset Modal */}
      <PresetModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        currentWheel={wheel}
        currentSpiral={spiral}
        currentSafety={safety}
        onApplyPreset={handleApplyPreset}
      />

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-20 right-6 z-50 animate-in slide-in-from-bottom duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md text-xs font-mono font-medium ${
              notification.type === 'success'
                ? 'bg-zinc-900/90 border-emerald-500/50 text-emerald-300'
                : 'bg-zinc-900/90 border-red-500/50 text-red-300'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
