import json
from datetime import datetime, timezone

from services.gemini import generate_json

INTERVAL_SECONDS = {
	"1m": 60, "3m": 180, "5m": 300, "10m": 600,
	"15m": 900, "30m": 1800, "1h": 3600, "1D": 86400,
}


def predict_candles(symbol: str, interval: str, candles: list[dict]) -> dict | None:
	if not candles:
		return None

	recent = candles[-30:]
	prompt = (
		"You are a cautious market-analysis assistant. Analyze these recent OHLC candles "
		"for an Indian NSE instrument and forecast the next six candles at the requested "
		"timeframe. Do not claim certainty or give a buy/sell order. Return only JSON with "
		"direction (bullish, bearish, or neutral), confidence (0-100), target_price, "
		"forecast_prices (an array of six different or repeated close prices), and rationale "
		"(under 160 characters).\n"
		f"Symbol: {symbol}\nTimeframe: {interval}\nCandles: {json.dumps(recent)}"
	)
	result = generate_json(prompt)
	last = candles[-1]
	fallback_target = last["close"]
	forecast_prices = None
	if result:
		try:
			target = float(result.get("target_price", fallback_target))
			direction = result.get("direction", "neutral")
			confidence = max(0, min(100, int(result.get("confidence", 50))))
			rationale = str(result.get("rationale", "Model forecast based on recent price action."))
			candidate_prices = result.get("forecast_prices")
			if isinstance(candidate_prices, list) and len(candidate_prices) == 6:
				forecast_prices = [float(price) for price in candidate_prices]
		except (TypeError, ValueError):
			result = None

	if not result:
		recent_changes = [
			item["close"] - item["open"] for item in recent[-8:]
		]
		momentum = sum(recent_changes) / max(1, len(recent_changes))
		ranges = [item["high"] - item["low"] for item in recent[-14:]]
		average_range = sum(ranges) / max(1, len(ranges))
		direction = "bullish" if momentum > 0 else "bearish" if momentum < 0 else "neutral"
		momentum_strength = abs(momentum) / max(average_range, 0.01)
		matching_moves = sum(
			1 for change in recent_changes
			if (change >= 0) == (momentum >= 0)
		)
		trend_consistency = matching_moves / max(1, len(recent_changes))
		confidence = round(min(78, max(28, 30 + momentum_strength * 35 + trend_consistency * 18)))
		forecast_prices = []
		weights = [0.55, 1.35, 0.8, 1.6, 0.7, 1.2]
		for weight in weights:
			previous = forecast_prices[-1] if forecast_prices else fallback_target
			forecast_prices.append(previous + momentum * weight)
		target = forecast_prices[-1]
		rationale = "Confidence estimated from recent momentum, volatility, and trend consistency."
	else:
		average_range = sum(item["high"] - item["low"] for item in recent[-14:]) / max(1, len(recent[-14:]))
		if not forecast_prices:
			start_price = last["close"]
			forecast_prices = [
				start_price + (target - start_price) * ratio
				for ratio in (0.08, 0.27, 0.51, 0.68, 0.88, 1.0)
			]
		target = forecast_prices[-1]

	step = INTERVAL_SECONDS[interval] * 1000
	ghosts = []
	previous_close = last["close"]
	for index, close in enumerate(forecast_prices, start=1):
		close = float(close)
		wick = max(average_range * (0.35 + (index % 3) * 0.12), close * 0.001)
		high = max(previous_close, close) + wick
		low = min(previous_close, close) - wick * (0.8 + (index % 2) * 0.15)
		ghosts.append({
			"time": last["time"] + step * index,
			"open": round(previous_close, 2),
			"high": round(high, 2),
			"low": round(low, 2),
			"close": round(close, 2),
			"volume": 0,
			"ghost": True,
		})
		previous_close = close

	return {
		"symbol": symbol,
		"interval": interval,
		"direction": direction,
		"confidence": confidence,
		"target_price": round(target, 2),
		"rationale": rationale,
		"generated_at": datetime.now(timezone.utc).isoformat(),
		"candles": ghosts,
	}
