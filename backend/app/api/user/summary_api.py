from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID
import uuid, datetime as dt
from app.db.session import get_db
from app.models.summary import Summary
from app.schemas.summary import SummaryCreate,SummaryView
from app.core.security import get_current_user
from app.models.user import User
from sqlalchemy import desc

router = APIRouter(prefix="/summaries", tags=["summaries"])

@router.post("", response_model=SummaryView)
def create_summary(
    summary_in: SummaryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    summary = Summary(
        id=uuid.uuid4(),
        user_id=current_user.id,
        original_text=summary_in.original_text,
        summary_text=summary_in.summary_text,
        created_at=dt.datetime.now(dt.timezone.utc),
    )
    db.add(summary)
    db.commit()
    db.refresh(summary)
    return summary

@router.get("", response_model=list[SummaryView])
def get_summaries(
    skip: int = 0,
    limit: int = Query(10, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    summaries = (
        db.query(Summary)
        .filter(Summary.user_id == current_user.id)
        .order_by(desc(Summary.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )
    return summaries

@router.get("/{summary_id}", response_model=SummaryView)
def get_summary(
    summary_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    summary = db.query(Summary).filter(Summary.id == summary_id, Summary.user_id == current_user.id).first()
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found")
    return summary