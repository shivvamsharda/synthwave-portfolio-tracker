
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
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Total Earnings Analytics",
      description: "Track your portfolio performance with real-time value calculations and detailed earning breakdowns.",
      value: "$2,847,329",
      change: "+12.5%",
      period: "24h"
    },
    {
      icon: <Activity className="h-6 w-6" />,
      title: "Real-Time Analytics", 
      description: "Monitor live market movements and transaction flows across all your connected wallets.",
      value: "1,247",
      change: "+8.2%",
      period: "Active Tokens"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
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
      description: "Perfect for getting started with Cryptic analytics",
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
      <nav className="relative z-50 backdrop-blur-xl bg-background/60 border border-border/30 shadow-navbar mx-4 mt-6 rounded-2xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4 flex h-20 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-md">
              <img 
                src="https://iktftsxuuiyeabxgdxzo.supabase.co/storage/v1/object/public/platform-logos//cryptic.png" 
                alt="Cryptic Logo" 
                className="h-6 w-6 object-contain"
              />
            </div>
            <span className="text-xl md:text-2xl font-bold gradient-text">Cryptic</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
              Features
            </a>
            <Button 
              onClick={() => navigate('/dashboard')}
              className="crypto-button text-sm"
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-primary transition-colors rounded-xl hover:bg-primary/5"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/20 bg-background/95 backdrop-blur-xl rounded-b-2xl">
            <div className="px-6 py-6 space-y-4">
              <a 
                href="#features" 
                className="block text-sm font-semibold text-muted-foreground hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <Button 
                onClick={() => {
                  navigate('/dashboard')
                  setMobileMenuOpen(false)
                }}
                className="crypto-button w-full text-sm"
              >
                Get Started
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero"></div>
        
        {/* Background Elements */}
        <div className="absolute top-20 left-4 sm:left-10 w-32 sm:w-48 h-32 sm:h-48 bg-primary/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-4 sm:right-10 w-48 sm:w-64 h-48 sm:h-64 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            {/* Left Side - Text Content */}
            <div className="lg:col-span-5 space-y-8 animate-slide-up text-center lg:text-left">
              <Badge variant="secondary" className="bg-primary/10 border-primary/20 text-primary animate-pulse-glow w-fit mx-auto lg:mx-0 mb-4 px-4 py-2 rounded-full">
                <Zap className="mr-2 h-4 w-4" />
                <span className="text-sm font-semibold">Version 1.3 Available Now</span>
              </Badge>
              
              <div className="space-y-8">
                <h1 className="hero-title">
                  <span className="text-white font-bold">
                    Advanced Crypto Analytics{" "}
                    <span className="block lg:inline gradient-text">Powered by AI</span>
                  </span>
                </h1>
                
                <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
                  Track your entire crypto portfolio with AI-powered insights. Monitor whale movements, analyze token risks, discover trending opportunities, and get real-time alerts across all major blockchains.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-6">
                <Button 
                  size="lg"
                  onClick={() => navigate('/dashboard')} 
                  className="crypto-button text-base px-10 py-4 group"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
            
            {/* Right Side - Dashboard Preview */}
            <div className="lg:col-span-7 relative animate-slide-in-right overflow-visible">
              {isMobile ? (
                <div className="flex justify-center mt-12 lg:mt-0">
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
      <section id="features" className="py-16 lg:py-24 relative">
        <div className="container px-6">
          <div className="text-center space-y-6 mb-16 animate-slide-up">
            <h2 className="section-title">
              <span className="gradient-text">Platform Features</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto font-medium">
              Advanced analytics and monitoring tools designed for Web3 professionals and traders.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
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
                  crypto-card group cursor-pointer p-8 space-y-6 
                  ${visibleCards.includes(index) 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-8'
                  }
                `}
                style={{ 
                  transitionDelay: visibleCards.includes(index) ? '0ms' : `${index * 100}ms`,
                }}
              >
                {/* Icon container */}
                <div className={`
                  feature-icon group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300
                  ${visibleCards.includes(index) 
                    ? 'scale-100 opacity-100' 
                    : 'scale-80 opacity-0'
                  }
                `}
                style={{ 
                  transitionDelay: visibleCards.includes(index) ? `${index * 100 + 200}ms` : '0ms',
                }}>
                  {feature.icon}
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-200">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground group-hover:text-foreground/90 leading-relaxed transition-colors duration-200">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Messaging Integration Section */}
      <section className="py-16 lg:py-24 relative">
        <div className="container px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Features */}
            <div className="space-y-8 animate-slide-in-right order-2 lg:order-1">
              <div className="space-y-6 text-center lg:text-left">
                <h2 className="section-title">
                  <span className="text-foreground">Real-time Notifications</span>
                  <br />
                  <span className="gradient-text">& Messaging</span>
                </h2>
                
                <p className="text-lg text-muted-foreground font-medium">
                  Stay connected with your portfolio through instant notifications, 
                  real-time alerts, and collaborative messaging features.
                </p>
              </div>
              
              <div className="grid gap-4">
                {[
                  { icon: <MessageSquare className="h-5 w-5" />, text: "Instant portfolio updates", delay: '0.2s' },
                  { icon: <Bell className="h-5 w-5" />, text: "Smart alert system", delay: '0.4s' },
                  { icon: <Users className="h-5 w-5" />, text: "Team collaboration", delay: '0.6s' },
                  { icon: <Wallet className="h-5 w-5" />, text: "Multi-wallet notifications", delay: '0.8s' }
                ].map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-center space-x-4 p-4 rounded-2xl bg-card/40 border border-border/30 backdrop-blur-sm animate-slide-in-right hover:bg-card/60 transition-all duration-300"
                    style={{ animationDelay: item.delay }}
                  >
                    <div className="feature-icon">
                      {item.icon}
                    </div>
                    <span className="text-foreground font-semibold">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Messaging Preview */}
            <div className="space-y-8 animate-slide-up order-1 lg:order-2">
              <div className="flex justify-center lg:justify-end">
                <MessagingPreview />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/20 bg-background/50 backdrop-blur-sm">
        <div className="container px-6">
          <div className="flex flex-col items-center justify-center space-y-8 md:flex-row md:justify-between md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-md">
                <img 
                  src="https://iktftsxuuiyeabxgdxzo.supabase.co/storage/v1/object/public/platform-logos//cryptic.png" 
                  alt="Cryptic Logo" 
                  className="h-6 w-6 object-contain"
                />
              </div>
              <span className="text-xl font-bold gradient-text">Cryptic</span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-8 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors font-medium">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors font-medium">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors font-medium">Support</a>
            </div>
            
            <p className="text-sm text-muted-foreground text-center md:text-left font-medium">
              © 2024 Cryptic. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
