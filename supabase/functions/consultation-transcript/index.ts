
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { audio, doctor_id, patient_id, transcribeApiKey, gpt41ApiKey } = await req.json();
    
    if (!audio) {
      throw new Error('No audio data provided');
    }

    if (!transcribeApiKey || !gpt41ApiKey) {
      throw new Error('API keys are required');
    }

    console.log('🎵 Processing consultation audio...');

    // Step 1: Transcribe audio using GPT-4o-transcribe
    const audioBuffer = Uint8Array.from(atob(audio), c => c.charCodeAt(0));
    const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });

    const formData = new FormData();
    formData.append('file', audioBlob, 'consultation.wav');
    formData.append('model', 'gpt-4o-transcribe');

    console.log('🔊 Transcribing with GPT-4o-transcribe...');

    const transcriptionResponse = await fetch('https://otly.cognitiveservices.azure.com/openai/deployments/gpt-4o-transcribe/audio/transcriptions?api-version=2025-03-01-preview', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${transcribeApiKey}`,
      },
      body: formData,
    });

    if (!transcriptionResponse.ok) {
      const errorText = await transcriptionResponse.text();
      throw new Error(`Transcription failed: ${transcriptionResponse.status} - ${errorText}`);
    }

    const transcriptionResult = await transcriptionResponse.json();
    const transcript = transcriptionResult.text || '';

    console.log('📝 Transcript generated:', transcript.length, 'characters');

    if (!transcript.trim()) {
      throw new Error('No transcript generated from audio');
    }

    // Step 2: Analyze transcript using GPT-4.1
    console.log('🤖 Analyzing consultation with GPT-4.1...');

    const analysisPrompt = `You are an expert medical AI assistant. Analyze this doctor-patient consultation transcript and extract structured medical information.

CONSULTATION TRANSCRIPT:
"${transcript}"

Extract and return the following information in JSON format:
{
  "transcript": "full transcript text",
  "summary": "concise consultation summary",
  "diagnosis": "primary diagnosis if mentioned",
  "diagnosis_details": "detailed explanation of diagnosis",
  "underlying_conditions": "any underlying medical conditions mentioned",
  "chief_complaint": "patient's main complaint or reason for visit",
  "action_items": ["list of action items or next steps"],
  "follow_up_instructions": ["follow-up care instructions"],
  "analysis_data": {
    "patient_info": "extracted patient information",
    "vital_signs": "any vital signs mentioned",
    "medications": "medications discussed",
    "recommendations": "doctor's recommendations"
  }
}

Be thorough but concise. If information is not available, use empty strings or arrays.`;

    const analysisResponse = await fetch('https://otly.cognitiveservices.azure.com/openai/deployments/gpt-4.1/chat/completions?api-version=2025-01-01-preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${gpt41ApiKey}`,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are an expert medical AI assistant. Always respond with valid JSON format.' },
          { role: 'user', content: analysisPrompt }
        ],
        model: 'gpt-4.1',
        max_completion_tokens: 2048,
        temperature: 0.1,
        top_p: 0.8,
      }),
    });

    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text();
      throw new Error(`Analysis failed: ${analysisResponse.status} - ${errorText}`);
    }

    const analysisResult = await analysisResponse.json();
    const analysisText = analysisResult.choices?.[0]?.message?.content || '';

    console.log('🔍 Analysis completed:', analysisText.length, 'characters');

    // Parse the JSON response
    let parsedAnalysis;
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedAnalysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in analysis response');
      }
    } catch (parseError) {
      console.error('Failed to parse analysis JSON:', parseError);
      parsedAnalysis = {
        transcript: transcript,
        summary: 'Analysis parsing failed',
        diagnosis: '',
        diagnosis_details: '',
        underlying_conditions: '',
        chief_complaint: '',
        action_items: [],
        follow_up_instructions: [],
        analysis_data: {}
      };
    }

    // Step 3: Store in database if doctor_id is provided
    if (doctor_id) {
      console.log('💾 Storing consultation transcript in database...');
      
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { data, error } = await supabase
        .from('consultation_transcripts')
        .insert({
          doctor_id: doctor_id,
          patient_id: patient_id || null,
          transcript: parsedAnalysis.transcript,
          summary: parsedAnalysis.summary,
          diagnosis: parsedAnalysis.diagnosis,
          underlying_conditions: parsedAnalysis.underlying_conditions,
          chief_complaint: parsedAnalysis.chief_complaint,
          action_items: parsedAnalysis.action_items,
          follow_up_instructions: parsedAnalysis.follow_up_instructions,
          analysis_data: parsedAnalysis.analysis_data
        })
        .select()
        .single();

      if (error) {
        console.error('Database storage error:', error);
        // Continue without throwing - we still want to return the analysis
      } else {
        console.log('✅ Consultation stored successfully');
      }
    }

    return new Response(
      JSON.stringify(parsedAnalysis),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Consultation transcript error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        transcript: '',
        summary: 'Processing failed'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
