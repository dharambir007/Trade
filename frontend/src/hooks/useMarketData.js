import { useState, useEffect, useRef, useCallback } from "react";
import { fetchQuote } from "../services/marketApi";
import { isMarketOpen, formatIST } from "../utils/marketTime";

const POLL_OPEN_MS   = 30_000;   // 30 s when market is open
const POLL_CLOSED_MS = 300_000;  // 5 min when market is closed

/**
 * Polls a stock quote and returns live state.
 * @param {string|null} symbol  Yahoo Finance symbol (e.g. "RELIANCE.NS")
 */
export function useMarketData(symbol) {
  const [quote,       setQuote]       = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLive,      setIsLive]      = useState(false);

  const timerRef    = useRef(null);
  const mountedRef  = useRef(true);

  const doFetch = useCallback(async () => {
    if (!symbol) return;
    setLoading(true);
    setIsLive(false);

    const data = await fetchQuote(symbol);

    if (!mountedRef.current) return;

    if (data) {
      setQuote(data);
      setError(null);
      setLastUpdated(formatIST());
      // Flash LIVE indicator for 4 s after fresh data arrives
      setIsLive(true);
      setTimeout(() => { if (mountedRef.current) setIsLive(false); }, 4000);
    } else {
      setError("Market data unavailable");
    }

    setLoading(false);
  }, [symbol]);

  // Initial fetch + polling
  useEffect(() => {
    mountedRef.current = true;

    if (!symbol) {
      setQuote(null);
      setError(null);
      return;
    }

    doFetch();

    function scheduleNext() {
      const delay = isMarketOpen() ? POLL_OPEN_MS : POLL_CLOSED_MS;
      timerRef.current = setTimeout(() => {
        doFetch();
        scheduleNext();
      }, delay);
    }
    scheduleNext();

    return () => {
      mountedRef.current = false;
      clearTimeout(timerRef.current);
    };
  }, [symbol, doFetch]);

  return { quote, loading, error, lastUpdated, isLive };
}
