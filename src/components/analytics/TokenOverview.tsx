import { useState, useEffect } from "react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Shield, 
  ExternalLink,
  Droplets,
  DollarSign,
  Activity
} from "lucide-react"
import { JupiterTokenData, jupiterUltraService } from "@/services/jupiterUltraService"

interface TokenOverviewProps {
  tokenMint: string
}

export function TokenOverview({ tokenMint }: TokenOverviewProps) {
  const [tokenData, setTokenData] = useState<JupiterTokenData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tokenMint) return

    const fetchTokenData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const data = await jupiterUltraService.getTokenByMint(tokenMint)
        setTokenData(data)
      } catch (err) {
        setError('Failed to fetch token data')
        console.error('Error fetching token data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTokenData()
  }, [tokenMint])

  if (loading) {
    return (
      <DashboardCard className="p-6">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-muted/20 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 bg-muted/20 rounded w-32"></div>
              <div className="h-4 bg-muted/20 rounded w-24"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted/20 rounded w-16"></div>
                <div className="h-6 bg-muted/20 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </DashboardCard>
    )
  }

  if (error || !tokenData) {
    return (
      <DashboardCard className="p-6">
        <div className="text-center">
          <p className="text-muted-foreground">{error || 'Token not found'}</p>
        </div>
      </DashboardCard>
    )
  }

  const sentiment = jupiterUltraService.getMarketSentiment(tokenData)
  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`
    return num.toFixed(2)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Token Header */}
      <DashboardCard className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={tokenData.icon} alt={tokenData.name} />
              <AvatarFallback>{tokenData.symbol?.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-foreground">{tokenData.name}</h2>
                {tokenData.isVerified && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-lg text-muted-foreground">${tokenData.symbol}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{tokenData.launchpad || 'Unknown'}</Badge>
                <Badge 
                  variant="outline"
                  className={`${
                    tokenData.organicScoreLabel === 'high' ? 'text-success border-success/20 bg-success/10' :
                    tokenData.organicScoreLabel === 'medium' ? 'text-warning border-warning/20 bg-warning/10' :
                    'text-muted-foreground'
                  }`}
                >
                  Organic Score: {tokenData.organicScore.toFixed(0)}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            {tokenData.twitter && (
              <Button variant="outline" size="sm" asChild>
                <a href={tokenData.twitter} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Market Sentiment */}
        <div className="mb-6 p-4 rounded-lg bg-muted/10 border border-border/30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-foreground">Market Sentiment</h3>
            <Badge 
              variant="outline"
              className={`${
                sentiment.sentiment === 'bullish' ? 'text-success border-success/20 bg-success/10' :
                sentiment.sentiment === 'bearish' ? 'text-destructive border-destructive/20 bg-destructive/10' :
                'text-muted-foreground'
              }`}
            >
              {sentiment.sentiment.toUpperCase()} ({sentiment.confidence})
            </Badge>
          </div>
          <div className="flex flex-wrap gap-1">
            {sentiment.reasons.map((reason, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {reason}
              </Badge>
            ))}
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <DollarSign className="w-3 h-3" />
              Price
            </div>
            <div className="font-semibold text-foreground">
              {formatCurrency(tokenData.usdPrice)}
            </div>
            <div className={`text-xs flex items-center gap-1 ${
              tokenData.stats24h.priceChange >= 0 ? 'status-positive' : 'status-negative'
            }`}>
              {tokenData.stats24h.priceChange >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {tokenData.stats24h.priceChange.toFixed(2)}% (24h)
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Activity className="w-3 h-3" />
              Market Cap
            </div>
            <div className="font-semibold text-foreground">
              ${formatNumber(tokenData.mcap)}
            </div>
            <div className="text-xs text-muted-foreground">
              FDV: ${formatNumber(tokenData.fdv)}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="w-3 h-3" />
              Holders
            </div>
            <div className="font-semibold text-foreground">
              {formatNumber(tokenData.holderCount)}
            </div>
            <div className={`text-xs flex items-center gap-1 ${
              tokenData.stats24h.holderChange >= 0 ? 'status-positive' : 'status-negative'
            }`}>
              {tokenData.stats24h.holderChange >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {tokenData.stats24h.holderChange.toFixed(2)}% (24h)
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Droplets className="w-3 h-3" />
              Liquidity
            </div>
            <div className="font-semibold text-foreground">
              ${formatNumber(tokenData.liquidity)}
            </div>
            <div className={`text-xs flex items-center gap-1 ${
              tokenData.stats24h.liquidityChange >= 0 ? 'status-positive' : 'status-negative'
            }`}>
              {tokenData.stats24h.liquidityChange >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {tokenData.stats24h.liquidityChange.toFixed(2)}% (24h)
            </div>
          </div>
        </div>
      </DashboardCard>

      {/* Real-time Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardCard className="p-4">
          <h4 className="font-semibold text-foreground mb-3">5min Activity</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Buys/Sells</span>
              <span className="text-foreground">{tokenData.stats5m.numBuys}/{tokenData.stats5m.numSells}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Volume</span>
              <span className="text-foreground">${formatNumber(tokenData.stats5m.buyVolume + tokenData.stats5m.sellVolume)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Net Buyers</span>
              <span className="text-foreground">{tokenData.stats5m.numNetBuyers}</span>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard className="p-4">
          <h4 className="font-semibold text-foreground mb-3">1h Activity</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Buys/Sells</span>
              <span className="text-foreground">{tokenData.stats1h.numBuys}/{tokenData.stats1h.numSells}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Volume</span>
              <span className="text-foreground">${formatNumber(tokenData.stats1h.buyVolume + tokenData.stats1h.sellVolume)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Organic Buyers</span>
              <span className="text-foreground">{tokenData.stats1h.numOrganicBuyers}</span>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard className="p-4">
          <h4 className="font-semibold text-foreground mb-3">24h Activity</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Buys/Sells</span>
              <span className="text-foreground">{tokenData.stats24h.numBuys}/{tokenData.stats24h.numSells}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Volume</span>
              <span className="text-foreground">${formatNumber(tokenData.stats24h.buyVolume + tokenData.stats24h.sellVolume)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Traders</span>
              <span className="text-foreground">{tokenData.stats24h.numTraders}</span>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Security Audit */}
      <DashboardCard className="p-6">
        <h4 className="font-semibold text-foreground mb-4">Security Audit</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${tokenData.audit.mintAuthorityDisabled ? 'bg-success' : 'bg-destructive'}`}></div>
            <span className="text-sm text-muted-foreground">Mint Authority</span>
            <span className="text-sm font-medium">{tokenData.audit.mintAuthorityDisabled ? 'Disabled' : 'Active'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${tokenData.audit.freezeAuthorityDisabled ? 'bg-success' : 'bg-destructive'}`}></div>
            <span className="text-sm text-muted-foreground">Freeze Authority</span>
            <span className="text-sm font-medium">{tokenData.audit.freezeAuthorityDisabled ? 'Disabled' : 'Active'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Top Holders</span>
            <span className="text-sm font-medium">{tokenData.audit.topHoldersPercentage.toFixed(2)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Dev Balance</span>
            <span className="text-sm font-medium">{tokenData.audit.devBalancePercentage.toFixed(4)}%</span>
          </div>
        </div>
      </DashboardCard>
    </div>
  )
}