from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.services.deps import require_role
from app.services.ai import triage_alert
from app.models.user import User, UserRole
from app.models.log import Log
from app.models.alert import Alert, AlertStatus, TriageHistory

router = APIRouter(prefix="/analyst", tags=["analyst"])


class TriageRequest(BaseModel):
    notes: str = ""


@router.get("/alerts")
def list_alerts(
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.analyst, UserRole.admin))
):
    alerts = db.query(Alert).order_by(Alert.created_at.desc()).all()
    return [
        {"id": a.id, "log_id": a.log_id, "severity": a.severity, "status": a.status, "message": a.message, "created_at": a.created_at}
        for a in alerts
    ]


@router.get("/logs/{log_id}")
def get_log(
    log_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.analyst, UserRole.admin))
):
    log = db.query(Log).filter(Log.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    return {"id": log.id, "filename": log.filename, "source": log.source, "content": log.content, "created_at": log.created_at}


@router.get("/triage_history")
def triage_history(
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.analyst, UserRole.admin))
):
    history = db.query(TriageHistory).order_by(TriageHistory.created_at.desc()).all()
    return [
        {"id": h.id, "alert_id": h.alert_id, "triaged_by": h.triaged_by, "ai_response": h.ai_response, "remediation": h.remediation, "created_at": h.created_at}
        for h in history
    ]


@router.post("/alerts/{alert_id}/triage")
async def triage(
    alert_id: int,
    body: TriageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.analyst, UserRole.admin))
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    log = db.query(Log).filter(Log.id == alert.log_id).first()
    log_content = log.content if log else ""

    result = await triage_alert(alert.message, alert.severity.value, log_content)

    entry = TriageHistory(
        alert_id=alert.id,
        triaged_by=current_user.id,
        ai_response=result.get("summary"),
        remediation=result.get("remediation")
    )
    alert.status = AlertStatus.triaged
    db.add(entry)
    db.commit()
    db.refresh(entry)

    return {"triage_id": entry.id, "ai_response": entry.ai_response, "remediation": entry.remediation}
