export interface TrendingToken {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  decimals: number;
  twitter?: string;
  website?: string;
  dev: string;
  circSupply: number;
  totalSupply: number;
  tokenProgram?: string;
  holderCount: number;
  audit?: {
    mintAuthorityDisabled: boolean;
    freezeAuthorityDisabled: boolean;
    topHoldersPercentage: number;
  };
  organicScore: number;
  organicScoreLabel: string;
  isVerified: boolean;
  cexes?: string[];
  tags: string[];
  fdv: number;
  mcap: number;
  usdPrice: number;
  priceBlockId?: number;
  liquidity: number;
  stats5m: TokenStats;
  stats1h: TokenStats;
  stats6h: TokenStats;
  stats24h: TokenStats;
  ctLikes?: number;
  smartCtLikes?: number;
}

export interface TokenStats {
  priceChange: number;
  holderChange: number;
  liquidityChange: number;
  volumeChange: number;
  buyVolume: number;
  sellVolume: number;
  buyOrganicVolume: number;
  sellOrganicVolume: number;
  numBuys: number;
  numSells: number;
  numTraders: number;
  numOrganicBuyers: number;
  numNetBuyers: number;
}

export type TrendingCategory = 'toptrending' | 'toporganicscore' | 'toptraded';
export type TrendingInterval = '5m' | '1h' | '6h' | '24h';

class JupiterTrendingService {
  private cache = new Map<string, { data: TrendingToken[]; timestamp: number }>();
  private readonly CACHE_DURATION = 30000; // 30 seconds

  async getTrendingTokens(
    category: TrendingCategory = 'toptrending',
    interval: TrendingInterval = '1h'
  ): Promise<TrendingToken[]> {
    const cacheKey = `${category}-${interval}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const response = await fetch(`https://lite-api.jup.ag/tokens/v2/${category}/${interval}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: TrendingToken[] = await response.json();
      
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Error fetching trending tokens:', error);
      
      // Return cached data if available, even if expired
      if (cached) {
        return cached.data;
      }
      
      // Return empty array as fallback
      return [];
    }
  }

  clearCache() {
    this.cache.clear();
  }
}

export const jupiterTrendingService = new JupiterTrendingService();