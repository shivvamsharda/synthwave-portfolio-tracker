import { useEffect, useState } from "react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, TrendingUp, TrendingDown, Activity, RefreshCw, DollarSign, Users, ExternalLink } from "lucide-react"
import { useBitQueryData } from "@/hooks/useBitQueryData"

interface HolderMovementAnalysisProps {
  tokenMint: string
}

export function HolderMovementAnalysis({ tokenMint }: HolderMovementAnalysisProps) {
  const { holderMovement, loading, fetchHolderMovementData, refreshAllData } = useBitQueryData()
  const [timeframe, setTimeframe] = useState<"24h" | "7d" | "30d">("24h")

  useEffect(() => {
    if (tokenMint) {
      fetchHolderMovementData(tokenMint, timeframe)
    }
  }, [tokenMint, timeframe, fetchHolderMovementData])

  const handleRefresh = async () => {
    if (tokenMint) {
      await refreshAllData(tokenMint, timeframe)
    }
  }


  return (
    <div className="space-y-6">
      {/* Timeframe Selection */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Holder Movement Analysis</h2>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            disabled={loading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {(["24h", "7d", "30d"] as const).map((period) => (
            <Button
              key={period}
              variant={timeframe === period ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeframe(period)}
              disabled={loading}
            >
              {period}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <DashboardCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{loading ? '...' : holderMovement.newBuyers}</div>
              <div className="text-sm text-muted-foreground">New Buyers</div>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{loading ? '...' : holderMovement.sellers}</div>
              <div className="text-sm text-muted-foreground">Sellers</div>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{loading ? '...' : `${holderMovement.netFlow.toFixed(1)}%`}</div>
              <div className="text-sm text-muted-foreground">Net Positive Flow</div>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-purple-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{loading ? '...' : holderMovement.whaleActivityCount}</div>
              <div className="text-sm text-muted-foreground">Whale Moves</div>
            </div>
          </div>
        </DashboardCard>
      </div>

      <Tabs defaultValue="recent-activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent-activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="flow-patterns">Flow Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="recent-activity">
          <DashboardCard className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Recent Holder Movements</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  Total Volume: ${(holderMovement.totalBuyVolume + holderMovement.totalSellVolume).toLocaleString()}
                </div>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">Analyzing holder movements...</p>
                  </div>
                </div>
              ) : holderMovement.activities.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No recent holder movements found for this timeframe.</p>
                  <p className="text-sm">Real-time data from BitQuery GraphQL API</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {holderMovement.activities.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-border/30 rounded-lg hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Badge variant={activity.action === "bought" ? "default" : "secondary"}>
                            {activity.action}
                          </Badge>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {activity.walletAddress}
                          </code>
                          {activity.isWhale && (
                            <Badge variant="outline" className="text-xs">🐋 Whale</Badge>
                          )}
                          <Badge variant="outline" className="text-xs">{activity.protocol}</Badge>
                        </div>
                        
                        <a
                          href={`https://solscan.io/tx/${activity.signature}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View TX
                        </a>
                      </div>

                      <div className="text-right">
                        <div className="font-semibold">{activity.amount.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">${activity.usdValue.toLocaleString()}</div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DashboardCard>
        </TabsContent>

        <TabsContent value="flow-patterns">
          <DashboardCard className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Token Flow Patterns</h3>
              
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">Analyzing flow patterns...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-border/30 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-green-500">Buy Volume</h4>
                        <Badge variant="default">${(holderMovement.totalBuyVolume / 1000).toFixed(0)}K</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Total Buyers</span>
                          <span className="font-semibold">{holderMovement.newBuyers}</span>
                        </div>
                        <Progress value={holderMovement.totalBuyVolume > 0 ? 75 : 0} />
                      </div>
                    </div>

                    <div className="p-4 border border-border/30 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-red-500">Sell Volume</h4>
                        <Badge variant="secondary">${(holderMovement.totalSellVolume / 1000).toFixed(0)}K</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Total Sellers</span>
                          <span className="font-semibold">{holderMovement.sellers}</span>
                        </div>
                        <Progress value={holderMovement.totalSellVolume > 0 ? 45 : 0} />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">Real-time Flow Analysis</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Net flow: {holderMovement.netFlow > 0 ? '+' : ''}{holderMovement.netFlow.toFixed(1)}% 
                      ({holderMovement.netFlow > 0 ? 'Positive buying pressure' : 'Selling pressure detected'}).
                      Average trade size: ${holderMovement.averageTradeSize.toLocaleString()}.
                      Data powered by BitQuery real-time GraphQL API.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </DashboardCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}