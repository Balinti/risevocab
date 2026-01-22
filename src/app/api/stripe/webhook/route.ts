import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe, APP_NAME } from '@/lib/stripe';
import { getServerSupabaseClient } from '@/lib/supabaseAppClient';

export async function POST(request: NextRequest) {
  const stripe = getStripe();

  // Read raw body for signature verification
  const body = await request.text();

  let event: Stripe.Event;

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get('stripe-signature');

  try {
    if (webhookSecret && signature && stripe) {
      // Verify signature if secret exists
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // Parse without verification (development mode)
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = getServerSupabaseClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Check if this is for our app
        if (session.metadata?.app_name !== APP_NAME) {
          console.log('Ignoring webhook for different app:', session.metadata?.app_name);
          return NextResponse.json({ received: true });
        }

        const userId = session.metadata?.user_id;
        const plan = session.metadata?.plan;

        if (userId && supabase) {
          await supabase
            .from('subscriptions')
            .upsert({
              user_id: userId,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              status: 'active',
              plan: plan || 'plus',
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id'
            });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        // Check if this is for our app
        if (subscription.metadata?.app_name !== APP_NAME) {
          return NextResponse.json({ received: true });
        }

        const userId = subscription.metadata?.user_id;

        if (userId && supabase) {
          // Get current period end from items
          const periodEnd = subscription.items?.data[0]?.current_period_end;
          await supabase
            .from('subscriptions')
            .update({
              status: subscription.status,
              current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        // Check if this is for our app
        if (subscription.metadata?.app_name !== APP_NAME) {
          return NextResponse.json({ received: true });
        }

        const userId = subscription.metadata?.user_id;

        if (userId && supabase) {
          await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
        }
        break;
      }

      default:
        // Unhandled event type
        console.log('Unhandled webhook event:', event.type);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    // Return 200 to acknowledge receipt even on error
    return NextResponse.json({ received: true, error: 'Processing error' });
  }
}

