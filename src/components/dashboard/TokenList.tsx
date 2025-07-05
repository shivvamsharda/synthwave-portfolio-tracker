import { DashboardCard } from "@/components/ui/dashboard-card"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/hooks/useWallet"
import { usePortfolio } from "@/hooks/usePortfolio"
import { usePortfolioProcessing } from "@/hooks/usePortfolioProcessing"
import { TokenListControls } from "./TokenListControls"
import { TokenListContent } from "./TokenListContent"
import { TokenListProps } from "./types"
import { RefreshCw, Plus } from "lucide-react"
import { useState } from "react"

export function TokenList({ onNavigate }: TokenListProps) {
  const { wallets } = useWallet()
  const { portfolio, loading, refreshing, refreshPortfolio, lastUpdated } = usePortfolio()
  
  const [sortBy, setSortBy] = useState<'balance' | 'value' | 'symbol'>('value')
  const [groupView, setGroupView] = useState<'flat' | 'grouped'>('grouped')
  const [showWalletBreakdown, setShowWalletBreakdown] = useState(false)

  // Wrapper function for refresh portfolio to handle onClick events
  const handleRefreshPortfolio = () => {
    refreshPortfolio()
  }

  // Enhanced portfolio processing with aggregation
  const processedPortfolio = usePortfolioProcessing(portfolio, sortBy, groupView)

  return (
    <DashboardCard className="p-6 col-span-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Token Holdings</h3>
          {portfolio.length > 0 && (
            <div className="flex items-center space-x-4 mt-1">
              <p className="text-xs text-muted-foreground">
                {processedPortfolio.statistics.uniqueTokens} unique tokens • {processedPortfolio.statistics.totalTokens} total holdings
              </p>
              {lastUpdated && (
                <p className="text-xs text-muted-foreground">
                  Updated: {lastUpdated.toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate?.("wallets")}
            className="text-primary hover:text-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Wallet
          </Button>
          {wallets.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefreshPortfolio}
              disabled={refreshing}
              className="text-primary hover:text-primary"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          )}
        </div>
      </div>

      {/* Controls */}
      {portfolio.length > 0 && (
        <TokenListControls
          sortBy={sortBy}
          setSortBy={setSortBy}
          groupView={groupView}
          setGroupView={setGroupView}
          showWalletBreakdown={showWalletBreakdown}
          setShowWalletBreakdown={setShowWalletBreakdown}
        />
      )}

      {/* Content */}
      <TokenListContent
        wallets={wallets}
        loading={loading}
        portfolio={portfolio}
        refreshing={refreshing}
        processedPortfolio={processedPortfolio}
        showWalletBreakdown={showWalletBreakdown}
        groupView={groupView}
        onNavigate={onNavigate}
        handleRefreshPortfolio={handleRefreshPortfolio}
      />
    </DashboardCard>
  )
}