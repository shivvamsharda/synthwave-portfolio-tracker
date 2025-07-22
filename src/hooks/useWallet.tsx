
import { useState, useEffect, useCallback } from 'react'
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react'
import { useAuth } from './useAuth'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from './use-toast'

interface WalletData {
  id: string
  wallet_address: string
  wallet_name: string
  is_primary: boolean
  created_at: string
}

export function useWallet() {
  const { publicKey, connected, disconnect, connecting, wallet } = useSolanaWallet()
  const { user } = useAuth()
  const { toast } = useToast()
  const [wallets, setWallets] = useState<WalletData[]>([])
  const [loading, setLoading] = useState(false)

  // Function to load wallets - defined first as we'll reference it
  const loadWallets = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading wallets:', error)
      } else {
        console.log('Wallets loaded:', data)
        setWallets(data || [])
      }
    } catch (error) {
      console.error('Error loading wallets:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Save wallet to database when connected
  const saveWalletToDatabase = useCallback(async (walletAddress: string, walletName = 'Solana Wallet') => {
    if (!walletAddress || !user) {
      console.error('Missing wallet address or user for saving wallet')
      return false
    }

    try {
      console.log('Saving wallet to database:', { walletAddress, userId: user.id })
      
      // Check if wallet already exists
      const { data: existingWallet, error: checkError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .eq('wallet_address', walletAddress)
        .single()

      if (checkError && !checkError.message.includes('No rows found')) {
        console.error('Error checking existing wallet:', checkError)
        toast({
          title: "Error",
          description: "Failed to check existing wallet",
          variant: "destructive",
        })
        return false
      }

      if (existingWallet) {
        console.log('Wallet already exists in database:', existingWallet)
        // We don't need to do anything, but we'll count this as success
        return true
      }

      // Insert new wallet
      const { error: insertError } = await supabase
        .from('wallets')
        .insert({
          user_id: user.id,
          wallet_address: walletAddress,
          wallet_name: walletName,
          is_primary: wallets.length === 0 // First wallet is primary
        })

      if (insertError) {
        console.error('Error saving wallet:', insertError)
        toast({
          title: "Error",
          description: "Failed to save wallet to database",
          variant: "destructive",
        })
        return false
      } else {
        toast({
          title: "Success",
          description: "Wallet connected successfully!",
        })
        // Refresh wallets list
        await loadWallets()
        return true
      }
    } catch (error) {
      console.error('Error saving wallet:', error)
      return false
    }
  }, [user, wallets.length, toast, loadWallets])

  // Save wallet when connected - watches for wallet connection
  useEffect(() => {
    if (connected && publicKey && user) {
      console.log('Wallet connected, attempting to save to database...')
      const walletAddress = publicKey.toString()
      const walletName = wallet?.adapter?.name ? `${wallet.adapter.name} Wallet` : 'Solana Wallet'
      saveWalletToDatabase(walletAddress, walletName)
    }
  }, [connected, publicKey, user, wallet, saveWalletToDatabase])

  // Load user's wallets - watches for user login
  useEffect(() => {
    if (user) {
      console.log('User logged in, loading wallets')
      loadWallets()
    } else {
      // Clear wallets when user logs out
      setWallets([])
    }
  }, [user, loadWallets])

  const deleteWallet = async (walletId: string) => {
    try {
      const { error } = await supabase
        .from('wallets')
        .delete()
        .eq('id', walletId)
        .eq('user_id', user?.id)

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete wallet",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Wallet deleted successfully, refreshing data...",
        })
        // Refresh wallets list immediately
        await loadWallets()
      }
    } catch (error) {
      console.error('Error deleting wallet:', error)
    }
  }

  return {
    // Solana wallet adapter state
    publicKey,
    connected,
    disconnect,
    connecting,
    wallet,
    // Database wallets
    wallets,
    loading,
    deleteWallet,
    refreshWallets: loadWallets,
    saveWalletToDatabase
  }
}
