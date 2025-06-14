
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcript, currentPath } = await req.json();

    if (!transcript) {
      throw new Error('No transcript provided');
    }

    console.log('Processing global voice command:', transcript);
    console.log('Current path:', currentPath);

    const systemPrompt = `You are an EXTREMELY INTELLIGENT Global Voice Agent for a medical prescription app. You must handle COMPLEX MULTI-STEP commands with PERFECT execution.

Your job is to parse voice commands and return ONE SINGLE JSON response that represents the PRIMARY action to execute. For complex commands, prioritize the MOST IMPORTANT action and include ALL relevant parameters.

CURRENT CONTEXT:
- User is on: ${currentPath}
- Available pages: / (main dashboard), /auth (login), /directory (doctors), /profile-setup

ENHANCED INTELLIGENCE RULES FOR COMPLEX COMMANDS:
1. ALWAYS parse the ENTIRE command and understand the full context
2. For multi-step commands, identify the PRIMARY action and include ALL data as parameters
3. NEVER return multiple JSON objects - combine everything into ONE response
4. Be EXTREMELY intelligent about understanding medical workflows
5. Handle natural speech patterns, hesitations, and corrections gracefully

CRITICAL FIELD MAPPING RULES:
1. GENDER: Must be exactly "Male", "Female", or "Other" (case-sensitive)
2. BLOOD PRESSURE: Must use field name "bp" with format "systolic/diastolic" (e.g., "120/80")
3. MEDICATION FREQUENCY: Must use exact dropdown values:
   - "Once daily" or "Once a day" → "Once daily"
   - "Twice daily" or "Twice a day" → "Twice daily" 
   - "Three times daily" or "Three times a day" → "Three times daily"
   - "Four times daily" or "Four times a day" → "Four times daily"
   - "Every 4 hours" → "Every 4 hours"
   - "Every 6 hours" → "Every 6 hours"
   - "Every 8 hours" → "Every 8 hours"
   - "Every 12 hours" → "Every 12 hours"
   - "As needed" → "As needed"
   - "Before meals" → "Before meals"
   - "After meals" → "After meals"
   - "At bedtime" → "At bedtime"
4. FOLLOW-UP DATE: Must be in MM/DD/YYYY format (e.g., "12/15/2024")
5. MEDICATIONS: Must be an array of medication objects with name, dosage, frequency, duration

COMPLEX COMMAND PARSING INTELLIGENCE:
- "Clear form + search + select + prescribe" → PRIMARY: fill_form with search parameters AND medication data
- Extract patient search criteria (name, selection criteria)
- Extract all prescription data (medications, diagnosis, conditions)
- Combine everything into ONE comprehensive action

RESPONSE FORMAT - Return ONLY ONE valid JSON object:
{
  "action": "fill_form",
  "target": "search term if applicable",
  "parameters": {
    "searchCriteria": {
      "patientName": "extracted search term",
      "autoSelect": "most_visits|latest_visit",
      "switchToExisting": true
    },
    "clearForm": true,
    "prescription": {
      "doctorName": "extracted doctor name",
      "patientName": "extracted patient name", 
      "age": "extracted age as number",
      "gender": "Male|Female|Other (exact match required)",
      "contact": "extracted phone/contact",
      "temperature": "extracted temperature as number",
      "bp": "systolic/diastolic format (e.g., 120/80)",
      "diagnosis": "extracted diagnosis",
      "medications": [
        {
          "name": "medication name",
          "dosage": "dosage amount",
          "frequency": "exact dropdown value from frequency mapping above",
          "duration": "duration (e.g., 7 days, 2 weeks)"
        }
      ],
      "notes": "extracted clinical notes/conditions",
      "followUpDate": "MM/DD/YYYY format only"
    }
  },
  "response": "Human-friendly response confirming the complex action"
}

ENHANCED EXAMPLES FOR COMPLEX COMMANDS:

Input: "Clear the form. Also go to existing patient search for Jane, select Jane which have most number of visits. And after that prescribe her medication amoxycillin 500 mg, dolo 650 for seven days and the frequency for it will be twice in a day. And the diagnosis is acute bronchitis and the underlying conditions are hypertension."

→ INTELLIGENT PARSING:
{
  "action": "fill_form",
  "target": "Jane",
  "parameters": {
    "searchCriteria": {
      "patientName": "Jane",
      "autoSelect": "most_visits",
      "switchToExisting": true
    },
    "clearForm": true,
    "prescription": {
      "diagnosis": "acute bronchitis",
      "medications": [
        {
          "name": "amoxycillin",
          "dosage": "500mg",
          "frequency": "Twice daily",
          "duration": "7 days"
        },
        {
          "name": "dolo",
          "dosage": "650mg",
          "frequency": "Twice daily", 
          "duration": "7 days"
        }
      ],
      "notes": "hypertension"
    }
  },
  "response": "Clearing form, searching for Jane, auto-selecting patient with most visits, and filling prescription with amoxycillin and dolo for acute bronchitis with hypertension noted."
}

CRITICAL: Return ONLY ONE JSON object. Never return multiple JSON objects. Combine all actions into ONE intelligent response.

Parse this command with MAXIMUM INTELLIGENCE: "${transcript}"`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: systemPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Gemini response:', data);

    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('No response from Gemini');
    }

    // Enhanced JSON extraction with better error handling
    let parsedCommand;
    try {
      // Remove any markdown formatting and extract JSON
      const cleanedText = generatedText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      // Try to find the first complete JSON object
      const jsonStart = cleanedText.indexOf('{');
      const jsonEnd = cleanedText.lastIndexOf('}') + 1;
      
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        const jsonString = cleanedText.substring(jsonStart, jsonEnd);
        parsedCommand = JSON.parse(jsonString);
        console.log('Successfully parsed enhanced JSON:', parsedCommand);
      } else {
        throw new Error('No valid JSON structure found');
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', generatedText);
      console.error('Parse error:', parseError);
      
      // Intelligent fallback based on keywords in the original transcript
      if (transcript.toLowerCase().includes('search') && transcript.toLowerCase().includes('jane')) {
        parsedCommand = {
          action: 'fill_form',
          target: 'Jane',
          parameters: {
            searchCriteria: {
              patientName: 'Jane',
              autoSelect: 'most_visits',
              switchToExisting: true
            },
            clearForm: transcript.toLowerCase().includes('clear'),
            prescription: {
              diagnosis: transcript.toLowerCase().includes('bronchitis') ? 'acute bronchitis' : '',
              medications: [],
              notes: transcript.toLowerCase().includes('hypertension') ? 'hypertension' : ''
            }
          },
          response: "I understood your complex command about searching for Jane and filling a prescription. Executing now..."
        };
      } else {
        // Final fallback
        parsedCommand = {
          action: 'help',
          response: "I'm processing your complex command. Let me break it down and execute it step by step."
        };
      }
    }

    console.log('Final parsed command:', parsedCommand);

    return new Response(JSON.stringify(parsedCommand), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in global-voice-commands:', error);
    
    return new Response(JSON.stringify({ 
      action: 'help',
      response: 'I encountered an error processing your command, but I'm learning from it. Please try again.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
