/**
 * IST market-hours utilities.
 * All logic is purely client-side using the Intl API – no external deps.
 */

const IST_TZ = "Asia/Kolkata";

/** Returns current IST time as a Date object */
export function nowIST() {
  // Create a date that represents "now" in IST
  const now = new Date();
  const istStr = now.toLocaleString("en-US", { timeZone: IST_TZ });
  return new Date(istStr);
}

/**
 * Returns true if the Indian stock market is currently open.
 * Hours: 09:15 – 15:30 IST, Monday–Friday.
 */
export function isMarketOpen() {
  const now = new Date();

  // Get IST date parts
  const istParts = new Intl.DateTimeFormat("en-US", {
    timeZone: IST_TZ,
    hour: "numeric",
    minute: "numeric",
    weekday: "short",
    hour12: false,
  }).formatToParts(now);

  const get = (type) => istParts.find((p) => p.type === type)?.value;

  const weekday = get("weekday"); // "Mon" … "Sun"
  const hour    = parseInt(get("hour"), 10);
  const minute  = parseInt(get("minute"), 10);

  const isWeekday = !["Sat", "Sun"].includes(weekday);

  // Convert to minutes-since-midnight for easy comparison
  const currentMins = hour * 60 + minute;
  const openMins    = 9 * 60 + 15;   // 09:15
  const closeMins   = 15 * 60 + 30;  // 15:30

  return isWeekday && currentMins >= openMins && currentMins < closeMins;
}

/** Formats a JS Date (or "now") as IST time string: "03:45:22 PM IST" */
export function formatIST(date = new Date()) {
  return date.toLocaleTimeString("en-IN", {
    timeZone: IST_TZ,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }) + " IST";
}

/** Formats a Unix-ms timestamp as IST date/time */
export function tsToIST(ts, interval) {
  const d = new Date(ts);
  if (interval === "1D") {
    return d.toLocaleDateString("en-IN", {
      timeZone: IST_TZ,
      month: "short",
      day: "numeric",
    });
  }
  return d.toLocaleTimeString("en-IN", {
    timeZone: IST_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
