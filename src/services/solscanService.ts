export interface SolscanHolderData {
  address: string
  amount: number
  decimals: number
  owner: string
  rank: number
  percentage: number
}

export interface SolscanTokenHolders {
  data: SolscanHolderData[]
  total: number
}

export interface SolscanTransferData {
  signature: string
  blockTime: number
  fromAddress: string
  toAddress: string
  amount: number
  decimals: number
  tokenAddress: string
  slot: number
}

export interface SolscanTokenTransfers {
  data: SolscanTransferData[]
  total: number
}

class SolscanService {
  private proxyUrl = 'https://iktftsxuuiyeabxgdxzo.supabase.co/functions/v1/solscan-proxy'
  private cache = new Map<string, { data: any, timestamp: number }>()
  private cacheTimeout = 60000 // 1 minute

  async getTokenHolders(
    tokenAddress: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<SolscanTokenHolders | null> {
    const cacheKey = `holders-${tokenAddress}-${limit}-${offset}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    try {
      const response = await fetch(
        `${this.proxyUrl}?endpoint=holders&tokenAddress=${tokenAddress}&limit=${limit}&offset=${offset}`,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Solscan API error: ${response.status}`)
      }

      const data = await response.json()
      
      this.cache.set(cacheKey, { data, timestamp: Date.now() })
      return data
    } catch (error) {
      console.error('Error fetching token holders from Solscan:', error)
      return null
    }
  }

  async getTokenTransfers(
    tokenAddress: string,
    limit: number = 100,
    offset: number = 0,
    fromTime?: number,
    toTime?: number
  ): Promise<SolscanTokenTransfers | null> {
    const cacheKey = `transfers-${tokenAddress}-${limit}-${offset}-${fromTime}-${toTime}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    try {
      let url = `${this.proxyUrl}?endpoint=transfer&tokenAddress=${tokenAddress}&limit=${limit}&offset=${offset}`
      
      if (fromTime) url += `&fromTime=${fromTime}`
      if (toTime) url += `&toTime=${toTime}`

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Solscan API error: ${response.status}`)
      }

      const data = await response.json()
      
      this.cache.set(cacheKey, { data, timestamp: Date.now() })
      return data
    } catch (error) {
      console.error('Error fetching token transfers from Solscan:', error)
      return null
    }
  }

  async getTokenMeta(tokenAddress: string): Promise<any> {
    const cacheKey = `meta-${tokenAddress}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    try {
      const response = await fetch(`${this.proxyUrl}?endpoint=meta&tokenAddress=${tokenAddress}`, {
        headers: {
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Solscan API error: ${response.status}`)
      }

      const data = await response.json()
      
      this.cache.set(cacheKey, { data, timestamp: Date.now() })
      return data
    } catch (error) {
      console.error('Error fetching token meta from Solscan:', error)
      return null
    }
  }

  clearCache(): void {
    this.cache.clear()
  }
}

export const solscanService = new SolscanService()