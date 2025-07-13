import React from "react"
import { Header } from "@/components/layout/Header"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Clock, Zap, Gift, RefreshCw, Wallet, AlertCircle } from "lucide-react"
import { useSolanaYield } from "@/hooks/useSolanaYield"
import { SolanaYieldPosition, SolanaPoolData } from "@/services/solanaYieldService"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { useWallet as useSolanaWallet } from "@solana/wallet-adapter-react"

interface YieldPageProps {
  onNavigate?: (page: "dashboard" | "wallets" | "nfts" | "yield" | "settings") => void
}

function SolanaYieldCard({ position }: { position: SolanaYieldPosition }) {
  const getStatusColor = (status: string) => {
    switch(status) {
      case "active": return "text-accent"
      case "unstaking": return "text-secondary"
      case "closed": return "text-muted-foreground"
      default: return "text-muted-foreground"
    }
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "active": return <Zap className="w-4 h-4" />
      case "unstaking": return <Clock className="w-4 h-4" />
      case "closed": return <AlertCircle className="w-4 h-4" />
      default: return null
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatTokenAmount = (amount: number, symbol: string) => {
    return `${amount.toLocaleString()} ${symbol}`
  }

  return (
    <DashboardCard className="p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground text-lg">{position.protocol.name}</h3>
          <p className="text-muted-foreground">{position.pool.pool_name}</p>
          <p className="text-xs text-muted-foreground/80">{position.protocol.protocol_type}</p>
        </div>
        <div className={`flex items-center space-x-1 ${getStatusColor(position.status)}`}>
          {getStatusIcon(position.status)}
          <span className="text-sm font-medium capitalize">{position.status}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Staked Amount</span>
          <div className="text-right">
            <div className="font-bold font-mono text-foreground">
              {formatTokenAmount(position.staked_amount, position.staked_token_symbol)}
            </div>
            {position.current_value_usd && (
              <div className="text-xs text-muted-foreground">
                {formatCurrency(position.current_value_usd)}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Pending Rewards</span>
          <div className="text-right">
            <div className="font-bold font-mono text-primary">
              {position.rewards_token_symbol 
                ? formatTokenAmount(position.pending_rewards, position.rewards_token_symbol)
                : position.pending_rewards.toFixed(6)
              }
            </div>
            {position.pending_rewards_usd && (
              <div className="text-xs text-muted-foreground">
                {formatCurrency(position.pending_rewards_usd)}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">APY (7d)</span>
          <div className="flex items-center space-x-1">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="font-bold text-primary">
              {position.pool.apy_7d ? `${position.pool.apy_7d.toFixed(2)}%` : 'N/A'}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Entry Date</span>
          <span className="font-mono text-secondary text-sm">
            {new Date(position.entry_date).toLocaleDateString()}
          </span>
        </div>

        <div className="pt-4 flex space-x-2">
          {position.status === "active" && position.pending_rewards > 0 && (
            <Button variant="primary" size="sm" className="flex-1">
              Claim Rewards
            </Button>
          )}
          <Button variant="secondary" size="sm" className="flex-1">
            View Details
          </Button>
        </div>
      </div>
    </DashboardCard>
  )
}

function YieldOpportunityCard({ opportunity }: { opportunity: SolanaPoolData }) {
  const formatCurrency = (amount: number) => {
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(1)}K`
    return `$${amount.toFixed(0)}`
  }

  return (
    <div className="p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-all duration-200 border border-border/30 cursor-pointer">
      <div className="flex items-center justify-between mb-2">
        <div className="text-foreground font-semibold">{opportunity.protocol.name}</div>
        <div className="text-xs text-muted-foreground capitalize">{opportunity.protocol.protocol_type}</div>
      </div>
      <div className="text-sm text-muted-foreground mb-3">{opportunity.pool_name}</div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">APY (7d)</span>
          <span className="text-primary font-bold">
            {opportunity.apy_7d ? `${opportunity.apy_7d.toFixed(2)}%` : 'N/A'}
          </span>
        </div>
        {opportunity.total_liquidity_usd && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">TVL</span>
            <span className="text-xs font-medium">
              {formatCurrency(opportunity.total_liquidity_usd)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export function YieldPage({ onNavigate }: YieldPageProps) {
  const { setVisible } = useWalletModal()
  const { connecting } = useSolanaWallet()
  
  const {
    protocols,
    yieldOpportunities,
    userPositions,
    summaryStats,
    loading,
    refreshing,
    refreshData,
    syncPositions,
    connected,
    hasUser
  } = useSolanaYield()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const handleConnectWallet = () => {
    setVisible(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onNavigate={onNavigate} />
      
      <main className="container px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Solana Yield Farming</h1>
              <p className="text-muted-foreground">Manage your Solana DeFi positions and discover yield opportunities</p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={syncPositions}
                disabled={!connected || refreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Sync Positions
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        {!connected && (
          <DashboardCard className="p-6 mb-8 border-orange-200 bg-orange-50 dark:bg-orange-900/20">
            <div className="flex items-center space-x-3">
              <Wallet className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-800 dark:text-orange-200">Wallet Not Connected</p>
                <p className="text-sm text-orange-600 dark:text-orange-300">
                  Connect your Solana wallet to view your yield farming positions
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleConnectWallet} disabled={connecting}>
                {connecting ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            </div>
          </DashboardCard>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <DashboardCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Staked</p>
                <p className="text-2xl font-bold font-mono text-primary">
                  {formatCurrency(summaryStats.totalStaked)}
                </p>
              </div>
              <div className="text-primary/60">
                <Zap className="w-8 h-8" />
              </div>
            </div>
          </DashboardCard>
          
          <DashboardCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Rewards</p>
                <p className="text-2xl font-bold font-mono text-secondary">
                  {formatCurrency(summaryStats.pendingRewards)}
                </p>
              </div>
              <div className="text-secondary/60">
                <Gift className="w-8 h-8" />
              </div>
            </div>
          </DashboardCard>
          
          <DashboardCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average APY</p>
                <p className="text-2xl font-bold font-mono text-accent">
                  {summaryStats.averageAPR.toFixed(2)}%
                </p>
              </div>
              <div className="text-accent/60">
                <TrendingUp className="w-8 h-8" />
              </div>
            </div>
          </DashboardCard>

          <DashboardCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Positions</p>
                <p className="text-2xl font-bold font-mono text-foreground">
                  {summaryStats.activePositions}
                </p>
              </div>
              <div className="text-muted-foreground/60">
                <Wallet className="w-8 h-8" />
              </div>
            </div>
          </DashboardCard>
        </div>

        {/* Active Positions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Your Active Positions</h2>
            <Button variant="outline" onClick={() => onNavigate?.('wallets')}>
              Manage Wallets
            </Button>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Loading positions...</p>
            </div>
          ) : userPositions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {userPositions.map((position) => (
                <SolanaYieldCard key={position.id} position={position} />
              ))}
            </div>
          ) : connected ? (
            <DashboardCard className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Positions Found</h3>
              <p className="text-muted-foreground mb-4">
                You don't have any active yield farming positions yet.
              </p>
              <Button variant="primary">Discover Opportunities</Button>
            </DashboardCard>
          ) : (
            <DashboardCard className="p-8 text-center">
              <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
              <p className="text-muted-foreground">
                Connect your Solana wallet to view your yield farming positions.
              </p>
            </DashboardCard>
          )}
        </div>

        {/* Available Opportunities */}
        <DashboardCard className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Top Solana Yield Opportunities</h2>
            <p className="text-sm text-muted-foreground">
              {yieldOpportunities.length} protocols available
            </p>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Loading opportunities...</p>
            </div>
          ) : yieldOpportunities.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                {yieldOpportunities.slice(0, 8).map((opportunity) => (
                  <YieldOpportunityCard key={opportunity.id} opportunity={opportunity} />
                ))}
              </div>
              <div className="text-center">
                <Button variant="primary">
                  Explore All {yieldOpportunities.length} Opportunities
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Opportunities Available</h3>
              <p className="text-muted-foreground">
                Unable to load yield opportunities at this time.
              </p>
            </div>
          )}
        </DashboardCard>
      </main>
    </div>
  )
}