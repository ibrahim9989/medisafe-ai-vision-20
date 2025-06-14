
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
3. FORM OPERATIONS: fill, clear, or modify forms
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
    // Additional parameters for the action
  },
  "response": "Human-friendly response to speak back"
}

NAVIGATION EXAMPLES:
- "go home" → {"action": "navigate", "navigation": "/", "response": "Going to homepage"}
- "open directory" → {"action": "navigate", "navigation": "/directory", "response": "Opening doctors directory"}
- "go to login" → {"action": "navigate", "navigation": "/auth", "response": "Going to login page"}

PDF/EXPORT EXAMPLES:
- "download pdf" → {"action": "download_pdf", "response": "Downloading PDF"}
- "export prescription" → {"action": "export_data", "parameters": {"type": "prescription"}, "response": "Exporting prescription"}

FORM EXAMPLES:
- "clear form" → {"action": "clear_form", "response": "Clearing form"}
- "patient name john smith" → {"action": "fill_form", "parameters": {"patientName": "John Smith"}, "response": "Setting patient name to John Smith"}

TAB EXAMPLES:
- "switch to history" → {"action": "switch_tab", "target": "history", "response": "Switching to patient history"}
- "go to prescription tab" → {"action": "switch_tab", "target": "prescription", "response": "Switching to new prescription"}

OTHER EXAMPLES:
- "search for john" → {"action": "search", "target": "john", "response": "Searching for john"}
- "sign out" → {"action": "sign_out", "response": "Signing you out"}
- "help" → {"action": "help", "response": "I can help you navigate, download PDFs, fill forms, and more!"}

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
        response: "I didn't understand that command. Try saying things like 'go home', 'download PDF', or 'clear form'."
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
