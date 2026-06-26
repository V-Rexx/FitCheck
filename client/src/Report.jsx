import { CheckCircle2, AlertCircle, Lightbulb, ArrowLeft } from "lucide-react";

export default function Report({ result, onReset }) {
  const score = Math.max(0, Math.min(100, Math.round(result.matchScore)));
  const matched = result.matchedSkills || [];
  const missing = result.missingSkills || [];
  const suggestions = result.suggestions || [];

  const band =
    score >= 75 ? { label: "Strong match", text: "text-emerald-700", bar: "bg-emerald-600" }
    : score >= 50 ? { label: "Moderate match", text: "text-amber-600", bar: "bg-amber-500" }
    : { label: "Needs work", text: "text-rose-600", bar: "bg-rose-500" };

  return (
    <section className="py-12 sm:py-16 max-w-3xl mx-auto">
      <button onClick={onReset} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-8">
        <ArrowLeft size={16} /> New analysis
      </button>

      {/* score */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8 mb-6">
        <p className="text-xs font-semibold tracking-[0.16em] uppercase text-slate-400 mb-3">Alignment score</p>
        <div className="flex items-end justify-between mb-4">
          <span className={`text-5xl sm:text-6xl font-extrabold tracking-tight ${band.text}`}>
            {score}<span className="text-3xl">%</span>
          </span>
          <span className={`text-sm font-semibold ${band.text}`}>{band.label}</span>
        </div>
        <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-700 ${band.bar}`} style={{ width: `${score}%` }} />
        </div>
        <p className="mt-4 text-sm text-slate-500">{matched.length} requirements covered · {missing.length} gaps</p>
        {result.summary && <p className="mt-4 text-slate-700 leading-relaxed">{result.summary}</p>}
      </div>

      {/* covered / gaps */}
      <div className="grid md:grid-cols-2 gap-5 mb-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold tracking-[0.14em] uppercase text-emerald-700 mb-4">Covered · {matched.length}</p>
          <ul className="space-y-2.5">
            {matched.length === 0 && <li className="text-sm text-slate-400">None detected.</li>}
            {matched.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                <CheckCircle2 size={17} className="text-emerald-600 shrink-0 mt-0.5" /> {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold tracking-[0.14em] uppercase text-rose-600 mb-4">Gaps · {missing.length}</p>
          <ul className="space-y-2.5">
            {missing.length === 0 && <li className="text-sm text-slate-400">No gaps — strong coverage.</li>}
            {missing.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                <AlertCircle size={17} className="text-rose-500 shrink-0 mt-0.5" /> {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* suggestions */}
      {suggestions.length > 0 && (
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] uppercase text-slate-400 mb-4">Suggested rewrites</p>
          <div className="space-y-4">
            {suggestions.map((s, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                  <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-slate-400 mb-1">
                    {s.original ? "Current" : "Add a bullet"}
                  </p>
                  {s.original && <p className="text-sm text-slate-500">{s.original}</p>}
                </div>
                <div className="p-4 bg-emerald-50/40">
                  <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-emerald-700 mb-1">Suggested</p>
                  <p className="text-sm text-slate-800">{s.improved}</p>
                </div>
                {s.reason && (
                  <div className="px-4 py-3 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-500">
                    <Lightbulb size={14} className="shrink-0 mt-0.5 text-amber-500" /> {s.reason}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}