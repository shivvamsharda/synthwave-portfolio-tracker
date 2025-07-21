
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const features = [
  {
    title: "Portfolio Dashboard",
    description: "Comprehensive overview of your entire crypto portfolio with real-time value tracking and performance analytics.",
    image: "/lovable-uploads/9fb7b51a-2b81-4a22-960f-8b7a6e34b82c.png"
  },
  {
    title: "Token Holdings",
    description: "Detailed breakdown of your token holdings with current prices, 24h changes, and portfolio allocation percentages.",
    image: "/lovable-uploads/be8f9a79-d44c-4c8c-a9f8-c3d8b17db9e7.png"
  },
  {
    title: "Token Analytics",
    description: "Advanced analytics for any token including market data, trading volume, and comprehensive performance metrics.",
    image: "/lovable-uploads/95528b8b-e49b-4d8a-9b49-d1b8de2b2b93.png"
  },
  {
    title: "AI Risk Assessment",
    description: "Intelligent risk scoring powered by AI analyzing price volatility, liquidity, and market sentiment for informed decisions.",
    image: "/lovable-uploads/7c2c7cf3-e0a4-4c29-a00b-4c3e9b5a5c77.png"
  },
  {
    title: "Holder Movement Analysis",
    description: "Track wallet behavior patterns, new holders vs exits, and understand token flow dynamics over time.",
    image: "/lovable-uploads/8e4f9a7c-3b9e-4a1a-8f2e-5c6d7e8f9a0b.png"
  },
  {
    title: "Whale Tracker",
    description: "Monitor large wallet movements and whale activity to stay ahead of market-moving transactions.",
    image: "/lovable-uploads/1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d.png"
  },
  {
    title: "Token Flow Analysis",
    description: "Visualize real-time token movements across wallets and protocols with detailed flow mapping.",
    image: "/lovable-uploads/2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e.png"
  }
]

export function FeatureCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [isPlaying])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + features.length) % features.length)
  }

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % features.length)
  }

  return (
    <div className="relative w-full max-w-7xl mx-auto">
      {/* Main Carousel */}
      <div 
        className="relative overflow-hidden rounded-3xl bg-card/20 backdrop-blur-sm border border-border/20"
        onMouseEnter={() => setIsPlaying(false)}
        onMouseLeave={() => setIsPlaying(true)}
      >
        <div 
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {features.map((feature, index) => (
            <div key={index} className="w-full flex-shrink-0">
              <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-center p-8 lg:p-16">
                {/* Text Content */}
                <div className="lg:col-span-5 space-y-6 text-center lg:text-left order-2 lg:order-1">
                  <div className="space-y-4">
                    <h3 className="title-card gradient-text text-2xl lg:text-3xl">
                      {feature.title}
                    </h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>

                {/* Screenshot */}
                <div className="lg:col-span-7 order-1 lg:order-2">
                  <Card className="overflow-hidden shadow-2xl border-border/20 bg-card/40 backdrop-blur-sm">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-auto object-cover"
                      loading="lazy"
                    />
                  </Card>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <Button
          variant="outline"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm border-border/40 hover:bg-primary/10 hover:border-primary/40"
          onClick={goToPrevious}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm border-border/40 hover:bg-primary/10 hover:border-primary/40"
          onClick={goToNext}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Dot Indicators */}
      <div className="flex justify-center space-x-3 mt-8">
        {features.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentSlide === index
                ? 'bg-primary shadow-glow scale-110'
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
