/* 로뎀 카페 쿠폰 서비스 워커
 *
 * 캐시 전략
 * - 정적 자산(/_next/static, 아이콘, 스플래시): 캐시 우선 (해시된 불변 파일)
 * - 페이지 이동(navigate): 네트워크 우선, 실패 시 캐시 → 앱 셸("/") 폴백
 * - GET /api/state: 네트워크 우선, 오프라인이면 마지막 응답 폴백
 * - 그 외 API(인증/쓰기): 캐시하지 않음 (항상 네트워크)
 */
const VERSION = "v1";
const SHELL_CACHE = `rodem-shell-${VERSION}`;
const DATA_CACHE = `rodem-data-${VERSION}`;

const PRECACHE_URLS = [
  "/",
  "/history",
  "/admin",
  "/logo-mark.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE && key !== DATA_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/splash/") ||
    url.pathname === "/logo-mark.svg" ||
    url.pathname === "/icon.png" ||
    url.pathname === "/apple-icon.png" ||
    url.pathname === "/manifest.webmanifest"
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // 쿠폰 데이터: 네트워크 우선, 오프라인이면 마지막 데이터
  if (url.pathname === "/api/state") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(DATA_CACHE).then((cache) => cache.put(request, copy));
          }
          return res;
        })
        .catch(() =>
          caches.match(request).then(
            (cached) =>
              cached ??
              new Response(JSON.stringify({ error: "offline" }), {
                status: 503,
                headers: { "Content-Type": "application/json" },
              })
          )
        )
    );
    return;
  }

  // 나머지 API는 항상 네트워크 (인증/세션은 캐시 금지)
  if (url.pathname.startsWith("/api/")) return;

  // 페이지 이동: 네트워크 우선 → 캐시 → 앱 셸 폴백
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy));
          }
          return res;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached ?? caches.match("/"))
        )
    );
    return;
  }

  // 정적 자산: 캐시 우선
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches
                .open(SHELL_CACHE)
                .then((cache) => cache.put(request, copy));
            }
            return res;
          })
      )
    );
  }
});
