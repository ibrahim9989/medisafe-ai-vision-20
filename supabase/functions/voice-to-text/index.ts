
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { audioData, transcribeApiKey } = await req.json();
    
    if (!audioData) {
      throw new Error('No audio data provided');
    }

    // Use client-provided API key or fallback to environment variable
    const apiKey = transcribeApiKey || Deno.env.get('AZURE_OPENAI_GPT4O_TRANSCRIBE_API_KEY');
    if (!apiKey) {
      throw new Error('Azure OpenAI GPT-4o-transcribe API key not configured');
    }

    console.log('Processing audio data with Azure GPT-4o-transcribe, length:', audioData.length);

    // Validate base64 audio data
    if (audioData.length < 100) {
      throw new Error('Audio data too short - may be corrupted');
    }

    // Convert base64 audio to blob
    const audioBuffer = Uint8Array.from(atob(audioData), c => c.charCodeAt(0));
    const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' });

    console.log('Audio blob created - size:', audioBlob.size, 'bytes');

    // Create form data for Azure OpenAI GPT-4o-transcribe
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('model', 'gpt-4o-transcribe');

    console.log('Sending request to Azure GPT-4o-transcribe API...');
    console.log('Using API key (first 10 chars):', apiKey.substring(0, 10) + '...');

    const response = await fetch('https://otly.cognitiveservices.azure.com/openai/deployments/gpt-4o-transcribe/audio/transcriptions?api-version=2025-03-01-preview', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
      },
      body: formData,
    });

    console.log('Azure GPT-4o-transcribe API response status:', response.status);
    console.log('Azure GPT-4o-transcribe API response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure GPT-4o-transcribe API detailed error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        headers: Object.fromEntries(response.headers.entries())
      });
      throw new Error(`Azure GPT-4o-transcribe API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Azure GPT-4o-transcribe API successful result:', result);
    
    return new Response(
      JSON.stringify({ 
        transcript: result.text || '',
        confidence: 1.0 // Azure doesn't provide confidence, default to 1.0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Voice-to-text processing error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return new Response(
      JSON.stringify({ 
        error: error.message,
        transcript: '',
        confidence: 0
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
