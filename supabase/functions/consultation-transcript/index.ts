
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { audioData, patientId, doctorId } = await req.json();

    if (!audioData) {
      throw new Error('No audio data provided');
    }

    if (!ELEVENLABS_API_KEY) {
      throw new Error('ElevenLabs API key not configured');
    }

    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    console.log('Processing consultation audio for patient:', patientId);
    console.log('Audio data length:', audioData.length);

    // Step 1: Convert audio to text using ElevenLabs
    let transcript = '';
    
    try {
      console.log('Starting audio transcription with ElevenLabs...');
      
      // Validate base64 audio data
      if (!audioData || typeof audioData !== 'string') {
        throw new Error('Invalid audio data format');
      }

      // Convert base64 to binary
      let audioBuffer;
      try {
        const binaryString = atob(audioData);
        audioBuffer = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          audioBuffer[i] = binaryString.charCodeAt(i);
        }
        console.log('Audio buffer created, size:', audioBuffer.length);
      } catch (decodeError) {
        console.error('Base64 decode error:', decodeError);
        throw new Error('Failed to decode audio data');
      }

      // Create form data for ElevenLabs speech-to-text
      const formData = new FormData();
      const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' });
      formData.append('file', audioBlob, 'consultation.webm');
      formData.append('model_id', 'scribe_v1');

      console.log('Sending request to ElevenLabs speech-to-text API...');

      const elevenLabsResponse = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: formData,
      });

      console.log('ElevenLabs API response status:', elevenLabsResponse.status);

      if (!elevenLabsResponse.ok) {
        const errorText = await elevenLabsResponse.text();
        console.error('ElevenLabs API error:', errorText);
        throw new Error(`ElevenLabs API error (${elevenLabsResponse.status}): ${errorText}`);
      }

      const elevenLabsResult = await elevenLabsResponse.json();
      transcript = elevenLabsResult.text || '';
      
      if (!transcript || transcript.trim().length === 0) {
        throw new Error('No transcription received from ElevenLabs API');
      }

      console.log('Transcription completed successfully. Length:', transcript.length);
      console.log('Transcript preview:', transcript.substring(0, 200) + '...');
    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error(`Failed to transcribe audio: ${error.message}`);
    }

    // Step 2: Process transcript with Gemini AI to extract medical information
    console.log('Starting AI analysis with Gemini...');

    const analysisPrompt = `You are an expert medical AI assistant analyzing a doctor-patient consultation transcript. Extract structured medical information and create comprehensive consultation notes.

CONSULTATION TRANSCRIPT:
"${transcript}"

EXTRACT AND STRUCTURE THE FOLLOWING INFORMATION:

1. PATIENT INFORMATION:
   - Name, age, gender if mentioned
   - Contact information if provided

2. CHIEF COMPLAINT & SYMPTOMS:
   - Primary reason for visit
   - All symptoms mentioned
   - Duration and severity

3. MEDICAL HISTORY:
   - Past medical conditions
   - Current medications
   - Allergies
   - Family history if mentioned

4. PHYSICAL EXAMINATION:
   - Vital signs (temperature, BP, heart rate, etc.)
   - Physical findings
   - Any tests performed

5. ASSESSMENT & DIAGNOSIS:
   - Working diagnosis
   - Differential diagnoses
   - Clinical impression

6. TREATMENT PLAN:
   - Medications prescribed with dosages
   - Non-pharmacological treatments
   - Lifestyle recommendations

7. FOLLOW-UP:
   - Next appointment schedule
   - Instructions for patient
   - When to return if symptoms worsen

8. ACTION ITEMS:
   - For doctor (lab orders, referrals, etc.)
   - For patient (lifestyle changes, medication compliance, etc.)

9. PRESCRIPTION DATA (if medications discussed):
   - Extract in format: {"name": "medication", "dosage": "amount", "frequency": "schedule", "duration": "period"}

RETURN RESPONSE AS JSON:
{
  "transcript": "full transcript text",
  "summary": "brief consultation summary",
  "patientInfo": {
    "name": "patient name",
    "age": number,
    "gender": "male/female",
    "contact": "phone/email"
  },
  "chiefComplaint": "primary reason for visit",
  "symptoms": ["symptom1", "symptom2"],
  "medicalHistory": {
    "conditions": ["condition1", "condition2"],
    "medications": ["med1", "med2"],
    "allergies": ["allergy1", "allergy2"]
  },
  "physicalExam": {
    "vitalSigns": {
      "temperature": number,
      "bloodPressure": "120/80",
      "heartRate": number
    },
    "findings": ["finding1", "finding2"]
  },
  "diagnosis": "primary diagnosis",
  "treatmentPlan": {
    "medications": [
      {"name": "med", "dosage": "amount", "frequency": "schedule", "duration": "period"}
    ],
    "instructions": ["instruction1", "instruction2"]
  },
  "followUp": {
    "nextAppointment": "date/timeframe",
    "instructions": ["instruction1", "instruction2"]
  },
  "actionItems": {
    "doctor": ["action1", "action2"],
    "patient": ["action1", "action2"]
  },
  "clinicalNotes": "comprehensive clinical notes combining all relevant information",
  "prescriptionData": {
    "patientName": "name",
    "age": number,
    "gender": "male/female",
    "temperature": number,
    "bp": "120/80",
    "diagnosis": "diagnosis",
    "medications": [{"name": "med", "dosage": "amount", "frequency": "schedule", "duration": "period"}],
    "notes": "clinical notes and observations",
    "followUpDate": "YYYY-MM-DD"
  }
}`;

    let analysisData;
    try {
      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: analysisPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 4096,
          }
        }),
      });

      console.log('Gemini API response status:', geminiResponse.status);

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        console.error('Gemini API error:', errorText);
        throw new Error(`Gemini API error (${geminiResponse.status}): ${errorText}`);
      }

      const geminiResult = await geminiResponse.json();
      const analysisText = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (!analysisText) {
        throw new Error('No analysis received from Gemini API');
      }

      console.log('Gemini analysis received, length:', analysisText.length);
      
      // Extract JSON from Gemini response
      try {
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No valid JSON found in analysis response');
        }
      } catch (parseError) {
        console.error('Failed to parse analysis JSON:', analysisText);
        throw new Error('Failed to parse consultation analysis');
      }

      console.log('Consultation analysis completed successfully');

    } catch (error) {
      console.error('Gemini analysis error:', error);
      throw new Error(`Failed to analyze consultation: ${error.message}`);
    }

    // Step 3: Store consultation data in Supabase
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        
        // Store consultation transcript and analysis
        const { data: consultationRecord, error: consultationError } = await supabase
          .from('consultation_transcripts')
          .insert({
            patient_id: patientId,
            doctor_id: doctorId,
            transcript: transcript,
            analysis_data: analysisData,
            summary: analysisData.summary,
            chief_complaint: analysisData.chiefComplaint,
            diagnosis: analysisData.diagnosis,
            action_items: analysisData.actionItems,
            follow_up_instructions: analysisData.followUp,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (consultationError) {
          console.error('Error storing consultation:', consultationError);
          // Don't throw here - we still want to return the analysis even if storage fails
        } else {
          console.log('Consultation stored successfully:', consultationRecord.id);
        }
      } catch (storageError) {
        console.error('Storage error:', storageError);
        // Continue execution - storage failure shouldn't block the response
      }
    }

    return new Response(JSON.stringify({
      success: true,
      data: analysisData,
      transcript: transcript
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Consultation transcript error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
