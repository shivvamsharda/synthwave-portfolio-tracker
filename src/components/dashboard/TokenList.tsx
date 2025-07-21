
import { DashboardCard } from "@/components/ui/dashboard-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/hooks/useWallet"
import { usePortfolio } from "@/hooks/usePortfolio"
import { usePortfolioProcessing } from "@/hooks/usePortfolioProcessing"
import { TokenListControls } from "./TokenListControls"
import { TokenListContent } from "./TokenListContent"
import { TokenListProps } from "./types"
import { RefreshCw, Plus, AlertCircle, Clock } from "lucide-react"
import { useState } from "react"

export function TokenList({ onNavigate }: TokenListProps) {
  const { wallets } = useWallet()
  const { 
    portfolio, 
    loading, 
    refreshing, 
    refreshPortfolio, 
    lastUpdated, 
    dataFreshness 
  } = usePortfolio()
  
  const [sortBy, setSortBy] = useState<'balance' | 'value' | 'symbol'>('value')
  const [groupView, setGroupView] = useState<'flat' | 'grouped'>('grouped')
  const [showWalletBreakdown, setShowWalletBreakdown] = useState(false)

  // Wrapper function for refresh portfolio to handle onClick events
  const handleRefreshPortfolio = () => {
    console.log('[TokenList] Manual refresh triggered')
    refreshPortfolio()
  }

  // Enhanced portfolio processing with aggregation
  const processedPortfolio = usePortfolioProcessing(portfolio, sortBy, groupView)

  // Get data freshness indicator
  const getDataFreshnessIndicator = () => {
    if (dataFreshness === 'fresh') {
      return (
        <Badge variant="secondary" className="text-green-600 bg-green-50 border-green-200">
          <Clock className="w-3 h-3 mr-1" />
          Fresh Data
        </Badge>
      )
    } else if (dataFreshness === 'stale') {
      return (
        <Badge variant="secondary" className="text-amber-600 bg-amber-50 border-amber-200">
          <AlertCircle className="w-3 h-3 mr-1" />
          Stale Data
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline">
          <Clock className="w-3 h-3 mr-1" />
          Cached Data
        </Badge>
      )
    }
  }

  return (
    <DashboardCard className="p-6 col-span-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-foreground">Token Holdings</h3>
            {portfolio.length > 0 && getDataFreshnessIndicator()}
          </div>
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
              variant={dataFreshness === 'stale' ? "default" : "ghost"}
              size="sm" 
              onClick={handleRefreshPortfolio}
              disabled={refreshing}
              className={dataFreshness === 'stale' ? "bg-amber-500 hover:bg-amber-600 text-white" : "text-primary hover:text-primary"}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : dataFreshness === 'stale' ? 'Refresh Required' : 'Refresh'}
            </Button>
          )}
        </div>
      </div>

      {/* Auto-refresh warning for stale data */}
      {dataFreshness === 'stale' && !refreshing && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Data may be outdated</span>
          </div>
          <p className="text-xs text-amber-700 mt-1">
            Portfolio data is more than 5 minutes old. Click "Refresh Required" to get the latest balances.
          </p>
        </div>
      )}

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
