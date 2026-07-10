import { NextRequest, NextResponse } from "next/server";

import {
  SESSION_COOKIE,
  createSessionToken,
  verifyCredentials,
} from "@/lib/server/auth";

// IP별 로그인 시도 제한 (인스턴스 메모리 기준 — 서버리스에서는 완화용 방어선)
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 10 * 60 * 1000;
const attempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "시도 횟수를 초과했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => ({}));
  if (!verifyCredentials(body.id, body.password)) {
    return NextResponse.json(
      { ok: false, error: "아이디 또는 비밀번호가 올바르지 않습니다." },
      { status: 401 }
    );
  }
  attempts.delete(ip);
  const { token, expiresAt } = createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
  return res;
}
