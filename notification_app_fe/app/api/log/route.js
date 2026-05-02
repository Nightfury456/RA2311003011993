import { NextResponse } from "next/server";

const LOG_API_URL = "http://20.207.122.201/evaluation-service/logs";

/**
 * POST /api/log
 * Proxies log entries from the frontend to the evaluation-service logs endpoint.
 * This avoids CORS issues since the browser can't call the evaluation server directly.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { stack, level, package: pkg, message, token } = body;

    if (!token) {
      return NextResponse.json({ error: "No auth token" }, { status: 401 });
    }

    const res = await fetch(LOG_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        stack,
        level,
        package: pkg,
        message,
      }),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
