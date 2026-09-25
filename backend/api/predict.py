from fastapi import APIRouter, HTTPException, Query

from services.gemini import suggest_symbols
from services.prediction import predict_candles
from services.yahoo_finance import get_chart, normalize_symbol

router = APIRouter(prefix="/predict", tags=["AI Prediction"])
VALID_INTERVALS = {"1m", "3m", "5m", "10m", "15m", "30m", "1h", "1D"}


@router.post("")
def prediction_endpoint(symbol: str = Query(...), interval: str = Query("1D")):
	if interval not in VALID_INTERVALS:
		raise HTTPException(status_code=400, detail="Invalid interval")
	normalized = normalize_symbol(symbol)
	candles = get_chart(normalized, interval)
	prediction = predict_candles(normalized, interval, candles or [])
	if prediction is None:
		raise HTTPException(status_code=503, detail="Prediction data unavailable")
	return prediction


@router.get("/suggestions")
def suggestions_endpoint(q: str = Query(..., min_length=1, max_length=40)):
	return {"suggestions": suggest_symbols(q.strip())}
