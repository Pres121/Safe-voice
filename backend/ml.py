import os
from joblib import load
from typing import Optional

_MODEL = None

def load_model():
    global _MODEL
    if _MODEL is None:
        base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        model_path = os.path.join(base, "ML_model", "student_welfare_model (1).pkl")
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at {model_path}")
        _MODEL = load(model_path)
    return _MODEL

def predict(text: str) -> Optional[str]:
    model = load_model()
    try:
        pred = model.predict([text])
        if len(pred) > 0:
            return str(pred[0])
    except Exception:
        return None
    return None
