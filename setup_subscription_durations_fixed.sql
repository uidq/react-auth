-- Emergency fix for subscription durations
-- Run this SQL directly in the Supabase SQL Editor to fix subscription issues

-- First, check if subscriptions table exists and create it if not
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'subscriptions'
    ) THEN
        CREATE TABLE subscriptions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            plan_id TEXT NOT NULL,
            game TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'active',
            price NUMERIC(10, 2) NOT NULL,
            subscription_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            subscription_end TIMESTAMP WITH TIME ZONE NULL,
            renewal_date TIMESTAMP WITH TIME ZONE NULL,
            payment_method TEXT DEFAULT 'credit_card',
            payment_last_four TEXT,
            duration TEXT DEFAULT 'month',
            metadata JSONB DEFAULT '{}'::JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Add RLS (Row Level Security) to subscriptions table
        ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
        
        -- Create policy to allow users to see only their own subscriptions
        CREATE POLICY "Users can view their own subscriptions"
            ON subscriptions
            FOR SELECT
            USING (auth.uid() = user_id);
        
        -- Create policy to allow users to insert their own subscriptions
        CREATE POLICY "Users can insert their own subscriptions"
            ON subscriptions
            FOR INSERT
            WITH CHECK (auth.uid() = user_id);
        
        -- Create policy to allow users to update their own subscriptions
        CREATE POLICY "Users can update their own subscriptions"
            ON subscriptions
            FOR UPDATE
            USING (auth.uid() = user_id);
            
        RAISE NOTICE 'Created subscriptions table';
    ELSE
        RAISE NOTICE 'Subscriptions table already exists';
    END IF;
END
$$;

-- Next, check if the duration column exists and add it if not
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'subscriptions' AND column_name = 'duration'
    ) THEN
        ALTER TABLE subscriptions ADD COLUMN duration TEXT DEFAULT 'month';
        RAISE NOTICE 'Added duration column to subscriptions table';
    ELSE
        RAISE NOTICE 'Duration column already exists';
    END IF;
END
$$;

-- Update existing subscriptions (if any)
UPDATE subscriptions
SET duration = 'month'
WHERE duration IS NULL;

-- Drop existing functions first to avoid return type conflicts
DO $$
BEGIN
    -- Drop get_active_subscription function if it exists
    IF EXISTS (
        SELECT FROM pg_proc 
        WHERE proname = 'get_active_subscription' 
        AND pg_function_is_visible(oid)
    ) THEN
        DROP FUNCTION get_active_subscription(UUID);
        RAISE NOTICE 'Dropped existing get_active_subscription function';
    END IF;
    
    -- Drop is_subscription_expiring_soon function if it exists
    IF EXISTS (
        SELECT FROM pg_proc 
        WHERE proname = 'is_subscription_expiring_soon' 
        AND pg_function_is_visible(oid)
    ) THEN
        DROP FUNCTION is_subscription_expiring_soon(UUID);
        RAISE NOTICE 'Dropped existing is_subscription_expiring_soon function';
    END IF;
END
$$;

-- Create stored procedure for active subscription
CREATE OR REPLACE FUNCTION get_active_subscription(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  plan_id TEXT,
  game TEXT,
  status TEXT,
  days_remaining INTEGER,
  renewal_date TIMESTAMP WITH TIME ZONE,
  duration TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.plan_id,
    s.game,
    s.status,
    CASE
      WHEN s.duration = 'day' THEN 
        EXTRACT(EPOCH FROM (s.renewal_date - NOW()))::INTEGER / 3600  -- Hours for day subscriptions
      WHEN s.duration = 'week' THEN 
        EXTRACT(EPOCH FROM (s.renewal_date - NOW()))::INTEGER / 86400  -- Days for week subscriptions
      ELSE 
        EXTRACT(EPOCH FROM (s.renewal_date - NOW()))::INTEGER / 86400  -- Days for month subscriptions
    END AS days_remaining,
    s.renewal_date,
    s.duration
  FROM 
    subscriptions s
  WHERE 
    s.user_id = p_user_id 
    AND s.status = 'active' 
    AND (s.subscription_end IS NULL OR s.subscription_end > NOW())
  ORDER BY 
    s.created_at DESC
  LIMIT 1;
END;
$$;

-- Create stored procedure for checking if subscription is expiring soon
CREATE OR REPLACE FUNCTION is_subscription_expiring_soon(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_expiring BOOLEAN;
BEGIN
  SELECT 
    CASE
      WHEN s.duration = 'day' THEN 
        s.renewal_date <= NOW() + INTERVAL '6 hours'  -- 6 hours for day subscriptions
      WHEN s.duration = 'week' THEN 
        s.renewal_date <= NOW() + INTERVAL '2 days'   -- 2 days for week subscriptions
      ELSE 
        s.renewal_date <= NOW() + INTERVAL '7 days'   -- 7 days for month subscriptions
    END
  INTO v_expiring
  FROM 
    subscriptions s
  WHERE 
    s.user_id = p_user_id 
    AND s.status = 'active' 
    AND (s.subscription_end IS NULL OR s.subscription_end > NOW())
  ORDER BY 
    s.created_at DESC
  LIMIT 1;
  
  RETURN COALESCE(v_expiring, FALSE);
END;
$$;

-- Test if stored procedures are working
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Get a random user for testing
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    PERFORM get_active_subscription(test_user_id);
    PERFORM is_subscription_expiring_soon(test_user_id);
    RAISE NOTICE 'Successfully tested stored procedures with user ID: %', test_user_id;
  ELSE
    RAISE NOTICE 'No users found for testing';
  END IF;
END
$$; 