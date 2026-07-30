import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import AuthGate from "@/components/AuthGate";
import NudgeOverlay from "@/components/NudgeOverlay";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Safe Space | Für dich da",
  description: "Ein persönlicher Rückzugsort für Momente der Ruhe, Erdung und emotionale Unterstützung.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#faf9f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="antialiased selection:bg-sage-200 selection:text-sage-900">
        <div className="flex flex-col min-h-screen w-full relative">
          <AuthGate>
            {/* Isolated Background Container to prevent scroll overflow safely */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
              {/* Soothing Ambient Glows */}
              <div 
                className="ambient-glow bg-sage-300 dark:bg-sage-600 top-[-100px] left-[-100px]" 
                aria-hidden="true" 
              />
              <div 
                className="ambient-glow bg-sage-300 dark:bg-sage-700 bottom-[-150px] right-[-100px]" 
                aria-hidden="true" 
              />
            </div>

            {/* Content Wrapper */}
            <main className="flex-1 flex flex-col relative z-10 w-full max-w-md mx-auto px-4 py-6 pb-24 md:pb-8">
              {children}
            </main>
            
            <NudgeOverlay />
          </AuthGate>
        </div>
      </body>
    </html>
  );
}
