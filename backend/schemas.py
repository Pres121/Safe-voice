from pydantic import BaseModel
from typing import Optional

class PredictRequest(BaseModel):
    text: str

class PredictResponse(BaseModel):
    label: str
    urgency: str

class ReportCreate(BaseModel):
    report_id: Optional[str]
    category: Optional[str]
    text: str
    reporting_type: Optional[str]
    full_name: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    preferred_contact: Optional[str]
    incident_date: Optional[str]
    incident_location: Optional[str]

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ReportCreateResponse(BaseModel):
    report_id: str
    urgency: str


class ReportListItem(BaseModel):
    report_id: str
    created_at: str
    category: Optional[str]
    text: str
    urgency: Optional[str]
    status: Optional[str]
