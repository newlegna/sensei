"use client";

import { useState } from "react";
import { Upload, CheckCircle, AlertCircle, Loader2, BookOpen } from "lucide-react";

type IngestState = "idle" | "ingesting" | "success" | "error";

export default function IngestPanel() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [state, setState] = useState<IngestState>("idle");
  const [message, setMessage] = useState("");

  const handleIngest = async () => {
    if (!title.trim() || !text.trim()) return;
    setState("ingesting");
    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), text: text.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setState("success");
        setMessage("Added to your Senso knowledge base! Future scans will check against this.");
        setTitle("");
        setText("");
      } else {
        setState("error");
        setMessage(data.error || "Ingest failed");
      }
    } catch (e: unknown) {
      setState("error");
      setMessage(e instanceof Error ? e.message : "Network error");
    }
  };

  const EXAMPLES = [
    { t: "How I built my YouTube channel to 100K", b: "I started posting weekly tutorials about web development in 2022..." },
    { t: "My content strategy for 2024", b: "After analyzing my top performing videos, I noticed that tutorials beat vlogs..." },
    { t: "React vs Vue: My take after 5 years", b: "Having used both frameworks extensively, here's my honest comparison..." },
  ];

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={18} className="text-blue-500" />
          <h2 className="font-semibold text-slate-800">Add Your Content to Senso</h2>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Paste your past articles, video scripts, or notes. Trend Radar will check these against live trends to find what you <em>haven't</em> covered yet.
        </p>

        <div className="space-y-3">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Content title (e.g. 'My React tutorial series')"
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder-slate-400"
          />
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste your content here — article, script, notes, description…"
            rows={6}
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder-slate-400 resize-none"
          />

          {state === "success" && (
            <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 rounded-xl px-3 py-2">
              <CheckCircle size={14} /> {message}
            </div>
          )}
          {state === "error" && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">
              <AlertCircle size={14} /> {message}
            </div>
          )}

          <button
            onClick={handleIngest}
            disabled={!title.trim() || !text.trim() || state === "ingesting"}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50"
          >
            {state === "ingesting" ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
            {state === "ingesting" ? "Adding to Senso…" : "Add to Knowledge Base"}
          </button>
        </div>
      </div>

      {/* Quick-fill examples */}
      <div className="mt-4">
        <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wide">Quick examples for demo</p>
        <div className="space-y-2">
          {EXAMPLES.map(ex => (
            <button
              key={ex.t}
              onClick={() => { setTitle(ex.t); setText(ex.b); setState("idle"); }}
              className="w-full text-left bg-white border border-slate-200 rounded-xl px-4 py-2.5 hover:border-blue-300 hover:bg-blue-50 transition-all"
            >
              <p className="text-xs font-medium text-slate-700">{ex.t}</p>
              <p className="text-xs text-slate-400 truncate mt-0.5">{ex.b}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
