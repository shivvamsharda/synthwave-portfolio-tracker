
import { Wallet, BarChart3, Image, TrendingUp, Clock } from "lucide-react"

interface DashboardNavigationProps {
  onNavigate?: (page: "dashboard" | "wallets" | "nfts" | "yield" | "analytics" | "settings") => void
}

export function DashboardNavigation({ onNavigate }: DashboardNavigationProps) {
  return (
    <div className="crypto-card p-8">
      <h2 className="text-2xl font-bold text-foreground mb-6 gradient-text">Platform Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <button 
          onClick={() => onNavigate?.("wallets")}
          className="group p-8 rounded-2xl bg-card/40 hover:bg-card/60 transition-all duration-300 text-left border border-border/30 hover:border-primary/30 hover:shadow-glow"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="feature-icon group-hover:scale-110 transition-transform">
              <Wallet className="h-6 w-6" />
            </div>
            <div className="text-primary font-bold text-xl">Wallets</div>
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            Manage your connected Solana wallets
          </div>
        </button>

        <button 
          onClick={() => onNavigate?.("analytics")}
          className="group p-8 rounded-2xl bg-card/40 hover:bg-card/60 transition-all duration-300 text-left border border-border/30 hover:border-primary/30 hover:shadow-glow"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="feature-icon group-hover:scale-110 transition-transform">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div className="text-primary font-bold text-xl">Token Analytics</div>
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            Advanced token analysis and insights
          </div>
        </button>

        <div className="group p-8 rounded-2xl bg-card/20 transition-all duration-300 text-left border border-border/20 cursor-not-allowed opacity-60">
          <div className="flex items-center space-x-4 mb-4">
            <div className="feature-icon">
              <Image className="h-6 w-6" />
            </div>
            <div className="text-primary font-bold text-xl">NFTs</div>
            <div className="flex items-center space-x-1 px-2 py-1 bg-muted/50 rounded-full">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Coming Soon</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            View and manage your NFT collection
          </div>
        </div>

        <div className="group p-8 rounded-2xl bg-card/20 transition-all duration-300 text-left border border-border/20 cursor-not-allowed opacity-60">
          <div className="flex items-center space-x-4 mb-4">
            <div className="feature-icon">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="text-primary font-bold text-xl">Yield Tracking</div>
            <div className="flex items-center space-x-1 px-2 py-1 bg-muted/50 rounded-full">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Coming Soon</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            Discover staking and yield opportunities
          </div>
        </div>
      </div>
    </div>
  )
}
