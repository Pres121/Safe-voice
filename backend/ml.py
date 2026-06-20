from __future__ import annotations

from pathlib import Path
from typing import Any

import joblib

MODEL_PATH = Path(__file__).resolve().parents[1] / "ML_model" / "student_welfare_model3.pkl"

_MODEL: Any | None = None

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
    global _MODEL
    if _MODEL is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(
                f"Model file was not found at {MODEL_PATH}"
            )
        _MODEL = joblib.load(MODEL_PATH)
    return _MODEL


def predict_severity(text: str) -> str:
    """Predict severity for a report text using the trained model."""
    model = load_model()
    raw_prediction = model.predict([text])[0]
    return normalize_prediction(raw_prediction)
