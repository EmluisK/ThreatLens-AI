from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.deps import get_current_user
from app.services import iot_classifier
from app.models.user import User
from app.models.alert import Alert, AlertSeverity

router = APIRouter(prefix="/ingest", tags=["iot"])

_FAMILY_SEVERITY = {
    "Mirai":      AlertSeverity.critical,
    "DarkNexus":  AlertSeverity.critical,
    "Gafgyt":     AlertSeverity.high,
    "Generic":    AlertSeverity.high,
    "Benign":     AlertSeverity.low,
}


class IoTIngestRequest(BaseModel):
    hash: str
    arch: str
    source: str = "iot-sandbox"
    features: dict[str, float]


def _severity(family: str, confidence: float) -> AlertSeverity:
    base = _FAMILY_SEVERITY.get(family, AlertSeverity.medium)
    if family == "Benign":
        return AlertSeverity.low
    if confidence < 0.5:
        return AlertSeverity.medium
    return base


@router.post("/iot")
def ingest_iot(
    body: IoTIngestRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = iot_classifier.classify(body.features)
    family = result["family"]
    confidence = result["confidence"]
    ready = result["model_ready"]

    severity = _severity(family, confidence) if ready else AlertSeverity.low
    message = (
        f"[IoT/{body.arch}] {body.hash[:12]}... — {family} ({confidence:.1%} confidence)"
        if ready
        else f"[IoT/{body.arch}] {body.hash[:12]}... — model not trained yet"
    )

    alert = Alert(
        log_id=None,
        severity=severity,
        message=message,
        malware_family=family if ready and family not in ("unknown", "error") else None,
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)

    response = {
        "alert_id": alert.id,
        "family": family,
        "confidence": confidence,
        "severity": severity.value,
        "model_ready": ready,
    }
    if "probabilities" in result:
        response["probabilities"] = result["probabilities"]
    return response


@router.get("/iot/status")
def iot_status(_: User = Depends(get_current_user)):
    ready = iot_classifier.model_ready()
    return {
        "model_ready": ready,
        "message": (
            "LightGBM fusion model loaded and ready."
            if ready
            else "Model artifacts not found. Run the notebook serialization cells to generate iot_fusion_model.txt and iot_meta.json."
        ),
    }
