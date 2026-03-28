# Trend Radar

**Surface what to make before it peaks.**

Trend Radar is an autonomous content intelligence agent that scans live developer communities (Hacker News, Reddit, GitHub), cross-references findings against your personal content history stored in Senso.ai, and surfaces uncovered opportunities — so you always know what to create next.

## How It Works

1. **Scan** — Click "Scan Now" and the Railtracks-powered agent fetches trending posts from HN, Reddit, and GitHub in real time.
2. **Compare** — Each trend is checked against your knowledge base in Senso.ai to see if you have already covered it.
3. **Act** — Uncovered opportunities are highlighted. Select any trend to open a strategy chat (powered by Claude via the Vercel AI SDK) that helps you plan the content: angle, format, outline, and timing.
4. **Ingest** — Add your past articles, scripts, or notes to the Senso knowledge base directly from the UI so future scans get smarter.

## Sponsor Tools

| Tool | Role |
|------|------|
| [Railtracks](https://railtracks.ai) | Agent framework that orchestrates the trend-scanning pipeline |
| [Senso.ai](https://senso.ai) | Knowledge base — stores your content history and enables semantic search for coverage-gap detection |
| [assistant-ui](https://assistant-ui.com) | React component library powering the strategy chat panel |
| [Unkey](https://unkey.dev) | API key verification on every route — protects `/api/chat`, `/api/scan`, and `/api/ingest` |

## Architecture

```
Next.js 16 App
├── app/
│   ├── page.tsx              # Renders the TrendRadar dashboard
│   ├── layout.tsx            # Root layout with metadata
│   └── api/
│       ├── chat/route.ts     # Streams Claude responses via AI SDK + Anthropic provider
│       ├── scan/route.ts     # Proxies to the Railtracks agent for live trend scanning
│       └── ingest/route.ts   # Pushes content into Senso.ai knowledge base
├── components/
│   ├── TrendRadar.tsx        # Main dashboard: scan button, trend grid, chat sidebar
│   ├── TrendCard.tsx         # Individual trend card with score, source, coverage badge
│   ├── ChatPanel.tsx         # assistant-ui Thread/Composer wired to /api/chat
│   └── IngestPanel.tsx       # Form to add content to Senso knowledge base
├── agent/
│   ├── server.py             # FastAPI server (port 8001)
│   ├── agent.py              # Railtracks agent flow definition
│   └── trends.py             # Trend fetching from HN, Reddit, GitHub
```

- **Frontend**: React 19, Next.js 16, Tailwind CSS 4, assistant-ui
- **AI**: Vercel AI SDK with `@ai-sdk/anthropic` (Claude Sonnet)
- **Auth**: Unkey key verification middleware on all API routes
- **Agent**: Railtracks agent server (Python, FastAPI)

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.10+
- Senso CLI (`npm i -g @anthropic/senso`)

### Environment Variables

Create `.env.local` in the project root:

```env
ANTHROPIC_API_KEY=sk-ant-...
SENSO_API_KEY=...
UNKEY_ROOT_KEY=...              # Optional — dev mode skips auth
AGENT_URL=http://localhost:8001
```

### Run

```bash
# Terminal 1: Start the Railtracks agent
cd agent && pip install -r requirements.txt && python server.py

# Terminal 2: Start the frontend
npm install && npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and hit **Scan Now**.

## License

MIT
