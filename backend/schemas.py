from pydantic import BaseModel
from typing import Optional

class PredictRequest(BaseModel):
    text: str

class PredictResponse(BaseModel):
    label: str
    urgency: str

class ReportCreate(BaseModel):
    report_id: Optional[str] = None
    category: Optional[str] = None
    text: str
    reporting_type: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    preferred_contact: Optional[str] = None
    incident_date: Optional[str] = None
    incident_location: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ReportCreateResponse(BaseModel):
    report_id: str
    urgency: str


class ReportListItem(BaseModel):
    report_id: str
    created_at: str
    category: Optional[str] = None
    text: str
    urgency: Optional[str] = None
    status: Optional[str] = None
