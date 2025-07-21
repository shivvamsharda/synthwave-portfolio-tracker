
import React, { FC, ReactNode, useMemo, useEffect } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { GlowWalletAdapter } from '@solana/wallet-adapter-glow'
import { SlopeWalletAdapter } from '@solana/wallet-adapter-slope'
import { TorusWalletAdapter } from '@solana/wallet-adapter-torus'
import { clusterApiUrl } from '@solana/web3.js'
import { useApiKeys } from '@/hooks/useApiKeys'

// Import default styles
import '@solana/wallet-adapter-react-ui/styles.css'

interface SolanaWalletProviderProps {
  children: ReactNode
}

export const SolanaWalletProvider: FC<SolanaWalletProviderProps> = ({ children }) => {
  const { apiKeys } = useApiKeys()
  
  // Clear wallet adapter cache on mount to prevent auto-selection
  useEffect(() => {
    try {
      localStorage.removeItem('walletName')
      sessionStorage.removeItem('walletName')
    } catch (error) {
      console.warn('Could not clear wallet cache:', error)
    }
  }, [])
  
  // Use mainnet RPC from Supabase secrets, fallback to Helius
  const endpoint = useMemo(() => {
    return apiKeys.solanaRpcUrl || 'https://mainnet.helius-rpc.com/?api-key=4489f099-8307-4b7f-b48c-8ea926316e15'
  }, [apiKeys.solanaRpcUrl])

  // Only include wallets that don't auto-register as Standard Wallets
  // Phantom, Solflare, and Backpack now auto-register, so we exclude them
  const wallets = useMemo(
    () => [
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
