
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { IndexToken } from '@/types/tokens'
import { ArrowUp, ArrowDown } from 'lucide-react'

interface TokenCardProps {
  token: IndexToken
  onBuy: (token: IndexToken) => void
  onSell: (token: IndexToken) => void
}

export const TokenCard = ({ token, onBuy, onSell }: TokenCardProps) => {
  const isPositive = token.changePercent24h >= 0

  return (
    <Card className="p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{token.symbol}</h3>
          <p className="text-sm text-muted-foreground">{token.name}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg">${token.currentPrice.toFixed(2)}</p>
          <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            <span>{isPositive ? '+' : ''}{token.changePercent24h.toFixed(2)}%</span>
          </div>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground">{token.description}</p>
      
      <div className="flex gap-2">
        <Button 
          onClick={() => onBuy(token)}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          Buy
        </Button>
        <Button 
          onClick={() => onSell(token)}
          variant="outline"
          className="flex-1"
        >
          Sell
        </Button>
      </div>
    </Card>
  )
}
