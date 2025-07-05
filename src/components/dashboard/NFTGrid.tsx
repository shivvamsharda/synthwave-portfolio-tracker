import { DashboardCard } from "@/components/ui/dashboard-card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Star } from "lucide-react"

interface NFT {
  id: string
  collection: string
  name: string
  image: string
  floorPrice: string
  lastSale: string
  rarity?: string
}

// Mock NFT data
const mockNFTs: NFT[] = [
  {
    id: "1",
    collection: "Bored Apes",
    name: "BAYC #1234",
    image: "🐵",
    floorPrice: "23.4 ETH",
    lastSale: "25.1 ETH",
    rarity: "Rare"
  },
  {
    id: "2",
    collection: "CryptoPunks",
    name: "Punk #5432",
    image: "🤖",
    floorPrice: "67.8 ETH",
    lastSale: "72.3 ETH",
    rarity: "Epic"
  },
  {
    id: "3",
    collection: "Pudgy Penguins",
    name: "Penguin #987",
    image: "🐧",
    floorPrice: "8.9 ETH",
    lastSale: "9.2 ETH"
  },
  {
    id: "4",
    collection: "DeGods",
    name: "DeGod #456",
    image: "😈",
    floorPrice: "156 SOL",
    lastSale: "178 SOL",
    rarity: "Legendary"
  }
]

export function NFTGrid() {
  return (
    <DashboardCard className="p-6 col-span-full lg:col-span-7">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-glow-primary">NFT Collection</h3>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary-glow">
          <ExternalLink className="w-4 h-4 mr-2" />
          View Gallery
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {mockNFTs.map((nft) => (
          <div
            key={nft.id}
            className="group relative overflow-hidden rounded-lg bg-muted/20 hover:bg-muted/30 transition-all duration-300 border border-border/30 hover:border-primary/30 hover:shadow-neon-primary/20"
          >
            {/* NFT Image */}
            <div className="aspect-square bg-gradient-cyber flex items-center justify-center text-4xl">
              {nft.image}
            </div>
            
            {/* Rarity Badge */}
            {nft.rarity && (
              <div className="absolute top-2 right-2">
                <div className={`px-2 py-1 rounded-md text-xs font-semibold flex items-center space-x-1 ${
                  nft.rarity === "Legendary" ? "bg-secondary/20 text-secondary border border-secondary/30" :
                  nft.rarity === "Epic" ? "bg-accent/20 text-accent border border-accent/30" :
                  "bg-primary/20 text-primary border border-primary/30"
                }`}>
                  <Star className="w-3 h-3" />
                  <span>{nft.rarity}</span>
                </div>
              </div>
            )}

            {/* NFT Info */}
            <div className="p-3">
              <div className="text-xs text-muted-foreground mb-1">
                {nft.collection}
              </div>
              <div className="font-semibold text-foreground text-sm mb-2">
                {nft.name}
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Floor:</span>
                  <span className="font-mono text-primary">{nft.floorPrice}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Last Sale:</span>
                  <span className="font-mono text-foreground">{nft.lastSale}</span>
                </div>
              </div>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-cyber/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Button size="sm" className="btn-neon-primary">
                View Details
              </Button>
            </div>
          </div>
        ))}
        </div>
    </DashboardCard>
  )
}