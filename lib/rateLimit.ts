/**
 * In-memory rate limiter for API routes.
 * State resets on process restart — acceptable for single-region launch.
 * Key: user ID. Tracks request timestamps within a sliding window.
 */

const WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS = 10

const store = new Map<string, number[]>()

export function checkRateLimit(userId: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const timestamps = store.get(userId) ?? []

  // Keep only timestamps within the current window
  const recent = timestamps.filter(t => now - t < WINDOW_MS)

  if (recent.length >= MAX_REQUESTS) {
    const oldest = recent[0]
    const retryAfter = Math.ceil((WINDOW_MS - (now - oldest)) / 1000)
    store.set(userId, recent)
    return { allowed: false, retryAfter }
  }

  recent.push(now)
  store.set(userId, recent)
  return { allowed: true }
}
