
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TradeRequest {
  tokenSymbol: string
  quantity: number
  tradeType: 'buy' | 'sell'
  paymentCurrency: 'WLD' | 'USDC'
  worldIdNullifier: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const tradeData: TradeRequest = await req.json()
    const { tokenSymbol, quantity, tradeType, paymentCurrency, worldIdNullifier } = tradeData

    // Get token info
    const { data: token, error: tokenError } = await supabaseClient
      .from('index_tokens')
      .select(`
        *,
        token_prices (
          price_usd,
          change_24h,
          change_percent_24h
        )
      `)
      .eq('symbol', tokenSymbol)
      .eq('is_active', true)
      .single()

    if (tokenError || !token) {
      throw new Error('Token not found')
    }

    const currentPrice = token.token_prices[0]?.price_usd
    if (!currentPrice) {
      throw new Error('Price not available')
    }

    // Calculate trade amounts
    const commission_rate = 0.0075 // 0.75%
    const totalValue = quantity * currentPrice
    const commissionAmount = totalValue * commission_rate
    const totalWithCommission = tradeType === 'buy' ? totalValue + commissionAmount : totalValue - commissionAmount

    // Get user account
    const { data: userAccount, error: accountError } = await supabaseClient
      .from('user_accounts')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (accountError || !userAccount) {
      throw new Error('User account not found')
    }

    // Check if user has sufficient balance for buy orders
    if (tradeType === 'buy') {
      const requiredBalance = paymentCurrency === 'WLD' ? 
        totalWithCommission / 2.45 : // WLD conversion rate
        totalWithCommission

      const currentBalance = paymentCurrency === 'WLD' ? 
        userAccount.wld_balance : 
        userAccount.usdc_balance

      if (currentBalance < requiredBalance) {
        throw new Error('Insufficient balance')
      }
    }

    // Start transaction
    const { data: transaction, error: transactionError } = await supabaseClient
      .from('transactions')
      .insert({
        user_id: user.id,
        transaction_type: tradeType,
        token_id: token.id,
        quantity: quantity,
        price_per_token: currentPrice,
        total_amount: totalValue,
        commission_amount: commissionAmount,
        payment_currency: paymentCurrency,
        status: 'completed',
        world_id_nullifier: worldIdNullifier,
        completed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (transactionError) {
      throw new Error('Failed to create transaction')
    }

    // Record commission
    await supabaseClient
      .from('commission_earnings')
      .insert({
        transaction_id: transaction.id,
        commission_amount: commissionAmount,
        commission_currency: paymentCurrency,
        commission_rate: commission_rate
      })

    if (tradeType === 'buy') {
      // Deduct from user balance
      const balanceField = paymentCurrency === 'WLD' ? 'wld_balance' : 'usdc_balance'
      const deductAmount = paymentCurrency === 'WLD' ? 
        totalWithCommission / 2.45 : 
        totalWithCommission

      await supabaseClient
        .from('user_accounts')
        .update({
          [balanceField]: userAccount[balanceField] - deductAmount
        })
        .eq('user_id', user.id)

      // Update portfolio
      const { data: existingPortfolio } = await supabaseClient
        .from('user_portfolios')
        .select('*')
        .eq('user_id', user.id)
        .eq('token_id', token.id)
        .single()

      if (existingPortfolio) {
        // Update existing position
        const newQuantity = existingPortfolio.quantity + quantity
        const newTotalInvested = existingPortfolio.total_invested + totalValue
        const newAveragePrice = newTotalInvested / newQuantity

        await supabaseClient
          .from('user_portfolios')
          .update({
            quantity: newQuantity,
            average_buy_price: newAveragePrice,
            total_invested: newTotalInvested
          })
          .eq('id', existingPortfolio.id)
      } else {
        // Create new position
        await supabaseClient
          .from('user_portfolios')
          .insert({
            user_id: user.id,
            token_id: token.id,
            quantity: quantity,
            average_buy_price: currentPrice,
            total_invested: totalValue
          })
      }
    } else {
      // Sell logic - update portfolio and add to balance
      const { data: portfolio, error: portfolioError } = await supabaseClient
        .from('user_portfolios')
        .select('*')
        .eq('user_id', user.id)
        .eq('token_id', token.id)
        .single()

      if (portfolioError || !portfolio || portfolio.quantity < quantity) {
        throw new Error('Insufficient tokens to sell')
      }

      // Calculate realized P&L
      const costBasis = quantity * portfolio.average_buy_price
      const realizedPnl = totalValue - costBasis

      // Update portfolio
      const newQuantity = portfolio.quantity - quantity
      if (newQuantity === 0) {
        await supabaseClient
          .from('user_portfolios')
          .delete()
          .eq('id', portfolio.id)
      } else {
        await supabaseClient
          .from('user_portfolios')
          .update({
            quantity: newQuantity,
            total_invested: portfolio.total_invested - costBasis,
            realized_pnl: portfolio.realized_pnl + realizedPnl
          })
          .eq('id', portfolio.id)
      }

      // Add to user balance
      const balanceField = paymentCurrency === 'WLD' ? 'wld_balance' : 'usdc_balance'
      const addAmount = paymentCurrency === 'WLD' ? 
        totalWithCommission / 2.45 : 
        totalWithCommission

      await supabaseClient
        .from('user_accounts')
        .update({
          [balanceField]: userAccount[balanceField] + addAmount
        })
        .eq('user_id', user.id)
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        transaction: transaction,
        message: `${tradeType === 'buy' ? 'Bought' : 'Sold'} ${quantity} ${tokenSymbol} tokens`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in execute-trade function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
