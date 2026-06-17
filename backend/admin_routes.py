from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select
from .models import User, Report
from .auth import SECRET_KEY, ALGORITHM, get_password_hash
from .db import engine
from jose import JWTError, jwt

# Define API prefix locally to avoid circular imports
API_V1 = "/api/v1"

# OAuth2 scheme (same as in main)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=API_V1 + "/auth/token")

router = APIRouter(prefix=API_V1 + "/admin", tags=["admin"])

def get_current_user(token: str = Depends(oauth2_scheme)):
    """Validate JWT and return user object."""
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

def get_current_admin_user(current_user: User = Depends(get_current_user)):
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")
    return current_user

@router.get("/users", response_model=list[User])
def list_users(admin: User = Depends(get_current_admin_user)):
    with Session(engine) as session:
        users = session.exec(select(User)).all()
    return users

@router.delete("/reports/{report_id}")
def delete_report(report_id: str, admin: User = Depends(get_current_admin_user)):
    with Session(engine) as session:
        report = session.exec(select(Report).where(Report.report_id == report_id)).first()
        if not report:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
        session.delete(report)
        session.commit()
    return {"detail": "Report deleted"}
