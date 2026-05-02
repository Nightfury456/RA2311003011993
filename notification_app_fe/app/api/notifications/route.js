import { NextResponse } from "next/server";

const BASE = "http://20.207.122.201/evaluation-service";
const CLIENT_ID = "0d343270-57e0-4d03-895d-a902868b710c";
const CLIENT_SECRET = "CPytpAexyHsHSKzB";

let cachedToken = null;

async function getToken() {
  if (cachedToken) return cachedToken;

  const res = await fetch(`${BASE}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "aditya.2311003011993@srmist.edu.in",
      name: "Aditya",
      rollNo: "RA2311003011993",
      accessCode: "QkbpxH",
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Auth failed");
  }

  const data = await res.json();
  cachedToken = data.access_token;
  return cachedToken;
}

/**
 * Fetches notifications from the evaluation service.
 * The API has a max limit of 10 per request, so we paginate
 * to get the full set needed for the priority inbox.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const notification_type = searchParams.get("notification_type") || "";
  const requestedPage = searchParams.get("page") || "1";
  const requestedLimit = parseInt(searchParams.get("limit") || "10", 10);

  try {
    const token = await getToken();

    // The API max is 10 per page — fetch multiple pages if needed
    const perPage = 10;
    const totalPages = Math.ceil(Math.min(requestedLimit, 50) / perPage);
    let allNotifications = [];

    for (let pg = 1; pg <= totalPages; pg++) {
      const params = new URLSearchParams({
        page: String(pg),
        limit: String(perPage),
      });
      if (notification_type && notification_type !== "All") {
        params.set("notification_type", notification_type);
      }

      const res = await fetch(`${BASE}/notifications?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      if (res.status === 401) {
        // Token expired — refresh and retry this page
        cachedToken = null;
        const newToken = await getToken();
        const retry = await fetch(`${BASE}/notifications?${params.toString()}`, {
          headers: { Authorization: `Bearer ${newToken}` },
          cache: "no-store",
        });
        if (retry.ok) {
          const retryData = await retry.json();
          const items = retryData.notifications || [];
          allNotifications = allNotifications.concat(items);
          if (items.length < perPage) break; // no more data
        }
        continue;
      }

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        // If we already have some data, return what we have
        if (allNotifications.length > 0) break;
        return NextResponse.json({ error: errBody.message || errBody.errors?.[0] || `HTTP ${res.status}` }, { status: res.status });
      }

      const data = await res.json();
      const items = data.notifications || [];
      allNotifications = allNotifications.concat(items);

      // If we got fewer than perPage, there are no more pages
      if (items.length < perPage) break;
    }

    return NextResponse.json({ notifications: allNotifications }, { status: 200 });
  } catch (err) {
    cachedToken = null;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
