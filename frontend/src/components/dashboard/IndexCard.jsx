function fmt(n) {
  if (n == null) return "—";
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function fmtChange(n) {
  if (n == null) return "—";
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export default function IndexCard({ data, onClick, active }) {
  if (!data) {
    return (
      <div className="idx-card idx-loading">
        <div className="idx-skeleton" />
      </div>
    );
  }

  const positive = data.change_pct == null || data.change_pct >= 0;

  return (
    <button
      className={`idx-card ${active ? "idx-card-active" : ""}`}
      onClick={onClick}
    >
      <div className="idx-header">
        <span className="idx-name">{data.name}</span>
        <span className={`idx-badge ${positive ? "idx-pos" : "idx-neg"}`}>
          {positive ? "▲" : "▼"}{" "}
          {data.change_pct != null ? `${Math.abs(data.change_pct).toFixed(2)}%` : "—"}
        </span>
      </div>

      <div className="idx-price">{fmt(data.price)}</div>

      <div className={`idx-change ${positive ? "clr-green" : "clr-red"}`}>
        {fmtChange(data.change)}
        {data.change_pct != null && (
          <span> ({fmtChange(data.change_pct)}%)</span>
        )}
      </div>
    </button>
  );
}
