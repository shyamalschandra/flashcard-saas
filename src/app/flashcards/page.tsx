'use client'

import React, { useState, useEffect } from 'react'
import { Box, Button, Card, CardContent, Typography, Container, TextField, CircularProgress } from '@mui/material'

// Define the Flashcard type
type Flashcard = {
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
      Ensure each question is concise and each answer is brief but informative. Do not include any text outside of the JSON array.`;

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
        const errorData = await response.json()
        throw new Error(`API responded with status ${response.status}: ${errorData.error || 'Unknown error'}`)
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
      setError(error.message)
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

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Flashcards
        </Typography>
        
        {/* Flashcard generation form */}
        <Box sx={{ mb: 4 }}>
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
          </>
        )}
      </Box>
    </Container>
  )
}