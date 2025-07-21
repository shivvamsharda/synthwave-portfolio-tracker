
import { Header } from "@/components/layout/Header"
import { DashboardNavigation } from "./DashboardNavigation"
import { PortfolioStats } from "./PortfolioStats"
import { PortfolioChart } from "./PortfolioChart"
import { TokenList } from "./TokenList"
import { OrderHistory } from "./OrderHistory"
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
          {/* Portfolio Chart - Reduced width */}
          <div className="lg:col-span-7">
            <PortfolioChart />
          </div>
          
          {/* Order History - New right panel */}
          <div className="lg:col-span-5">
            <OrderHistory onNavigate={onNavigate} />
          </div>
          
          {/* Token List - Full width on new row */}
          <div className="lg:col-span-12">
            <TokenList onNavigate={onNavigate} />
          </div>
        </div>

      </main>
    </div>
  )
}
