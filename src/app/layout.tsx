import type { Metadata } from "next";
import { WalletProvider } from "@/components/wallet-provider";
import { AppHeader } from "@/components/app-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Paveron",
  description: "Parametric insurance capsules with reserved payout capacity.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          <AppHeader />
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
