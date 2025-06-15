
import { useState } from 'react'
import { TokenCard } from '@/components/TokenCard'
import { TradingModal } from '@/components/TradingModal'
import { indexTokens } from '@/data/mockTokens'
import { IndexToken } from '@/types/tokens'
import { Button } from '@/components/ui/button'
import { Coins } from 'lucide-react'

const Index = () => {
  const [selectedToken, setSelectedToken] = useState<IndexToken | null>(null)
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleBuy = (token: IndexToken) => {
    setSelectedToken(token)
    setTradeType('buy')
    setIsModalOpen(true)
  }

  const handleSell = (token: IndexToken) => {
    setSelectedToken(token)
    setTradeType('sell')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedToken(null)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center gap-2 mb-2">
          <Coins className="w-6 h-6" />
          <h1 className="text-xl font-bold">Index Tokens</h1>
        </div>
        <p className="text-sm opacity-90">
          Trade tokens that track major global stock indices
        </p>
      </div>

      {/* Portfolio Summary */}
      <div className="p-4 border-b">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Portfolio Value</p>
            <p className="text-2xl font-bold">$0.00</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Today's P&L</p>
            <p className="text-2xl font-bold text-green-600">+$0.00</p>
          </div>
        </div>
      </div>

      {/* Tokens Grid */}
      <div className="p-4 space-y-4">
        <h2 className="text-lg font-semibold">Available Index Tokens</h2>
        <div className="grid gap-4">
          {indexTokens.map((token) => (
            <TokenCard
              key={token.id}
              token={token}
              onBuy={handleBuy}
              onSell={handleSell}
            />
          ))}
        </div>
      </div>

      {/* Trading Modal */}
      <TradingModal
        isOpen={isModalOpen}
        onClose={closeModal}
        token={selectedToken}
        type={tradeType}
      />

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" size="sm">
            Portfolio
          </Button>
          <Button variant="outline" size="sm">
            Markets
          </Button>
          <Button variant="outline" size="sm">
            History
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Index
