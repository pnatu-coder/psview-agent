"""Pydantic models for request/response schemas."""
from __future__ import annotations
from pydantic import BaseModel
from typing import Optional, List


class CompanyContext(BaseModel):
    """Company context submitted via the form."""
    company_name: str
    industry: str
    culture: str
    tone: str
    roles_hiring: str
    unique_selling_points: str
    additional_context: Optional[str] = None


class CandidateProfile(BaseModel):
    """Basic candidate info for personalized outreach."""
    name: str
    current_role: Optional[str] = None
    current_company: Optional[str] = None
    skills: Optional[str] = None


class ConversationMessage(BaseModel):
    """A single message in the conversation."""
    role: str  # "agent" or "candidate"
    content: str
    reasoning: Optional[str] = None


class GenerateSequenceRequest(BaseModel):
    """Request to generate an outreach sequence."""
    company_context: CompanyContext
    candidate: CandidateProfile


class ReplyRequest(BaseModel):
    """Request when candidate replies."""
    company_context: CompanyContext
    candidate: CandidateProfile
    conversation_history: List[ConversationMessage]
    candidate_reply: str
