'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getUserStats, getUserVisibleSubscription, isSubscriptionExpiringSoon } from '@/lib/db';
import { UserStats, SubscriptionDuration } from '@/lib/schema';
import Link from 'next/link';
import { Button } from '@heroui/button';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [activeSubscription, setActiveSubscription] = useState<any>(null);
  const [subscriptionExpiring, setSubscriptionExpiring] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          return;
        }
        
        setUser(session.user);
        
        // Fetch user stats
        const usrStats = await getUserStats(session.user.id);
        if (usrStats) {
          setUserStats(usrStats);
        }
        
        // Fetch subscription data (including cancelled but not expired)
        const subscription = await getUserVisibleSubscription(session.user.id);
        if (subscription) {
          setActiveSubscription(subscription);
          
          // Check if subscription is expiring soon
          const expiringSoon = await isSubscriptionExpiringSoon(session.user.id);
          setSubscriptionExpiring(expiringSoon);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Get the duration text for display
  const getDurationText = (duration: SubscriptionDuration | undefined): string => {
    if (!duration) return 'Month';
    
    switch (duration) {
      case 'day': return 'Day';
      case 'week': return 'Week';
      case 'month': return 'Month';
      default: return 'Period';
    }
  };
  
  // Calculate days remaining for subscription
  const getDaysRemaining = (renewalDate: string | undefined): number => {
    if (!renewalDate) return 0
    
    const renewal = new Date(renewalDate)
    const now = new Date()
    
    // Return difference in days, rounded down
    const diffTime = renewal.getTime() - now.getTime()
    return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)))
  }
  
  // Calculate hours remaining for subscription (for day subscriptions)
  const getHoursRemaining = (renewalDate: string | undefined): number => {
    if (!renewalDate) return 0
    
    const renewal = new Date(renewalDate)
    const now = new Date()
    
    // Return difference in hours, rounded down
    const diffTime = renewal.getTime() - now.getTime()
    return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60)))
  }
  
  // Get time remaining display based on duration
  const getTimeRemainingDisplay = (
    renewalDate: string | undefined, 
    duration: SubscriptionDuration | undefined
  ): string => {
    if (!renewalDate) return '0 days';
    
    if (duration === 'day') {
      const hours = getHoursRemaining(renewalDate);
      return hours <= 1 ? `${hours} hour` : `${hours} hours`;
    } else if (duration === 'week') {
      const days = getDaysRemaining(renewalDate);
      return days <= 1 ? `${days} day` : `${days} days`;
    } else {
      const days = getDaysRemaining(renewalDate);
      return days <= 1 ? `${days} day` : `${days} days`;
    }
  };
  
  // Calculate percentage of subscription time remaining
  const getTimeRemainingPercentage = (
    startDate: string | undefined, 
    renewalDate: string | undefined, 
    duration: SubscriptionDuration | undefined
  ): number => {
    if (!startDate || !renewalDate) return 0
    
    const start = new Date(startDate)
    const renewal = new Date(renewalDate)
    const now = new Date()
    
    const totalDuration = renewal.getTime() - start.getTime()
    const elapsed = now.getTime() - start.getTime()
    
    // Calculate percentage remaining
    return Math.max(0, Math.min(100, ((totalDuration - elapsed) / totalDuration) * 100))
  }
  
  // Get color based on subscription plan
  const getPlanColor = (plan: string | undefined): string => {
    if (!plan) return 'blue';
    
    switch(plan) {
      case 'pro': return 'purple';
      case 'enterprise': return 'green';
      default: return 'blue';
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }
  
  // Get the subscription duration
  const subscriptionDuration = activeSubscription?.duration || user?.user_metadata?.subscription_duration;
  
  return (
    <div className="h-full w-full p-6">
      <div className="flex flex-col md:flex-row items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">{user?.email}</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
            {user?.email ? user.email[0].toUpperCase() : 'U'}
          </div>
          <span className="ml-2 text-sm text-gray-400">v</span>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-md bg-zinc-900 border border-zinc-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-600">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path>
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-400">Logins</p>
              <p className="text-xl font-bold">{userStats?.total_logins || 1}</p>
            </div>
          </div>
        </div>

        <div className="rounded-md bg-zinc-900 border border-zinc-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-amber-600">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-400">Active</p>
              <p className="text-xl font-bold">Yes</p>
            </div>
          </div>
        </div>

        <div className="rounded-md bg-zinc-900 border border-zinc-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-600">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-400">Visits</p>
              <p className="text-xl font-bold">{userStats?.profile_visits || 0}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Game Subscription Card */}
      {(user?.user_metadata?.subscription_plan || activeSubscription) && (
        <div className="rounded-md bg-zinc-900 border border-zinc-800 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Game Subscription</h2>
            {subscriptionExpiring && (
              <div className="px-3 py-1 bg-amber-600/20 text-amber-500 text-xs rounded-full">
                Expiring Soon
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Current Plan</p>
              <p className={`text-xl font-bold text-${getPlanColor(activeSubscription?.plan_id || user?.user_metadata?.subscription_plan)}-500`}>
                {(activeSubscription?.plan_id || user?.user_metadata?.subscription_plan) === 'basic' ? 'Basic Gaming Access' : 
                 (activeSubscription?.plan_id || user?.user_metadata?.subscription_plan) === 'pro' ? 'Pro Gamer' : 
                 (activeSubscription?.plan_id || user?.user_metadata?.subscription_plan) === 'enterprise' ? 'Ultimate Gaming' : 
                 'Free Plan'}
              </p>
              <p className="text-sm">Game: <span className="font-medium">{activeSubscription?.game || user?.user_metadata?.subscription_game || 'None'}</span></p>
              <p className="text-sm">Duration: <span className="font-medium">{getDurationText(subscriptionDuration as SubscriptionDuration)}</span></p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Subscription Status</p>
              <div className="flex items-center gap-2">
                <span className={`inline-block h-2 w-2 rounded-full ${
                  (activeSubscription?.status || user?.user_metadata?.subscription_status) === 'active' ? 'bg-green-500' : 
                  (activeSubscription?.status || user?.user_metadata?.subscription_status) === 'cancelled' ? 'bg-yellow-500' : 
                  'bg-red-500'
                }`}></span>
                <p className="font-medium">{
                  (activeSubscription?.status || user?.user_metadata?.subscription_status) === 'active' ? 'Active' : 
                  (activeSubscription?.status || user?.user_metadata?.subscription_status) === 'cancelled' ? 'Cancelled - Access Until Expiry' : 
                  'Inactive'
                }</p>
              </div>
              <div className="text-sm text-gray-400">
                {(activeSubscription?.status || user?.user_metadata?.subscription_status) === 'cancelled' ? 'Access until:' : 'Renews on:'} <span className="text-white">{activeSubscription?.renewal_date ? 
                  new Date(activeSubscription.renewal_date).toLocaleDateString() : 
                  user?.user_metadata?.subscription_renewal_date ? 
                  new Date(user.user_metadata.subscription_renewal_date).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Time Remaining</p>
              {(activeSubscription?.renewal_date || user?.user_metadata?.subscription_renewal_date) ? (
                <>
                  <p className="text-xl font-bold">
                    {getTimeRemainingDisplay(
                      activeSubscription?.renewal_date || user?.user_metadata?.subscription_renewal_date,
                      subscriptionDuration as SubscriptionDuration
                    )}
                  </p>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mt-2">
                    <div 
                      className={`h-full ${
                        (activeSubscription?.status || user?.user_metadata?.subscription_status) === 'cancelled' ? 
                        'bg-yellow-600' : 
                        `bg-${getPlanColor(activeSubscription?.plan_id || user?.user_metadata?.subscription_plan)}-600`
                      }`}
                      style={{ 
                        width: activeSubscription ? 
                          `${(activeSubscription.days_remaining / (subscriptionDuration === 'day' ? 1 : subscriptionDuration === 'week' ? 7 : 30)) * 100}%` : 
                          `${getTimeRemainingPercentage(
                            user?.user_metadata?.subscription_start_date, 
                            user?.user_metadata?.subscription_renewal_date,
                            subscriptionDuration as SubscriptionDuration
                          )}%` 
                      }}
                    ></div>
                  </div>
                </>
              ) : (
                <p className="text-gray-400">No active subscription</p>
              )}
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-end">
            <Link href="/dashboard/subscriptions">
              <Button color="primary" variant="flat" className="text-sm">
                Manage Subscription
              </Button>
            </Link>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="rounded-md bg-zinc-900 border border-zinc-800 p-6">
        <h2 className="text-lg font-medium mb-4">Account Overview</h2>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-zinc-800">
            <div>
              <h3 className="text-sm font-medium">Email</h3>
              <p className="text-sm text-gray-400">{user?.email}</p>
            </div>
            <Link href="/dashboard/security?section=email" className="mt-2 md:mt-0 text-xs text-blue-400 hover:text-blue-300">
              Change
            </Link>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-zinc-800">
            <div>
              <h3 className="text-sm font-medium">Password</h3>
              <p className="text-sm text-gray-400">Last changed: Never</p>
            </div>
            <Link href="/dashboard/security?section=password" className="mt-2 md:mt-0 text-xs text-blue-400 hover:text-blue-300">
              Change
            </Link>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-sm font-medium">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-400">{user?.user_metadata?.two_factor_enabled ? 'Enabled' : 'Not enabled'}</p>
            </div>
            <Link href="/dashboard/security?section=two-factor" className="mt-2 md:mt-0 text-xs text-blue-400 hover:text-blue-300">
              {user?.user_metadata?.two_factor_enabled ? 'Manage' : 'Enable'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 