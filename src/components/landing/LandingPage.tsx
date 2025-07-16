import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, TrendingUp, Activity, BarChart3, Zap, Shield, Globe, CheckCircle, MessageSquare, Bell, Users, Wallet } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { DashboardPreview, MessagingPreview } from "./DashboardPreview"
import { AnimatedLineChart, AnimatedBarChart, CountingNumber } from "./AnimatedChart"

export function LandingPage() {
  const navigate = useNavigate()

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
      description: "Perfect for getting started with basic Web3 analytics",
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
      <nav className="relative z-50 border-b border-border/10 bg-background/20 backdrop-blur-xl shadow-lg">
        <div className="max-w-7xl mx-auto px-10 py-6 flex h-20 items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary animate-pulse-glow"></div>
            <span className="text-xl font-bold gradient-text">Web3 Analytics</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Pricing
            </a>
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2.5 border-primary/30 hover:bg-primary/10 hover:shadow-glow transition-all duration-300 font-medium"
            >
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero"></div>
        
        {/* Background Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        
        <div className="max-w-7xl mx-auto px-10 relative z-10">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            {/* Left Side - Text Content (5 columns) */}
            <div className="lg:col-span-5 space-y-8 animate-slide-up">
              <Badge variant="secondary" className="bg-primary/10 border-primary/20 text-primary animate-pulse-glow w-fit mb-2">
                <Zap className="mr-2 h-4 w-4" />
                Version 1.3 is available now
              </Badge>
              
              <div className="space-y-8">
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight tracking-tight">
                  <span className="gradient-text">Unlock the Power of Data with AI</span>
                </h1>
                
                <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                  Empower your business with cutting-edge AI analytics. Monitor your entire Web3 portfolio with advanced insights, real-time notifications, and intelligent automation.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 pt-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/dashboard')} 
                  className="web3-button group px-8 py-4 text-base"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-primary/30 hover:bg-primary/10 px-8 py-4 text-base font-medium"
                >
                  Watch Demo
                </Button>
              </div>
              
              {/* User Avatars Section */}
              <div className="flex items-center space-x-4 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((_, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-primary border-2 border-background flex items-center justify-center text-sm font-semibold text-primary-foreground"
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground text-base">Over 50+ Users</span>
                  <br />
                  <span className="text-muted-foreground">Join our growing community</span>
                </div>
              </div>
            </div>
            
            {/* Right Side - Dashboard Preview (7 columns) */}
            <div className="lg:col-span-7 relative animate-slide-in-right overflow-visible">
              <DashboardPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Features Section - Matching Images 1 & 2 */}
      <section id="features" className="py-24 relative">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Total Earnings Analytics */}
            <div className="web3-card p-8 space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-gradient-primary/20">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Total Earnings</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-end space-x-3">
                    <span className="metric-large">
                      $<CountingNumber target={2847329} />
                    </span>
                    <div className="flex items-center space-x-1 pb-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-500 font-medium">+12.5%</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
                </div>
                
                <div className="h-20">
                  <AnimatedLineChart 
                    data={portfolioData} 
                    color="hsl(var(--primary))"
                    height={80}
                  />
                </div>
              </div>
            </div>

            {/* Real Time Analytics */}
            <div className="web3-card p-8 space-y-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-gradient-primary/20">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Real Time Analytics</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-end space-x-3">
                    <span className="metric-large">
                      <CountingNumber target={1247} />
                    </span>
                    <div className="flex items-center space-x-1 pb-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-500 font-medium">+8.2%</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Active Tokens Tracked</p>
                </div>
                
                <div className="h-20">
                  <AnimatedBarChart 
                    data={analyticsData} 
                    color="hsl(var(--accent))"
                    height={80}
                  />
                </div>
              </div>
            </div>

            {/* Project Overview */}
            <div className="web3-card p-8 space-y-6 animate-slide-up" style={{ animationDelay: '0.6s' }}>
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-gradient-primary/20">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Project Overview</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-end space-x-3">
                    <span className="metric-large">
                      <CountingNumber target={847} />
                    </span>
                    <div className="flex items-center space-x-1 pb-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-500 font-medium">+15.7%</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Insights Generated</p>
                </div>
                
                <div className="h-20">
                  <AnimatedLineChart 
                    data={insightsData} 
                    color="hsl(var(--success))"
                    height={80}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Messaging Integration Section - Matching Image 3 */}
      <section className="py-24 relative">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Messaging Preview */}
            <div className="space-y-8 animate-slide-up">
              <div className="space-y-6">
                <h2 className="text-3xl lg:text-4xl font-bold">
                  <span className="text-foreground">Realtime Messaging</span>
                  <br />
                  <span className="gradient-text">Integration</span>
                </h2>
                
                <MessagingPreview />
              </div>
            </div>
            
            {/* Right Side - Features */}
            <div className="space-y-8 animate-slide-in-right">
              <div className="space-y-6">
                <h2 className="text-3xl lg:text-4xl font-bold">
                  <span className="text-foreground">Realtime Notification</span>
                  <br />
                  <span className="gradient-text">Integration</span>
                </h2>
                
                <p className="text-lg text-muted-foreground">
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
                    className="flex items-center space-x-4 p-4 rounded-lg bg-card/50 border border-border/20 animate-slide-in-right"
                    style={{ animationDelay: item.delay }}
                  >
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {item.icon}
                    </div>
                    <span className="text-foreground font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Matching Image 4 */}
      <section id="pricing" className="py-24 relative">
        <div className="container">
          <div className="text-center space-y-4 mb-16 animate-slide-up">
            <h2 className="text-3xl lg:text-4xl font-bold">
              <span className="gradient-text">Choose Your Plan</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free and scale as you grow. All plans include our core analytics features with enterprise-grade security.
            </p>
          </div>
          
          <div className="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div 
                key={index} 
                className={`web3-card p-8 space-y-6 animate-slide-up relative ${
                  plan.highlighted 
                    ? 'border-primary/50 shadow-glow transform scale-105' 
                    : 'border-border/20'
                }`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-primary text-primary-foreground px-4 py-1 animate-pulse-glow">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                    <div className="flex items-end space-x-2">
                      <span className="text-4xl font-bold gradient-text">{plan.price}</span>
                      <span className="text-muted-foreground pb-1">/month</span>
                    </div>
                    <p className="text-muted-foreground">{plan.description}</p>
                  </div>
                  
                  <Button 
                    className={`w-full ${plan.highlighted ? 'web3-button' : 'border-primary/30 hover:bg-primary/10'}`}
                    variant={plan.highlighted ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => navigate('/dashboard')}
                  >
                    {plan.name === 'Free' ? 'Get Started' : 'Start Free Trial'}
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Everything included:</h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/20 py-16 bg-background/50 backdrop-blur-xl">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-primary animate-pulse-glow"></div>
              <span className="text-xl font-bold gradient-text">Web3 Analytics</span>
            </div>
            
            <div className="flex space-x-8 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-border/20 text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 Web3 Analytics. All rights reserved. Powered by advanced blockchain analytics.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}