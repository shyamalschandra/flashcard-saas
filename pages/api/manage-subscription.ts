import { auth } from '@clerk/nextjs';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Stripe from 'stripe';
import type { NextApiRequest, NextApiResponse } from 'next';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = auth();
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return res.status(404).json({ error: 'User not found' });
  }

  const userData = userSnap.data();

  if (req.method === 'POST') {
    // Upgrade subscription
    const session = await stripe.checkout.sessions.create({
      customer: userData.stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${req.headers.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/dashboard`,
    });

    return res.status(200).json({ sessionId: session.id });
  } else if (req.method === 'DELETE') {
    // Cancel subscription
    const subscription = await stripe.subscriptions.cancel(userData.stripeSubscriptionId);

    await setDoc(userRef, { 
      stripeSubscriptionId: null,
      subscriptionStatus: 'canceled'
    }, { merge: true });

    return res.status(200).json({ message: 'Subscription canceled successfully' });
  }

  res.setHeader('Allow', ['POST', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}