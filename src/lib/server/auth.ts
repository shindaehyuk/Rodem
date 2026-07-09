import crypto from "node:crypto";

/**
 * 데모 수준의 관리자 인증입니다. 운영 환경에서는 환경 변수로
 * ADMIN_ID / ADMIN_PASSWORD / AUTH_SECRET 을 반드시 설정하세요.
 */
const ADMIN_ID = process.env.ADMIN_ID ?? "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "rodem1234";
const AUTH_SECRET = process.env.AUTH_SECRET ?? "rodem-dev-secret-change-me";
const SESSION_HOURS = 12;

export const SESSION_COOKIE = "rodem_admin_session";

function sign(payload: string): string {
  return crypto.createHmac("sha256", AUTH_SECRET).update(payload).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function verifyCredentials(id: unknown, password: unknown): boolean {
  if (typeof id !== "string" || typeof password !== "string") return false;
  return safeEqual(id.trim(), ADMIN_ID) && safeEqual(password, ADMIN_PASSWORD);
}

export function createSessionToken(): { token: string; expiresAt: number } {
  const expiresAt = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  const payload = String(expiresAt);
  return { token: `${payload}.${sign(payload)}`, expiresAt };
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const dotIndex = token.indexOf(".");
  if (dotIndex <= 0) return false;
  const payload = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);
  if (!safeEqual(signature, sign(payload))) return false;
  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && Date.now() < expiresAt;
}
