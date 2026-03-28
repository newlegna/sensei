"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { ThreadPrimitive, ComposerPrimitive, MessagePrimitive } from "@assistant-ui/react";
import { Send, Brain, BookOpen, Key, Zap } from "lucide-react";
import { useState } from "react";
import type { TextMessagePartProps } from "@assistant-ui/react";
import { TextStreamChatTransport } from "ai";

const SPONSOR_BADGES = [
  { icon: Brain, label: "Railtracks", color: "bg-purple-500" },
  { icon: BookOpen, label: "Senso.ai", color: "bg-blue-500" },
  { icon: Key, label: "Unkey", color: "bg-green-500" },
  { icon: Zap, label: "Augment Code", color: "bg-orange-500" },
];

function TextPart({ text }: TextMessagePartProps) {
  return <p className="text-sm whitespace-pre-wrap leading-relaxed">{text}</p>;
}

function UserTextPart({ text }: TextMessagePartProps) {
  return <span className="text-sm">{text}</span>;
}

function MessageBubble({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
  return (
    <div className={`flex gap-3 mb-4 ${role === "user" ? "flex-row-reverse" : "flex-row"}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold ${role === "user" ? "bg-blue-600" : "bg-gradient-to-br from-purple-600 to-blue-600"}`}>
        {role === "user" ? "U" : "S"}
      </div>
      <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${role === "user" ? "bg-blue-600 text-white rounded-tr-sm" : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm"}`}>
        {children}
      </div>
    </div>
  );
}

function UserMessage() {
  return (
    <MessageBubble role="user">
      <MessagePrimitive.Parts components={{ Text: UserTextPart }} />
    </MessageBubble>
  );
}

function AssistantMessage() {
  return (
    <MessageBubble role="assistant">
      <MessagePrimitive.Parts components={{ Text: TextPart }} />
    </MessageBubble>
  );
}

function ChatUI() {
  return (
    <ThreadPrimitive.Root className="flex flex-col h-full">
      <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto p-4 space-y-2">
        <ThreadPrimitive.Empty>
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mb-4 shadow-lg">
              <Brain className="text-white" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Ask Sensei</h2>
            <p className="text-gray-500 max-w-md mb-6">Your AI with persistent knowledge. Ask anything — Sensei searches the knowledge base and reasons through the answer.</p>
            <div className="grid grid-cols-2 gap-2 max-w-sm">
              {["What's in the knowledge base?", "Explain the project architecture", "What tools does Sensei use?", "How does Unkey protect this API?"].map((q) => (
                <button key={q} className="text-xs bg-white border border-gray-200 rounded-xl p-3 text-left text-gray-600 hover:border-blue-300 hover:bg-blue-50 transition-all shadow-sm">
                  {q}
                </button>
              ))}
            </div>
          </div>
        </ThreadPrimitive.Empty>

        <ThreadPrimitive.Messages
          components={{ UserMessage, AssistantMessage }}
        />
        <ThreadPrimitive.ScrollToBottom />
      </ThreadPrimitive.Viewport>

      <div className="border-t border-gray-100 bg-white p-4">
        <ComposerPrimitive.Root className="flex items-end gap-2 bg-gray-50 rounded-2xl border border-gray-200 px-4 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <ComposerPrimitive.Input
            className="flex-1 bg-transparent resize-none outline-none text-sm text-gray-800 placeholder-gray-400 py-2 max-h-32 min-h-[36px]"
            placeholder="Ask Sensei anything..."
            autoFocus
          />
          <ComposerPrimitive.Send className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white hover:opacity-90 transition-opacity flex-shrink-0 mb-1 disabled:opacity-40">
            <Send size={16} />
          </ComposerPrimitive.Send>
        </ComposerPrimitive.Root>
      </div>
    </ThreadPrimitive.Root>
  );
}

export default function ChatInterface() {
  const [apiKey, setApiKey] = useState(process.env.NEXT_PUBLIC_DEMO_API_KEY || "");

  const runtime = useChatRuntime({
    transport: new TextStreamChatTransport({
      api: "/api/chat",
      headers: apiKey ? { "x-api-key": apiKey } : {},
    }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-md">
              <Brain className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-lg leading-none">Sensei</h1>
              <p className="text-xs text-gray-500">AI with Persistent Knowledge</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {SPONSOR_BADGES.map(({ icon: Icon, label, color }) => (
              <span key={label} className={`${color} text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1`}>
                <Icon size={10} />
                {label}
              </span>
            ))}
          </div>
        </header>

        {/* Main Chat */}
        <main className="flex-1 flex overflow-hidden max-w-4xl w-full mx-auto">
          <ChatUI />
        </main>
      </div>
    </AssistantRuntimeProvider>
  );
}
