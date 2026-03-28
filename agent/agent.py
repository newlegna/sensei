"""
Trend Radar — Railtracks Agent
Checks creator's Senso knowledge base for coverage gaps against live trends.
"""
import subprocess
import json
import os
import railtracks as rt

rt.load_dotenv()


@rt.function_node
def check_senso_coverage(topic: str) -> str:
    """Check if a topic is already covered in the creator's Senso knowledge base.

    Args:
        topic: The trending topic title to check coverage for.

    Returns:
        JSON string with covered (bool), score, and matching content titles.
    """
    senso_key = os.environ.get("SENSO_API_KEY", "")
    if not senso_key:
        return json.dumps({"covered": False, "score": 0, "matches": []})

    env = {**os.environ, "SENSO_API_KEY": senso_key}
    result = subprocess.run(
        ["senso", "search", "context", topic, "--output", "json", "--quiet", "--max-results", "3"],
        capture_output=True, text=True, env=env, timeout=20,
    )
    if result.returncode != 0:
        return json.dumps({"covered": False, "score": 0, "matches": []})

    try:
        data = json.loads(result.stdout.strip())
        results = data.get("results", [])
        high = [r for r in results if r.get("score", 0) > 0.35]
        return json.dumps({
            "covered": len(high) > 0,
            "score": max((r.get("score", 0) for r in results), default=0),
            "matches": [r.get("title", "") for r in high],
        })
    except Exception as e:
        return json.dumps({"covered": False, "score": 0, "matches": [], "error": str(e)})


@rt.function_node
def generate_content_brief(topic: str, source: str, trend_score: int, covered: bool, existing_content: str) -> str:
    """Generate an actionable content brief for a trending topic.

    Args:
        topic: The trending topic title.
        source: Where the trend was found (HackerNews, Reddit).
        trend_score: The engagement score of the trend.
        covered: Whether the creator has covered this topic before.
        existing_content: Titles of existing content on this topic (if any).

    Returns:
        A concise, actionable content brief as a string.
    """
    if covered:
        return f"You've covered '{topic}' before ({existing_content}). Consider a follow-up angle or updated take since it's trending again with {trend_score} points on {source}."

    return (
        f"🔥 UNCOVERED TREND: '{topic}' is gaining {trend_score} points on {source}.\n\n"
        f"OPPORTUNITY: You haven't covered this yet — first-mover advantage.\n\n"
        f"ANGLE IDEAS:\n"
        f"• Beginner explainer: 'What is {topic} and why it matters'\n"
        f"• Hot take: Your opinion on the {topic} trend\n"
        f"• Tutorial: How to get started with {topic}\n\n"
        f"ACT NOW: This topic is rising — publish within 48 hours for maximum reach."
    )


def create_trend_agent():
    llm = rt.llm.GeminiLLM("gemini-2.5-flash")
    agent = rt.agent_node(
        "Trend Radar Agent",
        tool_nodes=[check_senso_coverage, generate_content_brief],
        llm=llm,
        system_message="""You are Trend Radar, an autonomous content intelligence agent.

Given a list of trending topics, for each one:
1. Call check_senso_coverage to see if the creator has covered it
2. Call generate_content_brief to create an actionable brief
3. Return ALL results as a valid JSON array

Each item in the array must have:
- title (string)
- source (string)  
- score (number)
- url (string)
- covered (boolean)
- brief (string)

Return ONLY the JSON array, no other text.""",
    )
    return rt.Flow(name="Trend Radar Flow", entry_point=agent)


_flow = None


def get_flow():
    global _flow
    if _flow is None:
        _flow = create_trend_agent()
    return _flow
