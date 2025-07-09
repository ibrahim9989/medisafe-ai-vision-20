
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TranscriptionRequest {
  audioBlob: string; // base64 encoded audio
  action: 'transcribe' | 'analyze' | 'both';
  existingTranscript?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { audioBlob, action, existingTranscript }: TranscriptionRequest = await req.json()

    console.log('Received request with action:', action)

    let transcription = ''
    let analysis = null

    // Step 1: Transcribe audio if needed
    if (action === 'transcribe' || action === 'both') {
      console.log('Starting transcription...')
      
      // Convert base64 to Uint8Array
      const audioBuffer = Uint8Array.from(atob(audioBlob), c => c.charCodeAt(0))
      
      const formData = new FormData()
      const blob = new Blob([audioBuffer], { type: 'audio/webm' })
      formData.append('file', blob, 'audio.webm')
      formData.append('model', 'gpt-4o-transcribe')

      const transcribeResponse = await fetch('https://otly.cognitiveservices.azure.com/openai/deployments/gpt-4o-transcribe/audio/transcriptions?api-version=2025-03-01-preview', {
        method: 'POST',
        headers: {
          'api-key': '4g6z7Fsq40SA0ipOk33t2LvEhBvUV3vas3KGJPQfxDL0XbozazovJQQJ99BGACHYHv6XJ3w3AAAAACOGqMlD',
        },
        body: formData,
      })

      if (!transcribeResponse.ok) {
        const errorText = await transcribeResponse.text()
        console.error('Transcription failed:', errorText)
        throw new Error(`Transcription failed: ${errorText}`)
      }

      const transcribeResult = await transcribeResponse.json()
      transcription = transcribeResult.text
      console.log('Transcription completed:', transcription)
    }

    // Step 2: Analyze transcript if needed
    if (action === 'analyze' || action === 'both') {
      console.log('Starting analysis...')
      const textToAnalyze = transcription || existingTranscript

      if (!textToAnalyze) {
        throw new Error('No text to analyze')
      }

      const analysisResponse = await fetch('https://otly.cognitiveservices.azure.com/openai/deployments/gpt-4.1/chat/completions?api-version=2024-12-01-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': '20ecnQrTCmX9zZXyIRXPGpS8gnGvjrLhea2usfq7MUGzkyqZyhKDJQQJ99BGACHYHv6XJ3w3AAAAACOGde3O',
        },
        body: JSON.stringify({
          model: 'gpt-4.1',
          messages: [
            {
              role: 'system',
              content: `You are a medical AI assistant. Analyze the consultation transcript and extract structured information in JSON format. 
              
              Return ONLY a valid JSON object with these fields:
              {
                "summary": "Brief consultation summary",
                "chiefComplaint": "Main patient complaint",
                "symptoms": ["list", "of", "symptoms"],
                "diagnosis": "Preliminary diagnosis if mentioned",
                "medications": [{"name": "medicine name", "dosage": "dosage", "frequency": "frequency", "duration": "duration"}],
                "vitalSigns": {"temperature": null, "bp": "", "pulse": null},
                "recommendedTests": ["list", "of", "tests"],
                "followUpInstructions": "Follow-up instructions",
                "notes": "Additional clinical notes"
              }
              
              Extract only information explicitly mentioned in the transcript. Use null for missing numeric values and empty strings for missing text values.`
            },
            {
              role: 'user',
              content: `Analyze this consultation transcript: ${textToAnalyze}`
            }
          ],
          max_completion_tokens: 1500,
          temperature: 0.3,
          top_p: 1.0,
          frequency_penalty: 0.0,
          presence_penalty: 0.0
        }),
      })

      if (!analysisResponse.ok) {
        const errorText = await analysisResponse.text()
        console.error('Analysis failed:', errorText)
        throw new Error(`Analysis failed: ${errorText}`)
      }

      const analysisResult = await analysisResponse.json()
      console.log('Analysis result:', analysisResult)
      
      try {
        analysis = JSON.parse(analysisResult.choices[0].message.content)
        console.log('Parsed analysis:', analysis)
      } catch (parseError) {
        console.error('Failed to parse analysis JSON:', parseError)
        analysis = {
          summary: analysisResult.choices[0].message.content,
          error: 'Failed to parse structured data'
        }
      }
    }

    return new Response(
      JSON.stringify({
        transcription,
        analysis,
        success: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Voice transcription error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
