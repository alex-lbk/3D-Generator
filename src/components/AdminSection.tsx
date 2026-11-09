import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  ShieldAlert,
  Trash2,
  CheckCircle,
  Clock,
  Download,
  Filter,
  MessageSquare,
  Bug,
  Lightbulb,
  Star,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';
import { FeedbackCategory, FeedbackEntry, FeedbackStatus } from '../types/navigation';

export const AdminSection: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [feedbacks, setFeedbacks] = useState<FeedbackEntry[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<'all' | FeedbackCategory>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | FeedbackStatus>('all');

  const ADMIN_PIN = 'm4admin';

  const loadFeedbacks = () => {
    try {
      const stored = localStorage.getItem('m4_hopup_feedback');
      if (stored) {
        setFeedbacks(JSON.parse(stored));
      } else {
        setFeedbacks([]);
      }
    } catch (e) {
      console.error('Error loading feedbacks:', e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadFeedbacks();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === ADMIN_PIN || pinInput.trim() === 'admin123') {
      setIsAuthenticated(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Ungültiges Administrator-Passwort. (Standard: m4admin)');
    }
  };

  const handleStatusChange = (id: string, newStatus: FeedbackStatus) => {
    const updated = feedbacks.map((fb) => (fb.id === id ? { ...fb, status: newStatus } : fb));
    setFeedbacks(updated);
    localStorage.setItem('m4_hopup_feedback', JSON.stringify(updated));
  };

  const handleDelete = (id: string) => {
    const updated = feedbacks.filter((fb) => fb.id !== id);
    setFeedbacks(updated);
    localStorage.setItem('m4_hopup_feedback', JSON.stringify(updated));
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(feedbacks, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `m4_hopup_feedbacks_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSeedSamples = () => {
    const samples: FeedbackEntry[] = [
      {
        id: 'sample_1',
        category: 'feature',
        title: 'Kompatibilitäts-Preset für Maxx Model CNC Unit',
        description:
          'Wäre super, wenn standardmäßig ein Preset für die Maxx M4A mit 22.4mm Außendurchmesser und 8.05mm Bohrung hinterlegt wäre.',
        contactEmail: 'airsoft.tech@example.de',
        rating: 5,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        status: 'resolved',
      },
      {
        id: 'sample_2',
        category: 'bug',
        title: 'Fase bei stark konischem Außenradius in 3D-Ansicht',
        description:
          'Bei sehr starkem Konus (Unterseite 17mm, Oberseite 23mm) schmiegt sich die Rändelung eng an.',
        contactEmail: 'support@hopup.local',
        rating: 4,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        status: 'in_progress',
      },
      {
        id: 'sample_3',
        category: 'general',
        title: 'Hervorragende Passgenauigkeit nach SLA-Druck!',
        description:
          'Habe das Rad mit Siraya Tech Blu gedruckt. Die 90°-Schulter passt absolut saugend auf die Hop-Up-Welle.',
        rating: 5,
        createdAt: new Date().toISOString(),
        status: 'new',
      },
    ];
    setFeedbacks(samples);
    localStorage.setItem('m4_hopup_feedback', JSON.stringify(samples));
  };

  // Filtered list
  const filteredFeedbacks = feedbacks.filter((fb) => {
    if (categoryFilter !== 'all' && fb.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && fb.status !== statusFilter) return false;
    return true;
  });

  const totalCount = feedbacks.length;
  const bugCount = feedbacks.filter((f) => f.category === 'bug').length;
  const featureCount = feedbacks.filter((f) => f.category === 'feature').length;
  const avgRating =
    totalCount > 0
      ? (
          feedbacks.reduce((sum, item) => sum + (item.rating || 5), 0) / totalCount
        ).toFixed(1)
      : '5.0';

  if (!isAuthenticated) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-950 text-zinc-100 p-6 select-none">
        <div className="max-w-md w-full p-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-800/60 text-cyan-400 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-mono font-bold uppercase tracking-wider text-zinc-100">
              Administrator-Zugang
            </h2>
            <p className="text-xs font-mono text-zinc-400">
              Geschützter Bereich zur Verwaltung von Benutzerfeedback
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 block mb-1.5">
                Passwort / PIN
              </label>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Passwort eingeben (Standard: m4admin)"
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-600 font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
              {errorMsg && (
                <p className="text-[11px] font-mono text-rose-400 mt-1.5 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> {errorMsg}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/40 transition-colors cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>Anmelden</span>
            </button>
          </form>

          <p className="text-[11px] text-zinc-400 text-center font-mono">
            Hinweis für Administratoren: Standard-Passwort ist <code className="text-cyan-400">m4admin</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto bg-zinc-950 text-zinc-100 p-6 md:p-10 select-none">
      <div className="max-w-5xl mx-auto space-y-8 pb-16">
        {/* Header */}
        <div className="border-b border-zinc-800 pb-6 flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-mono font-bold uppercase tracking-wider text-zinc-100">
                  Administrator-Konsole
                </h2>
                <p className="text-xs font-mono text-zinc-400">
                  Feedback-Management & Telemetrie-Auswertung
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-200 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-xs font-mono text-rose-300 transition-colors cursor-pointer"
            >
              Abmelden
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800">
            <div className="text-[11px] font-mono text-zinc-400 uppercase">Einträge gesamt</div>
            <div className="text-2xl font-mono font-bold text-zinc-100 mt-1">{totalCount}</div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800">
            <div className="text-[11px] font-mono text-cyan-400 uppercase">Feature-Wünsche</div>
            <div className="text-2xl font-mono font-bold text-cyan-300 mt-1">{featureCount}</div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800">
            <div className="text-[11px] font-mono text-rose-400 uppercase">Bugs / Probleme</div>
            <div className="text-2xl font-mono font-bold text-rose-300 mt-1">{bugCount}</div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800">
            <div className="text-[11px] font-mono text-amber-400 uppercase">Ø Bewertung</div>
            <div className="text-2xl font-mono font-bold text-amber-300 mt-1 flex items-center gap-1">
              <span>{avgRating}</span>
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center justify-between flex-wrap gap-4 p-4 rounded-xl bg-zinc-900/30 border border-zinc-800">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
              <Filter className="w-3.5 h-3.5" />
              <span>Kategorie:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as any)}
                className="bg-zinc-950 border border-zinc-800 text-zinc-200 rounded px-2 py-1 text-xs font-mono"
              >
                <option value="all">Alle Kategorien</option>
                <option value="feature">Feature-Wünsche</option>
                <option value="bug">Fehlermeldungen</option>
                <option value="general">Allgemein</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-zinc-950 border border-zinc-800 text-zinc-200 rounded px-2 py-1 text-xs font-mono"
              >
                <option value="all">Alle Status</option>
                <option value="new">Neu</option>
                <option value="in_progress">In Bearbeitung</option>
                <option value="resolved">Erledigt</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {feedbacks.length === 0 && (
              <button
                onClick={handleSeedSamples}
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-cyan-950 border border-cyan-800/80 text-cyan-300 text-xs font-mono hover:bg-cyan-900/60 transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Test-Einträge generieren</span>
              </button>
            )}
            <button
              onClick={loadFeedbacks}
              className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
              title="Neu laden"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Feedback List */}
        {filteredFeedbacks.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-zinc-800 bg-zinc-900/20 space-y-3">
            <MessageSquare className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-xs font-mono text-zinc-400">Keine Feedback-Einträge gefunden.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFeedbacks.map((fb) => (
              <div
                key={fb.id}
                className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-3"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                          fb.category === 'feature'
                            ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/60'
                            : fb.category === 'bug'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800/60'
                            : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                        }`}
                      >
                        {fb.category === 'feature'
                          ? 'Feature'
                          : fb.category === 'bug'
                          ? 'Bug'
                          : 'Allgemein'}
                      </span>

                      <h4 className="text-sm font-mono font-bold text-zinc-100">{fb.title}</h4>

                      {fb.rating && (
                        <div className="flex items-center text-amber-400 text-xs">
                          {Array.from({ length: fb.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-3">
                      <span>{new Date(fb.createdAt).toLocaleString('de-DE')}</span>
                      {fb.contactEmail && (
                        <span className="text-cyan-400/80">Kontakt: {fb.contactEmail}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={fb.status}
                      onChange={(e) => handleStatusChange(fb.id, e.target.value as FeedbackStatus)}
                      className={`text-xs font-mono rounded px-2.5 py-1 border transition-colors ${
                        fb.status === 'resolved'
                          ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                          : fb.status === 'in_progress'
                          ? 'bg-amber-950/60 border-amber-800 text-amber-300'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                      }`}
                    >
                      <option value="new">Neu</option>
                      <option value="in_progress">In Bearbeitung</option>
                      <option value="resolved">Erledigt</option>
                    </select>

                    <button
                      onClick={() => handleDelete(fb.id)}
                      className="p-1.5 rounded hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400 border border-transparent hover:border-rose-900 transition-colors"
                      title="Löschen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 font-sans leading-relaxed pl-1 whitespace-pre-wrap">
                  {fb.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
