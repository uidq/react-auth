import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
    
    // Check if user has a pending subscription
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user?.user_metadata?.subscription_status === 'pending' && user?.user_metadata?.subscription_plan) {
      // Redirect to subscriptions page to complete payment
      return NextResponse.redirect(new URL('/dashboard/subscriptions', req.url));
    }
  }

  return NextResponse.redirect(new URL('/dashboard', req.url));
} 