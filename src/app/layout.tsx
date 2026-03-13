import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/Header";
import InstallBanner from "@/components/InstallBanner";
import KakaoChat from "@/components/KakaoChat";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "핫플여기체험단 - 체험단 매칭",
  description: "네이버 블로그, 인스타그램, 숏폼 체험단 매칭 플랫폼",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "핫플여기체험단",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#ef4444",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <Providers>
          <Header />
          <main>{children}</main>
          <InstallBanner />
          <KakaoChat />
        </Providers>
        <Script
          id="external-browser-redirect"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var ua = navigator.userAgent || '';
                var url = location.href;
                var isAndroid = /android/i.test(ua);
                var isIOS = /iphone|ipad|ipod/i.test(ua);

                // 카카오톡 인앱 브라우저
                if (ua.match(/KAKAOTALK/i)) {
                  if (isAndroid) {
                    location.href = 'intent://' + url.replace(/https?:\\/\\//, '') + '#Intent;scheme=https;package=com.android.chrome;end';
                  } else if (isIOS) {
                    location.href = 'kakaotalk://web/openExternal?url=' + encodeURIComponent(url);
                  }
                }
                // 인스타그램 인앱 브라우저
                else if (ua.match(/Instagram/i)) {
                  if (isAndroid) {
                    location.href = 'intent://' + url.replace(/https?:\\/\\//, '') + '#Intent;scheme=https;package=com.android.chrome;end';
                  } else if (isIOS) {
                    // iOS 인스타 → "앱을 나갑니다" 다이얼로그 후 사파리로 열기
                    var a = document.createElement('a');
                    a.href = 'x-safari-' + url;
                    a.style.display = 'none';
                    document.body.appendChild(a);
                    a.click();
                  }
                }
              })();
            `,
          }}
        />
        <Script
          id="sw-register"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js');
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
