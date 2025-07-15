import { useEffect, useState } from "react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Eye, Wallet, TrendingUp, TrendingDown, AlertTriangle, RefreshCw, ExternalLink, Zap, Activity, Users } from "lucide-react"
import { useBitQueryData } from "@/hooks/useBitQueryData"
import { format } from "date-fns"

interface WhaleTrackerProps {
  tokenMint: string
}

export function WhaleTracker({ tokenMint }: WhaleTrackerProps) {
  const { whaleActivities, loading, fetchWhaleActivity, refreshAllData } = useBitQueryData()
  const [minHolding, setMinHolding] = useState<number>(10000)

  useEffect(() => {
    if (tokenMint) {
      fetchWhaleActivity(tokenMint, minHolding)
    }
  }, [tokenMint, minHolding, fetchWhaleActivity])

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

  // DEX/Protocol color mapping
  const getDexColors = (protocol: string) => {
    const protocolLower = protocol.toLowerCase()
    
    if (protocolLower.includes('jupiter')) {
      return {
        bg: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20',
        border: 'border-yellow-500/30',
        text: 'text-yellow-600',
        badge: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
        icon: 'text-yellow-500'
      }
    } else if (protocolLower.includes('raydium')) {
      return {
        bg: 'bg-gradient-to-r from-blue-500/20 to-purple-500/20',
        border: 'border-blue-500/30',
        text: 'text-blue-600',
        badge: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
        icon: 'text-blue-500'
      }
    } else if (protocolLower.includes('orca')) {
      return {
        bg: 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20',
        border: 'border-teal-500/30',
        text: 'text-teal-600',
        badge: 'bg-teal-500/20 text-teal-700 border-teal-500/30',
        icon: 'text-teal-500'
      }
    } else if (protocolLower.includes('serum')) {
      return {
        bg: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20',
        border: 'border-green-500/30',
        text: 'text-green-600',
        badge: 'bg-green-500/20 text-green-700 border-green-500/30',
        icon: 'text-green-500'
      }
    } else if (protocolLower.includes('openbook')) {
      return {
        bg: 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20',
        border: 'border-indigo-500/30',
        text: 'text-indigo-600',
        badge: 'bg-indigo-500/20 text-indigo-700 border-indigo-500/30',
        icon: 'text-indigo-500'
      }
    } else if (protocolLower.includes('pump')) {
      return {
        bg: 'bg-gradient-to-r from-pink-500/20 to-rose-500/20',
        border: 'border-pink-500/30',
        text: 'text-pink-600',
        badge: 'bg-pink-500/20 text-pink-700 border-pink-500/30',
        icon: 'text-pink-500'
      }
    } else {
      return {
        bg: 'bg-gradient-to-r from-gray-500/20 to-slate-500/20',
        border: 'border-gray-500/30',
        text: 'text-gray-600',
        badge: 'bg-gray-500/20 text-gray-700 border-gray-500/30',
        icon: 'text-gray-500'
      }
    }
  }

  const getProtocolIcon = (protocol: string) => {
    const protocolLower = protocol.toLowerCase()
    
    if (protocolLower.includes('jupiter')) return <Zap className="w-3 h-3" />
    if (protocolLower.includes('raydium')) return <Activity className="w-3 h-3" />
    if (protocolLower.includes('orca')) return <Eye className="w-3 h-3" />
    if (protocolLower.includes('serum')) return <TrendingUp className="w-3 h-3" />
    if (protocolLower.includes('openbook')) return <Users className="w-3 h-3" />
    if (protocolLower.includes('pump')) return <TrendingDown className="w-3 h-3" />
    
    return <Activity className="w-3 h-3" />
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
            onClick={() => refreshAllData(tokenMint, '24h', minHolding)}
            disabled={loading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {[1000, 10000, 50000, 100000].map((amount) => (
            <Button
              key={amount}
              variant={minHolding === amount ? "default" : "outline"}
              size="sm"
              onClick={() => setMinHolding(amount)}
              className="text-xs"
            >
              ${amount >= 1000 ? `${amount / 1000}K+` : `$${amount}+`}
            </Button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DashboardCard className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{whaleActivities.length}</div>
            <div className="text-sm text-muted-foreground">Active Whales</div>
          </div>
        </DashboardCard>
        <DashboardCard className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">{whaleActivities.filter(w => w.tradeType === 'buy').length}</div>
            <div className="text-sm text-muted-foreground">Whale Buys</div>
          </div>
        </DashboardCard>
        <DashboardCard className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">{whaleActivities.filter(w => w.tradeType === 'sell').length}</div>
            <div className="text-sm text-muted-foreground">Whale Sells</div>
          </div>
        </DashboardCard>
        <DashboardCard className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">{whaleActivities.filter(w => w.impact === 'high').length}</div>
            <div className="text-sm text-muted-foreground">High Impact</div>
          </div>
        </DashboardCard>
      </div>

      {/* Real-time Whale Activity */}
      <DashboardCard className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Live Whale Activity</h3>
            <Badge variant="outline" className="text-green-500 border-green-500">
              Real-time via BitQuery
            </Badge>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Loading whale activity...</p>
              </div>
            </div>
          ) : whaleActivities.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No whale activity found above ${minHolding.toLocaleString()}</p>
              <p className="text-sm">Try lowering the minimum threshold</p>
            </div>
          ) : (
            <div className="space-y-3">
              {whaleActivities.map((activity, index) => {
                const dexColors = getDexColors(activity.protocol)
                const protocolIcon = getProtocolIcon(activity.protocol)
                
                return (
                  <div
                    key={index}
                    className={`relative p-4 rounded-xl border-2 ${dexColors.border} ${dexColors.bg} 
                      hover:shadow-lg hover:scale-[1.02] transition-all duration-300 animate-fade-in`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* DEX indicator line */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${dexColors.icon.replace('text-', 'bg-')}`} />
                    
                    {/* Impact indicator */}
                    <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
                      activity.impact === 'high' ? 'bg-red-500 animate-pulse' :
                      activity.impact === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {/* Trade type badge */}
                          <Badge 
                            variant={activity.tradeType === 'buy' ? 'default' : 'secondary'}
                            className={`${activity.tradeType === 'buy' ? 'bg-green-500/20 text-green-700 border-green-500/30' : 'bg-red-500/20 text-red-700 border-red-500/30'} 
                              px-3 py-1 text-xs font-medium hover:scale-105 transition-transform`}
                          >
                            {activity.tradeType === 'buy' ? '📈' : '📉'} {activity.tradeType}
                          </Badge>
                          
                          {/* Wallet address */}
                          <div className="flex items-center gap-1 bg-muted/80 px-3 py-1 rounded-lg">
                            <code className="text-xs font-mono text-foreground">
                              {activity.walletAddress}
                            </code>
                          </div>
                          
                          {/* Protocol badge with icon */}
                          <Badge 
                            variant="outline" 
                            className={`${dexColors.badge} text-xs px-2 py-1 flex items-center gap-1.5 font-medium border-2 hover:scale-105 transition-transform`}
                          >
                            <span className={dexColors.icon}>
                              {protocolIcon}
                            </span>
                            {activity.protocol}
                          </Badge>
                          
                          {/* Impact badge */}
                          <Badge 
                            variant="outline" 
                            className={`text-xs px-2 py-1 border-2 ${
                              activity.impact === 'high' ? 'bg-red-500/20 text-red-700 border-red-500/30 animate-pulse' :
                              activity.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30' : 
                              'bg-green-500/20 text-green-700 border-green-500/30'
                            }`}
                          >
                            {activity.impact === 'high' ? '🔥' : activity.impact === 'medium' ? '⚡' : '✨'} {activity.impact}
                          </Badge>
                        </div>
                        
                        {/* Transaction link */}
                        <a
                          href={`https://solscan.io/tx/${activity.signature}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs ${dexColors.text} 
                            hover:bg-white/20 transition-colors hover:scale-105`}
                        >
                          <ExternalLink className="w-3 h-3" />
                          View TX
                        </a>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Token amount */}
                        <div className="text-right">
                          <div className="text-sm font-medium text-muted-foreground">
                            {typeof activity.tokenAmount === 'number' ? activity.tokenAmount.toFixed(2) : '0.00'} tokens
                          </div>
                          <div className="font-bold text-lg text-foreground">
                            ${typeof activity.usdAmount === 'number' ? activity.usdAmount.toLocaleString() : '0'}
                          </div>
                        </div>
                        
                        {/* Timestamp */}
                        <div className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                          {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </DashboardCard>

      {/* Whale Impact Analysis */}
      <DashboardCard className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Whale Impact Analysis</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>High Impact Trades</span>
                <span className="font-semibold">{whaleActivities.filter(w => w.impact === 'high').length}</span>
              </div>
              <Progress value={whaleActivities.length > 0 ? (whaleActivities.filter(w => w.impact === 'high').length / whaleActivities.length) * 100 : 0} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Medium Impact</span>
                <span className="font-semibold">{whaleActivities.filter(w => w.impact === 'medium').length}</span>
              </div>
              <Progress value={whaleActivities.length > 0 ? (whaleActivities.filter(w => w.impact === 'medium').length / whaleActivities.length) * 100 : 0} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Low Impact</span>
                <span className="font-semibold">{whaleActivities.filter(w => w.impact === 'low').length}</span>
              </div>
              <Progress value={whaleActivities.length > 0 ? (whaleActivities.filter(w => w.impact === 'low').length / whaleActivities.length) * 100 : 0} className="h-2" />
            </div>
          </div>

          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Real-time Whale Monitoring</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Live whale activity tracking powered by BitQuery GraphQL API. 
              Monitoring trades above ${minHolding.toLocaleString()} with automatic impact classification.
            </p>
          </div>
        </div>
      </DashboardCard>
    </div>
  )
}