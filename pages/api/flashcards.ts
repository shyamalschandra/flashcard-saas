import { db } from '../../lib/firebase'
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  switch (method) {
    case 'GET':
      // Fetch flashcards
      const snapshot = await getDocs(collection(db, 'flashcards'))
      const flashcards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      res.status(200).json(flashcards)
      break
    case 'POST':
      // Create new flashcard
      {
        const { front, back } = req.body
        const docRef = await addDoc(collection(db, 'flashcards'), { front, back })
        res.status(201).json({ id: docRef.id, front, back })
      }
      break
    case 'PUT':
      // Update flashcard
      {
        const { id } = req.query
        if (typeof id !== 'string') {
          res.status(400).json({ error: 'Invalid ID' })
          return
        }
        const { front, back } = req.body
        const flashcardRef = doc(db, 'flashcards', id)
        await updateDoc(flashcardRef, { front, back })
        res.status(200).json({ id, front, back })
      }
      break
    case 'DELETE':
      // Delete flashcard
      {
        const { id } = req.query
        if (typeof id !== 'string') {
          res.status(400).json({ error: 'Invalid ID' })
          return
        }
        const flashcardRef = doc(db, 'flashcards', id)
        await deleteDoc(flashcardRef)
        res.status(204).end()
      }
      break
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}