from __future__ import annotations

import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from sqlmodel import Field, Session, SQLModel, create_engine

BASE_DIR = Path(__file__).resolve().parents[1]
DATABASE_PATH = BASE_DIR / "reports.db"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DATABASE_PATH}")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)


class Report(SQLModel, table=True):
    __tablename__ = "student_welfare_reports"

    id: Optional[int] = Field(default=None, primary_key=True)
    report_id: str = Field(index=True, unique=True)
    text: str
    category: str
    severity: str
    reporting_type: Optional[str] = None
    incident_date: Optional[str] = None
    incident_location: Optional[str] = None
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )


def init_db() -> None:
    SQLModel.metadata.create_all(engine)


def get_session():
    return Session(engine)
