import re
from sklearn.ensemble import IsolationForest
import numpy as np
from app.models.alert import AlertSeverity


def extract_features(log_content: str) -> list[dict]:
    lines = log_content.strip().split("\n")
    features = []
    for line in lines:
        features.append({
            "length": len(line),
            "error_keywords": sum(1 for w in ["error", "fail", "denied", "critical", "warn"] if w in line.lower()),
            "ip_count": len(re.findall(r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', line)),
            "has_port": 1 if re.search(r':\d{4,5}', line) else 0,
        })
    return features


def detect_anomalies(log_content: str) -> list[dict]:
    lines = log_content.strip().split("\n")
    if len(lines) < 2:
        return []

    features = extract_features(log_content)
    X = np.array([[f["length"], f["error_keywords"], f["ip_count"], f["has_port"]] for f in features])

    model = IsolationForest(contamination=0.1, random_state=42)
    predictions = model.fit_predict(X)
    scores = model.score_samples(X)

    alerts = []
    for i, (pred, score, line) in enumerate(zip(predictions, scores, lines)):
        if pred == -1:
            severity = _score_to_severity(score, features[i])
            alerts.append({"line": line.strip(), "severity": severity, "score": float(score)})

    return alerts


def _score_to_severity(score: float, features: dict) -> AlertSeverity:
    error_weight = features["error_keywords"] * 0.3
    adjusted = score - error_weight
    if adjusted < -0.6:
        return AlertSeverity.critical
    elif adjusted < -0.4:
        return AlertSeverity.high
    elif adjusted < -0.2:
        return AlertSeverity.medium
    return AlertSeverity.low
