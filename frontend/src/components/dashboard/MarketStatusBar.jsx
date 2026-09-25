import { useState, useEffect } from "react";
import { isMarketOpen, formatIST } from "../../utils/marketTime";

export default function MarketStatusBar({ isLive, lastUpdated }) {
  const [open,    setOpen]    = useState(isMarketOpen());
  const [istTime, setIstTime] = useState(formatIST());

  // Tick every second to keep the clock and status fresh
  useEffect(() => {
    const id = setInterval(() => {
      setOpen(isMarketOpen());
      setIstTime(formatIST());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mkt-status-bar">
      {/* Left: market status */}
      <div className="mkt-status-left">
        <span className={`mkt-badge ${open ? "mkt-open" : "mkt-closed"}`}>
          <span className="mkt-dot" />
          {open ? "MARKET OPEN" : "MARKET CLOSED"}
        </span>

        <span className="mkt-time">{istTime}</span>

        {!open && (
          <span className="mkt-closed-note">NSE · Next session 09:15 IST</span>
        )}
      </div>

      {/* Right: live data indicator */}
      <div className="mkt-status-right">
        {isLive && (
          <span className="live-badge">
            <span className="live-pulse" />
            LIVE
          </span>
        )}
        {lastUpdated && (
          <span className="mkt-updated">Updated {lastUpdated}</span>
        )}
      </div>
    </div>
  );
}
