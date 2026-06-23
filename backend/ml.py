from __future__ import annotations

import time
from pathlib import Path
from typing import Any

import joblib

MODEL_PATH = Path(__file__).resolve().parents[1] / "ML_model" / "student_welfare_model3.pkl"

_MODEL: Any | None = None
_MODEL_LOADED_AT: float | None = None

LABEL_MAP = {
    "critical": "Critical",
    "high": "High",
    "medium": "Medium",
    "low": "Low",
}


def normalize_prediction(value: Any) -> str:
    """Normalize raw model labels into user-friendly severity strings."""
    label = str(value).strip().lower()
    return LABEL_MAP.get(label, "Low")


def load_model():
    global _MODEL, _MODEL_LOADED_AT
    if _MODEL is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(
                f"Model file was not found at {MODEL_PATH}"
            )
        _MODEL = joblib.load(MODEL_PATH)
        _MODEL_LOADED_AT = time.time()
    return _MODEL


def is_model_loaded() -> bool:
    return _MODEL is not None


def get_model_info() -> dict[str, Any]:
    """Return metadata about the ML model file and loaded state."""
    info: dict[str, Any] = {
        "path": str(MODEL_PATH),
        "file_exists": MODEL_PATH.exists(),
        "loaded": is_model_loaded(),
        "loaded_at": _MODEL_LOADED_AT,
    }

    if MODEL_PATH.exists():
        stat = MODEL_PATH.stat()
        info["file_size_bytes"] = stat.st_size
        info["file_modified_at"] = stat.st_mtime

    if is_model_loaded() and _MODEL is not None:
        info["model_type"] = type(_MODEL).__name__
        classes = getattr(_MODEL, "classes_", None)
        if classes is not None:
            info["classes"] = [str(c) for c in classes]
        steps = getattr(_MODEL, "named_steps", None)
        if steps:
            info["pipeline_steps"] = list(steps.keys())

    return info


def verify_model_prediction() -> dict[str, Any]:
    """Run a smoke-test prediction to confirm the model responds."""
    sample = "I feel unsafe and need urgent help."
    started = time.perf_counter()
    severity = predict_severity(sample)
    elapsed_ms = round((time.perf_counter() - started) * 1000, 2)
    return {
        "sample_text": sample,
        "predicted_severity": severity,
        "latency_ms": elapsed_ms,
        "ok": True,
    }


def predict_severity(text: str) -> str:
    """Predict severity for a report text using the trained model."""
    model = load_model()
    raw_prediction = model.predict([text])[0]
    return normalize_prediction(raw_prediction)
