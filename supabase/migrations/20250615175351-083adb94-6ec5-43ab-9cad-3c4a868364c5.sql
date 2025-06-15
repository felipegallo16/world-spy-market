
-- Create enum for transaction types
CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'buy', 'sell');

-- Create enum for transaction status
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');

-- Create enum for index token types
CREATE TYPE index_type AS ENUM ('SP500', 'NASDAQ', 'DOW', 'FTSE', 'NIKKEI', 'DAX');

-- Create user accounts table for real balances
CREATE TABLE public.user_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    wld_balance DECIMAL(20, 8) DEFAULT 0.00 NOT NULL CHECK (wld_balance >= 0),
    usdc_balance DECIMAL(20, 8) DEFAULT 0.00 NOT NULL CHECK (usdc_balance >= 0),
    total_deposited_wld DECIMAL(20, 8) DEFAULT 0.00 NOT NULL,
    total_deposited_usdc DECIMAL(20, 8) DEFAULT 0.00 NOT NULL,
    total_withdrawn_wld DECIMAL(20, 8) DEFAULT 0.00 NOT NULL,
    total_withdrawn_usdc DECIMAL(20, 8) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index tokens table
CREATE TABLE public.index_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    index_type index_type NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create token prices table for real-time pricing
CREATE TABLE public.token_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_id UUID REFERENCES public.index_tokens(id) ON DELETE CASCADE NOT NULL,
    price_usd DECIMAL(20, 8) NOT NULL,
    change_24h DECIMAL(20, 8) DEFAULT 0.00,
    change_percent_24h DECIMAL(10, 4) DEFAULT 0.00,
    market_cap DECIMAL(30, 2),
    volume_24h DECIMAL(30, 2),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(token_id)
);

-- Create user portfolios table
CREATE TABLE public.user_portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    token_id UUID REFERENCES public.index_tokens(id) ON DELETE CASCADE NOT NULL,
    quantity DECIMAL(20, 8) DEFAULT 0.00 NOT NULL CHECK (quantity >= 0),
    average_buy_price DECIMAL(20, 8) DEFAULT 0.00 NOT NULL,
    total_invested DECIMAL(20, 8) DEFAULT 0.00 NOT NULL,
    realized_pnl DECIMAL(20, 8) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, token_id)
);

-- Create transactions table for complete history
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    transaction_type transaction_type NOT NULL,
    token_id UUID REFERENCES public.index_tokens(id) ON DELETE SET NULL,
    quantity DECIMAL(20, 8),
    price_per_token DECIMAL(20, 8),
    total_amount DECIMAL(20, 8) NOT NULL,
    commission_amount DECIMAL(20, 8) DEFAULT 0.00 NOT NULL,
    payment_currency VARCHAR(10) NOT NULL, -- 'WLD' or 'USDC'
    status transaction_status DEFAULT 'pending' NOT NULL,
    world_id_nullifier VARCHAR(100),
    blockchain_tx_hash VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create commission earnings table for tracking app revenue
CREATE TABLE public.commission_earnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE NOT NULL,
    commission_amount DECIMAL(20, 8) NOT NULL,
    commission_currency VARCHAR(10) NOT NULL,
    commission_rate DECIMAL(5, 4) NOT NULL, -- e.g., 0.0075 for 0.75%
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Insert default index tokens
INSERT INTO public.index_tokens (symbol, name, description, index_type) VALUES
    ('SP500', 'Index Token S&P 500', 'Replica las 500 mejores empresas de Estados Unidos', 'SP500'),
    ('NASDAQ', 'Index Token NASDAQ', 'Las mejores empresas tecnológicas del mundo', 'NASDAQ'),
    ('DOW', 'Index Token Dow Jones', 'Las 30 empresas más importantes de Estados Unidos', 'DOW'),
    ('FTSE', 'Index Token FTSE 100', 'Las 100 mejores empresas del Reino Unido', 'FTSE'),
    ('NIKKEI', 'Index Token Nikkei 225', 'Las mejores empresas de Japón', 'NIKKEI'),
    ('DAX', 'Index Token DAX', 'Las mejores empresas de Alemania', 'DAX');

-- Insert initial token prices (mock data, will be updated by API)
INSERT INTO public.token_prices (token_id, price_usd, change_24h, change_percent_24h, market_cap)
SELECT 
    id,
    CASE 
        WHEN symbol = 'SP500' THEN 4842.50
        WHEN symbol = 'NASDAQ' THEN 15845.23
        WHEN symbol = 'DOW' THEN 34567.89
        WHEN symbol = 'FTSE' THEN 7654.32
        WHEN symbol = 'NIKKEI' THEN 32890.45
        WHEN symbol = 'DAX' THEN 16234.78
    END as price_usd,
    CASE 
        WHEN symbol = 'SP500' THEN 45.20
        WHEN symbol = 'NASDAQ' THEN 123.45
        WHEN symbol = 'DOW' THEN 234.56
        WHEN symbol = 'FTSE' THEN 34.21
        WHEN symbol = 'NIKKEI' THEN 187.63
        WHEN symbol = 'DAX' THEN 98.45
    END as change_24h,
    CASE 
        WHEN symbol = 'SP500' THEN 0.94
        WHEN symbol = 'NASDAQ' THEN 0.78
        WHEN symbol = 'DOW' THEN 0.68
        WHEN symbol = 'FTSE' THEN 0.45
        WHEN symbol = 'NIKKEI' THEN 0.57
        WHEN symbol = 'DAX' THEN 0.61
    END as change_percent_24h,
    45000000000000::DECIMAL as market_cap
FROM public.index_tokens;

-- Enable Row Level Security
ALTER TABLE public.user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.index_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_accounts
CREATE POLICY "Users can view their own account" ON public.user_accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own account" ON public.user_accounts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own account" ON public.user_accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_portfolios
CREATE POLICY "Users can view their own portfolio" ON public.user_portfolios
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolio" ON public.user_portfolios
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own portfolio" ON public.user_portfolios
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for transactions
CREATE POLICY "Users can view their own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for commission_earnings (admin only - no policies for regular users)

-- RLS Policies for token_prices (public read access)
CREATE POLICY "Everyone can view token prices" ON public.token_prices
    FOR SELECT TO authenticated USING (true);

-- RLS Policies for index_tokens (public read access)
CREATE POLICY "Everyone can view index tokens" ON public.index_tokens
    FOR SELECT TO authenticated USING (true);

-- Create function to automatically create user account on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_accounts (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_accounts_updated_at
    BEFORE UPDATE ON public.user_accounts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_portfolios_updated_at
    BEFORE UPDATE ON public.user_portfolios
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_user_accounts_user_id ON public.user_accounts(user_id);
CREATE INDEX idx_user_portfolios_user_id ON public.user_portfolios(user_id);
CREATE INDEX idx_user_portfolios_token_id ON public.user_portfolios(token_id);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX idx_token_prices_token_id ON public.token_prices(token_id);
CREATE INDEX idx_commission_earnings_transaction_id ON public.commission_earnings(transaction_id);
