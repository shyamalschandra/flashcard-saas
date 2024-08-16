'use client'

import React, { useState, useEffect } from 'react'
import { Box, Button, Card, CardContent, Typography, Container, TextField, CircularProgress, IconButton } from '@mui/material'
import { db, auth } from '../../../lib/firebase'
import { collection, addDoc, getDocs, updateDoc, doc, query, orderBy, limit, startAfter } from 'firebase/firestore'
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth'
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore'

// Define the Flashcard type
type Flashcard = {
  id?: string;
  question: string;
  answer: string;
}

export default function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [topic, setTopic] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null)

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('User is signed in:', user)
        fetchExistingFlashcards()
      } else {
        console.log('No user is signed in')
        // Optionally, you can sign in a test user for development purposes
        signInWithEmailAndPassword(auth, 'test@example.com', 'password')
          .then(({ user }) => {
            console.log('Signed in as:', user)
            fetchExistingFlashcards()
          })
          .catch(error => {
            console.error('Error signing in:', error)
          })
      }
    })
  }, [])

  const fetchExistingFlashcards = async (loadMore = false) => {
    try {
      console.log('Fetching flashcards, loadMore:', loadMore)
      const flashcardsCollection = collection(db, 'flashcards')
      let flashcardsQuery = query(flashcardsCollection, orderBy('createdAt'), limit(10))

      if (loadMore && lastVisible) {
        console.log('Loading more flashcards after:', lastVisible)
        flashcardsQuery = query(flashcardsCollection, orderBy('createdAt'), startAfter(lastVisible), limit(10))
      }

      const flashcardsSnapshot = await getDocs(flashcardsQuery)
      if (flashcardsSnapshot.empty) {
        console.log('No matching documents.')
        return
      }

      const existingFlashcards = flashcardsSnapshot.docs.map(doc => {
        console.log('Fetched document:', doc.id, doc.data())
        return { id: doc.id, ...doc.data() } as Flashcard
      })
      setLastVisible(flashcardsSnapshot.docs[flashcardsSnapshot.docs.length - 1])

      if (loadMore) {
        setFlashcards(prevFlashcards => [...prevFlashcards, ...existingFlashcards])
      } else {
        setFlashcards(existingFlashcards)
      }
    } catch (error) {
      console.error('Error fetching flashcards:', error)
      setError('Failed to fetch flashcards')
    }
  }

  const generateFlashcards = async () => {
    setGenerating(true)
    setError(null)

    try {
      const prompt = `Generate five flashcards about "${topic}". 
      Provide the response in the following JSON format:
      [
        {
          "question": "The question for the flashcard",
          "answer": "The answer to the question"
        },
        // ... more flashcards
      ]
      Ensure each question is concise and each answer is brief but informative. Do not include any text outside of the JSON array.`

      console.log('Sending prompt to API:', prompt)

      const response = await fetch('/api/ollama', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      console.log('API response status:', response.status)

      if (!response.ok) {
        const errorData = await response.text() // Change to text to handle non-JSON error responses
        throw new Error(`API responded with status ${response.status}: ${errorData || 'Unknown error'}`)
      }

      const data = await response.json()
      console.log('API response data:', data)

      let newCards = data.response
      console.log('Parsed cards:', newCards)

      if (!Array.isArray(newCards)) {
        throw new Error('Invalid response format: expected an array of flashcards')
      }

      newCards.forEach(card => {
        if (!card.question || !card.answer) {
          throw new Error('Invalid flashcard format: missing question or answer')
        }
      })

      setFlashcards(prevFlashcards => [...prevFlashcards, ...newCards])
      setTopic('')
    } catch (error) {
      console.error('Error generating flashcards:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
    } finally {
      setGenerating(false)
    }
  }

  const handleNextCard = () => {
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length)
    setShowAnswer(false)
  }

  const handleShowAnswer = () => {
    setShowAnswer(true)
  }

  const saveFlashcards = async () => {
    setSaving(true)
    try {
      const flashcardsCollection = collection(db, 'flashcards')
      for (const card of flashcards) {
        if (!card.id) {
          await addDoc(flashcardsCollection, card)
        }
      }
      alert('Flashcards saved successfully!')
    } catch (error) {
      console.error('Error saving flashcards:', error)
      setError('Failed to save flashcards')
    } finally {
      setSaving(false)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value)
  }

  const filteredFlashcards = flashcards.filter(card =>
    card.question.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    card.answer.toLowerCase().includes(searchKeyword.toLowerCase())
  )

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Flashcards
        </Typography>
        
        {/* Section to display existing flashcards */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Existing Flashcards
          </Typography>
          <TextField
            fullWidth
            label="Search flashcards"
            value={searchKeyword}
            onChange={handleSearch}
            sx={{ mb: 2 }}
          />
          {filteredFlashcards.length > 0 ? (
            filteredFlashcards.map((card, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" component="div">
                    Q: {card.question}
                  </Typography>
                  <Typography variant="body1" component="div">
                    A: {card.answer}
                  </Typography>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography>No existing flashcards found.</Typography>
          )}
          <Button variant="contained" onClick={() => fetchExistingFlashcards(true)}>
            Load More
          </Button>
        </Box>

        {/* Flashcard generation form */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Generate New Flashcards
          </Typography>
          <TextField
            fullWidth
            label="Enter a topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={generateFlashcards}
            disabled={generating || !topic}
          >
            {generating ? <CircularProgress size={24} /> : 'Generate Flashcards'}
          </Button>
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {flashcards.length > 0 && (
          <>
            <Card sx={{ minHeight: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CardContent>
                <Typography variant="h5" component="div" align="center">
                  {showAnswer ? flashcards[currentCardIndex].answer : flashcards[currentCardIndex].question}
                </Typography>
              </CardContent>
            </Card>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Button variant="contained" onClick={handleShowAnswer} disabled={showAnswer}>
                Show Answer
              </Button>
              <Button variant="contained" onClick={handleNextCard}>
                Next Card
              </Button>
            </Box>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={saveFlashcards}
                disabled={saving || flashcards.length === 0}
              >
                {saving ? <CircularProgress size={24} /> : 'Save Flashcards'}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Container>
  )
}