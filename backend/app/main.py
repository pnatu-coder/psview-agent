"""FastAPI application — API routes for the recruiting agent."""
import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .models import (
    CompanyContext, CandidateProfile, ConversationMessage,
    GenerateSequenceRequest, ReplyRequest
)
from .agent.engine import RecruitingAgent
from . import store

load_dotenv()

app = FastAPI(title="PSVIEW Recruiting Agent", version="1.0.0")

# CORS — local dev origins are always allowed; add your deployed frontend
# origin(s) via the ALLOWED_ORIGINS env var (comma-separated, e.g.
# "https://psview-agent.vercel.app,https://www.yourdomain.com").
_default_origins = ["http://localhost:3000", "http://localhost:5173"]
_extra_origins = [
    o.strip() for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_default_origins + _extra_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Agent instance — uses GROQ_API_KEY from environment
agent = RecruitingAgent()

# Pre-seed demo agent on startup
store.seed_if_empty()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/personality")
def generate_personality(context: CompanyContext):
    """Generate agent personality from company context."""
    try:
        personality = agent.build_personality(context)
        return {"personality": personality}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/sequence")
def generate_sequence(request: GenerateSequenceRequest):
    """Generate a full outreach sequence (3 messages with reasoning)."""
    try:
        personality = agent.build_personality(request.company_context)
        sequence = agent.generate_sequence(
            request.company_context, request.candidate, personality
        )
        return {
            "personality": personality,
            "sequence": sequence
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/reply")
def handle_reply(request: ReplyRequest):
    """Handle a candidate reply — agent reasons and responds."""
    try:
        personality = agent.build_personality(request.company_context)

        history = request.conversation_history + [
            ConversationMessage(role="candidate", content=request.candidate_reply)
        ]

        result = agent.generate_message(
            request.company_context,
            request.candidate,
            personality,
            history,
            intent="respond to candidate's reply naturally, advance toward scheduling a call"
        )

        return {
            "agent_message": result["message"],
            "reasoning": result["reasoning"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- Agent CRUD ---

@app.get("/api/agents")
def list_agents():
    """List all saved agents."""
    return {"agents": store.list_agents()}


@app.get("/api/agents/{agent_id}")
def get_agent(agent_id: str):
    """Get a specific saved agent."""
    result = store.get_agent(agent_id)
    if not result:
        raise HTTPException(status_code=404, detail="Agent not found")
    return result


@app.delete("/api/agents/{agent_id}")
def delete_agent(agent_id: str):
    """Delete a saved agent."""
    if store.delete_agent(agent_id):
        return {"status": "deleted"}
    raise HTTPException(status_code=404, detail="Agent not found")


@app.post("/api/agents")
def create_agent(request: GenerateSequenceRequest):
    """Create and save a new agent (generates personality + sequence)."""
    try:
        personality = agent.build_personality(request.company_context)
        sequence = agent.generate_sequence(
            request.company_context, request.candidate, personality
        )
        agent_id = store.save_agent(
            request.company_context.model_dump(),
            personality,
            sequence,
        )
        return {
            "id": agent_id,
            "personality": personality,
            "sequence": sequence,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
