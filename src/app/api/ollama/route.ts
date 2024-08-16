import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { prompt } = await req.json()
  console.log('Received prompt:', prompt)

  try {
    console.log('Sending request to Ollama')
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openhermes2.5-mistral:latest',
        prompt: prompt,
        stream: false
      }),
    })

    console.log('Ollama response status:', response.status)

    if (!response.ok) {
      throw new Error(`Ollama responded with status ${response.status}`)
    }

    const data = await response.json()
    console.log('Ollama raw response:', data)

    if (!data.response) {
      throw new Error('No response content from Ollama')
    }

    // Try to extract JSON array from the response
    const jsonMatch = data.response.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      console.error('No valid JSON array found in response:', data.response)
      throw new Error('No valid JSON array found in the response')
    }

    const jsonString = jsonMatch[0]
    console.log('Extracted JSON string:', jsonString)

    let parsedData
    try {
      parsedData = JSON.parse(jsonString)
      console.log('Parsed data:', parsedData)
    } catch (error) {
      console.error('Error parsing JSON:', error)
      console.error('JSON string that failed to parse:', jsonString)
      throw new Error('Invalid JSON format in the response')
    }

    if (!Array.isArray(parsedData)) {
      throw new Error('Parsed data is not an array')
    }

    return NextResponse.json({ response: parsedData })
  } catch (error) {
    console.error('Error in Ollama API route:', error as Error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}