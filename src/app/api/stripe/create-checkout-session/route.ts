import { NextRequest, NextResponse } from 'next/server';
import { getStripe, getPriceId, APP_NAME, APP_URL } from '@/lib/stripe';
import { verifyAuthToken } from '@/lib/authSharedClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan } = body;

    if (!plan || !['plus', 'pro'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Get auth token from header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Please sign in to subscribe' }, { status: 401 });
    }

    // Verify token using shared auth
    const { user, error: authError } = await verifyAuthToken(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const priceId = getPriceId(plan as 'plus' | 'pro');
    if (!priceId) {
      return NextResponse.json({ error: 'Price not configured for this plan' }, { status: 400 });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: user.email,
      success_url: `${APP_URL}/account?success=true`,
      cancel_url: `${APP_URL}/pricing?canceled=true`,
      metadata: {
        app_name: APP_NAME,
        user_id: user.id,
        plan: plan,
      },
      subscription_data: {
        metadata: {
          app_name: APP_NAME,
          user_id: user.id,
          plan: plan,
        },
      },
    });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error('Checkout session error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
