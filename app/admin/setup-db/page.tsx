'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@heroui/button'
import { createTables } from '@/lib/schema'

export default function SetupDbPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  
  const setupSubscriptionDurations = async () => {
    try {
      setLoading(true)
      setMessage('')
      setError('')
      
      // Check if the duration column exists
      const { data: columns, error: columnsError } = await supabase
        .from('subscriptions')
        .select('duration')
        .limit(1)
      
      if (columnsError && columnsError.message.includes('column "duration" does not exist')) {
        // Add duration column
        const { error: alterError } = await supabase.rpc('execute_sql', {
          sql_query: `ALTER TABLE subscriptions ADD COLUMN duration TEXT DEFAULT 'month';`
        })
        
        if (alterError) throw new Error(`Failed to add duration column: ${alterError.message}`)
        
        setMessage(prev => prev + '\nAdded duration column to subscriptions table.')
      } else {
        setMessage(prev => prev + '\nDuration column already exists.')
      }
      
      // Update existing subscriptions
      const { error: updateError } = await supabase.rpc('execute_sql', {
        sql_query: `UPDATE subscriptions SET duration = 'month' WHERE duration IS NULL;`
      })
      
      if (updateError) throw new Error(`Failed to update existing subscriptions: ${updateError.message}`)
      
      setMessage(prev => prev + '\nUpdated existing subscriptions with month duration.')
      
      // Update get_active_subscription function
      const getActiveSubscriptionFn = `
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
      `
      
      const { error: fnError } = await supabase.rpc('execute_sql', {
        sql_query: getActiveSubscriptionFn
      })
      
      if (fnError) throw new Error(`Failed to update get_active_subscription function: ${fnError.message}`)
      
      setMessage(prev => prev + '\nUpdated get_active_subscription function.')
      
      // Update is_subscription_expiring_soon function
      const isExpiringSoonFn = `
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
      `
      
      const { error: expireFnError } = await supabase.rpc('execute_sql', {
        sql_query: isExpiringSoonFn
      })
      
      if (expireFnError) throw new Error(`Failed to update is_subscription_expiring_soon function: ${expireFnError.message}`)
      
      setMessage(prev => prev + '\nUpdated is_subscription_expiring_soon function.')
      
      // Create statistics view
      const statsView = `
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
      `
      
      const { error: viewError } = await supabase.rpc('execute_sql', {
        sql_query: statsView
      })
      
      if (viewError) throw new Error(`Failed to create subscription statistics view: ${viewError.message}`)
      
      setMessage(prev => prev + '\nCreated subscription statistics view.')
      
      // Create renew subscription function
      const renewFn = `
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
      `
      
      const { error: renewFnError } = await supabase.rpc('execute_sql', {
        sql_query: renewFn
      })
      
      if (renewFnError) throw new Error(`Failed to create renew_subscription function: ${renewFnError.message}`)
      
      setMessage(prev => prev + '\nCreated renew_subscription function.')
      
      setMessage(prev => prev + '\n\nSubscription durations setup completed successfully!')
    } catch (err: any) {
      console.error('Setup error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const setupAllTables = async () => {
    try {
      setLoading(true)
      setMessage('')
      setError('')
      
      // Split the createTables string into individual statements
      const statements = createTables
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0)
      
      // Execute each statement
      for (const stmt of statements) {
        const { error } = await supabase.rpc('execute_sql', {
          sql_query: stmt + ';'
        })
        
        if (error) {
          // Some errors are expected for statements that create objects that already exist
          const ignorableErrors = [
            'already exists',
            'relation "subscriptions" does not exist'
          ]
          
          const isIgnorable = ignorableErrors.some(e => error.message.includes(e))
          
          if (!isIgnorable) {
            throw new Error(`Failed to execute statement: ${error.message}\n\nStatement: ${stmt}`)
          }
        }
      }
      
      setMessage('Database setup completed successfully!')
    } catch (err: any) {
      console.error('Setup error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Database Setup</h1>
      
      <div className="border-card p-6 space-y-4">
        <h2 className="text-xl font-medium">Subscription Durations Migration</h2>
        <p className="text-text-secondary">
          This will update the database to support one-day, one-week, and one-month subscription durations.
        </p>
        
        <Button 
          color="primary"
          onClick={setupSubscriptionDurations}
          isLoading={loading}
          disabled={loading}
        >
          Run Migration
        </Button>
      </div>
      
      <div className="border-card p-6 space-y-4">
        <h2 className="text-xl font-medium">Full Database Setup</h2>
        <p className="text-text-secondary">
          This will create all database tables, functions, and triggers. Only use this on a fresh database.
        </p>
        
        <Button 
          color="warning"
          onClick={setupAllTables}
          isLoading={loading}
          disabled={loading}
        >
          Setup All Tables
        </Button>
      </div>
      
      {message && (
        <div className="bg-green-500/20 text-green-500 p-4 rounded-lg whitespace-pre-line">
          {message}
        </div>
      )}
      
      {error && (
        <div className="bg-red-500/20 text-red-500 p-4 rounded-lg whitespace-pre-line">
          Error: {error}
        </div>
      )}
    </div>
  )
} 