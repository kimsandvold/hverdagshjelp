export const STALE_60S = 60_000
export const STALE_5M = 300_000

export function isStale(timestamp, ttlMs) {
  return !timestamp || Date.now() - timestamp > ttlMs
}
