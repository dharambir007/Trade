import logging
import json
from urllib.parse import quote as url_quote
from urllib.request import Request, urlopen

logger = logging.getLogger("uvicorn.error")

# Hardcoded display names for supported symbols
SYMBOL_NAMES = {
    "^NSEI": "Nifty 50",
    "^NSEBANK": "Bank Nifty",
    "RELIANCE.NS": "Reliance Industries",
    "TCS.NS": "Tata Consultancy Services",
    "INFY.NS": "Infosys",
    "HDFCBANK.NS": "HDFC Bank",
    "ICICIBANK.NS": "ICICI Bank",
    "SBIN.NS": "State Bank of India",
    "ITC.NS": "ITC Limited",
}

SYMBOL_ALIASES = {
    "POONAWALA": "POONAWALLA.NS",
}

# Map frontend timeframe labels → (yfinance interval, yfinance period)
INTERVAL_MAP = {
    "1m":  ("1m",  "1d"),
    "3m":  ("2m",  "1d"),
    "5m":  ("5m",  "1d"),
    "10m": ("15m", "5d"),
    "15m": ("15m", "5d"),
    "30m": ("30m", "5d"),
    "1h":  ("60m", "1mo"),
    "1D":  ("1d",  "6mo"),
}


def get_quote(symbol: str) -> dict | None:
    """
    Fetch live quote for a symbol using yfinance fast_info.
    Returns None on any error – never raises.
    """
    try:
        symbol = normalize_symbol(symbol)
        payload = _fetch_chart_payload(symbol, "1d", "5d")
        result = payload["chart"]["result"][0]
        meta = result["meta"]

        price = meta.get("regularMarketPrice")
        if price is None:
            return None

        prev_close = meta.get("previousClose")
        open_price = meta.get("regularMarketDayOpen")
        day_high = meta.get("regularMarketDayHigh")
        day_low = meta.get("regularMarketDayLow")
        volume = meta.get("regularMarketVolume")

        change = (price - prev_close) if prev_close else None
        change_pct = ((change / prev_close) * 100) if prev_close else None

        name = SYMBOL_NAMES.get(symbol.upper(), symbol)

        return {
            "symbol": symbol,
            "name": name,
            "price": round(float(price), 2),
            "change": round(float(change), 2) if change is not None else None,
            "change_pct": round(float(change_pct), 2) if change_pct is not None else None,
            "open": round(float(open_price), 2) if open_price else None,
            "high": round(float(day_high), 2) if day_high else None,
            "low": round(float(day_low), 2) if day_low else None,
            "prev_close": round(float(prev_close), 2) if prev_close else None,
            "volume": int(volume) if volume else None,
        }

    except Exception as exc:
        logger.error("get_quote(%s) failed: %s", symbol, exc)
        return None


def get_chart(symbol: str, interval: str) -> list | None:
    """
    Fetch OHLCV candles for a symbol and timeframe.
    Returns a list of candle dicts, or None on error.
    """
    try:
        symbol = normalize_symbol(symbol)
        yf_interval, period = INTERVAL_MAP.get(interval, ("1d", "6mo"))
        payload = _fetch_chart_payload(symbol, yf_interval, period)
        result = payload["chart"]["result"][0]
        timestamps = result.get("timestamp", [])
        quote_data = result["indicators"]["quote"][0]

        if not timestamps:
            return None

        candles = []
        for index, timestamp in enumerate(timestamps):
            ts_ms = int(timestamp * 1000)
            values = {
                key: quote_data.get(key, [None] * len(timestamps))[index]
                for key in ("open", "high", "low", "close", "volume")
            }
            if any(values[key] is None for key in ("open", "high", "low", "close")):
                continue

            open_v = float(values["open"])
            high_v = float(values["high"])
            low_v = float(values["low"])
            close_v = float(values["close"])
            vol_v = int(values["volume"] or 0)

            # Skip rows with invalid data
            if any(v == 0 for v in [open_v, high_v, low_v, close_v]):
                continue

            candles.append({
                "time":   ts_ms,
                "open":   round(open_v, 2),
                "high":   round(high_v, 2),
                "low":    round(low_v, 2),
                "close":  round(close_v, 2),
                "volume": vol_v,
            })

        return candles if candles else None

    except Exception as exc:
        logger.error("get_chart(%s, %s) failed: %s", symbol, interval, exc)
        return None


def _fetch_chart_payload(symbol: str, interval: str, period: str) -> dict:
    """Fetch Yahoo chart JSON directly; yfinance parsing is unreliable for these symbols."""
    url = (
        "https://query1.finance.yahoo.com/v8/finance/chart/"
        f"{url_quote(symbol, safe='')}?range={period}&interval={interval}"
    )
    request = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(request, timeout=10) as response:
        payload = json.load(response)

    result = payload.get("chart", {}).get("result")
    if not result:
        raise ValueError(payload.get("chart", {}).get("error", "Yahoo returned no data"))
    return payload


def normalize_symbol(symbol: str) -> str:
    """Use Yahoo's NSE suffix for bare Indian stock symbols."""
    normalized = symbol.strip().upper()
    if normalized in SYMBOL_ALIASES:
        return SYMBOL_ALIASES[normalized]
    if normalized and not normalized.startswith("^") and "." not in normalized:
        return f"{normalized}.NS"
    return normalized
