import type { Metadata, Viewport } from "next";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { CouponProvider } from "@/lib/store";
import { SiteHeader } from "@/components/site-header";
import { ServiceWorkerRegister } from "@/components/sw-register";

// iOS 스플래시 이미지 매핑: [CSS width, CSS height, DPR]
const APPLE_SPLASHES: [number, number, number][] = [
  [375, 667, 2], // iPhone SE2/3, 8
  [414, 896, 2], // iPhone XR, 11
  [375, 812, 3], // iPhone X/XS, 11 Pro, 12/13 mini
  [414, 896, 3], // iPhone XS Max, 11 Pro Max
  [390, 844, 3], // iPhone 12/13/14
  [428, 926, 3], // iPhone 12/13 Pro Max, 14 Plus
  [393, 852, 3], // iPhone 14/15/16 Pro
  [430, 932, 3], // iPhone 14/15 Pro Max, 16 Plus
  [768, 1024, 2], // iPad 9.7/Mini
  [820, 1180, 2], // iPad Air
  [834, 1194, 2], // iPad Pro 11
  [1024, 1366, 2], // iPad Pro 12.9
];

export const metadata: Metadata = {
  title: "로뎀 카페 쿠폰",
  description: "12개 부서의 카페 쿠폰을 한눈에 확인하고 관리하세요.",
  manifest: "/manifest.webmanifest",
  // 구형 iOS(<16.4)는 manifest display를 무시하므로 명시적 메타로 보강
  other: { "apple-mobile-web-app-capable": "yes" },
  appleWebApp: {
    capable: true,
    title: "로뎀 쿠폰",
    statusBarStyle: "default",
    startupImage: APPLE_SPLASHES.map(([w, h, dpr]) => ({
      url: `/splash/splash-${w * dpr}x${h * dpr}.png`,
      media: `(device-width: ${w}px) and (device-height: ${h}px) and (-webkit-device-pixel-ratio: ${dpr}) and (orientation: portrait)`,
    })),
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f9fc" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f19" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CouponProvider>
            <ServiceWorkerRegister />
            <SiteHeader />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
              {children}
            </main>
            <footer className="border-t py-6">
              <p className="text-center text-xs text-muted-foreground">
                로뎀 카페 쿠폰 관리 시스템 · made by daeng
              </p>
            </footer>
          </CouponProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
