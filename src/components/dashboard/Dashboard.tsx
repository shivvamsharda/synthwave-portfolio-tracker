
import { Header } from "@/components/layout/Header"
import { DashboardNavigation } from "./DashboardNavigation"
import { PortfolioStats } from "./PortfolioStats"
import { PortfolioChart } from "./PortfolioChart"
import { TokenList } from "./TokenList"
import { useWallet } from "@/hooks/useWallet"
import { usePortfolio } from "@/hooks/usePortfolio"
import { Download, TrendingUp } from "lucide-react"

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
        {/* Navigation Section */}
        <DashboardNavigation onNavigate={onNavigate} />

        {/* Portfolio Stats */}
        <PortfolioStats />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Portfolio Chart */}
          <PortfolioChart />
          
          {/* Token List - Expanded */}
          <TokenList onNavigate={onNavigate} />
        </div>

      </main>
    </div>
  )
}
