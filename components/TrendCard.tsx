"use client";

import { ExternalLink, TrendingUp, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export type Trend = {
  title: string;
  source: "HackerNews" | "Reddit" | string;
  score: number;
  url: string;
  covered: boolean;
  brief: string;
  subreddit?: string;
  comments?: number;
};

type Props = {
  trend: Trend;
  onExplore: (trend: Trend) => void;
  rank: number;
};

const SOURCE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  HackerNews: { bg: "bg-orange-100", text: "text-orange-700", label: "HN" },
  Reddit:     { bg: "bg-red-100",    text: "text-red-700",    label: "Reddit" },
  GitHub:     { bg: "bg-slate-100",  text: "text-slate-700",  label: "GitHub ⭐" },
};

export default function TrendCard({ trend, onExplore, rank }: Props) {
  const [expanded, setExpanded] = useState(rank < 3); // top 3 open by default
  const src = SOURCE_STYLES[trend.source] ?? { bg: "bg-gray-100", text: "text-gray-700", label: trend.source };
  const isGap = !trend.covered;

  return (
    <div className={`bg-white rounded-2xl border-2 transition-all shadow-sm hover:shadow-md ${isGap ? "border-rose-200 hover:border-rose-300" : "border-gray-100 hover:border-gray-200"}`}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Badges row */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${src.bg} ${src.text}`}>
                {trend.subreddit || src.label}
              </span>
              {isGap ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                  <AlertCircle size={10} /> Not covered
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <CheckCircle size={10} /> Covered
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
              {trend.title}
            </h3>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center flex-shrink-0">
            <TrendingUp size={14} className={isGap ? "text-rose-500" : "text-gray-400"} />
            <span className={`text-lg font-bold tabular-nums ${isGap ? "text-rose-600" : "text-gray-600"}`}>
              {trend.score >= 1000 ? `${(trend.score / 1000).toFixed(1)}k` : trend.score}
            </span>
            <span className="text-[10px] text-gray-400">points</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => onExplore(trend)}
            className={`flex-1 text-xs font-medium py-1.5 rounded-lg transition-colors ${isGap ? "bg-rose-500 hover:bg-rose-600 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
          >
            {isGap ? "🚀 Explore this opportunity" : "💬 Discuss angle"}
          </button>
          <a
            href={trend.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ExternalLink size={14} />
          </a>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Brief — collapsible */}
      {expanded && trend.brief && (
        <div className={`px-4 pb-4 border-t pt-3 ${isGap ? "border-rose-100 bg-rose-50/30" : "border-gray-50 bg-gray-50/50"}`}>
          <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{trend.brief}</p>
        </div>
      )}
    </div>
  );
}
