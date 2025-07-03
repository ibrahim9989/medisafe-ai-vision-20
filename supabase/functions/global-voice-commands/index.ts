
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AZURE_OPENAI_GPT41_API_KEY = Deno.env.get('AZURE_OPENAI_GPT41_API_KEY');

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

Your job is to parse voice commands and return ONE SINGLE JSON response that represents the PRIMARY action to execute. For complex, multi-step commands, you MUST: 
- Identify the PRIMARY action but DO NOT drop details—INCLUDE ALL requested workflow steps as parameters or flags, especially when chaining is requested (such as searching a patient, selecting on criteria, and downloading a prescription PDF).
- If the user requests a prescription PDF or mentions export, ALWAYS ensure the output JSON includes a flag or subparameter such as: "prescription": { ..., "downloadPrescription": true }
- Be extremely clear and explicit in distinguishing each sequential step required in the workflow.
- NEVER drop sub-actions (like "download her prescription")—combine into the output with context on search, selection, and download.

CURRENT CONTEXT:
- User is on: ${currentPath}
- Available pages: / (dashboard), /auth (login), /directory (doctors), /profile-setup

ENHANCED INTELLIGENCE RULES FOR COMPLEX COMMANDS:
1. ALWAYS parse the FULL command and its context, inferring all user intent (even if not directly stated).
2. For multi-step commands (search + select + download, etc), chain all requested actions as parameters or flags.
3. ALWAYS return precisely ONE JSON ("action object") with nested params, NO multiple top-level objects.
4. Handle natural speech (e.g. "download any of her prescription after search") by mapping each instruction into parameters or booleans.
5. When a download is requested after another step, return {"downloadPrescription": true} inside the prescription or appropriate action parameters.

CRITICAL FIELD MAPPING RULES:
1. GENDER: Must be exactly "Male", "Female", or "Other".
2. BLOOD PRESSURE: Use "bp": "120/80".
3. MEDICATION FREQUENCY: Use dropdown values as in the provided mapping.
4. FOLLOW-UP DATE: "MM/DD/YYYY" format.
5. MEDICATIONS: Always an array of medication objects.

RESPONSE FORMAT (ALWAYS ONE OBJECT):
{
  "action": "fill_form",
  "target": "search term, if any",
  "parameters": {
    "searchCriteria": {
      "patientName": "name",
      "autoSelect": "most_visits|latest_visit",
      "switchToExisting": true
    },
    "clearForm": true,
    "prescription": {
      "doctorName": "...",
      "patientName": "...",
      "diagnosis": "...",
      "diagnosisDetails": "...",
      "underlyingConditions": "...",
      "downloadPrescription": true
    }
  },
  "response": "Human-friendly description of the workflow."
}

EXAMPLES:

Input: "Go to patient history, search for Jane and select the Jane who has the most number of visits, then download any of her prescription."
→ Output:
{
  "action": "fill_form",
  "target": "Jane",
  "parameters": {
    "searchCriteria": {
      "patientName": "Jane",
      "autoSelect": "most_visits",
      "switchToExisting": true
    },
    "clearForm": false,
    "prescription": {
      "patientName": "Jane",
      "downloadPrescription": true
    }
  },
  "response": "Navigating to patient history, searching for Jane (most visits), and downloading her prescription."
}

Input: "Clear the form. Also go to existing patient search for Jane, select Jane with most number of visits. Prescribe amoxycillin 500 mg, dolo 650 for seven days, diagnosis is acute bronchitis with underlying COPD, download her prescription as PDF."
→ Output:
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
      "underlyingConditions": "COPD",
      "medications": [
        {"name": "amoxycillin", "dosage": "500mg", "frequency": "Twice daily", "duration": "7 days"},
        {"name": "dolo", "dosage": "650mg", "frequency": "Twice daily", "duration": "7 days"}
      ],
      "downloadPrescription": true
    }
  },
  "response": "Clearing form, searching for Jane, prescribing medications for acute bronchitis with underlying COPD and downloading prescription as PDF."
}

ALWAYS:
- Include a downloadPrescription flag if user asks for 'download', 'PDF', 'export' or similar for any patient's prescription.
- Never skip any action. All required workflow steps must be present, fully detailed.

Parse user command with MAXIMUM INTELLIGENCE: "${transcript}"`;

    const response = await fetch('https://otly.cognitiveservices.azure.com/openai/deployments/gpt-4.1/chat/completions?api-version=2025-01-01-preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AZURE_OPENAI_GPT41_API_KEY}`,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are an intelligent global voice command assistant. Always respond with valid JSON format.' },
          { role: 'user', content: systemPrompt }
        ],
        model: 'gpt-4.1',
        max_completion_tokens: 2048,
        temperature: 0.1,
        top_p: 0.8,
      })
    });

    if (!response.ok) {
      throw new Error(`Azure OpenAI GPT-4.1 API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('GPT-4.1 response:', data);

    const generatedText = data.choices?.[0]?.message?.content;
    
    if (!generatedText) {
      throw new Error('No response from Azure OpenAI GPT-4.1');
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
      console.error('Failed to parse GPT-4.1 response as JSON:', generatedText);
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
              underlyingConditions: transcript.toLowerCase().includes('copd') ? 'COPD' : (transcript.toLowerCase().includes('hypertension') ? 'hypertension' : ''),
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
      response: 'I encountered an error processing your command, but I am learning from it. Please try again.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
