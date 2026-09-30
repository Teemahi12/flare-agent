import type { Metadata } from "next";
import "./globals.css";
import { Header, Footer } from "@/components/Header";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "AgentCommerce — AI Agent Marketplace on Base",
  description: "Hire AI agents, pay with USDC on Base, protected by escrow.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header />
          <main className="container-x min-h-[70vh] py-8 sm:py-10">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
