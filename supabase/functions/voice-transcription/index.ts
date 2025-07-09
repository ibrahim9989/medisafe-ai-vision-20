
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

    let transcription = ''
    let analysis = null

    // Step 1: Transcribe audio if needed
    if (action === 'transcribe' || action === 'both') {
      const audioBuffer = Uint8Array.from(atob(audioBlob), c => c.charCodeAt(0))
      
      const formData = new FormData()
      const blob = new Blob([audioBuffer], { type: 'audio/webm' })
      formData.append('file', blob, 'audio.webm')
      formData.append('model', 'whisper-1')

      const transcribeResponse = await fetch('https://otly.cognitiveservices.azure.com/openai/deployments/gpt-4o-transcribe/audio/transcriptions?api-version=2025-03-01-preview', {
        method: 'POST',
        headers: {
          'api-key': '4g6z7Fsq40SA0ipOk33t2LvEhBvUV3vas3KGJPQfxDL0XbozazovJQQJ99BGACHYHv6XJ3w3AAAAACOGqMlD',
        },
        body: formData,
      })

      if (!transcribeResponse.ok) {
        throw new Error(`Transcription failed: ${await transcribeResponse.text()}`)
      }

      const transcribeResult = await transcribeResponse.json()
      transcription = transcribeResult.text
    }

    // Step 2: Analyze transcript if needed
    if (action === 'analyze' || action === 'both') {
      const textToAnalyze = transcription || existingTranscript

      const analysisResponse = await fetch('https://otly.cognitiveservices.azure.com/openai/deployments/gpt-4.1/chat/completions?api-version=2025-01-01-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': '20ecnQrTCmX9zZXyIRXPGpS8gnGvjrLhea2usfq7MUGzkyqZyhKDJQQJ99BGACYeBjFXJ3w3AAAAACOGde3O',
        },
        body: JSON.stringify({
          model: 'gpt-4',
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
          temperature: 0.3,
          max_tokens: 1500
        }),
      })

      if (!analysisResponse.ok) {
        throw new Error(`Analysis failed: ${await analysisResponse.text()}`)
      }

      const analysisResult = await analysisResponse.json()
      
      try {
        analysis = JSON.parse(analysisResult.choices[0].message.content)
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
