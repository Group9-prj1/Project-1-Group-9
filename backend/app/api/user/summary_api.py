from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID
import uuid, datetime as dt
from app.db.session import get_db
from app.models.summary import Summary
from app.schemas.summary import SummaryCreate,SummaryView
from app.core.security import get_current_user
from app.models.user import User

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
