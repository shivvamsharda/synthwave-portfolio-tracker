import { DashboardCard } from "@/components/ui/dashboard-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useWallet } from "@/hooks/useWallet"
import { usePortfolio } from "@/hooks/usePortfolio"
import { TrendingUp, TrendingDown, ExternalLink, RefreshCw, Wallet, ChevronDown, Filter, BarChart3 } from "lucide-react"
import { useState, useMemo } from "react"

interface Token {
  symbol: string
  name: string
  balance: string
  value: string
  change24h: number
  price: string
  allocation: number
}

// Mock token data
const mockTokens: Token[] = [
  {
    symbol: "ETH",
    name: "Ethereum",
    balance: "12.456",
    value: "$23,456.78",
    change24h: 5.67,
    price: "$1,883.45",
    allocation: 18.4
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    balance: "0.8923",
    value: "$24,567.12",
    change24h: -2.34,
    price: "$27,534.89",
    allocation: 19.3
  },
  {
    symbol: "SOL",
    name: "Solana",
    balance: "234.567",
    value: "$8,934.56",
    change24h: 12.45,
    price: "$38.09",
    allocation: 7.0
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    balance: "15,234.12",
    value: "$15,234.12",
    change24h: 0.01,
    price: "$1.00",
    allocation: 11.9
  },
  {
    symbol: "LINK",
    name: "Chainlink",
    balance: "892.34",
    value: "$12,456.78",
    change24h: 8.92,
    price: "$13.96",
    allocation: 9.8
  }
]

interface TokenListProps {
  onNavigate?: (page: "dashboard" | "wallets" | "nfts" | "yield" | "settings") => void
}

export function TokenList({ onNavigate }: TokenListProps) {
  const { wallets, connected } = useWallet()
  const { portfolio, loading, refreshing, refreshPortfolio, lastUpdated } = usePortfolio()
  
  const [sortBy, setSortBy] = useState<'balance' | 'value' | 'symbol'>('value')
  const [groupView, setGroupView] = useState<'flat' | 'grouped'>('grouped')
  const [showWalletBreakdown, setShowWalletBreakdown] = useState(false)

  // Wrapper function for refresh portfolio to handle onClick events
  const handleRefreshPortfolio = () => {
    refreshPortfolio()
  }

  // Enhanced portfolio processing with aggregation
  const processedPortfolio = useMemo(() => {
    if (!portfolio.length) return { aggregated: [], byWallet: {}, statistics: { totalTokens: 0, uniqueTokens: 0, totalValue: 0 } }

    // Aggregate tokens across wallets
    const tokenMap = new Map()
    const byWallet: Record<string, any[]> = {}

    portfolio.forEach(token => {
      const key = token.token_mint
      
      // Group by wallet
      if (!byWallet[token.wallet_address]) {
        byWallet[token.wallet_address] = []
      }
      byWallet[token.wallet_address].push(token)

      // Aggregate tokens
      if (tokenMap.has(key)) {
        const existing = tokenMap.get(key)
        existing.balance += token.balance
        existing.usd_value += (token.usd_value || 0)
        existing.walletCount += 1
        existing.wallets.push(token.wallet_address)
      } else {
        tokenMap.set(key, {
          ...token,
          walletCount: 1,
          wallets: [token.wallet_address]
        })
      }
    })

    let aggregated = Array.from(tokenMap.values())

    // Sort tokens
    aggregated.sort((a, b) => {
      switch (sortBy) {
        case 'balance':
          return b.balance - a.balance
        case 'value':
          return (b.usd_value || 0) - (a.usd_value || 0)
        case 'symbol':
          return a.token_symbol.localeCompare(b.token_symbol)
        default:
          return 0
      }
    })

    // Group by token type
    const grouped = {
      native: aggregated.filter(token => token.token_symbol === 'SOL'),
      spl: aggregated.filter(token => token.token_symbol !== 'SOL')
    }

    const statistics = {
      totalTokens: portfolio.length,
      uniqueTokens: aggregated.length,
      totalValue: aggregated.reduce((sum, token) => sum + (token.usd_value || 0), 0)
    }

    return {
      aggregated: groupView === 'flat' ? aggregated : grouped,
      byWallet,
      statistics
    }
  }, [portfolio, sortBy, groupView])

  const TokenItem = ({ token, showWalletInfo = false }: { token: any, showWalletInfo?: boolean }) => (
    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-all duration-200 border border-border/30">
      <div className="flex items-center space-x-4">
        {/* Token Icon */}
        <div className="w-10 h-10 rounded-full bg-gradient-cyber flex items-center justify-center text-background font-bold text-sm">
          {token.token_symbol.slice(0, 2)}
        </div>
        
        {/* Token Info */}
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-foreground">{token.token_symbol}</span>
            <span className="text-xs text-muted-foreground">{token.token_name}</span>
            {token.walletCount > 1 && (
              <Badge variant="secondary" className="text-xs">
                {token.walletCount} wallets
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground font-mono">
            {token.balance.toLocaleString(undefined, { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 6 
            })}
          </div>
          {showWalletInfo && (
            <div className="text-xs text-muted-foreground">
              {token.wallet_address.slice(0, 4)}...{token.wallet_address.slice(-4)}
            </div>
          )}
        </div>
      </div>

      {/* Token Stats */}
              <div className="text-right">
                <div className="font-semibold font-mono text-foreground">
                  ${token.usd_value?.toFixed(2) || '0.00'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {token.balance.toLocaleString()} tokens
                </div>
              </div>
    </div>
  )

  return (
    <DashboardCard className="p-6 col-span-full lg:col-span-5">
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
          {connected && wallets.length > 0 && (
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
          <div className="hidden sm:block">
            <WalletMultiButton className="!bg-primary !text-primary-foreground hover:!bg-primary/90 !rounded-md !text-sm !font-medium !px-4 !py-2" />
          </div>
        </div>
      </div>

      {/* Controls */}
      {portfolio.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-muted/10 rounded-lg">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="value">By Value</SelectItem>
                <SelectItem value="balance">By Balance</SelectItem>
                <SelectItem value="symbol">By Symbol</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <Select value={groupView} onValueChange={(value: any) => setGroupView(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grouped">Grouped</SelectItem>
                <SelectItem value="flat">Flat View</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowWalletBreakdown(!showWalletBreakdown)}
            className="ml-auto"
          >
            <Wallet className="w-4 h-4 mr-2" />
            {showWalletBreakdown ? 'Hide' : 'Show'} Wallet Breakdown
          </Button>
        </div>
      )}

      {/* Content */}
      {!connected || wallets.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-cyber flex items-center justify-center">
            <span className="text-background font-bold text-xl">₿</span>
          </div>
          <h4 className="text-lg font-semibold text-foreground mb-2">No Wallet Connected</h4>
          <p className="text-muted-foreground mb-6">
            Connect your Solana wallet to view your token holdings
          </p>
          <div className="sm:hidden">
            <WalletMultiButton className="!bg-primary !text-primary-foreground hover:!bg-primary/90 !rounded-md !text-sm !font-medium !px-6 !py-3" />
          </div>
        </div>
      ) : loading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading portfolio...</p>
        </div>
      ) : portfolio.length === 0 ? (
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
      ) : showWalletBreakdown ? (
        // Wallet breakdown view
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
      ) : groupView === 'flat' ? (
        // Flat view
        <div className="space-y-4 max-h-80 overflow-y-auto dashboard-scrollbar">
          {(processedPortfolio.aggregated as any[]).map((token) => (
            <TokenItem key={token.token_mint} token={token} />
          ))}
        </div>
      ) : (
        // Grouped view
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
      )}
    </DashboardCard>
  )
}