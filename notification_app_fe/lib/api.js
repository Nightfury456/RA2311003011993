/**
 * API client — fetches notifications from evaluation service via Next.js proxy routes
 * Integrates logging middleware on every call.
 */

import { Log } from "./logger.js";

/**
 * Fetch notifications from our internal API proxy.
 * @param {object} params - { notification_type, page, limit }
 */
export async function fetchNotifications({ notification_type = "", page = 1, limit = 20 } = {}) {
  Log("frontend", "info", "api", `Fetching notifications: type=${notification_type || "all"} page=${page} limit=${limit}`);

  const params = new URLSearchParams({ page, limit });
  if (notification_type && notification_type !== "All") {
    params.set("notification_type", notification_type);
  }

  try {
    const res = await fetch(`/api/notifications?${params.toString()}`);

    if (!res.ok) {
      Log("frontend", "error", "api", `Notifications fetch failed: HTTP ${res.status}`);
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    const notifications = data.notifications || data || [];

    Log("frontend", "info", "api", `Fetched ${notifications.length} notifications successfully`);
    return notifications;
  } catch (err) {
    Log("frontend", "error", "api", `Failed to fetch notifications: ${err.message}`);
    throw err;
  }
}

/**
 * Read/unread state — stored in localStorage by notification ID
 */
export function getViewedIds() {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem("campus_viewed_ids");
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function markViewed(id) {
  if (typeof window === "undefined") return;
  const ids = getViewedIds();
  ids.add(id);
  localStorage.setItem("campus_viewed_ids", JSON.stringify([...ids]));
}
