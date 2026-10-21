import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BottomNav } from "@/components/BottomNav";
import { Providers } from "@/components/Providers";
import { RegisterSW } from "@/components/RegisterSW";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Muscu — Suivi d'entraînement",
  description:
    "PWA minimaliste de suivi de musculation. Surcharge progressive, timer de repos, historique.",
  applicationName: "Muscu",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Muscu",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-50">
        <Providers>
          <RegisterSW />
          <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-1 flex-col">
            {children}
            <BottomNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}
