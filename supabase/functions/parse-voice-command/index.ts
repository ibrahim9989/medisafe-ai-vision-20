
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
    const { transcript, currentData } = await req.json();
    
    if (!transcript) {
      throw new Error('No transcript provided');
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    console.log('Processing voice command:', transcript);
    console.log('Current prescription data:', currentData);

    const prompt = `You are a medical prescription voice assistant. Parse the following voice command and extract structured medical information.

Current prescription data:
- Patient Name: ${currentData?.patientName || 'Not set'}
- Age: ${currentData?.age || 'Not set'}
- Gender: ${currentData?.gender || 'Not set'}
- Contact: ${currentData?.contact || 'Not set'}
- Temperature: ${currentData?.temperature || 'Not set'}
- Blood Pressure: ${currentData?.bp || 'Not set'}
- Diagnosis: ${currentData?.diagnosis || 'Not set'}
- Current Medications: ${JSON.stringify(currentData?.medications || [])}
- Clinical Notes: ${currentData?.notes || 'Not set'}
- Follow-up Date: ${currentData?.followUpDate || 'Not set'}

Voice Command: "${transcript}"

Instructions:
1. Identify what medical information the user wants to update
2. Extract the specific values mentioned
3. For medication names, be flexible with brand/generic names
4. For numeric values, convert words to numbers (e.g., "forty-nine" to "49")
5. For blood pressure, format as "systolic/diastolic" (e.g., "120/80")
6. For dates, convert to YYYY-MM-DD format
7. Use EXACT field names that match the form structure

IMPORTANT FIELD MAPPINGS:
- Use "patientName" for patient name
- Use "age" for age (as number)
- Use "gender" for gender ("male" or "female")
- Use "contact" for contact information
- Use "temperature" for temperature (as number)
- Use "bp" for blood pressure
- Use "diagnosis" for diagnosis
- Use "notes" for clinical notes/underlying conditions
- Use "followUpDate" for follow-up appointment (YYYY-MM-DD format)
- For medications, use "medications" array with objects containing: name, dosage, frequency, duration

Expected JSON format:
{
  "action": "update_field",
  "updates": {
    "fieldName": "newValue"
  },
  "response": "confirmation message to speak back",
  "confidence": 0.9
}

Examples:
- "Patient name is John Smith" → {"action": "update_field", "updates": {"patientName": "John Smith"}, "response": "Patient name set to John Smith", "confidence": 0.95}
- "Age is forty-nine" → {"action": "update_field", "updates": {"age": 49}, "response": "Age set to 49 years old", "confidence": 0.9}
- "Gender is female" → {"action": "update_field", "updates": {"gender": "female"}, "response": "Gender set to female", "confidence": 0.95}
- "Clinical notes patient has kidney disease" → {"action": "update_field", "updates": {"notes": "patient has kidney disease"}, "response": "Clinical notes updated", "confidence": 0.9}
- "Follow up on June 23rd 2025" → {"action": "update_field", "updates": {"followUpDate": "2025-06-23"}, "response": "Follow-up date set to June 23rd, 2025", "confidence": 0.9}
- "Add medication amoxicillin 500mg three times daily for 7 days" → {"action": "update_field", "updates": {"medications": [{"name": "amoxicillin", "dosage": "500mg", "frequency": "three times daily", "duration": "7 days"}]}, "response": "Added amoxicillin medication", "confidence": 0.85}
- "Blood pressure is 140 over 90" → {"action": "update_field", "updates": {"bp": "140/90"}, "response": "Blood pressure set to 140 over 90", "confidence": 0.9}

Parse the command and return only the JSON response:`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 0.8,
          maxOutputTokens: 1024,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('Gemini API response:', result);
    
    const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Extract JSON from the response
    let parsedCommand;
    try {
      // Try to find JSON in the response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedCommand = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', generatedText);
      // Fallback response
      parsedCommand = {
        action: "unknown",
        updates: {},
        response: "I didn't understand that command. Try saying 'help' to see what I can do.",
        confidence: 0.1
      };
    }

    console.log('Parsed command:', parsedCommand);

    return new Response(
      JSON.stringify(parsedCommand),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Voice command parsing error:', error);
    return new Response(
      JSON.stringify({ 
        action: "error",
        updates: {},
        response: "Sorry, I had trouble processing that command.",
        confidence: 0,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
