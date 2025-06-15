
import { useState } from 'react'
import { TokenCard } from '@/components/TokenCard'
import { TradingModal } from '@/components/TradingModal'
import { DisplayToken } from '@/types/tokens'
import { Button } from '@/components/ui/button'
import { Sparkles, TrendingUp, Heart, BookOpen, DollarSign, Globe, RefreshCw } from 'lucide-react'
import { useTokens } from '@/hooks/useTokens'
import { useUserAccount } from '@/hooks/useUserAccount'
import { usePortfolio } from '@/hooks/usePortfolio'
import { useToast } from '@/hooks/use-toast'

const Index = () => {
  const [selectedToken, setSelectedToken] = useState<DisplayToken | null>(null)
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const { tokens, isLoading: tokensLoading, updatePrices } = useTokens()
  const { account, isLoading: accountLoading } = useUserAccount()
  const { portfolio, isLoading: portfolioLoading } = usePortfolio()
  const { toast } = useToast()

  const handleBuy = (token: DisplayToken) => {
    setSelectedToken(token)
    setTradeType('buy')
    setIsModalOpen(true)
  }

  const handleSell = (token: DisplayToken) => {
    setSelectedToken(token)
    setTradeType('sell')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedToken(null)
  }

  const handleUpdatePrices = async () => {
    try {
      await updatePrices()
      toast({
        title: "¡Precios actualizados! 📈",
        description: "Los precios se han actualizado con datos del mercado real",
      })
    } catch (error) {
      toast({
        title: "Error al actualizar precios",
        description: "No se pudieron actualizar los precios en este momento",
        variant: "destructive"
      })
    }
  }

  // Calculate portfolio totals
  const portfolioValue = portfolio.reduce((total, position) => {
    const currentPrice = position.token_prices?.[0]?.price_usd || 0
    return total + (position.quantity * currentPrice)
  }, 0)

  const portfolioPnL = portfolio.reduce((total, position) => {
    const currentPrice = position.token_prices?.[0]?.price_usd || 0
    const currentValue = position.quantity * currentPrice
    return total + (currentValue - position.total_invested)
  }, 0)

  if (tokensLoading || accountLoading || portfolioLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-700">Cargando tu plataforma de inversión...</p>
        </div>
      </div>
    )
  }

  // Convert IndexToken to DisplayToken for components
  const displayTokens: DisplayToken[] = tokens.map(token => ({
    id: token.id,
    name: token.name,
    symbol: token.symbol,
    currentPrice: token.token_prices?.[0]?.price_usd || 0,
    change24h: token.token_prices?.[0]?.change_24h || 0,
    changePercent24h: token.token_prices?.[0]?.change_percent_24h || 0,
    marketCap: token.token_prices?.[0]?.market_cap || 0,
    description: token.description || '',
    indexType: token.index_type
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header con gradiente cálido */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">✨ Ahorro Inteligente</h1>
                <p className="text-sm opacity-90 font-medium">Tu primer paso hacia la libertad financiera</p>
              </div>
            </div>
            <Button
              onClick={handleUpdatePrices}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
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

      {/* Portfolio Summary con datos reales */}
      <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-b-2 border-orange-100">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center bg-white/70 backdrop-blur-sm p-4 rounded-xl border-2 border-yellow-200 transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-600 font-medium">Mi Portafolio</p>
            </div>
            <p className="text-2xl font-bold text-gray-800">${portfolioValue.toFixed(2)}</p>
            <p className="text-xs text-gray-500">
              Balance: ${account?.wld_balance?.toFixed(2) || '0.00'} WLD + ${account?.usdc_balance?.toFixed(2) || '0.00'} USDC
            </p>
          </div>
          <div className="text-center bg-white/70 backdrop-blur-sm p-4 rounded-xl border-2 border-green-200 transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-green-600 animate-pulse" />
              <p className="text-sm text-gray-600 font-medium">Ganancia Total</p>
            </div>
            <p className={`text-2xl font-bold ${portfolioPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {portfolioPnL >= 0 ? '+' : ''}${portfolioPnL.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">
              {portfolioPnL >= 0 ? '¡Vas muy bien!' : 'Sigue invirtiendo'}
            </p>
          </div>
        </div>
      </div>

      {/* Tokens Grid con datos reales */}
      <div className="p-4 space-y-6 pb-24">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <Globe className="w-6 h-6 text-blue-600" />
            Elige tu primera inversión
          </h2>
          <p className="text-sm text-gray-600">Cada token representa las mejores empresas de su región 🌍</p>
        </div>
        
        <div className="grid gap-4">
          {displayTokens.map((token, index) => (
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
