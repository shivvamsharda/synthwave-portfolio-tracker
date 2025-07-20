
import { Header } from "@/components/layout/Header"
import { PortfolioStats } from "./PortfolioStats"
import { PortfolioChart } from "./PortfolioChart"
import { TokenList } from "./TokenList"
import { useWallet } from "@/hooks/useWallet"
import { usePortfolio } from "@/hooks/usePortfolio"
import { Wallet, TrendingUp, BarChart3, Download } from "lucide-react"

interface DashboardProps {
  onNavigate?: (page: "dashboard" | "wallets" | "nfts" | "yield" | "analytics" | "settings") => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { wallets } = useWallet()
  const { portfolioStats } = usePortfolio()
  
  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header onNavigate={onNavigate} />
      
      <main className="container px-6 py-8 space-y-8">
        {/* Portfolio Stats */}
        <PortfolioStats />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Portfolio Chart */}
          <PortfolioChart />
          
          {/* Token List - Expanded */}
          <TokenList onNavigate={onNavigate} />
        </div>

        {/* Quick Actions */}
        <div className="crypto-card p-8">
          <h3 className="text-xl font-bold text-foreground mb-6 gradient-text">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => onNavigate?.("wallets")}
              className="group p-6 rounded-2xl bg-card/40 hover:bg-card/60 transition-all duration-300 text-left border border-border/30 hover:border-primary/30 hover:shadow-glow"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="feature-icon group-hover:scale-110 transition-transform">
                  <Wallet className="h-5 w-5" />
                </div>
                <div className="text-primary font-bold text-lg">Manage Wallets</div>
              </div>
              <div className="text-sm text-muted-foreground font-medium">Add or remove wallets</div>
            </button>

            <button className="group p-6 rounded-2xl bg-card/40 hover:bg-card/60 transition-all duration-300 text-left border border-border/30 hover:border-primary/30 hover:shadow-glow">
              <div className="flex items-center space-x-3 mb-3">
                <div className="feature-icon group-hover:scale-110 transition-transform">
                  <Download className="h-5 w-5" />
                </div>
                <div className="text-primary font-bold text-lg">Export Data</div>
              </div>
              <div className="text-sm text-muted-foreground font-medium">Download CSV reports</div>
            </button>

            <button className="group p-6 rounded-2xl bg-card/40 hover:bg-card/60 transition-all duration-300 text-left border border-border/30 hover:border-primary/30 hover:shadow-glow">
              <div className="flex items-center space-x-3 mb-3">
                <div className="feature-icon group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div className="text-primary font-bold text-lg">Share Portfolio</div>
              </div>
              <div className="text-sm text-muted-foreground font-medium">Create public link</div>
            </button>

            <button className="group p-6 rounded-2xl bg-card/40 hover:bg-card/60 transition-all duration-300 text-left border border-border/30 hover:border-primary/30 hover:shadow-glow">
              <div className="flex items-center space-x-3 mb-3">
                <div className="feature-icon group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div className="text-primary font-bold text-lg">Analytics</div>
              </div>
              <div className="text-sm text-muted-foreground font-medium">Deep insights & AI analysis</div>
            </button>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          <div className="crypto-card p-8 text-center">
            <div className="metric-value mb-2">{portfolioStats.totalWallets}</div>
            <div className="metric-label">Connected Wallets</div>
          </div>
          <div className="crypto-card p-8 text-center">
            <div className="metric-value mb-2">{portfolioStats.totalTokens}</div>
            <div className="metric-label">Token Holdings</div>
          </div>
          <div className="crypto-card p-8 text-center">
            <div className="metric-value mb-2">1</div>
            <div className="metric-label">Solana Network</div>
          </div>
        </div>
      </main>
    </div>
  )
}
