from fastapi import APIRouter, HTTPException, Query

from services.yahoo_finance import get_quote, get_chart

router = APIRouter(prefix="/stocks", tags=["Market Data"])

# The two benchmark indices always shown at the top of the dashboard
INDICES = ["^NSEI", "^NSEBANK"]

VALID_INTERVALS = {"1m", "3m", "5m", "10m", "15m", "30m", "1h", "1D"}


@router.get("/indices")
def get_indices():
    """
    Returns live quotes for NIFTY 50 and BANK NIFTY.
    No auth required – market data is public.
    """
    results = {}
    for sym in INDICES:
        data = get_quote(sym)
        if data:
            results[sym] = data

    if not results:
        raise HTTPException(status_code=503, detail="Market data unavailable")

    return results


@router.get("/quote")
def quote_endpoint(symbol: str = Query(..., description="e.g. RELIANCE.NS or ^NSEI")):
    """
    Returns live quote for any Yahoo Finance symbol.
    """
    data = get_quote(symbol.upper())
    if data is None:
        raise HTTPException(
            status_code=503,
            detail=f"Market data unavailable for {symbol}",
        )
    return data


@router.get("/chart")
def chart_endpoint(
    symbol: str = Query(..., description="e.g. RELIANCE.NS"),
    interval: str = Query("1D", description="1m | 3m | 5m | 10m | 15m | 30m | 1h | 1D"),
):
    """
    Returns OHLCV candles for a symbol and timeframe.
    """
    if interval not in VALID_INTERVALS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid interval '{interval}'. Valid: {sorted(VALID_INTERVALS)}",
        )

    candles = get_chart(symbol.upper(), interval)
    if candles is None:
        raise HTTPException(
            status_code=503,
            detail=f"Chart data unavailable for {symbol} / {interval}",
        )

    return {"symbol": symbol, "interval": interval, "candles": candles}
