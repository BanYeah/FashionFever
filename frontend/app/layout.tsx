import "@mantine/core/styles.layer.css";
import "./globals.css";
import "./color-style.css";

import React from "react";
import type { Metadata } from "next";
import BMJUA from "next/font/local";
import { MantineProvider } from "@mantine/core";
import { AuthProvider } from "@/components/auth-provider/auth-provider";
import { NotificationProvider } from "@/components/notification/notification";

const font = BMJUA({
  src: "../public/fonts/BMJUA.woff",
  variable: "--font-BMJUA",
});

export const metadata: Metadata = {
  title: "패션 피버",
  description: "포켓미니: 패션을 뽐내는 미니들의 축제",
  icons: {
    shortcut: "/favicon_io/favicon.ico",
    icon: "/favicon_io/android-chrome-512x512.png",
    apple: "/favicon_io/apple-touch-icon.png",
  },
  manifest: "/favicon_io/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={font.className}>
      <body>
        <main>
          <MantineProvider>
            <AuthProvider>
              <NotificationProvider>{children}</NotificationProvider>
            </AuthProvider>
          </MantineProvider>
        </main>
      </body>
    </html>
  );
}
