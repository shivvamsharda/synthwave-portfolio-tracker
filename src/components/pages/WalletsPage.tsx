import React from "react"
import { Header } from "@/components/layout/Header"
import { WalletManagement } from "@/components/wallet/WalletManagement"

interface WalletsPageProps {
  onNavigate?: (page: "dashboard" | "wallets" | "nfts" | "yield" | "settings") => void
}

export function WalletsPage({ onNavigate }: WalletsPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header onNavigate={onNavigate} />
      
      <main className="container px-4 py-8">
        <WalletManagement />
      </main>
    </div>
  )
}