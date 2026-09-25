import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchIndices } from "../services/marketApi";
import { useMarketData } from "../hooks/useMarketData";

import MarketStatusBar   from "../components/dashboard/MarketStatusBar";
import IndexCard         from "../components/dashboard/IndexCard";
import StockSearch       from "../components/dashboard/StockSearch";
import StockDetail       from "../components/dashboard/StockDetail";
import CandlestickChart  from "../components/dashboard/CandlestickChart";

const DEFAULT_SYMBOL = "^NSEI";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Active symbol for detail + chart
  const [symbol, setSymbol] = useState(DEFAULT_SYMBOL);

  // Indices (NIFTY 50 + BANK NIFTY) polled separately
  const [indices, setIndices]       = useState({});
  const [indicesErr, setIndicesErr] = useState(false);
  const indicesTimer = useRef(null);

  // Live market data for selected symbol
  const { quote, loading, error, lastUpdated, isLive } = useMarketData(symbol);

  // Logout handler
  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  // Poll indices every 30 s
  useEffect(() => {
    let mounted = true;

    async function loadIndices() {
      const data = await fetchIndices();
      if (!mounted) return;
      if (data) {
        setIndices(data);
        setIndicesErr(false);
      } else {
        setIndicesErr(true);
      }
    }

    loadIndices();
    indicesTimer.current = setInterval(loadIndices, 30_000);

    return () => {
      mounted = false;
      clearInterval(indicesTimer.current);
    };
  }, []);

  return (
    <div className="db-page">
      {/* ── Top bar ─────────────────────────────────────────── */}
      <header className="db-topbar">
        <Link to="/" className="logo">
          <span className="logo-icon">↗</span>
          TradePredict <span>AI</span>
        </Link>

        <div className="db-topbar-right">
          {user && (
            <span className="db-user-info">
              <span className="db-user-name">{user.name}</span>
              <span className="db-user-email">{user.email}</span>
            </span>
          )}
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      {/* ── Market Status Bar ───────────────────────────────── */}
      <MarketStatusBar isLive={isLive} lastUpdated={lastUpdated} />

      {/* ── Main content ────────────────────────────────────── */}
      <main className="db-main">

        {/* Indices row */}
        <section className="db-indices-row">
          <IndexCard
            data={indices["^NSEI"]}
            active={symbol === "^NSEI"}
            onClick={() => setSymbol("^NSEI")}
          />
          <IndexCard
            data={indices["^NSEBANK"]}
            active={symbol === "^NSEBANK"}
            onClick={() => setSymbol("^NSEBANK")}
          />
          {indicesErr && !indices["^NSEI"] && (
            <div className="indices-error">
              ⚠ Index data unavailable
            </div>
          )}
        </section>

        {/* Search */}
        <StockSearch onSelect={setSymbol} activeSymbol={symbol} />

        {/* Detail + Chart grid */}
        <div className="db-content-grid">
          {/* Left: stock detail */}
          <StockDetail quote={quote} loading={loading} error={error} />

          {/* Right: candlestick chart */}
          <CandlestickChart symbol={symbol} />
        </div>

      </main>
    </div>
  );
}