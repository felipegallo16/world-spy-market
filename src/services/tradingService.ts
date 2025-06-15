
import { supabase } from '@/integrations/supabase/client'

interface ExecuteTradeParams {
  tokenSymbol: string
  quantity: number
  tradeType: 'buy' | 'sell'
  paymentCurrency: 'WLD' | 'USDC'
  worldIdNullifier: string
}

export const executeTrade = async (params: ExecuteTradeParams) => {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase.functions.invoke('execute-trade', {
    body: params,
    headers: {
      Authorization: `Bearer ${session.access_token}`
    }
  })

  if (error) {
    throw error
  }

  if (!data.success) {
    throw new Error(data.error || 'Trade failed')
  }

  return data
}
