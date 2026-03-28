# Trend Radar — 3-Minute Demo Script

## 0:00 - 0:30 | Hook & Problem

> "Every creator spends *hours* every week scrolling Hacker News, Reddit, Twitter, GitHub — trying to figure out what to make next. And half the time they cover something they've already talked about. Trend Radar kills that. One click: it scans live sources, checks your content history, and tells you exactly where the gaps are."

**[Screen: App open in browser, "Ready to scan" state visible]**

---

## 0:30 - 1:30 | Live Demo: Scan Trends

> "Let me show you. One button."

1. **CLICK** the **"Scan Now"** button
2. Spinner appears — *"Railtracks agent scanning HN + Reddit..."*

> **SAY (while loading):** "Three things happening under the hood. First, we pull live trends from the Hacker News API, Reddit's top posts across five subreddits, and GitHub Trending. Second, a Railtracks agent sends each topic to Senso — the creator's knowledge base — and checks coverage. Third, the agent generates a content brief for every trend."

3. Results appear: **Red = uncovered gaps**, **Green = already covered**

> "Boom. Twelve trends, ranked by score. Red ones at the top are gaps — topics blowing up that this creator has *never* touched. Green ones? Already covered. Skip those."

4. **POINT** at a high-score uncovered trend card (source badge, score, brief)

---

## 1:30 - 2:15 | AI Strategy Chat

> "Now say I want to go deeper on this one."

1. **CLICK** "Explore this opportunity" on the top uncovered trend
2. Chat panel updates with trend context
3. **TYPE:** `Give me a 5-point video outline for this topic`
4. **SEND** — AI streams a structured outline

> "Content brief in seconds. Title, hook, five talking points, CTA — ready to record."

---

## 2:15 - 2:45 | Ingest Flow

> "What about building up the knowledge base?"

1. **CLICK** the **"Add Content"** tab
2. **CLICK** a quick-fill example button
3. **CLICK** "Add to Knowledge Base"
4. Green confirmation appears

> "Every piece of content gets indexed in Senso. Next scan, Trend Radar knows you've covered it. The gap list gets smarter over time."

---

## 2:45 - 3:00 | Wrap

> "That's Trend Radar. One scan replaces hours of manual research. Built with **Railtracks** for agent orchestration, **Senso** for the knowledge base, **Unkey** for API key management, and **assistant-ui** for the chat interface. All on top of **Claude** for the AI layer. Thanks!"

---

## Pre-Demo Checklist

- [ ] Backend running: `cd agent && python server.py` (port 8001)
- [ ] Frontend running: `npm run dev` (port 3000)
- [ ] Browser at `http://localhost:3000`, zoomed ~110%
- [ ] Fresh state — no stale scan results
- [ ] Wifi stable (needs network for HN + Reddit + GitHub)

## If Something Breaks

- **Scan fails:** "Live APIs are rate-limited — let me show the cached version" (have screenshot ready)
- **Chat is slow:** "Claude is thinking through the strategy..." (sounds intentional)
- **Ingest errors:** Skip ingest, spend more time on chat. Scan + chat is the money shot.
