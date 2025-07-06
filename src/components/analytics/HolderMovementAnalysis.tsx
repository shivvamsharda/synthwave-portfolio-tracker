import { useEffect, useState } from "react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, TrendingUp, TrendingDown, Activity } from "lucide-react"
import { useTokenAnalytics } from "@/hooks/useTokenAnalytics"

interface HolderMovementAnalysisProps {
  tokenMint: string
}

export function HolderMovementAnalysis({ tokenMint }: HolderMovementAnalysisProps) {
  const { holderMovements, loadingMovements, getHolderMovements } = useTokenAnalytics()
  const [timeframe, setTimeframe] = useState<"24h" | "7d" | "30d">("7d")

  useEffect(() => {
    if (tokenMint) {
      getHolderMovements(tokenMint, timeframe)
    }
  }, [tokenMint, timeframe])

  const mockMovements = [
    {
      id: "1",
      walletAddress: "8Gio...K9xM",
      action: "bought",
      fromToken: "USDC",
      toToken: "BONK",
      amount: "1.5M BONK",
      usdValue: 45000,
      timestamp: "2024-01-06T10:30:00Z",
      nextAction: null
    },
    {
      id: "2", 
      walletAddress: "9Hpo...L2nX",
      action: "sold",
      fromToken: "BONK",
      toToken: "SOL",
      amount: "2.1M BONK",
      usdValue: 63000,
      timestamp: "2024-01-06T09:15:00Z",
      nextAction: "Bought JUP"
    },
    {
      id: "3",
      walletAddress: "7Fke...M8yQ",
      action: "bought",
      fromToken: "mSOL",
      toToken: "BONK", 
      amount: "800K BONK",
      usdValue: 24000,
      timestamp: "2024-01-06T08:45:00Z",
      nextAction: null
    }
  ]

  return (
    <div className="space-y-6">
      {/* Timeframe Selection */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Holder Movement Analysis</h2>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">342</div>
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
              <div className="text-2xl font-bold text-foreground">178</div>
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
              <div className="text-2xl font-bold text-foreground">64%</div>
              <div className="text-sm text-muted-foreground">Net Positive Flow</div>
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
              <h3 className="text-lg font-semibold text-foreground">Recent Holder Movements</h3>
              
              <div className="space-y-4">
                {mockMovements.map((movement) => (
                  <div
                    key={movement.id}
                    className="flex items-center justify-between p-4 border border-border/30 rounded-lg hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={movement.action === "bought" ? "default" : "secondary"}>
                          {movement.action}
                        </Badge>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {movement.walletAddress}
                        </code>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">{movement.fromToken}</span>
                        <ArrowRight className="w-3 h-3" />
                        <span className="font-medium">{movement.toToken}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold">{movement.amount}</div>
                      <div className="text-sm text-muted-foreground">${movement.usdValue.toLocaleString()}</div>
                      {movement.nextAction && (
                        <div className="text-xs text-blue-500">→ {movement.nextAction}</div>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {new Date(movement.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DashboardCard>
        </TabsContent>

        <TabsContent value="flow-patterns">
          <DashboardCard className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Common Token Flow Patterns</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">USDC</span>
                      <ArrowRight className="w-3 h-3" />
                      <span className="text-sm font-medium">BONK</span>
                    </div>
                    <Badge variant="outline">Most Common</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-semibold">89 holders</div>
                      <div className="text-xs text-muted-foreground">$2.1M volume</div>
                    </div>
                    <Progress value={75} className="w-20" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-border/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">SOL</span>
                      <ArrowRight className="w-3 h-3" />
                      <span className="text-sm font-medium">BONK</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-semibold">67 holders</div>
                      <div className="text-xs text-muted-foreground">$1.8M volume</div>
                    </div>
                    <Progress value={55} className="w-20" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-border/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">BONK</span>
                      <ArrowRight className="w-3 h-3" />
                      <span className="text-sm font-medium">JUP</span>
                    </div>
                    <Badge variant="secondary">Trending</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-semibold">34 holders</div>
                      <div className="text-xs text-muted-foreground">$890K volume</div>
                    </div>
                    <Progress value={30} className="w-20" />
                  </div>
                </div>
              </div>
            </div>
          </DashboardCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}