export interface LunarCrushTokenData {
  id: number
  symbol: string
  name: string
  price: number
  price_btc: number
  volume_24h: number
  price_change_24h: number
  percent_change_24h: number
  percent_change_7d: number
  percent_change_30d: number
  market_cap: number
  market_cap_rank: number
  social_score: number
  social_score_24h_rank: number
  social_contributors: number
  social_volume: number
  social_volume_24h: number
  reddit_posts: number
  reddit_posts_24h: number
  reddit_comments: number
  reddit_comments_24h: number
  tweets: number
  tweets_24h: number
  news: number
  news_24h: number
  spam: number
  social_dominance: number
  market_dominance: number
  galaxy_score: number
  alt_rank: number
  volatility: number
  timeSeries?: {
    time: number
    close: number
    social_volume: number
    social_score: number
  }[]
}

export interface LunarCrushInfluencer {
  id: string
  display_name: string
  follower_count: number
  following_count: number
  url: string
  influence_score: number
  social_score: number
  social_contributors: number
  social_volume: number
  social_volume_24h: number
}

export interface LunarCrushSocialFeed {
  id: string
  time: number
  title: string
  url: string
  body: string
  interactions: number
  sentiment: number
  spam: number
  medium: string
  created_date: string
}

class LunarCrushService {
  private baseUrl = 'https://lunarcrush.com/api4/public'
  private cache = new Map<string, { data: any, timestamp: number }>()
  private cacheTimeout = 300000 // 5 minutes

  async getTokenData(
    symbol: string,
    apiKey: string,
    interval: string = '1d',
    data_points: number = 30
  ): Promise<LunarCrushTokenData | null> {
    const cacheKey = `token-${symbol}-${interval}-${data_points}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/coins/${symbol}?interval=${interval}&data_points=${data_points}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`LunarCrush API error: ${response.status}`)
      }

      const result = await response.json()
      const data = result.data?.[0] || null
      
      this.cache.set(cacheKey, { data, timestamp: Date.now() })
      return data
    } catch (error) {
      console.error('Error fetching token data from LunarCrush:', error)
      return null
    }
  }

  async getMarketData(
    apiKey: string,
    sort: string = 'social_score',
    limit: number = 50
  ): Promise<LunarCrushTokenData[]> {
    const cacheKey = `market-${sort}-${limit}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/coins?sort=${sort}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`LunarCrush API error: ${response.status}`)
      }

      const result = await response.json()
      const data = result.data || []
      
      this.cache.set(cacheKey, { data, timestamp: Date.now() })
      return data
    } catch (error) {
      console.error('Error fetching market data from LunarCrush:', error)
      return []
    }
  }

  async getInfluencers(
    symbol: string,
    apiKey: string,
    limit: number = 20
  ): Promise<LunarCrushInfluencer[]> {
    const cacheKey = `influencers-${symbol}-${limit}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/influencers?symbol=${symbol}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`LunarCrush API error: ${response.status}`)
      }

      const result = await response.json()
      const data = result.data || []
      
      this.cache.set(cacheKey, { data, timestamp: Date.now() })
      return data
    } catch (error) {
      console.error('Error fetching influencers from LunarCrush:', error)
      return []
    }
  }

  async getSocialFeed(
    symbol: string,
    apiKey: string,
    limit: number = 25,
    sources: string = 'twitter,reddit,news'
  ): Promise<LunarCrushSocialFeed[]> {
    const cacheKey = `feed-${symbol}-${limit}-${sources}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/feeds?symbol=${symbol}&limit=${limit}&sources=${sources}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`LunarCrush API error: ${response.status}`)
      }

      const result = await response.json()
      const data = result.data || []
      
      this.cache.set(cacheKey, { data, timestamp: Date.now() })
      return data
    } catch (error) {
      console.error('Error fetching social feed from LunarCrush:', error)
      return []
    }
  }

  async getGlobalMetrics(apiKey: string): Promise<any> {
    const cacheKey = 'global-metrics'
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    try {
      const response = await fetch(`${this.baseUrl}/global`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`LunarCrush API error: ${response.status}`)
      }

      const result = await response.json()
      const data = result.data || {}
      
      this.cache.set(cacheKey, { data, timestamp: Date.now() })
      return data
    } catch (error) {
      console.error('Error fetching global metrics from LunarCrush:', error)
      return {}
    }
  }

  clearCache(): void {
    this.cache.clear()
  }
}

export const lunarcrushService = new LunarCrushService()