import React from "react"
import { Header } from "@/components/layout/Header"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { Button } from "@/components/ui/button"
import { Plus, Wallet, Copy, ExternalLink, Trash2 } from "lucide-react"

interface WalletInfo {
  id: string
  name: string
  address: string
  chain: "Ethereum" | "Solana" | "Polygon" | "BSC"
  balance: string
  assets: number
}

interface WalletsPageProps {
  onNavigate?: (page: "dashboard" | "wallets" | "nfts" | "yield" | "settings") => void
}

const mockWallets: WalletInfo[] = [
  {
    id: "1",
    name: "Main Wallet",
    address: "0x1234567890123456789012345678901234567890",
    chain: "Ethereum",
    balance: "$67,891.23",
    assets: 15
  },
  {
    id: "2", 
    name: "DeFi Wallet",
    address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    chain: "Ethereum",
    balance: "$34,567.89",
    assets: 8
  },
  {
    id: "3",
    name: "Solana Wallet",
    address: "DsrQqwE21qN4TQHJoMHkYF8fGVe3NzxQ5kJBw2R8Y7ZK",
    chain: "Solana", 
    balance: "$12,345.67",
    assets: 12
  }
]

function WalletCard({ wallet }: { wallet: WalletInfo }) {
  const getChainColor = (chain: string) => {
    switch(chain) {
      case "Ethereum": return "text-primary"
      case "Solana": return "text-secondary"
      case "Polygon": return "text-accent"
      case "BSC": return "text-yellow-400"
      default: return "text-muted-foreground"
    }
  }

  return (
    <DashboardCard className="p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-gradient-cyber flex items-center justify-center">
            <Wallet className="w-6 h-6 text-background" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{wallet.name}</h3>
            <span className={`text-sm font-medium ${getChainColor(wallet.chain)}`}>
              {wallet.chain}
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button size="sm" variant="ghost">
            <Copy className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost">
            <ExternalLink className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="font-mono text-xs text-muted-foreground break-all bg-muted/20 p-2 rounded">
          {wallet.address}
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Total Value</span>
          <span className="font-bold font-mono text-primary text-lg">{wallet.balance}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Assets</span>
          <span className="text-foreground font-medium">{wallet.assets}</span>
        </div>
      </div>
    </DashboardCard>
  )
}

export function WalletsPage({ onNavigate }: WalletsPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header onNavigate={onNavigate} />
      
      <main className="container px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-glow-primary">Connected Wallets</h1>
            <p className="text-muted-foreground">Manage your crypto wallets across all chains</p>
          </div>
          
          <Button variant="primary" className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Connect Wallet</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {mockWallets.map((wallet) => (
            <WalletCard key={wallet.id} wallet={wallet} />
          ))}
        </div>

        {/* Add Wallet Section */}
        <DashboardCard className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-cyber flex items-center justify-center">
            <Plus className="w-8 h-8 text-background" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Add New Wallet</h3>
          <p className="text-muted-foreground mb-6">
            Connect additional wallets to track all your crypto assets in one place
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="primary">Connect Ethereum</Button>
            <Button variant="secondary">Connect Solana</Button>
            <Button variant="outline">Connect Polygon</Button>
            <Button variant="ghost">More Chains</Button>
          </div>
        </DashboardCard>
      </main>
    </div>
  )
}