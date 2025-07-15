import { useEffect, useState } from "react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, ArrowLeft, Activity, Users, RefreshCw } from "lucide-react"
import { useBitQueryData } from "@/hooks/useBitQueryData"

interface TokenFlowVisualizationProps {
  tokenMint: string
}

export function TokenFlowVisualization({ tokenMint }: TokenFlowVisualizationProps) {
  const { tokenFlows, loading, fetchTokenFlows, refreshAllData } = useBitQueryData()
  const [timeframe, setTimeframe] = useState<"24h" | "7d" | "30d">("24h")

  useEffect(() => {
    if (tokenMint) {
      fetchTokenFlows(tokenMint, timeframe)
    }
  }, [tokenMint, timeframe, fetchTokenFlows])

  const handleRefresh = async () => {
    if (tokenMint) {
      await refreshAllData(tokenMint, timeframe)
    }
  }

  const mockFlowData = {
    inflows: [
      { token: "USDC", volume: 2100000, holders: 234, percentage: 42 },
      { token: "SOL", volume: 1800000, holders: 189, percentage: 36 },
      { token: "mSOL", volume: 680000, holders: 67, percentage: 14 },
      { token: "USDT", volume: 400000, holders: 45, percentage: 8 }
    ],
    outflows: [
      { token: "JUP", volume: 890000, holders: 89, percentage: 35 },
      { token: "SOL", volume: 750000, holders: 76, percentage: 30 },
      { token: "USDC", volume: 560000, holders: 52, percentage: 22 },
      { token: "RAY", volume: 330000, holders: 34, percentage: 13 }
    ],
    netFlow: {
      totalInflow: 4980000,
      totalOutflow: 2530000,
      netPositive: 2450000,
      netPercentage: 96.8
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-foreground">Token Flow Analysis</h2>
          <Badge variant="outline" className="text-green-500 border-green-500">
            Real-time via BitQuery
          </Badge>
        </div>
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

      {/* Net Flow Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <DashboardCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <div className="text-lg font-bold text-foreground">${(tokenFlows.netFlow.totalInflow / 1000000).toFixed(1)}M</div>
              <div className="text-sm text-muted-foreground">Total Inflow</div>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
              <ArrowLeft className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <div className="text-lg font-bold text-foreground">${(tokenFlows.netFlow.totalOutflow / 1000000).toFixed(1)}M</div>
              <div className="text-sm text-muted-foreground">Total Outflow</div>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <div className="text-lg font-bold text-green-500">
                {tokenFlows.netFlow.netAmount >= 0 ? '+' : ''}${(tokenFlows.netFlow.netAmount / 1000000).toFixed(1)}M
              </div>
              <div className="text-sm text-muted-foreground">Net Flow</div>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-purple-500" />
            </div>
            <div>
              <div className="text-lg font-bold text-foreground">
                {tokenFlows.inflows.reduce((sum, flow) => sum + flow.tradeCount, 0) + 
                 tokenFlows.outflows.reduce((sum, flow) => sum + flow.tradeCount, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Trades</div>
            </div>
          </div>
        </DashboardCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inflows */}
        <DashboardCard className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold text-foreground">Token Inflows</h3>
              <Badge variant="outline" className="text-green-500 border-green-500">
                What people sold to buy this token
              </Badge>
            </div>
            
            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : tokenFlows.inflows.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ArrowRight className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No inflow data available</p>
                </div>
              ) : (
                tokenFlows.inflows.map((flow, index) => (
                  <div
                    key={flow.fromToken}
                    className="flex items-center justify-between p-3 border border-border/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{flow.fromSymbol}</div>
                        <div className="text-sm text-muted-foreground">
                          {flow.tradeCount} trades
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold">${(flow.volume / 1000000).toFixed(1)}M</div>
                      <div className="text-sm text-muted-foreground">{flow.percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {!loading && tokenFlows.inflows.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Inflow Distribution</div>
                <div className="flex h-2 rounded-full overflow-hidden">
                  {tokenFlows.inflows.map((flow, index) => (
                    <div
                       key={flow.fromToken}
                      className={`h-full ${
                        index === 0 ? 'bg-green-500' :
                        index === 1 ? 'bg-blue-500' :
                        index === 2 ? 'bg-purple-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${flow.percentage}%` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </DashboardCard>

        {/* Outflows */}
        <DashboardCard className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-semibold text-foreground">Token Outflows</h3>
              <Badge variant="outline" className="text-red-500 border-red-500">
                What people bought after selling this token
              </Badge>
            </div>
            
            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : tokenFlows.outflows.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ArrowLeft className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No outflow data available</p>
                </div>
              ) : (
                tokenFlows.outflows.map((flow, index) => (
                  <div
                    key={flow.toToken}
                    className="flex items-center justify-between p-3 border border-border/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{flow.toSymbol}</div>
                        <div className="text-sm text-muted-foreground">
                          {flow.tradeCount} trades
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold">${(flow.volume / 1000000).toFixed(1)}M</div>
                      <div className="text-sm text-muted-foreground">{flow.percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {!loading && tokenFlows.outflows.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Outflow Distribution</div>
                <div className="flex h-2 rounded-full overflow-hidden">
                  {tokenFlows.outflows.map((flow, index) => (
                    <div
                      key={flow.toToken}
                      className={`h-full ${
                        index === 0 ? 'bg-red-500' :
                        index === 1 ? 'bg-orange-500' :
                        index === 2 ? 'bg-pink-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${flow.percentage}%` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </DashboardCard>
      </div>

      {/* Real-time Flow Analysis */}
      <DashboardCard className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Real-time Flow Analysis</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-border/30 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-green-500">Top Inflow Source</h4>
                <Badge variant="default">
                  {tokenFlows.inflows.length > 0 ? tokenFlows.inflows[0].fromSymbol : 'N/A'}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Volume</span>
                  <span className="font-semibold">
                    ${tokenFlows.inflows.length > 0 ? (tokenFlows.inflows[0].volume / 1000).toFixed(0) : '0'}K
                  </span>
                </div>
                <Progress value={tokenFlows.inflows.length > 0 ? tokenFlows.inflows[0].percentage : 0} />
                <div className="text-xs text-muted-foreground">
                  {tokenFlows.inflows.length > 0 ? tokenFlows.inflows[0].tradeCount : 0} trades
                </div>
              </div>
            </div>

            <div className="p-4 border border-border/30 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-red-500">Top Outflow Target</h4>
                <Badge variant="secondary">
                  {tokenFlows.outflows.length > 0 ? tokenFlows.outflows[0].toSymbol : 'N/A'}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Volume</span>
                  <span className="font-semibold">
                    ${tokenFlows.outflows.length > 0 ? (tokenFlows.outflows[0].volume / 1000).toFixed(0) : '0'}K
                  </span>
                </div>
                <Progress value={tokenFlows.outflows.length > 0 ? tokenFlows.outflows[0].percentage : 0} />
                <div className="text-xs text-muted-foreground">
                  {tokenFlows.outflows.length > 0 ? tokenFlows.outflows[0].tradeCount : 0} trades
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <span className="font-medium">Live Flow Insights</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Net flow: {tokenFlows.netFlow.netPercentage >= 0 ? '+' : ''}{tokenFlows.netFlow.netPercentage.toFixed(1)}%
              ({tokenFlows.netFlow.netPercentage > 0 ? 'Positive inflow' : 'Net outflow'}).
              Total volume: ${((tokenFlows.netFlow.totalInflow + tokenFlows.netFlow.totalOutflow) / 1000000).toFixed(1)}M.
              Data refreshed in real-time via BitQuery GraphQL API.
            </p>
          </div>
        </div>
      </DashboardCard>
    </div>
  )
}