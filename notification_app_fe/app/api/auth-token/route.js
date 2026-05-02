import { NextResponse } from "next/server";

const BASE = "http://20.207.122.201/evaluation-service";
const CLIENT_ID = "0d343270-57e0-4d03-895d-a902868b710c";
const CLIENT_SECRET = "CPytpAexyHsHSKzB";

// NOTE: The registration was done with "aditya.2311003011993@srmist.edu.in"
// and cannot be changed (API returns 409 Conflict on re-register).
// Actual student email: ak7217@srmist.edu.in
// Roll No: RA2311003011993

let cachedToken = null;
let tokenExpiry = 0;

export async function GET() {
  if (cachedToken && Date.now() < tokenExpiry) {
    return NextResponse.json({ token: cachedToken });
  }

  try {
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
      return NextResponse.json({ token: null, error: "Auth failed" }, { status: 401 });
    }

    const data = await res.json();
    cachedToken = data.access_token;
    tokenExpiry = Date.now() + 14 * 60 * 1000;

    return NextResponse.json({ token: cachedToken });
  } catch (err) {
    return NextResponse.json({ token: null, error: err.message }, { status: 500 });
  }
}
