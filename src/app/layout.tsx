import type { Metadata, Viewport } from "next";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { CouponProvider } from "@/lib/store";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "로뎀 카페 쿠폰",
  description: "11개 부서의 카페 쿠폰을 한눈에 확인하고 관리하세요.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
            <SiteHeader />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
              {children}
            </main>
            <footer className="border-t py-6">
              <p className="text-center text-xs text-muted-foreground">
                로뎀 카페 쿠폰 관리 시스템
              </p>
            </footer>
          </CouponProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
