from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class MeetingRequest(BaseModel):
    meeting_notes: str


class ActionItem(BaseModel):
    task: str
    owner: Optional[str] = None
    deadline: Optional[str] = None
    follow_up: Optional[str] = None


class AIAnalysisResult(BaseModel):
    summary: str
    decisions: List[str]
    action_items: List[ActionItem]


class MeetingAnalysisResponse(BaseModel):
    id: int
    meeting_notes: str
    summary: str
    decisions: List[str]
    action_items: List[ActionItem]
    created_at: datetime

    class Config:
        from_attributes = True