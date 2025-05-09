'use server';

import stripe from "@/lib/stripe";

export const subscribeAction = async ({userId, paymentType = 'subscription'}) => {
    const lineItems = paymentType === 'subscription' 
        ? [{
            price: process.env.STRIPE_PRO_PRICE_ID,
            quantity: 1,
        }]
        : [{
            price: process.env.STRIPE_LIFETIME_PRICE_ID,
            quantity: 1,
        }];

    const {url} = await stripe.checkout.sessions.create({ 
        payment_method_types: ['card'],
        line_items: lineItems,
        metadata: {
            userId: userId,
            paymentType: paymentType,
        },
        mode: paymentType === 'subscription' ? 'subscription' : 'payment',
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}`,
    });

    return url;
}

