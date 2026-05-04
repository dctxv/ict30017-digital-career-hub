from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .config import FRONTEND_ORIGIN
from .database import Base, engine, get_db
from .deps import get_current_user
from .models import User
from .schemas import TokenResponse, UserLogin, UserOut, UserRegister
from .security import create_access_token, hash_password, verify_password

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Digital Career Hub Security API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN, "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Digital Career Hub Security API running"}


@app.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="Email is already registered.")

    user = User(
        username=payload.username.strip(),
        email=payload.email.lower(),
        hashed_password=hash_password(payload.password),
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")

    token = create_access_token(subject=user.id, extra_claims={"email": user.email})
    return TokenResponse(access_token=token, user=user)


@app.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@app.get("/protected")
def protected(current_user: User = Depends(get_current_user)):
    return {
        "message": "JWT verification successful. This protected route is working.",
        "user": {"id": current_user.id, "email": current_user.email, "username": current_user.username},
    }
