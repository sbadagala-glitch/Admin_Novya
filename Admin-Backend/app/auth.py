from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from .config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# keep the same tokenUrl (your frontend uses /api/auth/login)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def verify_password(plain_password, hashed_password):
    # bcrypt only supports up to 72 bytes safely
    if plain_password:
        plain_password = plain_password[:72]
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


# ===========================================================
#  FIXED TOKEN VERIFICATION (Fully compatible with frontend)
# ===========================================================
def verify_token(token: str = Depends(oauth2_scheme)):
    """
    Correctly extracts and validates JWT token.
    Frontend sends "Authorization: Bearer <token>", FastAPI's oauth2_scheme extracts "<token>".
    This function decodes and validates the JWT and returns the payload dict on success.

    Usage: token_payload = Depends(verify_token)
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Decode JWT
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])

        # REQUIRED — ensure "sub" exists
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception

        # Optionally you can validate other claims here (exp is already checked by jose.decode)
        return payload

    except JWTError:
        raise credentials_exception
