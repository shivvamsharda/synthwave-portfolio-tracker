export interface JupiterTokenData {
  id: string
  name: string
  symbol: string
  icon: string
  decimals: number
  twitter?: string
  dev: string
  circSupply: number
  totalSupply: number
  tokenProgram: string
  launchpad?: string
  firstPool?: {
    id: string
    createdAt: string
  }
  holderCount: number
  audit: {
    mintAuthorityDisabled: boolean
    freezeAuthorityDisabled: boolean
    topHoldersPercentage: number
    devBalancePercentage: number
    devMigrations: number
  }
  organicScore: number
  organicScoreLabel: string
  isVerified: boolean
  tags: string[]
  graduatedPool?: string
  graduatedAt?: string
  fdv: number
  mcap: number
  usdPrice: number
  priceBlockId: number
  liquidity: number
  stats5m: TokenStats
  stats1h: TokenStats
  stats6h: TokenStats
  stats24h: TokenStats
  ctLikes: number
  smartCtLikes: number
  updatedAt: string
}

export interface TokenStats {
  priceChange: number
  holderChange: number
  liquidityChange: number
  volumeChange: number
  buyVolume: number
  sellVolume: number
  buyOrganicVolume: number
  sellOrganicVolume: number
  numBuys: number
  numSells: number
  numTraders: number
  numOrganicBuyers: number
  numNetBuyers: number
}

class JupiterUltraService {
  private baseUrl = 'https://lite-api.jup.ag/ultra/v1'
  private cache = new Map<string, { data: JupiterTokenData[], timestamp: number }>()
  private cacheTimeout = 30000 // 30 seconds

  async searchToken(query: string): Promise<JupiterTokenData[]> {
    // Check cache first
    const cached = this.cache.get(query)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    try {
      const response = await fetch(`${this.baseUrl}/search?query=${encodeURIComponent(query)}`, {
        headers: {
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Jupiter Ultra API error: ${response.status}`)
      }

      const data: JupiterTokenData[] = await response.json()
      
      // Cache the result
      this.cache.set(query, { data, timestamp: Date.now() })
      
      return data
    } catch (error) {
      console.error('Error fetching token data from Jupiter Ultra:', error)
      throw error
    }
  }

  async getTokenByMint(mintAddress: string): Promise<JupiterTokenData | null> {
    try {
      const results = await this.searchToken(mintAddress)
      return results.find(token => token.id === mintAddress) || null
    } catch (error) {
      console.error('Error fetching token by mint:', error)
      return null
    }
  }

  // Clear cache periodically
  clearCache(): void {
    this.cache.clear()
  }

  // Get market sentiment based on organic score and volume
  getMarketSentiment(token: JupiterTokenData): {
    sentiment: 'bullish' | 'bearish' | 'neutral'
    confidence: 'high' | 'medium' | 'low'
    reasons: string[]
  } {
    const reasons: string[] = []
    let bullishSignals = 0
    let bearishSignals = 0

    // Organic score analysis
    if (token.organicScore > 70) {
      bullishSignals++
      reasons.push('High organic score')
    } else if (token.organicScore < 30) {
      bearishSignals++
      reasons.push('Low organic score')
    }

    // Buy/sell pressure
    const buyPressure = token.stats1h.buyVolume / (token.stats1h.buyVolume + token.stats1h.sellVolume)
    if (buyPressure > 0.6) {
      bullishSignals++
      reasons.push('Strong buy pressure')
    } else if (buyPressure < 0.4) {
      bearishSignals++
      reasons.push('Strong sell pressure')
    }

    // Holder growth
    if (token.stats24h.holderChange > 5) {
      bullishSignals++
      reasons.push('Growing holder base')
    } else if (token.stats24h.holderChange < -5) {
      bearishSignals++
      reasons.push('Declining holder base')
    }

    // Price momentum
    if (token.stats1h.priceChange > 10) {
      bullishSignals++
      reasons.push('Strong price momentum')
    } else if (token.stats1h.priceChange < -10) {
      bearishSignals++
      reasons.push('Negative price momentum')
    }

    const sentiment = bullishSignals > bearishSignals ? 'bullish' : 
                     bearishSignals > bullishSignals ? 'bearish' : 'neutral'
    
    const signalStrength = Math.abs(bullishSignals - bearishSignals)
    const confidence = signalStrength >= 3 ? 'high' : signalStrength >= 2 ? 'medium' : 'low'

    return { sentiment, confidence, reasons }
  }
}

export const jupiterUltraService = new JupiterUltraService()