"""Simple file-based store for agent configurations."""
import json
import os
import uuid
from typing import List, Optional
from .models import CompanyContext

# Store in the backend directory itself (survives restarts)
STORE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STORE_FILE = os.path.join(STORE_DIR, "agents_data.json")


def _load() -> dict:
    if os.path.exists(STORE_FILE):
        try:
            with open(STORE_FILE, "r") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return {"agents": []}
    return {"agents": []}


def _save(data: dict):
    with open(STORE_FILE, "w") as f:
        json.dump(data, f, indent=2)


def save_agent(company_context: dict, personality: dict, sequence: list = None) -> str:
    """Save an agent config and return its ID."""
    data = _load()
    agent_id = str(uuid.uuid4())[:8]
    data["agents"].append({
        "id": agent_id,
        "company_context": company_context,
        "personality": personality,
        "sequence": sequence or [],
    })
    _save(data)
    return agent_id


def list_agents() -> List[dict]:
    """List all saved agents."""
    data = _load()
    return [
        {
            "id": a["id"],
            "company_name": a["company_context"]["company_name"],
            "industry": a["company_context"].get("industry", ""),
            "tone": a["company_context"]["tone"],
            "personality_name": a["personality"].get("name", "Agent"),
            "personality_voice": a["personality"].get("voice", ""),
            "personality_opening": a["personality"].get("opening_style", ""),
            "message_count": len(a.get("sequence", [])),
        }
        for a in data["agents"]
    ]


def get_agent(agent_id: str) -> Optional[dict]:
    """Get a specific agent by ID."""
    data = _load()
    for a in data["agents"]:
        if a["id"] == agent_id:
            return a
    return None


def delete_agent(agent_id: str) -> bool:
    """Delete an agent by ID."""
    data = _load()
    original_len = len(data["agents"])
    data["agents"] = [a for a in data["agents"] if a["id"] != agent_id]
    _save(data)
    return len(data["agents"]) < original_len


SEED_AGENT = {
    "id": "demo-stripe",
    "company_context": {
        "company_name": "Stripe",
        "industry": "Fintech / Payments Infrastructure",
        "culture": "Remote-first, deep work culture, writing-heavy (memos over meetings), high autonomy, small teams owning massive scope, obsessed with developer experience",
        "tone": "casual",
        "roles_hiring": "Senior Backend Engineers, Infrastructure Engineers, ML Engineers",
        "unique_selling_points": "Building the economic infrastructure of the internet. 95% of Fortune 500 use Stripe. $95B valuation. Teams of 3-5 engineers ship products used by millions. Culture of intellectual rigor — your coworkers wrote the books you read in college.",
        "additional_context": "We value people who write clearly, think from first principles, and ship fast. No bureaucracy. Engineers talk directly to users."
    },
    "personality": {
        "name": "Jordan",
        "voice": "Clear, concise, and technical. Uses casual sentence structures with a warm but direct tone. Avoids corporate jargon.",
        "values": [
            "Autonomy and deep ownership of problems",
            "Intellectual rigor and first-principles thinking",
            "Shipping fast and iterating with real users",
            "Clear, written communication over meetings",
            "Small teams with massive scope"
        ],
        "boundaries": "Never badmouths other companies. Never uses pushy sales language. Never makes promises about comp or role specifics without confirming.",
        "opening_style": "Shared technical interest — references something specific about the candidate's work",
        "persuasion_approach": "Aspirational + peer-validation. Focuses on the caliber of problems and people, not perks.",
        "emoji_usage": "none",
        "message_length": "medium",
    },
    "sequence": [
        {
            "message_number": 1,
            "intent": "Initial outreach - spark curiosity, don't sell hard",
            "content": "Hi Alex,\n\nI've been looking at your work on distributed systems and payment processing at Google — really interesting stuff. I'm on the engineering team at Stripe, where we're building the payments infrastructure that powers most of the internet's commerce.\n\nCurious: what's the most interesting scaling challenge you're working on right now? We're tackling some gnarly problems in transaction reliability at our scale (billions of API calls/day), and your background in distributed systems caught my eye.\n\nNo pitch — genuinely curious about what you're solving these days.",
            "reasoning": {
                "plan": "Alex is likely content at Google but intellectually curious. Lead with a technical question about their work, not a job pitch. Reference Stripe's scale to signal interesting problems without selling.",
                "reflection": "Message is casual, references specific technical context (distributed systems, scaling), doesn't sell. Stays in character. APPROVED.",
                "approved_first_draft": True
            }
        },
        {
            "message_number": 2,
            "intent": "Follow-up - provide value, share something specific about the role or team",
            "content": "Hey Alex,\n\nFollowing up — wanted to share something that might interest you. Our payments team just shipped a new idempotency layer that handles 99.999% of edge cases in distributed transaction retries. The team that built it is 4 engineers.\n\nThat's what I mean by scope here — small teams, massive problems. The engineer who designed it came from Google's Spanner team, actually.\n\nIf the kind of problem (making money movement reliable at internet scale) is interesting to you, I'd love to set up a 20-min chat with the team lead. No commitment, just two engineers talking shop.",
            "reasoning": {
                "plan": "Alex didn't respond to the first message. Provide concrete value — share a specific technical achievement that demonstrates the kind of work they'd do. Name-drop a Google connection for peer validation.",
                "reflection": "References specific technical work (idempotency layer), gives concrete team size (4 engineers), offers low-commitment next step. Matches casual tone. APPROVED.",
                "approved_first_draft": True
            }
        },
        {
            "message_number": 3,
            "intent": "Final nudge - create gentle urgency, offer easy next step",
            "content": "Hi Alex,\n\nLast note from me — I know you're busy. We're currently building out the team for a new payments reliability initiative (think: making Stripe's infrastructure work flawlessly across 46 countries with different banking systems). The technical lead is hiring 2 senior engineers.\n\nIf you're even slightly curious, I can send over a short doc about the problem space. No application, no interview — just context so you can decide if it's worth a conversation.\n\nEither way, no hard feelings. I just think the problems we're solving would genuinely excite someone with your background.",
            "reasoning": {
                "plan": "Final message. Create soft urgency (specific team, specific headcount) but maintain respect for their time. Offer the lowest-friction next step possible (a doc, not a call). Close gracefully.",
                "reflection": "Gentle urgency without being pushy. Specific (46 countries, 2 headcount). Ultra-low-commitment ask (read a doc). Graceful close. Perfect tone. APPROVED.",
                "approved_first_draft": True
            }
        }
    ]
}


def seed_if_empty():
    """Pre-seed a demo agent if the store is empty."""
    data = _load()
    # Check if seed already exists
    for a in data["agents"]:
        if a["id"] == "demo-stripe":
            return
    data["agents"].insert(0, SEED_AGENT)
    _save(data)
