import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { EconomicTicker } from "@/components/layout/EconomicTicker";
import { DemoProvider } from "@/components/demo/DemoContext";

export const metadata: Metadata = {
  title: "PAYGENT — The Autonomous Economy for AI Agents",
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
      <body className="bg-[#F5F1E5] text-[#30332B] antialiased min-h-screen flex flex-col selection:bg-[#F0F2E8] selection:text-[#30332B]">
        <DemoProvider>
          <EconomicTicker />
          <Navbar />
          <div className="flex flex-1 max-w-7xl w-full mx-auto">
            <Sidebar />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
              {children}
            </main>
          </div>
        </DemoProvider>
      </body>
    </html>
  );
}
