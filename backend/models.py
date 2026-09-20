from sqlalchemy import Column, DateTime, Integer, JSON, Text
from sqlalchemy.sql import func

from database import Base


class MeetingAnalysis(Base):
    __tablename__ = "meeting_analyses"

    id = Column(Integer, primary_key=True, index=True)

    meeting_notes = Column(Text, nullable=False)

    summary = Column(Text, nullable=False)

    decisions = Column(JSON, nullable=False)

    action_items = Column(JSON, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )