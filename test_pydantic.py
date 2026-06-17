from pydantic import BaseModel
from typing import Optional
import json

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

payload = '{"category": "Mental Health", "text": "This is a twenty character string.", "reporting_type": "Anonymous", "incident_date": "2026-06-13", "incident_location": "hostel"}'

try:
    print(ReportCreate.model_validate_json(payload))
    print("Success")
except Exception as e:
    print(e)
