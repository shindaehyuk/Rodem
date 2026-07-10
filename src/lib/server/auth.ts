import crypto from "node:crypto";

/**
 * 데모 수준의 관리자 인증입니다. 운영 환경에서는 환경 변수로
 * ADMIN_ID / ADMIN_PASSWORD / AUTH_SECRET 을 반드시 설정하세요.
 */
const DEFAULT_PASSWORD = "rodem1234";
const DEFAULT_SECRET = "rodem-dev-secret-change-me";

const ADMIN_ID = process.env.ADMIN_ID ?? "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? DEFAULT_PASSWORD;
const AUTH_SECRET = process.env.AUTH_SECRET ?? DEFAULT_SECRET;
const SESSION_HOURS = 12;

// 운영 환경에서 기본 비밀번호/서명 키를 그대로 쓰면 인증을 전부 거부한다.
const insecureProdConfig =
  process.env.NODE_ENV === "production" &&
  (ADMIN_PASSWORD === DEFAULT_PASSWORD || AUTH_SECRET === DEFAULT_SECRET);
if (insecureProdConfig) {
  console.error(
    "ADMIN_PASSWORD / AUTH_SECRET 이 기본값입니다. 운영 환경 변수를 설정하기 전까지 관리자 로그인이 차단됩니다."
  );
}

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
  if (insecureProdConfig) return false;
  if (typeof id !== "string" || typeof password !== "string") return false;
  return safeEqual(id.trim(), ADMIN_ID) && safeEqual(password, ADMIN_PASSWORD);
}

export function createSessionToken(): { token: string; expiresAt: number } {
  const expiresAt = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  const payload = String(expiresAt);
  return { token: `${payload}.${sign(payload)}`, expiresAt };
}

export function verifySessionToken(token: string | undefined): boolean {
  if (insecureProdConfig) return false;
  if (!token) return false;
  const dotIndex = token.indexOf(".");
  if (dotIndex <= 0) return false;
  const payload = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);
  if (!safeEqual(signature, sign(payload))) return false;
  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && Date.now() < expiresAt;
}
