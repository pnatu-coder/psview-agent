"""
Core Agent Engine — The Intelligence Layer

This is NOT just an LLM call. The agent uses a 3-phase reasoning loop:
1. PLAN: Analyze context and decide on communication strategy
2. REFLECT: Evaluate if the plan aligns with personality and company context
3. ACT: Generate the final message

Each phase is a separate LLM call with distinct prompts, creating a
chain-of-thought that produces more intelligent, contextual output.
"""
import json
import os
from typing import List

from groq import Groq
from ..models import CompanyContext, CandidateProfile, ConversationMessage


class RecruitingAgent:
    """An autonomous recruiting agent that reasons about its actions."""

    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError("GROQ_API_KEY not set in environment")
        self.client = Groq(api_key=api_key)
        self.model = "llama-3.1-8b-instant"

    def _call_llm(self, prompt: str, temperature: float = 0.7) -> str:
        """Call LLM via Groq."""
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=temperature,
            max_tokens=1024,
        )
        return response.choices[0].message.content

    def build_personality(self, context: CompanyContext) -> dict:
        """
        Phase 0: Self-Configuration
        The agent builds its own personality from company context.
        """
        prompt = f"""You are an AI that must define a recruiting agent's personality based on a company's context.

Company: {context.company_name}
Industry: {context.industry}
Culture: {context.culture}
Desired Tone: {context.tone}
Roles Hiring: {context.roles_hiring}
What Makes Them Special: {context.unique_selling_points}
Additional Context: {context.additional_context or 'None'}

Define this agent's personality. Output JSON with these fields:
- "voice": How the agent speaks (sentence structure, vocabulary level, formality)
- "values": What the agent emphasizes in conversations (3-5 bullet points as a list)
- "boundaries": What the agent would never say or do
- "opening_style": How it opens conversations (direct question, shared interest, mutual connection, etc.)
- "persuasion_approach": How it convinces candidates (data-driven, emotional, aspirational, peer-validation)
- "emoji_usage": none, minimal, moderate
- "message_length": short (2-3 sentences), medium (4-6), detailed (7+)
- "name": A first name for the agent that fits the company vibe

Output ONLY valid JSON. No markdown fences, no explanation, no text before or after the JSON."""

        raw = self._call_llm(prompt, temperature=0.7)
        # Strip any markdown fences if present
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
        if cleaned.endswith("```"):
            cleaned = cleaned.rsplit("```", 1)[0]
        return json.loads(cleaned.strip())

    def _plan(self, context: CompanyContext, candidate: CandidateProfile,
              personality: dict, conversation_history: List[ConversationMessage],
              intent: str) -> str:
        """Phase 1: PLAN — Analyze the situation and decide on strategy."""
        history_text = ""
        if conversation_history:
            history_text = "\n".join([
                f"{'Agent' if m.role == 'agent' else 'Candidate'}: {m.content}"
                for m in conversation_history
            ])

        prompt = f"""You are a strategic planner for a recruiting agent.

COMPANY: {context.company_name} ({context.industry})
CANDIDATE: {candidate.name} | Role: {candidate.current_role or 'Unknown'} | Company: {candidate.current_company or 'Unknown'} | Skills: {candidate.skills or 'Unknown'}
AGENT PERSONALITY: {json.dumps(personality)}
INTENT: {intent}

CONVERSATION SO FAR:
{history_text or '(First contact)'}

Analyze the situation and create a plan:
1. What is the candidate's likely mental state right now?
2. What specific company detail would resonate most with this candidate?
3. What's the strategic goal of the next message?
4. What approach should we take? (question, value prop, social proof, urgency, etc.)
5. What should we absolutely NOT do?

Be specific and tactical. Reference actual company details."""

        return self._call_llm(prompt, temperature=0.6)

    def _reflect(self, context: CompanyContext, personality: dict,
                 plan: str, draft_message: str) -> str:
        """Phase 2: REFLECT — Check if the message stays in character."""
        prompt = f"""You are a quality checker for a recruiting agent's messages.

COMPANY: {context.company_name}
AGENT PERSONALITY: {json.dumps(personality)}
STRATEGIC PLAN: {plan}
DRAFT MESSAGE: {draft_message}

Evaluate this draft:
1. Does it match the agent's voice and tone? (rate 1-10)
2. Does it reference specific company details? (yes/no + which ones)
3. Is it generic or personalized? Explain.
4. Does it follow the strategic plan?
5. Suggested improvements (if any).

If the message scores 8+ and follows the plan, say "APPROVED".
If not, explain what needs to change."""

        return self._call_llm(prompt, temperature=0.4)

    def _act(self, context: CompanyContext, candidate: CandidateProfile,
             personality: dict, plan: str, reflection: str,
             conversation_history: List[ConversationMessage]) -> str:
        """Phase 3: ACT — Generate the final message."""
        history_text = ""
        if conversation_history:
            history_text = "\n".join([
                f"{'Agent' if m.role == 'agent' else 'Candidate'}: {m.content}"
                for m in conversation_history
            ])

        prompt = f"""You ARE the recruiting agent. Write your next message.

YOUR PERSONALITY: {json.dumps(personality)}
COMPANY: {context.company_name} ({context.industry})
Culture: {context.culture}
What makes us special: {context.unique_selling_points}
CANDIDATE: {candidate.name} | {candidate.current_role or ''} at {candidate.current_company or ''}

CONVERSATION SO FAR:
{history_text or '(This is your first message to the candidate)'}

YOUR STRATEGIC PLAN: {plan}
QUALITY FEEDBACK: {reflection}

Now write the message. Stay in character. Be {personality.get('voice', 'natural')}.
Message length: {personality.get('message_length', 'medium')}.
DO NOT include a subject line. Just the message body.
Make it feel human, not templated."""

        return self._call_llm(prompt, temperature=0.8)

    def generate_message(self, context: CompanyContext, candidate: CandidateProfile,
                         personality: dict, conversation_history: List[ConversationMessage],
                         intent: str = "engage candidate") -> dict:
        """
        Full reasoning loop: Plan -> Reflect -> Act
        Returns the message AND the reasoning trace.
        """
        # Phase 1: Plan
        plan = self._plan(context, candidate, personality, conversation_history, intent)

        # Phase 3: Act (first draft)
        draft = self._act(context, candidate, personality, plan, "", conversation_history)

        # Phase 2: Reflect on the draft
        reflection = self._reflect(context, personality, plan, draft)

        # If reflection says it needs improvement, regenerate
        if "APPROVED" not in reflection.upper():
            final_message = self._act(context, candidate, personality, plan, reflection, conversation_history)
        else:
            final_message = draft

        return {
            "message": final_message,
            "reasoning": {
                "plan": plan,
                "reflection": reflection,
                "approved_first_draft": "APPROVED" in reflection.upper()
            }
        }

    def generate_sequence(self, context: CompanyContext, candidate: CandidateProfile,
                          personality: dict) -> list:
        """Generate a multi-message outreach sequence (3 messages)."""
        intents = [
            "Initial outreach - spark curiosity, don't sell hard",
            "Follow-up - provide value, share something specific about the role or team",
            "Final nudge - create gentle urgency, offer easy next step"
        ]

        sequence = []
        history = []

        for i, intent in enumerate(intents):
            result = self.generate_message(
                context, candidate, personality, history, intent
            )
            msg = ConversationMessage(
                role="agent",
                content=result["message"],
                reasoning=json.dumps(result["reasoning"])
            )
            history.append(msg)
            sequence.append({
                "message_number": i + 1,
                "intent": intent,
                "content": result["message"],
                "reasoning": result["reasoning"]
            })

        return sequence
