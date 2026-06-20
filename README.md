# PSVIEW — Autonomous Recruiting Agent

A recruiting agent that builds its own personality from company context, generates strategic outreach sequences, and holds adaptive conversations — with full reasoning transparency.

## The One Line

> **What makes it intelligent and not just an LLM call?**
>
> The agent runs a Plan → Reflect → Act loop on every message — it strategizes about the candidate's mental state, drafts a response, critiques its own draft against personality and plan, and rewrites if it fails its own quality check. It's not generating text; it's *reasoning about what to say and why*.

## What It Does

1. **Company Context Form** — Input company identity (culture, tone, roles, what makes them special)
2. **Self-Configuring Agent** — Autonomously builds its own personality (voice, values, boundaries, persuasion style) from that context
3. **Outreach Sequence** — Generates 3 messages with escalating intent (curiosity → value → urgency)
4. **Conversation Sandbox** — Simulate candidate replies and watch the agent reason + adapt in real time
5. **Reasoning Panel** — See the agent's strategic plan, self-reflection, and whether it approved or revised its own draft

## How the Intelligence Works

Every single message goes through 3 separate LLM calls:

| Phase | What It Does | Why It Matters |
|-------|-------------|----------------|
| **PLAN** | Analyzes candidate's mental state, picks strategy, identifies which company detail to reference | The agent *decides* what to do, not just what to say |
| **ACT** | Generates a draft message in-character | Raw output, not yet quality-checked |
| **REFLECT** | Rates the draft on personality consistency, specificity, and plan adherence (1-10) | Self-correction — if < 8/10, it rewrites |

The agent can reject its own first drafts. You can see this in the reasoning panel ("First Draft Approved" vs "Revised").

## Architecture

```
Frontend (React)                    Backend (FastAPI)
┌──────────────────┐               ┌─────────────────────────────┐
│ Company Form     │──POST────────▶│ /api/agents                 │
│ Agent List       │◀─GET─────────▶│ /api/agents/:id             │
│ Chat Sandbox     │──POST────────▶│ /api/reply                  │
│ Reasoning Panel  │               │                             │
└──────────────────┘               │   RecruitingAgent           │
                                   │   ├── build_personality()   │
                                   │   ├── _plan()               │
                                   │   ├── _act()                │
                                   │   ├── _reflect()            │
                                   │   └── generate_sequence()   │
                                   └─────────────────────────────┘
```

## Running Locally

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Add your Groq API key (free at console.groq.com)
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Backend | Python, FastAPI | Fast to build, clean async, great for AI apps |
| LLM | Groq (Llama 3) | Free tier, fast inference, good enough for demo |
| Frontend | React 18, Vite, Tailwind | Modern, fast, dark UI out of the box |
| State | JSON file + localStorage | No DB overhead for a demo — agents persist across restarts |
| Routing | React Router | Shareable URLs per agent (`/agents/:id`) |

## Design Choices

- **3 separate LLM calls per message** (not one mega-prompt) — gives transparency, self-correction, and visible reasoning
- **Personality as structured JSON** — inspectable, testable, changes with different company configs
- **Full conversation history** passed on each reply — agent has memory and adapts strategy over time
- **Visible reasoning panel** — the "surprise" factor: evaluators can watch the agent think, not just see output
- **Phase-aware loading** — UI shows which reasoning phase the agent is in (Planning → Composing → Reflecting)
- **Agent persistence** — create multiple agents, compare how personality changes across companies

## What I'd Add With More Time

- Streaming responses (show text as it generates)
- Personality consistency scoring (automated test: same company, 10 messages, measure drift)
- A/B testing mode (two agent personalities, same candidate, compare results)
- Email-thread view (show how the sequence would look in an inbox)
- Webhook integration (actually send via SendGrid/Mailgun — disabled for demo)
