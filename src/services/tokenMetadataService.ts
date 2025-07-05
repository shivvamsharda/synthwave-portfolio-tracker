interface TokenMetadata {
  address: string
  symbol: string
  name: string
  decimals: number
  logoURI?: string
  description?: string
  website?: string
  twitter?: string
  telegram?: string
  coingeckoId?: string
  extensions?: {
    website?: string
    twitter?: string
    telegram?: string
    description?: string
  }
}

interface JupiterTokenListResponse {
  [mint: string]: TokenMetadata
}

export class TokenMetadataService {
  private static readonly JUPITER_TOKEN_LIST_API = 'https://token.jup.ag/all'
  private static tokenMetadataCache: Map<string, TokenMetadata> = new Map()
  private static lastFetchTime = 0
  private static readonly CACHE_DURATION = 60 * 60 * 1000 // 1 hour

  /**
   * Fetch all token metadata from Jupiter Token List
   */
  static async fetchAllTokenMetadata(): Promise<JupiterTokenListResponse> {
    const now = Date.now()
    
    // Check if we need to refresh cache
    if (now - this.lastFetchTime < this.CACHE_DURATION && this.tokenMetadataCache.size > 0) {
      const cached: JupiterTokenListResponse = {}
      this.tokenMetadataCache.forEach((metadata, mint) => {
        cached[mint] = metadata
      })
      return cached
    }

    try {
      console.log('Fetching token metadata from Jupiter...')
      const response = await fetch(this.JUPITER_TOKEN_LIST_API)
      
      if (!response.ok) {
        console.error('Jupiter Token List API error:', response.status, response.statusText)
        return {}
      }

      const tokenList: TokenMetadata[] = await response.json()
      
      // Clear cache and rebuild
      this.tokenMetadataCache.clear()
      const metadataMap: JupiterTokenListResponse = {}
      
      tokenList.forEach(token => {
        this.tokenMetadataCache.set(token.address, token)
        metadataMap[token.address] = token
      })
      
      this.lastFetchTime = now
      console.log(`Cached metadata for ${tokenList.length} tokens`)
      
      return metadataMap
    } catch (error) {
      console.error('Error fetching token metadata:', error)
      return {}
    }
  }

  /**
   * Get metadata for specific token mints
   */
  static async getTokensMetadata(mints: string[]): Promise<Record<string, TokenMetadata>> {
    const allMetadata = await this.fetchAllTokenMetadata()
    const result: Record<string, TokenMetadata> = {}
    
    mints.forEach(mint => {
      if (allMetadata[mint]) {
        result[mint] = allMetadata[mint]
      }
    })
    
    return result
  }

  /**
   * Get metadata for a single token
   */
  static async getTokenMetadata(mint: string): Promise<TokenMetadata | null> {
    const metadata = await this.getTokensMetadata([mint])
    return metadata[mint] || null
  }

  /**
   * Search tokens by symbol or name
   */
  static async searchTokens(query: string, limit = 20): Promise<TokenMetadata[]> {
    const allMetadata = await this.fetchAllTokenMetadata()
    const searchQuery = query.toLowerCase()
    const results: TokenMetadata[] = []
    
    for (const metadata of Object.values(allMetadata)) {
      if (
        metadata.symbol.toLowerCase().includes(searchQuery) ||
        metadata.name.toLowerCase().includes(searchQuery)
      ) {
        results.push(metadata)
        if (results.length >= limit) break
      }
    }
    
    return results
  }

  /**
   * Get enhanced token info with fallback to known tokens
   */
  static async getEnhancedTokenInfo(mint: string, fallbackSymbol?: string, fallbackName?: string): Promise<{
    symbol: string
    name: string
    logoURI?: string
    description?: string
    website?: string
    twitter?: string
  }> {
    const metadata = await this.getTokenMetadata(mint)
    
    if (metadata) {
      return {
        symbol: metadata.symbol,
        name: metadata.name,
        logoURI: metadata.logoURI,
        description: metadata.description || metadata.extensions?.description,
        website: metadata.website || metadata.extensions?.website,
        twitter: metadata.twitter || metadata.extensions?.twitter
      }
    }
    
    // Fallback to provided info or default
    return {
      symbol: fallbackSymbol || mint.slice(0, 4) + '...',
      name: fallbackName || 'Unknown Token',
      logoURI: undefined,
      description: undefined,
      website: undefined,
      twitter: undefined
    }
  }
}

export const tokenMetadataService = TokenMetadataService