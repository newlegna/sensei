"""Raw trend fetching — no AI, just fast HTTP calls."""
import requests
import json
import time
from bs4 import BeautifulSoup

HN_API = "https://hn.algolia.com/api/v1/search"
REDDIT_HEADERS = {"User-Agent": "TrendRadar/1.0 (hackathon demo)"}


def fetch_hn(limit: int = 15) -> list[dict]:
    """Fetch top stories from Hacker News Algolia API — last 7 days only."""
    week_ago = int(time.time()) - 7 * 24 * 3600
    try:
        r = requests.get(
            HN_API,
            params={
                "tags": "story",
                "numericFilters": f"points>30,created_at_i>{week_ago}",
                "hitsPerPage": limit,
            },
            timeout=10,
        )
        r.raise_for_status()
        hits = r.json().get("hits", [])
        return [
            {
                "title": h.get("title", ""),
                "url": h.get("url") or f"https://news.ycombinator.com/item?id={h.get('objectID')}",
                "score": h.get("points", 0),
                "comments": h.get("num_comments", 0),
                "source": "HackerNews",
            }
            for h in hits
            if h.get("title")
        ]
    except Exception as e:
        print(f"HN fetch error: {e}")
        return []


def fetch_reddit(subreddits: str = "technology+webdev+entrepreneur+artificial+marketing") -> list[dict]:
    """Fetch top posts from Reddit public JSON API."""
    try:
        r = requests.get(
            f"https://www.reddit.com/r/{subreddits}/top.json",
            params={"t": "day", "limit": 25},
            headers=REDDIT_HEADERS,
            timeout=10,
        )
        r.raise_for_status()
        children = r.json().get("data", {}).get("children", [])
        posts = []
        for c in children:
            p = c.get("data", {})
            if p.get("score", 0) > 50 and not p.get("is_self", False):
                posts.append({
                    "title": p.get("title", ""),
                    "url": p.get("url", f"https://reddit.com{p.get('permalink', '')}"),
                    "score": p.get("score", 0),
                    "comments": p.get("num_comments", 0),
                    "subreddit": f"r/{p.get('subreddit', '')}",
                    "source": "Reddit",
                })
        return posts
    except Exception as e:
        print(f"Reddit fetch error: {e}")
        return []


def fetch_github_trending(limit: int = 10) -> list[dict]:
    """Scrape GitHub Trending page for today's top repos."""
    try:
        r = requests.get(
            "https://github.com/trending?since=daily&spoken_language_code=en",
            headers={"User-Agent": "TrendRadar/1.0 (hackathon demo)"},
            timeout=10,
        )
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "lxml")
        repos = []
        for article in soup.select("article.Box-row")[:limit]:
            # Repo name
            h2 = article.select_one("h2 a")
            if not h2:
                continue
            slug = h2.get("href", "").strip("/")
            title = slug.replace("/", " / ")
            url = f"https://github.com/{slug}"

            # Description
            desc_el = article.select_one("p")
            description = desc_el.get_text(strip=True) if desc_el else ""

            # Stars today
            stars_today_el = article.select_one("span.d-inline-block.float-sm-right")
            stars_today_text = stars_today_el.get_text(strip=True) if stars_today_el else "0"
            stars_today = int("".join(filter(str.isdigit, stars_today_text)) or 0)

            # Total stars (used as score proxy)
            star_links = article.select("a[href$='/stargazers']")
            total_stars_text = star_links[0].get_text(strip=True) if star_links else "0"
            total_stars = int("".join(filter(str.isdigit, total_stars_text.replace(",", ""))) or 0)

            repos.append({
                "title": f"{title} — {description}" if description else title,
                "url": url,
                "score": stars_today if stars_today > 0 else max(total_stars // 100, 1),
                "comments": total_stars,
                "source": "GitHub",
                "subreddit": "github.com/trending",
            })
        return repos
    except Exception as e:
        print(f"GitHub trending fetch error: {e}")
        return []


def get_all_trends(limit: int = 20) -> list[dict]:
    """Fetch and merge trends from HN, Reddit, and GitHub Trending.
    Guarantees at least 4 GitHub results regardless of score."""
    hn = fetch_hn(limit=limit)
    reddit = fetch_reddit()
    github = fetch_github_trending(limit=6)

    # Deduplicate each source
    def dedup(items):
        seen, out = set(), []
        for t in items:
            key = t["title"].lower()[:60]
            if key not in seen:
                seen.add(key)
                out.append(t)
        return out

    hn = dedup(hn)
    reddit = dedup(reddit)
    github = dedup(github)

    # Sort HN + Reddit by score, take top slots, always keep GitHub
    combined = sorted(hn + reddit, key=lambda x: x["score"], reverse=True)
    top_slots = limit - len(github)
    return combined[:top_slots] + github
