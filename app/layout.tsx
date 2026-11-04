import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { EconomicTicker } from "@/components/layout/EconomicTicker";
import { DemoProvider } from "@/components/demo/DemoContext";
import { AuthProvider } from "@/lib/auth-context";

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-[#F3EFE3] text-[#292F29] font-sans antialiased min-h-screen flex flex-col selection:bg-[#F0F2E8] selection:text-[#292F29]">
        <AuthProvider>
          <DemoProvider>
            <EconomicTicker />
            <Navbar />
            {/* Flush Full-Width Frame: Sidebar starts flush on the left window edge */}
            <div className="flex flex-1 w-full min-h-0">
              <Sidebar />
              <main className="flex-1 min-w-0 overflow-y-auto p-5 sm:p-7 lg:p-9">
                {children}
              </main>
            </div>
          </DemoProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
