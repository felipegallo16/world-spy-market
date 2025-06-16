import { useState } from 'react'
import { useTokens } from '@/hooks/useTokens'
import { useUserAccount } from '@/hooks/useUserAccount'
import { usePortfolio } from '@/hooks/usePortfolio'
import { useTransactions } from '@/hooks/useTransactions'
import { TokenCard } from '@/components/TokenCard'
import { TradingModal } from '@/components/TradingModal'
import { DisplayToken } from '@/types/tokens'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Wallet, TrendingUp, DollarSign, Activity, RefreshCw, Sparkles, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

const Index = () => {
  const [selectedToken, setSelectedToken] = useState<DisplayToken | null>(null)
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const { tokens, isLoading: tokensLoading, refetch: refetchTokens, updatePrices } = useTokens()
  const { account, isLoading: accountLoading, error: accountError } = useUserAccount()
  const { portfolio, isLoading: portfolioLoading } = usePortfolio()
  const { transactions, isLoading: transactionsLoading } = useTransactions()
  const { toast } = useToast()

  // Debug logs
  console.log('🏠 Index component state:', {
    tokensLoading,
    tokensCount: tokens.length,
    accountLoading,
    account: account ? 'loaded' : 'null',
    accountError
  })

  // Transform tokens to DisplayToken format with better error handling
  const displayTokens: DisplayToken[] = tokens.map(token => {
    const latestPrice = token.token_prices?.[0]
    const displayToken = {
      ...token,
      currentPrice: latestPrice?.price_usd || 0,
      change24h: latestPrice?.change_24h || 0,
      changePercent24h: latestPrice?.change_percent_24h || 0,
      marketCap: latestPrice?.market_cap || 0,
      indexType: token.index_type
    }
    
    console.log(`🪙 Token ${token.symbol} processed:`, {
      hasPrice: !!latestPrice,
      currentPrice: displayToken.currentPrice,
      priceData: latestPrice
    })
    
    return displayToken
  })

  const handleBuyToken = (token: DisplayToken) => {
    setSelectedToken(token)
    setTradeType('buy')
    setIsModalOpen(true)
  }

  const handleSellToken = (token: DisplayToken) => {
    setSelectedToken(token)
    setTradeType('sell')
    setIsModalOpen(true)
  }

  const handleUpdatePrices = async () => {
    try {
      await updatePrices()
      toast({
        title: "¡Precios actualizados! 📈",
        description: "Los precios de los tokens han sido actualizados con éxito",
      })
    } catch (error) {
      toast({
        title: "Error actualizando precios 😔",
        description: "No pudimos actualizar los precios. Inténtalo de nuevo.",
        variant: "destructive"
      })
    }
  }

  const totalPortfolioValue = portfolio.reduce((total, item) => {
    const token = displayTokens.find(t => t.id === item.token_id)
    return total + (item.quantity * (token?.currentPrice || 0))
  }, 0)

  const totalBalance = (account?.wld_balance || 0) * 2.45 + (account?.usdc_balance || 0) // Assuming 1 WLD = $2.45

  // Show loading only for tokens, not for account
  if (tokensLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Sparkles className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <p className="text-xl font-semibold text-gray-700">Cargando TrustSave...</p>
          <p className="text-sm text-gray-500">Conectando con la base de datos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TrustSave
            </h1>
            <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            🌟 Invierte en índices del mundo con verificación World ID 🌟
          </p>
          <div className="flex justify-center mt-4">
            <Button 
              onClick={handleUpdatePrices}
              variant="outline"
              className="flex items-center gap-2 border-2 border-blue-300 hover:bg-blue-50"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar Precios
            </Button>
          </div>
        </div>

        {/* Debug Information */}
        <div className="mb-6">
          <Card className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200">
            <div className="text-sm space-y-1">
              <p><strong>Debug Info:</strong></p>
              <p>• Tokens cargados: {tokens.length}</p>
              <p>• Tokens con precios: {displayTokens.filter(t => t.currentPrice > 0).length}</p>
              <p>• Estado cuenta: {accountLoading ? 'Cargando...' : account ? 'Cargada' : 'Error'}</p>
              {accountError && <p className="text-red-600">• Error: {accountError}</p>}
            </div>
          </Card>
        </div>

        {/* Account Status Alert */}
        {accountLoading && (
          <div className="mb-6">
            <Card className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-yellow-600 animate-spin" />
                <div>
                  <p className="font-semibold text-yellow-800">Configurando tu cuenta...</p>
                  <p className="text-sm text-yellow-700">Esto puede tomar unos segundos la primera vez</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {accountError && (
          <div className="mb-6">
            <Card className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-semibold text-red-800">Error de cuenta</p>
                  <p className="text-sm text-red-700">{accountError}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200">
            <div className="flex items-center gap-3">
              <Wallet className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600 font-medium">Saldo Total</p>
                <p className="text-2xl font-bold text-green-700">
                  ${(totalBalance + totalPortfolioValue).toFixed(2)}
                </p>
                {accountLoading && <p className="text-xs text-gray-500">Cargando...</p>}
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-100 border-2 border-blue-200">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600 font-medium">Portfolio</p>
                <p className="text-2xl font-bold text-blue-700">${totalPortfolioValue.toFixed(2)}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-100 border-2 border-purple-200">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600 font-medium">Disponible</p>
                <p className="text-2xl font-bold text-purple-700">
                  ${totalBalance.toFixed(2)}
                </p>
                {account && (
                  <p className="text-xs text-gray-500">
                    {account.wld_balance.toFixed(2)} WLD + {account.usdc_balance.toFixed(2)} USDC
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="market" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm border-2 border-blue-200">
            <TabsTrigger value="market" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              📈 Mercado ({displayTokens.length})
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              💼 Mi Portfolio
            </TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              📊 Transacciones
            </TabsTrigger>
          </TabsList>

          <TabsContent value="market" className="space-y-6">
            {displayTokens.length === 0 ? (
              <Card className="p-8 text-center bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-600 mb-4">🔍 No hay tokens disponibles</p>
                <p className="text-gray-500">Verifica que haya datos en la base de datos</p>
                <Button onClick={() => refetchTokens()} className="mt-4">
                  🔄 Recargar tokens
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayTokens.map((token) => (
                  <TokenCard
                    key={token.id}
                    token={token}
                    onBuy={handleBuyToken}
                    onSell={handleSellToken}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            {portfolioLoading ? (
              <div className="text-center py-8">
                <Activity className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                <p>Cargando portfolio...</p>
              </div>
            ) : portfolio.length === 0 ? (
              <Card className="p-8 text-center bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200">
                <p className="text-lg text-gray-600 mb-4">🎯 Tu portfolio está vacío</p>
                <p className="text-gray-500">¡Comienza invirtiendo en tu primer token!</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolio.map((item) => {
                  const token = displayTokens.find(t => t.id === item.token_id)
                  if (!token) return null
                  
                  const currentValue = item.quantity * token.currentPrice
                  const profitLoss = currentValue - item.total_invested
                  const profitLossPercent = ((profitLoss / item.total_invested) * 100)
                  
                  return (
                    <Card key={item.id} className="p-6 bg-gradient-to-br from-white to-blue-50 border-2 border-blue-100">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-lg text-gray-800">{token.symbol}</h3>
                          <Badge variant={profitLoss >= 0 ? "default" : "destructive"}>
                            {profitLoss >= 0 ? "📈" : "📉"} {profitLoss >= 0 ? "+" : ""}{profitLossPercent.toFixed(2)}%
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Cantidad:</span>
                            <span className="font-semibold">{item.quantity.toFixed(4)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Precio promedio:</span>
                            <span className="font-semibold">${item.average_buy_price.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Valor actual:</span>
                            <span className="font-semibold text-blue-600">${currentValue.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="text-gray-600">Ganancia/Pérdida:</span>
                            <span className={`font-bold ${profitLoss >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                              ${profitLoss.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            {transactionsLoading ? (
              <div className="text-center py-8">
                <Activity className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                <p>Cargando transacciones...</p>
              </div>
            ) : transactions.length === 0 ? (
              <Card className="p-8 text-center bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200">
                <p className="text-lg text-gray-600 mb-4">📋 No tienes transacciones aún</p>
                <p className="text-gray-500">¡Realiza tu primera compra para ver el historial!</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <Card key={transaction.id} className="p-4 bg-gradient-to-r from-white to-blue-50 border-2 border-blue-100">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          transaction.status === 'completed' ? 'bg-green-500' :
                          transaction.status === 'pending' ? 'bg-yellow-500' :
                          transaction.status === 'failed' ? 'bg-red-500' : 'bg-gray-500'
                        }`} />
                        <div>
                          <p className="font-semibold text-gray-800">
                            {transaction.transaction_type === 'buy' ? '📈 Compra' : 
                             transaction.transaction_type === 'sell' ? '📉 Venta' :
                             transaction.transaction_type === 'deposit' ? '💰 Depósito' : '💸 Retiro'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {transaction.index_tokens?.symbol || 'N/A'} • {transaction.payment_currency}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">${transaction.total_amount.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <TradingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        token={selectedToken}
        type={tradeType}
      />
    </div>
  )
}

export default Index
