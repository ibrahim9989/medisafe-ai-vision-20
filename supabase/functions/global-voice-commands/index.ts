
import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { command, apiKey } = await req.json();
    
    if (!apiKey) {
      throw new Error('API key is required');
    }

    console.log('Processing global voice command with Azure OpenAI GPT-4.1:', command);

    const prompt = `You are a medical application voice command processor. Process this voice command and determine the appropriate action.

Command: "${command}"

Analyze the command and return JSON with:
{
  "action": "navigate|search|form_fill|prescription_action|voice_search|unknown",
  "target": "specific target or page name",
  "parameters": {
    "query": "search query if applicable",
    "field": "form field name if applicable", 
    "value": "value to set if applicable",
    "patient_name": "patient name if mentioned",
    "auto_select": "most_visits|latest_visit if specified",
    "switch_to_existing": true/false
  },
  "confidence": 0.0-1.0,
  "description": "human readable description of the action"
}

Common commands:
- "Go to dashboard" → navigate to dashboard
- "Search for patient John" → voice_search with query
- "Find patient with most visits named Sarah" → voice_search with auto_select
- "Set temperature to 98.6" → form_fill for temperature
- "Create new prescription" → prescription_action
- "Switch to existing patient" → navigate with switch_to_existing

Be precise and extract the user's intent clearly.`;

    // Use Azure OpenAI GPT-4.1 for global command processing
    const response = await fetch('https://otly.cognitiveservices.azure.com/openai/deployments/gpt-4.1/chat/completions?api-version=2025-01-01-preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are a medical application voice command processor. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        model: 'gpt-4.1',
        max_completion_tokens: 1024,
        temperature: 0.1,
        top_p: 0.8,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure OpenAI GPT-4.1 API error:', errorText);
      throw new Error(`Azure OpenAI GPT-4.1 API error: ${response.status}`);
    }

    const data = await response.json();
    const commandText = data.choices?.[0]?.message?.content || '';

    console.log('Global voice command processing completed');

    // Parse the JSON response
    let parsedCommand;
    try {
      const jsonMatch = commandText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedCommand = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in command response');
      }
    } catch (parseError) {
      console.error('Failed to parse command JSON:', parseError);
      parsedCommand = {
        action: 'unknown',
        target: '',
        parameters: {},
        confidence: 0.0,
        description: 'Command parsing failed'
      };
    }

    return new Response(
      JSON.stringify(parsedCommand),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error processing global voice command:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process global voice command',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
