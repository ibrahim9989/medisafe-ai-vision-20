
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
    const { audioData } = await req.json();
    
    if (!audioData) {
      throw new Error('No audio data provided');
    }

    const azureApiKey = 'FZ9RZqAVfAtln3qn1Y8CvVJck70dw2ijPZB51KFLbOg9EVWXyUtDJQQJ99BEACHYHv6XJ3w3AAAAACOGbxmN';
    
    console.log('Processing audio data with Azure OpenAI GPT-4o-mini-transcribe, length:', audioData.length);

    // Validate base64 audio data
    if (audioData.length < 100) {
      throw new Error('Audio data too short - may be corrupted');
    }

    // Convert base64 audio to blob
    const audioBuffer = Uint8Array.from(atob(audioData), c => c.charCodeAt(0));
    const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' });

    console.log('Audio blob created - size:', audioBlob.size, 'bytes');

    // Create form data for Azure OpenAI speech-to-text
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');

    console.log('Sending request to Azure OpenAI GPT-4o-mini-transcribe...');

    const response = await fetch('https://razam-mac1ml8q-eastus2.cognitiveservices.azure.com/openai/deployments/gpt-4o-mini-transcribe/audio/transcriptions?api-version=2025-03-01-preview', {
      method: 'POST',
      headers: {
        'api-key': azureApiKey,
      },
      body: formData,
    });

    console.log('Azure OpenAI API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure OpenAI API detailed error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Azure OpenAI API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Azure OpenAI API successful result:', result);
    
    return new Response(
      JSON.stringify({ 
        transcript: result.text || '',
        confidence: 1.0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Voice-to-text processing error:', {
      message: error.message,
      stack: error.stack
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
