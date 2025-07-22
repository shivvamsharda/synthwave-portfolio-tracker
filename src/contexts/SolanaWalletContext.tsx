
import React, { FC, ReactNode, useMemo, useEffect } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { GlowWalletAdapter } from '@solana/wallet-adapter-glow'
import { SlopeWalletAdapter } from '@solana/wallet-adapter-slope'
import { TorusWalletAdapter } from '@solana/wallet-adapter-torus'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import { clusterApiUrl } from '@solana/web3.js'
import { useApiKeys } from '@/hooks/useApiKeys'
import { useToast } from '@/hooks/use-toast'

// Import default styles
import '@solana/wallet-adapter-react-ui/styles.css'

interface SolanaWalletProviderProps {
  children: ReactNode
}

export const SolanaWalletProvider: FC<SolanaWalletProviderProps> = ({ children }) => {
  const { apiKeys } = useApiKeys()
  const { toast } = useToast()
  
  // Clear wallet adapter cache on mount to prevent auto-selection
  useEffect(() => {
    try {
      localStorage.removeItem('walletName')
      sessionStorage.removeItem('walletName')
    } catch (error) {
      console.warn('Could not clear wallet cache:', error)
    }
  }, [])
  
  // Use mainnet RPC from Supabase secrets, fallback to Helius, then Alchemy
  const endpoint = useMemo(() => {
    if (apiKeys.solanaRpcUrl) {
      console.log('Using Supabase RPC URL')
      return apiKeys.solanaRpcUrl
    }
    // Primary fallback: Helius
    console.log('Using Helius fallback RPC URL')
    return 'https://mainnet.helius-rpc.com/?api-key=4489f099-8307-4b7f-b48c-8ea926316e15'
    // Note: Alchemy fallback will be handled by the connection provider's retry logic
  }, [apiKeys.solanaRpcUrl])

  // Include all wallets, including those that auto-register
  // We want to ensure all wallet options are available
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new GlowWalletAdapter(),
      new SlopeWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    []
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
