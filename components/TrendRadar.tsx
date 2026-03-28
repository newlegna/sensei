"use client";

import { useState, useCallback } from "react";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { DefaultChatTransport } from "ai";
import { Radio, RefreshCw, Zap, BookOpen, Key, Brain } from "lucide-react";
import TrendCard, { type Trend } from "./TrendCard";
import ChatPanel from "./ChatPanel";
import IngestPanel from "./IngestPanel";

const BADGES = [
  { icon: Brain, label: "Railtracks", color: "bg-purple-500" },
  { icon: Radio, label: "HN + Reddit + GitHub", color: "bg-orange-500" },
  { icon: BookOpen, label: "Senso.ai", color: "bg-blue-500" },
  { icon: Key, label: "Unkey", color: "bg-green-500" },
  { icon: Zap, label: "Augment Code", color: "bg-yellow-500" },
];

type ScanState = "idle" | "scanning" | "done" | "error";

export default function TrendRadar() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);
  const [activeTab, setActiveTab] = useState<"trends" | "ingest">("trends");
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  const trendContext = selectedTrend
    ? `Selected trend: "${selectedTrend.title}" (${selectedTrend.source}, ${selectedTrend.score} points). Covered: ${selectedTrend.covered}.\n${selectedTrend.brief}`
    : trends.length > 0
    ? `Top uncovered trends: ${trends.filter(t => !t.covered).slice(0, 3).map(t => t.title).join(", ")}`
    : "";

  const runtime = useChatRuntime({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { trendContext },
    }),
  });

  const runScan = useCallback(async () => {
    setScanState("scanning");
    setTrends([]);
    try {
      const res = await fetch("/api/scan", { method: "POST" });
      const data = await res.json();
      if (data.trends?.length) {
        setTrends(data.trends);
        setScanState("done");
        setLastScanned(new Date().toLocaleTimeString());
      } else {
        setScanState("error");
      }
    } catch {
      setScanState("error");
    }
  }, []);

  const gaps = trends.filter(t => !t.covered);
  const covered = trends.filter(t => t.covered);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="flex flex-col h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow">
              <Radio size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 leading-none">Trend Radar</h1>
              <p className="text-xs text-slate-500">Surface what to make before it peaks</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5">
              {BADGES.map(({ icon: Icon, label, color }) => (
                <span key={label} className={`${color} text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1`}>
                  <Icon size={9} />{label}
                </span>
              ))}
            </div>
            <button
              onClick={runScan}
              disabled={scanState === "scanning"}
              className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 shadow-sm"
            >
              <RefreshCw size={14} className={scanState === "scanning" ? "animate-spin" : ""} />
              {scanState === "scanning" ? "Scanning…" : "Scan Now"}
            </button>
          </div>
        </header>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Trends */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Tabs */}
            <div className="flex items-center gap-2 mb-4">
              {["trends", "ingest"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as "trends" | "ingest")}
                  className={`text-sm font-medium px-4 py-1.5 rounded-full transition-colors ${activeTab === tab ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"}`}
                >
                  {tab === "trends" ? `🔥 Trends ${trends.length ? `(${trends.length})` : ""}` : "📥 Add Content"}
                </button>
              ))}
              {lastScanned && <span className="text-xs text-slate-400 ml-2">Last scanned {lastScanned}</span>}
            </div>

            {activeTab === "ingest" && <IngestPanel />}

            {activeTab === "trends" && (
              <>
                {/* Empty / loading states */}
                {scanState === "idle" && (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center mb-4 shadow-lg">
                      <Radio size={28} className="text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Ready to scan</h2>
                    <p className="text-slate-500 max-w-sm mb-6">Hit <strong>Scan Now</strong> — the agent will pull live trends from HN and Reddit, then check your content history for gaps.</p>
                    <button onClick={runScan} className="bg-gradient-to-r from-rose-500 to-orange-500 text-white font-semibold px-6 py-3 rounded-xl shadow hover:opacity-90 transition-opacity">
                      Run First Scan →
                    </button>
                  </div>
                )}
                {scanState === "scanning" && (
                  <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <RefreshCw size={32} className="text-rose-500 animate-spin" />
                    <p className="text-slate-600 font-medium">Railtracks agent scanning HN + Reddit…</p>
                    <p className="text-slate-400 text-sm">Checking your Senso knowledge base for coverage gaps</p>
                  </div>
                )}
                {scanState === "error" && (
                  <div className="text-center py-16 text-slate-500">
                    <p className="font-medium text-red-500 mb-2">Scan failed</p>
                    <p className="text-sm mb-4">Make sure the Railtracks agent is running: <code className="bg-slate-100 px-2 py-0.5 rounded text-xs">python agent/server.py</code></p>
                    <button onClick={runScan} className="text-sm text-rose-500 underline">Try again</button>
                  </div>
                )}

                {/* Gap opportunities — uncovered */}
                {gaps.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-sm font-bold text-rose-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                      {gaps.length} Uncovered Opportunities
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {gaps.map((t, i) => (
                        <TrendCard key={t.title} trend={t} rank={i} onExplore={setSelectedTrend} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Already covered */}
                {covered.length > 0 && (
                  <div>
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-3">Already Covered</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {covered.map((t, i) => (
                        <TrendCard key={t.title} trend={t} rank={i + gaps.length} onExplore={setSelectedTrend} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right: Chat */}
          <div className="w-80 xl:w-96 border-l border-slate-200 flex-shrink-0">
            <ChatPanel selectedTrend={selectedTrend} onClearTrend={() => setSelectedTrend(null)} />
          </div>
        </div>
      </div>
    </AssistantRuntimeProvider>
  );
}
