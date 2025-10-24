from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID
import uuid, datetime as dt
from app.db.session import get_db
from app.core.config import settings
from app.models.summary import Summary
from app.schemas.summary import SummaryCreate,SummaryView, PredictIn
from app.core.security import get_current_user
from app.models.user import User
from sqlalchemy import desc
import requests

router = APIRouter(prefix="/summaries", tags=["summaries"])

URL_PREDICT = settings.URL_PREDICT


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

@router.post("/predict", response_model=SummaryView, status_code=201)
def predict_and_save(
    body: PredictIn,                   
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user), 
):
    try:
        resp = requests.post(URL_PREDICT, json={"text": body.text}, timeout=15)
    except requests.Timeout:
        raise HTTPException(status_code=504, detail="Prediction service timeout")
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Prediction service error: {e}")

    if not resp.ok:
        raise HTTPException(status_code=502, detail=f"Upstream {resp.status_code}: {resp.text}")

    try:
        data = resp.json()
    except ValueError:
        raise HTTPException(status_code=502, detail=f"Prediction returned invalid JSON: {resp.text[:200]}")
    summary_text = data.get("summary") or data.get("summary_text") or data.get("result")
    if not summary_text or not isinstance(summary_text, str):
        raise HTTPException(status_code=502, detail=f"Missing summary in upstream payload: {data}")

    row = Summary(
        id=uuid.uuid4(),
        user_id=str(current_user.id),
        original_text=body.text,
        summary_text=summary_text,
        created_at=dt.datetime.now(dt.timezone.utc),
    )
    try:
        db.add(row); db.commit(); db.refresh(row)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"DB insert error: {e}")

    return row
