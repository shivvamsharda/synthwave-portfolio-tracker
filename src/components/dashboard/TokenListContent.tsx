import React, { useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { TokenItem } from "./TokenItem"
import { ProcessedPortfolio } from "./types"
import { ChevronDown, Wallet, RefreshCw } from "lucide-react"
import { usePortfolio } from "@/hooks/usePortfolio"

interface TokenListContentProps {
  wallets: any[]
  loading: boolean
  portfolio: any[]
  refreshing: boolean
  processedPortfolio: ProcessedPortfolio
  showWalletBreakdown: boolean
  groupView: 'flat' | 'grouped'
  onNavigate?: (page: "dashboard" | "wallets" | "nfts" | "yield" | "settings") => void
  handleRefreshPortfolio: () => void
}

export function TokenListContent({
  wallets,
  loading,
  portfolio,
  refreshing,
  processedPortfolio,
  showWalletBreakdown,
  groupView,
  onNavigate,
  handleRefreshPortfolio
}: TokenListContentProps) {
  const { cleanupAllOrphanedData } = usePortfolio()
  
  // Force immediate cleanup if no wallets but portfolio data exists
  useEffect(() => {
    if (wallets.length === 0 && portfolio.length > 0) {
      console.log('[TokenListContent] No wallets but portfolio data exists, forcing cleanup')
      setTimeout(() => {
        cleanupAllOrphanedData()
      }, 100)
    }
  }, [wallets.length, portfolio.length])

  if (wallets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-cyber flex items-center justify-center">
          <span className="text-background font-bold text-xl">₿</span>
        </div>
        <h4 className="text-lg font-semibold text-foreground mb-2">No Wallets Added</h4>
        <p className="text-muted-foreground mb-6">
          Add your Solana wallets to start tracking your token holdings
        </p>
        <Button 
          variant="outline" 
          onClick={() => onNavigate?.("wallets")}
        >
          <Wallet className="w-4 h-4 mr-2" />
          Add Wallets
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground">Loading portfolio...</p>
      </div>
    )
  }

  if (portfolio.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-cyber flex items-center justify-center">
          <span className="text-background font-bold text-xl">₿</span>
        </div>
        <h4 className="text-lg font-semibold text-foreground mb-2">No Holdings Found</h4>
        <p className="text-muted-foreground mb-6">
          Add wallets to track your portfolio or refresh to fetch your latest token holdings
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            variant="primary" 
            onClick={handleRefreshPortfolio}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Portfolio'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onNavigate?.("wallets")}
          >
            <Wallet className="w-4 h-4 mr-2" />
            Manage Wallets
          </Button>
        </div>
      </div>
    )
  }

  if (showWalletBreakdown) {
    return (
      <div className="space-y-4 max-h-80 overflow-y-auto dashboard-scrollbar">
        {Object.entries(processedPortfolio.byWallet).map(([walletAddress, tokens]) => (
          <Collapsible key={walletAddress} defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/10 rounded-lg hover:bg-muted/20 transition-colors">
              <div className="flex items-center space-x-2">
                <ChevronDown className="w-4 h-4" />
                <span className="font-mono text-sm">{walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}</span>
                <Badge variant="secondary">{tokens.length} tokens</Badge>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              {tokens.map((token: any) => (
                <TokenItem key={`${token.wallet_address}-${token.token_mint}`} token={token} showWalletInfo={false} />
              ))}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    )
  }

  if (groupView === 'flat') {
    return (
      <div className="space-y-4 max-h-80 overflow-y-auto dashboard-scrollbar">
        {(processedPortfolio.aggregated as any[]).map((token) => (
          <TokenItem key={token.token_mint} token={token} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 max-h-80 overflow-y-auto dashboard-scrollbar">
      {/* Native SOL */}
      {(processedPortfolio.aggregated as any).native?.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <h4 className="font-semibold text-foreground">Native Solana</h4>
            <Badge variant="outline">{(processedPortfolio.aggregated as any).native.length}</Badge>
          </div>
          <div className="space-y-2">
            {(processedPortfolio.aggregated as any).native.map((token: any) => (
              <TokenItem key={token.token_mint} token={token} />
            ))}
          </div>
        </div>
      )}

      {/* SPL Tokens */}
      {(processedPortfolio.aggregated as any).spl?.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <h4 className="font-semibold text-foreground">SPL Tokens</h4>
            <Badge variant="outline">{(processedPortfolio.aggregated as any).spl.length}</Badge>
          </div>
          <div className="space-y-2">
            {(processedPortfolio.aggregated as any).spl.map((token: any) => (
              <TokenItem key={token.token_mint} token={token} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}