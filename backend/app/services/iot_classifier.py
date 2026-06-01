import json
import numpy as np
from pathlib import Path

_MODEL_DIR = Path(__file__).parent.parent / "ml_artifacts"
_MODEL_PATH = _MODEL_DIR / "iot_fusion_model.txt"
_META_PATH = _MODEL_DIR / "iot_meta.json"

_booster = None
_meta = None


def _load():
    global _booster, _meta
    if not (_MODEL_PATH.exists() and _META_PATH.exists()):
        print("[iot_classifier] model artifacts not found — IoT classification disabled until notebook is run")
        return
    try:
        import lightgbm as lgb
        _booster = lgb.Booster(model_file=str(_MODEL_PATH))
        with open(_META_PATH) as f:
            _meta = json.load(f)
        print(f"[iot_classifier] loaded — {len(_meta['top100_cols'])} features, classes: {_meta['classes']}")
    except Exception as e:
        print(f"[iot_classifier] load failed: {e}")


_load()


def model_ready() -> bool:
    return _booster is not None and _meta is not None


def classify(features: dict) -> dict:
    if not model_ready():
        return {"family": "unknown", "confidence": 0.0, "model_ready": False}
    try:
        cols = _meta["top100_cols"]
        classes = _meta["classes"]
        x = np.array([[float(features.get(c, 0.0)) for c in cols]], dtype=np.float64)
        probs = _booster.predict(x)[0]
        idx = int(np.argmax(probs))
        return {
            "family": classes[idx],
            "confidence": float(probs[idx]),
            "model_ready": True,
            "probabilities": {c: float(p) for c, p in zip(classes, probs)},
        }
    except Exception as e:
        print(f"[iot_classifier] predict error: {e}")
        return {"family": "error", "confidence": 0.0, "model_ready": True}
