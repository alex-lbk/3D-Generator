import React, { useState } from 'react';
import {
  MessageSquare,
  Bug,
  Lightbulb,
  HelpCircle,
  Star,
  Send,
  CheckCircle2,
  Mail,
  Clock,
  Sparkles,
} from 'lucide-react';
import { FeedbackCategory, FeedbackEntry } from '../types/navigation';

export const FeedbackSection: React.FC = () => {
  const [category, setCategory] = useState<FeedbackCategory>('feature');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const newEntry: FeedbackEntry = {
      id: 'fb_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      category,
      title: title.trim(),
      description: description.trim(),
      contactEmail: contactEmail.trim() || undefined,
      rating,
      createdAt: new Date().toISOString(),
      status: 'new',
      userAgent: navigator.userAgent,
    };

    try {
      const stored = localStorage.getItem('m4_hopup_feedback');
      const list: FeedbackEntry[] = stored ? JSON.parse(stored) : [];
      list.unshift(newEntry);
      localStorage.setItem('m4_hopup_feedback', JSON.stringify(list));
    } catch (err) {
      console.error('Could not save feedback:', err);
    }

    setIsSubmitted(true);
    setTitle('');
    setDescription('');
    setContactEmail('');
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-zinc-950 text-zinc-100 p-6 md:p-10 select-none">
      <div className="max-w-3xl mx-auto space-y-8 pb-16">
        {/* Header */}
        <div className="border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-mono font-bold uppercase tracking-wider text-zinc-100">
                Feedback & Funktionswünsche
              </h2>
              <p className="text-xs font-mono text-zinc-400">
                Teilen Sie Verbesserungsvorschläge, Fehlermeldungen oder Erfahrungsberichte
              </p>
            </div>
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed mt-3 font-sans">
            Ihre Rückmeldung fließt direkt in die Weiterentwicklung des CAD-Generators ein. Alle Eingaben
            werden lokal gespeichert und können im geschützten Administratorbereich eingesehen und exportiert
            werden.
          </p>
        </div>

        {isSubmitted ? (
          <div className="p-8 rounded-2xl border border-emerald-800/60 bg-emerald-950/20 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-mono font-bold text-zinc-100 uppercase tracking-wider">
              Vielen Dank für Ihre Rückmeldung!
            </h3>
            <p className="text-sm text-zinc-300 font-sans max-w-md mx-auto">
              Ihr Feedback wurde erfolgreich erfasst und im System hinterlegt.
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="mt-4 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-200 transition-colors cursor-pointer"
            >
              Weiteres Feedback einreichen
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selector */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                Kategorie
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setCategory('feature')}
                  className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs font-mono transition-all text-left cursor-pointer ${
                    category === 'feature'
                      ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200'
                      : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  <Lightbulb className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <div className="font-bold">Feature-Wunsch</div>
                    <div className="text-[10px] opacity-70">Neue Geometrie / Funktion</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCategory('bug')}
                  className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs font-mono transition-all text-left cursor-pointer ${
                    category === 'bug'
                      ? 'border-rose-500 bg-rose-950/40 text-rose-200'
                      : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  <Bug className="w-4 h-4 text-rose-400 shrink-0" />
                  <div>
                    <div className="font-bold">Fehlermeldung</div>
                    <div className="text-[10px] opacity-70">Bug / Exportproblem</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCategory('general')}
                  className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs font-mono transition-all text-left cursor-pointer ${
                    category === 'general'
                      ? 'border-amber-500 bg-amber-950/40 text-amber-200'
                      : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="font-bold">Allgemein</div>
                    <div className="text-[10px] opacity-70">Erfahrungsbericht / Frage</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                Gesamteindruck & Zufriedenheit
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => setRating(star)}
                    className="p-1 text-zinc-600 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        (hoverRating ?? rating) >= star
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-zinc-700'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-mono text-zinc-400 ml-2">
                  {rating === 5
                    ? 'Ausgezeichnet (5/5)'
                    : rating === 4
                    ? 'Sehr gut (4/5)'
                    : rating === 3
                    ? 'Zufriedenstellend (3/5)'
                    : rating === 2
                    ? 'Verbesserungswürdig (2/5)'
                    : 'Ungenügend (1/5)'}
                </span>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                Titel / Kurzbeschreibung <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="z.B. Zusätzliches Preset für Maxx M4A Unit oder Rundungsoption"
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                Ausführliche Beschreibung <span className="text-rose-400">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Beschreiben Sie Ihr Anliegen, gewünschte Parameter, Chamber-Modell oder eventuelle Fehlermeldungen..."
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 font-sans text-xs focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            {/* Email (Optional) */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                <span>E-Mail-Adresse für Rückfragen (optional)</span>
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="name@beispiel.de"
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/40 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Feedback absenden</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
