'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@heroui/button'

export default function DebugSubscriptionPage() {
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState('')
  
  const getCurrentUser = async () => {
    try {
      setLoading(true)
      setOutput('')
      setError('')
      
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) throw userError
      if (!user) throw new Error('No authenticated user found')
      
      setUserId(user.id)
      setOutput(`Current user ID: ${user.id}`)
    } catch (err: any) {
      console.error('Error getting user:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const testSubscriptionCreation = async () => {
    if (!userId) {
      setError('Please get user ID first')
      return
    }
    
    try {
      setLoading(true)
      setOutput('')
      setError('')
      
      setOutput('Testing direct subscription creation...\n')
      
      // Create test subscription directly with INSERT
      const startDate = new Date()
      const renewalDate = new Date()
      renewalDate.setDate(renewalDate.getDate() + 1) // 1-day subscription for testing
      
      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan_id: 'basic',
          game: 'Apex Legends',
          status: 'active',
          price: 0.99,
          subscription_start: startDate.toISOString(),
          renewal_date: renewalDate.toISOString(),
          payment_method: 'credit_card',
          payment_last_four: '1234',
          duration: 'day'
        })
        .select()
        .single()
      
      if (subscriptionError) {
        setOutput(prev => prev + `\nError creating subscription: ${subscriptionError.message}`)
        
        // Check if subscriptions table exists
        setOutput(prev => prev + '\n\nChecking if subscriptions table exists...')
        const { data: tables } = await supabase
          .from('pg_tables')
          .select('tablename')
          .eq('schemaname', 'public')
        
        setOutput(prev => prev + `\nFound tables: ${JSON.stringify(tables)}`)
        
        // Try to check columns
        try {
          const { data: columns, error: columnsError } = await supabase
            .rpc('get_table_columns', { table_name: 'subscriptions' })
          
          if (columnsError) {
            setOutput(prev => prev + `\nError getting columns: ${columnsError.message}`)
          } else {
            setOutput(prev => prev + `\nColumns: ${JSON.stringify(columns)}`)
          }
        } catch (columnErr: any) {
          setOutput(prev => prev + `\nError checking columns: ${columnErr.message}`)
        }
        
        throw subscriptionError
      }
      
      setOutput(prev => prev + `\nSubscription created successfully: ${JSON.stringify(subscription)}`)
      
      // Test the get_active_subscription function
      setOutput(prev => prev + '\n\nTesting get_active_subscription function...')
      
      try {
        const { data: activeSubscription, error: activeError } = await supabase
          .rpc('get_active_subscription', { p_user_id: userId })
        
        if (activeError) {
          setOutput(prev => prev + `\nError getting active subscription: ${activeError.message}`)
        } else {
          setOutput(prev => prev + `\nActive subscription: ${JSON.stringify(activeSubscription)}`)
        }
      } catch (activeErr: any) {
        setOutput(prev => prev + `\nError calling get_active_subscription: ${activeErr.message}`)
      }
      
      setOutput(prev => prev + '\n\nAll tests completed')
    } catch (err: any) {
      console.error('Error testing subscription:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const checkPermissions = async () => {
    if (!userId) {
      setError('Please get user ID first')
      return
    }
    
    try {
      setLoading(true)
      setOutput('')
      setError('')
      
      setOutput('Checking RLS policies for subscriptions table...\n')
      
      // Try to get policies
      try {
        const { data: policies, error: policiesError } = await supabase
          .rpc('get_table_policies', { table_name: 'subscriptions' })
        
        if (policiesError) {
          setOutput(prev => prev + `Error getting policies: ${policiesError.message}\n`)
          
          // Try another approach
          const { data: policyData } = await supabase
            .from('pg_policies')
            .select('*')
            .ilike('tablename', '%subscription%')
          
          setOutput(prev => prev + `Policies found: ${JSON.stringify(policyData)}\n`)
        } else {
          setOutput(prev => prev + `Policies: ${JSON.stringify(policies)}\n`)
        }
      } catch (policyErr: any) {
        setOutput(prev => prev + `Error checking policies: ${policyErr.message}\n`)
      }
      
      // Check auth
      const { data: authData } = await supabase.auth.getSession()
      const hasSession = !!authData.session
      
      setOutput(prev => prev + `User has valid session: ${hasSession}\n`)
      
      // Check if user can select from subscriptions
      try {
        const { data: selectTest, error: selectError } = await supabase
          .from('subscriptions')
          .select('id')
          .limit(1)
        
        if (selectError) {
          setOutput(prev => prev + `Error on SELECT: ${selectError.message}\n`)
        } else {
          setOutput(prev => prev + `SELECT works: Retrieved ${selectTest.length} rows\n`)
        }
      } catch (selectErr: any) {
        setOutput(prev => prev + `Error on SELECT: ${selectErr.message}\n`)
      }
      
      setOutput(prev => prev + 'Permission checks completed')
    } catch (err: any) {
      console.error('Error checking permissions:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Debug Subscription Creation</h1>
      <p className="text-text-secondary">
        This page helps diagnose issues with subscription creation.
      </p>
      
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <Button
            color="primary"
            onClick={getCurrentUser}
            isLoading={loading}
            disabled={loading}
          >
            Get Current User
          </Button>
          
          <Button
            color="secondary"
            onClick={testSubscriptionCreation}
            isLoading={loading}
            disabled={loading || !userId}
          >
            Test Subscription Creation
          </Button>
          
          <Button
            color="warning"
            onClick={checkPermissions}
            isLoading={loading}
            disabled={loading || !userId}
          >
            Check Permissions
          </Button>
        </div>
        
        {userId && (
          <div className="bg-card p-4 rounded-lg">
            <p>Current User ID: <span className="font-mono">{userId}</span></p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-500/20 text-red-500 p-4 rounded-lg">
            Error: {error}
          </div>
        )}
        
        {output && (
          <div className="bg-card p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Output:</h3>
            <pre className="whitespace-pre-wrap font-mono text-sm bg-card-hover p-3 rounded-md overflow-auto max-h-96">
              {output}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
} 