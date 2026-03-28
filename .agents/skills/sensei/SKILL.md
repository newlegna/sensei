---
name: sensei
description: Autonomous content intelligence agent that scans live trends from HN, Reddit, and GitHub, cross-references against your content history in Senso.ai, and surfaces uncovered opportunities with AI-generated briefs.
license: MIT
compatibility: Requires Node.js 20+, Python 3.10+, Anthropic API key, Senso API key
metadata:
  author: newlegna
  version: "1.0.0"
---

# Trend Radar (Sensei)

Use this skill to scan live developer communities for trending topics and identify content gaps.

## Core Rules

- Always start the Railtracks agent server before scanning: `cd agent && python server.py`
- The scan endpoint fetches trends from Hacker News, Reddit (5 subreddits), and GitHub Trending
- Each trend is cross-referenced against the user's Senso.ai knowledge base for coverage detection
- Uncovered trends are flagged as opportunities with AI-generated content briefs
- The strategy chat uses Claude to help plan content around selected trends

## Workflow

1. **Scan** — Hit the scan endpoint to fetch and analyze live trends
2. **Review** — Trends are ranked by score and tagged as "covered" or "uncovered"
3. **Strategize** — Use the AI chat to generate outlines, angles, and briefs for uncovered topics
4. **Ingest** — Add your published content back to the Senso knowledge base to improve future scans

## Sponsor Tools

- **Railtracks** — Agent orchestration framework
- **Senso.ai** — Knowledge base for content history and semantic search
- **assistant-ui** — Chat UI components
- **Unkey** — API key verification
