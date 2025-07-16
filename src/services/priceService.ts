import { coingeckoService } from './coingeckoService'

interface JupiterPriceResponse {
  [mint: string]: {
    usdPrice: number
    blockId: number
    decimals: number
    priceChange24h: number
  }
}

export class PriceService {
  private static readonly JUPITER_PRICE_API = 'https://lite-api.jup.ag/price/v3'
  private static readonly MAX_MINTS_PER_REQUEST = 50

  /**
   * Get USD prices for token mints from Jupiter
   */
  static async getPrices(mints: string[]): Promise<JupiterPriceResponse> {
    if (mints.length === 0) return {}
    
    try {
      // Jupiter API supports up to 50 mints per request
      const chunks = this.chunkArray(mints, this.MAX_MINTS_PER_REQUEST)
      const allPrices: JupiterPriceResponse = {}

      for (const chunk of chunks) {
        const mintsParam = chunk.join(',')
        const response = await fetch(`${this.JUPITER_PRICE_API}?ids=${mintsParam}`)
        
        if (!response.ok) {
          console.error('Jupiter API error:', response.status, response.statusText)
          continue
        }

        const data = await response.json()
        Object.assign(allPrices, data)
      }

      // For any mints that didn't get prices from Jupiter, try CoinGecko fallback
      const missingMints = mints.filter(mint => !allPrices[mint])
      if (missingMints.length > 0) {
        console.log(`💰 Trying CoinGecko fallback for ${missingMints.length} missing prices`)
        for (const mint of missingMints) {
          try {
            const tokenData = await coingeckoService.getTokenByContract(mint, 'solana')
            if (tokenData?.current_price) {
              allPrices[mint] = {
                usdPrice: tokenData.current_price,
                blockId: 0,
                decimals: 6,
                priceChange24h: tokenData.price_change_percentage_24h || 0
              }
            }
          } catch (error) {
            console.error(`CoinGecko price fallback failed for ${mint}:`, error)
          }
        }
      }

      return allPrices
    } catch (error) {
      console.error('Error fetching prices from Jupiter:', error)
      return {}
    }
  }

  /**
   * Get single token price with CoinGecko fallback
   */
  static async getPrice(mint: string): Promise<number | null> {
    // Try Jupiter first
    const prices = await this.getPrices([mint])
    const jupiterPrice = prices[mint]?.usdPrice
    
    if (jupiterPrice) {
      return jupiterPrice
    }
    
    // Fallback to CoinGecko
    try {
      console.log(`💰 Trying CoinGecko price fallback for ${mint}`)
      const tokenData = await coingeckoService.getTokenByContract(mint, 'solana')
      if (tokenData?.current_price) {
        console.log(`✅ Got CoinGecko price for ${mint}: $${tokenData.current_price}`)
        return tokenData.current_price
      }
    } catch (error) {
      console.error(`❌ CoinGecko price fallback failed for ${mint}:`, error)
    }
    
    return null
  }

  /**
   * Calculate USD value for a token balance
   */
  static calculateUsdValue(balance: number, price: number): number {
    return balance * price
  }

  /**
   * Utility function to chunk array into smaller arrays
   */
  private static chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize))
    }
    return chunks
  }
}

export const priceService = PriceService