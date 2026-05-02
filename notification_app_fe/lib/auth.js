/**
 * Auth utility
 * Handles registration and token acquisition from the Affordmed evaluation server.
 * Integrates the Logging Middleware from logging_middleware/index.js
 */

import { Log } from "../../logging_middleware/index.js";

const BASE_URL = "http://20.207.122.201/evaluation-service";

let cachedToken = null;

/**
 * Obtains a Bearer token from the evaluation service.
 * Token is cached in memory to avoid repeated auth calls.
 */
export async function getAuthToken() {
  if (cachedToken) return cachedToken;

  await Log("frontend", "info", "auth", "Requesting auth token from evaluation service");

  const res = await fetch(`${BASE_URL}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "aditya.2311003011993@srmist.edu.in",
      name: "Aditya",
      rollNo: "RA2311003011993",
      accessCode: "QkbpxH",
      clientID: process.env.NEXT_PUBLIC_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
    }),
  });

  if (!res.ok) {
    await Log("frontend", "error", "auth", `Auth failed with status ${res.status}`);
    throw new Error("Authentication failed");
  }

  const data = await res.json();
  cachedToken = data.access_token;

  await Log("frontend", "info", "auth", "Auth token obtained successfully");

  return cachedToken;
}
