import { useEffect, useState, useMemo } from "react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, TrendingUp, TrendingDown, Activity, RefreshCw, DollarSign, Users, ExternalLink, Eye, Zap, Filter, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { useBitQueryData } from "@/hooks/useBitQueryData"

interface HolderMovementAnalysisProps {
  tokenMint: string
}

export function HolderMovementAnalysis({ tokenMint }: HolderMovementAnalysisProps) {
  const { holderMovement, loading, fetchHolderMovementData, refreshAllData } = useBitQueryData()
  const [timeframe, setTimeframe] = useState<"24h" | "7d" | "30d">("24h")
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [actionFilter, setActionFilter] = useState<"all" | "bought" | "sold">("all")
  const [protocolFilter, setProtocolFilter] = useState<string>("all")
  const [minAmount, setMinAmount] = useState<string>("")
  const [maxAmount, setMaxAmount] = useState<string>("")
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    if (tokenMint) {
      fetchHolderMovementData(tokenMint, timeframe)
    }
  }, [tokenMint, timeframe, fetchHolderMovementData])

  const handleRefresh = async () => {
    if (tokenMint) {
      await refreshAllData(tokenMint, timeframe)
      setCurrentPage(1) // Reset to first page
    }
  }

  // Get unique protocols for filter dropdown
  const uniqueProtocols = useMemo(() => {
    const protocols = new Set(holderMovement.activities.map(activity => activity.protocol))
    return Array.from(protocols)
  }, [holderMovement.activities])

  // Filter and paginate activities
  const filteredActivities = useMemo(() => {
    let filtered = holderMovement.activities

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(activity =>
        activity.walletAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.protocol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.signature.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Action filter
    if (actionFilter !== "all") {
      filtered = filtered.filter(activity => activity.action === actionFilter)
    }

    // Protocol filter
    if (protocolFilter !== "all") {
      filtered = filtered.filter(activity => activity.protocol === protocolFilter)
    }

    // Amount range filter
    if (minAmount) {
      const min = parseFloat(minAmount)
      if (!isNaN(min)) {
        filtered = filtered.filter(activity => activity.usdValue >= min)
      }
    }

    if (maxAmount) {
      const max = parseFloat(maxAmount)
      if (!isNaN(max)) {
        filtered = filtered.filter(activity => activity.usdValue <= max)
      }
    }

    return filtered
  }, [holderMovement.activities, searchQuery, actionFilter, protocolFilter, minAmount, maxAmount])

  // Paginate filtered activities
  const paginatedActivities = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredActivities.slice(startIndex, endIndex)
  }, [filteredActivities, currentPage, itemsPerPage])

  // Calculate pagination info
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage)
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, filteredActivities.length)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, actionFilter, protocolFilter, minAmount, maxAmount])

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("")
    setActionFilter("all")
    setProtocolFilter("all")
    setMinAmount("")
    setMaxAmount("")
    setCurrentPage(1)
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
    if (protocolLower.includes('pump')) return <ArrowRight className="w-3 h-3" />
    
    return <Activity className="w-3 h-3" />
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
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Recent Holder Movements</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  Total Volume: ${(holderMovement.totalBuyVolume + holderMovement.totalSellVolume).toLocaleString()}
                </div>
              </div>

              {/* Filters Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Filters</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="ml-auto text-xs"
                  >
                    Clear All
                  </Button>
                </div>

                {/* Filter Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                  {/* Search Filter */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search wallets, protocols..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {/* Action Filter */}
                  <Select value={actionFilter} onValueChange={(value) => setActionFilter(value as "all" | "bought" | "sold")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      <SelectItem value="bought">Bought</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Protocol Filter */}
                  <Select value={protocolFilter} onValueChange={setProtocolFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Protocol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Protocols</SelectItem>
                      {uniqueProtocols.map((protocol) => (
                        <SelectItem key={protocol} value={protocol}>
                          {protocol}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Min Amount Filter */}
                  <Input
                    type="number"
                    placeholder="Min USD"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                  />

                  {/* Max Amount Filter */}
                  <Input
                    type="number"
                    placeholder="Max USD"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                  />
                </div>

                {/* Results Info */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    Showing {filteredActivities.length > 0 ? startItem : 0} - {endItem} of {filteredActivities.length} results
                  </span>
                  <span>
                    Page {currentPage} of {totalPages || 1}
                  </span>
                </div>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">Analyzing holder movements...</p>
                  </div>
                </div>
              ) : filteredActivities.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No movements found matching your filters.</p>
                  <p className="text-sm">Try adjusting your filter criteria</p>
                </div>
              ) : (
                <>
                  {/* Activities List with Better Alignment */}
                  <div className="space-y-2">
                    {/* Header Row */}
                    <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-muted-foreground border-b border-border/30">
                      <div className="col-span-2">Action</div>
                      <div className="col-span-3">Wallet</div>
                      <div className="col-span-2">Protocol</div>
                      <div className="col-span-2">Amount</div>
                      <div className="col-span-2">USD Value</div>
                      <div className="col-span-1">Time</div>
                    </div>

                    {/* Activity Rows */}
                    {paginatedActivities.map((activity, index) => {
                      const dexColors = getDexColors(activity.protocol)
                      const protocolIcon = getProtocolIcon(activity.protocol)
                      
                      return (
                        <div
                          key={index}
                          className={`grid grid-cols-12 gap-4 p-4 rounded-lg border ${dexColors.border} ${dexColors.bg} 
                            hover:shadow-md transition-all duration-200 items-center animate-fade-in`}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          {/* Action Column */}
                          <div className="col-span-2">
                            <Badge 
                              variant={activity.action === "bought" ? "default" : "secondary"}
                              className={`${activity.action === "bought" ? 'bg-green-500/20 text-green-700 border-green-500/30' : 'bg-red-500/20 text-red-700 border-red-500/30'} 
                                text-xs font-medium`}
                            >
                              {activity.action === "bought" ? "🟢" : "🔴"} {activity.action}
                            </Badge>
                          </div>

                          {/* Wallet Column */}
                          <div className="col-span-3">
                            <div className="flex items-center gap-2">
                              <code className="text-xs font-mono bg-muted/60 px-2 py-1 rounded">
                                {activity.walletAddress}
                              </code>
                              {activity.isWhale && (
                                <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-700 border-blue-500/30">
                                  🐋
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Protocol Column */}
                          <div className="col-span-2">
                            <Badge 
                              variant="outline" 
                              className={`${dexColors.badge} text-xs px-2 py-1 flex items-center gap-1.5 font-medium border w-fit`}
                            >
                              <span className={dexColors.icon}>
                                {protocolIcon}
                              </span>
                              {activity.protocol}
                            </Badge>
                          </div>

                          {/* Amount Column */}
                          <div className="col-span-2">
                            <div className="text-sm font-medium text-foreground">
                              {typeof activity.amount === 'number' ? activity.amount.toFixed(2) : '0.00'}
                            </div>
                          </div>

                          {/* USD Value Column */}
                          <div className="col-span-2">
                            <div className="text-sm font-semibold text-foreground">
                              ${typeof activity.usdValue === 'number' ? activity.usdValue.toLocaleString() : '0'}
                            </div>
                          </div>

                          {/* Time Column */}
                          <div className="col-span-1 flex items-center gap-2">
                            <div className="text-xs text-muted-foreground">
                              {new Date(activity.timestamp).toLocaleTimeString()}
                            </div>
                            <a
                              href={`https://solscan.io/tx/${activity.signature}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center gap-1 px-1 py-1 rounded text-xs ${dexColors.text} 
                                hover:bg-white/20 transition-colors`}
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-border/30">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </Button>

                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                            return (
                              <Button
                                key={pageNum}
                                variant={pageNum === currentPage ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(pageNum)}
                                className="w-8 h-8 p-0"
                              >
                                {pageNum}
                              </Button>
                            )
                          })}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {itemsPerPage} items per page
                      </div>
                    </div>
                  )}
                </>
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