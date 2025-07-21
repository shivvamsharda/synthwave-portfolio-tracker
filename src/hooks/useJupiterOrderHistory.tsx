
import { useState, useEffect, useCallback } from 'react'
import { useWallet } from './useWallet'
import { jupiterOrderHistoryService, ProcessedJupiterOrder } from '@/services/jupiterOrderHistoryService'

export function useJupiterOrderHistory() {
  const { wallets } = useWallet()
  const [orders, setOrders] = useState<ProcessedJupiterOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchOrderHistory = useCallback(async () => {
    if (wallets.length === 0) {
      setOrders([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const walletAddresses = wallets.map(wallet => wallet.wallet_address)
      console.log('[JupiterOrderHistory] Fetching order history for wallets:', walletAddresses)
      
      const orderHistory = await jupiterOrderHistoryService.getOrderHistoryForWallets(walletAddresses)
      console.log('[JupiterOrderHistory] Received order history:', orderHistory.length, 'orders')
      
      setOrders(orderHistory)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('[JupiterOrderHistory] Error fetching order history:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch order history')
    } finally {
      setLoading(false)
    }
  }, [wallets])

  // Initial fetch
  useEffect(() => {
    fetchOrderHistory()
  }, [fetchOrderHistory])

  // Listen for portfolio updates to refresh order history
  useEffect(() => {
    const handlePortfolioUpdate = () => {
      console.log('[JupiterOrderHistory] Portfolio updated - refreshing order history')
      fetchOrderHistory()
    }

    window.addEventListener('portfolio-updated', handlePortfolioUpdate)
    return () => {
      window.removeEventListener('portfolio-updated', handlePortfolioUpdate)
    }
  }, [fetchOrderHistory])

  const refreshOrderHistory = useCallback(() => {
    console.log('[JupiterOrderHistory] Manual refresh triggered')
    jupiterOrderHistoryService.clearCache()
    fetchOrderHistory()
  }, [fetchOrderHistory])

  return {
    orders,
    loading,
    error,
    lastUpdated,
    refreshOrderHistory
  }
}
