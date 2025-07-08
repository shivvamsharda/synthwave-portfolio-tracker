export interface SantimentMetric {
  datetime: string
  value: number
}

export interface SantimentSocialData {
  social_volume: SantimentMetric[]
  social_dominance: SantimentMetric[]
  sentiment_positive: SantimentMetric[]
  sentiment_negative: SantimentMetric[]
  sentiment_balance: SantimentMetric[]
}

export interface SantimentDevData {
  dev_activity: SantimentMetric[]
  github_activity: SantimentMetric[]
}

export interface SantimentNetworkData {
  active_addresses_24h: SantimentMetric[]
  network_growth: SantimentMetric[]
  circulation: SantimentMetric[]
  velocity: SantimentMetric[]
}

class SantimentService {
  private baseUrl = 'https://api.santiment.net/graphql'
  private cache = new Map<string, { data: any, timestamp: number }>()
  private cacheTimeout = 300000 // 5 minutes

  async getSocialMetrics(
    slug: string,
    apiKey: string,
    from: string = '7d',
    to: string = 'utc_now'
  ): Promise<SantimentSocialData | null> {
    const cacheKey = `social-${slug}-${from}-${to}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    const query = `
      query {
        socialVolume: getMetric(metric: "social_volume_total") {
          timeseriesData(
            slug: "${slug}"
            from: "${from}"
            to: "${to}"
            interval: "1d"
          ) {
            datetime
            value
          }
        }
        socialDominance: getMetric(metric: "social_dominance_total") {
          timeseriesData(
            slug: "${slug}"
            from: "${from}"
            to: "${to}"
            interval: "1d"
          ) {
            datetime
            value
          }
        }
        sentimentPositive: getMetric(metric: "sentiment_positive_total") {
          timeseriesData(
            slug: "${slug}"
            from: "${from}"
            to: "${to}"
            interval: "1d"
          ) {
            datetime
            value
          }
        }
        sentimentNegative: getMetric(metric: "sentiment_negative_total") {
          timeseriesData(
            slug: "${slug}"
            from: "${from}"
            to: "${to}"
            interval: "1d"
          ) {
            datetime
            value
          }
        }
        sentimentBalance: getMetric(metric: "sentiment_balance_total") {
          timeseriesData(
            slug: "${slug}"
            from: "${from}"
            to: "${to}"
            interval: "1d"
          ) {
            datetime
            value
          }
        }
      }
    `

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Apikey ${apiKey}`
        },
        body: JSON.stringify({ query })
      })

      if (!response.ok) {
        throw new Error(`Santiment API error: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.errors) {
        throw new Error(`Santiment GraphQL error: ${result.errors[0].message}`)
      }

      const data = {
        social_volume: result.data.socialVolume?.timeseriesData || [],
        social_dominance: result.data.socialDominance?.timeseriesData || [],
        sentiment_positive: result.data.sentimentPositive?.timeseriesData || [],
        sentiment_negative: result.data.sentimentNegative?.timeseriesData || [],
        sentiment_balance: result.data.sentimentBalance?.timeseriesData || []
      }
      
      this.cache.set(cacheKey, { data, timestamp: Date.now() })
      return data
    } catch (error) {
      console.error('Error fetching social metrics from Santiment:', error)
      return null
    }
  }

  async getDeveloperMetrics(
    slug: string,
    apiKey: string,
    from: string = '30d',
    to: string = 'utc_now'
  ): Promise<SantimentDevData | null> {
    const cacheKey = `dev-${slug}-${from}-${to}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    const query = `
      query {
        devActivity: getMetric(metric: "dev_activity") {
          timeseriesData(
            slug: "${slug}"
            from: "${from}"
            to: "${to}"
            interval: "1d"
          ) {
            datetime
            value
          }
        }
        githubActivity: getMetric(metric: "github_activity") {
          timeseriesData(
            slug: "${slug}"
            from: "${from}"
            to: "${to}"
            interval: "1d"
          ) {
            datetime
            value
          }
        }
      }
    `

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Apikey ${apiKey}`
        },
        body: JSON.stringify({ query })
      })

      if (!response.ok) {
        throw new Error(`Santiment API error: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.errors) {
        throw new Error(`Santiment GraphQL error: ${result.errors[0].message}`)
      }

      const data = {
        dev_activity: result.data.devActivity?.timeseriesData || [],
        github_activity: result.data.githubActivity?.timeseriesData || []
      }
      
      this.cache.set(cacheKey, { data, timestamp: Date.now() })
      return data
    } catch (error) {
      console.error('Error fetching developer metrics from Santiment:', error)
      return null
    }
  }

  async getNetworkMetrics(
    slug: string,
    apiKey: string,
    from: string = '30d',
    to: string = 'utc_now'
  ): Promise<SantimentNetworkData | null> {
    const cacheKey = `network-${slug}-${from}-${to}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    const query = `
      query {
        activeAddresses: getMetric(metric: "active_addresses_24h") {
          timeseriesData(
            slug: "${slug}"
            from: "${from}"
            to: "${to}"
            interval: "1d"
          ) {
            datetime
            value
          }
        }
        networkGrowth: getMetric(metric: "network_growth") {
          timeseriesData(
            slug: "${slug}"
            from: "${from}"
            to: "${to}"
            interval: "1d"
          ) {
            datetime
            value
          }
        }
        circulation: getMetric(metric: "circulation") {
          timeseriesData(
            slug: "${slug}"
            from: "${from}"
            to: "${to}"
            interval: "1d"
          ) {
            datetime
            value
          }
        }
        velocity: getMetric(metric: "velocity") {
          timeseriesData(
            slug: "${slug}"
            from: "${from}"
            to: "${to}"
            interval: "1d"
          ) {
            datetime
            value
          }
        }
      }
    `

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Apikey ${apiKey}`
        },
        body: JSON.stringify({ query })
      })

      if (!response.ok) {
        throw new Error(`Santiment API error: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.errors) {
        throw new Error(`Santiment GraphQL error: ${result.errors[0].message}`)
      }

      const data = {
        active_addresses_24h: result.data.activeAddresses?.timeseriesData || [],
        network_growth: result.data.networkGrowth?.timeseriesData || [],
        circulation: result.data.circulation?.timeseriesData || [],
        velocity: result.data.velocity?.timeseriesData || []
      }
      
      this.cache.set(cacheKey, { data, timestamp: Date.now() })
      return data
    } catch (error) {
      console.error('Error fetching network metrics from Santiment:', error)
      return null
    }
  }

  clearCache(): void {
    this.cache.clear()
  }
}

export const santimentService = new SantimentService()