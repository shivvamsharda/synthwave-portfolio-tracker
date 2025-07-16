export interface CoinGeckoTokenData {
  id: string
  symbol: string
  name: string
  asset_platform_id: string
  contract_address: string
  current_price?: number
  market_cap?: number
  market_cap_rank?: number
  fully_diluted_valuation?: number
  total_volume?: number
  high_24h?: number
  low_24h?: number
  price_change_24h?: number
  price_change_percentage_24h?: number
  market_cap_change_24h?: number
  market_cap_change_percentage_24h?: number
  circulating_supply?: number
  total_supply?: number
  max_supply?: number
  ath?: number
  ath_change_percentage?: number
  ath_date?: string
  atl?: number
  atl_change_percentage?: number
  atl_date?: string
  last_updated?: string
  sparkline_in_7d?: {
    price: number[]
  }
  price_change_percentage_7d_in_currency?: number
  price_change_percentage_30d_in_currency?: number
  image?: {
    thumb?: string
    small?: string
    large?: string
  }
  description?: {
    en?: string
  }
  links?: {
    homepage?: string[]
    twitter_screen_name?: string
  }
}

export interface CoinGeckoPriceHistory {
  prices: [number, number][]
  market_caps: [number, number][]
  total_volumes: [number, number][]
}

export interface CoinGeckoMarketData {
  id: string
  name: string
  symbol: string
  market_cap_rank: number
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  total_volume: number
}

class CoinGeckoService {
  private baseUrl = 'https://api.coingecko.com/api/v3'
  private cache = new Map<string, { data: any, timestamp: number }>()
  private cacheTimeout = 60000 // 1 minute

  async getTokenByContract(
    contractAddress: string, 
    platform: string = 'solana',
    apiKey?: string
  ): Promise<CoinGeckoTokenData | null> {
    const cacheKey = `contract-${platform}-${contractAddress}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json'
      }
      
      if (apiKey) {
        headers['x-cg-demo-api-key'] = apiKey
      }

      const response = await fetch(
        `${this.baseUrl}/coins/${platform}/contract/${contractAddress}`,
        { headers }
      )

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`)
      }

      const data = await response.json()
      
      this.cache.set(cacheKey, { data, timestamp: Date.now() })
      return data
    } catch (error) {
      console.error('Error fetching token from CoinGecko:', error)
      return null
    }
  }

  async getTokenPrice(
    tokenId: string,
    currencies: string = 'usd',
    apiKey?: string
  ): Promise<Record<string, number> | null> {
    const cacheKey = `price-${tokenId}-${currencies}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json'
      }
      
      if (apiKey) {
        headers['x-cg-demo-api-key'] = apiKey
      }

      const response = await fetch(
        `${this.baseUrl}/simple/price?ids=${tokenId}&vs_currencies=${currencies}&include_24hr_change=true`,
        { headers }
      )

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`)
      }

      const data = await response.json()
      const tokenData = data[tokenId]
      
      this.cache.set(cacheKey, { data: tokenData, timestamp: Date.now() })
      return tokenData
    } catch (error) {
      console.error('Error fetching token price from CoinGecko:', error)
      return null
    }
  }

  async getPriceHistory(
    tokenId: string,
    days: number = 7,
    currency: string = 'usd',
    apiKey?: string
  ): Promise<CoinGeckoPriceHistory | null> {
    const cacheKey = `history-${tokenId}-${days}-${currency}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json'
      }
      
      if (apiKey) {
        headers['x-cg-demo-api-key'] = apiKey
      }

      const response = await fetch(
        `${this.baseUrl}/coins/${tokenId}/market_chart?vs_currency=${currency}&days=${days}`,
        { headers }
      )

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`)
      }

      const data = await response.json()
      
      this.cache.set(cacheKey, { data, timestamp: Date.now() })
      return data
    } catch (error) {
      console.error('Error fetching price history from CoinGecko:', error)
      return null
    }
  }

  async getTopTokens(
    limit: number = 100,
    currency: string = 'usd',
    apiKey?: string
  ): Promise<CoinGeckoMarketData[]> {
    const cacheKey = `top-tokens-${limit}-${currency}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json'
      }
      
      if (apiKey) {
        headers['x-cg-demo-api-key'] = apiKey
      }

      const response = await fetch(
        `${this.baseUrl}/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`,
        { headers }
      )

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`)
      }

      const data = await response.json()
      
      this.cache.set(cacheKey, { data, timestamp: Date.now() })
      return data
    } catch (error) {
      console.error('Error fetching top tokens from CoinGecko:', error)
      return []
    }
  }

  async searchTokens(query: string, apiKey?: string): Promise<any[]> {
    const cacheKey = `search-${query}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json'
      }
      
      if (apiKey) {
        headers['x-cg-demo-api-key'] = apiKey
      }

      const response = await fetch(
        `${this.baseUrl}/search?query=${encodeURIComponent(query)}`,
        { headers }
      )

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`)
      }

      const result = await response.json()
      const data = result.coins || []
      
      this.cache.set(cacheKey, { data, timestamp: Date.now() })
      return data
    } catch (error) {
      console.error('Error searching tokens from CoinGecko:', error)
      return []
    }
  }

  clearCache(): void {
    this.cache.clear()
  }
}

export const coingeckoService = new CoinGeckoService()