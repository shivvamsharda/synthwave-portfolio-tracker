
import { useState } from "react"
import { Button } from "@/components/ui/button"
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
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/80 border-b border-border/50 shadow-navbar">
      <div className="container flex h-20 items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center space-x-4 cursor-pointer" onClick={() => navigate("dashboard")}>
          <img 
            src="https://iktftsxuuiyeabxgdxzo.supabase.co/storage/v1/object/public/platform-logos//cryptic.png" 
            alt="Cryptic" 
            className="w-16 h-16 object-contain"
          />
          <div>
            <span className="text-2xl font-bold gradient-text">
              Cryptic
            </span>
            <div className="text-xs text-muted-foreground font-medium">Crypto Analytics Platform</div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2">
          <Button 
            variant="ghost" 
            onClick={handleHomeClick} 
            className="font-semibold text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200 px-4 py-2 rounded-xl"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate("dashboard")} 
            className="font-semibold text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200 px-4 py-2 rounded-xl"
          >
            Dashboard
          </Button>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          {/* Sign Out */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="hidden md:flex text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all duration-200"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4" />
          </Button>

          {/* Settings */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="hidden md:flex hover:bg-muted/50 rounded-xl transition-all duration-200"
            onClick={() => navigate("settings")}
          >
            <Settings className="w-4 h-4" />
          </Button>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden hover:bg-muted/50 rounded-xl"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl">
          <nav className="container px-6 py-6 space-y-2">
            <Button 
              variant="ghost" 
              onClick={handleHomeClick} 
              className="w-full justify-start hover:bg-primary/5 hover:text-primary rounded-xl font-medium"
            >
              <Home className="w-4 h-4 mr-3" />
              Home
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate("dashboard")} 
              className="w-full justify-start hover:bg-primary/5 hover:text-primary rounded-xl font-medium"
            >
              Dashboard
            </Button>
            <div className="border-t border-border/30 pt-4 mt-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate("settings")} 
                className="w-full justify-start hover:bg-primary/5 hover:text-primary rounded-xl font-medium"
              >
                <Settings className="w-4 h-4 mr-3" />
                Settings
              </Button>
              <Button 
                variant="ghost" 
                onClick={handleSignOut} 
                className="w-full justify-start text-muted-foreground hover:bg-destructive/5 hover:text-destructive rounded-xl font-medium"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
