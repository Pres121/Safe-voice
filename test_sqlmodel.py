import sys
import os
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient
from pydantic import BaseModel, Field
from typing import Optional
from sqlmodel import SQLModel, Field as SQLField
from datetime import datetime
import json

app = FastAPI()

class ReportCreate(BaseModel):
    category: Optional[str] = None
    text: str

class Report(SQLModel, table=True):
    id: Optional[int] = SQLField(default=None, primary_key=True)
    report_id: str = SQLField(index=True, unique=True)
    created_at: datetime
    category: Optional[str]
    text: str
    incident_date: Optional[str]

@app.post("/test")
def test_endpoint(rc: ReportCreate):
    try:
        r = Report(
            report_id="123",
            created_at=datetime.utcnow(),
            category=rc.category,
            text=rc.text,
            incident_date=None
        )
        return {"status": "ok"}
    except Exception as e:
        print("Exception during Report instantiation:", type(e))
        raise

client = TestClient(app)
try:
    response = client.post("/test", json={"category": "", "text": "This is a twenty character string."})
    print("Response:", response.status_code, response.json())
except Exception as e:
    print("Caught exception:", e)
