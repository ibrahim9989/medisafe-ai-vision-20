
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

    const prompt = `You are an intelligent medical prescription voice assistant. Your job is to parse natural language voice commands and extract structured medical information with high accuracy.

CONTEXT - Current prescription data:
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

VOICE COMMAND TO PARSE: "${transcript}"

INTELLIGENCE RULES:
1. Be extremely flexible with natural language - users don't speak in perfect medical terminology
2. Infer meaning from context - if someone says "patient has diabetes" and there's no diagnosis set, that's likely the diagnosis
3. Handle multiple ways of expressing the same thing:
   - "Patient name is..." / "The patient's name is..." / "Name John Smith" / "Patient John Smith"
   - "Age 45" / "Patient is 45 years old" / "45 year old patient"
   - "Blood pressure 120 over 80" / "BP 120/80" / "Blood pressure is 120 slash 80"
   - "Follow up next week" / "See patient in one week" / "Appointment next Tuesday"
4. For medications, extract ALL components even if mentioned separately:
   - "Add amoxicillin" + dosage/frequency context from the sentence
   - "Give patient 500mg amoxicillin three times a day for a week"
   - "Prescribe medication amoxicillin 500 milligrams TID for 7 days"
5. For clinical notes, capture underlying conditions, allergies, symptoms, or medical history:
   - "Patient has hypertension" / "History of high blood pressure" / "BP elevated"
   - "Allergic to penicillin" / "Penicillin allergy" / "Cannot take penicillin"
   - "Diabetic patient" / "Has diabetes" / "Blood sugar issues"
   - "Complains of chest pain" / "Patient reports headache" / "Experiencing fatigue"
6. Be smart about gender - "male"/"female"/"man"/"woman"/"he"/"she" all indicate gender
7. Convert spoken numbers to digits: "forty-five" → 45, "one hundred and two" → 102

EXACT FIELD MAPPINGS (USE THESE EXACTLY):
- patientName: Patient's full name
- age: Numeric age value
- gender: "male" or "female" only
- contact: Phone number or contact information
- temperature: Numeric temperature value (Fahrenheit)
- bp: Blood pressure as "systolic/diastolic" format (e.g., "120/80")
- diagnosis: Medical diagnosis or condition
- notes: Clinical notes, underlying conditions, allergies, medical history, symptoms, complaints
- followUpDate: Date in YYYY-MM-DD format
- medications: Array of objects with {name, dosage, frequency, duration}

SMART EXAMPLES:
Input: "Patient John Smith age 45 has diabetes and hypertension"
→ {"action": "update_field", "updates": {"patientName": "John Smith", "age": 45, "diagnosis": "diabetes", "notes": "hypertension"}, "response": "Updated patient John Smith, age 45, with diabetes diagnosis and noted hypertension"}

Input: "Patient complains of chest pain and has history of heart disease"
→ {"action": "update_field", "updates": {"notes": "complains of chest pain, history of heart disease"}, "response": "Added clinical notes about chest pain complaint and cardiac history"}

Input: "Allergic to penicillin, has elevated blood pressure"
→ {"action": "update_field", "updates": {"notes": "allergic to penicillin, elevated blood pressure"}, "response": "Added allergy and blood pressure information to clinical notes"}

Input: "Patient reports fatigue and dizziness, underlying diabetes"
→ {"action": "update_field", "updates": {"notes": "reports fatigue and dizziness, underlying diabetes"}, "response": "Added symptoms and underlying condition to clinical notes"}

RESPONSE FORMAT (JSON only, no extra text):
{
  "action": "update_field",
  "updates": {
    "fieldName": "value"
  },
  "response": "Natural confirmation message",
  "confidence": 0.9
}

PARSE THE COMMAND NOW AND RETURN ONLY THE JSON RESPONSE:`;

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
    console.log('Generated text from Gemini:', generatedText);
    
    // Extract JSON from the response
    let parsedCommand;
    try {
      // Try to find JSON in the response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedCommand = JSON.parse(jsonMatch[0]);
        console.log('Successfully parsed JSON:', parsedCommand);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', generatedText);
      // Fallback response
      parsedCommand = {
        action: "unknown",
        updates: {},
        response: "I didn't understand that command. Try being more specific or say 'help' for examples.",
        confidence: 0.1
      };
    }

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
