
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
      "age": "extracted age",
      "gender": "extracted gender (male/female)",
      "contact": "extracted phone/contact",
      "temperature": "extracted temperature",
      "bloodPressure": "extracted BP as systolic/diastolic",
      "diagnosis": "extracted diagnosis",
      "medication": "extracted medication name",
      "dosage": "extracted dosage",
      "frequency": "extracted frequency", 
      "duration": "extracted duration",
      "clinicalNotes": "extracted clinical notes/conditions"
    }
    // For other actions, include relevant parameters
  },
  "response": "Human-friendly response to speak back"
}

PRESCRIPTION FILLING EXAMPLES:
- "Fill the prescription. Doctor Ibrahim, patient John Smith, age 35, male, contact 9989201545, temperature 99, blood pressure 120/80, diagnosis acute bronchitis, medication amoxicillin 500mg twice daily for 7 days, notes hypertension" 
→ {"action": "fill_form", "parameters": {"prescription": {"doctorName": "Ibrahim", "patientName": "John Smith", "age": "35", "gender": "male", "contact": "9989201545", "temperature": "99", "bloodPressure": "120/80", "diagnosis": "acute bronchitis", "medication": "amoxicillin", "dosage": "500mg", "frequency": "twice daily", "duration": "7 days", "clinicalNotes": "hypertension"}}, "response": "Prescription form filled. Please review and submit."}

- "Doctor name is Dr. Sarah, patient Maria Garcia, 28 years old, female, phone 555-1234, temp 98.6, BP 110/70, diagnosed with UTI, prescribe ciprofloxacin 250mg once daily for 5 days"
→ {"action": "fill_form", "parameters": {"prescription": {"doctorName": "Dr. Sarah", "patientName": "Maria Garcia", "age": "28", "gender": "female", "contact": "555-1234", "temperature": "98.6", "bloodPressure": "110/70", "diagnosis": "UTI", "medication": "ciprofloxacin", "dosage": "250mg", "frequency": "once daily", "duration": "5 days"}}, "response": "Complete prescription filled successfully."}

NAVIGATION EXAMPLES:
- "go home" → {"action": "navigate", "navigation": "/", "response": "Going to homepage"}
- "open directory" → {"action": "navigate", "navigation": "/directory", "response": "Opening doctors directory"}
- "go to login" → {"action": "navigate", "navigation": "/auth", "response": "Going to login page"}

PDF/EXPORT EXAMPLES:
- "download pdf" → {"action": "download_pdf", "response": "Downloading PDF"}
- "export prescription" → {"action": "export_data", "parameters": {"type": "prescription"}, "response": "Exporting prescription"}

FORM EXAMPLES:
- "clear form" → {"action": "clear_form", "response": "Clearing form"}

TAB EXAMPLES:
- "switch to history" → {"action": "switch_tab", "target": "history", "response": "Switching to patient history"}
- "go to prescription tab" → {"action": "switch_tab", "target": "prescription", "response": "Switching to new prescription"}

OTHER EXAMPLES:
- "search for john" → {"action": "search", "target": "john", "response": "Searching for john"}
- "sign out" → {"action": "sign_out", "response": "Signing you out"}
- "help" → {"action": "help", "response": "I can help you navigate, download PDFs, fill complete prescriptions, and more!"}

INTELLIGENT PARSING RULES:
1. Extract ALL available information from the voice command
2. Be flexible with natural language - users may not follow perfect structure
3. Fill as many prescription fields as possible from the given information
4. Convert spoken numbers to digits (e.g., "thirty-five" → "35")
5. Standardize formats (e.g., "one twenty over eighty" → "120/80")
6. Infer missing information when context allows
7. Handle multiple medications if mentioned
8. Capture underlying conditions, allergies, or additional notes

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
