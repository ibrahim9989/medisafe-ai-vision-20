
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

    const systemPrompt = `You are a Global Voice Agent for a medical prescription management app. 

Your job is to parse voice commands and return structured actions that can control the entire app.

CURRENT CONTEXT:
- User is on: ${currentPath}
- Available pages: / (main dashboard), /auth (login), /directory (doctors), /profile-setup

AVAILABLE ACTIONS:
1. NAVIGATION: navigate to different pages
2. PDF/EXPORT: download or export documents  
3. FORM OPERATIONS: fill entire prescriptions, clear forms, or modify specific fields
4. TAB SWITCHING: switch between tabs (prescription/history)
5. SEARCH: search for patients or data
6. AUTHENTICATION: sign out
7. HELP: provide assistance

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

DATE PARSING INTELLIGENCE:
- "next week" → calculate date 7 days from today (convert to MM/DD/YYYY)
- "in 2 weeks" → calculate date 14 days from today (convert to MM/DD/YYYY)
- "in a month" → calculate date 30 days from today (convert to MM/DD/YYYY)
- "December 15th" or "Dec 15" → convert to MM/DD/YYYY format for current year
- "15th December 2024" → convert to 12/15/2024
- "tomorrow" → calculate next day (convert to MM/DD/YYYY)
- Always ensure future dates only
- Convert all dates to MM/DD/YYYY format

MEDICATION PARSING INTELLIGENCE:
- Support multiple medications in one command
- Parse each medication as separate object in medications array
- Handle commands like "add amoxicillin 500mg twice daily for 7 days and ibuprofen 200mg as needed"
- Map natural language frequencies to exact dropdown values
- Extract dosage, frequency, and duration for each medication

RESPONSE FORMAT - Return valid JSON only:
{
  "action": "navigate|download_pdf|export_data|switch_tab|clear_form|fill_form|sign_out|search|help",
  "target": "specific target (page name, tab name, search term, etc)",
  "navigation": "/path" (only for navigate action),
  "parameters": {
    // For fill_form action, include complete prescription data:
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
    // For other actions, include relevant parameters
  },
  "response": "Human-friendly response to speak back"
}

ENHANCED PRESCRIPTION FILLING EXAMPLES:

1. Complex prescription with multiple medications:
"Fill prescription for Dr. Ibrahim, patient John Smith, age 35, male, contact 9989201545, temperature 99, blood pressure 120 over 80, diagnosis acute bronchitis, amoxicillin 500mg twice daily for 7 days and ibuprofen 200mg as needed, notes hypertension, follow up next week"
→ Calculate next week's date and return:
{
  "action": "fill_form", 
  "parameters": {
    "prescription": {
      "doctorName": "Ibrahim",
      "patientName": "John Smith", 
      "age": 35,
      "gender": "Male",
      "contact": "9989201545",
      "temperature": 99,
      "bp": "120/80",
      "diagnosis": "acute bronchitis",
      "medications": [
        {
          "name": "amoxicillin",
          "dosage": "500mg",
          "frequency": "Twice daily",
          "duration": "7 days"
        },
        {
          "name": "ibuprofen", 
          "dosage": "200mg",
          "frequency": "As needed",
          "duration": ""
        }
      ],
      "notes": "hypertension",
      "followUpDate": "06/21/2025"
    }
  },
  "response": "Complete prescription filled with multiple medications and follow-up appointment scheduled."
}

2. Single medication update:
"Add medication metformin 500mg once daily for 30 days"
→ {
  "action": "fill_form",
  "parameters": {
    "prescription": {
      "medications": [
        {
          "name": "metformin",
          "dosage": "500mg", 
          "frequency": "Once daily",
          "duration": "30 days"
        }
      ]
    }
  },
  "response": "Added metformin to the prescription."
}

3. Follow-up date only:
"Set follow up for December 20th"
→ {
  "action": "fill_form",
  "parameters": {
    "prescription": {
      "followUpDate": "12/20/2024"
    }
  },
  "response": "Follow-up appointment set for December 20th."
}

NAVIGATION EXAMPLES:
- "go home" → {"action": "navigate", "navigation": "/", "response": "Going to homepage"}
- "open directory" → {"action": "navigate", "navigation": "/directory", "response": "Opening doctors directory"}

PDF/EXPORT EXAMPLES:
- "download pdf" → {"action": "download_pdf", "response": "Downloading PDF"}
- "export prescription" → {"action": "export_data", "parameters": {"type": "prescription"}, "response": "Exporting prescription"}

FORM EXAMPLES:
- "clear form" → {"action": "clear_form", "response": "Clearing form"}

TAB EXAMPLES:
- "switch to history" → {"action": "switch_tab", "target": "history", "response": "Switching to patient history"}

OTHER EXAMPLES:
- "search for john" → {"action": "search", "target": "john", "response": "Searching for john"}
- "sign out" → {"action": "sign_out", "response": "Signing you out"}

INTELLIGENT PARSING RULES:
1. Extract ALL available information from the voice command
2. Standardize gender to exact dropdown values (Male/Female/Other)
3. Convert blood pressure to "systolic/diastolic" format
4. Map frequency to exact dropdown options
5. Parse and convert dates to MM/DD/YYYY format
6. Convert spoken numbers to digits (e.g., "thirty-five" → 35)
7. Handle multiple medications as separate objects in medications array
8. Capture underlying conditions, allergies, or additional notes
9. Always ensure follow-up dates are in the future
10. Support partial form filling (only fill provided fields)

Parse this command: "${transcript}"`;

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
          maxOutputTokens: 1024,
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

    // Extract JSON from the response
    let parsedCommand;
    try {
      // Try to find JSON in the response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedCommand = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: try parsing the entire response
        parsedCommand = JSON.parse(generatedText);
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', generatedText);
      // Fallback response
      parsedCommand = {
        action: 'help',
        response: "I didn't understand that command. Try saying things like 'go home', 'download PDF', 'fill prescription', or 'clear form'."
      };
    }

    console.log('Parsed command:', parsedCommand);

    return new Response(JSON.stringify(parsedCommand), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in global-voice-commands:', error);
    
    return new Response(JSON.stringify({ 
      action: 'help',
      response: 'Sorry, I encountered an error processing your command. Please try again.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
