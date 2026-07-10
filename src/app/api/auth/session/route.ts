import { NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE, verifySessionToken } from "@/lib/server/auth";

export async function GET(req: NextRequest) {
  const isAdmin = verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
  return NextResponse.json({ isAdmin });
}
