import { DashboardCard } from "@/components/ui/dashboard-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useWallet } from "@/hooks/useWallet"
import { usePortfolio } from "@/hooks/usePortfolio"
import { RefreshCw, Wallet, ChevronDown, Filter, BarChart3, Plus, TrendingUp, TrendingDown } from "lucide-react"
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
        {/* Token Icon/Logo */}
        <div className="w-10 h-10 rounded-full bg-gradient-cyber flex items-center justify-center text-background font-bold text-sm overflow-hidden">
          {token.logoURI ? (
            <img 
              src={token.logoURI} 
              alt={`${token.token_symbol} logo`}
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const parent = target.parentElement
                if (parent) {
                  parent.innerHTML = token.token_symbol.slice(0, 2)
                  parent.className = "w-10 h-10 rounded-full bg-gradient-cyber flex items-center justify-center text-background font-bold text-sm"
                }
              }}
            />
          ) : (
            token.token_symbol.slice(0, 2)
          )}
        </div>
        
        {/* Token Info */}
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-foreground">{token.token_symbol}</span>
            <span className="text-xs text-muted-foreground max-w-[120px] truncate">{token.token_name}</span>
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
          {/* Additional metadata info */}
          {token.description && (
            <div className="text-xs text-muted-foreground max-w-[200px] truncate mt-1" title={token.description}>
              {token.description}
            </div>
          )}
        </div>
      </div>

      {/* Token Stats */}
      <div className="text-right">
        {/* Individual Token Price with Trend */}
        <div className="flex items-center justify-end space-x-1 mb-1">
          <span className="text-sm font-medium text-foreground">
            ${token.token_price?.toFixed(4) || '0.0000'}
          </span>
          {token.price_change_24h !== undefined && token.price_change_24h !== 0 && (
            <div className={`flex items-center space-x-1 ${
              token.price_change_24h > 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {token.price_change_24h > 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span className="text-xs font-medium">
                {Math.abs(token.price_change_24h).toFixed(2)}%
              </span>
            </div>
          )}
        </div>
        
        {/* Total Value */}
        <div className="font-semibold font-mono text-lg text-foreground">
          ${token.usd_value?.toFixed(2) || '0.00'}
        </div>
        
        {/* Token Balance */}
        <div className="text-xs text-muted-foreground">
          {token.balance.toLocaleString(undefined, { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 6 
          })} tokens
        </div>
        
        {/* External links */}
        {(token.website || token.twitter) && (
          <div className="flex items-center space-x-1 mt-1">
            {token.website && (
              <a 
                href={token.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                title="Visit website"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182C8.542 6.116 8.332 6.954 8.212 8h3.576c-.12-1.046-.33-1.884-.586-2.556-.24-.559-.499-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.13 1.056.34 1.884.586 2.556.24.559.499.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.497-.623.737-1.182.246-.672.456-1.5.586-2.556zm5.917 0h-1.946c.089 1.546.383 2.97.837 4.118A6.004 6.004 0 0015.917 11zm-13.834 0H4.083c-.089 1.546-.383 2.97-.837 4.118A6.004 6.004 0 004.083 11z" clipRule="evenodd"/>
                </svg>
              </a>
            )}
            {token.twitter && (
              <a 
                href={token.twitter} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                title="Visit Twitter"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M20 4.077a8.232 8.232 0 01-2.36.648 4.12 4.12 0 001.808-2.277 8.243 8.243 0 01-2.606.996A4.103 4.103 0 0013.847 2c-2.27 0-4.103 1.834-4.103 4.103 0 .322.037.635.107.935A11.647 11.647 0 011.392 2.755a4.075 4.075 0 00-.555 2.064c0 1.424.724 2.68 1.825 3.415a4.084 4.084 0 01-1.859-.514v.052c0 1.988 1.414 3.647 3.292 4.023a4.108 4.108 0 01-1.853.07c.522 1.63 2.038 2.816 3.833 2.85A8.235 8.235 0 011 16.077 11.616 11.616 0 006.29 18c7.547 0 11.675-6.252 11.675-11.675 0-.178-.004-.355-.012-.53A8.348 8.348 0 0020 4.077z" clipRule="evenodd"/>
                </svg>
              </a>
            )}
          </div>
        )}
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
      {wallets.length === 0 ? (
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