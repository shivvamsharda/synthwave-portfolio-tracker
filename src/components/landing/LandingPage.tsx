
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Menu, 
  X, 
  ArrowRight, 
  TrendingUp, 
  BarChart3, 
  Activity, 
  Shield, 
  Target,
  Zap,
  Globe,
  Brain,
  PieChart,
  LineChart,
  Wallet,
  Sparkles
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { CryptoDashboardCard } from "./CryptoDashboardCard"
import { FeatureCard } from "./FeatureCard"

export function LandingPage() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const dashboardData = [
    { title: "Shicke", value: "1,247", percentage: 75, chartData: [20, 35, 45, 50, 65, 70, 75], isPositive: true },
    { title: "Cerrcic", value: "892", percentage: 60, chartData: [30, 25, 40, 55, 45, 60, 65], isPositive: true },
    { title: "Blocric", value: "2,340", percentage: 85, chartData: [15, 25, 35, 50, 70, 80, 85], isPositive: true },
    { title: "Cryptec", value: "1,156", percentage: 45, chartData: [60, 45, 35, 30, 40, 45, 50], isPositive: false }
  ]

  const insightCards = [
    { title: "Cryobcaes", value: "1230.00", subtitle: "Current Price" },
    { title: "Crytii Caise", value: "30", subtitle: "Active Trades" },
    { title: "Crcoptc", value: "Analytics", subtitle: "Dashboard View" }
  ]

  const features = [
    { icon: Brain, title: "Insights", description: "Advanced AI-powered market insights and trend analysis for better decision making." },
    { icon: PieChart, title: "Portfolios", description: "Comprehensive portfolio tracking and management across multiple wallets." },
    { icon: Shield, title: "Risk Management", description: "Intelligent risk assessment and automated safety measures for your investments." },
    { icon: TrendingUp, title: "Trends", description: "Real-time market trends and predictive analytics for crypto movements." },
    { icon: Target, title: "Strategies", description: "Customized trading strategies based on your risk profile and goals." },
    { icon: BarChart3, title: "Performance", description: "Detailed performance analytics and historical data visualization." },
    { icon: Zap, title: "Optimization", description: "Portfolio optimization tools to maximize returns and minimize risks." },
    { icon: LineChart, title: "Forecasting", description: "Machine learning-powered price predictions and market forecasting." }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">C</span>
              </div>
              <span className="text-xl font-bold gradient-text">Cryptic</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Features
              </a>
              <a href="#insights" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Insights
              </a>
              <a href="#analytics" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Analytics
              </a>
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
                className="border-border hover:bg-card"
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
            <div className="md:hidden border-t border-border bg-card/50 backdrop-blur-xl">
              <div className="px-4 py-6 space-y-4">
                <a href="#features" className="block text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2">
                  Features
                </a>
                <a href="#insights" className="block text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2">
                  Insights
                </a>
                <a href="#analytics" className="block text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2">
                  Analytics
                </a>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/dashboard')}
                  className="w-full border-border hover:bg-card"
                >
                  Sign In
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Side - Content */}
            <div className="space-y-8 animate-slide-up text-center lg:text-left">
              <div className="space-y-6">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="text-foreground">Unlock the Power of</span>
                  <br />
                  <span className="gradient-text">Crypto</span>
                </h1>
                
                <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0">
                  Dive into the world of cryptocurrency with our cutting-edge analytics platform. 
                  Make informed decisions with real-time data and AI-powered insights.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg"
                  onClick={() => navigate('/dashboard')}
                  className="crypto-button px-8 py-4 text-base"
                >
                  Explore
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                
                <Button 
                  size="lg"
                  className="crypto-button-dark px-8 py-4 text-base"
                >
                  Start Now
                </Button>
              </div>
            </div>
            
            {/* Right Side - Dashboard Preview */}
            <div className="relative animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                {dashboardData.slice(0, 4).map((item, index) => (
                  <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <CryptoDashboardCard {...item} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Dashboard Section */}
      <section className="py-16 lg:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16 animate-slide-up">
            <h2 className="text-3xl lg:text-4xl font-bold">
              <span className="gradient-text">Revolutionize Your</span>
              <br />
              <span className="text-foreground">Trading Experience</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Advanced analytics and real-time monitoring for your crypto portfolio
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dashboardData.map((item, index) => (
              <div 
                key={index} 
                className="animate-slide-up" 
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <CryptoDashboardCard {...item} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Insights Section */}
      <section id="insights" className="py-16 lg:py-24 bg-card/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16 animate-slide-up">
            <h2 className="text-3xl lg:text-4xl font-bold">
              <span className="text-foreground">Empowering</span>{" "}
              <span className="gradient-text">Crypto Insights</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Advanced analytics tools to help you make informed decisions in the crypto market
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {insightCards.map((card, index) => (
              <Card 
                key={index} 
                className="crypto-card p-8 text-center animate-slide-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CardContent className="p-0 space-y-4">
                  <h3 className="text-xl font-bold text-foreground">{card.title}</h3>
                  <div className="text-3xl font-bold gradient-text">{card.value}</div>
                  <p className="text-sm text-muted-foreground">{card.subtitle}</p>
                  
                  {/* Mini chart visualization */}
                  <div className="h-16 w-full bg-gradient-to-r from-primary/20 to-transparent rounded-lg flex items-end justify-center space-x-1 p-2">
                    {[...Array(8)].map((_, i) => (
                      <div 
                        key={i}
                        className="bg-primary/60 rounded-sm animate-pulse"
                        style={{ 
                          height: `${20 + Math.random() * 40}px`,
                          width: '6px',
                          animationDelay: `${i * 0.1}s`
                        }}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <Button 
              size="lg"
              onClick={() => navigate('/dashboard')}
              className="crypto-button px-8 py-4"
            >
              Dive In
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16 animate-slide-up">
            <h2 className="text-3xl lg:text-4xl font-bold">
              <span className="gradient-text">Amplify Your</span>
              <br />
              <span className="text-foreground">Crypto Success</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover trends and opportunities with our comprehensive suite of crypto analytics tools
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="animate-slide-up" 
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <FeatureCard {...feature} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-foreground">C</span>
                </div>
                <span className="text-xl font-bold gradient-text">Cryptic</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Advanced crypto analytics platform for informed trading decisions.
              </p>
            </div>
            
            {/* Company */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Team</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Press</a></li>
              </ul>
            </div>
            
            {/* Resources */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Guides</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Webinars</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Support</a></li>
              </ul>
            </div>
            
            {/* Connect */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Connect</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">LinkedIn</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Telegram</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 Cryptic. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
