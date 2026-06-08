from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    hashed_password: str

class Report(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    report_id: str = Field(index=True, unique=True)
    created_at: datetime
    category: Optional[str]
    text: str
    reporting_type: Optional[str]
    full_name: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    preferred_contact: Optional[str]
    incident_date: Optional[str]
    incident_location: Optional[str]
    urgency: Optional[str]
    status: Optional[str]
    notes: Optional[str]
    audit_log: Optional[str]
    assigned_to: Optional[str]
