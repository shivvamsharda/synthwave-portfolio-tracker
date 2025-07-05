import { Header } from "@/components/layout/Header"
import { PortfolioStats } from "./PortfolioStats"
import { PortfolioChart } from "./PortfolioChart"
import { TokenList } from "./TokenList"
import { useWallet } from "@/hooks/useWallet"
import { usePortfolio } from "@/hooks/usePortfolio"

interface DashboardProps {
  onNavigate?: (page: "dashboard" | "wallets" | "nfts" | "yield" | "settings") => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { wallets } = useWallet()
  const { portfolioStats } = usePortfolio()
  
  return (
    <div className="min-h-screen bg-background">
      <Header onNavigate={onNavigate} />
      
      <main className="container px-4 py-8 space-y-8">
        {/* Portfolio Stats */}
        <PortfolioStats />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Portfolio Chart */}
          <PortfolioChart />
          
          {/* Token List */}
          <TokenList />
          
          {/* Quick Actions */}
          <div className="col-span-full lg:col-span-7 dashboard-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-all duration-200 text-left border border-border/30 hover:border-primary/30">
                <div className="text-primary font-semibold">Add Solana Wallet</div>
                <div className="text-sm text-muted-foreground">Connect new wallet</div>
              </button>
              <button className="p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-all duration-200 text-left border border-border/30 hover:border-secondary/30">
                <div className="text-primary font-semibold">Export Data</div>
                <div className="text-sm text-muted-foreground">Download CSV</div>
              </button>
              <button className="p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-all duration-200 text-left border border-border/30 hover:border-primary/30">
                <div className="text-primary font-semibold">Share Portfolio</div>
                <div className="text-sm text-muted-foreground">Create public link</div>
              </button>
              <button className="p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-all duration-200 text-left border border-border/30 hover:border-primary/30">
                <div className="text-primary font-semibold">Analytics</div>
                <div className="text-sm text-muted-foreground">Deep insights</div>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          <div className="dashboard-card p-6 text-center">
            <div className="text-2xl font-bold text-primary">{portfolioStats.totalWallets}</div>
            <div className="text-sm text-muted-foreground">Connected Wallets</div>
          </div>
          <div className="dashboard-card p-6 text-center">
            <div className="text-2xl font-bold text-primary">{portfolioStats.totalTokens}</div>
            <div className="text-sm text-muted-foreground">Token Holdings</div>
          </div>
          <div className="dashboard-card p-6 text-center">
            <div className="text-2xl font-bold text-primary">1</div>
            <div className="text-sm text-muted-foreground">Solana Network</div>
          </div>
        </div>
      </main>
    </div>
  )
}