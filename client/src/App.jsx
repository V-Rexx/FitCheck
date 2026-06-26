import { useState, useRef } from "react";
import { FileText, Upload, Sparkles, Target, BarChart3, ListChecks } from "lucide-react";
import Report from "./Report";

const API = "http://localhost:8080";

const FEATURES = [
  { label: "SKILL GAP MAP", Icon: Target, title: "Keyword Optimization",
    desc: "Surfaces the high-value skills and terms the job asks for that aren't yet on your resume." },
  { label: "ROLE RELEVANCE", Icon: BarChart3, title: "Semantic Matching",
    desc: "Looks past exact word matches to weigh how your experience maps to what the role actually needs." },
  { label: "ACTION ITEMS", Icon: ListChecks, title: "Concrete Recommendations",
    desc: "Specific bullet rewrites, not vague advice — so you know exactly what to change." },
];

export default function App() {
  const [inputMode, setInputMode] = useState("file");
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);
  const [result, setResult] = useState(null);

  const hasResume = inputMode === "file" ? !!file : resumeText.trim().length > 0;
  const canRun = hasResume && jd.trim().length > 0 && !loading;

  function pickFile(f) {
    if (f && f.type === "application/pdf") setFile(f);
  }

  async function analyze() {
    setLoading(true);
    setError("");
    try {
      let res;
      if (inputMode === "file") {
        const form = new FormData();
        form.append("resumeFile", file);
        form.append("jobDescription", jd);
        res = await fetch(`${API}/analyze`, { method: "POST", body: form });
      } else {
        res = await fetch(`${API}/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resume: resumeText, jobDescription: jd }),
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* HEADER */}
      <header className="border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center">
              <Target size={18} className="text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight">FitCheck</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-600">
            <a href="#how" className="hover:text-slate-900">Methodology</a>
            <a href="#features" className="hover:text-slate-900">Features</a>
            <a href="#analyze" className="rounded-lg bg-slate-900 text-white px-4 py-2 font-medium hover:bg-slate-800">
              Start Analysis
            </a>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6">
        {result ? (
          <Report result={result} onReset={() => setResult(null)} />
        ) : (
          <>
            <section className="text-center max-w-3xl mx-auto pt-14 sm:pt-20 pb-10 sm:pb-14">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-700 mb-5">
                • Alignment Engine
              </p>
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.05] mb-6">
                Precision alignment for your next role.
              </h1>
              <p className="text-slate-500 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
                Upload your resume and paste a target job description. FitCheck scores the alignment,
                surfaces the keyword gaps, and tells you exactly what to rewrite to pass ATS screening.
              </p>
            </section>

            {/* INPUTS */}
            <section id="analyze" className="grid md:grid-cols-2 gap-5 items-stretch pb-16">
              {/* SOURCE DOCUMENT */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 rounded-full border border-emerald-700 text-emerald-700 text-[11px] font-semibold flex items-center justify-center shrink-0">1</span>
                  <span className="text-xs font-semibold tracking-[0.14em] uppercase text-emerald-800">Source Document</span>
                </div>

                {inputMode === "file" ? (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => fileRef.current?.click()}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileRef.current?.click(); } }}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setDragging(false); pickFile(e.dataTransfer.files[0]); }}
                    className={`flex-1 min-h-[15rem] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center p-6 cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
                      dragging ? "border-emerald-500 bg-emerald-50"
                      : file ? "border-emerald-400 bg-emerald-50/50"
                      : "border-slate-300 bg-slate-50 hover:border-slate-400"
                    }`}
                  >
                    <input ref={fileRef} type="file" accept="application/pdf" hidden onChange={(e) => pickFile(e.target.files[0])} />
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center mb-4">
                      <FileText size={22} className="text-slate-400" />
                    </div>
                    {file ? (
                      <p className="font-semibold text-emerald-700 break-all px-2">{file.name}</p>
                    ) : (
                      <>
                        <p className="font-bold text-lg mb-1">Upload your Resume</p>
                        <p className="text-sm text-slate-400 mb-5">PDF · drag and drop or browse · max 5MB</p>
                        <span className="inline-flex items-center gap-2 rounded-lg bg-white border border-slate-300 px-4 py-2 text-sm font-medium shadow-sm">
                          <Upload size={15} /> Select File
                        </span>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setInputMode("text"); }}
                      className="mt-5 text-xs text-slate-400 hover:text-slate-600 underline"
                    >
                      or paste text instead
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col">
                    <textarea
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Paste your resume text here..."
                      className="flex-1 min-h-[15rem] w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                    <button onClick={() => setInputMode("file")} className="mt-2 text-xs text-slate-400 hover:text-slate-600 underline self-start">
                      or upload a PDF instead
                    </button>
                  </div>
                )}
              </div>

              {/* TARGET DESCRIPTION */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full border border-emerald-700 text-emerald-700 text-[11px] font-semibold flex items-center justify-center shrink-0">2</span>
                    <span className="text-xs font-semibold tracking-[0.14em] uppercase text-emerald-800">Target Description</span>
                  </div>
                  <span className="text-xs text-slate-400">{jd.length} chars</span>
                </div>

                <textarea
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                  placeholder="Paste the full job description here — responsibilities, required skills, and nice-to-haves."
                  className="flex-1 min-h-[15rem] w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />

                {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
                <button
                  onClick={analyze}
                  disabled={!canRun}
                  className={`mt-4 w-full rounded-2xl py-4 font-semibold flex items-center justify-center gap-2 transition duration-100 ${
                    canRun
                      ? "bg-[#25a95c] hover:bg-[#65cb8f] active:scale-[0.97] text-white cursor-pointer"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <Sparkles size={18} />
                  {loading ? "Analyzing…" : "Analyze Alignment"}
                </button>
              </div>
            </section>

            {/* FEATURES */}
            <section id="features" className="border-t border-slate-100 py-14 sm:py-20">
              <div className="grid md:grid-cols-3 gap-8 sm:gap-10">
                {FEATURES.map(({ label, Icon, title, desc }) => (
                  <div key={title}>
                    <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6 h-40 flex flex-col">
                      <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-slate-400">{label}</span>
                      <div className="flex-1 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                          <Icon size={22} className="text-emerald-700" />
                        </div>
                      </div>
                    </div>
                    <h3 className="mt-5 text-xl font-extrabold tracking-tight">{title}</h3>
                    <p className="mt-2 text-slate-500 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </section>
          
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <span>© 2026 FitCheck. Your data isn't stored.</span>
          <div className="flex gap-6 text-xs tracking-[0.1em] uppercase">
            <a href="#" className="hover:text-slate-800">Privacy</a>
            <a href="#" className="hover:text-slate-800">Terms</a>
            <a href="#" className="hover:text-slate-800">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}