import { NextRequest, NextResponse } from "next/server";

import {
  SESSION_COOKIE,
  createSessionToken,
  verifyCredentials,
} from "@/lib/server/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (!verifyCredentials(body.id, body.password)) {
    return NextResponse.json(
      { ok: false, error: "아이디 또는 비밀번호가 올바르지 않습니다." },
      { status: 401 }
    );
  }
  const { token, expiresAt } = createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
  return res;
}
