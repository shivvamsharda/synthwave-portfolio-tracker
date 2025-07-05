import { ReactNode } from "react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"

interface AuthGuardProps {
  children: ReactNode
}

// Mock authentication state - will be replaced with real Supabase auth
const isAuthenticated = false // This should come from Supabase auth context

function LoginScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <DashboardCard className="w-full max-w-md p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 bg-gradient-primary rounded-full flex items-center justify-center">
          <Wallet className="w-8 h-8 text-primary-foreground" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Welcome to CryptoFolio
        </h1>
        <p className="text-muted-foreground mb-8">
          Connect your wallet to start tracking your crypto portfolio
        </p>
        
        <div className="space-y-4">
          <Button 
            variant="primary" 
            className="w-full"
            onClick={() => {
              // This will be replaced with real wallet connection
              console.log("Connect Ethereum wallet")
            }}
          >
            <Wallet className="w-4 h-4 mr-2" />
            Connect Ethereum Wallet
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              // This will be replaced with real Solana wallet connection
              console.log("Connect Solana wallet")
            }}
          >
            <Wallet className="w-4 h-4 mr-2" />
            Connect Solana Wallet
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-6">
          Your private keys never leave your device. We only read public wallet addresses.
        </p>
      </DashboardCard>
    </div>
  )
}

export function AuthGuard({ children }: AuthGuardProps) {
  if (!isAuthenticated) {
    return <LoginScreen />
  }
  
  return <>{children}</>
}