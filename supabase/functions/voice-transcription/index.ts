
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AZURE_TRANSCRIBE_ENDPOINT = 'https://otly.cognitiveservices.azure.com/openai/deployments/gpt-4o-transcribe/audio/transcriptions?api-version=2025-03-01-preview';
const AZURE_TRANSCRIBE_API_KEY = '4g6z7Fsq40SA0ipOk33t2LvEhBvUV3vas3KGJPQfxDL0XbozazovJQQJ99BGACHYHv6XJ3w3AAAAACOGqMlD';

const AZURE_GPT41_ENDPOINT = 'https://otly.cognitiveservices.azure.com/openai/deployments/gpt-4.1/chat/completions?api-version=2025-01-01-preview';
const AZURE_GPT41_API_KEY = '20ecnQrTCmX9zZXyIRXPGpS8gnGvjrLhea2usfq7MUGzkyqZyhKDJQQJ99BGACYeBjFXJ3w3AAAAACOGde3O';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Starting voice transcription process...');
    
    const { audio } = await req.json();
    
    if (!audio) {
      throw new Error('No audio data provided');
    }

    console.log('Audio data received, processing transcription...');

    // Convert base64 to blob for transcription
    const binaryAudio = Uint8Array.from(atob(audio), c => c.charCodeAt(0));
    
    // Prepare form data for transcription
    const formData = new FormData();
    const audioBlob = new Blob([binaryAudio], { type: 'audio/webm' });
    formData.append('file', audioBlob, 'audio.webm');

    console.log('Calling Azure OpenAI transcription API...');

    // Call Azure OpenAI transcription API
    const transcriptionResponse = await fetch(AZURE_TRANSCRIBE_ENDPOINT, {
      method: 'POST',
      headers: {
        'api-key': AZURE_TRANSCRIBE_API_KEY,
      },
      body: formData,
    });

    if (!transcriptionResponse.ok) {
      const errorText = await transcriptionResponse.text();
      console.error('Transcription API error:', errorText);
      throw new Error(`Transcription failed: ${transcriptionResponse.status} - ${errorText}`);
    }

    const transcriptionResult = await transcriptionResponse.json();
    const transcribedText = transcriptionResult.text;

    console.log('Transcription completed, analyzing with GPT-4.1...');

    // Analyze with GPT-4.1 for intelligent summary and prescription extraction
    const analysisResponse = await fetch(AZURE_GPT41_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': AZURE_GPT41_API_KEY,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `You are a medical AI assistant. Analyze the consultation transcript and extract relevant medical information. Return a JSON response with the following structure:
            {
              "summary": "Brief summary of the consultation",
              "diagnosis": "Primary diagnosis or suspected condition",
              "symptoms": ["list", "of", "symptoms"],
              "medications": [
                {
                  "name": "medication name",
                  "dosage": "dosage amount",
                  "frequency": "how often",
                  "duration": "how long"
                }
              ],
              "recommendedTests": ["list", "of", "recommended", "tests"],
              "followUpInstructions": "Follow-up instructions for patient",
              "vitalSigns": {
                "temperature": "if mentioned",
                "bloodPressure": "if mentioned"
              }
            }`
          },
          {
            role: 'user',
            content: `Please analyze this consultation transcript and extract the medical information: ${transcribedText}`
          }
        ],
        max_tokens: 1500,
        temperature: 0.3,
        model: 'gpt-4.1'
      }),
    });

    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text();
      console.error('Analysis API error:', errorText);
      throw new Error(`Analysis failed: ${analysisResponse.status} - ${errorText}`);
    }

    const analysisResult = await analysisResponse.json();
    const analysisContent = analysisResult.choices[0].message.content;

    console.log('Analysis completed successfully');

    let structuredAnalysis;
    try {
      structuredAnalysis = JSON.parse(analysisContent);
    } catch (parseError) {
      console.warn('Failed to parse structured analysis, using raw content');
      structuredAnalysis = {
        summary: analysisContent,
        diagnosis: '',
        symptoms: [],
        medications: [],
        recommendedTests: [],
        followUpInstructions: '',
        vitalSigns: {}
      };
    }

    return new Response(JSON.stringify({
      transcript: transcribedText,
      analysis: structuredAnalysis
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Voice transcription error:', error);
    return new Response(JSON.stringify({
      error: error.message,
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
