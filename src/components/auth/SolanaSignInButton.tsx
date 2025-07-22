
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { useWallet as useWalletHook } from "@/hooks/useWallet"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

export function SolanaSignInButton() {
  const wallet = useWallet()
  const { signInWithSolanaWallet } = useAuth()
  const { saveWalletToDatabase } = useWalletHook()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Automatically sign in when wallet connects
  useEffect(() => {
    const handleAutoSignIn = async () => {
      if (wallet.connected && wallet.wallet && !loading) {
        console.log('Wallet connected, auto-signing in...', {
          connected: wallet.connected,
          hasWallet: !!wallet.wallet,
          walletName: wallet.wallet?.adapter?.name,
          publicKey: wallet.publicKey?.toString()
        })

        setLoading(true)
        try {
          console.log('Attempting automatic Solana sign in...')
          const { error, success } = await signInWithSolanaWallet(wallet)
          
          if (error) {
            console.error('Auto sign in error:', error)
            toast({
              title: "Sign In Failed",
              description: `${error.message || 'Unknown error'} - Check console for details`,
              variant: "destructive",
            })
          } else if (success) {
            console.log('Auto sign in successful!')
            
            // After successful login, explicitly save the wallet details
            if (wallet.publicKey) {
              const walletAddress = wallet.publicKey.toString()
              const walletName = wallet.wallet?.adapter?.name ? `${wallet.wallet.adapter.name} Wallet` : 'Solana Wallet'
              
              console.log('Saving connected wallet after authentication:', walletAddress)
              const saved = await saveWalletToDatabase(walletAddress, walletName)
              
              if (saved) {
                toast({
                  title: "Success",
                  description: "Successfully signed in with Solana wallet",
                })
                
                // Navigate to dashboard after successful login
                navigate('/dashboard')
              }
            }
          }
        } catch (error) {
          console.error('Unexpected error in auto sign-in:', error)
          toast({
            title: "Error",
            description: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'} - Check console for details`,
            variant: "destructive",
          })
        } finally {
          setLoading(false)
        }
      }
    }

    handleAutoSignIn()
  }, [wallet.connected, wallet.wallet, wallet.publicKey, signInWithSolanaWallet, toast, loading, saveWalletToDatabase, navigate])

  return (
    <div className="w-full space-y-3">
      <div className="text-center">
        <h3 className="text-lg font-medium text-foreground mb-1">Login with Solana</h3>
        <p className="text-sm text-muted-foreground">Connect your wallet to continue</p>
      </div>
      
      {loading ? (
        <Button 
          variant="outline"
          className="w-full"
          disabled
        >
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Signing In...
        </Button>
      ) : (
        <div className="flex justify-center">
          <WalletMultiButton className="!bg-gradient-primary !text-primary-foreground !border-0 !rounded-lg !h-11 !font-medium hover:!opacity-90 transition-opacity !mx-auto !block" />
        </div>
      )}
    </div>
  )
}
