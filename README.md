# Supabase Database Setup

This application uses Supabase as the backend database and authentication provider. Follow these instructions to set up the required database schema.

## Prerequisites

- Supabase account with a new or existing project
- Supabase project URL and anon key (available in the project settings)

## Environment Variables

Make sure your `.env.local` file contains the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Setup Options

You have several options to set up the database schema:

### Option 1: Using the Supabase Dashboard SQL Editor

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Copy the SQL schema from `lib/schema.ts` (the `createTables` variable)
4. Run this SQL in the SQL Editor

### Option 2: Using the Supabase CLI

1. Install the Supabase CLI: `npm install -g supabase`
2. Login: `supabase login`
3. Copy the SQL from `lib/schema.ts` into a file named `setup.sql`
4. Run: `supabase db execute --project-ref YOUR_PROJECT_ID --file ./setup.sql`

### Option 3: Using Admin API (Programmatically)

We've included migration utilities in `lib/migrations.ts` that you can use to set up the database:

1. Create a special admin page (e.g., `/pages/admin/setup-db.tsx`)
2. Add code to call the migration functions:

```tsx
import { useState } from 'react';
import { 
  createExecSqlFunction, 
  initializeDatabase, 
  createIncrementLoginFunction 
} from '@/lib/migrations';

export default function SetupDatabase() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const setupDatabase = async () => {
    setLoading(true);
    setMessage('Setting up database...');
    
    try {
      // First create the exec_sql function
      const { success: execSqlSuccess, message: execSqlMessage } = await createExecSqlFunction();
      setMessage(prevMsg => prevMsg + '\n' + execSqlMessage);
      
      if (execSqlSuccess) {
        // Then initialize the database schema
        const { success, message } = await initializeDatabase();
        setMessage(prevMsg => prevMsg + '\n' + message);
        
        if (success) {
          // Create the increment login function
          const { message: incLoginMsg } = await createIncrementLoginFunction();
          setMessage(prevMsg => prevMsg + '\n' + incLoginMsg);
        }
      }
    } catch (error: any) {
      setMessage(prevMsg => prevMsg + '\n' + 'Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Database Setup</h1>
      <button 
        onClick={setupDatabase}
        disabled={loading}
        className="px-4 py-2 bg-primary text-white rounded"
      >
        {loading ? 'Setting up...' : 'Initialize Database'}
      </button>
      
      {message && (
        <pre className="mt-4 p-4 bg-card border border-subtle-border rounded whitespace-pre-wrap">
          {message}
        </pre>
      )}
    </div>
  );
}
```

## Database Schema

The application creates the following tables:

1. `user_settings` - Stores user preferences like dark mode, timezone, etc.
2. `user_stats` - Tracks user activity like login count and profile visits
3. `site_stats` - Stores aggregate site statistics
4. `visit_history` - Records profile visit history

## Security Considerations

- The migration utilities use a custom SQL execution function which should only be used during setup.
- For production, create proper Row Level Security (RLS) policies to protect your data.
- Consider creating dedicated SQL migrations using the Supabase CLI for production deployments.

## Troubleshooting

If you encounter errors during setup:

1. Check if the tables already exist (the scripts use `CREATE TABLE IF NOT EXISTS`)
2. Ensure your database user has the necessary permissions
3. Look at the Supabase logs in the dashboard for more details on any errors
4. If using the programmatic approach, check browser console for error details