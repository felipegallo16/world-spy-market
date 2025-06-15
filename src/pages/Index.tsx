
import { useState } from 'react'
import { TokenCard } from '@/components/TokenCard'
import { TradingModal } from '@/components/TradingModal'
import { indexTokens } from '@/data/mockTokens'
import { IndexToken } from '@/types/tokens'
import { Button } from '@/components/ui/button'
import { Sparkles, TrendingUp, Heart, BookOpen, DollarSign, Globe } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header con gradiente cálido */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">✨ Ahorro Inteligente</h1>
              <p className="text-sm opacity-90 font-medium">Tu primer paso hacia la libertad financiera</p>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex items-start gap-3">
              <Heart className="w-6 h-6 text-pink-300 mt-1 animate-pulse" />
              <div>
                <h3 className="font-semibold text-lg mb-2">¿Por qué empezar a ahorrar hoy? 🚀</h3>
                <p className="text-sm leading-relaxed opacity-95">
                  Los Index Tokens te permiten invertir en las mejores empresas del mundo con solo unos pocos dólares. 
                  ¡Es como tener un pedacito de Apple, Google y Tesla en tu bolsillo! 💎
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección educativa */}
      <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-b-2 border-green-100">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-green-200 transform hover:scale-105 transition-all duration-200">
            <BookOpen className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-gray-700">Fácil de entender</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-green-200 transform hover:scale-105 transition-all duration-200">
            <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-gray-700">Desde $3 dólares</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-green-200 transform hover:scale-105 transition-all duration-200">
            <Globe className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-gray-700">Diversificación global</p>
          </div>
        </div>
      </div>

      {/* Portfolio Summary con diseño más cálido */}
      <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-b-2 border-orange-100">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center bg-white/70 backdrop-blur-sm p-4 rounded-xl border-2 border-yellow-200 transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-600 font-medium">Mi Portafolio</p>
            </div>
            <p className="text-2xl font-bold text-gray-800">$0.00</p>
            <p className="text-xs text-gray-500">¡Empieza tu viaje!</p>
          </div>
          <div className="text-center bg-white/70 backdrop-blur-sm p-4 rounded-xl border-2 border-green-200 transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-green-600 animate-pulse" />
              <p className="text-sm text-gray-600 font-medium">Ganancia Hoy</p>
            </div>
            <p className="text-2xl font-bold text-green-600">+$0.00</p>
            <p className="text-xs text-gray-500">Tu futuro te espera</p>
          </div>
        </div>
      </div>

      {/* Tokens Grid con animaciones */}
      <div className="p-4 space-y-6 pb-24">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <Globe className="w-6 h-6 text-blue-600" />
            Elige tu primera inversión
          </h2>
          <p className="text-sm text-gray-600">Cada token representa las mejores empresas de su región 🌍</p>
        </div>
        
        <div className="grid gap-4">
          {indexTokens.map((token, index) => (
            <div 
              key={token.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <TokenCard
                token={token}
                onBuy={handleBuy}
                onSell={handleSell}
              />
            </div>
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

      {/* Bottom Navigation con gradiente */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 border-t-2 border-blue-300 p-4 backdrop-blur-sm">
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20 font-medium">
            💼 Mi Portafolio
          </Button>
          <Button variant="outline" size="sm" className="bg-white/20 border-white/40 text-white hover:bg-white/30 font-medium">
            📈 Mercados
          </Button>
          <Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20 font-medium">
            📊 Historial
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Index
