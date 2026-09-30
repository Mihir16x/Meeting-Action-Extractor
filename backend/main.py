import os
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
from ai_service import analyze_meeting
from database import Base, engine, get_db
from schemas import AIAnalysisResult, MeetingAnalysisResponse, MeetingRequest

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Meeting Action Extractor API")

allowed_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Meeting Action Extractor API is running"}


@app.post("/analyze", response_model=MeetingAnalysisResponse)
def analyze(
    request: MeetingRequest,
    db: Session = Depends(get_db)
):
    try:
        raw_ai_result = analyze_meeting(request.meeting_notes)
        ai_result = AIAnalysisResult.model_validate(raw_ai_result)

        analysis = models.MeetingAnalysis(
            meeting_notes=request.meeting_notes,
            summary=ai_result.summary,
            decisions=ai_result.decisions,
            action_items=[item.model_dump() for item in ai_result.action_items],
        )

        db.add(analysis)
        db.commit()
        db.refresh(analysis)

        return analysis

    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/analyses", response_model=list[MeetingAnalysisResponse])
def get_analyses(db: Session = Depends(get_db)):
    return (
        db.query(models.MeetingAnalysis)
        .order_by(models.MeetingAnalysis.created_at.desc())
        .all()
    )