"use client";

import Link from "next/link";
import { BadgeCheck, CircleUserRound, LogOut, Waves } from "lucide-react";
import { useWallet } from "@/components/wallet-provider";

export function AppHeader() {
  const { address, connected, connect, disconnect, error } = useWallet();
  return (
    <header className="app-header">
      <Link className="brand" href="/">
        <span><Waves size={20} /></span>
        <strong>Paveron</strong>
      </Link>
      <nav>
        <Link href="/">Pool</Link>
        <Link href="/covers">Covers</Link>
      </nav>
      <div className="wallet-box">
        {error && <small>{error}</small>}
        {connected && address ? (
          <>
            <BadgeCheck size={16} />
            <code>{address.slice(0, 6)}...{address.slice(-4)}</code>
            <button className="icon-button" type="button" onClick={disconnect} aria-label="Disconnect wallet" title="Disconnect wallet"><LogOut size={16} /></button>
          </>
        ) : (
          <button type="button" onClick={() => void connect()}><CircleUserRound size={16} /> Connect</button>
        )}
      </div>
    </header>
  );
}
