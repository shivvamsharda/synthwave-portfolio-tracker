import { useState, useEffect } from "react"
import { Header } from "@/components/layout/Header"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, 
  TrendingUp, 
  Users, 
  Globe, 
  BarChart3, 
  Activity, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap
} from "lucide-react"
import { jupiterUltraService } from "@/services/jupiterUltraService"
import { heliusService } from "@/services/heliusService"
import { birdeyeService } from "@/services/birdeyeService"
import { coingeckoService } from "@/services/coingeckoService"
import { santimentService } from "@/services/santimentService"
import { lunarcrushService } from "@/services/lunarcrushService"
import { useApiKeys } from "@/hooks/useApiKeys"

interface MultiSourceAnalyticsPageProps {
  onNavigate?: (page: "dashboard" | "wallets" | "nfts" | "yield" | "analytics" | "settings") => void
}

interface ApiStatus {
  helius: 'ready' | 'loading' | 'error' | 'missing-key'
  birdeye: 'ready' | 'loading' | 'error' | 'missing-key'
  coingecko: 'ready' | 'loading' | 'error' | 'missing-key'
  santiment: 'ready' | 'loading' | 'error' | 'missing-key'
  lunarcrush: 'ready' | 'loading' | 'error' | 'missing-key'
}

interface TokenAnalyticsData {
  jupiter?: any
  helius?: any
  birdeye?: any
  coingecko?: any
  santiment?: any
  lunarcrush?: any
}

export function MultiSourceAnalyticsPage({ onNavigate }: MultiSourceAnalyticsPageProps) {
  const [selectedToken, setSelectedToken] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [searching, setSearching] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [analyticsData, setAnalyticsData] = useState<TokenAnalyticsData>({})
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('7d')
  
  const { apiKeys, hasApiKey, getApiKey, loading: apiKeysLoading } = useApiKeys()

  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    helius: 'loading',
    birdeye: 'loading', 
    coingecko: 'ready',
    santiment: 'loading',
    lunarcrush: 'loading'
  })

  // Update API status based on available keys
  useEffect(() => {
    if (!apiKeysLoading) {
      setApiStatus({
        helius: hasApiKey('helius') ? 'ready' : 'missing-key',
        birdeye: hasApiKey('birdeye') ? 'ready' : 'missing-key',
        coingecko: 'ready', // CoinGecko has free tier
        santiment: hasApiKey('santiment') ? 'ready' : 'missing-key',
        lunarcrush: hasApiKey('lunarcrush') ? 'ready' : 'missing-key'
      })
    }
  }, [apiKeys, apiKeysLoading, hasApiKey])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setSearching(true)
    setAnalyticsData({})
    
    try {
      // Search with Jupiter (always available)
      const jupiterResults = await jupiterUltraService.searchToken(searchQuery)
      if (jupiterResults.length > 0) {
        setSelectedToken(jupiterResults[0].id)
        setAnalyticsData(prev => ({ ...prev, jupiter: jupiterResults[0] }))
        
        // Load data from other sources
        await loadMultiSourceData(jupiterResults[0].id, jupiterResults[0].symbol)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setSearching(false)
    }
  }

  const loadMultiSourceData = async (mintAddress: string, symbol: string) => {
    const promises = []

    // Helius data (if API key available)
    if (apiStatus.helius === 'ready' && hasApiKey('helius')) {
      promises.push(
        heliusService.getTokenMetadata(mintAddress, getApiKey('helius')!)
          .then(data => setAnalyticsData(prev => ({ ...prev, helius: data })))
          .catch(() => setApiStatus(prev => ({ ...prev, helius: 'error' })))
      )
    }

    // Birdeye data (if API key available)
    if (apiStatus.birdeye === 'ready' && hasApiKey('birdeye')) {
      promises.push(
        birdeyeService.getTokenOverview(mintAddress, getApiKey('birdeye')!)
          .then(data => setAnalyticsData(prev => ({ ...prev, birdeye: data })))
          .catch(() => setApiStatus(prev => ({ ...prev, birdeye: 'error' })))
      )
    }

    // CoinGecko data (free tier)
    promises.push(
      coingeckoService.getTokenByContract(mintAddress, 'solana', getApiKey('coingecko'))
        .then(data => setAnalyticsData(prev => ({ ...prev, coingecko: data })))
        .catch(() => setApiStatus(prev => ({ ...prev, coingecko: 'error' })))
    )

    // Santiment data (if API key available)
    if (apiStatus.santiment === 'ready' && hasApiKey('santiment')) {
      promises.push(
        santimentService.getSocialMetrics(`solana-${symbol.toLowerCase()}`, getApiKey('santiment')!, selectedTimeframe)
          .then(data => setAnalyticsData(prev => ({ ...prev, santiment: data })))
          .catch(() => setApiStatus(prev => ({ ...prev, santiment: 'error' })))
      )
    }

    // LunarCrush data (if API key available)
    if (apiStatus.lunarcrush === 'ready' && hasApiKey('lunarcrush')) {
      promises.push(
        lunarcrushService.getTokenData(symbol, getApiKey('lunarcrush')!)
          .then(data => setAnalyticsData(prev => ({ ...prev, lunarcrush: data })))
          .catch(() => setApiStatus(prev => ({ ...prev, lunarcrush: 'error' })))
      )
    }

    await Promise.allSettled(promises)
  }

  const handleRefresh = async () => {
    if (!selectedToken) return
    
    setRefreshing(true)
    try {
      // Clear all caches
      jupiterUltraService.clearCache()
      heliusService.clearCache()
      birdeyeService.clearCache()
      coingeckoService.clearCache()
      santimentService.clearCache()
      lunarcrushService.clearCache()
      
      // Reload data
      const jupiterResults = await jupiterUltraService.searchToken(selectedToken)
      if (jupiterResults.length > 0) {
        await loadMultiSourceData(selectedToken, jupiterResults[0].symbol)
      }
    } catch (error) {
      console.error('Refresh error:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'loading': return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'missing-key': return <Zap className="w-4 h-4 text-orange-500" />
      default: return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready': return 'Connected'
      case 'loading': return 'Loading'
      case 'error': return 'Error'
      case 'missing-key': return 'API Key Required'
      default: return 'Unknown'
    }
  }

  const popularTokens = [
    { mint: "So11111111111111111111111111111111111111112", symbol: "SOL", name: "Solana" },
    { mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", symbol: "USDC", name: "USD Coin" },
    { mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", symbol: "BONK", name: "Bonk" },
    { mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", symbol: "JUP", name: "Jupiter" }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header onNavigate={onNavigate} />
      
      <main className="container px-4 py-8 space-y-8">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Multi-Source Analytics</h1>
              <p className="text-muted-foreground">Comprehensive token analysis from multiple data providers</p>
            </div>
          </div>

          {/* API Status Dashboard */}
          <DashboardCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Data Sources Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(apiStatus).map(([api, status]) => (
                <div key={api} className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                  {getStatusIcon(status)}
                  <div className="flex-1">
                    <p className="font-medium capitalize">{api}</p>
                    <p className="text-xs text-muted-foreground">{getStatusText(status)}</p>
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>

          {/* Search Section */}
          <DashboardCard className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search token by mint address or symbol..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1d">1 Day</SelectItem>
                    <SelectItem value="7d">7 Days</SelectItem>
                    <SelectItem value="30d">30 Days</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleSearch}
                  disabled={!searchQuery.trim() || searching}
                >
                  {searching ? "Searching..." : "Analyze"}
                </Button>
              </div>

              {/* Popular Tokens */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Popular Tokens</h3>
                <div className="flex flex-wrap gap-2">
                  {popularTokens.map((token) => (
                    <Button
                      key={token.mint}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedToken(token.mint)
                        setSearchQuery(token.symbol)
                      }}
                      className="text-xs"
                    >
                      {token.symbol}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </DashboardCard>
        </div>

        {selectedToken ? (
          <div className="space-y-6">
            {/* Controls */}
            <div className="flex justify-end">
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh All Data'}
              </Button>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="price-data" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Price Data
                </TabsTrigger>
                <TabsTrigger value="social" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Social
                </TabsTrigger>
                <TabsTrigger value="on-chain" className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  On-Chain
                </TabsTrigger>
                <TabsTrigger value="comparison" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Cross-Source
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Jupiter Ultra Data */}
                  {analyticsData.jupiter && (
                    <DashboardCard className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Badge variant="secondary">Jupiter Ultra</Badge>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold">{analyticsData.jupiter.name}</h3>
                        <p className="text-sm text-muted-foreground">{analyticsData.jupiter.symbol}</p>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Price</p>
                            <p className="font-medium">${analyticsData.jupiter.usdPrice?.toFixed(6) || '0'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">24h Change</p>
                            <p className={`font-medium ${analyticsData.jupiter.stats24h?.priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {analyticsData.jupiter.stats24h?.priceChange?.toFixed(2) || '0'}%
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Market Cap</p>
                            <p className="font-medium">${analyticsData.jupiter.mcap?.toLocaleString() || '0'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Holders</p>
                            <p className="font-medium">{analyticsData.jupiter.holderCount?.toLocaleString() || '0'}</p>
                          </div>
                        </div>
                      </div>
                    </DashboardCard>
                  )}

                  {/* CoinGecko Data */}
                  {analyticsData.coingecko && (
                    <DashboardCard className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Badge variant="secondary">CoinGecko</Badge>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold">{analyticsData.coingecko.name}</h3>
                        <p className="text-sm text-muted-foreground">{analyticsData.coingecko.symbol?.toUpperCase()}</p>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Price USD</p>
                            <p className="font-medium">${analyticsData.coingecko.market_data?.current_price?.usd?.toFixed(6) || '0'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">24h Change</p>
                            <p className={`font-medium ${analyticsData.coingecko.market_data?.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {analyticsData.coingecko.market_data?.price_change_percentage_24h?.toFixed(2) || '0'}%
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Market Cap</p>
                            <p className="font-medium">${analyticsData.coingecko.market_data?.market_cap?.usd?.toLocaleString() || '0'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Volume 24h</p>
                            <p className="font-medium">${analyticsData.coingecko.market_data?.total_volume?.usd?.toLocaleString() || '0'}</p>
                          </div>
                        </div>
                      </div>
                    </DashboardCard>
                  )}

                  {/* API Status Cards */}
                  {Object.entries(apiStatus).map(([api, status]) => (
                    status === 'missing-key' && (
                      <DashboardCard key={api} className="p-6 border-dashed">
                        <div className="text-center space-y-4">
                          <Zap className="w-8 h-8 text-orange-500 mx-auto" />
                          <div>
                            <h3 className="font-semibold capitalize">{api} API</h3>
                            <p className="text-sm text-muted-foreground">API key required to unlock {api} data</p>
                          </div>
                          <Button variant="outline" size="sm">
                            Configure API Key
                          </Button>
                        </div>
                      </DashboardCard>
                    )
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="price-data">
                <DashboardCard className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Price Data Comparison</h3>
                  <div className="text-center text-muted-foreground">
                    <p>Price data from multiple sources will be displayed here</p>
                    <p className="text-sm mt-2">Configure API keys to enable price comparisons from Birdeye, CoinGecko, and other providers</p>
                  </div>
                </DashboardCard>
              </TabsContent>

              <TabsContent value="social">
                <DashboardCard className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Social Sentiment Analysis</h3>
                  <div className="text-center text-muted-foreground">
                    <p>Social sentiment data from Santiment and LunarCrush will be displayed here</p>
                    <p className="text-sm mt-2">Configure API keys to enable social analytics</p>
                  </div>
                </DashboardCard>
              </TabsContent>

              <TabsContent value="on-chain">
                <DashboardCard className="p-6">
                  <h3 className="text-lg font-semibold mb-4">On-Chain Analytics</h3>
                  <div className="text-center text-muted-foreground">
                    <p>On-chain data from Helius and other providers will be displayed here</p>
                    <p className="text-sm mt-2">Configure API keys to enable detailed on-chain analysis</p>
                  </div>
                </DashboardCard>
              </TabsContent>

              <TabsContent value="comparison">
                <DashboardCard className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Cross-Source Data Comparison</h3>
                  <div className="text-center text-muted-foreground">
                    <p>Side-by-side comparison of data from all sources will be displayed here</p>
                    <p className="text-sm mt-2">This helps identify discrepancies and validate data accuracy</p>
                  </div>
                </DashboardCard>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <DashboardCard className="p-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-muted/20 rounded-lg flex items-center justify-center mx-auto">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Select a Token to Analyze</h3>
                <p className="text-muted-foreground">
                  Search for a token above to get comprehensive analytics from multiple data sources.
                </p>
              </div>
            </div>
          </DashboardCard>
        )}
      </main>
    </div>
  )
}