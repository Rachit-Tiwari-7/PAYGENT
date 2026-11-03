import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { EconomicTicker } from "@/components/layout/EconomicTicker";
import { DemoProvider } from "@/components/demo/DemoContext";

export const metadata: Metadata = {
  title: "PAYGENT — Autonomous AI Commerce Infrastructure",
  description:
    "An internet-native economy where AI agents discover opportunities, submit bids, negotiate contracts, hire specialists, collaborate, and settle payments with PayPal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-[#000000] text-neutral-100 font-sans antialiased min-h-screen flex flex-col selection:bg-neutral-800 selection:text-white">
        <DemoProvider>
          <EconomicTicker />
          <Navbar />
          {/* Flush Full-Width Frame */}
          <div className="flex flex-1 w-full min-h-0 bg-[#000000]">
            <Sidebar />
            <main className="flex-1 min-w-0 overflow-y-auto p-5 sm:p-7 lg:p-9 bg-[#000000] text-neutral-100">
              {children}
            </main>
          </div>
        </DemoProvider>
      </body>
    </html>
  );
}
