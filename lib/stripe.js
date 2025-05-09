import Stripe from 'stripe';

// This file should only be imported on the server side
if (typeof window !== 'undefined') {
  throw new Error('This module should only be used on the server side');
}

const key = process.env.STRIPE_SECRET_KEY?.trim();

if (!key) {
  throw new Error('Missing STRIPE_SECRET_KEY in environment variables');
}

const stripe = new Stripe(key, {
  apiVersion: '2025-04-30.basil',
});

export default stripe;
