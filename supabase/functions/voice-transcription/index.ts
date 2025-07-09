
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AZURE_TRANSCRIPTION_ENDPOINT = "https://razam-mac1ml8q-eastus2.cognitiveservices.azure.com/openai/deployments/gpt-4o-mini-transcribe/audio/transcriptions?api-version=2025-03-01-preview";
const AZURE_CHAT_ENDPOINT = "https://razam-mac1ml8q-eastus2.cognitiveservices.azure.com/openai/deployments/gpt-4.1/chat/completions?api-version=2025-01-01-preview";
const AZURE_API_KEY = "FZ9RZqAVfAtln3qn1Y8CvVJck70dw2ijPZB51KFLbOg9EVWXyUtDJQQJ99BEACHYHv6XJ3w3AAAAACOGbxmN";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🎤 Voice transcription request received');
    
    const { audio } = await req.json();
    
    if (!audio) {
      throw new Error('No audio data provided');
    }

    console.log('🔄 Processing audio data...');
    
    // Convert base64 to binary
    const binaryString = atob(audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Create form data for transcription
    const formData = new FormData();
    const audioBlob = new Blob([bytes], { type: 'audio/webm' });
    formData.append('file', audioBlob, 'audio.webm');

    console.log('📝 Sending to Azure transcription API...');
    
    // Step 1: Transcribe audio using GPT-4o-mini-transcribe
    const transcriptionResponse = await fetch(AZURE_TRANSCRIPTION_ENDPOINT, {
      method: 'POST',
      headers: {
        'api-key': AZURE_API_KEY,
      },
      body: formData,
    });

    if (!transcriptionResponse.ok) {
      const errorText = await transcriptionResponse.text();
      console.error('❌ Transcription API error:', errorText);
      throw new Error(`Transcription failed: ${transcriptionResponse.status} - ${errorText}`);
    }

    const transcriptionResult = await transcriptionResponse.json();
    const transcribedText = transcriptionResult.text;
    
    console.log('✅ Transcription completed:', transcribedText.substring(0, 100) + '...');

    // Step 2: Analyze transcription with GPT-4.1 for intelligent extraction
    const analysisPrompt = `
    You are a medical AI assistant. Analyze the following consultation transcript and extract relevant information for a prescription form.

    Transcript: "${transcribedText}"

    Please provide a JSON response with the following structure:
    {
      "summary": "Brief consultation summary",
      "diagnosis": "Primary diagnosis if mentioned",
      "symptoms": "List of symptoms mentioned",
      "medications": [
        {
          "name": "medication name",
          "dosage": "dosage amount",
          "frequency": "frequency of intake",
          "duration": "duration of treatment"
        }
      ],
      "recommendedTests": ["test1", "test2"],
      "vitalSigns": {
        "temperature": "if mentioned",
        "bloodPressure": "if mentioned"
      },
      "followUpInstructions": "Any follow-up instructions"
    }

    Only include information that is explicitly mentioned in the transcript. If information is not available, use null or empty values.
    `;

    console.log('🤖 Sending to GPT-4.1 for analysis...');

    const analysisResponse = await fetch(AZURE_CHAT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': AZURE_API_KEY,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a medical AI assistant that extracts structured information from consultation transcripts.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3,
        model: 'gpt-4.1'
      }),
    });

    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text();
      console.error('❌ Analysis API error:', errorText);
      throw new Error(`Analysis failed: ${analysisResponse.status} - ${errorText}`);
    }

    const analysisResult = await analysisResponse.json();
    const analysisContent = analysisResult.choices[0].message.content;
    
    console.log('✅ Analysis completed');

    let extractedData;
    try {
      // Try to parse JSON from the response
      const jsonMatch = analysisContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('⚠️ Failed to parse analysis JSON, using raw text');
      extractedData = {
        summary: analysisContent,
        diagnosis: null,
        symptoms: null,
        medications: [],
        recommendedTests: [],
        vitalSigns: {},
        followUpInstructions: null
      };
    }

    const response = {
      transcription: transcribedText,
      analysis: extractedData,
      timestamp: new Date().toISOString()
    };

    console.log('🎉 Voice transcription and analysis completed successfully');

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Error in voice transcription function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
