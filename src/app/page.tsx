'use client'

import React from 'react'
import Link from 'next/link'
import { Box, Typography, Button, Container } from '@mui/material'
import useSWR from 'swr'; // Import useSWR directly

const fetcher = (url: string) => fetch(url).then(res => res.json());

function DataComponent() {
  const { data, error } = useSWR('/api/data', fetcher);

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;

  return <div>Data: {data.message}</div>;
}

export default function HomePage() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
          sx={{ mb: 2 }}
          className="bg-blue-500 hover:bg-blue-400 text-white text-sm normal-case"
        >
          Go to Flashcards
        </Button>
        <Button
          component={Link}
          href="/sign-in"
          variant="contained"
          color="primary"
          size="large"
          sx={{ mb: 2 }}
          className="bg-blue-500 hover:bg-blue-400 text-white text-sm normal-case"
        >
          Sign In
        </Button>
        <Button
          component={Link}
          href="/sign-up"
          variant="contained"
          color="primary"
          size="large"
          sx={{ mb: 2 }}
          className="bg-blue-500 hover:bg-blue-400 text-white text-sm normal-case"
        >
          Sign Up
        </Button>
        <Button
          component={Link}
          href="/auth"
          variant="contained"
          color="primary"
          size="large"
          className="bg-blue-500 hover:bg-blue-400 text-white text-sm normal-case"
        >
          Auth for Purchases
        </Button>
        <DataComponent />
      </Box>
    </Container>
  )
}