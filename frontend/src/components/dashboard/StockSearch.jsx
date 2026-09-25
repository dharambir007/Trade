import { useEffect, useState } from "react";
import { fetchSuggestions } from "../../services/marketApi";

const QUICK_PICKS = [
  { label: "NIFTY 50",   symbol: "^NSEI" },
  { label: "BANK NIFTY", symbol: "^NSEBANK" },
  { label: "RELIANCE",   symbol: "RELIANCE.NS" },
  { label: "TCS",        symbol: "TCS.NS" },
  { label: "INFY",       symbol: "INFY.NS" },
  { label: "HDFCBANK",   symbol: "HDFCBANK.NS" },
  { label: "ICICIBANK",  symbol: "ICICIBANK.NS" },
  { label: "SBIN",       symbol: "SBIN.NS" },
  { label: "ITC",        symbol: "ITC.NS" },
];

export default function StockSearch({ onSelect, activeSymbol }) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  function handleSubmit(e) {
    e.preventDefault();
    const sym = input.trim().toUpperCase();
    if (sym) {
      onSelect(sym);
      setInput("");
    }
  }

  useEffect(() => {
    const query = input.trim();
    if (!query) {
      setSuggestions([]);
      return undefined;
    }

    const timer = setTimeout(async () => {
      const remoteSuggestions = await fetchSuggestions(query);
      if (remoteSuggestions.length) {
        setSuggestions(remoteSuggestions);
        return;
      }
      const localSuggestions = QUICK_PICKS
        .filter((item) => `${item.label} ${item.symbol}`.includes(query.toUpperCase()))
        .map((item) => ({ symbol: item.symbol, label: item.label, name: item.label }));
      setSuggestions(localSuggestions);
    }, 280);

    return () => clearTimeout(timer);
  }, [input]);

  function selectSuggestion(suggestion) {
    onSelect(suggestion.symbol);
    setInput("");
    setSuggestions([]);
  }

  return (
    <div className="search-panel">
      <form className="search-form" onSubmit={handleSubmit}>
        <input
          className="search-input"
          type="text"
          placeholder="Search symbol (e.g. RELIANCE.NS)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        {suggestions.length > 0 && (
          <div className="search-suggestions">
            {suggestions.map((suggestion) => (
              <button
                type="button"
                className="search-suggestion"
                key={suggestion.symbol}
                onClick={() => selectSuggestion(suggestion)}
              >
                <strong>{suggestion.label || suggestion.symbol}</strong>
                <span>{suggestion.name}</span>
              </button>
            ))}
          </div>
        )}
        <button className="search-btn" type="submit">
          Search
        </button>
      </form>

      <div className="quick-picks">
        {QUICK_PICKS.map((q) => (
          <button
            key={q.symbol}
            className={`quick-chip ${activeSymbol === q.symbol ? "quick-chip-active" : ""}`}
            onClick={() => onSelect(q.symbol)}
          >
            {q.label}
          </button>
        ))}
      </div>
    </div>
  );
}
