from __future__ import annotations

from typing import Optional
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlmodel import Session, select

from .ml import predict_severity
from .models import Report, get_session, init_db

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


@app.get("/")
def home() -> dict[str, str]:
    return {"message": "Student Welfare API Running"}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


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
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Submission failed: {exc}",
        )


@app.delete("/api/v1/reports")
def clear_reports() -> dict[str, str]:
    with get_session() as session:
        reports = session.exec(select(Report)).all()
        for report in reports:
            session.delete(report)
        session.commit()

    return {"message": "All reports deleted"}
