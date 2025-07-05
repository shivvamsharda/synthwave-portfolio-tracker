import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useAuth } from "@/hooks/useAuth"
import { useWallet } from "@/hooks/useWallet"
import { Settings, Menu, X, LogOut } from "lucide-react"

interface HeaderProps {
  onNavigate?: (page: "dashboard" | "wallets" | "nfts" | "yield" | "settings") => void
}

export function Header({ onNavigate }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { signOut } = useAuth()
  const { publicKey } = useWallet()

  const navigate = (page: "dashboard" | "wallets" | "nfts" | "yield" | "settings") => {
    onNavigate?.(page)
    setIsMobileMenuOpen(false)
  }

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate("dashboard")}>
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-primary-foreground font-bold text-lg">₿</span>
          </div>
          <div>
            <span className="text-xl font-bold text-foreground">
              CryptoFolio
            </span>
            <div className="text-xs text-muted-foreground">Portfolio Dashboard</div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <Button variant="ghost" onClick={() => navigate("dashboard")} className="font-medium">
            Dashboard
          </Button>
          <Button variant="ghost" onClick={() => navigate("wallets")} className="font-medium">
            Wallets
          </Button>
          <Button variant="ghost" onClick={() => navigate("nfts")} className="font-medium">
            NFTs
          </Button>
          <Button variant="ghost" onClick={() => navigate("yield")} className="font-medium">
            Yield
          </Button>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          {/* Wallet Connection */}
          <div className="hidden sm:block">
            <WalletMultiButton className="!bg-primary !text-primary-foreground hover:!bg-primary/90 !rounded-md !text-sm !font-medium !px-4 !py-2" />
          </div>

          {/* Sign Out */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="hidden md:flex text-muted-foreground hover:text-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4" />
          </Button>

          {/* Settings */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="hidden md:flex"
            onClick={() => navigate("settings")}
          >
            <Settings className="w-4 h-4" />
          </Button>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <DashboardCard className="md:hidden m-4 p-4 animate-slide-up">
          <nav className="flex flex-col space-y-2">
            {/* Mobile Wallet Connection */}
            <div className="sm:hidden mb-4">
              <WalletMultiButton className="!bg-primary !text-primary-foreground hover:!bg-primary/90 !rounded-md !text-sm !font-medium !px-4 !py-2 !w-full" />
            </div>
            
            <Button variant="ghost" onClick={() => navigate("dashboard")} className="justify-start">
              Dashboard
            </Button>
            <Button variant="ghost" onClick={() => navigate("wallets")} className="justify-start">
              Wallets
            </Button>
            <Button variant="ghost" onClick={() => navigate("nfts")} className="justify-start">
              NFTs
            </Button>
            <Button variant="ghost" onClick={() => navigate("yield")} className="justify-start">
              Yield
            </Button>
            <Button variant="ghost" onClick={() => navigate("settings")} className="justify-start">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="ghost" onClick={handleSignOut} className="justify-start text-muted-foreground">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </nav>
        </DashboardCard>
      )}
    </header>
  )
}