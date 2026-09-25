import logging
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status, Depends
from pymongo.errors import PyMongoError, DuplicateKeyError

from models.user import UserRegister, UserLogin, UserResponse, Token
from database import get_users_collection
from utils.auth import hash_password, verify_password, create_access_token, get_current_user

logger = logging.getLogger("uvicorn.error")

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_211_CREATED if hasattr(status, 'HTTP_211_CREATED') else status.HTTP_201_CREATED)
def register(user_data: UserRegister):
    email = user_data.email.lower().strip()
    users = get_users_collection()

    try:
        # Check if user already exists
        existing_user = users.find_one({"email": email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Account with this email already exists."
            )
        
        # Hash password and save user
        hashed_pwd = hash_password(user_data.password)
        now_iso = datetime.now(timezone.utc).isoformat()
        
        user_doc = {
            "name": user_data.name.strip(),
            "email": email,
            "password": hashed_pwd,
            "role": "user",
            "created_at": now_iso
        }
        
        result = users.insert_one(user_doc)
        user_id = str(result.inserted_id)

    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account with this email already exists."
        )
    except PyMongoError as e:
        logger.error(f"Database insertion error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database service unavailable. Please ensure MongoDB is running."
        )

    # Generate JWT token
    access_token = create_access_token(data={"sub": user_id, "email": email, "role": "user"})
    
    user_response = UserResponse(
        id=user_id,
        name=user_doc["name"],
        email=user_doc["email"],
        role=user_doc["role"],
        created_at=user_doc["created_at"]
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )

@router.post("/login", response_model=Token)
def login(credentials: UserLogin):
    email = credentials.email.lower().strip()
    users = get_users_collection()

    try:
        user_doc = users.find_one({"email": email})
    except PyMongoError as e:
        logger.error(f"Database query error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database service unavailable. Please ensure MongoDB is running."
        )

    if not user_doc or not verify_password(credentials.password, user_doc.get("password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    user_id = str(user_doc["_id"])
    role = user_doc.get("role", "user")

    # Generate JWT token
    access_token = create_access_token(data={"sub": user_id, "email": email, "role": role})

    user_response = UserResponse(
        id=user_id,
        name=user_doc.get("name", ""),
        email=user_doc.get("email", ""),
        role=role,
        created_at=user_doc.get("created_at")
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        role=current_user["role"],
        created_at=current_user.get("created_at")
    )
