import { Ollama } from 'ollama';
import { db } from '../../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

const ollama = new Ollama();

export default async function handler(req, res) {
  const { topic, userId } = req.body;

  try {
    const response = await ollama.generate({
      model: "openhermes2.5-mistral:latest",
      prompt: `You are a helpful assistant that generates flashcards. Each flashcard should have a front (question) and back (answer). Generate 5 flashcards about ${topic}. Format the output as JSON with 'front' and 'back' keys for each card.`,
    });

    const flashcardsData = JSON.parse(response.data);

    // Save generated flashcards to Firebase
    const flashcardPromises = flashcardsData.map(card => 
      addDoc(collection(db, 'flashcards'), {
        ...card,
        userId,
        createdAt: new Date(),
        lastReviewed: null,
        interval: 0,
        easeFactor: 2.5,
      })
    );

    await Promise.all(flashcardPromises);

    res.status(200).json({ message: 'Flashcards generated and saved successfully' });
  } catch (error) {
    console.error('Error generating flashcards:', error);
    res.status(500).json({ error: 'Failed to generate flashcards' });
  }
}