from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.deps import require_role
from app.services.anomaly import detect_anomalies
from app.models.user import User, UserRole
from app.models.log import Log
from app.models.alert import Alert

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users")
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.admin))
):
    users = db.query(User).all()
    return [{"id": u.id, "email": u.email, "role": u.role, "created_at": u.created_at} for u in users]


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.admin))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}


@router.post("/upload_logs")
async def upload_logs(
    file: UploadFile = File(...),
    source: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.admin))
):
    content = (await file.read()).decode("utf-8")
    existing = db.query(Log).filter(Log.filename == file.filename, Log.uploaded_by == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Log file already uploaded")
    log = Log(filename=file.filename, source=source, content=content, uploaded_by=current_user.id)
    db.add(log)
    db.commit()
    db.refresh(log)

    anomalies = detect_anomalies(content)
    for anomaly in anomalies:
        db.add(Alert(log_id=log.id, severity=anomaly["severity"], message=anomaly["line"]))
    db.commit()

    return {"message": "Log uploaded", "log_id": log.id, "alerts_generated": len(anomalies)}


@router.get("/logs")
def list_logs(
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.admin))
):
    logs = db.query(Log).all()
    return [{"id": l.id, "filename": l.filename, "source": l.source, "uploaded_by": l.uploaded_by, "created_at": l.created_at} for l in logs]


@router.get("/audit")
def audit_log(
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.admin))
):
    alerts = db.query(Alert).order_by(Alert.created_at.desc()).limit(100).all()
    return [{"id": a.id, "log_id": a.log_id, "severity": a.severity, "status": a.status, "message": a.message, "malware_family": a.malware_family, "created_at": a.created_at} for a in alerts]
