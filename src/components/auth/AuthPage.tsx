
import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Wallet, Mail, Lock, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { EmailConfirmationPage } from "./EmailConfirmationPage"
import { SolanaSignInButton } from "./SolanaSignInButton"
import { useNavigate } from "react-router-dom"

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false)
  const [confirmationEmail, setConfirmationEmail] = useState("")
  const { signIn, signUp } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password)

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      } else if (!isLogin) {
        setConfirmationEmail(email)
        setShowEmailConfirmation(true)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (showEmailConfirmation) {
    return (
      <EmailConfirmationPage 
        email={confirmationEmail}
        onBack={() => {
          setShowEmailConfirmation(false)
          setIsLogin(true)
          setEmail("")
          setPassword("")
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-hero overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-50 border border-border/20 bg-background/20 backdrop-blur-xl shadow-lg mx-4 mt-4 rounded-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-4 flex h-16 items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="https://iktftsxuuiyeabxgdxzo.supabase.co/storage/v1/object/public/platform-logos//cryptic.png" 
              alt="Cryptic" 
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold gradient-text">Cryptic</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")}
              className="text-foreground hover:text-primary"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </nav>

      {/* Auth Content */}
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-8rem)]">
        <DashboardCard className="w-full max-w-md p-8">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-primary rounded-full flex items-center justify-center">
            <Wallet className="w-8 h-8 text-primary-foreground" />
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-2 text-center">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-muted-foreground mb-8 text-center">
            {isLogin 
              ? "Sign in to access your crypto portfolio" 
              : "Create an account to start tracking your crypto assets"
            }
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isLogin ? "Signing In..." : "Creating Account..."}
                </>
              ) : (
                isLogin ? "Sign In" : "Sign Up"
              )}
            </Button>
          </form>

          <div className="my-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
          </div>

          <SolanaSignInButton />

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline text-sm"
              disabled={loading}
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </button>
          </div>
        </DashboardCard>
      </div>
    </div>
  )
}
