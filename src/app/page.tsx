'use client'

import React from 'react'
import Link from 'next/link'
import { Box, Typography, Button, Container } from '@mui/material'

export default function HomePage() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Flashcard-SaaS
        </Typography>
        <Typography variant="h5" component="p" gutterBottom>
          Start learning with our efficient flashcard system.
        </Typography>
        <Button
          component={Link}
          href="/flashcards"
          variant="contained"
          color="primary"
          size="large"
        >
          Go to Flashcards
        </Button>
      </Box>
    </Container>
  )
}