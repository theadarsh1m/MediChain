/**
 * In-memory sliding-window rate limiter for AI endpoints per authenticated patient ID.
 * Limits excessive AI API calls while maintaining a safe, patient-friendly experience.
 */
const rateLimitStore = new Map();

// Configuration: 5 requests per 10 minutes window
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 5;

// Periodic cleanup of expired rate limit entries every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now - record.startTime > WINDOW_MS && record.timestamps.length === 0) {
      rateLimitStore.delete(key);
    }
  }
}, 15 * 60 * 1000);

function aiRateLimiter(req, res, next) {
  const userId = req.user?.id ? req.user.id.toString() : req.ip;
  const now = Date.now();

  let record = rateLimitStore.get(userId);

  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(userId, record);
  }

  // Filter out timestamps outside the sliding window
  record.timestamps = record.timestamps.filter((time) => now - time < WINDOW_MS);

  if (record.timestamps.length >= MAX_REQUESTS) {
    const oldestTimestamp = record.timestamps[0];
    const retryAfterSeconds = Math.ceil((WINDOW_MS - (now - oldestTimestamp)) / 1000);

    res.setHeader("Retry-After", retryAfterSeconds);
    return res.status(429).json({
      success: false,
      message: `You have reached the maximum number of AI health summaries for now (${MAX_REQUESTS} requests per 10 minutes). Please try again in about ${Math.ceil(retryAfterSeconds / 60)} minute(s).`,
      retryAfterSeconds,
    });
  }

  record.timestamps.push(now);
  next();
}

module.exports = aiRateLimiter;
