export interface BirdeyeTokenData {
  address: string
  decimals: number
  symbol: string
  name: string
  logoURI?: string
  mc?: number
  v24hUSD?: number
  v24hChangePercent?: number
  liquidity?: number
  lastTradeUnixTime?: number
  buy24h?: number
  sell24h?: number
  volumeChangePercent24h?: number
  liquidityChangePercent24h?: number
  priceChangePercent24h?: number
}

export interface BirdeyePriceData {
  value: number
  updateUnixTime: number
  updateHumanTime: string
  priceChange24h: number
  priceChangePercent24h: number
}

export interface BirdeyeOHLCV {
  unixTime: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface BirdeyeTradeData {
  address: string
  txHash: string
  blockUnixTime: number
  side: 'buy' | 'sell'
  priceNative: number
  priceUsd: number
  volumeNative: number
  volumeUsd: number
  source: string
}

class BirdeyeService {
  private baseUrl = 'https://public-api.birdeye.so'
  private cache = new Map<string, { data: any, timestamp: number }>()
  private cacheTimeout = 30000 // 30 seconds

  async getTokenOverview(address: string, apiKey: string): Promise<BirdeyeTokenData | null> {
    const cacheKey = `overview-${address}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    try {
      const response = await fetch(`${this.baseUrl}/defi/token_overview?address=${address}`, {
        headers: {
          'X-API-KEY': apiKey,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Birdeye API error: ${response.status}`)
      }

      const result = await response.json()
      const data = result.data
      
      this.cache.set(cacheKey, { data, timestamp: Date.now() })
      return data
    } catch (error) {
      console.error('Error fetching token overview from Birdeye:', error)
      return null
    }
  }

  async getTokenPrice(address: string, apiKey: string): Promise<BirdeyePriceData | null> {
    const cacheKey = `price-${address}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    try {
      const response = await fetch(`${this.baseUrl}/defi/price?address=${address}`, {
        headers: {
          'X-API-KEY': apiKey,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Birdeye API error: ${response.status}`)
      }

      const result = await response.json()
      const data = result.data
      
      this.cache.set(cacheKey, { data, timestamp: Date.now() })
      return data
    } catch (error) {
      console.error('Error fetching token price from Birdeye:', error)
      return null
    }
  }

  async getPriceHistory(
    address: string, 
    apiKey: string,
    timeframe: '1m' | '3m' | '5m' | '15m' | '30m' | '1H' | '2H' | '4H' | '6H' | '8H' | '12H' | '1D' | '3D' | '1W' | '1M' = '1H',
    limit: number = 100
  ): Promise<BirdeyeOHLCV[]> {
    const cacheKey = `history-${address}-${timeframe}-${limit}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/defi/ohlcv?address=${address}&type=${timeframe}&time_from=${Math.floor(Date.now() / 1000) - (limit * this.getTimeframeSeconds(timeframe))}&time_to=${Math.floor(Date.now() / 1000)}`,
        {
          headers: {
            'X-API-KEY': apiKey,
            'Accept': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Birdeye API error: ${response.status}`)
      }

      const result = await response.json()
      const data = result.data?.items || []
      
      this.cache.set(cacheKey, { data, timestamp: Date.now() })
      return data
    } catch (error) {
      console.error('Error fetching price history from Birdeye:', error)
      return []
    }
  }

  async getTrades(
    address: string, 
    apiKey: string,
    limit: number = 50
  ): Promise<BirdeyeTradeData[]> {
    const cacheKey = `trades-${address}-${limit}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/defi/txs/token?address=${address}&tx_type=swap&sort_type=desc&offset=0&limit=${limit}`,
        {
          headers: {
            'X-API-KEY': apiKey,
            'Accept': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Birdeye API error: ${response.status}`)
      }

      const result = await response.json()
      const data = result.data?.items || []
      
      this.cache.set(cacheKey, { data, timestamp: Date.now() })
      return data
    } catch (error) {
      console.error('Error fetching trades from Birdeye:', error)
      return []
    }
  }

  private getTimeframeSeconds(timeframe: string): number {
    const timeframeMap: Record<string, number> = {
      '1m': 60,
      '3m': 180,
      '5m': 300,
      '15m': 900,
      '30m': 1800,
      '1H': 3600,
      '2H': 7200,
      '4H': 14400,
      '6H': 21600,
      '8H': 28800,
      '12H': 43200,
      '1D': 86400,
      '3D': 259200,
      '1W': 604800,
      '1M': 2592000
    }
    return timeframeMap[timeframe] || 3600
  }

  clearCache(): void {
    this.cache.clear()
  }
}

export const birdeyeService = new BirdeyeService()