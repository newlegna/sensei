"use client";

import { ThreadPrimitive, ComposerPrimitive, MessagePrimitive } from "@assistant-ui/react";
import { Send, X, MessageSquare } from "lucide-react";
import type { TextMessagePartProps } from "@assistant-ui/react";
import type { Trend } from "./TrendCard";

function TextPart({ text }: TextMessagePartProps) {
  return <p className="text-sm whitespace-pre-wrap leading-relaxed">{text}</p>;
}

function UserTextPart({ text }: TextMessagePartProps) {
  return <span className="text-sm">{text}</span>;
}

function UserMessage() {
  return (
    <div className="flex justify-end mb-3">
      <div className="bg-slate-800 text-white rounded-2xl rounded-tr-sm px-3 py-2 max-w-[80%]">
        <MessagePrimitive.Parts components={{ Text: UserTextPart }} />
      </div>
    </div>
  );
}

function AssistantMessage() {
  return (
    <div className="flex justify-start mb-3">
      <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[85%] shadow-sm">
        <MessagePrimitive.Parts components={{ Text: TextPart }} />
      </div>
    </div>
  );
}

type Props = {
  selectedTrend: Trend | null;
  onClearTrend: () => void;
};

export default function ChatPanel({ selectedTrend, onClearTrend }: Props) {
  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Panel header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare size={15} className="text-slate-500" />
          <span className="text-sm font-semibold text-slate-700">Strategy Chat</span>
        </div>
        {selectedTrend && (
          <button onClick={onClearTrend} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Trend context banner */}
      {selectedTrend && (
        <div className={`px-3 py-2 text-xs flex-shrink-0 border-b ${!selectedTrend.covered ? "bg-rose-50 border-rose-100 text-rose-700" : "bg-emerald-50 border-emerald-100 text-emerald-700"}`}>
          <span className="font-semibold">Discussing:</span> {selectedTrend.title}
        </div>
      )}

      <ThreadPrimitive.Root className="flex flex-col flex-1 overflow-hidden">
        <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto p-3">
          <ThreadPrimitive.Empty>
            <div className="flex flex-col items-center justify-center h-full text-center py-8 px-4">
              <MessageSquare size={28} className="text-slate-300 mb-3" />
              <p className="text-sm font-medium text-slate-500 mb-1">Ask about any trend</p>
              <p className="text-xs text-slate-400">Click "Explore" on a trend card, or ask anything about content strategy</p>
              <div className="mt-4 space-y-2 w-full">
                {[
                  "Why is this topic rising right now?",
                  "What format works best for this?",
                  "Give me a 5-point video outline",
                ].map(q => (
                  <button key={q} className="w-full text-left text-xs bg-white border border-slate-200 rounded-lg p-2 text-slate-500 hover:border-slate-300 hover:bg-slate-50 transition-all">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </ThreadPrimitive.Empty>

          <ThreadPrimitive.Messages components={{ UserMessage, AssistantMessage }} />
          <ThreadPrimitive.ScrollToBottom />
        </ThreadPrimitive.Viewport>

        <div className="border-t border-slate-200 bg-white p-3 flex-shrink-0">
          <ComposerPrimitive.Root className="flex items-end gap-2 bg-slate-50 rounded-xl border border-slate-200 px-3 py-2 focus-within:border-slate-400 transition-colors">
            <ComposerPrimitive.Input
              className="flex-1 bg-transparent resize-none outline-none text-sm text-slate-800 placeholder-slate-400 py-1 max-h-24 min-h-[28px]"
              placeholder={selectedTrend ? `Ask about "${selectedTrend.title.slice(0, 30)}…"` : "Ask about any trend…"}
              autoFocus
            />
            <ComposerPrimitive.Send className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-white hover:bg-slate-700 transition-colors flex-shrink-0 disabled:opacity-40">
              <Send size={13} />
            </ComposerPrimitive.Send>
          </ComposerPrimitive.Root>
        </div>
      </ThreadPrimitive.Root>
    </div>
  );
}
