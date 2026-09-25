const API_BASE = `${(import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "")}/stocks`;

async function safeFetch(url, options) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchIndices() {
  return safeFetch(`${API_BASE}/indices`);
}

export async function fetchQuote(symbol) {
  if (!symbol) return null;
  return safeFetch(`${API_BASE}/quote?symbol=${encodeURIComponent(symbol)}`);
}

export async function fetchChart(symbol, interval = "1D") {
  if (!symbol) return null;
  return safeFetch(
    `${API_BASE}/chart?symbol=${encodeURIComponent(symbol)}&interval=${interval}`
  );
}

export async function fetchPrediction(symbol, interval = "1D") {
  if (!symbol) return null;
  const apiBase = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");
  return safeFetch(`${apiBase}/predict?symbol=${encodeURIComponent(symbol)}&interval=${interval}`, {
    method: "POST",
  });
}

export async function fetchSuggestions(query) {
  if (!query) return [];
  const apiBase = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");
  const data = await safeFetch(`${apiBase}/predict/suggestions?q=${encodeURIComponent(query)}`);
  return data?.suggestions || [];
}
