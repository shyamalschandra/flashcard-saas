import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '@clerk/nextjs';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function usageLimits(req: NextApiRequest, res: NextApiResponse, next: () => void) {
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

  if (userData.subscriptionStatus !== 'active') {
    const cardCount = await getCardCount(userId);
    if (cardCount >= 100) {
      return res.status(403).json({ error: 'Free plan limit reached. Please upgrade to create more flashcards.' });
    }
  }

  next();
}

async function getCardCount(userId: string): Promise<number> {
  // Implement this function to count the user's flashcards
  // You might want to use a counter in the user document for efficiency
  return 0;
}
