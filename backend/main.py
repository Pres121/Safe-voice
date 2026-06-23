from __future__ import annotations

import time
from collections import Counter
from typing import Any, Optional
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlmodel import Session, select

from .ml import (
    MODEL_PATH,
    get_model_info,
    is_model_loaded,
    load_model,
    predict_severity,
    verify_model_prediction,
)
from .models import DATABASE_PATH, Report, get_session, init_db

APP_STARTED_AT = time.time()

app = FastAPI(title="Student Welfare API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()


class ReportPayload(BaseModel):
    category: str
    text: str
    reporting_type: Optional[str] = None
    incident_date: Optional[str] = None
    incident_location: Optional[str] = None


class PredictPayload(BaseModel):
    text: str


CATEGORY_ALIASES = {
    "Mental Health": "Mental & Academic Well-being",
    "Academic Stress": "Mental & Academic Well-being",
    "Financial Difficulties": "Economic & Housing Support",
    "Housing Problems": "Economic & Housing Support",
    "Health Concerns": "Health & Personal Care",
    "Harassment": "Safety, Abuse & Harassment",
    "Abuse": "Safety, Abuse & Harassment",
    "Safety Concerns": "Safety, Abuse & Harassment",
    "Discrimination": "Discrimination & Social Inclusion",
    "Other": "Other",
}

VALID_CATEGORIES = {
    "Mental & Academic Well-being",
    "Economic & Housing Support",
    "Health & Personal Care",
    "Safety, Abuse & Harassment",
    "Discrimination & Social Inclusion",
    "Bullying",
    "Other",
}


def _check_database() -> dict[str, Any]:
    try:
        with get_session() as session:
            count = len(session.exec(select(Report)).all())
        return {"status": "connected", "report_count": count, "path": str(DATABASE_PATH)}
    except Exception as exc:
        return {"status": "error", "error": str(exc)}


def _check_model() -> dict[str, Any]:
    try:
        if not MODEL_PATH.exists():
            return {
                "status": "missing",
                "error": f"Model file not found at {MODEL_PATH}",
            }
        load_model()
        smoke = verify_model_prediction()
        return {
            "status": "ready",
            "loaded": is_model_loaded(),
            "smoke_test": smoke,
        }
    except Exception as exc:
        return {"status": "error", "error": str(exc)}


def _report_statistics(session: Session) -> dict[str, Any]:
    reports = session.exec(select(Report)).all()
    by_severity = Counter(r.severity for r in reports)
    by_category = Counter(r.category for r in reports)
    by_reporting_type = Counter(
        r.reporting_type or "Unknown" for r in reports
    )
    return {
        "total": len(reports),
        "by_severity": dict(by_severity),
        "by_category": dict(by_category),
        "by_reporting_type": dict(by_reporting_type),
    }


@app.get("/")
def home() -> dict[str, str]:
    return {"message": "Student Welfare API Running"}


@app.get("/health")
def health() -> dict[str, Any]:
    db = _check_database()
    model = _check_model()
    healthy = db["status"] == "connected" and model["status"] == "ready"
    return {
        "status": "ok" if healthy else "degraded",
        "uptime_seconds": round(time.time() - APP_STARTED_AT, 1),
        "database": db,
        "model": model,
    }


@app.get("/api/v1/system/status")
def system_status() -> dict[str, Any]:
    """Full system status: API health, database, ML model, and report statistics."""
    db = _check_database()
    model_health = _check_model()
    model_info = get_model_info()

    with get_session() as session:
        report_stats = _report_statistics(session)

    endpoints = [
        {"method": "GET", "path": "/", "description": "API root"},
        {"method": "GET", "path": "/health", "description": "Health check"},
        {"method": "GET", "path": "/api/v1/system/status", "description": "System status"},
        {"method": "GET", "path": "/api/v1/reports", "description": "List reports"},
        {"method": "POST", "path": "/api/v1/reports", "description": "Create report"},
        {"method": "DELETE", "path": "/api/v1/reports/{report_id}", "description": "Delete report"},
        {"method": "DELETE", "path": "/api/v1/reports", "description": "Clear all reports"},
        {"method": "POST", "path": "/api/v1/ml/predict", "description": "ML urgency prediction"},
    ]

    api_healthy = db["status"] == "connected" and model_health["status"] == "ready"

    return {
        "api": {
            "status": "healthy" if api_healthy else "degraded",
            "version": app.version,
            "title": app.title,
            "uptime_seconds": round(time.time() - APP_STARTED_AT, 1),
            "started_at": APP_STARTED_AT,
        },
        "database": db,
        "model": {
            **model_info,
            "health": model_health,
            "label_map": {
                "critical": "Critical",
                "high": "High",
                "medium": "Medium",
                "low": "Low",
                "neutral": "Low",
                "spam": "Low",
            },
            "predictions_served": report_stats["total"],
        },
        "reports": report_stats,
        "endpoints": endpoints,
    }


@app.get("/api/v1/metrics")
def metrics() -> dict[str, Any]:
    """Model and report metrics for the admin dashboard."""
    with get_session() as session:
        report_stats = _report_statistics(session)

    model_info = get_model_info()
    model_health = _check_model()

    severity_order = ["Critical", "High", "Medium", "Low"]
    by_severity = report_stats["by_severity"]
    severity_distribution = [
        {"severity": s, "count": by_severity.get(s, 0)}
        for s in severity_order
    ]

    return {
        "reports": report_stats,
        "severity_distribution": severity_distribution,
        "model": {
            **model_info,
            "health": model_health,
            "predictions_served": report_stats["total"],
        },
        "database": _check_database(),
        "api_uptime_seconds": round(time.time() - APP_STARTED_AT, 1),
    }


@app.get("/api/v1/reports")
def list_reports() -> dict:
    with get_session() as session:
        reports = session.exec(
            select(Report).order_by(Report.created_at.desc())
        ).all()

    return {
        "count": len(reports),
        "data": [
            {
                "report_id": report.report_id,
                "category": report.category,
                "text": report.text,
                "severity": report.severity,
                "reporting_type": report.reporting_type,
                "incident_date": report.incident_date,
                "incident_location": report.incident_location,
                "created_at": report.created_at.isoformat(),
            }
            for report in reports
        ],
    }


@app.get("/api/v1/reports/{report_id}")
def get_report(report_id: str) -> dict:
    with get_session() as session:
        report = session.exec(
            select(Report).where(Report.report_id == report_id)
        ).first()
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")

    return {
        "report_id": report.report_id,
        "category": report.category,
        "text": report.text,
        "severity": report.severity,
        "reporting_type": report.reporting_type,
        "incident_date": report.incident_date,
        "incident_location": report.incident_location,
        "created_at": report.created_at.isoformat(),
    }


@app.post("/api/v1/ml/predict")
def predict_endpoint(payload: PredictPayload) -> dict[str, str]:
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    severity = predict_severity(text)
    return {
        "severity": severity,
        "urgency": severity,
    }


@app.post("/api/v1/reports")
def create_report(payload: ReportPayload) -> dict:
    text = payload.text.strip()
    raw_category = payload.category.strip()
    category = CATEGORY_ALIASES.get(raw_category, raw_category)

    if not text:
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    if category not in VALID_CATEGORIES:
        raise HTTPException(status_code=400, detail="Invalid category")

    try:
        severity = predict_severity(text)
        report = Report(
            report_id=str(uuid4()),
            text=text,
            category=category,
            severity=severity,
            reporting_type=payload.reporting_type,
            incident_date=payload.incident_date,
            incident_location=payload.incident_location,
        )

        with get_session() as session:
            session.add(report)
            session.commit()
            session.refresh(report)

        return {
            "status": "success",
            "report_id": report.report_id,
            "category": report.category,
            "severity": report.severity,
            "urgency": report.severity,
            "created_at": report.created_at.isoformat(),
        }
    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=503,
            detail=f"ML model unavailable: {exc}",
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Submission failed: {exc}",
        )


@app.delete("/api/v1/reports/{report_id}")
def delete_report(report_id: str) -> dict[str, str]:
    with get_session() as session:
        report = session.exec(
            select(Report).where(Report.report_id == report_id)
        ).first()
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        session.delete(report)
        session.commit()

    return {"message": "Report deleted", "report_id": report_id}


@app.delete("/api/v1/reports")
def clear_reports() -> dict[str, str]:
    with get_session() as session:
        reports = session.exec(select(Report)).all()
        for report in reports:
            session.delete(report)
        session.commit()

    return {"message": "All reports deleted"}
