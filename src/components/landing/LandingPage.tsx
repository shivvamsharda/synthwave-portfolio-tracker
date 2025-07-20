import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, TrendingUp, Activity, BarChart3, Zap, Shield, Globe, CheckCircle, MessageSquare, Bell, Users, Wallet, Menu, X, Eye, GitBranch, Layers, Clock } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import { DashboardPreview } from "./DashboardPreview"
import { MessagingPreview } from "./MessagingPreview"
import { MobileDashboardPreview } from "./MobileDashboardPreview"
import { AnimatedLineChart, AnimatedBarChart, CountingNumber } from "./AnimatedChart"
import { useIsMobile } from "@/hooks/use-mobile"

export function LandingPage() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [visibleCards, setVisibleCards] = useState<number[]>([])
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = cardRefs.current.indexOf(entry.target as HTMLDivElement)
          if (entry.isIntersecting && index !== -1) {
            setTimeout(() => {
              setVisibleCards(prev => [...new Set([...prev, index])])
            }, index * 100) // Stagger animation by 100ms
          }
        })
      },
      { threshold: 0.1, rootMargin: '50px' }
    )

    cardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => {
      cardRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref)
      })
    }
  }, [])

  const features = [
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Total Earnings Analytics",
      description: "Track your portfolio performance with real-time value calculations and detailed earning breakdowns.",
      value: "$2,847,329",
      change: "+12.5%",
      period: "24h"
    },
    {
      icon: <Activity className="h-8 w-8" />,
      title: "Real-Time Analytics",
      description: "Monitor live market movements and transaction flows across all your connected wallets.",
      value: "1,247",
      change: "+8.2%",
      period: "Active Tokens"
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Advanced Insights",
      description: "Get deep analytics on token flows, holder movements, and market sentiment analysis.",
      value: "847",
      change: "+15.7%",
      period: "Insights Generated"
    }
  ]

  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for getting started with Neptune AI analytics",
      features: [
        "Up to 3 wallet connections",
        "Basic portfolio tracking",
        "24-hour data history",
        "Community support"
      ],
      highlighted: false
    },
    {
      name: "Professional",
      price: "$29",
      description: "Advanced analytics for serious Web3 users and traders",
      features: [
        "Unlimited wallet connections",
        "Real-time analytics",
        "90-day data history",
        "Advanced charting tools",
        "Email notifications",
        "Priority support"
      ],
      highlighted: true
    },
    {
      name: "Enterprise",
      price: "$99",
      description: "Complete solution for institutions and power users",
      features: [
        "Everything in Professional",
        "Custom analytics dashboard",
        "API access",
        "White-label options",
        "Dedicated account manager",
        "Custom integrations"
      ],
      highlighted: false
    }
  ]

  // Sample data for animations
  const portfolioData = [1200, 1350, 1180, 1620, 1890, 2100, 1950, 2340, 2680, 2470, 2847];
  const analyticsData = [420, 380, 510, 490, 650, 720, 680, 820, 960, 1050, 1247];
  const insightsData = [120, 185, 210, 340, 420, 380, 520, 610, 730, 680, 847];

  return (
    <div className="min-h-screen bg-gradient-hero overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-50 border border-border/20 bg-background/20 backdrop-blur-xl shadow-lg mx-4 mt-4 rounded-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-4 flex h-16 items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="https://iktftsxuuiyeabxgdxzo.supabase.co/storage/v1/object/public/platform-logos/Neptune%20AI%20Logo%20Transparent.png" 
              alt="Neptune AI Logo" 
              className="h-8 w-8 object-contain"
            />
            <span className="text-lg sm:text-xl font-bold gradient-text">Neptune AI</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Features
            </a>
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2.5 border-primary/30 hover:bg-primary/10 hover:shadow-glow transition-all duration-300 font-medium"
            >
              Sign In
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-primary transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border/10 shadow-xl">
            <div className="px-4 py-6 space-y-4">
              <a 
                href="#features" 
                className="block text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <Button 
                variant="outline" 
                onClick={() => {
                  navigate('/dashboard')
                  setMobileMenuOpen(false)
                }}
                className="w-full mt-4 border-primary/30 hover:bg-primary/10 hover:shadow-glow transition-all duration-300 font-medium"
              >
                Sign In
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative py-8 sm:py-12 lg:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero"></div>
        
        {/* Background Elements */}
        <div className="absolute top-20 left-4 sm:left-10 w-24 sm:w-32 h-24 sm:h-32 bg-primary/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-4 sm:right-10 w-32 sm:w-48 h-32 sm:h-48 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            {/* Left Side - Text Content */}
            <div className="lg:col-span-5 space-y-6 sm:space-y-8 animate-slide-up text-center lg:text-left">
              <Badge variant="secondary" className="bg-primary/10 border-primary/20 text-primary animate-pulse-glow w-fit mx-auto lg:mx-0 mb-2">
                <Zap className="mr-2 h-4 w-4" />
                <span className="text-xs sm:text-sm">Version 1.3 is available now</span>
              </Badge>
              
              <div className="space-y-6 sm:space-y-8">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight tracking-tight">
                  <span className="text-white font-bold">
                    Advanced Crypto Analytics{" "}
                    <span className="block sm:inline gradient-text">Powered by AI</span>
                  </span>
                </h1>
                
                <p className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0">
                  Track your entire crypto portfolio with AI-powered insights. Monitor whale movements, analyze token risks, discover trending opportunities, and get real-time alerts across all major blockchains.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-4 justify-center lg:justify-start">
                <Button 
                  size={isMobile ? "default" : "lg"}
                  onClick={() => navigate('/dashboard')} 
                  className="web3-button group px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base w-full sm:w-auto"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size={isMobile ? "default" : "lg"}
                  className="border-primary/30 hover:bg-primary/10 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-medium w-full sm:w-auto"
                >
                  Watch Demo
                </Button>
              </div>
              
              {/* User Avatars Section - Hidden on mobile for cleaner look */}
              <div className="hidden sm:flex items-center space-x-4 pt-4 justify-center lg:justify-start">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((_, i) => (
                    <div
                      key={i}
                      className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-gradient-primary border-2 border-background flex items-center justify-center text-xs sm:text-sm font-semibold text-primary-foreground"
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground text-sm sm:text-base">Over 50+ Users</span>
                  <br />
                  <span className="text-muted-foreground">Join our growing community</span>
                </div>
              </div>
            </div>
            
            {/* Right Side - Dashboard Preview */}
            <div className="lg:col-span-7 relative animate-slide-in-right overflow-visible">
              {isMobile ? (
                <div className="flex justify-center mt-8 lg:mt-0">
                  <MobileDashboardPreview />
                </div>
              ) : (
                <DashboardPreview />
              )}
            </div>
          </div>
        </div>
      </section>
      {/* Platform Features Section */}
      <section id="features" className="py-12 sm:py-16 lg:py-24 relative">
        <div className="container px-4 sm:px-6">
          <div className="text-center space-y-4 mb-12 sm:mb-16 animate-slide-up">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              <span className="gradient-text">Platform Features</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Advanced analytics and monitoring tools designed for Web3 professionals and traders.
            </p>
          </div>
          
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
            {[
              {
                icon: <BarChart3 className="h-6 w-6" />,
                title: "Custom Token Analytics",
                description: "Get deep insights on any token by mint address or symbol, including volume, holders, market cap, and more."
              },
              {
                icon: <TrendingUp className="h-6 w-6" />,
                title: "Trending Token Radar",
                description: "Live feed of top-performing tokens across timeframes. Discover what's gaining momentum and why."
              },
              {
                icon: <Shield className="h-6 w-6" />,
                title: "AI Risk Assessment",
                description: "Instantly evaluate token risk with AI-driven scores across price volatility, whale activity, liquidity, and social signals."
              },
              {
                icon: <Users className="h-6 w-6" />,
                title: "Holder Movement Tracking",
                description: "Visualize wallet behavior—new holders, exits, transfers, and volume movement across time ranges."
              },
              {
                icon: <Eye className="h-6 w-6" />,
                title: "Whale Tracker",
                description: "Identify and follow whale wallet actions. Monitor their inflows/outflows, timing, and holding patterns."
              },
              {
                icon: <GitBranch className="h-6 w-6" />,
                title: "Token Flow Analysis",
                description: "Trace token movements across wallets and protocols. Understand how capital flows in and out of ecosystems."
              },
              {
                icon: <Layers className="h-6 w-6" />,
                title: "Multi-Chain Support",
                description: "Seamlessly track tokens and analytics across Solana, Ethereum, and more—without switching dashboards."
              },
              {
                icon: <Clock className="h-6 w-6" />,
                title: "Real-Time Updates",
                description: "Every metric auto-refreshes, giving you always-on insights without needing to reload or re-analyze."
              }
            ].map((feature, index) => (
              <div 
                key={index}
                ref={(el) => (cardRefs.current[index] = el)}
                className={`
                  relative group cursor-pointer p-6 space-y-4 rounded-xl border border-border/20 
                  bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm
                  hover:scale-[1.03] hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/30
                  hover:bg-gradient-to-br hover:from-card/80 hover:to-card/60
                  transition-all duration-300 ease-in-out overflow-hidden
                  ${visibleCards.includes(index) 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-8'
                  }
                `}
                style={{ 
                  transitionDelay: visibleCards.includes(index) ? '0ms' : `${index * 100}ms`,
                }}
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 via-accent/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Icon container with enhanced animations */}
                <div className={`
                  relative p-3 rounded-lg bg-primary/10 text-primary w-fit
                  group-hover:bg-primary/20 group-hover:scale-110 group-hover:rotate-3
                  transition-all duration-300 ease-out
                  ${visibleCards.includes(index) 
                    ? 'scale-100 opacity-100' 
                    : 'scale-80 opacity-0'
                  }
                `}
                style={{ 
                  transitionDelay: visibleCards.includes(index) ? `${index * 100 + 200}ms` : '0ms',
                }}>
                  <div className="group-hover:animate-pulse">
                    {feature.icon}
                  </div>
                  
                  {/* Icon glow effect on hover */}
                  <div className="absolute inset-0 rounded-lg bg-primary/20 blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
                </div>
                
                <div className="relative space-y-2">
                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-200">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground group-hover:text-foreground/80 leading-relaxed transition-colors duration-200">
                    {feature.description}
                  </p>
                </div>
                
                {/* Bottom accent line that expands on hover */}
                <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary to-accent w-0 group-hover:w-full transition-all duration-500 ease-out"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Messaging Integration Section */}
      <section className="py-12 sm:py-16 lg:py-24 relative">
        <div className="container px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            {/* Left Side - Messaging Preview */}
            <div className="space-y-6 sm:space-y-8 animate-slide-up order-2 lg:order-1">
              <div className="space-y-4 sm:space-y-6 text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                  <span className="text-foreground">Realtime Messaging</span>
                  <br />
                  <span className="gradient-text">Integration</span>
                </h2>
                
                <div className="flex justify-center lg:justify-start">
                  <MessagingPreview />
                </div>
              </div>
            </div>
            
            {/* Right Side - Features */}
            <div className="space-y-6 sm:space-y-8 animate-slide-in-right order-1 lg:order-2">
              <div className="space-y-4 sm:space-y-6 text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                  <span className="text-foreground">Realtime Notification</span>
                  <br />
                  <span className="gradient-text">Integration</span>
                </h2>
                
                <p className="text-base sm:text-lg text-muted-foreground">
                  Stay connected with your portfolio through instant notifications, 
                  real-time alerts, and collaborative messaging features.
                </p>
              </div>
              
              <div className="grid gap-3 sm:gap-4">
                {[
                  { icon: <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />, text: "Instant portfolio updates", delay: '0.2s' },
                  { icon: <Bell className="h-4 w-4 sm:h-5 sm:w-5" />, text: "Smart alert system", delay: '0.4s' },
                  { icon: <Users className="h-4 w-4 sm:h-5 sm:w-5" />, text: "Team collaboration", delay: '0.6s' },
                  { icon: <Wallet className="h-4 w-4 sm:h-5 sm:w-5" />, text: "Multi-wallet notifications", delay: '0.8s' }
                ].map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg bg-card/50 border border-border/20 animate-slide-in-right"
                    style={{ animationDelay: item.delay }}
                  >
                    <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                      {item.icon}
                    </div>
                    <span className="text-sm sm:text-base text-foreground font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 border-t border-border/10 bg-background/50">
        <div className="container px-4 sm:px-6">
          <div className="flex flex-col items-center justify-center space-y-6 md:flex-row md:justify-between md:space-y-0">
            <div className="flex items-center space-x-3">
              <img 
                src="https://iktftsxuuiyeabxgdxzo.supabase.co/storage/v1/object/public/platform-logos/Neptune%20AI%20Logo%20Transparent.png" 
                alt="Neptune AI Logo" 
                className="h-6 sm:h-8 w-6 sm:w-8 object-contain"
              />
              <span className="text-lg sm:text-xl font-bold gradient-text">Neptune AI</span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 lg:space-x-8 text-xs sm:text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Support</a>
            </div>
            
            <p className="text-xs sm:text-sm text-muted-foreground text-center md:text-left">
              © 2024 Neptune AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
