from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlmodel import Session, select
import os

from .auth import SECRET_KEY, ALGORITHM
from .models import User

# API version prefix
API_V1 = "/api/v1"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=API_V1 + "/auth/token")

def get_current_user(token: str = Depends(oauth2_scheme)):
    """Validate JWT and return the authenticated user.
    This function is placed in a separate module to avoid circular imports.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    with Session() as session:  # will use default engine from .db
        user = session.exec(select(User).where(User.username == username)).first()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token user")
        return user
