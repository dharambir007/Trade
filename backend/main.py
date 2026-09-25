import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.auth import router as auth_router
from api.stocks import router as stocks_router
from api.predict import router as predict_router

app = FastAPI(
    title="TradePredict AI API",
    description="Backend API for TradePredict AI platform",
    version="1.0.0",
)

allowed_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(auth_router, prefix="/api")
app.include_router(stocks_router, prefix="/api")
app.include_router(predict_router, prefix="/api")


@app.get("/")
@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "TradePredict AI Backend API"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
