import { useState, useEffect } from 'react';
import { calculateNextReview } from '../lib/spacedRepetition';

export default function StudySession() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    // Fetch cards due for review
    fetch('/api/due-cards')
      .then(res => res.json())
      .then(data => setCards(data));
  }, []);

  const handlePerformance = (performance: number) => {
    const updatedCard = calculateNextReview(cards[currentCardIndex], performance);
    // Update card in database
    fetch(`/api/flashcards/${updatedCard.id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedCard),
      headers: { 'Content-Type': 'application/json' },
    });

    setShowAnswer(false);
    setCurrentCardIndex(prev => (prev + 1) % cards.length);
  };

  if (cards.length === 0) return <div>No cards due for review!</div>;

  return (
    <div>
      <h2>{cards[currentCardIndex].front}</h2>
      {showAnswer && <p>{cards[currentCardIndex].back}</p>}
      {!showAnswer && <button onClick={() => setShowAnswer(true)}>Show Answer</button>}
      {showAnswer && (
        <div>
          <button onClick={() => handlePerformance(1)}>Again</button>
          <button onClick={() => handlePerformance(3)}>Good</button>
          <button onClick={() => handlePerformance(5)}>Easy</button>
        </div>
      )}
    </div>
  );
}
