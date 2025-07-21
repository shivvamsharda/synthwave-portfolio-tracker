
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const features = [
  {
    title: "Portfolio Dashboard",
    description: "Comprehensive overview of your entire crypto portfolio with real-time value tracking and performance analytics.",
    image: "https://iktftsxuuiyeabxgdxzo.supabase.co/storage/v1/object/public/platform-logos//Dashboard%20Overview.png"
  },
  {
    title: "Token Holdings",
    description: "Detailed breakdown of your token holdings with current prices, 24h changes, and portfolio allocation percentages.",
    image: "https://iktftsxuuiyeabxgdxzo.supabase.co/storage/v1/object/public/platform-logos//Token%20Holdings.png"
  },
  {
    title: "Token Analytics",
    description: "Advanced analytics for any token including market data, trading volume, and comprehensive performance metrics.",
    image: "https://iktftsxuuiyeabxgdxzo.supabase.co/storage/v1/object/public/platform-logos//Token%20Analytics.png"
  },
  {
    title: "AI Risk Assessment",
    description: "Intelligent risk scoring powered by AI analyzing price volatility, liquidity, and market sentiment for informed decisions.",
    image: "https://iktftsxuuiyeabxgdxzo.supabase.co/storage/v1/object/public/platform-logos//AI%20Risk%20Assessment.png"
  },
  {
    title: "Holder Movement Analysis",
    description: "Track wallet behavior patterns, new holders vs exits, and understand token flow dynamics over time.",
    image: "https://iktftsxuuiyeabxgdxzo.supabase.co/storage/v1/object/public/platform-logos//Holder%20Movement%20Analysis.png"
  },
  {
    title: "Whale Tracker",
    description: "Monitor large wallet movements and whale activity to stay ahead of market-moving transactions.",
    image: "https://iktftsxuuiyeabxgdxzo.supabase.co/storage/v1/object/public/platform-logos//Whale%20Tracker.png"
  },
  {
    title: "Token Flow Analysis",
    description: "Visualize real-time token movements across wallets and protocols with detailed flow mapping.",
    image: "https://iktftsxuuiyeabxgdxzo.supabase.co/storage/v1/object/public/platform-logos//Token%20Flow%20Analysis.png"
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
                      onError={(e) => {
                        console.error(`Failed to load image for ${feature.title}:`, feature.image)
                        e.currentTarget.style.display = 'none'
                      }}
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
