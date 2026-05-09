from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.deps import require_role
from app.models.user import User, UserRole
from app.models.alert import Alert, AlertStatus

router = APIRouter(prefix="/viewer", tags=["viewer"])


@router.get("/alerts")
def list_alerts(
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.viewer, UserRole.analyst, UserRole.admin))
):
    alerts = db.query(Alert).filter(Alert.status != AlertStatus.open).order_by(Alert.created_at.desc()).all()
    return [
        {"id": a.id, "severity": a.severity, "status": a.status, "message": a.message, "created_at": a.created_at}
        for a in alerts
    ]


@router.get("/dashboard")
def dashboard(
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.viewer, UserRole.analyst, UserRole.admin))
):
    total = db.query(Alert).count()
    open_count = db.query(Alert).filter(Alert.status == AlertStatus.open).count()
    triaged_count = db.query(Alert).filter(Alert.status == AlertStatus.triaged).count()
    resolved_count = db.query(Alert).filter(Alert.status == AlertStatus.resolved).count()
    return {
        "total_alerts": total,
        "open": open_count,
        "triaged": triaged_count,
        "resolved": resolved_count
    }
