import { useEffect, useState } from "react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Eye, Wallet, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"
import { useTokenAnalytics } from "@/hooks/useTokenAnalytics"

interface WhaleTrackerProps {
  tokenMint: string
}

export function WhaleTracker({ tokenMint }: WhaleTrackerProps) {
  const { topHolders, whaleActivity, loadingWhales, getTopHolders, getWhaleActivity } = useTokenAnalytics()
  const [minHolding, setMinHolding] = useState<number>(100000) // $100k minimum

  useEffect(() => {
    if (tokenMint) {
      getTopHolders(tokenMint, 50)
      getWhaleActivity(tokenMint, minHolding)
    }
  }, [tokenMint, minHolding])

  const mockWhales = [
    {
      id: "1",
      walletAddress: "5Q3pE...7Xm2",
      balance: "15.2M BONK",
      usdValue: 456000,
      percentageOfSupply: 2.8,
      rank: 1,
      recentActivity: "Bought 2.1M more",
      activityType: "buy",
      change24h: 15.7,
      tags: ["Smart Money", "Early Holder"]
    },
    {
      id: "2",
      walletAddress: "8Rt9A...9Kp1",
      balance: "12.8M BONK", 
      usdValue: 384000,
      percentageOfSupply: 2.3,
      rank: 2,
      recentActivity: "Sold 800K tokens",
      activityType: "sell",
      change24h: -6.2,
      tags: ["Whale"]
    },
    {
      id: "3",
      walletAddress: "3Hn7K...5Lq8",
      balance: "9.4M BONK",
      usdValue: 282000,
      percentageOfSupply: 1.7,
      rank: 3,
      recentActivity: "Holding steady",
      activityType: "hold",
      change24h: 0,
      tags: ["Diamond Hands"]
    },
    {
      id: "4",
      walletAddress: "7Wp2M...4Rs6",
      balance: "7.9M BONK",
      usdValue: 237000,
      percentageOfSupply: 1.4,
      rank: 4,
      recentActivity: "Large buy alert",
      activityType: "buy",
      change24h: 28.3,
      tags: ["New Whale", "Alert"]
    }
  ]

  const recentWhaleActivity = [
    {
      id: "1",
      wallet: "5Q3pE...7Xm2",
      action: "Large Buy",
      amount: "2.1M BONK",
      usdValue: 63000,
      timestamp: "2 hours ago",
      impact: "high"
    },
    {
      id: "2",
      wallet: "7Wp2M...4Rs6", 
      action: "New Position",
      amount: "1.8M BONK",
      usdValue: 54000,
      timestamp: "4 hours ago",
      impact: "medium"
    },
    {
      id: "3",
      wallet: "8Rt9A...9Kp1",
      action: "Partial Sale",
      amount: "800K BONK",
      usdValue: 24000,
      timestamp: "6 hours ago",
      impact: "low"
    }
  ]

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
            <div className="text-2xl font-bold text-foreground">47</div>
            <div className="text-sm text-muted-foreground">Total Whales</div>
          </div>
        </DashboardCard>
        <DashboardCard className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">+12</div>
            <div className="text-sm text-muted-foreground">New This Week</div>
          </div>
        </DashboardCard>
        <DashboardCard className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">68%</div>
            <div className="text-sm text-muted-foreground">Whale Dominance</div>
          </div>
        </DashboardCard>
        <DashboardCard className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">5</div>
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
              {mockWhales.map((whale) => (
                <div
                  key={whale.id}
                  className="flex items-center justify-between p-3 border border-border/30 rounded-lg hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      #{whale.rank}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs">{whale.walletAddress}</code>
                        <div className="flex gap-1">
                          {whale.tags.map((tag) => (
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
                        {whale.balance} • {whale.percentageOfSupply}% of supply
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold">${whale.usdValue.toLocaleString()}</div>
                    <div className={`text-xs flex items-center gap-1 ${
                      whale.change24h > 0 ? 'text-green-500' : 
                      whale.change24h < 0 ? 'text-red-500' : 'text-muted-foreground'
                    }`}>
                      {whale.change24h > 0 ? <TrendingUp className="w-3 h-3" /> : 
                       whale.change24h < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                      {whale.change24h !== 0 && `${whale.change24h > 0 ? '+' : ''}${whale.change24h}%`}
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
              {recentWhaleActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 border border-border/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.impact === 'high' ? 'bg-red-500' :
                      activity.impact === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={activity.action.includes('Buy') ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {activity.action}
                        </Badge>
                        <code className="text-xs">{activity.wallet}</code>
                      </div>
                      <div className="text-sm font-medium">{activity.amount}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold">${activity.usdValue.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{activity.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full">
              View All Activity
            </Button>
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
                <span className="font-semibold">45.2%</span>
              </div>
              <Progress value={45.2} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Top 50 Holders</span>
                <span className="font-semibold">68.7%</span>
              </div>
              <Progress value={68.7} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Top 100 Holders</span>
                <span className="font-semibold">82.3%</span>
              </div>
              <Progress value={82.3} className="h-2" />
            </div>
          </div>

          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">High Concentration Risk</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Top 50 holders control 68.7% of the token supply. Large movements could significantly impact price.
            </p>
          </div>
        </div>
      </DashboardCard>
    </div>
  )
}