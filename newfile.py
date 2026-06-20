from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import sqlite3
from datetime import datetime
import joblib
import uuid
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Student Welfare API", version="3.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Load model
model = joblib.load("Backend/Model/student_welfare_model3.pkl"
)

# Database connection
conn = sqlite3.connect("Backend/Database/reports.db", check_same_thread=False)
cursor = conn.cursor()

# Reports table
cursor.execute("""
CREATE TABLE IF NOT EXISTS reports (
    reportid TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    category TEXT NOT NULL,
    severity TEXT NOT NULL,
    date TEXT,
    time TEXT
)
""")

# Alerts table
cursor.execute("""
CREATE TABLE IF NOT EXISTS alerts (
    alertid TEXT PRIMARY KEY,
    reportid TEXT,
    level TEXT,
    text TEXT,
    time TEXT
)
""")

conn.commit()

# Allowed categories
VALID_CATEGORIES = {
    "Mental & Academic Well-being",
    "Economic & Housing Support",
    "Health & Personal Care",
    "Safety, Abuse & Harassment",
    "Discrimination & Social Inclusion"
}

# Alert levels
HIGH_RISK = {"high", "critical"}

# Request schema
class TextInput(BaseModel):
    text: str
    category: str

# Alert function
def trigger_alert(reportid, severity, text):
    if severity.lower() in HIGH_RISK:
        alertid = str(uuid.uuid4())

        cursor.execute("""
        INSERT INTO alerts (
            alertid,
            reportid,
            level,
            text,
            time
        )
        VALUES (?, ?, ?, ?, ?)
        """, (
            alertid,
            reportid,
            severity,
            text,
            datetime.now().isoformat()
        ))

        conn.commit()

# Home
@app.get("/")
def home():
    return {
        "message": "Student Welfare API Running"
    }

# Health check
@app.get("/health")
def health():
    return {
        "status": "ok"
    }

# Get all reports
@app.get("/reports")
def get_reports():
    cursor.execute("""
    SELECT reportid, text, category, severity, date, time
    FROM reports
    ORDER BY date DESC, time DESC
    """)

    rows = cursor.fetchall()

    return {
        "count": len(rows),
        "data": rows
    }

# Get alerts
@app.get("/alerts")
def get_alerts():
    cursor.execute("""
    SELECT *
    FROM alerts
    ORDER BY time DESC
    """)

    rows = cursor.fetchall()

    return {
        "count": len(rows),
        "data": rows
    }

# Submit report
@app.post("/predict")
def predict(data: TextInput):

    text = data.text.strip()
    category = data.category.strip()

    if not text:
        raise HTTPException(
            status_code=400,
            detail="Text cannot be empty"
        )

    if category not in VALID_CATEGORIES:
        raise HTTPException(
            status_code=400,
            detail="Invalid category"
        )

    try:
        severity = str(model.predict([text])[0]).lower()

        now = datetime.now()
        date = now.strftime("%Y-%m-%d")
        time = now.strftime("%H:%M:%S")

        reportid = str(uuid.uuid4())

        cursor.execute("""
        INSERT INTO reports (
            reportid,
            text,
            category,
            severity,
            date,
            time
        )
        VALUES (?, ?, ?, ?, ?, ?)
        """, (
            reportid,
            text,
            category,
            severity,
            date,
            time
        ))

        conn.commit()

        trigger_alert(
            reportid=reportid,
            severity=severity,
            text=text
        )

        return {
            "status": "submitted",
            "reportid": reportid,
            "category": category,
            "severity": severity,
            "date": date,
            "time": time,
            "alert": severity in HIGH_RISK
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Submission failed: {str(e)}"
        )

# Delete reports
@app.delete("/reports")
def clear_reports():
    cursor.execute("DELETE FROM reports")
    conn.commit()

    return {
        "message": "All reports deleted"
    }

# Delete alerts
@app.delete("/alerts")
def clear_alerts():
    cursor.execute("DELETE FROM alerts")
    conn.commit()

    return {
        "message": "All alerts deleted"
    }