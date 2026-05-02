/**
 * Logging Middleware
 * This is the FIRST function written in this project.
 *
 * Makes an API call to the test server each time it is called.
 * Signature: Log(stack, level, package, message)
 *
 * stack:   "frontend" | "backend"
 * level:   "debug" | "info" | "warn" | "error" | "fatal"
 * package: frontend → "api" | "page" | "state" | "style" | "auth" | "config" | "middleware" | "utils"
 * message: descriptive log message
 */

const LOG_API_URL = "http://20.207.122.201/evaluation-service/logs";

let authToken = null;

/**
 * Sets the bearer token for authenticated log API calls.
 * Call this once after obtaining a token from /evaluation-service/auth
 */
function setAuthToken(token) {
  authToken = token;
}

/**
 * Core logging function — FIRST function written in this codebase.
 * Sends a log entry to the Affordmed evaluation server.
 *
 * @param {string} stack   - "frontend" or "backend"
 * @param {string} level   - "debug" | "info" | "warn" | "error" | "fatal"
 * @param {string} pkg     - package name (e.g. "api", "page", "middleware")
 * @param {string} message - descriptive message about what happened
 */
async function Log(stack, level, pkg, message) {
  if (!authToken) {
    console.warn("[Logger] No auth token set. Call setAuthToken(token) first.");
    return;
  }

  const body = {
    stack: stack,
    level: level,
    package: pkg,
    message: message,
  };

  try {
    const response = await fetch(LOG_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[Logger] Failed to send log:", data);
    }
  } catch (err) {
    console.error("[Logger] Network error while logging:", err.message);
  }
}

module.exports = { Log, setAuthToken };
