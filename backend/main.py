from fastapi import FastAPI, Depends, HTTPException, status, APIRouter
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from typing import List
from datetime import datetime
import json

from .db import init_db, engine, get_session
from .models import User, Report
from .schemas import PredictRequest, PredictResponse, ReportCreate, Token, ReportCreateResponse, ReportListItem
from .auth import verify_password, get_password_hash, create_access_token
from .ml import predict
from sqlmodel import Session, select

app = FastAPI(title="SafeVoice Backend")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

ml_router = APIRouter(prefix="/api/v1/ml", tags=["ml"])
reports_router = APIRouter(prefix="/api/v1/reports", tags=["reports"])
auth_router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@app.on_event("startup")
def on_startup():
    init_db()
    # create default admin user if missing
    with Session(engine) as session:
        user = session.exec(select(User).where(User.username == "admin")).first()
        if not user:
            u = User(username="admin", hashed_password=get_password_hash("password"))
            session.add(u)
            session.commit()


@ml_router.post("/predict", response_model=PredictResponse)
def api_predict(req: PredictRequest):
    label = predict(req.text)
    urgency = label or "Low"
    return {"label": label or "unknown", "urgency": urgency}


@reports_router.post("", response_model=ReportCreateResponse)
def create_report(rc: ReportCreate):
    label = predict(rc.text) or "unknown"
    report_id = rc.report_id or f"SWR-{int(datetime.utcnow().timestamp())}"
    r = Report(
        report_id=report_id,
        created_at=datetime.utcnow(),
        category=rc.category,
        text=rc.text,
        reporting_type=rc.reporting_type,
        full_name=rc.full_name,
        phone=rc.phone,
        email=rc.email,
        preferred_contact=rc.preferred_contact,
        incident_date=rc.incident_date,
        incident_location=rc.incident_location,
        urgency=label,
        status="New",
        notes=json.dumps([]),
        audit_log=json.dumps([{"id": "init", "at": datetime.utcnow().isoformat(), "action": "Report submitted", "by": "Student"}]),
    )
    with Session(engine) as session:
        session.add(r)
        session.commit()
        session.refresh(r)
    return {"report_id": r.report_id, "urgency": r.urgency or "unknown"}


@auth_router.post("/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    with Session(engine) as session:
        user = session.exec(select(User).where(User.username == form_data.username)).first()
        if not user or not verify_password(form_data.password, user.hashed_password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")
        access_token = create_access_token({"sub": user.username})
        return {"access_token": access_token, "token_type": "bearer"}


def get_current_user(token: str = Depends(oauth2_scheme)):
    # simple token verification
    from jose import jwt, JWTError
    from .auth import SECRET_KEY, ALGORITHM
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    with Session(engine) as session:
        user = session.exec(select(User).where(User.username == username)).first()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token user")
        return user


@reports_router.get("", response_model=List[ReportListItem])
def list_reports(user: User = Depends(get_current_user)):
    with Session(engine) as session:
        rows = session.exec(select(Report).order_by(Report.created_at.desc())).all()
        out = []
        for r in rows:
            out.append({
                "report_id": r.report_id,
                "created_at": r.created_at.isoformat(),
                "category": r.category,
                "text": r.text,
                "urgency": r.urgency,
                "status": r.status,
            })
    return out


@app.get("/health", tags=["system"])
def health():
    return {"status": "ok"}


# Backward-compatible aliases for existing frontend callers.
@app.post("/predict", response_model=PredictResponse, tags=["compat"])
def api_predict_compat(req: PredictRequest):
    return api_predict(req)


@app.post("/reports", response_model=ReportCreateResponse, tags=["compat"])
def create_report_compat(rc: ReportCreate):
    return create_report(rc)


@app.get("/reports", response_model=List[ReportListItem], tags=["compat"])
def list_reports_compat(user: User = Depends(get_current_user)):
    return list_reports(user)


@app.post("/auth/token", response_model=Token, tags=["compat"])
def login_compat(form_data: OAuth2PasswordRequestForm = Depends()):
    return login(form_data)


app.include_router(ml_router)
app.include_router(reports_router)
app.include_router(auth_router)
