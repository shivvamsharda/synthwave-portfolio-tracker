import { useEffect, useState } from "react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, ArrowLeft, Activity, Users } from "lucide-react"
import { useTokenAnalytics } from "@/hooks/useTokenAnalytics"

interface TokenFlowVisualizationProps {
  tokenMint: string
}

export function TokenFlowVisualization({ tokenMint }: TokenFlowVisualizationProps) {
  const { tokenFlows, loadingFlows, getTokenFlows } = useTokenAnalytics()
  const [timeframe, setTimeframe] = useState<"24h" | "7d" | "30d">("7d")

  useEffect(() => {
    if (tokenMint) {
      getTokenFlows(tokenMint, timeframe)
    }
  }, [tokenMint, timeframe])

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
        <h2 className="text-xl font-semibold text-foreground">Token Flow Analysis</h2>
        <div className="flex gap-2">
          {(["24h", "7d", "30d"] as const).map((period) => (
            <Button
              key={period}
              variant={timeframe === period ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeframe(period)}
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
              <div className="text-lg font-bold text-foreground">${(mockFlowData.netFlow.totalInflow / 1000000).toFixed(1)}M</div>
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
              <div className="text-lg font-bold text-foreground">${(mockFlowData.netFlow.totalOutflow / 1000000).toFixed(1)}M</div>
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
              <div className="text-lg font-bold text-green-500">+${(mockFlowData.netFlow.netPositive / 1000000).toFixed(1)}M</div>
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
              <div className="text-lg font-bold text-foreground">687</div>
              <div className="text-sm text-muted-foreground">Active Traders</div>
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
              {mockFlowData.inflows.map((flow, index) => (
                <div
                  key={flow.token}
                  className="flex items-center justify-between p-3 border border-border/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{flow.token}</div>
                      <div className="text-sm text-muted-foreground">
                        {flow.holders} holders
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold">${(flow.volume / 1000000).toFixed(1)}M</div>
                    <div className="text-sm text-muted-foreground">{flow.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Inflow Distribution</div>
              <div className="flex h-2 rounded-full overflow-hidden">
                {mockFlowData.inflows.map((flow, index) => (
                  <div
                     key={flow.token}
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
              {mockFlowData.outflows.map((flow, index) => (
                <div
                  key={flow.token}
                  className="flex items-center justify-between p-3 border border-border/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{flow.token}</div>
                      <div className="text-sm text-muted-foreground">
                        {flow.holders} holders
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold">${(flow.volume / 1000000).toFixed(1)}M</div>
                    <div className="text-sm text-muted-foreground">{flow.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Outflow Distribution</div>
              <div className="flex h-2 rounded-full overflow-hidden">
                {mockFlowData.outflows.map((flow, index) => (
                  <div
                    key={flow.token}
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
          </div>
        </DashboardCard>
      </div>

      {/* Flow Patterns */}
      <DashboardCard className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Common Flow Patterns</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-border/30 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Stablecoin → BONK → Altcoins</h4>
                <Badge variant="default">Most Common</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>USDC → BONK → JUP</span>
                  <span className="font-semibold">$890K</span>
                </div>
                <Progress value={75} />
                <div className="text-xs text-muted-foreground">89 unique wallets followed this pattern</div>
              </div>
            </div>

            <div className="p-4 border border-border/30 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">SOL → BONK → Hold</h4>
                <Badge variant="secondary">Accumulation</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>SOL → BONK (Hold)</span>
                  <span className="font-semibold">$1.2M</span>
                </div>
                <Progress value={60} />
                <div className="text-xs text-muted-foreground">156 wallets accumulated and held</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <span className="font-medium">Flow Analysis Insight</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Strong net positive flow (+$2.45M) indicates sustained buying pressure. 
              Most holders are converting from USDC and SOL, with many moving to JUP after BONK gains.
            </p>
          </div>
        </div>
      </DashboardCard>
    </div>
  )
}