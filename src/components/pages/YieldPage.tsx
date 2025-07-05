import React from "react"
import { Header } from "@/components/layout/Header"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Clock, Zap, Gift } from "lucide-react"

interface YieldPosition {
  id: string
  protocol: string
  pool: string
  staked: string
  rewards: string
  apr: number
  timeLeft?: string
  status: "active" | "pending" | "claimable"
}

interface YieldPageProps {
  onNavigate?: (page: "dashboard" | "wallets" | "nfts" | "yield" | "settings") => void
}

const mockPositions: YieldPosition[] = [
  {
    id: "1",
    protocol: "Uniswap V3",
    pool: "ETH/USDC",
    staked: "$12,345.67",
    rewards: "$234.56",
    apr: 12.5,
    status: "claimable"
  },
  {
    id: "2", 
    protocol: "Compound",
    pool: "USDC Lending",
    staked: "$8,900.00",
    rewards: "$145.23",
    apr: 8.2,
    status: "active"
  },
  {
    id: "3",
    protocol: "Raydium",
    pool: "SOL/USDC",
    staked: "$5,678.90",
    rewards: "$89.12",
    apr: 15.7,
    timeLeft: "2d 14h",
    status: "pending"
  }
]

function YieldCard({ position }: { position: YieldPosition }) {
  const getStatusColor = (status: string) => {
    switch(status) {
      case "claimable": return "text-primary"
      case "active": return "text-accent"
      case "pending": return "text-secondary"
      default: return "text-muted-foreground"
    }
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "claimable": return <Gift className="w-4 h-4" />
      case "active": return <Zap className="w-4 h-4" />
      case "pending": return <Clock className="w-4 h-4" />
      default: return null
    }
  }

  return (
    <GlassCard className="p-6 hover:shadow-neon-primary/20 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground text-lg">{position.protocol}</h3>
          <p className="text-muted-foreground">{position.pool}</p>
        </div>
        <div className={`flex items-center space-x-1 ${getStatusColor(position.status)}`}>
          {getStatusIcon(position.status)}
          <span className="text-sm font-medium capitalize">{position.status}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Staked Amount</span>
          <span className="font-bold font-mono text-foreground">{position.staked}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Pending Rewards</span>
          <span className="font-bold font-mono text-primary">{position.rewards}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">APR</span>
          <div className="flex items-center space-x-1">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="font-bold text-primary">{position.apr}%</span>
          </div>
        </div>

        {position.timeLeft && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Time Left</span>
            <span className="font-mono text-secondary">{position.timeLeft}</span>
          </div>
        )}

        <div className="pt-4 flex space-x-2">
          {position.status === "claimable" && (
            <Button variant="neonPrimary" size="sm" className="flex-1">
              Claim Rewards
            </Button>
          )}
          <Button variant="glass" size="sm" className="flex-1">
            View Details
          </Button>
        </div>
      </div>
    </GlassCard>
  )
}

export function YieldPage({ onNavigate }: YieldPageProps) {
  const totalStaked = "$26,924.57"
  const totalRewards = "$468.91"
  const avgAPR = 12.1

  return (
    <div className="min-h-screen bg-background">
      <Header onNavigate={onNavigate} />
      
      <main className="container px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-glow-primary mb-2">Yield Farming</h1>
          <p className="text-muted-foreground">Manage your staking positions and claim rewards</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Staked</p>
                <p className="text-2xl font-bold font-mono text-primary">{totalStaked}</p>
              </div>
              <div className="text-primary/60">
                <Zap className="w-8 h-8" />
              </div>
            </div>
          </GlassCard>
          
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Rewards</p>
                <p className="text-2xl font-bold font-mono text-secondary">{totalRewards}</p>
              </div>
              <div className="text-secondary/60">
                <Gift className="w-8 h-8" />
              </div>
            </div>
          </GlassCard>
          
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average APR</p>
                <p className="text-2xl font-bold font-mono text-accent">{avgAPR}%</p>
              </div>
              <div className="text-accent/60">
                <TrendingUp className="w-8 h-8" />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Active Positions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Active Positions</h2>
            <Button variant="neonAccent">
              Discover Opportunities
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {mockPositions.map((position) => (
              <YieldCard key={position.id} position={position} />
            ))}
          </div>
        </div>

        {/* Available Opportunities */}
        <GlassCard className="p-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Top Yield Opportunities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { protocol: "Aave", pool: "USDT", apr: "8.5%" },
              { protocol: "Curve", pool: "3Pool", apr: "12.3%" },
              { protocol: "Yearn", pool: "USDC Vault", apr: "9.8%" },
              { protocol: "PancakeSwap", pool: "CAKE/BNB", apr: "18.2%" }
            ].map((opportunity, index) => (
              <div key={index} className="p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-all duration-200 border border-border/30">
                <div className="text-foreground font-semibold">{opportunity.protocol}</div>
                <div className="text-sm text-muted-foreground">{opportunity.pool}</div>
                <div className="text-primary font-bold mt-2">{opportunity.apr} APR</div>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Button variant="neonPrimary">
              Explore All Opportunities
            </Button>
          </div>
        </GlassCard>
      </main>
    </div>
  )
}