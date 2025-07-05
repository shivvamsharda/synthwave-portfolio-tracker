import { Header } from "@/components/layout/Header"
import { PortfolioStats } from "./PortfolioStats"
import { PortfolioChart } from "./PortfolioChart"
import { TokenList } from "./TokenList"
import { NFTGrid } from "./NFTGrid"

interface DashboardProps {
  onNavigate?: (page: "dashboard" | "wallets" | "nfts" | "yield" | "settings") => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header onNavigate={onNavigate} />
      
      <main className="container px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-cyber bg-clip-text text-transparent animate-fade-in">
            Your Crypto Empire
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Track, analyze, and showcase your digital assets across all chains with real-time insights and degen-level precision.
          </p>
        </div>

        {/* Portfolio Stats */}
        <PortfolioStats />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Portfolio Chart */}
          <PortfolioChart />
          
          {/* Token List */}
          <TokenList />
          
          {/* NFT Grid */}
          <NFTGrid />
          
          {/* Quick Actions */}
          <div className="col-span-full lg:col-span-5 glass-card p-6">
            <h3 className="text-lg font-semibold text-glow-primary mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-all duration-200 text-left border border-border/30 hover:border-primary/30">
                <div className="text-primary font-semibold">Add Wallet</div>
                <div className="text-sm text-muted-foreground">Connect new wallet</div>
              </button>
              <button className="p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-all duration-200 text-left border border-border/30 hover:border-secondary/30">
                <div className="text-secondary font-semibold">Export Data</div>
                <div className="text-sm text-muted-foreground">Download CSV</div>
              </button>
              <button className="p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-all duration-200 text-left border border-border/30 hover:border-accent/30">
                <div className="text-accent font-semibold">Share Portfolio</div>
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
          <div className="glass-card p-6 text-center">
            <div className="text-2xl font-bold font-mono text-primary">24</div>
            <div className="text-sm text-muted-foreground">Connected Wallets</div>
          </div>
          <div className="glass-card p-6 text-center">
            <div className="text-2xl font-bold font-mono text-secondary">156</div>
            <div className="text-sm text-muted-foreground">Total Assets</div>
          </div>
          <div className="glass-card p-6 text-center">
            <div className="text-2xl font-bold font-mono text-accent">8</div>
            <div className="text-sm text-muted-foreground">Active Chains</div>
          </div>
        </div>
      </main>
    </div>
  )
}