
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
    const { text, apiKey } = await req.json();
    
    if (!apiKey) {
      throw new Error('API key is required');
    }

    console.log('Parsing voice command with Azure OpenAI GPT-4.1:', text);

    const prompt = `You are a medical voice command parser. Analyze this voice command and extract structured information for a medical prescription system.

Voice command: "${text}"

Parse and return JSON with these fields:
{
  "command_type": "patient_search|form_fill|navigation|medication_add|unknown",
  "patient_info": {
    "name": "extracted patient name or null",
    "age": "extracted age or null", 
    "gender": "extracted gender or null",
    "search_query": "search terms for patient lookup or null"
  },
  "medical_info": {
    "diagnosis": "extracted diagnosis or null",
    "medications": ["list of mentioned medications"],
    "dosage": "extracted dosage information or null",
    "vital_signs": {
      "temperature": "extracted temperature or null",
      "blood_pressure": "extracted BP or null"
    }
  },
  "navigation": {
    "action": "go_to|switch_to|open or null",
    "target": "target page/section or null"
  },
  "form_actions": {
    "field": "target form field or null", 
    "value": "value to set or null",
    "action": "set|clear|focus or null"
  },
  "search_criteria": {
    "auto_select": "most_visits|latest_visit|null",
    "switch_mode": "existing_patient|new_patient|null"
  },
  "confidence": 0.0-1.0
}

Examples:
- "Search for patient John Smith" → patient_search with search_query
- "Set temperature to 98.6" → form_fill for temperature field
- "Add medication Aspirin 100mg" → medication_add
- "Go to patient history" → navigation to patient history
- "Find patient with most visits named Sarah" → patient_search with auto_select: "most_visits"

Be precise and only extract information that is clearly stated.`;

    // Use Azure OpenAI GPT-4.1 for command parsing
    const response = await fetch('https://otly.cognitiveservices.azure.com/openai/deployments/gpt-4.1/chat/completions?api-version=2025-01-01-preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are a medical voice command parser. Always respond with valid JSON.' },
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

    console.log('Voice command parsing completed');

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
        command_type: 'unknown',
        patient_info: { name: null, age: null, gender: null, search_query: null },
        medical_info: { diagnosis: null, medications: [], dosage: null, vital_signs: {} },
        navigation: { action: null, target: null },
        form_actions: { field: null, value: null, action: null },
        search_criteria: { auto_select: null, switch_mode: null },
        confidence: 0.0
      };
    }

    return new Response(
      JSON.stringify(parsedCommand),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error parsing voice command:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to parse voice command',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
