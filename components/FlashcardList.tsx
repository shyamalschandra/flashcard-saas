import { useState, useEffect } from 'react'

export default function FlashcardList() {
  const [flashcards, setFlashcards] = useState([])

  useEffect(() => {
    fetch('/api/flashcards')
      .then(res => res.json())
      .then(data => setFlashcards(data))
  }, [])

  return (
    <div>
      {flashcards.map(card => (
        <div key={card.id}>
          <h3>{card.front}</h3>
          <p>{card.back}</p>
        </div>
      ))}
    </div>
  )
}
