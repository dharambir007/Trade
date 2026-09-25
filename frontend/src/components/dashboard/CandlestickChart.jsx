import { useState, useEffect, useRef, useCallback } from "react";
import { fetchChart, fetchPrediction } from "../../services/marketApi";
import { tsToIST } from "../../utils/marketTime";

const TIMEFRAMES = ["1m", "3m", "5m", "10m", "15m", "30m", "1h", "1D"];

// SVG layout constants
const SVG_W = 900;
const SVG_H = 380;
const ML = 10;   // margin left
const MR = 72;   // margin right  (price axis)
const MT = 16;   // margin top
const MB = 38;   // margin bottom (time axis)
const CW = SVG_W - ML - MR;  // chart width
const CH = SVG_H - MT - MB;  // chart height

const BULL_COLOR = "#64e572";
const BEAR_COLOR = "#f05252";
const GRID_COLOR = "#1c2330";
const AXIS_COLOR = "#4a5568";
const TEXT_COLOR = "#667280";

function scaleY(price, minP, maxP) {
  return MT + CH - ((price - minP) / (maxP - minP)) * CH;
}

function buildPriceLabels(minP, maxP, steps = 5) {
  const labels = [];
  const step = (maxP - minP) / steps;
  for (let i = 0; i <= steps; i++) {
    const p = minP + i * step;
    labels.push(p);
  }
  return labels;
}

function fmtPrice(p) {
  if (p >= 10000) return `${(p / 1000).toFixed(1)}K`;
  return p.toFixed(p >= 1000 ? 0 : 1);
}

function pickTimeLabels(candles, interval, maxLabels = 7) {
  if (!candles.length) return [];
  const step = Math.max(1, Math.floor(candles.length / maxLabels));
  const indices = [];
  for (let i = 0; i < candles.length; i += step) {
    indices.push(i);
  }
  // Always include last
  if (indices[indices.length - 1] !== candles.length - 1) {
    indices.push(candles.length - 1);
  }
  return indices;
}

function Tooltip({ x, y, candle, interval, visible }) {
  if (!visible || !candle) return null;
  const lines = [
    tsToIST(candle.time, interval),
    `O ₹${candle.open.toLocaleString("en-IN")}`,
    `H ₹${candle.high.toLocaleString("en-IN")}`,
    `L ₹${candle.low.toLocaleString("en-IN")}`,
    `C ₹${candle.close.toLocaleString("en-IN")}`,
  ];
  const boxW = 130;
  const boxH = lines.length * 17 + 12;
  const bx = x + 12 > SVG_W - boxW - MR ? x - boxW - 6 : x + 12;
  const by = Math.max(MT, Math.min(y - 20, SVG_H - MB - boxH));

  return (
    <g>
      <rect x={bx} y={by} width={boxW} height={boxH} rx="6"
        fill="#111827" stroke="#2d3748" strokeWidth="1" opacity="0.97" />
      {lines.map((l, i) => (
        <text key={i} x={bx + 8} y={by + 16 + i * 17}
          fill={i === 0 ? "#9ca3af" : "#e5e7eb"}
          fontSize="10.5" fontFamily="Inter, sans-serif">
          {l}
        </text>
      ))}
    </g>
  );
}

export default function CandlestickChart({ symbol }) {
  const [interval,  setIntervalState] = useState("1D");
  const [candles,   setCandles]       = useState([]);
  const [loading,   setLoading]       = useState(false);
  const [error,     setError]         = useState(null);
  const [zoomLevel, setZoomLevel]     = useState(0);
  const [panOffset, setPanOffset]     = useState(0);
  const [prediction, setPrediction]   = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tooltip,   setTooltip]       = useState({ visible: false, x: 0, y: 0, candle: null });
  const dragRef = useRef({ active: false, startX: 0, startOffset: 0 });
  const panelRef  = useRef(null);
  const svgRef    = useRef(null);
  const mountedRef = useRef(true);

  const loadChart = useCallback(async (sym, iv) => {
    if (!sym) return;
    setLoading(true);
    setError(null);
    const data = await fetchChart(sym, iv);
    if (!mountedRef.current) return;
    if (data?.candles?.length) {
      setCandles(data.candles);
    } else {
      setCandles([]);
      setError("Chart data unavailable");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    if (symbol) loadChart(symbol, interval);
    return () => { mountedRef.current = false; };
  }, [symbol, interval, loadChart]);

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === panelRef.current);
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  async function toggleFullscreen() {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await panelRef.current?.requestFullscreen();
  }

  const visibleCount = zoomLevel === 0
    ? candles.length
    : Math.max(20, Math.ceil(candles.length / (zoomLevel * 2)));
  const maxPanOffset = Math.max(0, candles.length - visibleCount);
  const safePanOffset = Math.min(panOffset, maxPanOffset);
  const visibleStart = Math.max(0, candles.length - visibleCount - safePanOffset);
  const visibleCandles = candles.slice(visibleStart, visibleStart + visibleCount);
  const activePrediction = prediction?.symbol === symbol && prediction?.interval === interval
    ? prediction
    : null;
  const chartCandles = [...visibleCandles, ...(activePrediction?.candles || [])];

  async function handlePredict() {
    setPredictionLoading(true);
    setPredictionError(null);
    const result = await fetchPrediction(symbol, interval);
    if (result) {
      setPrediction(result);
    } else {
      setPredictionError("Prediction unavailable. Add GEMINI_API_KEY to backend/.env.");
    }
    setPredictionLoading(false);
  }

  function handleChartWheel(event) {
    if (zoomLevel === 0 || !candles.length) return;
    event.preventDefault();
    const movement = Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ? event.deltaX
      : event.deltaY;
    const step = Math.max(1, Math.round(Math.abs(movement) / 20));
    const direction = movement > 0 ? 1 : -1;
    setPanOffset((offset) => Math.max(0, Math.min(maxPanOffset, offset + direction * step)));
  }

  function handlePointerDown(event) {
    if (zoomLevel === 0 || maxPanOffset === 0) return;
    dragRef.current = { active: true, startX: event.clientX, startOffset: panOffset };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event) {
    if (!dragRef.current.active) return;
    const candleWidth = event.currentTarget.clientWidth / visibleCount;
    const movement = Math.round((dragRef.current.startX - event.clientX) / Math.max(1, candleWidth));
    setPanOffset(Math.max(0, Math.min(maxPanOffset, dragRef.current.startOffset + movement)));
  }

  function handlePointerUp(event) {
    dragRef.current.active = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  // ── Render helpers ────────────────────────────────────────────────────────

  function handleMouseMove(e) {
    if (!chartCandles.length || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX  = ((e.clientX - rect.left) / rect.width) * SVG_W;
    const svgY  = ((e.clientY - rect.top) / rect.height) * SVG_H;

    const slotW = CW / chartCandles.length;
    const idx   = Math.floor((svgX - ML) / slotW);
    if (idx >= 0 && idx < chartCandles.length) {
      setTooltip({ visible: true, x: svgX, y: svgY, candle: chartCandles[idx] });
    }
  }

  function handleMouseLeave() {
    setTooltip({ visible: false, x: 0, y: 0, candle: null });
  }

  // ── Draw ──────────────────────────────────────────────────────────────────

  function renderChart() {
    if (!chartCandles.length) return null;

    const lows  = chartCandles.map((c) => c.low);
    const highs = chartCandles.map((c) => c.high);
    let minP = Math.min(...lows);
    let maxP = Math.max(...highs);
    const pad = (maxP - minP) * 0.05 || 1;
    minP -= pad;
    maxP += pad;

    const slotW   = CW / chartCandles.length;
    const bodyW   = Math.max(1, slotW * 0.65);
    const priceLabels  = buildPriceLabels(minP, maxP, 5);
    const timeIndices  = pickTimeLabels(chartCandles, interval);

    return (
      <>
        {/* Horizontal grid lines + price axis */}
        {priceLabels.map((p, i) => {
          const y = scaleY(p, minP, maxP);
          return (
            <g key={i}>
              <line x1={ML} x2={SVG_W - MR} y1={y} y2={y}
                stroke={GRID_COLOR} strokeWidth="0.8" />
              <text x={SVG_W - MR + 6} y={y + 4}
                fill={TEXT_COLOR} fontSize="10" fontFamily="Inter, sans-serif">
                ₹{fmtPrice(p)}
              </text>
            </g>
          );
        })}

        {/* Time axis labels */}
        {timeIndices.map((idx) => {
          const c   = chartCandles[idx];
          const x   = ML + idx * slotW + slotW / 2;
          return (
            <text key={idx} x={x} y={SVG_H - MB + 16}
              textAnchor="middle" fill={TEXT_COLOR}
              fontSize="9.5" fontFamily="Inter, sans-serif">
              {tsToIST(c.time, interval)}
            </text>
          );
        })}

        {/* Candles */}
        {chartCandles.map((c, i) => {
          const bull   = c.close >= c.open;
          const color  = c.ghost ? "#f1c75b" : (bull ? BULL_COLOR : BEAR_COLOR);
          const cx     = ML + i * slotW + slotW / 2;
          const bodyTop    = scaleY(Math.max(c.open, c.close), minP, maxP);
          const bodyBot    = scaleY(Math.min(c.open, c.close), minP, maxP);
          const bodyH      = Math.max(1, bodyBot - bodyTop);
          const wickTop    = scaleY(c.high, minP, maxP);
          const wickBot    = scaleY(c.low, minP, maxP);

          return (
            <g key={i}>
              {/* Wick */}
              <line
                x1={cx} x2={cx} y1={wickTop} y2={wickBot}
                stroke={color} strokeWidth="1"
              />
              {/* Body */}
              <rect
                x={cx - bodyW / 2} y={bodyTop}
                width={bodyW} height={bodyH}
                fill={color} rx="0.5"
                opacity={c.ghost ? "0.32" : "1"}
                stroke={c.ghost ? color : "none"}
                strokeDasharray={c.ghost ? "3 2" : undefined}
              />
            </g>
          );
        })}

        {/* Crosshair + tooltip on hover */}
        {tooltip.visible && (
          <>
            <line x1={tooltip.x} x2={tooltip.x} y1={MT} y2={SVG_H - MB}
              stroke={AXIS_COLOR} strokeWidth="0.8" strokeDasharray="3,3" />
            <Tooltip {...tooltip} interval={interval} />
          </>
        )}
      </>
    );
  }

  // ── UI ────────────────────────────────────────────────────────────────────

  return (
    <div className={`chart-panel ${isFullscreen ? "chart-panel-fullscreen" : ""}`} ref={panelRef}>
      {/* Header row */}
      <div className="chart-header">
        <span className="chart-title">
          {symbol ? `${symbol} — Candlestick` : "Select a stock"}
        </span>
        <div className="chart-controls">
          <div className="tf-btns">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              className={`tf-btn ${interval === tf ? "tf-active" : ""}`}
              onClick={() => {
                setIntervalState(tf);
                setPanOffset(0);
              }}
            >
              {tf}
            </button>
          ))}
          </div>
          <div className="chart-tools" aria-label="Chart tools">
            <button
              className="predict-btn"
              onClick={handlePredict}
              disabled={!symbol || !candles.length || predictionLoading}
            >
              {predictionLoading ? "Predicting..." : "Predict"}
            </button>
            <button
              className="chart-tool-btn"
              onClick={() => {
                setZoomLevel((level) => Math.min(4, level + 1));
                setPanOffset(0);
              }}
              disabled={!candles.length || zoomLevel >= 4}
              title="Zoom in"
              aria-label="Zoom in"
            >
              +
            </button>
            <button
              className="chart-tool-btn"
              onClick={() => {
                setZoomLevel((level) => Math.max(0, level - 1));
                setPanOffset(0);
              }}
              disabled={zoomLevel === 0}
              title="Zoom out"
              aria-label="Zoom out"
            >
              −
            </button>
            <button
              className="chart-tool-btn chart-reset-btn"
              onClick={() => {
                setZoomLevel(0);
                setPanOffset(0);
              }}
              disabled={zoomLevel === 0}
              title="Reset zoom"
              aria-label="Reset zoom"
            >
              1:1
            </button>
            <button
              className="chart-tool-btn"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? "×" : "⛶"}
            </button>
          </div>
        </div>
      </div>

      {activePrediction && (
        <div className={`prediction-summary prediction-${activePrediction.direction}`}>
          <strong>{activePrediction.direction}</strong>
          <span>{activePrediction.confidence}% confidence</span>
          <span>Target ₹{activePrediction.target_price}</span>
          <span>{activePrediction.rationale}</span>
        </div>
      )}
      {predictionError && <div className="prediction-error">{predictionError}</div>}

      {/* Chart body */}
      <div
        className="chart-body"
        onWheel={handleChartWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {loading && (
          <div className="chart-overlay">
            <span className="chart-spinner" />
            Loading chart…
          </div>
        )}
        {!loading && error && (
          <div className="chart-overlay chart-error">
            <span>⚠</span> {error}
          </div>
        )}
        {!loading && !error && !symbol && (
          <div className="chart-overlay chart-empty">
            Select a stock to view the chart
          </div>
        )}

        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          preserveAspectRatio="none"
          className="chart-svg-el"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ opacity: loading ? 0.3 : 1 }}
        >
          {/* Chart background */}
          <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="transparent" />
          {/* X-axis baseline */}
          <line x1={ML} x2={SVG_W - MR} y1={SVG_H - MB} y2={SVG_H - MB}
            stroke={GRID_COLOR} strokeWidth="1" />
          {/* Y-axis line */}
          <line x1={SVG_W - MR} x2={SVG_W - MR} y1={MT} y2={SVG_H - MB}
            stroke={GRID_COLOR} strokeWidth="1" />

          {renderChart()}
        </svg>
      </div>
    </div>
  );
}
