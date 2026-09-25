import json
import logging
from urllib.parse import quote as url_quote
from urllib.request import Request, urlopen

from config import GEMINI_API_KEY, GEMINI_MODEL

logger = logging.getLogger("uvicorn.error")

NSE_STOCK_CATALOG = [
	{"symbol": "RELIANCE.NS", "label": "RELIANCE", "name": "Reliance Industries"},
	{"symbol": "TCS.NS", "label": "TCS", "name": "Tata Consultancy Services"},
	{"symbol": "INFY.NS", "label": "INFY", "name": "Infosys"},
	{"symbol": "HDFCBANK.NS", "label": "HDFCBANK", "name": "HDFC Bank"},
	{"symbol": "ICICIBANK.NS", "label": "ICICIBANK", "name": "ICICI Bank"},
	{"symbol": "SBIN.NS", "label": "SBIN", "name": "State Bank of India"},
	{"symbol": "ITC.NS", "label": "ITC", "name": "ITC Limited"},
	{"symbol": "POONAWALLA.NS", "label": "POONAWALLA", "name": "Poonawalla Fincorp"},
	{"symbol": "BHARTIARTL.NS", "label": "BHARTIARTL", "name": "Bharti Airtel"},
	{"symbol": "HINDUNILVR.NS", "label": "HINDUNILVR", "name": "Hindustan Unilever"},
]


def generate_json(prompt: str) -> dict | None:
	if not GEMINI_API_KEY:
		return None

	url = (
		"https://generativelanguage.googleapis.com/v1beta/models/"
		f"{url_quote(GEMINI_MODEL, safe='')}:generateContent?key={url_quote(GEMINI_API_KEY)}"
	)
	body = json.dumps({
		"contents": [{"parts": [{"text": prompt}]}],
		"generationConfig": {"temperature": 0.2, "responseMimeType": "application/json"},
	}).encode("utf-8")
	request = Request(
		url,
		data=body,
		headers={"Content-Type": "application/json", "User-Agent": "TradePredict-AI"},
		method="POST",
	)
	try:
		with urlopen(request, timeout=20) as response:
			payload = json.load(response)
		text = payload["candidates"][0]["content"]["parts"][0]["text"]
		return json.loads(text)
	except Exception as exc:
		logger.error("Gemini request failed: %s", exc)
		return None


def suggest_symbols(query: str) -> list[dict]:
	prompt = (
		"Suggest up to 5 actively traded Indian NSE stocks matching this search query. "
		"Return only JSON in this shape: {\"suggestions\":[{\"symbol\":\"TCS.NS\","
		"\"label\":\"TCS\",\"name\":\"Tata Consultancy Services\"}]}. "
		f"Query: {query}"
	)
	result = generate_json(prompt)
	suggestions = result.get("suggestions", []) if result else []
	valid_suggestions = [
		item for item in suggestions
		if item.get("symbol") and item.get("name")
	]
	if valid_suggestions:
		return valid_suggestions[:5]

	query_upper = query.upper()
	return [
		item for item in NSE_STOCK_CATALOG
		if query_upper in item["label"] or query_upper in item["symbol"] or query_upper in item["name"].upper()
	][:5]
