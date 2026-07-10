"use client";

import * as React from "react";

/** 프로덕션에서만 서비스 워커를 등록한다 (개발 중 캐시 혼선 방지). */
export function ServiceWorkerRegister() {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.error("service worker 등록 실패:", err);
    });
  }, []);
  return null;
}
