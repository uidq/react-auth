-- Migration script to add subscription durations to Supabase
-- Run this in the Supabase SQL Editor

-- Add duration column to subscriptions table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'subscriptions' AND column_name = 'duration'
    ) THEN
        ALTER TABLE subscriptions ADD COLUMN duration TEXT DEFAULT 'month';
    END IF;
END $$;

-- Update existing subscribers to have the 'month' duration
UPDATE subscriptions
SET duration = 'month'
WHERE duration IS NULL;

-- Function to get active subscription with days remaining calculation
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

-- Function to check if subscription is expiring soon
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

-- Create a view to see subscription statistics by duration
CREATE OR REPLACE VIEW subscription_statistics AS
SELECT
  duration,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE status = 'active') as active_count,
  AVG(price) as average_price,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT game) as unique_games
FROM
  subscriptions
GROUP BY
  duration
ORDER BY
  duration;

-- Create a function to renew subscriptions based on their duration
CREATE OR REPLACE FUNCTION renew_subscription(subscription_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_subscription subscriptions;
  v_new_renewal_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get the subscription
  SELECT * INTO v_subscription FROM subscriptions WHERE id = subscription_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate new renewal date based on duration
  IF v_subscription.duration = 'day' THEN
    v_new_renewal_date := v_subscription.renewal_date + INTERVAL '1 day';
  ELSIF v_subscription.duration = 'week' THEN
    v_new_renewal_date := v_subscription.renewal_date + INTERVAL '7 days';
  ELSE
    v_new_renewal_date := v_subscription.renewal_date + INTERVAL '30 days';
  END IF;
  
  -- Update the subscription
  UPDATE subscriptions
  SET
    renewal_date = v_new_renewal_date,
    updated_at = NOW()
  WHERE
    id = subscription_id;
    
  RETURN FOUND;
END;
$$; 