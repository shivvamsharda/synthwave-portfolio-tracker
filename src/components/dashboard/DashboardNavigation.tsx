
import { Wallet, BarChart3, Image, TrendingUp } from "lucide-react"

interface DashboardNavigationProps {
  onNavigate?: (page: "dashboard" | "wallets" | "nfts" | "yield" | "analytics" | "settings") => void
}

export function DashboardNavigation({ onNavigate }: DashboardNavigationProps) {
  return (
    <div className="crypto-card p-8">
      <h2 className="text-2xl font-bold text-foreground mb-6 gradient-text">Navigation</h2>
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

        <button 
          onClick={() => onNavigate?.("nfts")}
          className="group p-8 rounded-2xl bg-card/40 hover:bg-card/60 transition-all duration-300 text-left border border-border/30 hover:border-primary/30 hover:shadow-glow"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="feature-icon group-hover:scale-110 transition-transform">
              <Image className="h-6 w-6" />
            </div>
            <div className="text-primary font-bold text-xl">NFTs</div>
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            View and manage your NFT collection
          </div>
        </button>

        <button 
          onClick={() => onNavigate?.("yield")}
          className="group p-8 rounded-2xl bg-card/40 hover:bg-card/60 transition-all duration-300 text-left border border-border/30 hover:border-primary/30 hover:shadow-glow"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="feature-icon group-hover:scale-110 transition-transform">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="text-primary font-bold text-xl">Yield</div>
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            Discover staking and yield opportunities
          </div>
        </button>
      </div>
    </div>
  )
}
