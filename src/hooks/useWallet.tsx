import { useState, useEffect } from 'react'
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
  const { publicKey, connected, disconnect, connecting } = useSolanaWallet()
  const { user } = useAuth()
  const { toast } = useToast()
  const [wallets, setWallets] = useState<WalletData[]>([])
  const [loading, setLoading] = useState(false)

  // Save wallet to database when connected
  useEffect(() => {
    if (connected && publicKey && user) {
      saveWalletToDatabase()
    }
  }, [connected, publicKey, user])

  // Load user's wallets
  useEffect(() => {
    if (user) {
      loadWallets()
    }
  }, [user])

  const saveWalletToDatabase = async () => {
    if (!publicKey || !user) return

    try {
      const walletAddress = publicKey.toString()
      
      // Check if wallet already exists
      const { data: existingWallet } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .eq('wallet_address', walletAddress)
        .single()

      if (!existingWallet) {
        // Insert new wallet
        const { error } = await supabase
          .from('wallets')
          .insert({
            user_id: user.id,
            wallet_address: walletAddress,
            wallet_name: 'Solana Wallet',
            is_primary: wallets.length === 0 // First wallet is primary
          })

        if (error) {
          console.error('Error saving wallet:', error)
          toast({
            title: "Error",
            description: "Failed to save wallet to database",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Success",
            description: "Wallet connected successfully! Refreshing portfolio...",
          })
          // Refresh wallets first, then portfolio will auto-refresh via useEffect
          await loadWallets()
        }
      }
    } catch (error) {
      console.error('Error saving wallet:', error)
    }
  }

  const loadWallets = async () => {
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
        setWallets(data || [])
      }
    } catch (error) {
      console.error('Error loading wallets:', error)
    } finally {
      setLoading(false)
    }
  }

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
    // Database wallets
    wallets,
    loading,
    deleteWallet,
    refreshWallets: loadWallets
  }
}