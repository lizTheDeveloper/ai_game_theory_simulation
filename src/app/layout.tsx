"use client";

import { usePathname } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/core/Navigation";
import { SimulationWorkerProvider } from "@/lib/contexts/SimulationWorkerContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isGameRoute = pathname?.startsWith("/game-dashboard-demo");

  return (
    <html lang="en">
      <head>
        <title>Superalignment to Utopia</title>
        <meta
          name="description"
          content="Research simulation: AI alignment to human flourishing pathways"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SimulationWorkerProvider>
          {isGameRoute ? (
            // Game route: full-screen, no sidebar
            <div className="w-full">{children}</div>
          ) : (
            // Simulation routes: with navigation sidebar
            <div className="flex">
              <Navigation />
              <div className="ml-64 flex-1">{children}</div>
            </div>
          )}
        </SimulationWorkerProvider>
      </body>
    </html>
  );
}
