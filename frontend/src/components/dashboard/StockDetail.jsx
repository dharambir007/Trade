function fmt(n, decimals = 2) {
  if (n == null) return "—";
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

function fmtVol(v) {
  if (v == null) return "—";
  if (v >= 10_000_000) return `${(v / 10_000_000).toFixed(2)} Cr`;
  if (v >= 100_000)    return `${(v / 100_000).toFixed(2)} L`;
  if (v >= 1_000)      return `${(v / 1_000).toFixed(1)} K`;
  return v.toLocaleString("en-IN");
}

function fmtChange(n) {
  if (n == null) return "—";
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function StockDetail({ quote, loading, error }) {
  // Loading skeleton
  if (loading && !quote) {
    return (
      <div className="detail-panel">
        <div className="detail-skeleton-header" />
        <div className="detail-skeleton-price" />
        <div className="detail-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="detail-skeleton-row" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error && !quote) {
    return (
      <div className="detail-panel detail-error">
        <span>⚠</span>
        <p>Market data unavailable</p>
        <small>Please check your connection and try again.</small>
      </div>
    );
  }

  // Empty state
  if (!quote) {
    return (
      <div className="detail-panel detail-empty">
        <span>🔍</span>
        <p>Select a stock to view details</p>
      </div>
    );
  }

  const positive = quote.change == null || quote.change >= 0;
  const changeColor = positive ? "clr-green" : "clr-red";

  return (
    <div className="detail-panel">
      {/* Header */}
      <div className="detail-header">
        <div>
          <div className="detail-symbol">{quote.symbol}</div>
          <div className="detail-name">{quote.name}</div>
        </div>
        {loading && <span className="detail-refreshing">↻</span>}
      </div>

      {/* Price */}
      <div className="detail-price-row">
        <span className="detail-price">{fmt(quote.price)}</span>
        <span className={`detail-change ${changeColor}`}>
          {fmtChange(quote.change)}{" "}
          ({quote.change_pct != null ? `${fmtChange(quote.change_pct)}%` : "—"})
        </span>
      </div>

      {/* Stats grid */}
      <div className="detail-grid">
        <div className="detail-item">
          <span className="detail-label">Open</span>
          <span className="detail-value">{fmt(quote.open)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">High</span>
          <span className="detail-value clr-green">{fmt(quote.high)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Low</span>
          <span className="detail-value clr-red">{fmt(quote.low)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Prev Close</span>
          <span className="detail-value">{fmt(quote.prev_close)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Volume</span>
          <span className="detail-value">{fmtVol(quote.volume)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Change %</span>
          <span className={`detail-value ${changeColor}`}>
            {quote.change_pct != null ? `${fmtChange(quote.change_pct)}%` : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
