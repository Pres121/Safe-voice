from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    hashed_password: str
    role: str = Field(default="user")
class Report(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    report_id: str = Field(index=True, unique=True)
    created_at: datetime
    category: Optional[str] = None
    text: str
    reporting_type: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    preferred_contact: Optional[str] = None
    incident_date: Optional[str] = None
    incident_location: Optional[str] = None
    urgency: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = Field(default='[]')
    audit_log: Optional[str] = Field(default='[]')
    assigned_to: Optional[str] = None
