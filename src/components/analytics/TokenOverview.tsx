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
    if (num === undefined || num === null || isNaN(num)) return '0'
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`
    return num.toFixed(2)
  }

  const formatCurrency = (amount: number) => {
    if (amount === undefined || amount === null || isNaN(amount)) return '$0.00'
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
                <Badge variant="outline">{tokenData.launchpad || '0'}</Badge>
                <Badge 
                  variant="outline"
                  className={`${
                    tokenData.organicScoreLabel === 'high' ? 'text-success border-success/20 bg-success/10' :
                    tokenData.organicScoreLabel === 'medium' ? 'text-warning border-warning/20 bg-warning/10' :
                    'text-muted-foreground'
                  }`}
                >
                  Organic Score: {(tokenData.organicScore ?? 0).toFixed(0)}
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
              (tokenData.stats24h?.priceChange ?? 0) >= 0 ? 'status-positive' : 'status-negative'
            }`}>
              {(tokenData.stats24h?.priceChange ?? 0) >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {(tokenData.stats24h?.priceChange ?? 0).toFixed(2)}% (24h)
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
              (tokenData.stats24h?.holderChange ?? 0) >= 0 ? 'status-positive' : 'status-negative'
            }`}>
              {(tokenData.stats24h?.holderChange ?? 0) >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {(tokenData.stats24h?.holderChange ?? 0).toFixed(2)}% (24h)
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
              (tokenData.stats24h?.liquidityChange ?? 0) >= 0 ? 'status-positive' : 'status-negative'
            }`}>
              {(tokenData.stats24h?.liquidityChange ?? 0) >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {(tokenData.stats24h?.liquidityChange ?? 0).toFixed(2)}% (24h)
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
              <span className="text-foreground">{tokenData.stats5m?.numBuys ?? 0}/{tokenData.stats5m?.numSells ?? 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Volume</span>
              <span className="text-foreground">${formatNumber((tokenData.stats5m?.buyVolume ?? 0) + (tokenData.stats5m?.sellVolume ?? 0))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Net Buyers</span>
              <span className="text-foreground">{tokenData.stats5m?.numNetBuyers ?? 0}</span>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard className="p-4">
          <h4 className="font-semibold text-foreground mb-3">1h Activity</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Buys/Sells</span>
              <span className="text-foreground">{tokenData.stats1h?.numBuys ?? 0}/{tokenData.stats1h?.numSells ?? 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Volume</span>
              <span className="text-foreground">${formatNumber((tokenData.stats1h?.buyVolume ?? 0) + (tokenData.stats1h?.sellVolume ?? 0))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Organic Buyers</span>
              <span className="text-foreground">{tokenData.stats1h?.numOrganicBuyers ?? 0}</span>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard className="p-4">
          <h4 className="font-semibold text-foreground mb-3">24h Activity</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Buys/Sells</span>
              <span className="text-foreground">{tokenData.stats24h?.numBuys ?? 0}/{tokenData.stats24h?.numSells ?? 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Volume</span>
              <span className="text-foreground">${formatNumber((tokenData.stats24h?.buyVolume ?? 0) + (tokenData.stats24h?.sellVolume ?? 0))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Traders</span>
              <span className="text-foreground">{tokenData.stats24h?.numTraders ?? 0}</span>
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
            <span className="text-sm font-medium">{(tokenData.audit?.topHoldersPercentage ?? 0).toFixed(2)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Dev Balance</span>
            <span className="text-sm font-medium">{(tokenData.audit?.devBalancePercentage ?? 0).toFixed(4)}%</span>
          </div>
        </div>
      </DashboardCard>

      {/* Complete Jupiter API Data */}
      <DashboardCard className="p-6">
        <h4 className="font-semibold text-foreground mb-4">Complete Token Data (Jupiter Ultra API)</h4>
        
        {/* Basic Token Info */}
        <div className="space-y-6">
          <div>
            <h5 className="font-medium text-foreground mb-3">Token Information</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Contract Address:</span>
                <div className="font-mono text-xs break-all bg-muted/20 p-2 rounded mt-1">{tokenData.id}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Decimals:</span>
                <div className="font-medium">{tokenData.decimals}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Token Program:</span>
                <div className="font-mono text-xs break-all bg-muted/20 p-2 rounded mt-1">{tokenData.tokenProgram}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Developer:</span>
                <div className="font-mono text-xs break-all bg-muted/20 p-2 rounded mt-1">{tokenData.dev}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Launchpad:</span>
                <div className="font-medium">{tokenData.launchpad || '0'}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Last Updated:</span>
                <div className="font-medium">{new Date(tokenData.updatedAt).toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Supply Information */}
          <div>
            <h5 className="font-medium text-foreground mb-3">Supply Information</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Circulating Supply:</span>
                <div className="font-medium">{formatNumber(tokenData.circSupply)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Total Supply:</span>
                <div className="font-medium">{formatNumber(tokenData.totalSupply)}</div>
              </div>
            </div>
          </div>

          {/* Pool Information */}
          {tokenData.firstPool && (
            <div>
              <h5 className="font-medium text-foreground mb-3">Pool Information</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">First Pool ID:</span>
                  <div className="font-mono text-xs break-all bg-muted/20 p-2 rounded mt-1">{tokenData.firstPool.id}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Pool Created:</span>
                  <div className="font-medium">{new Date(tokenData.firstPool.createdAt).toLocaleString()}</div>
                </div>
                {tokenData.graduatedPool && (
                  <>
                    <div>
                      <span className="text-muted-foreground">Graduated Pool:</span>
                      <div className="font-mono text-xs break-all bg-muted/20 p-2 rounded mt-1">{tokenData.graduatedPool}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Graduated At:</span>
                      <div className="font-medium">{tokenData.graduatedAt ? new Date(tokenData.graduatedAt).toLocaleString() : '0'}</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Detailed Statistics */}
          <div>
            <h5 className="font-medium text-foreground mb-3">Time-based Statistics</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* 5 Minutes */}
              <div className="space-y-2">
                <h6 className="font-medium text-sm text-primary">5 Minutes</h6>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price Change:</span>
                    <span className={(tokenData.stats5m?.priceChange ?? 0) >= 0 ? 'text-success' : 'text-destructive'}>
                      {(tokenData.stats5m?.priceChange ?? 0).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Holder Change:</span>
                    <span className={(tokenData.stats5m?.holderChange ?? 0) >= 0 ? 'text-success' : 'text-destructive'}>
                      {(tokenData.stats5m?.holderChange ?? 0).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Volume Change:</span>
                    <span>{(tokenData.stats5m?.volumeChange ?? 0).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Buy Volume:</span>
                    <span>${formatNumber(tokenData.stats5m?.buyVolume ?? 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sell Volume:</span>
                    <span>${formatNumber(tokenData.stats5m?.sellVolume ?? 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Organic Buy Vol:</span>
                    <span>${formatNumber(tokenData.stats5m?.buyOrganicVolume ?? 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Organic Sell Vol:</span>
                    <span>${formatNumber(tokenData.stats5m?.sellOrganicVolume ?? 0)}</span>
                  </div>
                </div>
              </div>

              {/* 1 Hour */}
              <div className="space-y-2">
                <h6 className="font-medium text-sm text-primary">1 Hour</h6>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price Change:</span>
                    <span className={(tokenData.stats1h?.priceChange ?? 0) >= 0 ? 'text-success' : 'text-destructive'}>
                      {(tokenData.stats1h?.priceChange ?? 0).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Holder Change:</span>
                    <span className={(tokenData.stats1h?.holderChange ?? 0) >= 0 ? 'text-success' : 'text-destructive'}>
                      {(tokenData.stats1h?.holderChange ?? 0).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Volume Change:</span>
                    <span>{(tokenData.stats1h?.volumeChange ?? 0).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Buy Volume:</span>
                    <span>${formatNumber(tokenData.stats1h?.buyVolume ?? 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sell Volume:</span>
                    <span>${formatNumber(tokenData.stats1h?.sellVolume ?? 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Organic Buy Vol:</span>
                    <span>${formatNumber(tokenData.stats1h?.buyOrganicVolume ?? 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Organic Sell Vol:</span>
                    <span>${formatNumber(tokenData.stats1h?.sellOrganicVolume ?? 0)}</span>
                  </div>
                </div>
              </div>

              {/* 6 Hours */}
              <div className="space-y-2">
                <h6 className="font-medium text-sm text-primary">6 Hours</h6>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price Change:</span>
                    <span className={(tokenData.stats6h?.priceChange ?? 0) >= 0 ? 'text-success' : 'text-destructive'}>
                      {(tokenData.stats6h?.priceChange ?? 0).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Holder Change:</span>
                    <span className={(tokenData.stats6h?.holderChange ?? 0) >= 0 ? 'text-success' : 'text-destructive'}>
                      {(tokenData.stats6h?.holderChange ?? 0).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Volume Change:</span>
                    <span>{(tokenData.stats6h?.volumeChange ?? 0).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Buy Volume:</span>
                    <span>${formatNumber(tokenData.stats6h?.buyVolume ?? 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sell Volume:</span>
                    <span>${formatNumber(tokenData.stats6h?.sellVolume ?? 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Organic Buy Vol:</span>
                    <span>${formatNumber(tokenData.stats6h?.buyOrganicVolume ?? 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Organic Sell Vol:</span>
                    <span>${formatNumber(tokenData.stats6h?.sellOrganicVolume ?? 0)}</span>
                  </div>
                </div>
              </div>

              {/* 24 Hours */}
              <div className="space-y-2">
                <h6 className="font-medium text-sm text-primary">24 Hours</h6>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price Change:</span>
                    <span className={(tokenData.stats24h?.priceChange ?? 0) >= 0 ? 'text-success' : 'text-destructive'}>
                      {(tokenData.stats24h?.priceChange ?? 0).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Holder Change:</span>
                    <span className={(tokenData.stats24h?.holderChange ?? 0) >= 0 ? 'text-success' : 'text-destructive'}>
                      {(tokenData.stats24h?.holderChange ?? 0).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Volume Change:</span>
                    <span>{(tokenData.stats24h?.volumeChange ?? 0).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Buy Volume:</span>
                    <span>${formatNumber(tokenData.stats24h?.buyVolume ?? 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sell Volume:</span>
                    <span>${formatNumber(tokenData.stats24h?.sellVolume ?? 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Organic Buy Vol:</span>
                    <span>${formatNumber(tokenData.stats24h?.buyOrganicVolume ?? 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Organic Sell Vol:</span>
                    <span>${formatNumber(tokenData.stats24h?.sellOrganicVolume ?? 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trading Activity Summary */}
          <div>
            <h5 className="font-medium text-foreground mb-3">Trading Activity Summary</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="space-y-4">
                <div>
                  <span className="text-muted-foreground">24h Traders:</span>
                  <div className="font-medium">{tokenData.stats24h?.numTraders ?? 0}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">24h Organic Buyers:</span>
                  <div className="font-medium">{tokenData.stats24h?.numOrganicBuyers ?? 0}</div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="text-muted-foreground">24h Net Buyers:</span>
                  <div className="font-medium">{tokenData.stats24h?.numNetBuyers ?? 0}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">CT Likes:</span>
                  <div className="font-medium">{tokenData.ctLikes ?? 0}</div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="text-muted-foreground">Smart CT Likes:</span>
                  <div className="font-medium">{tokenData.smartCtLikes ?? 0}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Price Block ID:</span>
                  <div className="font-medium">{tokenData.priceBlockId ?? 0}</div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="text-muted-foreground">Dev Migrations:</span>
                  <div className="font-medium">{tokenData.audit?.devMigrations ?? 0}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {tokenData.tags.length > 0 && (
            <div>
              <h5 className="font-medium text-foreground mb-3">Tags</h5>
              <div className="flex flex-wrap gap-2">
                {tokenData.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DashboardCard>
    </div>
  )
}