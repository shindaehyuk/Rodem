import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "로뎀 카페 쿠폰",
    short_name: "로뎀 쿠폰",
    description: "12개 부서의 카페 쿠폰을 한눈에 확인하고 관리하세요.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f3ead9",
    theme_color: "#f6f9fc",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
