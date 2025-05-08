import { supabase } from './supabase';
import { TABLES, UserSettings, UserStats, SiteStats, VisitHistory } from './schema';

// User Settings
export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from(TABLES.USER_SETTINGS)
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error || !data) {
    console.error('Error fetching user settings:', error);
    return null;
  }
  
  return data as UserSettings;
}

export async function saveUserSettings(settings: Partial<UserSettings>): Promise<boolean> {
  const { error } = await supabase
    .from(TABLES.USER_SETTINGS)
    .upsert({
      ...settings,
      last_updated: new Date().toISOString()
    });
  
  if (error) {
    console.error('Error saving user settings:', error);
    return false;
  }
  
  return true;
}

// User Stats
export async function getUserStats(userId: string): Promise<UserStats | null> {
  const { data, error } = await supabase
    .from(TABLES.USER_STATS)
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error || !data) {
    console.error('Error fetching user stats:', error);
    return null;
  }
  
  return data as UserStats;
}

export async function createOrUpdateUserStats(userId: string, stats?: Partial<UserStats>): Promise<boolean> {
  const { error } = await supabase
    .from(TABLES.USER_STATS)
    .upsert({
      user_id: userId,
      last_login: new Date().toISOString(),
      ...stats
    });
  
  if (error) {
    console.error('Error updating user stats:', error);
    return false;
  }
  
  return true;
}

export async function incrementLoginCount(userId: string): Promise<boolean> {
  // First try to increment existing record
  const { data, error } = await supabase.rpc('increment_user_login', {
    user_id_param: userId
  });
  
  // If RPC function doesn't exist or fails, fall back to select and update pattern
  if (error) {
    const { data: userData } = await supabase
      .from(TABLES.USER_STATS)
      .select('total_logins')
      .eq('user_id', userId)
      .single();
    
    const totalLogins = userData?.total_logins || 0;
    
    return createOrUpdateUserStats(userId, {
      total_logins: totalLogins + 1,
      last_login: new Date().toISOString()
    });
  }
  
  return true;
}

export async function incrementProfileVisit(userId: string): Promise<boolean> {
  // First get current count
  const { data: userData } = await supabase
    .from(TABLES.USER_STATS)
    .select('profile_visits')
    .eq('user_id', userId)
    .single();
  
  const profileVisits = userData?.profile_visits || 0;
  
  const { error } = await supabase
    .from(TABLES.USER_STATS)
    .upsert({
      user_id: userId,
      profile_visits: profileVisits + 1
    });
  
  if (error) {
    console.error('Error incrementing profile visits:', error);
    return false;
  }
  
  return true;
}

// Visit History
export async function recordVisit(userId: string, visitorId?: string, visitorName?: string): Promise<boolean> {
  const { error } = await supabase
    .from(TABLES.VISIT_HISTORY)
    .insert({
      user_id: userId,
      visitor_id: visitorId || null,
      visitor_name: visitorName || null,
      visited_at: new Date().toISOString()
    });
  
  if (error) {
    console.error('Error recording visit:', error);
    return false;
  }
  
  return true;
}

export async function getRecentVisitors(userId: string, limit = 5): Promise<VisitHistory[]> {
  const { data, error } = await supabase
    .from(TABLES.VISIT_HISTORY)
    .select('*')
    .eq('user_id', userId)
    .order('visited_at', { ascending: false })
    .limit(limit);
  
  if (error || !data) {
    console.error('Error fetching visit history:', error);
    return [];
  }
  
  return data as VisitHistory[];
}

export async function getVisitHistory(userId: string, days = 14): Promise<{ date: string, visits: number }[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data, error } = await supabase
    .from(TABLES.VISIT_HISTORY)
    .select('visited_at')
    .eq('user_id', userId)
    .gte('visited_at', startDate.toISOString());
  
  if (error || !data) {
    console.error('Error fetching visit history:', error);
    return [];
  }
  
  // Group by day
  const visitsByDay = data.reduce((acc: Record<string, number>, visit) => {
    const day = visit.visited_at.split('T')[0]; // YYYY-MM-DD
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});
  
  // Fill in missing days with zero visits
  const result = [];
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    result.unshift({
      date: dateStr,
      visits: visitsByDay[dateStr] || 0
    });
  }
  
  return result;
}

// Site Stats
export async function getSiteStats(): Promise<SiteStats | null> {
  const { data, error } = await supabase
    .from(TABLES.SITE_STATS)
    .select('*')
    .order('last_updated', { ascending: false })
    .limit(1)
    .single();
  
  if (error || !data) {
    console.error('Error fetching site stats:', error);
    return null;
  }
  
  return data as SiteStats;
}

// Initialize user in database on first login
export async function initializeUser(userId: string): Promise<boolean> {
  try {
    // Create user settings with defaults
    await saveUserSettings({
      user_id: userId,
      dark_mode: true,
      email_updates: true,
      timezone: 'UTC',
      language: 'en'
    });
    
    // Create user stats entry
    await createOrUpdateUserStats(userId, {
      total_logins: 1,
      profile_visits: 0,
      account_created: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error('Error initializing user in database:', error);
    return false;
  }
}

// Subscription related functions

/**
 * Creates a new subscription for a user
 */
export async function createSubscription(
  userId: string,
  planId: string,
  game: string,
  price: number,
  paymentLastFour?: string,
  duration: 'day' | 'week' | 'month' = 'month'
) {
  try {
    const startDate = new Date();
    const renewalDate = new Date();
    
    // Calculate renewal date based on duration
    switch (duration) {
      case 'day':
        renewalDate.setDate(renewalDate.getDate() + 1); // 1 day from now
        break;
      case 'week':
        renewalDate.setDate(renewalDate.getDate() + 7); // 7 days from now
        break;
      case 'month':
      default:
        renewalDate.setDate(renewalDate.getDate() + 30); // 30 days from now
        break;
    }
    
    const { data, error } = await supabase.from('subscriptions').insert({
      user_id: userId,
      plan_id: planId,
      game,
      status: 'active',
      price,
      subscription_start: startDate.toISOString(),
      renewal_date: renewalDate.toISOString(),
      payment_method: 'credit_card',
      payment_last_four: paymentLastFour || '1234', // Fallback for demo
      duration
    }).select().single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error creating subscription:', error);
    return null;
  }
}

/**
 * Gets the current active subscription for a user
 */
export async function getUserActiveSubscription(userId: string) {
  try {
    const { data, error } = await supabase
      .rpc('get_active_subscription', { p_user_id: userId });
    
    if (error) throw error;
    
    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error getting active subscription:', error);
    return null;
  }
}

/**
 * Gets the current visible subscription for a user (active or canceled but not expired)
 */
export async function getUserVisibleSubscription(userId: string) {
  try {
    const { data, error } = await supabase
      .rpc('get_visible_subscription', { p_user_id: userId });
    
    if (error) throw error;
    
    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error getting visible subscription:', error);
    return null;
  }
}

/**
 * Updates a user's subscription status
 */
export async function updateSubscriptionStatus(subscriptionId: string, status: string) {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ status })
      .eq('id', subscriptionId)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error updating subscription status:', error);
    return null;
  }
}

/**
 * Cancels a user's subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        subscription_end: new Date().toISOString()
      })
      .eq('id', subscriptionId)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return null;
  }
}

/**
 * Gets all subscriptions for a user
 */
export async function getUserSubscriptionHistory(userId: string) {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error getting user subscription history:', error);
    return [];
  }
}

/**
 * Checks if a user's subscription is expiring soon (within 7 days)
 */
export async function isSubscriptionExpiringSoon(userId: string) {
  try {
    const { data, error } = await supabase
      .rpc('is_subscription_expiring_soon', { p_user_id: userId });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error checking if subscription is expiring soon:', error);
    return false;
  }
} 