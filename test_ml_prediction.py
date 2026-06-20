from backend.ml import normalize_prediction


def test_normalize_prediction_handles_model_labels():
    assert normalize_prediction("critical") == "Critical"
    assert normalize_prediction("high") == "High"
    assert normalize_prediction("medium") == "Medium"
    assert normalize_prediction("low") == "Low"


def test_normalize_prediction_falls_back_for_unknown_labels():
    assert normalize_prediction("spam") == "Low"
    assert normalize_prediction("neutral") == "Low"
