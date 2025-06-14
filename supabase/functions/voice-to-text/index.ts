
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

    const elevenlabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!elevenlabsApiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    console.log('Processing audio data, length:', audioData.length);

    // Validate base64 audio data
    if (audioData.length < 100) {
      throw new Error('Audio data too short - may be corrupted');
    }

    // Convert base64 audio to blob with WAV format for better compatibility
    const audioBuffer = Uint8Array.from(atob(audioData), c => c.charCodeAt(0));
    const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });

    console.log('Audio blob created - size:', audioBlob.size, 'bytes, type: audio/wav');

    // Create form data for ElevenLabs speech-to-text with minimal required parameters
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.wav');
    formData.append('model_id', 'eleven_multilingual_v2');

    console.log('Sending request to ElevenLabs speech-to-text API...');

    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: {
        'xi-api-key': elevenlabsApiKey,
      },
      body: formData,
    });

    console.log('ElevenLabs API response status:', response.status);
    console.log('ElevenLabs API response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API detailed error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('ElevenLabs API successful result:', result);
    
    return new Response(
      JSON.stringify({ 
        transcript: result.text || result.transcript || '',
        confidence: result.confidence || 0
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
