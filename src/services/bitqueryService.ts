interface BitQueryTrade {
  Block: {
    Time: string
  }
  Transaction: {
    Signature: string
  }
  Trade: {
    Market: {
      MarketAddress: string
    }
    Dex: {
      ProtocolName: string
      ProtocolFamily: string
    }
    AmountInUSD: number
    PriceInUSD: number
    Amount: number
    Currency: {
      Name: string
    }
    Side: {
      Type: string
      Currency: {
        Symbol: string
        MintAddress: string
        Name: string
      }
      AmountInUSD: number
      Amount: number
    }
  }
}

interface BitQueryResponse {
  Solana: {
    DEXTradeByTokens: BitQueryTrade[]
  }
}

export interface RealtimeTradeData {
  timestamp: string
  signature: string
  tradeType: 'buy' | 'sell'
  tokenAmount: number
  usdAmount: number
  pricePerToken: number
  currency: string
  marketAddress: string
  protocol: string
  sideToken: string
  sideAmount: number
  sideUsdAmount: number
}

export interface HolderMovementData {
  newBuyers: number
  sellers: number
  totalBuyVolume: number
  totalSellVolume: number
  netFlow: number
  whaleActivityCount: number
  averageTradeSize: number
  activities: Array<{
    walletAddress: string
    action: 'bought' | 'sold'
    amount: number
    usdValue: number
    timestamp: string
    isWhale: boolean
    protocol: string
    signature: string
  }>
}

export interface WhaleActivity {
  timestamp: string
  signature: string
  walletAddress: string
  tradeType: 'buy' | 'sell'
  tokenAmount: number
  usdAmount: number
  protocol: string
  impact: 'low' | 'medium' | 'high'
}

export interface TokenFlowData {
  inflows: Array<{
    fromToken: string
    fromSymbol: string
    volume: number
    tradeCount: number
    percentage: number
  }>
  outflows: Array<{
    toToken: string
    toSymbol: string
    volume: number
    tradeCount: number
    percentage: number
  }>
  netFlow: {
    totalInflow: number
    totalOutflow: number
    netAmount: number
    netPercentage: number
  }
}

class BitQueryService {
  private readonly API_URL = 'https://streaming.bitquery.io/eap'
  private cache = new Map<string, { data: any; timestamp: number }>()
  private readonly CACHE_DURATION = 30000 // 30 seconds

  private getQuery(tokenMint: string, limit: number = 100) {
    return `
      query LatestTrades {
        Solana {
          DEXTradeByTokens(
            orderBy: {descending: Block_Time}
            limit: {count: ${limit}}
            where: {Trade: {Currency: {MintAddress: {is: "${tokenMint}"}}, Side: {Currency: {MintAddress: {in: ["", "So11111111111111111111111111111111111111112", "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm"]}}}}}
          ) {
            Block {
              Time
            }
            Transaction {
              Signature
            }
            Trade {
              Market {
                MarketAddress
              }
              Dex {
                ProtocolName
                ProtocolFamily
              }
              AmountInUSD
              PriceInUSD
              Amount
              Currency {
                Name
              }
              Side {
                Type
                Currency {
                  Symbol
                  MintAddress
                  Name
                }
                AmountInUSD
                Amount
              }
            }
          }
        }
      }
    `;
  }

  async fetchRealtimeTrades(tokenMint: string, apiKey?: string): Promise<RealtimeTradeData[]> {
    const cacheKey = `trades-${tokenMint}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      console.log('🔍 Fetching BitQuery trades for:', tokenMint)
      
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey || 'ory_at_sSzc7vABIVF9vPepukK9LtvV_9qyRgc1yBnsvJ4Rhok.pZa-2iD7Ta_T3TegMMJsYOvoKzjgCukyKyAnH9C4XCs'}`
        },
        body: JSON.stringify({
          query: this.getQuery(tokenMint, 100)
        })
      })

      if (!response.ok) {
        throw new Error(`BitQuery API error: ${response.status}`)
      }

      const result: { data: BitQueryResponse } = await response.json()
      const trades = result.data?.Solana?.DEXTradeByTokens || []

      const realtimeData: RealtimeTradeData[] = trades.map(trade => ({
        timestamp: trade.Block.Time,
        signature: trade.Transaction.Signature,
        tradeType: trade.Trade.Side.Type === 'sell' ? 'buy' : 'sell', // Inverse because if side is selling, someone is buying the token
        tokenAmount: Number(trade.Trade.Amount) || 0,
        usdAmount: Number(trade.Trade.AmountInUSD) || 0,
        pricePerToken: Number(trade.Trade.PriceInUSD) || 0,
        currency: trade.Trade.Currency.Name || 'Unknown',
        marketAddress: trade.Trade.Market.MarketAddress || '',
        protocol: trade.Trade.Dex.ProtocolName || 'Unknown',
        sideToken: trade.Trade.Side.Currency.Symbol || 'Unknown',
        sideAmount: Number(trade.Trade.Side.Amount) || 0,
        sideUsdAmount: Number(trade.Trade.Side.AmountInUSD) || 0
      }))

      this.cache.set(cacheKey, { data: realtimeData, timestamp: Date.now() })
      console.log('✅ BitQuery trades fetched:', realtimeData.length)
      
      return realtimeData
    } catch (error) {
      console.error('❌ BitQuery fetch error:', error)
      return []
    }
  }

  async getHolderMovementData(tokenMint: string, timeframe: '24h' | '7d' | '30d' = '24h', apiKey?: string): Promise<HolderMovementData> {
    const trades = await this.fetchRealtimeTrades(tokenMint, apiKey)
    
    // Filter by timeframe
    const timeLimit = this.getTimeLimit(timeframe)
    const filteredTrades = trades.filter(trade => 
      new Date(trade.timestamp).getTime() > timeLimit
    )

    const buyers = filteredTrades.filter(trade => trade.tradeType === 'buy')
    const sellers = filteredTrades.filter(trade => trade.tradeType === 'sell')
    
    const totalBuyVolume = buyers.reduce((sum, trade) => sum + trade.usdAmount, 0)
    const totalSellVolume = sellers.reduce((sum, trade) => sum + trade.usdAmount, 0)
    const totalVolume = totalBuyVolume + totalSellVolume
    
    // Identify whales (trades > $10k)
    const whales = filteredTrades.filter(trade => trade.usdAmount > 10000)

    // Get unique wallets - using signature as proxy for wallet activity
    const uniqueBuyers = new Set(buyers.map(trade => trade.signature.slice(0, 8))).size
    const uniqueSellers = new Set(sellers.map(trade => trade.signature.slice(0, 8))).size

    const activities = filteredTrades.slice(0, 50).map(trade => ({
      walletAddress: trade.signature.slice(0, 8) + '...' + trade.signature.slice(-4),
      action: trade.tradeType === 'buy' ? 'bought' as const : 'sold' as const,
      amount: trade.tokenAmount,
      usdValue: trade.usdAmount,
      timestamp: trade.timestamp,
      isWhale: trade.usdAmount > 10000,
      protocol: trade.protocol,
      signature: trade.signature
    }))

    return {
      newBuyers: uniqueBuyers,
      sellers: uniqueSellers,
      totalBuyVolume,
      totalSellVolume,
      netFlow: totalVolume > 0 ? ((totalBuyVolume - totalSellVolume) / totalVolume) * 100 : 0,
      whaleActivityCount: whales.length,
      averageTradeSize: filteredTrades.length > 0 ? totalVolume / filteredTrades.length : 0,
      activities
    }
  }

  async getWhaleActivity(tokenMint: string, minUsdAmount: number = 10000, apiKey?: string): Promise<WhaleActivity[]> {
    const trades = await this.fetchRealtimeTrades(tokenMint, apiKey)
    
    const whaleActivities = trades
      .filter(trade => trade.usdAmount >= minUsdAmount)
      .slice(0, 20)
      .map(trade => ({
        timestamp: trade.timestamp,
        signature: trade.signature,
        walletAddress: trade.signature.slice(0, 8) + '...' + trade.signature.slice(-4),
        tradeType: trade.tradeType,
        tokenAmount: trade.tokenAmount,
        usdAmount: trade.usdAmount,
        protocol: trade.protocol,
        impact: trade.usdAmount > 100000 ? 'high' as const : 
                trade.usdAmount > 50000 ? 'medium' as const : 'low' as const
      }))

    return whaleActivities
  }

  async getTokenFlowData(tokenMint: string, timeframe: '24h' | '7d' | '30d' = '24h', apiKey?: string): Promise<TokenFlowData> {
    const trades = await this.fetchRealtimeTrades(tokenMint, apiKey)
    
    // Filter by timeframe
    const timeLimit = this.getTimeLimit(timeframe)
    const filteredTrades = trades.filter(trade => 
      new Date(trade.timestamp).getTime() > timeLimit
    )

    // Analyze inflows (what people sold to buy this token)
    const inflowMap = new Map<string, { volume: number; count: number; symbol: string }>()
    // Analyze outflows (what people bought after selling this token)  
    const outflowMap = new Map<string, { volume: number; count: number; symbol: string }>()

    filteredTrades.forEach(trade => {
      if (trade.tradeType === 'buy') {
        // Inflow: someone sold sideToken to buy our token
        const key = trade.sideToken
        const existing = inflowMap.get(key) || { volume: 0, count: 0, symbol: key }
        existing.volume += trade.sideUsdAmount
        existing.count += 1
        inflowMap.set(key, existing)
      } else {
        // Outflow: someone sold our token to buy sideToken
        const key = trade.sideToken
        const existing = outflowMap.get(key) || { volume: 0, count: 0, symbol: key }
        existing.volume += trade.sideUsdAmount
        existing.count += 1
        outflowMap.set(key, existing)
      }
    })

    // Calculate totals
    const totalInflowVolume = Array.from(inflowMap.values()).reduce((sum, item) => sum + item.volume, 0)
    const totalOutflowVolume = Array.from(outflowMap.values()).reduce((sum, item) => sum + item.volume, 0)

    // Format inflows
    const inflows = Array.from(inflowMap.entries())
      .map(([token, data]) => ({
        fromToken: token,
        fromSymbol: data.symbol,
        volume: data.volume,
        tradeCount: data.count,
        percentage: totalInflowVolume > 0 ? (data.volume / totalInflowVolume) * 100 : 0
      }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 5)

    // Format outflows
    const outflows = Array.from(outflowMap.entries())
      .map(([token, data]) => ({
        toToken: token,
        toSymbol: data.symbol,
        volume: data.volume,
        tradeCount: data.count,
        percentage: totalOutflowVolume > 0 ? (data.volume / totalOutflowVolume) * 100 : 0
      }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 5)

    return {
      inflows,
      outflows,
      netFlow: {
        totalInflow: totalInflowVolume,
        totalOutflow: totalOutflowVolume,
        netAmount: totalInflowVolume - totalOutflowVolume,
        netPercentage: (totalInflowVolume + totalOutflowVolume) > 0 
          ? ((totalInflowVolume - totalOutflowVolume) / (totalInflowVolume + totalOutflowVolume)) * 100 
          : 0
      }
    }
  }

  private getTimeLimit(timeframe: '24h' | '7d' | '30d'): number {
    const now = Date.now()
    switch (timeframe) {
      case '24h':
        return now - (24 * 60 * 60 * 1000)
      case '7d':
        return now - (7 * 24 * 60 * 60 * 1000)
      case '30d':
        return now - (30 * 24 * 60 * 60 * 1000)
      default:
        return now - (24 * 60 * 60 * 1000)
    }
  }

  clearCache(): void {
    this.cache.clear()
  }
}

export const bitqueryService = new BitQueryService()