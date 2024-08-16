'use client'

import { useState } from 'react'
import axios from 'axios'
import { Button, TextField, Typography, Container, Box } from '@mui/material'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await axios.post(
        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCdxv5xRhXrknhwzENlom5mTN1NkO7jLS0',
        {
          email,
          password,
          returnSecureToken: true
        }
      )
      alert('Signed in successfully!')
      console.log(response.data) // Handle the response data as needed
    } catch (error: any) { // Specify the type of error
      setError(error.response?.data?.error?.message || error.message) // Handle error response
    }
  }

  return (
    <Container maxWidth="sm" className="mt-8">
      <Typography variant="h4" component="h1" className="mb-4 text-center">
        Sign In
      </Typography>
      <Box component="form" onSubmit={handleSignIn} className="space-y-4">
        <TextField
          fullWidth
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          variant="outlined"
        />
        <TextField
          fullWidth
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          variant="outlined"
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Sign In
        </Button>
      </Box>
      {error && <Typography color="error" className="mt-4">{error}</Typography>}
      <Box className="mt-8">
        <Typography variant="h5" component="h2" className="mb-4">
          Subscribe to Flashcards
        </Typography>
        <Box className="space-x-4">
          <Button
            href="https://buy.stripe.com/test_5/month"
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
          >
            $5/month
          </Button>
          <Button
            href="https://buy.stripe.com/test_3/year"
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
          >
            $3.00/month (billed annually)
          </Button>
        </Box>
      </Box>
    </Container>
  )
}