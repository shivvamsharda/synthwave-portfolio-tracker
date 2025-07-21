
interface JupiterOrder {
  userPubkey: string
  orderKey: string
  inputMint: string
  outputMint: string
  makingAmount: string
  takingAmount: string
  remainingMakingAmount: string
  remainingTakingAmount: string
  rawMakingAmount: string
  rawTakingAmount: string
  rawRemainingMakingAmount: string
  rawRemainingTakingAmount: string
  slippageBps: string
  slTakingAmount: string
  rawSlTakingAmount: string
  expiredAt: string | null
  createdAt: string
  updatedAt: string
  status: 'Completed' | 'Cancelled' | 'Active' | 'Expired'
  openTx: string
  closeTx: string | null
  programVersion: string
  trades: JupiterTrade[]
}

interface JupiterTrade {
  orderKey: string
  keeper: string
  inputMint: string
  outputMint: string
  inputAmount: string
  outputAmount: string
  rawInputAmount: string
  rawOutputAmount: string
  feeMint: string
  feeAmount: string
  rawFeeAmount: string
  txId: string
  confirmedAt: string
  action: 'Fill'
  productMeta: any
}

interface JupiterOrderHistoryResponse {
  orders: JupiterOrder[]
  totalPages: number
  page: number
  totalItems: number
  user: string
  orderStatus: string
}

export interface ProcessedJupiterOrder {
  orderKey: string
  userPubkey: string
  inputMint: string
  outputMint: string
  inputSymbol: string
  outputSymbol: string
  inputName: string
  outputName: string
  makingAmount: number
  takingAmount: number
  executedAmount: number
  executedValue: number
  status: string
  createdAt: Date
  updatedAt: Date
  tradesCount: number
  openTx: string
  closeTx: string | null
  trades: JupiterTrade[]
}

export class JupiterOrderHistoryService {
  private static readonly JUPITER_ORDERS_API = 'https://lite-api.jup.ag/trigger/v1/getTriggerOrders'
  private static orderCache: Map<string, { data: ProcessedJupiterOrder[], timestamp: number }> = new Map()
  private static readonly CACHE_DURATION = 30 * 1000 // 30 seconds

  /**
   * Get order history for a specific wallet
   */
  static async getOrderHistory(
    walletAddress: string, 
    orderStatus: 'history' | 'active' = 'history',
    page: number = 1
  ): Promise<ProcessedJupiterOrder[]> {
    const cacheKey = `${walletAddress}-${orderStatus}-${page}`
    const now = Date.now()
    
    // Check cache first
    const cached = this.orderCache.get(cacheKey)
    if (cached && now - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      console.log(`Fetching Jupiter order history for ${walletAddress}...`)
      
      const url = new URL(this.JUPITER_ORDERS_API)
      url.searchParams.set('user', walletAddress)
      url.searchParams.set('orderStatus', orderStatus)
      url.searchParams.set('page', page.toString())

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        console.error('Jupiter Orders API error:', response.status, response.statusText)
        return []
      }

      const data: JupiterOrderHistoryResponse = await response.json()
      const processedOrders = await this.processOrders(data.orders)
      
      // Cache the results
      this.orderCache.set(cacheKey, { data: processedOrders, timestamp: now })
      
      console.log(`Fetched ${processedOrders.length} orders for ${walletAddress}`)
      return processedOrders
    } catch (error) {
      console.error('Error fetching Jupiter order history:', error)
      return []
    }
  }

  /**
   * Get order history for multiple wallets
   */
  static async getOrderHistoryForWallets(walletAddresses: string[]): Promise<ProcessedJupiterOrder[]> {
    if (walletAddresses.length === 0) return []

    try {
      const orderPromises = walletAddresses.map(address => 
        this.getOrderHistory(address, 'history', 1)
      )
      
      const orderResults = await Promise.all(orderPromises)
      const allOrders = orderResults.flat()
      
      // Sort by creation date (newest first)
      return allOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    } catch (error) {
      console.error('Error fetching order history for multiple wallets:', error)
      return []
    }
  }

  /**
   * Process raw Jupiter orders into displayable format
   */
  private static async processOrders(orders: JupiterOrder[]): Promise<ProcessedJupiterOrder[]> {
    if (orders.length === 0) return []

    // Get all unique mints for metadata lookup
    const mints = new Set<string>()
    orders.forEach(order => {
      mints.add(order.inputMint)
      mints.add(order.outputMint)
    })

    // Import services dynamically to avoid circular dependencies
    const { tokenMetadataService } = await import('./tokenMetadataService')
    const metadata = await tokenMetadataService.getTokensMetadata(Array.from(mints))

    return orders.map(order => {
      const inputMetadata = metadata[order.inputMint]
      const outputMetadata = metadata[order.outputMint]
      
      // Calculate executed amounts
      const makingAmount = parseFloat(order.makingAmount)
      const remainingAmount = parseFloat(order.remainingMakingAmount)
      const executedAmount = makingAmount - remainingAmount
      
      // Calculate executed value from trades
      const executedValue = order.trades.reduce((total, trade) => {
        return total + parseFloat(trade.outputAmount)
      }, 0)

      return {
        orderKey: order.orderKey,
        userPubkey: order.userPubkey,
        inputMint: order.inputMint,
        outputMint: order.outputMint,
        inputSymbol: inputMetadata?.symbol || this.shortenMint(order.inputMint),
        outputSymbol: outputMetadata?.symbol || this.shortenMint(order.outputMint),
        inputName: inputMetadata?.name || 'Unknown Token',
        outputName: outputMetadata?.name || 'Unknown Token',
        makingAmount,
        takingAmount: parseFloat(order.takingAmount),
        executedAmount,
        executedValue,
        status: order.status,
        createdAt: new Date(order.createdAt),
        updatedAt: new Date(order.updatedAt),
        tradesCount: order.trades.length,
        openTx: order.openTx,
        closeTx: order.closeTx,
        trades: order.trades
      }
    })
  }

  /**
   * Shorten mint address for display
   */
  private static shortenMint(mint: string): string {
    if (mint.length <= 8) return mint
    return `${mint.slice(0, 4)}...${mint.slice(-4)}`
  }

  /**
   * Clear cache
   */
  static clearCache(): void {
    this.orderCache.clear()
  }
}

export const jupiterOrderHistoryService = JupiterOrderHistoryService
