import { useEffect, useState } from "react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Eye, Wallet, TrendingUp, TrendingDown, AlertTriangle, RefreshCw } from "lucide-react"
import { useWhaleTracking } from "@/hooks/useWhaleTracking"
import { format } from "date-fns"

interface WhaleTrackerProps {
  tokenMint: string
}

export function WhaleTracker({ tokenMint }: WhaleTrackerProps) {
  const { 
    topHolders, 
    whaleActivity, 
    whaleStats, 
    concentrationData, 
    loading, 
    loadAllWhaleData,
    refreshData 
  } = useWhaleTracking()
  const [minHolding, setMinHolding] = useState<number>(100000)

  useEffect(() => {
    if (tokenMint) {
      loadAllWhaleData(tokenMint, minHolding)
    }
  }, [tokenMint, minHolding, loadAllWhaleData])

  const formatWalletAddress = (address: string) => {
    if (address.length < 8) return address
    return `${address.slice(0, 5)}...${address.slice(-4)}`
  }

  const formatTokenAmount = (balance: number, decimals: number = 9) => {
    const adjusted = balance / Math.pow(10, decimals)
    if (adjusted > 1000000) return `${(adjusted / 1000000).toFixed(1)}M`
    if (adjusted > 1000) return `${(adjusted / 1000).toFixed(1)}K`
    return adjusted.toFixed(2)
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-foreground">Whale Tracker</h2>
          <Badge variant="outline" className="text-xs">
            Min: ${minHolding.toLocaleString()}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => refreshData(tokenMint, minHolding)}
            disabled={loading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {[50000, 100000, 250000, 500000].map((amount) => (
            <Button
              key={amount}
              variant={minHolding === amount ? "default" : "outline"}
              size="sm"
              onClick={() => setMinHolding(amount)}
              className="text-xs"
            >
              ${amount / 1000}K+
            </Button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DashboardCard className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{whaleStats.total_whales}</div>
            <div className="text-sm text-muted-foreground">Total Whales</div>
          </div>
        </DashboardCard>
        <DashboardCard className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">+{whaleStats.new_this_week}</div>
            <div className="text-sm text-muted-foreground">New This Week</div>
          </div>
        </DashboardCard>
        <DashboardCard className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{whaleStats.whale_dominance.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Whale Dominance</div>
          </div>
        </DashboardCard>
        <DashboardCard className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">{whaleStats.active_alerts}</div>
            <div className="text-sm text-muted-foreground">Active Alerts</div>
          </div>
        </DashboardCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Holders */}
        <DashboardCard className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Top Holders</h3>
            </div>
            
            <div className="space-y-3">
              {topHolders.slice(0, 10).map((whale) => (
                <div
                  key={whale.id}
                  className="flex items-center justify-between p-3 border border-border/30 rounded-lg hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      #{whale.holder_rank || 0}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs">{formatWalletAddress(whale.wallet_address)}</code>
                        <div className="flex gap-1">
                          {whale.tags?.map((tag) => (
                            <Badge 
                              key={tag} 
                              variant={tag === "Alert" ? "destructive" : "secondary"}
                              className="text-xs px-1 py-0"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTokenAmount(whale.balance)} • {whale.percentage_of_supply?.toFixed(1) || '0'}% of supply
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold">${whale.usd_value?.toLocaleString() || '0'}</div>
                    <div className={`text-xs flex items-center gap-1 ${
                      (whale.change_24h || 0) > 0 ? 'text-green-500' : 
                      (whale.change_24h || 0) < 0 ? 'text-red-500' : 'text-muted-foreground'
                    }`}>
                      {(whale.change_24h || 0) > 0 ? <TrendingUp className="w-3 h-3" /> : 
                       (whale.change_24h || 0) < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                      {whale.change_24h !== 0 && `${(whale.change_24h || 0) > 0 ? '+' : ''}${whale.change_24h?.toFixed(1) || '0'}%`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DashboardCard>

        {/* Recent Whale Activity */}
        <DashboardCard className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
            </div>
            
            <div className="space-y-3">
              {whaleActivity.slice(0, 10).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 border border-border/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.impact_level === 'high' ? 'bg-red-500' :
                      activity.impact_level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={activity.transaction_type.includes('buy') ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {activity.transaction_type}
                        </Badge>
                        <code className="text-xs">{formatWalletAddress(activity.wallet_address)}</code>
                      </div>
                      <div className="text-sm font-medium">
                        {formatTokenAmount(activity.amount_to || activity.amount_from || 0)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold">${activity.usd_value?.toLocaleString() || '0'}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Whale Concentration Analysis */}
      <DashboardCard className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Whale Concentration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Top 10 Holders</span>
                <span className="font-semibold">{concentrationData.top_10_percentage.toFixed(1)}%</span>
              </div>
              <Progress value={concentrationData.top_10_percentage} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Top 50 Holders</span>
                <span className="font-semibold">{concentrationData.top_50_percentage.toFixed(1)}%</span>
              </div>
              <Progress value={concentrationData.top_50_percentage} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Top 100 Holders</span>
                <span className="font-semibold">{concentrationData.top_100_percentage.toFixed(1)}%</span>
              </div>
              <Progress value={concentrationData.top_100_percentage} className="h-2" />
            </div>
          </div>

          {concentrationData.risk_level === 'high' && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">High Concentration Risk</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Top 50 holders control {concentrationData.top_50_percentage.toFixed(1)}% of the token supply. Large movements could significantly impact price.
              </p>
            </div>
          )}
        </div>
      </DashboardCard>
    </div>
  )
}