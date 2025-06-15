
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DisplayToken } from '@/types/tokens'
import { ArrowUp, ArrowDown, TrendingUp, Sparkles } from 'lucide-react'

interface TokenCardProps {
  token: DisplayToken
  onBuy: (token: DisplayToken) => void
  onSell: (token: DisplayToken) => void
}

export const TokenCard = ({ token, onBuy, onSell }: TokenCardProps) => {
  const isPositive = token.changePercent24h >= 0

  return (
    <Card className="p-4 space-y-4 bg-gradient-to-br from-white to-blue-50 border-2 border-blue-100 hover:border-blue-300 transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in group">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">
              {token.symbol}
            </h3>
            <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
          </div>
          <p className="text-sm text-gray-600 font-medium">{token.name}</p>
        </div>
        <div className="text-right space-y-1">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <p className="font-bold text-xl text-gray-800">${token.currentPrice.toFixed(2)}</p>
          </div>
          <div className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
            {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            <span>{isPositive ? '+' : ''}{token.changePercent24h.toFixed(2)}%</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white/70 p-3 rounded-lg border border-blue-100">
        <p className="text-sm text-gray-700 leading-relaxed">{token.description}</p>
      </div>
      
      <div className="flex gap-2 pt-2">
        <Button 
          onClick={() => onBuy(token)}
          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          💰 Comprar
        </Button>
        <Button 
          onClick={() => onSell(token)}
          variant="outline"
          className="flex-1 border-2 border-blue-300 text-blue-600 hover:bg-blue-50 font-semibold transform hover:scale-105 transition-all duration-200"
        >
          💸 Vender
        </Button>
      </div>
    </Card>
  )
}
