interface Flashcard {
  id: string;
  front: string;
  back: string;
  lastReviewed: Date;
  interval: number;
  easeFactor: number;
}

export function calculateNextReview(card: Flashcard, performance: number): Flashcard {
  const newCard = { ...card };
  if (performance >= 3) {
    newCard.interval = Math.round(card.interval * card.easeFactor);
    newCard.easeFactor = Math.max(1.3, card.easeFactor + (0.1 - (5 - performance) * (0.08 + (5 - performance) * 0.02)));
  } else {
    newCard.interval = 1;
    newCard.easeFactor = Math.max(1.3, card.easeFactor - 0.2);
  }
  newCard.lastReviewed = new Date();
  return newCard;
}
