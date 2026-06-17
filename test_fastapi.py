import sys
import os

# Add backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

payload = {
    "category": "Bullying",
    "text": "This is a twenty character string.",
    "reporting_type": "Anonymous",
    "incident_date": "2026-06-13",
    "incident_location": "hostel"
}

response = client.post("/api/v1/reports", json=payload)
print(f"Status Code: {response.status_code}")
print(f"Response Body: {response.json()}")
