import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/authSharedClient';
import { getServerSupabaseClient } from '@/lib/supabaseAppClient';

export async function GET(request: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({
        subscribed: false,
        plan: 'free',
        status: null
      });
    }

    // Verify token using shared auth
    const { user, error: authError } = await verifyAuthToken(token);
    if (authError || !user) {
      return NextResponse.json({
        subscribed: false,
        plan: 'free',
        status: null
      });
    }

    const supabase = getServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({
        subscribed: false,
        plan: 'free',
        status: null,
        error: 'Database not configured'
      });
    }

    // Get subscription
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !subscription) {
      return NextResponse.json({
        subscribed: false,
        plan: 'free',
        status: null
      });
    }

    const isActive = subscription.status === 'active';

    return NextResponse.json({
      subscribed: isActive,
      plan: isActive ? subscription.plan : 'free',
      status: subscription.status,
      current_period_end: subscription.current_period_end,
      stripe_customer_id: subscription.stripe_customer_id
    });

  } catch (error) {
    console.error('Subscription fetch error:', error);
    return NextResponse.json({
      subscribed: false,
      plan: 'free',
      status: null,
      error: 'Failed to fetch subscription'
    });
  }
}
