import { supabase } from './supabase';
import { createTables } from './schema';

/**
 * Run this function to initialize the database schema.
 * This should be executed once when setting up the application.
 * 
 * Example usage: 
 *  import { initializeDatabase } from '@/lib/migrations';
 *  
 *  // In a development script or admin panel
 *  await initializeDatabase();
 */
export async function initializeDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    // Execute raw SQL to create tables and functions
    const { error } = await supabase.rpc('exec_sql', { sql: createTables });
    
    if (error) {
      // If rpc doesn't exist yet, fallback to using raw SQL queries (less secure)
      console.warn('RPC method not found, falling back to direct SQL execution via multiple queries');
      
      // Split the SQL into individual statements
      const statements = createTables.split(';').filter(stmt => stmt.trim() !== '');
      
      // Execute each statement separately
      for (const stmt of statements) {
        // Use the query method rather than sql since it's type-safe
        const { error } = await supabase
          .from('_exec_sql')
          .insert({ query: stmt })
          .select();
          
        if (error) {
          throw new Error(`Error executing SQL statement: ${error.message}`);
        }
      }
    }
    
    return { success: true, message: 'Database schema initialized successfully' };
  } catch (error: any) {
    console.error('Error initializing database schema:', error);
    return { 
      success: false, 
      message: `Error initializing database: ${error.message}` 
    };
  }
}

/**
 * Create an RPC function in Supabase to increment user login count.
 * This should be executed once when setting up the application.
 */
export async function createIncrementLoginFunction(): Promise<{ success: boolean; message: string }> {
  try {
    const sql = `
      CREATE OR REPLACE FUNCTION increment_user_login(user_id_param UUID)
      RETURNS VOID AS $$
      DECLARE
        current_logins INTEGER;
      BEGIN
        -- Get current login count
        SELECT total_logins INTO current_logins FROM user_stats WHERE user_id = user_id_param;
        
        -- Insert or update the record
        INSERT INTO user_stats (user_id, total_logins, last_login)
        VALUES (user_id_param, 1, NOW())
        ON CONFLICT (user_id)
        DO UPDATE SET
          total_logins = COALESCE(user_stats.total_logins, 0) + 1,
          last_login = NOW();
      END;
      $$ LANGUAGE plpgsql;
    `;
    
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      // If rpc doesn't exist, fallback to REST API
      // Use the query method rather than sql
      const { error: directError } = await supabase
        .from('_exec_sql')
        .insert({ query: sql })
        .select();
        
      if (directError) {
        throw new Error(`Error creating function: ${directError.message}`);
      }
    }
    
    return { success: true, message: 'Increment login function created successfully' };
  } catch (error: any) {
    console.error('Error creating increment login function:', error);
    return { 
      success: false, 
      message: `Error creating function: ${error.message}` 
    };
  }
}

/**
 * Create a SQL Function that allows executing SQL from an RPC call.
 * SECURITY WARNING: This should only be used during development or by admins!
 */
export async function createExecSqlFunction(): Promise<{ success: boolean; message: string }> {
  try {
    const sql = `
      -- Create a function that can execute SQL (ADMIN ONLY!)
      CREATE OR REPLACE FUNCTION exec_sql(sql text)
      RETURNS void AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
      
      -- Set permissions - restrict to admin roles only
      REVOKE ALL ON FUNCTION exec_sql FROM public;
      GRANT EXECUTE ON FUNCTION exec_sql TO service_role;
      
      -- Create a helper table for REST API based SQL execution
      CREATE TABLE IF NOT EXISTS _exec_sql (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        query TEXT NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Create a trigger to execute the SQL and remove the record
      CREATE OR REPLACE FUNCTION exec_sql_trigger() RETURNS TRIGGER AS $$
      BEGIN
        EXECUTE NEW.query;
        DELETE FROM _exec_sql WHERE id = NEW.id;
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
      
      -- Add the trigger
      DROP TRIGGER IF EXISTS exec_sql_trigger ON _exec_sql;
      CREATE TRIGGER exec_sql_trigger
        AFTER INSERT ON _exec_sql
        FOR EACH ROW
        EXECUTE FUNCTION exec_sql_trigger();
        
      -- Set permissions for the table
      REVOKE ALL ON TABLE _exec_sql FROM public;
      GRANT INSERT ON TABLE _exec_sql TO service_role;
    `;
    
    // Use the REST API as this needs to be the first execution
    // before our helper functions exist
    const { error } = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`
      },
      body: JSON.stringify({ query: sql })
    }).then(res => res.json());
    
    if (error) {
      throw new Error(`Error creating exec_sql function: ${error.message}`);
    }
    
    return { success: true, message: 'SQL execution function created successfully' };
  } catch (error: any) {
    console.error('Error creating SQL execution function:', error);
    return { 
      success: false, 
      message: `Error creating function: ${error.message}` 
    };
  }
}

/**
 * Run migrations for the database
 */
export async function runMigrations() {
  // Check if the database has been initialized
  const { data: existingTables, error } = await supabase
    .from('pg_tables')
    .select('tablename')
    .eq('schemaname', 'public')
    .in('tablename', ['user_settings', 'user_stats', 'subscriptions']);

  if (error) {
    console.error('Error checking for existing tables:', error);
    return false;
  }

  // If tables don't exist, create them
  if (!existingTables || existingTables.length === 0) {
    try {
      // Split the SQL script into separate statements
      const statements = createTables.split(';').filter(statement => statement.trim() !== '');

      // Execute each statement
      for (const statement of statements) {
        const { error } = await supabase.rpc('execute_sql', {
          sql_query: statement + ';'
        });

        if (error) {
          console.error('Error executing migration statement:', error);
          return false;
        }
      }

      console.log('Database migrations completed successfully');
      return true;
    } catch (error) {
      console.error('Error during migrations:', error);
      return false;
    }
  }

  // Add the get_visible_subscription function if needed
  try {
    // Check if the function exists
    const { data: existingFunction, error: functionError } = await supabase
      .from('pg_proc')
      .select('proname')
      .eq('proname', 'get_visible_subscription');
      
    if (functionError) {
      console.error('Error checking for existing function:', functionError);
      return false;
    }
    
    // If function doesn't exist, create it
    if (!existingFunction || existingFunction.length === 0) {
      const createFunction = `
        CREATE OR REPLACE FUNCTION get_visible_subscription(p_user_id UUID)
        RETURNS TABLE (
          id UUID,
          plan_id TEXT,
          game TEXT,
          status TEXT,
          days_remaining INTEGER, -- For 'day' duration, this actually returns hours
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
      `;
      
      const { error } = await supabase.rpc('execute_sql', {
        sql_query: createFunction
      });
      
      if (error) {
        console.error('Error creating get_visible_subscription function:', error);
        return false;
      }
      
      console.log('Created get_visible_subscription function');
    }
    
    return true;
  } catch (error) {
    console.error('Error updating database functions:', error);
    return false;
  }
} 