import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAuth } from "@/hooks/useAuth"
import { useNavigate } from "react-router-dom"
import { Settings, Menu, X, LogOut, Home } from "lucide-react"

interface HeaderProps {
  onNavigate?: (page: "dashboard" | "wallets" | "nfts" | "yield" | "analytics" | "settings") => void
}

export function Header({ onNavigate }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { signOut } = useAuth()
  const navigateToRoute = useNavigate()

  const navigate = (page: "dashboard" | "wallets" | "nfts" | "yield" | "analytics" | "settings") => {
    onNavigate?.(page)
    setIsMobileMenuOpen(false)
  }

  const handleHomeClick = () => {
    navigateToRoute("/")
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
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm">
            <img 
              src="https://iktftsxuuiyeabxgdxzo.supabase.co/storage/v1/object/public/platform-logos//Neptune%20AI%20Logo%20Transparent.png" 
              alt="Neptune AI" 
              className="w-8 h-8 object-contain"
            />
          </div>
          <div>
            <span className="text-xl font-bold text-white">
              Neptune AI
            </span>
            <div className="text-xs text-muted-foreground">AI-Powered Analytics</div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <Button variant="ghost" onClick={handleHomeClick} className="font-medium">
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
          <Button variant="ghost" onClick={() => navigate("dashboard")} className="font-medium">
            Dashboard
          </Button>
          <Button variant="ghost" onClick={() => navigate("wallets")} className="font-medium">
            Wallets
          </Button>
          <Button variant="ghost" onClick={() => navigate("analytics")} className="font-medium">
            Analytics
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
            <Button variant="ghost" onClick={handleHomeClick} className="justify-start">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <Button variant="ghost" onClick={() => navigate("dashboard")} className="justify-start">
              Dashboard
            </Button>
            <Button variant="ghost" onClick={() => navigate("wallets")} className="justify-start">
              Wallets
            </Button>
            <Button variant="ghost" onClick={() => navigate("analytics")} className="justify-start">
              Analytics
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