
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
    const { text } = await req.json();
    
    if (!text) {
      throw new Error('No text provided');
    }

    // Note: Azure OpenAI doesn't have a direct text-to-speech endpoint like ElevenLabs
    // For now, we'll return a simple response indicating TTS is not available
    // You may want to integrate with Azure Speech Services instead
    
    console.log('Text-to-speech requested for:', text.substring(0, 50) + '...');
    
    return new Response(
      JSON.stringify({ 
        message: 'Text-to-speech feature temporarily unavailable. Azure OpenAI GPT models do not include TTS capabilities.',
        audioContent: null,
        contentType: null
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Text-to-speech error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        audioContent: null
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
