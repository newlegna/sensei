"""Trend Radar — FastAPI server wrapping the Railtracks agent."""
import json
import re
import os


def clean_response(raw) -> str:
    """Strip Railtracks LLMResponse wrapper if present."""
    s = str(raw)
    match = re.match(r'^LLMResponse\((.*)\)$', s, re.DOTALL)
    return match.group(1).strip() if match else s.strip()
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agent import get_flow
from trends import get_all_trends
import uvicorn

app = FastAPI(title="Trend Radar Agent API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str


@app.get("/health")
async def health():
    return {"status": "ok", "agent": "Trend Radar", "powered_by": ["Railtracks", "Senso.ai"]}


@app.post("/scan")
async def scan_trends():
    """
    Fetch live trends from HN + Reddit, then use Railtracks to check
    Senso coverage and generate content briefs for each.
    """
    try:
        # Step 1: Fetch raw trends (fast, no AI)
        raw_trends = get_all_trends(limit=12)
        if not raw_trends:
            return {"trends": [], "error": "Could not fetch trends"}

        # Step 2: Pass to Railtracks agent for Senso coverage check + brief generation
        flow = get_flow()
        prompt = (
            "Analyze these trending topics for content coverage gaps. "
            "For each topic, check Senso and generate a brief.\n\n"
            f"TRENDS:\n{json.dumps(raw_trends, indent=2)}\n\n"
            "Return a JSON array with all topics analyzed."
        )
        result = await flow.ainvoke(prompt)

        # Step 3: Extract JSON array from agent response
        result_str = clean_response(result)
        json_match = re.search(r'\[[\s\S]*\]', result_str)
        if json_match:
            trends = json.loads(json_match.group())
            # Sort: uncovered first, then by score
            trends.sort(key=lambda x: (x.get("covered", True), -x.get("score", 0)))
            return {"trends": trends}

        # Fallback: return raw trends without AI analysis
        fallback = [
            {**t, "covered": False, "brief": f"Trending on {t['source']} with {t['score']} points."}
            for t in raw_trends
        ]
        return {"trends": fallback, "warning": "AI analysis unavailable, showing raw trends"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat")
async def chat(request: ChatRequest):
    """Chat with the Trend Radar agent about trends and content strategy."""
    try:
        flow = get_flow()
        result = await flow.ainvoke(request.message)
        return {"response": clean_response(result)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    port = int(os.environ.get("AGENT_PORT", 8001))
    print(f"🚀 Trend Radar Agent on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
