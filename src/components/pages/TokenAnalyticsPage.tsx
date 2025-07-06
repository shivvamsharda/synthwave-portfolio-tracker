import { useState } from "react"
import { Header } from "@/components/layout/Header"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, TrendingUp, Users, ArrowRightLeft, Eye, Info, RefreshCw } from "lucide-react"
import { HolderMovementAnalysis } from "@/components/analytics/HolderMovementAnalysis"
import { WhaleTracker } from "@/components/analytics/WhaleTracker"
import { TokenFlowVisualization } from "@/components/analytics/TokenFlowVisualization"
import { TokenOverview } from "@/components/analytics/TokenOverview"
import { jupiterUltraService, JupiterTokenData } from "@/services/jupiterUltraService"

interface TokenAnalyticsPageProps {
  onNavigate?: (page: "dashboard" | "wallets" | "nfts" | "yield" | "analytics" | "settings") => void
}

export function TokenAnalyticsPage({ onNavigate }: TokenAnalyticsPageProps) {
  const [selectedToken, setSelectedToken] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [searchResults, setSearchResults] = useState<JupiterTokenData[]>([])
  const [searching, setSearching] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setSearching(true)
    try {
      const results = await jupiterUltraService.searchToken(searchQuery)
      setSearchResults(results)
      if (results.length > 0) {
        setSelectedToken(results[0].id)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setSearching(false)
    }
  }

  const handleRefresh = async () => {
    if (!selectedToken) return
    
    setRefreshing(true)
    try {
      // Clear the cache
      jupiterUltraService.clearCache()
      
      // Refetch the current token data
      const results = await jupiterUltraService.searchToken(selectedToken)
      setSearchResults(results)
    } catch (error) {
      console.error('Refresh error:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const popularTokens = [
    { mint: "So11111111111111111111111111111111111111112", symbol: "SOL", name: "Solana" },
    { mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", symbol: "USDC", name: "USD Coin" },
    { mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", symbol: "BONK", name: "Bonk" },
    { mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", symbol: "JUP", name: "Jupiter" },
    { mint: "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So", symbol: "mSOL", name: "Marinade staked SOL" }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header onNavigate={onNavigate} />
      
      <main className="container px-4 py-8 space-y-8">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Token Analytics</h1>
              <p className="text-muted-foreground">Deep insights into token holder behavior and market movements</p>
            </div>
          </div>

          {/* Token Search */}
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
            {/* Refresh Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh Data'}
              </Button>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="holder-movement" className="flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4" />
                  Holder Movement
                </TabsTrigger>
                <TabsTrigger value="whale-tracker" className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Whale Tracker
                </TabsTrigger>
                <TabsTrigger value="token-flows" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Token Flows
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <TokenOverview tokenMint={selectedToken} />
              </TabsContent>

              <TabsContent value="holder-movement">
                <HolderMovementAnalysis tokenMint={selectedToken} />
              </TabsContent>

              <TabsContent value="whale-tracker">
                <WhaleTracker tokenMint={selectedToken} />
              </TabsContent>

              <TabsContent value="token-flows">
                <TokenFlowVisualization tokenMint={selectedToken} />
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
                  Search for a token above or select from popular tokens to start analyzing holder movements and whale activity.
                </p>
              </div>
            </div>
          </DashboardCard>
        )}
      </main>
    </div>
  )
}