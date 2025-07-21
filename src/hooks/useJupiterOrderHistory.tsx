
import { useState, useEffect, useCallback, useRef } from 'react'
import { useWallet } from './useWallet'
import { jupiterOrderHistoryService, ProcessedJupiterOrder } from '@/services/jupiterOrderHistoryService'

export function useJupiterOrderHistory() {
  const { wallets } = useWallet()
  const [orders, setOrders] = useState<ProcessedJupiterOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  
  // Track previous wallet addresses to detect actual changes
  const prevWalletAddressesRef = useRef<string[]>([])

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
      
      // Fetch both history and active orders
      const orderHistory = await jupiterOrderHistoryService.getOrderHistoryForWallets(walletAddresses, ['history', 'active'])
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

  // Only fetch when wallet addresses actually change (add/remove)
  useEffect(() => {
    const currentWalletAddresses = wallets.map(wallet => wallet.wallet_address).sort()
    const prevWalletAddresses = prevWalletAddressesRef.current

    // Check if wallet addresses have actually changed
    const addressesChanged = 
      currentWalletAddresses.length !== prevWalletAddresses.length ||
      currentWalletAddresses.some((addr, index) => addr !== prevWalletAddresses[index])

    if (addressesChanged) {
      console.log('[JupiterOrderHistory] Wallet addresses changed - fetching order history')
      console.log('[JupiterOrderHistory] Previous:', prevWalletAddresses)
      console.log('[JupiterOrderHistory] Current:', currentWalletAddresses)
      
      // Update the ref with current addresses
      prevWalletAddressesRef.current = currentWalletAddresses
      
      // Fetch order history
      fetchOrderHistory()
    }
  }, [wallets, fetchOrderHistory])

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
