/**
 * Logging Middleware — Frontend Integration
 *
 * This is the FIRST function written in this project (per pre-test requirements).
 * Proxies log entries through /api/log to avoid browser CORS issues.
 *
 * stack:   "frontend"
 * level:   "debug" | "info" | "warn" | "error" | "fatal"
 * package: "api" | "page" | "state" | "style" | "auth" | "config" | "middleware" | "utils"
 * message: descriptive string
 */

let _token = null;

/**
 * Initialize the logger with a bearer token.
 * Call once after obtaining token from /api/auth-token
 */
export function initLogger(token) {
  _token = token;
}

/**
 * Core Log function — FIRST function in this codebase.
 * Sends log to Affordmed evaluation server via our proxy /api/log.
 *
 * @param {string} stack   "frontend"
 * @param {string} level   "debug"|"info"|"warn"|"error"|"fatal"
 * @param {string} pkg     "api"|"page"|"state"|"style"|"auth"|"config"|"middleware"|"utils"
 * @param {string} message descriptive log message
 */
export async function Log(stack, level, pkg, message) {
  if (!_token) return; // Skip if logger not initialized yet

  try {
    await fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stack,
        level,
        package: pkg,
        message,
        token: _token,
      }),
    });
  } catch (err) {
    // Never let logging crash the app
    console.error("[Logger] Error:", err.message);
  }
}
