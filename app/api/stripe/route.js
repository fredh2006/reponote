import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import stripe from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('No signature found in headers');
      return NextResponse.json({ error: 'No signature found' }, { status: 400 });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_SIGNING_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle subscription cancellation
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('stripe_customer_id', customerId)
        .single();

      if (userError) {
        console.error('Error finding user:', userError);
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
            plan: "free",
            subscription_status: 'canceled',
            subscription_type: 'NULL'
         })
        .eq('id', userData.id);

      if (updateError) {
        console.error('Error updating user plan:', updateError);
        return NextResponse.json({ error: 'Failed to update user plan' }, { status: 500 });
      }
    }

    // Handle checkout completion
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      if (session.payment_status === 'paid') {
        const userId = session.metadata?.userId;
        const paymentType = session.metadata?.paymentType;
        
        if (!userId) {
          console.error('No userId found in session metadata');
          return NextResponse.json({ error: 'No userId found' }, { status: 400 });
        }

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (userError) {
          console.error('Error finding user:', userError);
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // If upgrading to lifetime and user has an active subscription, cancel it
        if (paymentType === 'lifetime' && userData.subscription_status === 'active') {
          try {
            const subscriptions = await stripe.subscriptions.list({
              customer: userData.stripe_customer_id,
              status: 'active',
              limit: 1
            });

            if (subscriptions.data.length > 0) {
              await stripe.subscriptions.cancel(subscriptions.data[0].id);
            }
          } catch (error) {
            console.error('Error cancelling subscription:', error);
          }
        }

        // Update plan, customer id, and subscription status based on payment type
        const { data: updateData, error: updateError } = await supabase
          .from('users')
          .update({ 
            plan: paymentType === 'subscription' ? 'pro' : 'lifetime',
            stripe_customer_id: session.customer,
            subscription_status: paymentType === 'subscription' ? 'active' : 'lifetime',
            subscription_type: paymentType === 'subscription' ? 'subscription' : 'lifetime',
          })
          .eq('id', userId)
          .select();

        if (updateError) {
          console.error('Error updating user:', updateError);
          return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
        }

      }
    }

    revalidatePath('/', 'layout');
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Unexpected error in webhook handler:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}