// Types for user settings and statistics
export type UserSettings = {
  user_id: string;
  dark_mode: boolean;
  email_updates: boolean;
  timezone: string;
  language: string;
  last_updated: string;
};

export interface UserStats {
  user_id: string;
  total_logins: number;
  last_login: string;
  profile_visits: number;
  account_created: string;
}

export type SiteStats = {
  total_users: number;
  active_users_last_week: number;
  new_users_last_week: number;
  last_updated: string;
};

export type VisitHistory = {
  id: string;
  user_id: string;
  visitor_id: string | null; // Null for anonymous visitors
  visitor_name: string | null;
  visited_at: string;
};

// Supabase table names
export const TABLES = {
  USER_SETTINGS: 'user_settings',
  USER_STATS: 'user_stats',
  SITE_STATS: 'site_stats',
  VISIT_HISTORY: 'visit_history',
};

// Supabase database initialization (run this in a migration script)
export const createTables = `
-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  dark_mode BOOLEAN DEFAULT true,
  email_updates BOOLEAN DEFAULT true,
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'en',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_stats table
CREATE TABLE IF NOT EXISTS user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_logins INTEGER DEFAULT 1,
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  profile_visits INTEGER DEFAULT 0,
  account_created TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create site_stats table
CREATE TABLE IF NOT EXISTS site_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_users INTEGER DEFAULT 0,
  active_users_last_week INTEGER DEFAULT 0,
  new_users_last_week INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create visit_history table
CREATE TABLE IF NOT EXISTS visit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  visitor_id UUID REFERENCES auth.users(id) NULL,
  visitor_name TEXT NULL,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
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

-- Function to get visible subscription (active or canceled but not expired)
CREATE OR REPLACE FUNCTION get_visible_subscription(p_user_id UUID)
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
    AND (s.status = 'active' OR s.status = 'cancelled')
    AND s.renewal_date > NOW()
  ORDER BY 
    s.created_at DESC
  LIMIT 1;
END;
$$;

-- Function to check if subscription is expiring soon (within 24 hours for day, 2 days for week, 7 days for month)
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

-- Function to update site stats
CREATE OR REPLACE FUNCTION update_site_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO site_stats (id, total_users, active_users_last_week, new_users_last_week)
  VALUES (
    gen_random_uuid(),
    (SELECT COUNT(*) FROM auth.users),
    (SELECT COUNT(*) FROM user_stats WHERE last_login > NOW() - INTERVAL '7 days'),
    (SELECT COUNT(*) FROM auth.users WHERE created_at > NOW() - INTERVAL '7 days')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update site stats when new user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION update_site_stats();

-- Initial seed for site stats
INSERT INTO site_stats (total_users, active_users_last_week, new_users_last_week)
SELECT 
  COUNT(*), 
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days'),
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days')
FROM auth.users
ON CONFLICT DO NOTHING;
`;

// Subscription status types
export type SubscriptionStatus = 'active' | 'cancelled' | 'pending' | 'suspended' | 'expired';

// Plan types
export type PlanId = 'basic' | 'pro' | 'enterprise';

// Subscription durations
export type SubscriptionDuration = 'day' | 'week' | 'month';

// Supported games
export type GameType = 'Apex Legends' | 'Escape from Tarkov' | 'Rust';

// Subscription data
export interface Subscription {
  id: string;
  user_id: string;
  plan_id: PlanId;
  game: GameType;
  status: SubscriptionStatus;
  price: number;
  subscription_start: string;
  subscription_end?: string;
  renewal_date?: string;
  payment_method?: string;
  payment_last_four?: string;
  created_at: string;
  updated_at: string;
  duration?: SubscriptionDuration;
  metadata?: Record<string, any>;
}

// Active subscription with days remaining
export interface ActiveSubscription {
  id: string;
  plan_id: PlanId;
  game: GameType;
  status: SubscriptionStatus;
  days_remaining: number;
  renewal_date: string;
  duration?: SubscriptionDuration;
}

// Plan details
export interface Plan {
  id: PlanId;
  name: string;
  price: string;
  period: 'day' | 'week' | 'month' | 'year';
  duration: SubscriptionDuration;
  color: 'blue' | 'purple' | 'green';
  game: GameType;
  features: string[];
  popular: boolean;
} 