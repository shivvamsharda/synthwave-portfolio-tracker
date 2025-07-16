import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, TrendingUp, Activity, BarChart3, Zap, Shield, Globe, CheckCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"

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

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary"></div>
            <span className="text-xl font-semibold">Web3 Analytics</span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background"></div>
        <div className="container relative py-24 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-6">
              <Zap className="mr-1 h-3 w-3" />
              Real-time Web3 Analytics
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Unlock the Power of
              <span className="bg-gradient-primary bg-clip-text text-transparent"> On-Chain Data</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto">
              Transform your Web3 portfolio with real-time analytics, advanced insights, and comprehensive tracking across all your favorite blockchains.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" onClick={() => navigate('/dashboard')} className="btn-primary">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <div className="flex items-center text-sm text-muted-foreground">
                <Shield className="mr-2 h-4 w-4" />
                Trusted by 50,000+ users
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Advanced Analytics Dashboard
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Get comprehensive insights into your Web3 investments with our powerful analytics suite.
            </p>
          </div>
          
          <div className="grid gap-8 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="dashboard-card border-border/50 hover:border-primary/50 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-end space-x-2">
                      <span className="text-3xl font-bold">{feature.value}</span>
                      <div className="flex items-center text-sm">
                        <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                        <span className="text-green-500">{feature.change}</span>
                        <span className="text-muted-foreground ml-1">{feature.period}</span>
                      </div>
                    </div>
                    <div className="h-16 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg flex items-end justify-center">
                      <div className="w-full h-8 bg-gradient-primary opacity-30 rounded-b-lg"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-24 bg-muted/30">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <Badge variant="secondary" className="mb-4">
                <Globe className="mr-1 h-3 w-3" />
                Multi-Chain Support
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                Real-time Integration Capabilities
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Connect all your wallets and get unified analytics across Solana, Ethereum, Polygon, and more. 
                Our platform provides seamless integration with real-time notifications and messaging.
              </p>
              <ul className="space-y-4">
                {[
                  "Real-time notification integration",
                  "Multi-wallet connection support", 
                  "Cross-chain analytics",
                  "Instant transaction alerts"
                ].map((item, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="mr-3 h-5 w-5 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="dashboard-card">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Live Activity</CardTitle>
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[1,2,3].map((i) => (
                      <div key={i} className="flex items-center space-x-2 text-xs">
                        <div className="h-6 w-6 rounded-full bg-primary/20"></div>
                        <span className="text-muted-foreground">New transaction detected</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="dashboard-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Wallet Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Connected</span>
                      <span className="text-sm font-medium">4/5</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-gradient-primary h-2 rounded-full w-4/5"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Choose Your Plan
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Start free and scale as you grow. All plans include our core analytics features.
            </p>
          </div>
          
          <div className="grid gap-8 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <Card key={index} className={`dashboard-card relative ${plan.highlighted ? 'border-primary shadow-elegant' : 'border-border/50'}`}>
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="flex items-end space-x-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    className={`w-full ${plan.highlighted ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => navigate('/dashboard')}
                  >
                    {plan.name === 'Free' ? 'Get Started' : 'Start Free Trial'}
                  </Button>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <CheckCircle className="mr-3 h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="h-6 w-6 rounded bg-gradient-primary"></div>
              <span className="font-semibold">Web3 Analytics</span>
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
            © 2024 Web3 Analytics. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}