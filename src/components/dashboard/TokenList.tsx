import { DashboardCard } from "@/components/ui/dashboard-card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react"

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
  return (
    <DashboardCard className="p-6 col-span-full lg:col-span-5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Token Holdings</h3>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
          <ExternalLink className="w-4 h-4 mr-2" />
          View All
        </Button>
      </div>

      <div className="space-y-4 max-h-80 overflow-y-auto dashboard-scrollbar">
        {mockTokens.map((token, index) => (
          <div
            key={token.symbol}
            className="flex items-center justify-between p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-all duration-200 border border-border/30"
          >
            <div className="flex items-center space-x-4">
              {/* Token Icon */}
              <div className="w-10 h-10 rounded-full bg-gradient-cyber flex items-center justify-center text-background font-bold text-sm">
                {token.symbol.slice(0, 2)}
              </div>
              
              {/* Token Info */}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-foreground">{token.symbol}</span>
                  <span className="text-xs text-muted-foreground">{token.name}</span>
                </div>
                <div className="text-sm text-muted-foreground font-mono">
                  {token.balance} • {token.allocation}%
                </div>
              </div>
            </div>

            {/* Token Stats */}
            <div className="text-right">
              <div className="font-semibold font-mono text-foreground">
                {token.value}
              </div>
              <div className="flex items-center justify-end space-x-1">
                {token.change24h >= 0 ? (
                  <TrendingUp className="w-3 h-3 text-primary" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-destructive" />
                )}
                <span className={`text-xs font-medium ${
                  token.change24h >= 0 ? "text-primary" : "text-destructive"
                }`}>
                  {token.change24h >= 0 ? "+" : ""}{token.change24h.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  )
}