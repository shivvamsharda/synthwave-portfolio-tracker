import { DashboardCard } from "@/components/ui/dashboard-card"
import { Button } from "@/components/ui/button"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useWallet } from "@/hooks/useWallet"
import { usePortfolio } from "@/hooks/usePortfolio"
import { TrendingUp, TrendingDown, ExternalLink, RefreshCw } from "lucide-react"

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

export function TokenList() {
  const { wallets, connected } = useWallet()
  const { portfolio, loading, refreshing, refreshPortfolio, lastUpdated } = usePortfolio()

  return (
    <DashboardCard className="p-6 col-span-full lg:col-span-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Token Holdings</h3>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {connected && wallets.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={refreshPortfolio}
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
            Click refresh to fetch your latest token holdings
          </p>
          <Button 
            variant="primary" 
            onClick={refreshPortfolio}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Portfolio'}
          </Button>
        </div>
      ) : (
        <div className="space-y-4 max-h-80 overflow-y-auto dashboard-scrollbar">
          {portfolio.map((token) => (
            <div
              key={`${token.wallet_address}-${token.token_mint}`}
              className="flex items-center justify-between p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-all duration-200 border border-border/30"
            >
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
                  </div>
                  <div className="text-sm text-muted-foreground font-mono">
                    {token.balance.toLocaleString(undefined, { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 6 
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {token.wallet_address.slice(0, 4)}...{token.wallet_address.slice(-4)}
                  </div>
                </div>
              </div>

              {/* Token Stats */}
              <div className="text-right">
                <div className="font-semibold font-mono text-foreground">
                  ${token.usd_value?.toFixed(2) || '0.00'}
                </div>
                <div className="text-xs text-muted-foreground">
                  Price feed coming soon
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  )
}